import type { BodyEntry, Exercise, ID, MuscleGroup, PR, Session, Unit } from '@/data/types';
import { e1rm } from './e1rm';
import { DAY_MS, startOfWeek } from './dates';
import { clamp, finite, fmtPct, maxOf, pctChange, round, sum } from './num';
import { sessionDurationMs, sessionVolume, workingSets } from './sets';
import { fmtBodyweight, fmtVolume, fmtWeight } from './units';

/**
 * Plain-language observations, ranked by how much a person would actually
 * care. Every sentence is arithmetic on real logged data — no filler, no
 * encouragement, no exclamation marks.
 */

export type InsightsState = {
  sessions: Record<ID, Session>;
  exercises: Record<ID, Exercise>;
  prs?: PR[];
  body?: Record<ID, BodyEntry>;
  settings?: { unit: Unit; weeklyGoal?: number };
};

export type Insight = { text: string; score: number; kind: string };

type Window = { from: number; to: number };

const MONTH_DAYS = 28;
const PUSH: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
const PULL: MuscleGroup[] = ['back', 'lats', 'biceps', 'traps'];
const TRACKED: MuscleGroup[] = [
  'chest', 'back', 'lats', 'shoulders', 'quads', 'hamstrings', 'glutes', 'calves',
  'biceps', 'triceps', 'core',
];

function finishedSessions(state: InsightsState): Session[] {
  const raw = state?.sessions;
  if (!raw || typeof raw !== 'object') return [];
  return Object.values(raw)
    .filter((s): s is Session => !!s && finite(s.startedAt) > 0 && finite(s.endedAt, 0) > 0)
    .sort((a, b) => finite(a.startedAt) - finite(b.startedAt));
}

function inWindow(s: Session, w: Window): boolean {
  const ts = finite(s.startedAt);
  return ts >= w.from && ts < w.to;
}

function nameOf(exercises: Record<ID, Exercise>, id: ID): string {
  const n = exercises?.[id]?.name;
  return typeof n === 'string' && n.length > 0 ? n.toLowerCase() : '';
}

