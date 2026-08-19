import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { dur, ms, useReducedMotion } from '@/theme';

export type RiseProps = {
  /** Position in the stagger. Each step adds a short delay. */
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const STEP_MS = 44;
const LIFT = 14;

/**
 * The entrance for a Today block: a short rise into place, staggered down the
 * page. Under reduced motion it simply appears.
 */
export function Rise({ index = 0, children, style }: RiseProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    p.value = withDelay(
      index * STEP_MS,
      withTiming(1, { duration: ms(dur.slow, reduced), easing: Easing.out(Easing.cubic) }),
    );
  }, [index, p, reduced]);

  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * LIFT }],
  }));

  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
