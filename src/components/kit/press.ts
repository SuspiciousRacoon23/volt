import { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { dur, springs, useReducedMotion } from '@/theme';

export type PressAnim = {
  /** Spread onto an `Animated.View` wrapping the pressable content. */
  style: ReturnType<typeof useAnimatedStyle<ViewStyle>>;
  onPressIn: () => void;
  onPressOut: () => void;
};

/**
 * The single press gesture used across the kit: a short, damped scale-down.
 * Collapses to no movement when the user has asked for reduced motion.
 */
export function usePressAnim(scaleTo = 0.97): PressAnim {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - scaleTo) * p.value }],
  }));

  const onPressIn = useCallback(() => {
    p.value = reduced ? 0 : withTiming(1, { duration: dur.fast });
  }, [p, reduced]);

  const onPressOut = useCallback(() => {
    p.value = reduced ? 0 : withSpring(0, springs.press);
  }, [p, reduced]);

  return { style, onPressIn, onPressOut };
}
