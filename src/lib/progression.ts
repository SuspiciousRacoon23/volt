import type { ID, LoggedSet, MuscleGroup, Readiness, Session } from '@/data/types';
import { clamp, finite, fmtPct, maxOf, minOf, pctChange, round, sum } from './num';
import { DEFAULT_BAR_KG, DEFAULT_PLATES_KG, nearestAchievable, nextLoadUp, smallestIncrement } from './plates';
import { readinessVerdict } from './readiness';
import { workingSets } from './sets';

/**
 * Progression advice.
 *
 * Double progression: work up the rep range at a fixed load, and when every
 * working set reaches the top of the range at or under the target effort, the
 * load goes up by one increment. Miss twice and we hold. Miss three sessions
 * running and we name it a plateau and offer a way out.
 *
 * Every suggestion is an OBSERVATION plus an ACTION. Nothing is ever applied
 * automatically, and nothing here is phrased as medical advice.
 */

export type Suggestion = {
  /** '' for suggestions that are about the whole week rather than one lift. */
  exerciseId: ID;
  observed: string;
  action: string;
  weight: number | null;
  reps: number | null;
  kind: 'increase' | 'hold' | 'deload' | 'plateau' | 'volume-warning' | 'neglected';
};

/** One performance of one exercise, normalised out of whatever the caller has. */
export type ExercisePerf = { ts: number; sets: LoggedSet[] };

/** The shape `selectors.exerciseHistory` returns. */
type TopSetPoint = { ts: number; topSet: LoggedSet; e1rm: number; volume: number };

/** suggestNext accepts sessions, normalised performances, or top-set points. */
export type HistoryInput = readonly (Session | ExercisePerf | TopSetPoint)[];

export type ProgressionOptions = {
  /** [low, high]. Inferred from history when omitted. */
  repRange?: [number, number];
  /** The RPE at or below which a set counts as "clean". Default 8.5. */
  targetRPE?: number;
  barKg?: number;
  plates?: number[];
  /** How many recent performances to consider. Default 6. */
  lookback?: number;
  /** Weight formatter for the copy, so a pound user never reads kilograms. */
  fmt?: (kg: number) => string;
};

const DEFAULT_RANGE: [number, number] = [8, 12];
const DEFAULT_TARGET_RPE = 8.5;
const WEIGHT_EPS = 0.01;

function isSession(x: unknown): x is Session {
  return !!x && typeof x === 'object' && Array.isArray((x as Session).exercises);
}
function isTopSetPoint(x: unknown): x is TopSetPoint {
  return !!x && typeof x === 'object' && 'topSet' in (x as Record<string, unknown>);
}

/** Collapse any accepted history shape into ascending per-session performances. */
export function normalizeHistory(history: HistoryInput | undefined, exerciseId: ID): ExercisePerf[] {
  if (!Array.isArray(history)) return [];
  const out: ExercisePerf[] = [];

  for (const entry of history) {
    if (!entry) continue;
    if (isSession(entry)) {
      const sets: LoggedSet[] = [];
      for (const ex of entry.exercises) {
        if (!ex || ex.exerciseId !== exerciseId) continue;
        sets.push(...workingSets(ex.sets));
      }
      if (sets.length > 0) out.push({ ts: finite(entry.startedAt), sets });
      continue;
    }
    if (isTopSetPoint(entry)) {
      const set = entry.topSet;
      if (set) out.push({ ts: finite(entry.ts), sets: [set] });
      continue;
    }
    const perf = entry as ExercisePerf;
    const sets = workingSets(perf.sets);
    if (sets.length > 0) out.push({ ts: finite(perf.ts), sets });
  }

  out.sort((a, b) => a.ts - b.ts);
  return out;
}

function topWeight(perf: ExercisePerf): number {
  return maxOf(perf.sets.map((s) => finite(s.weight)), 0);
}

/** Sets performed at (or within a hair of) the session's heaviest load. */
function setsAtTopWeight(perf: ExercisePerf): LoggedSet[] {
  const w = topWeight(perf);
  return perf.sets.filter((s) => Math.abs(finite(s.weight) - w) <= WEIGHT_EPS);
}

function inferRange(perfs: readonly ExercisePerf[], given?: [number, number]): [number, number] {
  if (given && Number.isFinite(given[0]) && Number.isFinite(given[1])) {
    const low = clamp(Math.round(given[0]), 1, 50);
    const high = clamp(Math.round(given[1]), low, 50);
    return [low, high];
  }
  const recent = perfs.slice(-3);
  const reps: number[] = [];
  for (const p of recent) for (const s of setsAtTopWeight(p)) reps.push(clamp(finite(s.reps), 1, 50));
  if (reps.length === 0) return DEFAULT_RANGE;
  const low = Math.round(minOf(reps, DEFAULT_RANGE[0]));
  const high = Math.round(maxOf(reps, DEFAULT_RANGE[1]));
  if (high <= low) return [low, low + 2];
  return [low, high];
}

