import React from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/kit';
import { Calendar, ChevronRight } from '@/icons';
import { dayLabel } from '@/lib';
import { useTheme } from '@/theme';

export type NextUpCardProps = {
  /** Weekday index, 0 = Sunday. */
  day: number;
  routineName: string;
  minutes: number;
  onPress: () => void;
};

/** What the week asks for next, so the rest of today has a shape. */
export function NextUpCard({ day, routineName, minutes, onPress }: NextUpCardProps) {
  const { c, space } = useTheme();

  return (
    <Card tone="flat" onPress={onPress} accessibilityLabel={`Next: ${routineName} on ${dayLabel(day, true)}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 }}>
        <Calendar size={20} color={c.textFaint} strokeWidth={1.75} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" tone="faint">
            {`Next · ${dayLabel(day, true)}`}
          </Text>
          <Text variant="body" weight="700" numberOfLines={1}>
            {routineName}
          </Text>
        </View>
        <Text variant="small" tone="faint" numeric>
          {`${minutes} min`}
        </Text>
        <ChevronRight size={18} color={c.textFaint} strokeWidth={1.75} />
      </View>
    </Card>
  );
}
