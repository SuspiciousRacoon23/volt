import type { Readiness } from '@/data/types';
import { clamp, finite, round } from './num';

/**
 * Readiness is a weighted score, not a diagnosis.
 *
 * Soreness and joints carry the most weight because they are the two signals
 * that most reliably predict a session going badly, and both are inverted —
 * a 5 there means "very sore" / "aching", which is bad. Stress inverts for the
 * same reason. Energy, sleep and motivation read the normal way round.
 */

export type ReadinessVerdict = 'Ready' | 'Moderate' | 'Recover';

export type ReadinessFactor = {
  key: 'soreness' | 'joints' | 'energy' | 'sleep' | 'stress' | 'motivation';
  label: string;
  /** 0..1, already inverted where relevant. Higher is better. */
  normalised: number;
  weight: number;
  /** Points this factor contributes to the 0–100 score. */
  points: number;
};

const WEIGHTS = {
  soreness: 0.24,
  joints: 0.24,
  energy: 0.16,
  sleep: 0.16,
  stress: 0.1,
  motivation: 0.1,
} as const;

const INVERTED = new Set(['soreness', 'joints', 'stress']);

const LABELS: Record<keyof typeof WEIGHTS, string> = {
  soreness: 'Soreness',
  joints: 'Joints',
  energy: 'Energy',
  sleep: 'Sleep',
  stress: 'Stress',
  motivation: 'Motivation',
};

function normalise(key: keyof typeof WEIGHTS, raw: unknown): number {
  const v = clamp(finite(raw, 3), 1, 5);
  const scaled = (v - 1) / 4;
  return INVERTED.has(key) ? 1 - scaled : scaled;
}

/** Per-factor breakdown, heaviest contributor first. Useful for the check-in UI. */
export function readinessFactors(r: Readiness | null | undefined): ReadinessFactor[] {
  const keys = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];
  return keys
    .map((key) => {
      const normalised = r ? normalise(key, r[key]) : 0.5;
      const weight = WEIGHTS[key];
      return {
        key,
        label: LABELS[key],
        normalised: round(normalised, 3),
        weight,
        points: round(normalised * weight * 100, 1),
      };
    })
    .sort((a, b) => b.weight - a.weight || a.points - b.points);
}

/** 0..100. A missing check-in scores 50 — unknown, not bad. */
export function readinessScore(r: Readiness): number {
  if (!r) return 50;
  const factors = readinessFactors(r);
  const total = factors.reduce((t, f) => t + f.points, 0);
  return clamp(Math.round(total), 0, 100);
}

/**
 * Ready / Moderate / Recover.
 * A maxed-out soreness or joints answer caps the verdict at Moderate no matter
 * how good the rest of the check-in looks — one bad joint outranks good sleep.
 */
export function readinessVerdict(r: Readiness): ReadinessVerdict {
  const score = readinessScore(r);
  const soreness = clamp(finite(r?.soreness, 3), 1, 5);
  const joints = clamp(finite(r?.joints, 3), 1, 5);

  if (soreness >= 5 && joints >= 5) return 'Recover';
  if (score >= 70) return (soreness >= 5 || joints >= 5) ? 'Moderate' : 'Ready';
  if (score >= 45) return 'Moderate';
  return 'Recover';
}

/** Calm, factual, non-medical one-liner to sit under the verdict. */
export function readinessSummary(r: Readiness): string {
  const verdict = readinessVerdict(r);
  const factors = readinessFactors(r);
  const weakest = factors.reduce((worst, f) => (f.normalised < worst.normalised ? f : worst), factors[0]);
  const weak = weakest && weakest.normalised <= 0.4 ? weakest.label.toLowerCase() : null;

  if (verdict === 'Ready') {
    return weak
      ? `You are ready to train. ${weakest.label} is the one thing lagging today.`
      : 'You are ready to train. Load as planned.';
  }
  if (verdict === 'Moderate') {
    return weak
      ? `Train, but keep something back. Your ${weak} answer is the limiting factor.`
      : 'Train, but keep something back. Consider holding today’s loads.';
  }
  return weak
    ? `Your ${weak} answer is low. A lighter session or a rest day is a reasonable choice.`
    : 'Most of your answers are low. A lighter session or a rest day is a reasonable choice.';
}

/** Standing caveat. This is a self-report, not a clinical assessment. */
export const READINESS_CAVEAT =
  'This is your own self-report, scored. It is not medical advice. Persistent joint pain is worth a professional opinion.';

/** Suggested load adjustment as a multiplier, for the planner to offer — never auto-applied. */
export function readinessLoadFactor(r: Readiness | null | undefined): number {
  if (!r) return 1;
  const verdict = readinessVerdict(r);
  if (verdict === 'Ready') return 1;
  if (verdict === 'Moderate') return 0.95;
  return 0.85;
}
