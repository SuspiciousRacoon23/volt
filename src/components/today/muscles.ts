import type { Exercise, ID, MuscleGroup, Routine } from '@/data';

/** 'hamstrings' → 'Hamstrings'. The groups are single words, so this is enough. */
export function muscleLabel(m: MuscleGroup): string {
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/**
 * The muscles a routine actually targets, ordered by how many working sets
 * point at them. Primary movers count fully, secondary movers at half.
 */
export function targetMuscles(
  routine: Routine | null,
  exercises: Record<ID, Exercise>,
  max = 4,
): MuscleGroup[] {
  if (!routine) return [];
  const tally = new Map<MuscleGroup, number>();
  for (const pe of routine.exercises) {
    const ex = exercises[pe.exerciseId];
    if (!ex) continue;
    const sets = pe.sets.filter((s) => s.kind !== 'warmup').length || 1;
    for (const m of ex.primary) tally.set(m, (tally.get(m) ?? 0) + sets);
    for (const m of ex.secondary) tally.set(m, (tally.get(m) ?? 0) + sets * 0.5);
  }
  return Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([m]) => m);
}
