import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Chip, Text } from '@/components/kit';
import type { MuscleGroup } from '@/data/types';
import { BodyMap } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { MUSCLE_LABEL } from './labels';

export type MuscleBlockProps = {
  primary: readonly MuscleGroup[];
  secondary: readonly MuscleGroup[];
};

export function MuscleBlock({ primary, secondary }: MuscleBlockProps) {
  const { c, radius, space } = useTheme();

  const heat = useMemo(() => {
    const out: Partial<Record<MuscleGroup, number>> = {};
    for (const m of secondary) out[m] = 0.45;
    return out;
  }, [secondary]);

  const selected = useMemo(() => [...primary], [primary]);

  return (
    <View style={{ gap: space.lg }}>
      <Text variant="label" tone="faint">
        Muscles worked
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {primary.map((m) => (
          <Chip key={m} label={MUSCLE_LABEL[m]} size="sm" selected />
        ))}
        {secondary.map((m) => (
          <Chip key={m} label={MUSCLE_LABEL[m]} size="sm" />
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: space.xxl,
          paddingVertical: space.xl,
          borderRadius: radius.lg,
          backgroundColor: c.surface,
          borderWidth: hairline,
          borderColor: c.border,
        }}
      >
        {(['front', 'back'] as const).map((side) => (
          <View key={side} style={{ alignItems: 'center', gap: space.sm }}>
            <BodyMap
              side={side}
              size={192}
              selected={selected}
              heat={heat}
              active={c.text}
              base={c.surfaceAlt}
              border={c.border}
              color={c.textFaint}
            />
            <Text variant="label" tone="faint">
              {side}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="small" tone="faint">
        Solid is primary. Shaded is assisting.
      </Text>
    </View>
  );
}
