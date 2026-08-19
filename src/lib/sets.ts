import type { ID, LoggedExercise, LoggedSet, Session, SetKind } from '@/data/types';
import { finite, round } from './num';

/**
 * Shared predicates over logged sets. Warm-ups are excluded from every
 * measurement in this app — they are preparation, not performance.
 */

export const WORKING_KINDS: SetKind[] = ['working', 'drop', 'failure'];

export function isWorkingSet(s: LoggedSet | undefined | null): boolean {
  if (!s) return false;
  if (s.kind === 'warmup') return false;
  if (!s.done) return false;
  return finite(s.reps) >= 1 && finite(s.weight) >= 0;
}

/** Completed, non-warm-up sets only. */
export function workingSets(sets: readonly LoggedSet[] | undefined): LoggedSet[] {
  if (!Array.isArray(sets)) return [];
  return sets.filter(isWorkingSet);
}

export function setVolume(s: LoggedSet | undefined | null): number {
  if (!isWorkingSet(s) || !s) return 0;
  return round(Math.max(0, finite(s.weight)) * Math.max(0, finite(s.reps)), 2);
}

export function exerciseVolume(ex: LoggedExercise | undefined | null): number {
  if (!ex || !Array.isArray(ex.sets)) return 0;
  return round(ex.sets.reduce((t, s) => t + setVolume(s), 0), 2);
}

export function sessionVolume(session: Session | undefined | null): number {
  if (!session || !Array.isArray(session.exercises)) return 0;
  return round(session.exercises.reduce((t, e) => t + exerciseVolume(e), 0), 2);
}

export function sessionWorkingSetCount(session: Session | undefined | null): number {
  if (!session || !Array.isArray(session.exercises)) return 0;
  let n = 0;
  for (const ex of session.exercises) n += workingSets(ex?.sets).length;
  return n;
}

export function sessionReps(session: Session | undefined | null): number {
  if (!session || !Array.isArray(session.exercises)) return 0;
  let n = 0;
  for (const ex of session.exercises) {
    for (const s of workingSets(ex?.sets)) n += Math.max(0, finite(s.reps));
  }
  return n;
}

/** Heaviest completed working set, ties broken by reps. */
export function topSet(sets: readonly LoggedSet[] | undefined): LoggedSet | null {
  const working = workingSets(sets);
  if (working.length === 0) return null;
  let best = working[0];
  for (const s of working) {
    const bw = finite(best.weight);
    const sw = finite(s.weight);
    if (sw > bw || (sw === bw && finite(s.reps) > finite(best.reps))) best = s;
  }
  return best;
}

/** Every completed working set for one exercise inside one session. */
export function setsForExercise(session: Session | undefined | null, exerciseId: ID): LoggedSet[] {
  if (!session || !Array.isArray(session.exercises)) return [];
  const out: LoggedSet[] = [];
  for (const ex of session.exercises) {
    if (!ex || ex.exerciseId !== exerciseId) continue;
    out.push(...workingSets(ex.sets));
  }
  return out;
}

/** Session length in milliseconds, 0 while still running or malformed. */
export function sessionDurationMs(session: Session | undefined | null): number {
  if (!session) return 0;
  const start = finite(session.startedAt);
  const end = finite(session.endedAt, 0);
  if (start <= 0 || end <= start) return 0;
  return end - start;
}
