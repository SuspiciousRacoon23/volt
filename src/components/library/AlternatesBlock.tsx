import React from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/kit';
import type { Exercise } from '@/data/types';
import { ChevronRight, Swap } from '@/icons';
import { useTheme } from '@/theme';

import { metaLine } from './labels';

export type AlternatesBlockProps = {
  alternates: readonly Exercise[];
  onOpen: (id: string) => void;
};

export function AlternatesBlock({ alternates, onOpen }: AlternatesBlockProps) {
  const { c, space } = useTheme();
  if (!alternates.length) return null;

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Swap size={16} color={c.textFaint} strokeWidth={2} />
        <Text variant="label" tone="faint">
          Trains the same thing
        </Text>
      </View>

      <View style={{ gap: space.md }}>
        {alternates.map((a) => (
          <Card key={a.id} onPress={() => onOpen(a.id)} padding={space.lg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="h2" numberOfLines={1}>
                  {a.name}
                </Text>
                <Text variant="small" tone="muted" numberOfLines={1}>
                  {metaLine(a.equipment, a.primary)}
                </Text>
              </View>
              <ChevronRight size={18} color={c.textFaint} />
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
