import { toExercise, type Def } from './exercise-def';
import { CORE_DEFS } from './exercises-core';
import { LEG_DEFS } from './exercises-legs';
import { PULL_DEFS } from './exercises-pull';
import { PUSH_DEFS } from './exercises-push';
import type { Exercise, ID } from './types';

export const EXERCISE_DEFS: Def[] = [...PUSH_DEFS, ...PULL_DEFS, ...LEG_DEFS, ...CORE_DEFS];

const FAVOURITES: ID[] = ['bench-press', 'back-squat', 'deadlift', 'pull-up', 'overhead-press'];

export function buildExercises(): Record<ID, Exercise> {
  const out: Record<ID, Exercise> = {};
  for (const d of EXERCISE_DEFS) {
    const e = toExercise(d);
    if (FAVOURITES.includes(e.id)) e.favourite = true;
    out[e.id] = e;
  }
  // Alternates are authored by hand; drop any that do not resolve so the UI never dead-ends.
  for (const e of Object.values(out)) e.alternates = e.alternates.filter((a) => a in out && a !== e.id);
  return out;
}

export const EXERCISE_COUNT = EXERCISE_DEFS.length;
