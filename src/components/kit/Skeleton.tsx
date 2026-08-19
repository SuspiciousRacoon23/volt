import React, { useEffect } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion, useTheme } from '@/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** A placeholder block. Breathes slowly; holds still under reduced motion. */
export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const { c, radius: r } = useTheme();
  const reduced = useReducedMotion();
  const p = useSharedValue(0.55);

  useEffect(() => {
    if (reduced) {
      p.value = 0.6;
      return;
    }
    p.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [p, reduced]);

  const anim = useAnimatedStyle(() => ({ opacity: p.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius ?? r.sm, backgroundColor: c.surfaceAlt },
        anim,
        style,
      ]}
    />
  );
}

export type SkeletonGroupProps = {
  /** Number of stacked lines. */
  lines?: number;
  gap?: number;
  lineHeight?: number;
  style?: StyleProp<ViewStyle>;
};

/** A few stacked lines, the last one short — the usual loading paragraph. */
export function SkeletonGroup({ lines = 3, gap, lineHeight = 14, style }: SkeletonGroupProps) {
  const { space } = useTheme();
  return (
    <View style={[{ gap: gap ?? space.sm }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 ? '58%' : '100%'} />
      ))}
    </View>
  );
}
