import React from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/kit';
import { dayLabel, startOfDay, startOfWeek } from '@/lib';
import { hairline, useTheme } from '@/theme';

export type WeekStripProps = {
  /** Start-of-day timestamps of every completed session this week. */
  completedDays: number[];
  /** Weekday index (0=Sun) → true when a routine is scheduled. */
  scheduled: Record<number, boolean>;
  /** Sessions the user is aiming for this week. 0 hides the count. */
  weeklyGoal: number;
};

const DOT = 34;

/** Seven dots, Monday first. Filled means the work is done. */
export function WeekStrip({ completedDays, scheduled, weeklyGoal }: WeekStripProps) {
  const { c, radius, space } = useTheme();
  const weekStart = startOfWeek(Date.now());
  const today = startOfDay(Date.now());
  const done = new Set(completedDays);
  const count = done.size;

  const days = Array.from({ length: 7 }, (_, i) => weekStart + i * 86_400_000);

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: space.lg,
        }}
      >
        <Text variant="label" tone="faint">
          This week
        </Text>
        <Text variant="small" tone="muted" numeric weight="600">
          {weeklyGoal > 0 ? `${count} of ${weeklyGoal}` : `${count} logged`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {days.map((ts) => {
          const isDone = done.has(ts);
          const isToday = ts === today;
          const isPlanned = scheduled[new Date(ts).getDay()] === true;
          const future = ts > today;

          return (
            <View key={ts} style={{ alignItems: 'center', gap: space.sm, minWidth: 36 }}>
              <View
                accessibilityLabel={`${dayLabel(ts, true)}: ${isDone ? 'trained' : 'not trained'}`}
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone ? c.accent : isPlanned && !future ? c.surfaceAlt : 'transparent',
                  borderWidth: isToday ? 2 : hairline,
                  borderColor: isToday ? c.borderStrong : isDone ? c.accent : c.border,
                }}
              >
                {isPlanned && !isDone ? (
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: radius.pill,
                      backgroundColor: future ? c.textFaint : c.textMuted,
                    }}
                  />
                ) : null}
              </View>
              <Text
                variant="label"
                tone={isToday ? 'default' : 'faint'}
                style={{ letterSpacing: 0.6 }}
              >
                {dayLabel(ts).slice(0, 1)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
