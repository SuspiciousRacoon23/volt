import React from 'react';
import { ScrollView, View } from 'react-native';

import type { ID, Routine, Schedule } from '@/data/types';
import { DAY_MS, dayLabel, isoWeek } from '@/lib/dates';
import { hairline, useTheme } from '@/theme';
import { Chip, Sheet, Text } from '@/components/kit';

export type ScheduleSheetProps = {
  visible: boolean;
  onClose: () => void;
  schedule: Schedule;
  routines: Routine[];
  onAssign: (day: number, routineId: ID | null) => void;
  onToggleDeload: (weekKey: string) => void;
};

/** Monday first — the week as people actually plan it. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/**
 * The whole week on one screen: seven rows, each either a routine or rest, plus
 * the deload switch for this week and next.
 */
export function ScheduleSheet({
  visible, onClose, schedule, routines, onAssign, onToggleDeload,
}: ScheduleSheetProps) {
  const { c, space } = useTheme();

  const thisWeek = isoWeek(Date.now());
  const nextWeek = isoWeek(Date.now() + 7 * DAY_MS);
  const isDeload = (w: string) => schedule.deloadWeeks.includes(w);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Weekly schedule"
      subtitle="Assign a routine to each day, or leave it as rest."
    >
      <View style={{ gap: space.lg }}>
        {WEEK_ORDER.map((day, i) => {
          const assigned = schedule.byDay[day] ?? null;
          return (
            <View
              key={day}
              style={{
                gap: space.sm,
                paddingTop: i === 0 ? 0 : space.md,
                borderTopWidth: i === 0 ? 0 : hairline,
                borderTopColor: c.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
                <Text variant="h2">{dayLabel(day, true)}</Text>
                <Text variant="small" tone="faint">
                  {assigned ? routines.find((r) => r.id === assigned)?.name ?? 'Rest' : 'Rest'}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: space.sm, paddingRight: space.lg }}
              >
                <Chip
                  label="Rest"
                  selected={assigned === null}
                  onPress={() => onAssign(day, null)}
                />
                {routines.map((r) => (
                  <Chip
                    key={r.id}
                    label={r.name}
                    selected={assigned === r.id}
                    onPress={() => onAssign(day, r.id)}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}

        <View
          style={{
            gap: space.sm,
            paddingTop: space.lg,
            borderTopWidth: hairline,
            borderTopColor: c.border,
          }}
        >
          <Text variant="h2">Deload</Text>
          <Text variant="small" tone="muted">
            A marked week tells you to hold load and cut volume. Nothing is changed for you.
          </Text>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingTop: space.xs }}>
            <Chip
              label="This week"
              selected={isDeload(thisWeek)}
              onPress={() => onToggleDeload(thisWeek)}
            />
            <Chip
              label="Next week"
              selected={isDeload(nextWeek)}
              onPress={() => onToggleDeload(nextWeek)}
            />
          </View>
        </View>
      </View>
    </Sheet>
  );
}