/** 'once more' · 'twice more' · '6 more times' — reads naturally in a sentence. */
function moreThan(n: number): string {
  const v = Math.abs(Math.round(n));
  if (v === 1) return 'once more';
  if (v === 2) return 'twice more';
  return `${v} more times`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Best estimated max per exercise across a set of sessions. */
function bestByExercise(sessions: readonly Session[]): Map<ID, number> {
  const out = new Map<ID, number>();
  for (const s of sessions) {
    if (!Array.isArray(s.exercises)) continue;
    for (const ex of s.exercises) {
      if (!ex || typeof ex.exerciseId !== 'string') continue;
      for (const set of workingSets(ex.sets)) {
        const est = e1rm(finite(set.weight), finite(set.reps));
        if (est > (out.get(ex.exerciseId) ?? 0)) out.set(ex.exerciseId, est);
      }
    }
  }
  return out;
}

/** Session count per exercise — used to ignore lifts with too little data. */
function timesTrained(sessions: readonly Session[]): Map<ID, number> {
  const out = new Map<ID, number>();
  for (const s of sessions) {
    if (!Array.isArray(s.exercises)) continue;
    const seen = new Set<ID>();
    for (const ex of s.exercises) {
      if (!ex || seen.has(ex.exerciseId)) continue;
      if (workingSets(ex.sets).length === 0) continue;
      seen.add(ex.exerciseId);
      out.set(ex.exerciseId, (out.get(ex.exerciseId) ?? 0) + 1);
    }
  }
  return out;
}

/** Volume credited to muscles: full to primary, half to secondary. */
export function volumeByMuscleFrom(
  sessions: readonly Session[],
  exercises: Record<ID, Exercise>,
): Record<MuscleGroup, number> {
  const out = {} as Record<MuscleGroup, number>;
  const add = (m: MuscleGroup, v: number) => {
    out[m] = round((out[m] ?? 0) + v, 2);
  };
  for (const s of sessions) {
    if (!Array.isArray(s.exercises)) continue;
    for (const ex of s.exercises) {
      if (!ex) continue;
      const meta = exercises?.[ex.exerciseId];
      if (!meta) continue;
      const volume = sum(workingSets(ex.sets).map((set) => finite(set.weight) * finite(set.reps)));
      if (volume <= 0) continue;
      for (const m of meta.primary ?? []) add(m, volume);
      for (const m of meta.secondary ?? []) add(m, volume * 0.5);
    }
  }
  return out;
}

function groupTotal(map: Record<MuscleGroup, number>, groups: readonly MuscleGroup[]): number {
  return sum(groups.map((g) => Math.max(0, finite(map[g]))));
}

/** Ranked insight objects — `buildInsights` returns just the sentences. */
export function buildInsightList(state: InsightsState, opts?: { now?: number; limit?: number }): Insight[] {
  const now = finite(opts?.now, Date.now());
  const limit = clamp(finite(opts?.limit, 6), 1, 20);
  const unit: Unit = state?.settings?.unit === 'lb' ? 'lb' : 'kg';
  const exercises = state?.exercises ?? {};
  const all = finishedSessions(state);
  const out: Insight[] = [];

  if (all.length === 0) return out;

  const thisMonth: Window = { from: now - MONTH_DAYS * DAY_MS, to: now + DAY_MS };
  const lastMonth: Window = { from: now - 2 * MONTH_DAYS * DAY_MS, to: now - MONTH_DAYS * DAY_MS };
  const current = all.filter((s) => inWindow(s, thisMonth));
  const previous = all.filter((s) => inWindow(s, lastMonth));

  /* 1. Strength change on the lifts with enough data to mean something. */
  const bestNow = bestByExercise(current);
  const bestBefore = bestByExercise(previous);
  const freqNow = timesTrained(current);
  const gains: { id: ID; pct: number }[] = [];
  bestNow.forEach((value, id) => {
    const before = bestBefore.get(id) ?? 0;
    if (before <= 0 || value <= 0) return;
    if ((freqNow.get(id) ?? 0) < 2) return;
    // A bodyweight lift stores ADDED load only, so 3 kg -> 13 kg reads as +333%.
    // A percentage of added load is not a percentage of the load actually moved,
    // so these lifts are excluded from percentage claims rather than overstated.
    if (exercises[id]?.equipment === 'bodyweight') return;
    const change = pctChange(before, value);
    if (Math.abs(change) < 2) return;
    gains.push({ id, pct: change });
  });
  gains.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  const best = gains.find((g) => g.pct > 0);
  if (best) {
    const name = nameOf(exercises, best.id);
    if (name) {
      out.push({
        kind: 'strength-up',
        score: 96 + clamp(best.pct, 0, 3),
        text: `Your ${name} is up ${fmtPct(best.pct)}% this month.`,
      });
    }
  }
  const worst = gains.find((g) => g.pct < 0 && Math.abs(g.pct) >= 5);
  if (worst) {
    const name = nameOf(exercises, worst.id);
    if (name) {
      out.push({
        kind: 'strength-down',
        score: 84,
        text: `Your ${name} is down ${fmtPct(worst.pct)}% on last month.`,
      });
    }
  }

  /* 2. Training frequency, month on month. */
  if (previous.length > 0) {
    const diff = current.length - previous.length;
    if (diff > 0) {
      out.push({
        kind: 'frequency',
        score: 88,
        text: `You trained ${moreThan(diff)} than last month.`,
      });
    } else if (diff < 0) {
      out.push({
        kind: 'frequency',
        score: 86,
        text: `You trained ${plural(Math.abs(diff), 'session')} fewer than last month.`,
      });
    }
  }

  /* 3. Push / pull balance across the month. */
  const byMuscle = volumeByMuscleFrom(current, exercises);
  const push = groupTotal(byMuscle, PUSH);
  const pull = groupTotal(byMuscle, PULL);
  if (push > 0 && pull > 0) {
    const gap = Math.abs(pctChange(Math.max(push, pull), Math.min(push, pull)));
    if (gap >= 20) {
      const lighter = pull < push ? 'pulling' : 'pushing';
      const heavier = lighter === 'pulling' ? 'pushing' : 'pulling';
      out.push({
        kind: 'balance',
        score: 92,
        text: `Your ${lighter} volume is ${fmtPct(gap)}% below your ${heavier} volume.`,
      });
    }
  }

  /* 4. A muscle group that has quietly dropped off. */
  const lastTrained = new Map<MuscleGroup, number>();
  for (const s of all) {
    if (!Array.isArray(s.exercises)) continue;
    for (const ex of s.exercises) {
      const meta = exercises?.[ex?.exerciseId ?? ''];
      if (!meta || workingSets(ex?.sets).length === 0) continue;
      for (const m of meta.primary ?? []) {
        const ts = finite(s.startedAt);
        if (ts > (lastTrained.get(m) ?? 0)) lastTrained.set(m, ts);
      }
    }
  }
  let neglected: { group: MuscleGroup; days: number } | null = null;
  for (const g of TRACKED) {
    const ts = lastTrained.get(g);
    if (!ts) continue;
    const days = Math.floor((now - ts) / DAY_MS);
    if (days >= 14 && (!neglected || days > neglected.days)) neglected = { group: g, days };
  }
  if (neglected) {
    const weeks = Math.max(2, Math.round(neglected.days / 7));
    out.push({
      kind: 'neglected',
      score: 90,
      text: `You have not trained ${neglected.group} in ${plural(weeks, 'week')}.`,
    });
  }

  /* 5. Weekly volume trend. */
  const weekStart = startOfWeek(now);
  const thisWeek = all.filter((s) => finite(s.startedAt) >= weekStart);
  const priorWeek = all.filter(
    (s) => finite(s.startedAt) >= weekStart - 7 * DAY_MS && finite(s.startedAt) < weekStart,
  );
  const vNow = sum(thisWeek.map(sessionVolume));
  const vBefore = sum(priorWeek.map(sessionVolume));
  if (vBefore > 0 && vNow > 0) {
    const change = pctChange(vBefore, vNow);
    if (Math.abs(change) >= 8) {
      out.push({
        kind: 'volume-trend',
        score: 80,
        text: `Your weekly volume is ${change > 0 ? 'up' : 'down'} ${fmtPct(change)}% on last week.`,
      });
    }
  }
  if (vNow > 0) {
    out.push({
      kind: 'volume-total',
      score: 46,
      text: `You have moved ${fmtVolume(vNow, unit)} so far this week.`,
    });
  }

  /* 6. Records set recently. */
  const prs = Array.isArray(state?.prs) ? state.prs : [];
  const recentPRs = prs.filter((p) => p && finite(p.ts) >= now - 30 * DAY_MS);
  if (recentPRs.length > 0) {
    out.push({
      kind: 'prs',
      score: 82,
      text: `You set ${plural(recentPRs.length, 'record')} in the last 30 days.`,
    });
  }

  /* 7. Weekly goal. */
  const goal = clamp(finite(state?.settings?.weeklyGoal, 0), 0, 14);
  if (goal > 0) {
    const done = thisWeek.length;
    if (done >= goal) {
      out.push({
        kind: 'goal',
        score: 94,
        text: `You have met your weekly goal of ${plural(goal, 'session')}.`,
      });
    } else {
      const left = goal - done;
      out.push({
        kind: 'goal',
        score: 91,
        text: `${plural(left, 'session')} left to reach your weekly goal of ${goal}.`,
      });
    }
  }

  /* 8. Bodyweight movement. */
  const bodyEntries = Object.values(state?.body ?? {})
    .filter((b): b is BodyEntry => !!b && finite(b.weightKg, 0) > 0)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (bodyEntries.length >= 2) {
    const first = bodyEntries[0];
    const last = bodyEntries[bodyEntries.length - 1];
    const delta = round(finite(last.weightKg) - finite(first.weightKg), 2);
    if (Math.abs(delta) >= 0.5) {
      const spanDays = Math.max(1, Math.round((Date.parse(`${last.date}T00:00:00`) - Date.parse(`${first.date}T00:00:00`)) / DAY_MS));
      const weeks = Math.max(1, Math.round(spanDays / 7));
      out.push({
        kind: 'bodyweight',
        score: 74,
        text: `Your bodyweight is ${delta > 0 ? 'up' : 'down'} ${fmtBodyweight(Math.abs(delta), unit)} over ${plural(weeks, 'week')}.`,
      });
    }
  }

  /* 9. Typical session length. */
  const durations = current.map(sessionDurationMs).filter((d) => d > 60_000);
  if (durations.length >= 3) {
    const avg = Math.round(sum(durations) / durations.length / 60_000);
    if (avg > 0) {
      out.push({
        kind: 'duration',
        score: 44,
        text: `Your sessions average ${plural(avg, 'minute')}.`,
      });
    }
  }

  /* 10. Heaviest single set of the month — a quiet, factual highlight. */
  const heaviest = maxOf(
    current.flatMap((s) =>
      (s.exercises ?? []).flatMap((ex) => workingSets(ex?.sets).map((set) => finite(set.weight))),
    ),
    0,
  );
  if (heaviest > 0 && current.length >= 2) {
    out.push({
      kind: 'heaviest',
      score: 40,
      text: `Your heaviest set this month was ${fmtWeight(heaviest, unit)}.`,
    });
  }

  const seen = new Set<string>();
  return out
    .filter((i) => {
      if (!i.text || seen.has(i.kind)) return false;
      seen.add(i.kind);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Ranked sentences, most useful first. */
export function buildInsights(state: InsightsState, opts?: { now?: number; limit?: number }): string[] {
  return buildInsightList(state, opts).map((i) => i.text);
}

/** A single line for the session summary screen. */
export function sessionInsight(
  session: Session,
  history: readonly Session[],
  unit: Unit = 'kg',
): string {
  if (!session) return '';
  const volume = sessionVolume(session);
  const past = (history ?? []).filter(
    (s) => s && s.id !== session.id && finite(s.endedAt, 0) > 0 && finite(s.startedAt) < finite(session.startedAt),
  );
  if (volume <= 0) return 'Session logged.';
  if (past.length === 0) return `You moved ${fmtVolume(volume, unit)} in your first logged session.`;

  const recent = past.slice(-5).map(sessionVolume).filter((v) => v > 0);
  const average = recent.length > 0 ? sum(recent) / recent.length : 0;
  if (average <= 0) return `You moved ${fmtVolume(volume, unit)} today.`;

  const change = pctChange(average, volume);
  if (Math.abs(change) < 5) return `You moved ${fmtVolume(volume, unit)}, in line with your recent sessions.`;
  return `You moved ${fmtVolume(volume, unit)}, ${fmtPct(change)}% ${change > 0 ? 'above' : 'below'} your recent average.`;
}
