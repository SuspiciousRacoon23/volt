import React from 'react';
import { Pressable, View } from 'react-native';

import type { ID, Routine, Schedule } from '@/data/types';
import { dayLabel, isoWeek } from '@/lib/dates';
import { hairline, useTheme } from '@/theme';
import { Text } from '@/components/kit';

import { abbreviate } from './plannerUtils';
import { WEEK_ORDER } from './ScheduleSheet';

export type WeekStripProps = {
  schedule: Schedule;
  routines: Record<ID, Routine>;
  onPress: () => void;
};

/** The training week in one row. Tap it to change any day. */
export function WeekStrip({ schedule, routines, onPress }: WeekStripProps) {
  const { c, radius, space } = useTheme();
  const today = new Date().getDay();
  const deload = schedule.deloadWeeks.includes(isoWeek(Date.now()));

  const trainingDays = WEEK_ORDER.filter((d) => schedule.byDay[d]).length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Edit the weekly schedule"
      onPress={onPress}
      style={({ pressed }) => ({
        gap: space.md,
        padding: space.lg,
        borderRadius: radius.lg,
        borderWidth: hairline,
        borderColor: c.border,
        backgroundColor: c.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="label" tone="faint">This week</Text>
        <Text variant="small" tone="muted">
          {deload ? 'Deload week' : `${trainingDays} training days`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: space.xs }}>
        {WEEK_ORDER.map((day) => {
          const routine = schedule.byDay[day] ? routines[schedule.byDay[day] as ID] : null;
          const isToday = day === today;
          return (
            <View key={day} style={{ flex: 1, alignItems: 'center', gap: space.xs }}>
              <Text variant="label" tone={isToday ? 'accent' : 'faint'}>
                {dayLabel(day).slice(0, 1)}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 46,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.sm,
                  backgroundColor: routine ? c.surfaceAlt : 'transparent',
                  borderWidth: isToday ? 1.5 : hairline,
                  borderColor: isToday ? c.accent : routine ? 'transparent' : c.border,
                }}
              >
                <Text
                  variant="small"
                  weight="700"
                  tone={routine ? 'default' : 'faint'}
                  numberOfLines={1}
                >
                  {routine ? abbreviate(routine.name) : '—'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
