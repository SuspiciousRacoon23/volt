import { clamp, finite, round } from './num';

/**
 * Plate maths.
 *
 * A barbell is loaded symmetrically, so every solve happens per side against
 * (target - bar) / 2. We solve greedily from the heaviest plate down, which is
 * optimal for every real-world plate set (each denomination divides evenly into
 * the ones above it), and we report honestly: `achievable` is the load you can
 * actually build, `leftover` is what you asked for and cannot make.
 */

export type PlateSolve = {
  /** Plates for ONE side, heaviest first. */
  perSide: number[];
  /** The bar weight actually loadable, closest at or below the target. */
  achievable: number;
  /** target - achievable, never negative. */
  leftover: number;
};

export type PlateOptions = {
  /** Physical sleeve limit. Default 10 plates per side. */
  maxPerSide?: number;
  /** Real inventory: how many PAIRS of each denomination exist. Omit for unlimited. */
  counts?: Record<number, number>;
};

/** A sane default set for a metric gym. */
export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const DEFAULT_BAR_KG = 20;

const EPS = 1e-6;
const DEFAULT_MAX_PER_SIDE = 10;

/** Clean, dedupe and sort a plate inventory descending. */
export function normalizePlates(plates: readonly number[] | undefined): number[] {
  const src = Array.isArray(plates) ? plates : [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const p of src) {
    const v = round(finite(p), 3);
    if (v <= 0 || v > 100) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  out.sort((a, b) => b - a);
  return out.length > 0 ? out : DEFAULT_PLATES_KG.slice();
}

/** The smallest change in total bar weight this inventory can express. */
export function smallestIncrement(plates: readonly number[]): number {
  const p = normalizePlates(plates);
  return round(p[p.length - 1] * 2, 3);
}

/**
 * Greedy per-side solve.
 * Returns the loadable weight at or below `target`, plus what it could not make.
 */
export function platesFor(
  target: number,
  barKg: number,
  plates: number[],
  opts?: PlateOptions,
): PlateSolve {
  const bar = Math.max(0, finite(barKg, DEFAULT_BAR_KG));
  const want = Math.max(0, finite(target, bar));
  const set = normalizePlates(plates);
  const maxPerSide = clamp(finite(opts?.maxPerSide, DEFAULT_MAX_PER_SIDE), 1, 24);

  if (want <= bar + EPS) {
    return { perSide: [], achievable: round(bar, 3), leftover: round(Math.max(0, want - bar), 3) };
  }

  let remaining = (want - bar) / 2;
  const perSide: number[] = [];
  const used: Record<number, number> = {};

  for (const plate of set) {
    const available = opts?.counts ? Math.max(0, Math.floor(finite(opts.counts[plate], 0))) : Infinity;
    while (
      remaining + EPS >= plate &&
      perSide.length < maxPerSide &&
      (used[plate] ?? 0) < available
    ) {
      perSide.push(plate);
      used[plate] = (used[plate] ?? 0) + 1;
      remaining = round(remaining - plate, 4);
    }
    if (perSide.length >= maxPerSide) break;
  }

  const loaded = perSide.reduce((t, p) => t + p, 0);
  const achievable = round(bar + loaded * 2, 3);
  return { perSide, achievable, leftover: round(Math.max(0, want - achievable), 3) };
}

/** Collapse a per-side list into display pairs: [{ weight: 20, count: 2 }, ...]. */
export function groupPlates(perSide: readonly number[]): { weight: number; count: number }[] {
  const out: { weight: number; count: number }[] = [];
  if (!Array.isArray(perSide)) return out;
  for (const p of perSide) {
    const w = round(finite(p), 3);
    if (w <= 0) continue;
    const last = out[out.length - 1];
    if (last && last.weight === w) last.count += 1;
    else out.push({ weight: w, count: 1 });
  }
  return out;
}

/** True when the exact weight can be built with this bar and inventory. */
export function canMake(weight: number, barKg: number, plates: number[], opts?: PlateOptions): boolean {
  return platesFor(weight, barKg, plates, opts).leftover <= EPS;
}

/**
 * The closest loadable weight to `target` — may round up as well as down.
 * Use this everywhere a suggested load is shown, so we never propose a
 * number the user cannot physically build.
 */
export function nearestAchievable(
  target: number,
  barKg: number,
  plates: number[],
  opts?: PlateOptions,
): number {
  const bar = Math.max(0, finite(barKg, DEFAULT_BAR_KG));
  const want = Math.max(0, finite(target, bar));
  if (want <= bar) return round(bar, 3);

  const down = platesFor(want, barKg, plates, opts);
  if (down.leftover <= EPS) return down.achievable;

  const step = smallestIncrement(plates);
  const up = platesFor(down.achievable + step, barKg, plates, opts);
  const upValue = up.achievable > down.achievable ? up.achievable : down.achievable;

  const distDown = want - down.achievable;
  const distUp = upValue - want;
  return distUp >= 0 && distUp < distDown ? upValue : down.achievable;
}

/** The next loadable weight strictly above `from`. */
export function nextLoadUp(from: number, barKg: number, plates: number[], opts?: PlateOptions): number {
  const step = smallestIncrement(plates);
  const base = Math.max(finite(from), finite(barKg, DEFAULT_BAR_KG));
  const candidate = nearestAchievable(base + step, barKg, plates, opts);
  return candidate > base ? candidate : round(base + step, 3);
}

/** The next loadable weight strictly below `from`, never under the bar. */
export function nextLoadDown(from: number, barKg: number, plates: number[], opts?: PlateOptions): number {
  const bar = Math.max(0, finite(barKg, DEFAULT_BAR_KG));
  const step = smallestIncrement(plates);
  const base = Math.max(finite(from), bar);
  if (base - step <= bar) return round(bar, 3);
  const candidate = platesFor(base - step, barKg, plates, opts).achievable;
  return candidate < base ? candidate : round(Math.max(bar, base - step), 3);
}

/** Compact per-side summary: '20 + 10 + 2.5'. Empty bar reads as 'Empty bar'. */
export function describePlates(perSide: readonly number[]): string {
  const groups = groupPlates(perSide);
  if (groups.length === 0) return 'Empty bar';
  return groups
    .map((g) => (g.count > 1 ? `${g.weight} x${g.count}` : `${g.weight}`))
    .join(' + ');
}
