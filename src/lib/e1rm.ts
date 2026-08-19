import { clamp, finite, round, roundTo, safeDiv } from './num';

/**
 * Estimated one-rep max.
 *
 * Two formulas, blended. Epley is generous at high reps, Brzycki is accurate
 * at low reps and falls apart above ~12. We weight them accordingly so the
 * number a lifter sees never jumps around between rep ranges.
 */

/** Reps beyond this are extrapolation, not measurement. */
export const MAX_MEANINGFUL_REPS = 15;

/** w * (1 + reps / 30) */
export function epley(weight: number, reps: number): number {
  const w = finite(weight);
  const r = clamp(finite(reps, 1), 1, 30);
  if (w <= 0) return 0;
  if (r <= 1) return round(w, 2);
  return round(w * (1 + r / 30), 2);
}

/** w * 36 / (37 - reps) — clamped before the denominator can collapse. */
export function brzycki(weight: number, reps: number): number {
  const w = finite(weight);
  const r = clamp(finite(reps, 1), 1, 15);
  if (w <= 0) return 0;
  if (r <= 1) return round(w, 2);
  return round(w * safeDiv(36, 37 - r, 1), 2);
}

/**
 * Blended estimate, rounded to 0.5.
 * 1 rep is not an estimate — it is the number. Above 12 reps Brzycki is
 * dropped entirely because it diverges.
 */
export function e1rm(weight: number, reps: number): number {
  const w = finite(weight);
  const r = finite(reps, 0);
  if (w <= 0 || r < 1) return 0;
  if (r === 1) return roundTo(w, 0.5);

  const ep = epley(w, r);
  const bz = brzycki(w, r);
  const rr = clamp(r, 1, 30);
  // Brzycki's share fades from 0.5 at low reps to 0 at 12+.
  const bzShare = rr >= 12 ? 0 : clamp((12 - rr) / 12, 0, 1) * 0.5;
  const blended = bz * bzShare + ep * (1 - bzShare);
  return roundTo(blended, 0.5);
}

/**
 * Fraction of 1RM a given rep count represents, from the same blend.
 * 1 -> 1, 5 -> ~0.86, 10 -> ~0.75. Always within (0, 1].
 */
export function percentOf1RM(reps: number): number {
  const r = clamp(finite(reps, 1), 1, 30);
  const est = e1rm(100, r);
  return est > 0 ? clamp(round(100 / est, 4), 0.3, 1) : 1;
}

/** Inverse: the load that should allow `reps` given an estimated max. */
export function weightForReps(estimatedMax: number, reps: number): number {
  const max = finite(estimatedMax);
  if (max <= 0) return 0;
  return roundTo(max * percentOf1RM(reps), 0.5);
}

/** Reps you would expect at a given load. 0 when the load exceeds the max. */
export function repsAtWeight(estimatedMax: number, weight: number): number {
  const max = finite(estimatedMax);
  const w = finite(weight);
  if (max <= 0 || w <= 0 || w > max) return w > 0 && w <= max ? 1 : 0;
  for (let r = 1; r <= MAX_MEANINGFUL_REPS; r += 1) {
    if (e1rm(w, r) >= max) return r;
  }
  return MAX_MEANINGFUL_REPS;
}

/** Best estimate across a list of (weight, reps) pairs. */
export function bestE1rm(sets: readonly { weight: number; reps: number }[]): number {
  if (!Array.isArray(sets)) return 0;
  let best = 0;
  for (const s of sets) {
    const v = e1rm(finite(s?.weight), finite(s?.reps));
    if (v > best) best = v;
  }
  return best;
}
