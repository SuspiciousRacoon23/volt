/**
 * Numeric guards shared by every lib module.
 * Nothing here may return NaN or Infinity. Every entry point is total.
 */

/** Coerce anything to a finite number, falling back when it is not one. */
export function finite(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp(v: number, min: number, max: number): number {
  const n = finite(v, min);
  if (max < min) return min;
  return n < min ? min : n > max ? max : n;
}

/** Round to a number of decimal places (0..6). */
export function round(v: number, dp = 0): number {
  const n = finite(v);
  const p = Math.pow(10, clamp(dp, 0, 6));
  return Math.round((n + Number.EPSILON) * p) / p;
}

/** Round to the nearest multiple of `step` (e.g. 0.5, 2.5). */
export function roundTo(v: number, step: number): number {
  const s = finite(step);
  if (s <= 0) return finite(v);
  return round(Math.round(finite(v) / s) * s, 4);
}

/** Round down to the nearest multiple of `step`. */
export function floorTo(v: number, step: number): number {
  const s = finite(step);
  if (s <= 0) return finite(v);
  return round(Math.floor(finite(v) / s) * s, 4);
}

/** Division that never divides by zero. */
export function safeDiv(a: number, b: number, fallback = 0): number {
  const x = finite(a);
  const y = finite(b);
  if (y === 0) return fallback;
  return finite(x / y, fallback);
}

export function sum(xs: readonly number[]): number {
  if (!Array.isArray(xs)) return 0;
  let t = 0;
  for (const x of xs) t += finite(x);
  return t;
}

export function mean(xs: readonly number[]): number {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  return safeDiv(sum(xs), xs.length);
}

export function maxOf(xs: readonly number[], fallback = 0): number {
  if (!Array.isArray(xs) || xs.length === 0) return fallback;
  let m = -Infinity;
  for (const x of xs) {
    const n = finite(x, -Infinity);
    if (n > m) m = n;
  }
  return Number.isFinite(m) ? m : fallback;
}

export function minOf(xs: readonly number[], fallback = 0): number {
  if (!Array.isArray(xs) || xs.length === 0) return fallback;
  let m = Infinity;
  for (const x of xs) {
    const n = finite(x, Infinity);
    if (n < m) m = n;
  }
  return Number.isFinite(m) ? m : fallback;
}

/** Percentage change from -> to, as a signed percentage. 0 when `from` is not positive. */
export function pctChange(from: number, to: number): number {
  const a = finite(from);
  const b = finite(to);
  if (a <= 0) return 0;
  return round(((b - a) / a) * 100, 1);
}

/** Format a percentage magnitude for copy: 7.5 -> '7.5', 28 -> '28'. */
export function fmtPct(v: number): string {
  const n = Math.abs(round(v, 1));
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

/** Drop a trailing '.0' — 82.5 -> '82.5', 100.0 -> '100'. */
export function trimNumber(v: number, dp = 2): string {
  const n = round(v, dp);
  if (Number.isInteger(n)) return String(n);
  return String(n);
}