/** True when every set at the top load reached the top of the range at target effort. */
function cleanSweep(perf: ExercisePerf, high: number, targetRPE: number): boolean {
  const sets = setsAtTopWeight(perf);
  if (sets.length === 0) return false;
  return sets.every((s) => {
    const reps = finite(s.reps);
    const rpe = s.rpe === null || s.rpe === undefined ? null : finite(s.rpe);
    return reps >= high && (rpe === null || rpe <= targetRPE + 0.01);
  });
}

/**
 * The next move for one exercise, or null when there is nothing worth saying.
 * `history` may be the full session list — it is filtered to this exercise.
 */
export function suggestNext(
  exerciseId: ID,
  history: HistoryInput,
  readiness: Readiness | null,
  opts?: ProgressionOptions,
): Suggestion | null {
  const perfs = normalizeHistory(history, exerciseId);
  if (perfs.length === 0) return null;

  const lookback = clamp(finite(opts?.lookback, 6), 2, 20);
  const recent = perfs.slice(-lookback);
  const last = recent[recent.length - 1];
  const [low, high] = inferRange(recent, opts?.repRange);
  const targetRPE = clamp(finite(opts?.targetRPE, DEFAULT_TARGET_RPE), 5, 10);
  const bar = Math.max(0, finite(opts?.barKg, DEFAULT_BAR_KG));
  const plates = Array.isArray(opts?.plates) && opts!.plates!.length > 0 ? opts!.plates! : DEFAULT_PLATES_KG;
  const fmt = typeof opts?.fmt === 'function' ? opts.fmt : (kg: number) => `${round(kg, 2)} kg`;

  const load = topWeight(last);
  const lastSets = setsAtTopWeight(last);
  const lastReps = lastSets.map((s) => clamp(finite(s.reps), 0, 100));
  const bestReps = Math.round(maxOf(lastReps, 0));
  const worstReps = Math.round(minOf(lastReps, 0));
  const recoverToday = readiness ? readinessVerdict(readiness) === 'Recover' : false;

  // How many sessions in a row, at this same load, failed to top out the range.
  let misses = 0;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const perf = recent[i];
    if (Math.abs(topWeight(perf) - load) > WEIGHT_EPS) break;
    if (cleanSweep(perf, high, targetRPE)) break;
    misses += 1;
  }

  // Earned the increase.
  if (cleanSweep(last, high, targetRPE)) {
    const step = smallestIncrement(plates);
    const target = load > 0 ? nextLoadUp(load, bar, plates) : nearestAchievable(step, bar, plates);
    const observed = `You completed ${lastSets.length} ${lastSets.length === 1 ? 'set' : 'sets'} of ${bestReps} at ${fmt(load)}, the top of your ${low}–${high} range.`;

    if (recoverToday) {
      return {
        exerciseId,
        kind: 'hold',
        observed: `${observed} Your check-in this morning came back low.`,
        action: `Repeating ${fmt(load)} today is a reasonable choice. The increase will keep.`,
        weight: round(load, 2),
        reps: high,
      };
    }
    return {
      exerciseId,
      kind: 'increase',
      observed,
      action: `Try ${fmt(target)} for ${low} reps and work back up the range.`,
      weight: round(target, 2),
      reps: low,
    };
  }

  // Three sessions stuck at the same load.
  if (misses >= 3) {
    const deload = nearestAchievable(load * 0.9, bar, plates);
    return {
      exerciseId,
      kind: 'plateau',
      observed: `You have held ${fmt(load)} for ${misses} sessions without reaching ${high} reps.`,
      action: `Consider dropping to ${fmt(deload)} for two weeks and building back, or swapping in a close variation for a block.`,
      weight: round(deload, 2),
      reps: high,
    };
  }

  // Two misses: stay put, no drama.
  if (misses === 2) {
    return {
      exerciseId,
      kind: 'hold',
      observed: `Two sessions at ${fmt(load)}, topping out at ${bestReps} of ${high} reps.`,
      action: `Stay at ${fmt(load)} and aim for one more rep on your weakest set (${worstReps} last time).`,
      weight: round(load, 2),
      reps: clamp(worstReps + 1, 1, high),
    };
  }

  // One short session with a low check-in is worth naming.
  if (recoverToday) {
    return {
      exerciseId,
      kind: 'deload',
      observed: `Your check-in scored low and your last session was ${fmt(load)} for ${bestReps} reps.`,
      action: `A lighter day at around ${fmt(nearestAchievable(load * 0.85, bar, plates))} is a reasonable option.`,
      weight: round(nearestAchievable(load * 0.85, bar, plates), 2),
      reps: low,
    };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Weekly volume audit                                                 */
/* ------------------------------------------------------------------ */

const PUSH_GROUPS: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
const PULL_GROUPS: MuscleGroup[] = ['back', 'lats', 'biceps', 'traps'];
const MAJOR_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'lats', 'shoulders', 'quads', 'hamstrings', 'glutes', 'calves',
  'biceps', 'triceps', 'core',
];

