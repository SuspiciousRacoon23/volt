import { estimateMinutes } from '@/lib/estimate';
import type { GroupKind, ID, PlannedExercise, PlannedSet, Routine, Schedule, SetKind } from './types';

type Row = {
  ex: ID;
  warm?: number;      // number of warm-up sets
  sets: number;       // working sets
  reps: number;
  rpe: number | null;
  rest: number;       // seconds
  group?: string;     // rows sharing a key are supersetted
  note?: string;
};

type Template = { id: ID; name: string; note: string; rows: Row[]; groupKind?: GroupKind };

const TEMPLATES: Template[] = [
  {
    id: 'r-push', name: 'Push', note: 'Chest, shoulders and triceps. Heavy press first, then volume.',
    rows: [
      { ex: 'bench-press', warm: 3, sets: 4, reps: 6, rpe: 8, rest: 180, note: 'Add 2.5 kg once all four sets hit 6.' },
      { ex: 'incline-dumbbell-press', warm: 1, sets: 3, reps: 10, rpe: 8, rest: 120 },
      { ex: 'dip', sets: 3, reps: 8, rpe: 8, rest: 120, note: 'Add load once you clear 10 clean reps.' },
      { ex: 'cable-lateral-raise', sets: 3, reps: 15, rpe: 9, rest: 60, group: 'a' },
      { ex: 'triceps-pushdown', sets: 3, reps: 12, rpe: 9, rest: 60, group: 'a' },
      { ex: 'overhead-cable-extension', sets: 2, reps: 12, rpe: 9, rest: 60 },
    ],
  },
  {
    id: 'r-pull', name: 'Pull', note: 'Hinge, vertical pull, horizontal pull, then arms.',
    rows: [
      { ex: 'deadlift', warm: 4, sets: 3, reps: 5, rpe: 8, rest: 240, note: 'Reset every rep. No touch and go.' },
      { ex: 'pull-up', warm: 1, sets: 4, reps: 8, rpe: 8, rest: 150 },
      { ex: 'seated-cable-row', sets: 3, reps: 10, rpe: 8, rest: 120 },
      { ex: 'face-pull', sets: 3, reps: 15, rpe: 8, rest: 60, group: 'a' },
      { ex: 'hammer-curl', sets: 3, reps: 12, rpe: 9, rest: 60, group: 'a' },
      { ex: 'barbell-curl', sets: 3, reps: 10, rpe: 9, rest: 75 },
    ],
  },
  {
    id: 'r-legs', name: 'Legs', note: 'Squat, hinge, then quad and hamstring volume.',
    rows: [
      { ex: 'back-squat', warm: 4, sets: 4, reps: 6, rpe: 8, rest: 210 },
      { ex: 'romanian-deadlift', warm: 1, sets: 3, reps: 8, rpe: 8, rest: 150 },
      { ex: 'leg-press', sets: 3, reps: 12, rpe: 9, rest: 120 },
      { ex: 'lying-leg-curl', sets: 3, reps: 12, rpe: 9, rest: 90 },
      { ex: 'standing-calf-raise', sets: 4, reps: 12, rpe: 9, rest: 60 },
      { ex: 'hanging-leg-raise', sets: 3, reps: 12, rpe: 8, rest: 60 },
    ],
  },
  {
    id: 'r-upper', name: 'Upper Body', note: 'One press, one row, then accessories. Use it when the week gets short.',
    rows: [
      { ex: 'overhead-press', warm: 3, sets: 4, reps: 6, rpe: 8, rest: 180 },
      { ex: 'chest-supported-row', warm: 1, sets: 4, reps: 10, rpe: 8, rest: 120 },
      { ex: 'incline-bench-press', sets: 3, reps: 8, rpe: 8, rest: 150 },
      { ex: 'lat-pulldown', sets: 3, reps: 12, rpe: 8, rest: 90 },
      { ex: 'lateral-raise', sets: 3, reps: 15, rpe: 9, rest: 60, group: 'a' },
      { ex: 'cable-curl', sets: 3, reps: 12, rpe: 9, rest: 60, group: 'a' },
    ],
  },
  {
    id: 'r-lower', name: 'Lower Body', note: 'Quad-dominant squat pattern paired with direct glute and hamstring work.',
    rows: [
      { ex: 'front-squat', warm: 3, sets: 4, reps: 5, rpe: 8, rest: 210 },
      { ex: 'hip-thrust', warm: 1, sets: 3, reps: 10, rpe: 8, rest: 150 },
      { ex: 'bulgarian-split-squat', sets: 3, reps: 10, rpe: 8, rest: 120, note: 'Reps are per leg.' },
      { ex: 'seated-leg-curl', sets: 3, reps: 12, rpe: 9, rest: 90 },
      { ex: 'seated-calf-raise', sets: 4, reps: 15, rpe: 9, rest: 60 },
      { ex: 'pallof-press', sets: 3, reps: 10, rpe: 7, rest: 60 },
    ],
  },
  {
    id: 'r-full', name: 'Full Body', note: 'Everything once. The session to keep when the week falls apart.',
    rows: [
      { ex: 'back-squat', warm: 3, sets: 3, reps: 5, rpe: 8, rest: 180 },
      { ex: 'bench-press', warm: 2, sets: 3, reps: 6, rpe: 8, rest: 180 },
      { ex: 'barbell-row', warm: 1, sets: 3, reps: 8, rpe: 8, rest: 120 },
      { ex: 'romanian-deadlift', sets: 3, reps: 8, rpe: 8, rest: 150 },
      { ex: 'dumbbell-shoulder-press', sets: 3, reps: 10, rpe: 8, rest: 90 },
      { ex: 'cable-crunch', sets: 3, reps: 12, rpe: 8, rest: 60 },
    ],
  },
];

