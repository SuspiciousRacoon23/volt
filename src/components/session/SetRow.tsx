import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/kit';
import type { LoggedSet, Unit } from '@/data/types';
import { Check } from '@/icons';
import { fmtWeightValue, unitLabel } from '@/lib/units';
import { dur, hairline, ms, useReducedMotion, useTheme } from '@/theme';

export type SetRowProps = {
  set: LoggedSet;
  /** Ordinal within its own kind. */
  number: number;
  unit: Unit;
  current: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

/**
 * One logged set. Grey while it waits, lime the moment it is done — the only
 * place in the session where a row changes colour on its own.
 */
export function SetRow({ set, number, unit, current, onPress, onLongPress }: SetRowProps) {
  const { c, radius, space } = useTheme();
  const reduced = useReducedMotion();

  const pop = useSharedValue(0);
  const wasDone = useSharedValue(set.done ? 1 : 0);

  useEffect(() => {
    if (set.done && wasDone.value === 0) {
      pop.value = withSequence(
        withTiming(1, { duration: ms(dur.fast, reduced) }),
        withTiming(0, { duration: ms(dur.base, reduced) }),
      );
    }
    wasDone.value = set.done ? 1 : 0;
  }, [pop, reduced, set.done, wasDone]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pop.value * 0.02 }] }));

  const warmup = set.kind === 'warmup';
  const bg = set.done ? c.accentSoft : current ? c.surfaceAlt : 'transparent';
  const border = current && !set.done ? c.borderStrong : c.border;
  const label = warmup ? 'W' : String(number);

  const detail = warmup ? 'Warm-up' : set.kind === 'drop' ? 'Drop' : set.kind === 'failure' ? 'Failure' : null;

  return (
    <Animated.View style={anim}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Set ${label}, ${fmtWeightValue(set.weight, unit)} ${unitLabel(unit)} for ${set.reps} reps${set.done ? ', done' : ''}`}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => ({
          minHeight: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingHorizontal: space.md,
          borderRadius: radius.md,
          borderWidth: hairline,
          borderColor: set.done ? 'transparent' : border,
          backgroundColor: bg,
          opacity: pressed ? 0.85 : 1,
        })}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: set.done ? 'transparent' : c.surfaceAlt,
            borderWidth: set.done ? 0 : hairline,
            borderColor: c.border,
          }}>
          <Text variant="small" numeric tone={set.done ? 'muted' : warmup ? 'faint' : 'muted'} weight="700">
            {label}
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
          <Text variant="h2" numeric tone={set.done ? 'default' : current ? 'default' : 'muted'}>
            {set.weight === 0 ? '—' : fmtWeightValue(set.weight, unit)}
          </Text>
          <Text variant="small" tone="faint">
            {set.weight === 0 ? 'body' : unitLabel(unit)}
          </Text>
          <Text variant="h2" numeric tone={set.done ? 'default' : current ? 'default' : 'muted'}>
            {`× ${set.reps}`}
          </Text>
          {set.side ? (
            <Text variant="small" tone="faint" weight="700">
              {set.side}
            </Text>
          ) : null}
        </View>

        {set.rpe !== null ? (
          <Text variant="small" numeric tone="faint">
            {`RPE ${set.rpe}`}
          </Text>
        ) : detail ? (
          <Text variant="small" tone="faint">
            {detail}
          </Text>
        ) : null}

        <View style={{ width: 24, alignItems: 'flex-end' }}>
          {set.done ? (
            <Check size={20} color={c.accent} strokeWidth={2.4} />
          ) : (
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: radius.pill,
                borderWidth: hairline,
                borderColor: current ? c.borderStrong : c.border,
              }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