const GROUP_LABEL: Partial<Record<MuscleGroup, string>> = {
  chest: 'chest', back: 'back', lats: 'lats', shoulders: 'shoulders', quads: 'quads',
  hamstrings: 'hamstrings', glutes: 'glutes', calves: 'calves', biceps: 'biceps',
  triceps: 'triceps', forearms: 'forearms', core: 'core', traps: 'traps',
  adductors: 'adductors', neck: 'neck',
};

function totalFor(map: Record<MuscleGroup, number> | undefined, groups: readonly MuscleGroup[]): number {
  if (!map) return 0;
  return sum(groups.map((g) => Math.max(0, finite(map[g]))));
}

function label(list: readonly MuscleGroup[]): string {
  const names = list.map((g) => GROUP_LABEL[g] ?? g);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Week-level observations: what you skipped, what is lopsided, and whether the
 * jump from last week is bigger than it looks.
 */
export function auditVolume(
  volumeByMuscle: Record<MuscleGroup, number>,
  prevWeek: Record<MuscleGroup, number>,
): Suggestion[] {
  const out: Suggestion[] = [];
  const current = volumeByMuscle ?? ({} as Record<MuscleGroup, number>);
  const previous = prevWeek ?? ({} as Record<MuscleGroup, number>);

  const ALL: MuscleGroup[] = MAJOR_GROUPS.concat(['forearms', 'adductors', 'neck']);
  const thisTotal = totalFor(current, ALL);
  const lastTotal = totalFor(previous, ALL);

  // 1. Neglected groups — trained before, absent now.
  const neglected = MAJOR_GROUPS.filter((g) => {
    const now = Math.max(0, finite(current[g]));
    const before = Math.max(0, finite(previous[g]));
    return now <= 0 && before > 0;
  });
  if (neglected.length > 0 && thisTotal > 0) {
    out.push({
      exerciseId: '',
      kind: 'neglected',
      observed: `You trained ${label(neglected)} last week but not this week.`,
      action: `Adding one ${neglected.length > 1 ? 'movement for each' : 'movement'} back into your next session would even the week out.`,
      weight: null,
      reps: null,
    });
  }

  // 2. Push / pull balance.
  const push = totalFor(current, PUSH_GROUPS);
  const pull = totalFor(current, PULL_GROUPS);
  if (push > 0 && pull > 0) {
    const lighter = pull < push ? 'pulling' : 'pushing';
    const heavier = lighter === 'pulling' ? 'pushing' : 'pulling';
    const low = Math.min(push, pull);
    const high = Math.max(push, pull);
    const gap = Math.abs(pctChange(high, low));
    if (gap >= 25) {
      out.push({
        exerciseId: '',
        kind: 'volume-warning',
        observed: `Your ${lighter} volume is ${fmtPct(gap)}% below your ${heavier} volume this week.`,
        action: `An extra ${lighter === 'pulling' ? 'row or pulldown' : 'press'} would bring the two closer together.`,
        weight: null,
        reps: null,
      });
    }
  }

  // 3. Week-over-week jump.
  if (lastTotal > 0 && thisTotal > 0) {
    const change = pctChange(lastTotal, thisTotal);
    if (change >= 20) {
      out.push({
        exerciseId: '',
        kind: 'volume-warning',
        observed: `Your total volume is up ${fmtPct(change)}% on last week.`,
        action: 'Holding this week rather than adding more is the usual way to keep a jump like that.',
        weight: null,
        reps: null,
      });
    } else if (change <= -35) {
      out.push({
        exerciseId: '',
        kind: 'volume-warning',
        observed: `Your total volume is down ${fmtPct(change)}% on last week.`,
        action: 'If that was not a planned deload, one more session would bring the week back in line.',
        weight: null,
        reps: null,
      });
    }
  }

  const order: Suggestion['kind'][] = ['plateau', 'neglected', 'volume-warning', 'deload', 'hold', 'increase'];
  return out.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}