function set(id: ID, kind: SetKind, reps: number, rpe: number | null): PlannedSet {
  return { id, kind, reps, weight: null, rpe };
}

function toRoutine(t: Template): Routine {
  const groups: Record<ID, { kind: GroupKind }> = {};
  const exercises: PlannedExercise[] = t.rows.map((row, i) => {
    const peId = `${t.id}-e${i + 1}`;
    const sets: PlannedSet[] = [];
    for (let w = 0; w < (row.warm ?? 0); w++) sets.push(set(`${peId}-w${w + 1}`, 'warmup', w === 0 ? 8 : 5, null));
    for (let s = 0; s < row.sets; s++) sets.push(set(`${peId}-s${s + 1}`, 'working', row.reps, row.rpe));
    const groupId = row.group ? `${t.id}-g-${row.group}` : undefined;
    if (groupId) groups[groupId] = { kind: t.groupKind ?? 'superset' };
    return {
      id: peId,
      exerciseId: row.ex,
      sets,
      restSec: row.rest,
      ...(row.note ? { notes: row.note } : null),
      ...(groupId ? { groupId } : null),
    };
  });
  const routine: Routine = { id: t.id, name: t.name, note: t.note, exercises, groups, estMinutes: 0 };
  routine.estMinutes = estimateMinutes(routine);
  return routine;
}

export function buildRoutines(): Record<ID, Routine> {
  const out: Record<ID, Routine> = {};
  for (const t of TEMPLATES) out[t.id] = toRoutine(t);
  return out;
}

/** Mon Push · Tue Pull · Thu Legs · Fri Full Body. Wed, Sat and Sun are rest. */
export function buildSchedule(deloadWeek: string): Schedule {
  return {
    byDay: { 0: null, 1: 'r-push', 2: 'r-pull', 3: null, 4: 'r-legs', 5: 'r-full', 6: null },
    deloadWeeks: [deloadWeek],
  };
}

export const TRAINING_DAYS = [1, 2, 4, 5];
