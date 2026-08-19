import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useSettingsSafe } from './storeBridge';

/** Short and purposeful. Nothing in VOLT animates for longer than 260ms. */
export const dur = { fast: 120, base: 180, slow: 260 } as const;

/** Returns 0 when reduced motion is on, so an animation resolves instantly. */
export function ms(v: number, reduced: boolean): number {
  return reduced ? 0 : v;
}

/**
 * True when the user has asked for less motion — either in VOLT's own settings
 * or at the OS level. Every animation in the app must consult this.
 */
export function useReducedMotion(): boolean {
  const settings = useSettingsSafe();
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setSystemReduced(v);
      })
      .catch(() => {
        /* platform does not report it; assume motion is fine */
      });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) => {
      setSystemReduced(v);
    });

    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return Boolean(settings?.reducedMotion) || systemReduced;
}

/**
 * Spring presets for reanimated `withSpring`. Critically damped — motion settles,
 * it never bounces. Pair with `useReducedMotion` and skip the animation entirely
 * when reduced.
 */
export const springs = {
  /** Snappy, for a press or a toggle. */
  press: { damping: 22, stiffness: 320, mass: 0.7 },
  /** Default for layout and position changes. */
  glide: { damping: 26, stiffness: 200, mass: 0.9 },
  /** Soft, for a sheet or a large surface. */
  sheet: { damping: 30, stiffness: 160, mass: 1 },
} as const;
