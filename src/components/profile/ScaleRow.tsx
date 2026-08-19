import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/kit';
import type { IconProps } from '@/icons';
import { select as hapticSelect } from '@/lib/haptics';
import { useTheme } from '@/theme';

export type ScaleRowProps = {
  icon: React.ComponentType<IconProps>;
  label: string;
  /** Five words, index 0 = answer 1. */
  descriptors: readonly string[];
  value: number;
  onChange: (v: number) => void;
};

const VALUES = [1, 2, 3, 4, 5];

/**
 * One tap, five choices, no slider. The word under the label is the answer in
 * plain language so the number never has to be decoded.
 */
export function ScaleRow({
  icon: Icon,
  label,
  descriptors,
  value,
  onChange,
}: ScaleRowProps): React.JSX.Element {
  const { c, space, radius } = useTheme();

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Icon size={20} color={c.textMuted} />
        <Text variant="h2" style={{ flex: 1 }}>
          {label}
        </Text>
        <Text variant="small" tone="muted">
          {descriptors[value - 1] ?? ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {VALUES.map((v) => {
          const on = v === value;
          return (
            <Pressable
              key={v}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${label}: ${descriptors[v - 1] ?? v}`}
              onPress={() => {
                hapticSelect();
                onChange(v);
              }}
              style={({ pressed }) => ({
                flex: 1,
                height: 52,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? c.text : c.surfaceAlt,
                opacity: pressed && !on ? 0.7 : 1,
              })}
            >
              <Text
                variant="h2"
                numeric
                color={on ? c.bg : c.textFaint}
              >
                {v}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
