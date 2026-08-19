import type { ID, PlannedExercise, Routine } from '@/data/types';
import { clamp, finite } from './num';

/**
 * Duration estimate for a planned routine.
 *
 * Built from the parts that actually cost time: the set itself (roughly three
 * and a half seconds a rep, floored and capped), the prescribed rest, and the
 * walk-and-set-up between exercises. Superset members rest only after the last
 * member of the group, which is the whole point of pairing them.
 */

const SEC_PER_REP = 3.5;
const MIN_SET_SEC = 20;
const MAX_SET_SEC = 90;
const TRANSITION_SEC = 40;      // finding the next station, adjusting the bench
const GROUP_SWITCH_SEC = 15;    // moving between superset members
const WARMUP_REST_CAP = 60;
const SETUP_SEC = 180;          // arriving, changing, first bar

function setSeconds(reps: number): number {
  return clamp(finite(reps, 8) * SEC_PER_REP, MIN_SET_SEC, MAX_SET_SEC);
}

/** Seconds for one planned exercise, given whether it rests at the end. */
export function estimateExerciseSeconds(pe: PlannedExercise | undefined | null, restsAfterEachSet = true): number {
  if (!pe) return 0;
  const sets = Array.isArray(pe.sets) ? pe.sets : [];
  const rest = clamp(finite(pe.restSec, 90), 0, 600);
  let seconds = 0;
  for (const s of sets) {
    seconds += setSeconds(finite(s?.reps, 8));
    if (!restsAfterEachSet) seconds += GROUP_SWITCH_SEC;
    else seconds += s?.kind === 'warmup' ? Math.min(rest, WARMUP_REST_CAP) : rest;
  }
  return seconds + TRANSITION_SEC;
}

export function estimateSeconds(r: Routine | undefined | null): number {
  if (!r || !Array.isArray(r.exercises) || r.exercises.length === 0) return 0;

  const lastOfGroup = new Map<ID, number>();
  r.exercises.forEach((pe, i) => {
    if (pe?.groupId) lastOfGroup.set(pe.groupId, i);
  });

  let seconds = SETUP_SEC;
  r.exercises.forEach((pe, i) => {
    if (!pe) return;
    const grouped = typeof pe.groupId === 'string' && pe.groupId.length > 0;
    const restsHere = !grouped || lastOfGroup.get(pe.groupId as ID) === i;
    seconds += estimateExerciseSeconds(pe, restsHere);
  });

  return Math.round(seconds);
}

/** Whole minutes, never below 5 for a routine that has any work in it. */
export function estimateMinutes(r: Routine): number {
  const seconds = estimateSeconds(r);
  if (seconds <= 0) return 0;
  return Math.max(5, Math.round(seconds / 60));
}

/** '45–55 min' — an honest range rather than false precision. */
export function estimateRange(r: Routine): string {
  const m = estimateMinutes(r);
  if (m <= 0) return '—';
  const low = Math.max(5, Math.round((m * 0.9) / 5) * 5);
  const high = Math.max(low + 5, Math.round((m * 1.15) / 5) * 5);
  return `${low}–${high} min`;
}

/** Total planned working sets — a useful second number next to duration. */
export function plannedSetCount(r: Routine | undefined | null): number {
  if (!r || !Array.isArray(r.exercises)) return 0;
  let n = 0;
  for (const pe of r.exercises) {
    if (!pe || !Array.isArray(pe.sets)) continue;
    n += pe.sets.filter((s) => s && s.kind !== 'warmup').length;
  }
  return n;
}
