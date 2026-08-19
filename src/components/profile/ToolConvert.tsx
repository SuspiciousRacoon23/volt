import React, { useState } from 'react';
import { View } from 'react-native';

import { Card, Segmented, Stepper, Text } from '@/components/kit';
import { ArrowRight } from '@/icons';
import { kgToLb, lbToKg, trimNumber } from '@/lib';
import { useTheme } from '@/theme';

const DIRECTIONS = [
  { value: 'kg' as const, label: 'kg to lb' },
  { value: 'lb' as const, label: 'lb to kg' },
];

/** Two units, one number, no ambiguity about which way round it went. */
export function ToolConvert(): React.JSX.Element {
  const { c, space } = useTheme();
  const [from, setFrom] = useState<'kg' | 'lb'>('kg');
  const [value, setValue] = useState(100);

  const converted = from === 'kg' ? kgToLb(value) : lbToKg(value);
  const fromLabel = from;
  const toLabel = from === 'kg' ? 'lb' : 'kg';

  return (
    <View style={{ gap: space.lg }}>
      <Segmented items={DIRECTIONS} value={from} onChange={setFrom} />

      <Stepper
        label={`Weight in ${fromLabel}`}
        value={value}
        onChange={setValue}
        step={from === 'kg' ? 2.5 : 5}
        min={0}
        max={1000}
        size="lg"
        formatValue={(v) => `${trimNumber(v, 2)} ${fromLabel}`}
      />

      <Card tone="plain">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.lg,
            paddingVertical: space.md,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text variant="h1" numeric>
              {trimNumber(value, 2)}
            </Text>
            <Text variant="small" tone="faint">
              {fromLabel}
            </Text>
          </View>
          <ArrowRight size={22} color={c.textFaint} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="title" numeric>
              {trimNumber(converted, 2)}
            </Text>
            <Text variant="small" tone="faint">
              {toLabel}
            </Text>
          </View>
        </View>
      </Card>

      <Text variant="small" tone="faint">
        One kilogram is 2.2046 pounds. Gym plates round differently in each
        system, so a converted number is rarely a loadable one.
      </Text>
    </View>
  );
}
