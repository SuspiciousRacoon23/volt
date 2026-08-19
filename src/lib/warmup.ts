import { clamp, finite, round } from './num';
import { DEFAULT_BAR_KG, DEFAULT_PLATES_KG, nearestAchievable, normalizePlates, platesFor, smallestIncrement } from './plates';

export type WarmupSet = {
  /** Loadable weight, already snapped to the user's plates. */
  weight: number;
  reps: number;
  /** Fraction of the working weight, 0..1. */
  pct: number;
};

/**
 * A warm-up ramp that a coach would actually write: start on the bar, climb in
 * three steps with reps coming down as the weight goes up, arrive primed rather
 * than tired. Every rung is snapped to a weight the user's plates can build, so
 * we never print a number that cannot be loaded.
 */

const RAMP: { pct: number; reps: number }[] = [
  { pct: 0.4, reps: 8 },
  { pct: 0.6, reps: 5 },
  { pct: 0.8, reps: 3 },
];

const BAR_REPS = 10;

export function warmupSets(workWeight: number, barKg: number, plates?: number[]): WarmupSet[] {
  const bar = Math.max(0, finite(barKg, DEFAULT_BAR_KG));
  const work = Math.max(0, finite(workWeight, 0));
  const set = normalizePlates(plates ?? DEFAULT_PLATES_KG);
  const step = smallestIncrement(set);

  // Bodyweight or unloaded movements do not get a bar ramp.
  if (work <= 0) return [];

  // Anything at or barely above the empty bar is its own warm-up.
  if (work <= bar + step) {
    return [{ weight: round(bar, 2), reps: BAR_REPS, pct: work > 0 ? clamp(bar / work, 0, 1) : 1 }];
  }

  const out: WarmupSet[] = [];
  const push = (weight: number, reps: number) => {
    const w = round(weight, 2);
    if (w <= 0) return;
    if (w >= work - step / 2) return; // never warm up at (or above) the working load
    const prev = out[out.length - 1];
    if (prev && w <= prev.weight) return; // strictly ascending only
    out.push({ weight: w, reps: clamp(reps, 1, 20), pct: clamp(w / work, 0, 1) });
  };

  if (bar > 0) push(bar, BAR_REPS);

  for (const rung of RAMP) {
    const raw = work * rung.pct;
    if (raw <= bar) continue;
    const snapped = nearestAchievable(raw, bar, set);
    // Only keep a rung the bar can genuinely hold above the previous one.
    if (platesFor(snapped, bar, set).leftover > 0.001) continue;
    push(snapped, rung.reps);
  }

  // A single-rung ramp on a heavy lift is not a ramp. Bridge the gap.
  if (out.length === 1 && work > bar * 2) {
    const mid = nearestAchievable((out[0].weight + work) / 2, bar, set);
    push(mid, 5);
  }

  return out;
}

/** Total reps in a ramp — used by the duration estimator. */
export function warmupReps(sets: readonly WarmupSet[]): number {
  if (!Array.isArray(sets)) return 0;
  return sets.reduce((t, s) => t + clamp(finite(s?.reps), 0, 20), 0);
}

/** Rough time cost of a ramp, in seconds (work + short rests). */
export function warmupSeconds(sets: readonly WarmupSet[]): number {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  return sets.reduce((t, s) => t + clamp(finite(s?.reps), 1, 20) * 3 + 45, 0);
}
