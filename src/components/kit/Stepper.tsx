import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Minus, Plus } from '@/icons';
import { tap as hapticTap } from '@/lib/haptics';
import { clamp, roundTo, trimNumber } from '@/lib/num';
import { hairline, useTheme } from '@/theme';

import { NumberPad } from './NumberPad';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type StepperSize = 'sm' | 'md' | 'lg';

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Increment per tap. 2.5 for kg, 1 for reps. */
  step?: number;
  min?: number;
  max?: number;
  /** Suffix rendered next to the number — 'kg', 'reps', 's'. */
  unit?: string;
  /** Small uppercase caption above the control. */
  label?: string;
  size?: StepperSize;
  disabled?: boolean;
  /** Tap the number to open a big-key pad. Defaults to true. */
  editable?: boolean;
  /** Override the number formatting. */
  formatValue?: (v: number) => string;
  /** One-tap offsets shown in the pad. Defaults to ±step and ±(step × 4). */
  quickAdjust?: number[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

const HEIGHT: Record<StepperSize, number> = { sm: 48, md: 56, lg: 68 };

// Hold-to-repeat: a beat before it starts, then progressively faster.
const HOLD_DELAY = 360;
const intervalFor = (n: number): number => (n < 6 ? 130 : n < 14 ? 80 : n < 26 ? 52 : 36);
// Past a long hold, the increment coarsens so 100kg is reachable in one press.
const multiplierFor = (n: number): number => (n < 20 ? 1 : n < 34 ? 2 : 4);

/**
 * The control the user touches most. Huge targets, hold to run, and a big-key
 * pad behind the number for the rare direct entry. No OS keyboard, ever.
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  unit,
  label,
  size = 'md',
  disabled = false,
  editable = true,
  formatValue,
  quickAdjust,
  style,
  testID,
  accessibilityLabel,
}: StepperProps) {
  const { c, radius, space } = useTheme();
  const [padOpen, setPadOpen] = useState(false);

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reps = useRef(0);

  const commit = useCallback(
    (next: number, silent = false) => {
      const bounded = clamp(roundTo(next, step > 0 ? step : 0.01), min, max);
      if (bounded === valueRef.current) return;
      valueRef.current = bounded;
      if (!silent) hapticTap();
      onChange(bounded);
    },
    [max, min, onChange, step],
  );

  const applyDelta = useCallback(
    (dir: 1 | -1, n: number) => {
      commit(valueRef.current + dir * step * multiplierFor(n), n > 0 && n % 3 !== 0);
    },
    [commit, step],
  );

  const stopHold = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    reps.current = 0;
  }, []);

  const schedule = useCallback(
    (dir: 1 | -1) => {
      const n = reps.current;
      timer.current = setTimeout(() => {
        reps.current += 1;
        applyDelta(dir, reps.current);
        schedule(dir);
      }, intervalFor(n));
    },
    [applyDelta],
  );

  const startHold = useCallback(
    (dir: 1 | -1) => {
      if (disabled) return;
      stopHold();
      timer.current = setTimeout(() => {
        reps.current = 1;
        applyDelta(dir, 1);
        schedule(dir);
      }, HOLD_DELAY);
    },
    [applyDelta, disabled, schedule, stopHold],
  );

  useEffect(() => stopHold, [stopHold]);

  const height = HEIGHT[size];
  const glyph = size === 'lg' ? 26 : size === 'md' ? 22 : 20;
  const shown = formatValue ? formatValue(value) : trimNumber(value, 2);

  const valueVariant =
    shown.length >= 6 ? 'h2' : shown.length >= 4 ? 'h1' : size === 'lg' ? 'title' : 'h1';

  const atMin = value <= min;
  const atMax = value >= max;

  const arrow = (dir: 1 | -1) => {
    const Icon = dir === 1 ? Plus : Minus;
    const blocked = disabled || (dir === 1 ? atMax : atMin);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dir === 1 ? 'Increase' : 'Decrease'}
        disabled={blocked}
        onPress={() => applyDelta(dir, 0)}
        onPressIn={() => startHold(dir)}
        onPressOut={stopHold}
        style={({ pressed }) => ({
          width: 46,
          height: height - 8,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          backgroundColor: pressed && !blocked ? c.surfaceAlt : 'transparent',
          opacity: blocked ? 0.3 : 1,
        })}
      >
        <Icon size={glyph} color={c.text} strokeWidth={2.25} />
      </Pressable>
    );
  };

  const quick = quickAdjust ?? [-step * 4, -step, step, step * 4];

  return (
    <View style={style} testID={testID}>
      {label ? (
        <Text variant="label" tone="faint" style={{ marginBottom: space.sm }}>
          {label}
        </Text>
      ) : null}

      <View
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityValue={{ text: `${shown}${unit ? ` ${unit}` : ''}` }}
        style={{
          height,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          borderRadius: radius.lg,
          backgroundColor: c.surface,
          borderWidth: hairline,
          borderColor: c.border,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {arrow(-1)}

        <Pressable
          disabled={disabled || !editable}
          accessibilityRole={editable ? 'button' : undefined}
          accessibilityLabel={editable ? `Edit ${label ?? 'value'}` : undefined}
          onPress={() => {
            hapticTap();
            setPadOpen(true);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 3,
            paddingHorizontal: 2,
          }}
        >
          <Text variant={valueVariant} numeric>
            {shown}
          </Text>
          {unit ? (
            <Text variant="small" tone="faint" weight="700">
              {unit}
            </Text>
          ) : null}
        </Pressable>

        {arrow(1)}
      </View>

      {editable ? (
        <Sheet
          visible={padOpen}
          onClose={() => setPadOpen(false)}
          title={label ?? 'Enter a value'}
          subtitle={unit ? `In ${unit}` : undefined}
          scrollable={false}
        >
          <NumberPad
            value={value}
            unit={unit}
            min={min}
            max={max}
            quick={quick}
            allowDecimal={step % 1 !== 0}
            onCancel={() => setPadOpen(false)}
            onSubmit={(v) => {
              setPadOpen(false);
              commit(v);
            }}
          />
        </Sheet>
      ) : null}
    </View>
  );
}
