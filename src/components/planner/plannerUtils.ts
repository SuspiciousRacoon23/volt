import { uid } from '@/data/ids';
import type {
  Exercise, GroupKind, ID, MuscleGroup, PlannedExercise, PlannedSet, Routine, Schedule,
  Session, SetKind,
} from '@/data/types';
import { estimateMinutes } from '@/lib/estimate';

/**
 * Pure helpers for the planner. Nothing here touches the store: a screen hands
 * a routine in and gets a new routine back, then persists it with saveRoutine.
 */

export const DEFAULT_REST_SEC = 90;

export function titleCase(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** 'Full Body' -> 'FB', 'Push' -> 'PUSH'. Used by the week strip. */
export function abbreviate(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '—';
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

/* ------------------------------------------------------------------ stats */

export type RoutineStats = {
  exercises: number;
  workingSets: number;
  totalSets: number;
  minutes: number;
};

export function routineStats(r: Routine): RoutineStats {
  let working = 0;
  let total = 0;
  for (const pe of r.exercises) {
    for (const s of pe.sets) {
      total += 1;
      if (s.kind !== 'warmup') working += 1;
    }
  }
  return {
    exercises: r.exercises.length,
    workingSets: working,
    totalSets: total,
    minutes: estimateMinutes(r),
  };
}

/** The muscles a routine actually loads, heaviest first. Secondaries count half. */
export function muscleCoverage(
  r: Routine,
  exercises: Record<ID, Exercise>,
  limit = 4,
): { muscle: MuscleGroup; sets: number }[] {
  const tally = new Map<MuscleGroup, number>();
  const add = (m: MuscleGroup, n: number) => tally.set(m, (tally.get(m) ?? 0) + n);
  for (const pe of r.exercises) {
    const ex = exercises[pe.exerciseId];
    if (!ex) continue;
    const n = pe.sets.filter((s) => s.kind !== 'warmup').length;
    if (!n) continue;
    for (const m of ex.primary) add(m, n);
    for (const m of ex.secondary) add(m, n * 0.5);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([muscle, sets]) => ({ muscle, sets: Math.round(sets) }));
}

/** Weekday indices (0=Sun) this routine is scheduled on. */
export function scheduledDays(schedule: Schedule, routineId: ID): number[] {
  const out: number[] = [];
  for (let d = 0; d < 7; d += 1) if (schedule.byDay[d] === routineId) out.push(d);
  return out;
}

/* -------------------------------------------------------------- factories */

export function newPlannedSet(kind: SetKind, reps: number, weight: number | null, rpe: number | null): PlannedSet {
  return { id: uid('ps'), kind, reps, weight, rpe };
}

export function newPlannedExercise(exerciseId: ID, restSec = DEFAULT_REST_SEC): PlannedExercise {
  return {
    id: uid('pe'),
    exerciseId,
    restSec,
    sets: [
      newPlannedSet('working', 8, null, 8),
      newPlannedSet('working', 8, null, 8),
      newPlannedSet('working', 8, null, 8),
    ],
  };
}

export function emptyRoutine(name = 'New routine'): Routine {
  const r: Routine = { id: uid('r'), name, exercises: [], groups: {}, estMinutes: 0 };
  return r;
}

/** A deep copy with fresh ids, so editing the copy never touches the original. */
export function cloneRoutine(src: Routine, name?: string): Routine {
  const groupMap: Record<ID, ID> = {};
  for (const g of Object.keys(src.groups)) groupMap[g] = uid('g');
  const groups: Record<ID, { kind: GroupKind }> = {};
  for (const [g, v] of Object.entries(src.groups)) groups[groupMap[g]] = { kind: v.kind };
  const copy: Routine = {
    id: uid('r'),
    name: name ?? src.name,
    ...(src.note ? { note: src.note } : null),
    groups,
    estMinutes: src.estMinutes,
    exercises: src.exercises.map((pe) => ({
      id: uid('pe'),
      exerciseId: pe.exerciseId,
      restSec: pe.restSec,
      ...(pe.notes ? { notes: pe.notes } : null),
      ...(pe.groupId && groupMap[pe.groupId] ? { groupId: groupMap[pe.groupId] } : null),
      sets: pe.sets.map((s) => ({ ...s, id: uid('ps') })),
    })),
  };
  copy.estMinutes = estimateMinutes(copy);
  return copy;
}

/** Turn a workout that already happened into a routine you can run again. */
export function routineFromSession(session: Session, name?: string): Routine {
  const groupMap: Record<ID, ID> = {};
  const groups: Record<ID, { kind: GroupKind }> = {};
  const exercises: PlannedExercise[] = session.exercises.map((le) => {
    let groupId: ID | undefined;
    if (le.groupId) {
      if (!groupMap[le.groupId]) {
        groupMap[le.groupId] = uid('g');
        groups[groupMap[le.groupId]] = { kind: 'superset' };
      }
      groupId = groupMap[le.groupId];
    }
    const sets = le.sets.length
      ? le.sets.map((s) => newPlannedSet(s.kind, s.reps, s.weight > 0 ? s.weight : null, s.rpe))
      : [newPlannedSet('working', 8, null, 8)];
    return {
      id: uid('pe'),
      exerciseId: le.exerciseId,
      restSec: le.restSec || DEFAULT_REST_SEC,
      ...(le.notes ? { notes: le.notes } : null),
      ...(groupId ? { groupId } : null),
      sets,
    };
  });
  const r: Routine = { id: uid('r'), name: name ?? session.name, exercises, groups, estMinutes: 0 };
  r.estMinutes = estimateMinutes(r);
  return r;
}

/* ------------------------------------------------------------ list edits */

export function reorder<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function pruneGroups(r: Routine): Routine {
  const counts = new Map<ID, number>();
  for (const pe of r.exercises) {
    if (pe.groupId) counts.set(pe.groupId, (counts.get(pe.groupId) ?? 0) + 1);
  }
  const groups: Record<ID, { kind: GroupKind }> = {};
  for (const [g, v] of Object.entries(r.groups)) if ((counts.get(g) ?? 0) > 1) groups[g] = v;
  const exercises = r.exercises.map((pe) =>
    pe.groupId && !groups[pe.groupId] ? stripGroup(pe) : pe,
  );
  return { ...r, exercises, groups };
}

/** The same planned exercise with no group membership. */
function stripGroup(pe: PlannedExercise): PlannedExercise {
  const next: PlannedExercise = {
    id: pe.id,
    exerciseId: pe.exerciseId,
    sets: pe.sets,
    restSec: pe.restSec,
  };
  if (pe.notes !== undefined) next.notes = pe.notes;
  return next;
}

/** Recompute the estimate and clean up orphaned groups after any edit. */
export function settle(r: Routine): Routine {
  const cleaned = pruneGroups(r);
  return { ...cleaned, estMinutes: estimateMinutes(cleaned) };
}

export function replaceExerciseAt(r: Routine, index: number, fn: (pe: PlannedExercise) => PlannedExercise): Routine {
  return settle({ ...r, exercises: r.exercises.map((pe, i) => (i === index ? fn(pe) : pe)) });
}

export function removeExerciseAt(r: Routine, index: number): Routine {
  return settle({ ...r, exercises: r.exercises.filter((_, i) => i !== index) });
}

export function duplicateExerciseAt(r: Routine, index: number): Routine {
  const src = r.exercises[index];
  if (!src) return r;
  const copy = stripGroup({
    ...src,
    id: uid('pe'),
    sets: src.sets.map((s) => ({ ...s, id: uid('ps') })),
  });
  const exercises = [...r.exercises];
  exercises.splice(index + 1, 0, copy);
  return settle({ ...r, exercises });
}

export function moveExercise(r: Routine, from: number, to: number): Routine {
  return settle({ ...r, exercises: reorder(r.exercises, from, to) });
}

export function addExercise(r: Routine, exerciseId: ID, restSec: number): Routine {
  return settle({ ...r, exercises: [...r.exercises, newPlannedExercise(exerciseId, restSec)] });
}

/* ----------------------------------------------------------------- sets */

export function addSetAt(r: Routine, index: number, kind: SetKind): Routine {
  return replaceExerciseAt(r, index, (pe) => {
    const working = pe.sets.filter((s) => s.kind === 'working');
    const last = working[working.length - 1] ?? pe.sets[pe.sets.length - 1];
    if (kind === 'warmup') {
      const warm = pe.sets.filter((s) => s.kind === 'warmup');
      const set = newPlannedSet('warmup', warm.length === 0 ? 8 : 5, null, null);
      return { ...pe, sets: [...pe.sets.filter((s) => s.kind === 'warmup'), set, ...pe.sets.filter((s) => s.kind !== 'warmup')] };
    }
    if (kind === 'drop') {
      const weight = last?.weight != null ? Math.round(last.weight * 0.8 * 2) / 2 : null;
      return { ...pe, sets: [...pe.sets, newPlannedSet('drop', last?.reps ?? 8, weight, null)] };
    }
    return { ...pe, sets: [...pe.sets, newPlannedSet(kind, last?.reps ?? 8, last?.weight ?? null, last?.rpe ?? 8)] };
  });
}

export function updateSet(r: Routine, index: number, setId: ID, patch: Partial<PlannedSet>): Routine {
  return replaceExerciseAt(r, index, (pe) => ({
    ...pe,
    sets: pe.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
  }));
}

export function removeSet(r: Routine, index: number, setId: ID): Routine {
  return replaceExerciseAt(r, index, (pe) => ({ ...pe, sets: pe.sets.filter((s) => s.id !== setId) }));
}

/* --------------------------------------------------------------- groups */

export type GroupPosition = 'none' | 'only' | 'first' | 'middle' | 'last';

/** Where a card sits inside a run of consecutive cards sharing a groupId. */
export function groupPosition(exercises: readonly PlannedExercise[], index: number): GroupPosition {
  const g = exercises[index]?.groupId;
  if (!g) return 'none';
  const prev = exercises[index - 1]?.groupId === g;
  const next = exercises[index + 1]?.groupId === g;
  if (prev && next) return 'middle';
  if (prev) return 'last';
  if (next) return 'first';
  return 'only';
}

export function groupKindAt(r: Routine, index: number): GroupKind | null {
  const g = r.exercises[index]?.groupId;
  return g ? r.groups[g]?.kind ?? null : null;
}

/** Pair a card with the one below it, or extend the group that card already has. */
export function groupWithNext(r: Routine, index: number, kind: GroupKind): Routine {
  const a = r.exercises[index];
  const b = r.exercises[index + 1];
  if (!a || !b) return r;
  const gid = a.groupId ?? b.groupId ?? uid('g');
  const groups = { ...r.groups, [gid]: { kind } };
  const exercises = r.exercises.map((pe, i) =>
    i === index || i === index + 1 ? { ...pe, groupId: gid } : pe,
  );
  return settle({ ...r, exercises, groups });
}

export function ungroupAt(r: Routine, index: number): Routine {
  const pe = r.exercises[index];
  if (!pe?.groupId) return r;
  return settle({
    ...r,
    exercises: r.exercises.map((x, i) => (i === index ? stripGroup(x) : x)),
  });
}

export function setGroupKindAt(r: Routine, index: number, kind: GroupKind): Routine {
  const g = r.exercises[index]?.groupId;
  if (!g) return r;
  return settle({ ...r, groups: { ...r.groups, [g]: { kind } } });
}
