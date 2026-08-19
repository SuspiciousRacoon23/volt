import type { Exercise, LoggedExercise, LoggedSet, Session, Unit } from '@/data/types';
import { fmtWeight, fmtWeightValue, unitLabel } from '@/lib/units';

/** '80 kg × 8, 8, 7' — collapsed by weight, in the order the sets were done. */
export function performanceLine(sets: readonly LoggedSet[], unit: Unit): string {
  if (!sets.length) return '';
  const groups: { weight: number; reps: number[] }[] = [];
  for (const s of sets) {
    const last = groups[groups.length - 1];
    if (last && last.weight === s.weight) last.reps.push(s.reps);
    else groups.push({ weight: s.weight, reps: [s.reps] });
  }
  return groups
    .map((g) => `${fmtWeight(g.weight, unit)} × ${g.reps.join(', ')}`)
    .join(' · ');
}

/** '82.5 kg × 8' for a single set, unit included. */
export function setLine(set: LoggedSet | null, unit: Unit): string {
  if (!set) return '';
  const weight = set.weight === 0 ? 'Bodyweight' : `${fmtWeightValue(set.weight, unit)} ${unitLabel(unit)}`;
  return `${weight} × ${set.reps}`;
}

export function kindLabel(kind: LoggedSet['kind']): string {
  switch (kind) {
    case 'warmup':
      return 'Warm-up';
    case 'drop':
      return 'Drop set';
    case 'failure':
      return 'To failure';
    default:
      return 'Working set';
  }
}

/** Position of a set among the sets of its own kind, 1-based. */
export function setOrdinal(sets: readonly LoggedSet[], setId: string): number {
  const set = sets.find((s) => s.id === setId);
  if (!set) return 1;
  return sets.filter((s) => s.kind === set.kind).findIndex((s) => s.id === setId) + 1;
}

/** 'Next: Incline Press, set 2, 30 kg × 10'. */
export function nextPreview(
  target: { exercise: Exercise | undefined; logged: LoggedExercise; set: LoggedSet } | null,
  unit: Unit,
): string {
  if (!target) return 'Last set logged. Finish when you are ready.';
  const name = target.exercise?.name ?? 'Next exercise';
  const n = setOrdinal(target.logged.sets, target.set.id);
  const kind = target.set.kind === 'warmup' ? 'warm-up ' : '';
  return `Next: ${name}, ${kind}set ${n}, ${setLine(target.set, unit)}`;
}

/** Completed working sets across the whole session. */
export function sessionProgress(session: Session): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const le of session.exercises) {
    for (const s of le.sets) {
      total += 1;
      if (s.done) done += 1;
    }
  }
  return { done, total };
}

export function sideLabel(side: LoggedSet['side']): string {
  if (side === 'L') return 'Left';
  if (side === 'R') return 'Right';
  return '';
}
