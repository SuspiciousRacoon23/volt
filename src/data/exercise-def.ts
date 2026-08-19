import type { Equipment, Exercise, ID, Movement, MuscleGroup } from './types';

/** Compact authoring shape for the built-in catalogue. */
export type Def = {
  id: ID;
  name: string;
  primary: MuscleGroup[];
  secondary?: MuscleGroup[];
  equipment: Equipment;
  movement: Movement;
  uni?: boolean;
  cue: string;
  steps: string[];
  mistakes: string[];
  alt: ID[];
};

export function toExercise(d: Def): Exercise {
  return {
    id: d.id,
    name: d.name,
    primary: d.primary,
    secondary: d.secondary ?? [],
    equipment: d.equipment,
    movement: d.movement,
    unilateral: d.uni ?? false,
    instructions: d.steps,
    mistakes: d.mistakes,
    alternates: d.alt,
    cues: d.cue,
  };
}
