import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { IconButton, Ring, Text } from '@/components/kit';
import { Rest } from '@/icons';
import { fmtClock } from '@/lib/dates';
import { dur, hairline, ms, useReducedMotion, useTheme } from '@/theme';

import type { RestTimer } from './timers';

export type RestPillProps = {
  timer: RestTimer;
  onPress: () => void;
};

/**
 * The rest timer while the user is doing something else. Docked above the
 * controls, always one tap from the full countdown.
 */
export function RestPill({ timer, onPress }: RestPillProps) {
  const { c, radius, space } = useTheme();
  const reduced = useReducedMotion();

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!timer.finished) return;
    pulse.value = withSequence(
      withTiming(1, { duration: ms(dur.fast, reduced) }),
      withTiming(0, { duration: ms(dur.slow, reduced) }),
    );
  }, [pulse, reduced, timer.finished, timer.pulse]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.03 }] }));

  const progress = timer.duration > 0 ? timer.remaining / timer.duration : 0;

  return (
    <Animated.View style={anim}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={timer.finished ? 'Rest complete' : `Rest, ${fmtClock(timer.remaining)} remaining`}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingLeft: space.md,
          paddingRight: space.xs,
          borderRadius: radius.pill,
          borderWidth: hairline,
          borderColor: timer.finished ? c.borderStrong : c.border,
          backgroundColor: c.surfaceAlt,
          opacity: pressed ? 0.9 : 1,
        })}>
        <Ring progress={timer.finished ? 1 : progress} size={28} thickness={3} duration={220}>
          <View />
        </Ring>

        <View style={{ flex: 1 }}>
          <Text variant="label" tone="faint">
            {timer.finished ? 'Rest complete' : 'Resting'}
          </Text>
          <Text variant="h2" numeric>
            {timer.finished ? 'Ready' : fmtClock(timer.remaining)}
          </Text>
        </View>

        <IconButton
          icon={Rest}
          label={timer.finished ? 'Clear rest timer' : 'Skip rest'}
          variant="plain"
          size={44}
          iconSize={20}
          onPress={timer.skip}
        />
      </Pressable>
    </Animated.View>
  );
}
