import type { AppState, BodyEntry, ID, LoggedSet, MuscleGroup, Session } from '@/data';
import { setsByMuscle } from '@/data';
import {
  buildInsightList,
  DAY_MS,
  e1rm,
  finite,
  sessionDurationMs,
  sessionVolume,
  setsForExercise,
  startOfDay,
  startOfWeek,
  workingSets,
} from '@/lib';

/**
 * Derivations used by the Progress screen only. Everything here is a pure
 * read over AppState — nothing is stored, nothing is mutated.
 */

export type StrengthPoint = { ts: number; e1rm: number; volume: number; top: LoggedSet; record: boolean };

export function finishedSessions(state: AppState): Session[] {
  return Object.values(state.sessions)
    .filter((s) => finite(s.endedAt, 0) > 0)
    .sort((a, b) => a.startedAt - b.startedAt);
}

/** Exercise ids ordered by how often they have actually been trained. */
export function trainedRanking(state: AppState): { id: ID; count: number }[] {
  const counts = new Map<ID, number>();
  for (const s of finishedSessions(state)) {
    const seen = new Set<ID>();
    for (const ex of s.exercises) {
      if (seen.has(ex.exerciseId)) continue;
      if (workingSets(ex.sets).length === 0) continue;
      seen.add(ex.exerciseId);
      counts.set(ex.exerciseId, (counts.get(ex.exerciseId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .filter((r) => !!state.exercises[r.id])
    .sort((a, b) => b.count - a.count || (state.exercises[a.id].name < state.exercises[b.id].name ? -1 : 1));
}

/** One point per session for a lift, oldest first, with running records flagged. */
export function strengthSeries(state: AppState, exerciseId: ID): StrengthPoint[] {
  const out: StrengthPoint[] = [];
  for (const s of finishedSessions(state)) {
    const sets = setsForExercise(s, exerciseId);
    if (sets.length === 0) continue;
    let top = sets[0];
    let best = e1rm(top.weight, top.reps);
    let volume = 0;
    for (const st of sets) {
      const v = e1rm(st.weight, st.reps);
      if (v > best) { best = v; top = st; }
      volume += st.weight * st.reps;
    }
    out.push({ ts: s.startedAt, e1rm: best, volume: Math.round(volume), top, record: false });
  }
  let running = 0;
  for (const p of out) {
    if (p.e1rm > running) { p.record = running > 0; running = p.e1rm; }
  }
  return out;
}

export function allSetsFor(state: AppState, exerciseId: ID): LoggedSet[] {
  const out: LoggedSet[] = [];
  for (const s of finishedSessions(state)) out.push(...setsForExercise(s, exerciseId));
  return out;
}

export const REP_TARGETS = [1, 2, 3, 5, 8, 10, 12] as const;

/**
 * Best load actually lifted for at least n reps, beside the load the current
 * estimated max predicts. Honest: `best` is null when it has never been done.
 */
export function repMaxRows(
  sets: readonly LoggedSet[],
  currentE1rm: number,
): { reps: number; best: number | null; est: number }[] {
  return REP_TARGETS.map((reps) => {
    let best: number | null = null;
    for (const s of sets) {
      if (s.reps < reps) continue;
      if (best === null || s.weight > best) best = s.weight;
    }
    const est = currentE1rm > 0 ? Math.round((currentE1rm / (1 + reps / 30)) * 2) / 2 : 0;
    return { reps, best, est };
  });
}

// ---------------------------------------------------------------- volume

export type WeekBar = { start: number; label: string; value: number; previous: number };

/** The last `weeks` Monday weeks, each carrying the same slot from the block before. */
export function weeklyVolume(state: AppState, weeks: number): WeekBar[] {
  const sessions = finishedSessions(state);
  const thisWeek = startOfWeek(Date.now());
  const totals = new Map<number, number>();
  for (const s of sessions) {
    const k = startOfWeek(s.startedAt);
    totals.set(k, (totals.get(k) ?? 0) + sessionVolume(s));
  }
  const out: WeekBar[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = thisWeek - i * 7 * DAY_MS;
    const prev = start - weeks * 7 * DAY_MS;
    const d = new Date(start);
    out.push({
      start,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      value: Math.round(totals.get(start) ?? 0),
      previous: Math.round(totals.get(prev) ?? 0),
    });
  }
  return out;
}

export type MuscleRow = { group: MuscleGroup; sets: number };

export function rankedMuscleSets(state: AppState, days: number): MuscleRow[] {
  const since = startOfDay(Date.now()) - (days - 1) * DAY_MS;
  const map = setsByMuscle(state, since);
  return (Object.keys(map) as MuscleGroup[])
    .map((group) => ({ group, sets: Math.round(map[group] * 10) / 10 }))
    .filter((r) => r.sets > 0)
    .sort((a, b) => b.sets - a.sets);
}

export function heatFrom(rows: readonly MuscleRow[]): Partial<Record<MuscleGroup, number>> {
  const top = rows[0]?.sets ?? 0;
  if (top <= 0) return {};
  const out: Partial<Record<MuscleGroup, number>> = {};
  for (const r of rows) out[r.group] = Math.min(1, r.sets / top);
  return out;
}

export function averageDurationMs(state: AppState, days: number): number {
  const since = startOfDay(Date.now()) - (days - 1) * DAY_MS;
  const ds = finishedSessions(state)
    .filter((s) => s.startedAt >= since)
    .map(sessionDurationMs)
    .filter((d) => d > 60_000);
  if (ds.length === 0) return 0;
  return ds.reduce((a, b) => a + b, 0) / ds.length;
}

// ---------------------------------------------------------------- body

export function bodyEntries(state: AppState): BodyEntry[] {
  return Object.values(state.body).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export const MEASUREMENT_KEYS = [
  'chest', 'shoulders', 'waist', 'hips', 'thigh', 'arm', 'calf', 'neck',
] as const;
export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  waist: 'Waist',
  hips: 'Hips',
  thigh: 'Thigh',
  arm: 'Arm',
  calf: 'Calf',
  neck: 'Neck',
};

export type MeasurementRow = { key: MeasurementKey; latest: number; delta: number | null; when: string };

/** Latest value per measurement, against the previous entry that recorded it. */
export function measurementRows(entries: readonly BodyEntry[]): MeasurementRow[] {
  const out: MeasurementRow[] = [];
  for (const key of MEASUREMENT_KEYS) {
    const withKey = entries.filter((e) => typeof e.measurements?.[key] === 'number');
    if (withKey.length === 0) continue;
    const last = withKey[withKey.length - 1];
    const prev = withKey.length > 1 ? withKey[withKey.length - 2] : null;
    const latest = Number(last.measurements?.[key]);
    const before = prev ? Number(prev.measurements?.[key]) : null;
    out.push({
      key,
      latest,
      delta: before === null ? null : Math.round((latest - before) * 10) / 10,
      when: last.date,
    });
  }
  return out;
}

// ---------------------------------------------------------------- headlines

/**
 * The sentence at the top of a panel. Prefers the ranked insight kinds that
 * belong to that panel, and falls back to a plain computed statement rather
 * than inventing something.
 */
export function pickHeadline(state: AppState, prefer: readonly string[], fallback: string): string {
  const list = buildInsightList(state, { limit: 20 });
  for (const kind of prefer) {
    const hit = list.find((i) => i.kind === kind);
    if (hit) return hit.text;
  }
  return fallback;
}
