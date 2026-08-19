import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/kit';
import { Streak } from '@/icons';
import { dateLabel, dayLabel } from '@/lib';
import { hairline, useTheme } from '@/theme';

export type TodayHeaderProps = {
  name: string;
  /** Days kept in a row. Pass null to hide the marker entirely. */
  streakDays: number | null;
};

/** Small, quiet, factual. The workout below is the loud part. */
export function TodayHeader({ name, streakDays }: TodayHeaderProps) {
  const { c, radius, space } = useTheme();
  const now = Date.now();
  const showStreak = streakDays !== null && streakDays > 0;

  return (
    <View
      style={{
        paddingHorizontal: space.xl,
        paddingTop: space.sm,
        paddingBottom: space.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space.md,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="h2" numberOfLines={1}>
          {name.trim() || 'Today'}
        </Text>
        <Text variant="small" tone="faint">
          {`${dayLabel(now, true)}, ${dateLabel(now)}`}
        </Text>
      </View>

      {showStreak ? (
        <View
          accessibilityLabel={`${streakDays} day streak`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.xs + 2,
            paddingHorizontal: space.md,
            height: 34,
            borderRadius: radius.pill,
            backgroundColor: c.surfaceAlt,
            borderWidth: hairline,
            borderColor: c.border,
          }}
        >
          <Streak size={16} color={c.textMuted} strokeWidth={1.75} />
          <Text variant="small" numeric weight="700">
            {streakDays}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
