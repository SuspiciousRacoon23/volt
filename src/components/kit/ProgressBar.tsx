import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { clamp } from '@/lib/num';
import { dur, useReducedMotion, useTheme } from '@/theme';

export type ProgressBarProps = {
  /** 0..1. Values outside the range are clamped. */
  value: number;
  height?: number;
  /** `accent` for real progress, `neutral` for a passive proportion bar. */
  tone?: 'accent' | 'neutral' | 'danger';
  /** Track colour override. Defaults to `surfaceAlt`. */
  trackColor?: string;
  /** Tick marks at fractional positions, e.g. segments of a workout. */
  segments?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function ProgressBar({
  value,
  height = 8,
  tone = 'accent',
  trackColor,
  segments,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const { c, radius } = useTheme();
  const reduced = useReducedMotion();
  const target = clamp(value, 0, 1);
  const p = useSharedValue(target);

  useEffect(() => {
    p.value = reduced ? target : withTiming(target, { duration: dur.slow });
  }, [p, reduced, target]);

  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));

  const colour = tone === 'accent' ? c.accent : tone === 'danger' ? c.danger : c.text;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[
        {
          height,
          borderRadius: radius.pill,
          backgroundColor: trackColor ?? c.surfaceAlt,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[{ height: '100%', borderRadius: radius.pill, backgroundColor: colour }, fill]}
      />
      {segments && segments > 1 ? (
        <View style={{ position: 'absolute', inset: 0, flexDirection: 'row' }} pointerEvents="none">
          {Array.from({ length: segments - 1 }).map((_, i) => (
            <View key={i} style={{ flex: 1, borderRightWidth: 2, borderRightColor: c.bg }} />
          ))}
          <View style={{ flex: 1 }} />
        </View>
      ) : null}
    </View>
  );
}
