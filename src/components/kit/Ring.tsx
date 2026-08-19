import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { clamp } from '@/lib/num';
import { useReducedMotion, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type RingProps = {
  /** 0..1. Clamped. */
  progress: number;
  size?: number;
  thickness?: number;
  /** Defaults to the lime accent — a ring is progress, so lime is correct. */
  color?: string;
  trackColor?: string;
  /** Rendered centred inside the ring. */
  children?: React.ReactNode;
  /** Animate transitions. Ignored under reduced motion. */
  animated?: boolean;
  /** Transition length in ms. Rest timers tick every second, so keep it short. */
  duration?: number;
  /** Start angle in degrees, 0 = 12 o'clock. */
  startAngle?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Circular progress with a rounded cap. Used by the rest timer, and by
 * anything else that is genuinely a proportion of a whole.
 */
export function Ring({
  progress,
  size = 180,
  thickness = 10,
  color,
  trackColor,
  children,
  animated = true,
  duration = 320,
  startAngle = 0,
  style,
  accessibilityLabel,
}: RingProps) {
  const { c } = useTheme();
  const reduced = useReducedMotion();

  const target = clamp(progress, 0, 1);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const p = useSharedValue(target);

  useEffect(() => {
    p.value =
      animated && !reduced
        ? withTiming(target, { duration, easing: Easing.out(Easing.cubic) })
        : target;
  }, [animated, duration, p, reduced, target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - p.value),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: `${-90 + startAngle}deg` }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor ?? c.surfaceAlt}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? c.accent}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      {children ? (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
      ) : null}
    </View>
  );
}
