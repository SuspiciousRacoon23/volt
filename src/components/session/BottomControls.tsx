import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Stepper, Text, usePressAnim } from '@/components/kit';
import type { Unit } from '@/data/types';
import { Check } from '@/icons';
import { success as hapticSuccess } from '@/lib/haptics';
import { displayWeight, toKg, unitLabel } from '@/lib/units';
import { useTheme } from '@/theme';

import { RpeSelector } from './RpeSelector';

export type BottomControlsProps = {
  unit: Unit;
  weightKg: number;
  reps: number;
  rpe: number | null;
  onWeight: (kg: number) => void;
  onReps: (reps: number) => void;
  onRpe: (rpe: number | null) => void;
  /** Set when the exercise is being logged one side at a time. */
  side: 'L' | 'R' | null;
  doneLabel: string;
  summary: string;
  onDone: () => void;
  disabled?: boolean;
};

/**
 * The thumb zone. Everything here is reachable one-handed and nothing here
 * needs the keyboard.
 */
export function BottomControls({
  unit,
  weightKg,
  reps,
  rpe,
  onWeight,
  onReps,
  onRpe,
  side,
  doneLabel,
  summary,
  onDone,
  disabled = false,
}: BottomControlsProps) {
  const { c, radius, space } = useTheme();
  const pressAnim = usePressAnim(0.985);

  const step = unit === 'lb' ? 5 : 2.5;

  const handleDone = useCallback(() => {
    if (disabled) return;
    hapticSuccess();
    onDone();
  }, [disabled, onDone]);

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1.15 }}>
          <Stepper
            value={displayWeight(weightKg, unit)}
            onChange={(v) => onWeight(toKg(v, unit))}
            step={step}
            min={0}
            max={unit === 'lb' ? 1500 : 700}
            unit={unitLabel(unit)}
            label={side ? `Weight · ${side === 'L' ? 'left' : 'right'}` : 'Weight'}
            size="lg"
            disabled={disabled}
            accessibilityLabel="Weight"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Stepper
            value={reps}
            onChange={onReps}
            step={1}
            min={0}
            max={100}
            label="Reps"
            size="lg"
            disabled={disabled}
            accessibilityLabel="Reps"
          />
        </View>
      </View>

      <RpeSelector value={rpe} onChange={onRpe} />

      <Animated.View style={pressAnim.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${doneLabel}, ${summary}`}
          disabled={disabled}
          onPress={handleDone}
          onPressIn={pressAnim.onPressIn}
          onPressOut={pressAnim.onPressOut}
          style={({ pressed }) => ({
            height: 68,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            paddingHorizontal: space.xl,
            borderRadius: radius.lg,
            backgroundColor: c.accent,
            opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          })}>
          <Check size={22} color={c.accentInk} strokeWidth={2.4} />
          <Text variant="h2" tone="onAccent" uppercase style={{ letterSpacing: 1.2 }}>
            {doneLabel}
          </Text>
          <View style={{ flex: 1 }} />
          <Text variant="body" numeric tone="onAccent" weight="700">
            {summary}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
