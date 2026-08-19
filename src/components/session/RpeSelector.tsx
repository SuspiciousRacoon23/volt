import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/kit';
import { select as hapticSelect } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

const OPTIONS: (number | null)[] = [null, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export type RpeSelectorProps = {
  value: number | null;
  onChange: (v: number | null) => void;
};

function rir(v: number): string {
  const left = 10 - v;
  if (left <= 0) return 'nothing left';
  if (left === 0.5) return 'half a rep left';
  return `${left} ${left === 1 ? 'rep' : 'reps'} left`;
}

/** Effort for the set. Optional, never blocking, and never coloured lime. */
export function RpeSelector({ value, onChange }: RpeSelectorProps) {
  const { c, radius, space } = useTheme();

  return (
    <View style={{ gap: space.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="label" tone="faint">
          Effort
        </Text>
        <Text variant="small" tone="faint">
          {value === null ? 'Optional' : rir(value)}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: space.sm, paddingRight: space.sm }}>
        {OPTIONS.map((opt) => {
          const on = value === opt;
          return (
            <Pressable
              key={opt === null ? 'none' : String(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={opt === null ? 'No effort rating' : `RPE ${opt}`}
              onPress={() => {
                hapticSelect();
                onChange(opt);
              }}
              style={{
                minWidth: 54,
                height: 44,
                paddingHorizontal: space.md,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                borderWidth: hairline,
                borderColor: on ? c.borderStrong : c.border,
                backgroundColor: on ? c.surfaceAlt : 'transparent',
              }}>
              <Text variant="body" numeric weight={on ? '700' : '500'} tone={on ? 'default' : 'muted'}>
                {opt === null ? '—' : String(opt)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
