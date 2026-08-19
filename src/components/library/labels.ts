import type { Equipment, Movement, MuscleGroup } from '@/data/types';

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  lats: 'Lats',
  traps: 'Traps',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Adductors',
  calves: 'Calves',
  neck: 'Neck',
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  band: 'Band',
  smith: 'Smith machine',
  plate: 'Plate',
  other: 'Other',
};

export const MOVEMENT_LABEL: Record<Movement, string> = {
  push: 'Push',
  pull: 'Pull',
  squat: 'Squat',
  hinge: 'Hinge',
  carry: 'Carry',
  core: 'Core',
  isolation: 'Isolation',
};

export function muscleList(groups: readonly MuscleGroup[], max = 3): string {
  if (!groups.length) return '';
  const shown = groups.slice(0, max).map((m) => MUSCLE_LABEL[m]);
  const extra = groups.length - shown.length;
  return extra > 0 ? `${shown.join(', ')} +${extra}` : shown.join(', ');
}

/** The one-line meta under an exercise name: equipment, then what it trains. */
export function metaLine(equipment: Equipment, primary: readonly MuscleGroup[]): string {
  const muscles = muscleList(primary, 2);
  return muscles ? `${EQUIPMENT_LABEL[equipment]} · ${muscles}` : EQUIPMENT_LABEL[equipment];
}
