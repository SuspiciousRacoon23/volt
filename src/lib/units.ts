import type { Unit } from '@/data/types';
import { clamp, finite, round, roundTo } from './num';

/** Everything is stored in kilograms. Units are a display concern only. */
export const LB_PER_KG = 2.2046226218;

/** The smallest jump a normal gym can actually make, per unit. */
export const INCREMENT_KG = 2.5;
export const INCREMENT_LB = 5;

export function kgToLb(v: number): number {
  return round(finite(v) * LB_PER_KG, 4);
}

export function lbToKg(v: number): number {
  return round(finite(v) / LB_PER_KG, 4);
}

function isLb(unit: Unit | undefined): boolean {
  return unit === 'lb';
}

/** Numeric value to show for a stored kg figure, in the user's unit. */
export function displayWeight(kg: number, unit: Unit): number {
  const v = finite(kg);
  return isLb(unit) ? round(kgToLb(v), 1) : round(v, 2);
}

/** Convert a value the user typed (in their unit) back to stored kilograms. */
export function toKg(value: number, unit: Unit): number {
  const v = finite(value);
  return isLb(unit) ? lbToKg(v) : round(v, 2);
}

export function unitLabel(unit: Unit): string {
  return isLb(unit) ? 'lb' : 'kg';
}

/** '82.5 kg' / '180 lb'. Bodyweight (0) reads as 'Bodyweight'. */
export function fmtWeight(kg: number, unit: Unit): string {
  const v = finite(kg);
  if (v === 0) return 'Bodyweight';
  return `${fmtWeightValue(v, unit)} ${unitLabel(unit)}`;
}

/** The number alone, formatted — for when the unit is already on screen. */
export function fmtWeightValue(kg: number, unit: Unit): string {
  const v = finite(kg);
  if (isLb(unit)) {
    const lb = roundTo(kgToLb(v), 0.5);
    return Number.isInteger(lb) ? String(lb) : lb.toFixed(1);
  }
  const k = roundTo(v, 0.25);
  return Number.isInteger(k) ? String(k) : String(round(k, 2));
}

/**
 * Snap a load to the nearest jump the user's plates can express:
 * 2.5 kg on a kilogram bar, 5 lb on a pound bar. Always returns kilograms.
 */
export function roundToIncrement(kg: number, unit: Unit): number {
  const v = finite(kg);
  if (v <= 0) return 0;
  if (isLb(unit)) return round(lbToKg(roundTo(kgToLb(v), INCREMENT_LB)), 3);
  return roundTo(v, INCREMENT_KG);
}

/** One increment up or down, in stored kilograms. */
export function stepWeight(kg: number, unit: Unit, direction: 1 | -1): number {
  const step = isLb(unit) ? lbToKg(INCREMENT_LB) : INCREMENT_KG;
  const next = finite(kg) + step * direction;
  return Math.max(0, roundToIncrement(next, unit));
}

/** Total volume in the user's unit, formatted with a thousands separator. */
export function fmtVolume(kg: number, unit: Unit): string {
  const v = Math.max(0, finite(kg));
  const shown = isLb(unit) ? Math.round(kgToLb(v)) : Math.round(v);
  return `${shown.toLocaleString('en-US')} ${unitLabel(unit)}`;
}

/**
 * Lifetime-scale volume for a narrow stat tile. `fmtVolume` is exact and grows
 * to "204,375 kg", which overflows a half-width tile — this trades the last
 * digits for a figure that fits and still reads honestly.
 */
export function fmtVolumeCompact(kg: number, unit: Unit): string {
  const v = Math.max(0, finite(kg));
  if (isLb(unit)) {
    const lb = Math.round(kgToLb(v));
    return lb < 10000 ? `${lb.toLocaleString('en-US')} lb` : `${(lb / 1000).toFixed(1)}k lb`;
  }
  const n = Math.round(v);
  return n < 1000 ? `${n.toLocaleString('en-US')} kg` : `${(n / 1000).toFixed(1)} t`;
}

/** Parse free text a user typed. Returns null when it is not a number. */
export function parseWeight(input: string, unit: Unit): number | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return clamp(toKg(n, unit), 0, 1000);
}

/** Bodyweight formatting keeps one decimal in both units. */
export function fmtBodyweight(kg: number, unit: Unit): string {
  const v = Math.max(0, finite(kg));
  const shown = isLb(unit) ? kgToLb(v) : v;
  return `${round(shown, 1).toFixed(1)} ${unitLabel(unit)}`;
}
