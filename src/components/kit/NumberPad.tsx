import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ArrowLeft } from '@/icons';
import { press as hapticPress, tap as hapticTap } from '@/lib/haptics';
import { clamp } from '@/lib/num';
import { hairline, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export type NumberPadProps = {
  value: number;
  onSubmit: (value: number) => void;
  onCancel?: () => void;
  /** Suffix shown next to the entry, e.g. 'kg'. */
  unit?: string;
  allowDecimal?: boolean;
  min?: number;
  max?: number;
  /** One-tap offsets, e.g. [-2.5, 2.5, 5]. */
  quick?: number[];
  submitLabel?: string;
};

type Key = { k: string; label?: string };

/**
 * A big-key numeric entry pad. Deliberately not the OS keyboard: the keys are
 * 60pt tall so a number can be entered with one thumb, chalked or not.
 */
export function NumberPad({
  value,
  onSubmit,
  onCancel,
  unit,
  allowDecimal = true,
  min,
  max,
  quick,
  submitLabel = 'Set',
}: NumberPadProps) {
  const { c, radius, space } = useTheme();
  const [buffer, setBuffer] = useState<string>(() => {
    if (!Number.isFinite(value)) return '';
    return Number.isInteger(value) ? String(value) : String(value);
  });
  const [dirty, setDirty] = useState(false);

  const parsed = useMemo(() => {
    const n = Number(buffer);
    if (!buffer || !Number.isFinite(n)) return 0;
    return n;
  }, [buffer]);

  const bounded = useMemo(
    () => clamp(parsed, min ?? -Infinity, max ?? Infinity),
    [max, min, parsed],
  );

  const pushKey = useCallback(
    (k: string) => {
      hapticTap();
      setBuffer((prev) => {
        const base = dirty ? prev : '';
        if (k === '.') {
          if (!allowDecimal || base.includes('.')) return base;
          return base === '' ? '0.' : `${base}.`;
        }
        if (base === '0') return k;
        const next = `${base}${k}`;
        // Two decimal places is more than any gym needs.
        const [, dec] = next.split('.');
        if (dec && dec.length > 2) return base;
        if (next.replace('.', '').length > 6) return base;
        return next;
      });
      setDirty(true);
    },
    [allowDecimal, dirty],
  );

  const backspace = useCallback(() => {
    hapticTap();
    setDirty(true);
    setBuffer((prev) => (dirty ? prev.slice(0, -1) : ''));
  }, [dirty]);

  const bump = useCallback(
    (delta: number) => {
      hapticTap();
      setDirty(true);
      setBuffer((prev) => {
        const n = Number(dirty ? prev : String(value));
        const base = Number.isFinite(n) ? n : 0;
        const next = clamp(base + delta, min ?? -Infinity, max ?? Infinity);
        return String(Math.round(next * 100) / 100);
      });
    },
    [dirty, max, min, value],
  );

  const keys: Key[][] = [
    [{ k: '1' }, { k: '2' }, { k: '3' }],
    [{ k: '4' }, { k: '5' }, { k: '6' }],
    [{ k: '7' }, { k: '8' }, { k: '9' }],
    [{ k: allowDecimal ? '.' : '' }, { k: '0' }, { k: 'back' }],
  ];

  const display = dirty ? buffer || '0' : String(value);

  return (
    <View style={{ gap: space.lg }}>
      <View
        style={{
          alignItems: 'center',
          paddingVertical: space.lg,
          borderRadius: radius.lg,
          backgroundColor: c.surface,
          borderWidth: hairline,
          borderColor: c.border,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: space.sm,
        }}
      >
        <Text variant="title" numeric>
          {display}
        </Text>
        {unit ? (
          <Text variant="h2" tone="faint">
            {unit}
          </Text>
        ) : null}
      </View>

      {quick && quick.length ? (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {quick.map((q) => (
            <Pressable
              key={q}
              accessibilityRole="button"
              accessibilityLabel={`${q > 0 ? 'Add' : 'Subtract'} ${Math.abs(q)}`}
              onPress={() => bump(q)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.surfaceAlt,
              }}
            >
              <Text variant="small" weight="700" numeric tone="muted">
                {`${q > 0 ? '+' : ''}${q}`}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={{ gap: space.sm }}>
        {keys.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: space.sm }}>
            {row.map((key, ki) => {
              if (!key.k) return <View key={`sp-${ki}`} style={{ flex: 1 }} />;
              const isBack = key.k === 'back';
              return (
                <Pressable
                  key={key.k}
                  accessibilityRole="button"
                  accessibilityLabel={isBack ? 'Delete' : key.k}
                  onPress={() => (isBack ? backspace() : pushKey(key.k))}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 60,
                    borderRadius: radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? c.surfaceAlt : c.surface,
                    borderWidth: hairline,
                    borderColor: c.border,
                  })}
                >
                  {isBack ? (
                    <ArrowLeft size={22} color={c.textMuted} strokeWidth={2} />
                  ) : (
                    <Text variant="h1" numeric>
                      {key.k}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {onCancel ? (
          <View style={{ flex: 1 }}>
            <Button label="Cancel" variant="secondary" fullWidth onPress={onCancel} />
          </View>
        ) : null}
        <View style={{ flex: 1.4 }}>
          <Button
            label={submitLabel}
            variant="primary"
            fullWidth
            onPress={() => {
              hapticPress();
              onSubmit(dirty ? bounded : value);
            }}
          />
        </View>
      </View>
    </View>
  );
}
