import React from 'react';
import { View } from 'react-native';

import type { Exercise, ID, Routine } from '@/data/types';
import { More } from '@/icons';
import { dayLabel } from '@/lib/dates';
import { useTheme } from '@/theme';
import { Card, Chip, IconButton, Text } from '@/components/kit';

import { muscleCoverage, routineStats, titleCase } from './plannerUtils';

export type RoutineCardProps = {
  routine: Routine;
  exercises: Record<ID, Exercise>;
  /** Weekday indices this routine is scheduled on. */
  days: number[];
  onPress: () => void;
  onMore: () => void;
};

/** A routine at a glance: what it trains, how much of it, and when it runs. */
export function RoutineCard({ routine, exercises, days, onPress, onMore }: RoutineCardProps) {
  const { space } = useTheme();
  const stats = routineStats(routine);
  const coverage = muscleCoverage(routine, exercises);

  const meta = stats.exercises === 0
    ? 'Empty · add your first exercise'
    : `${stats.exercises} exercises · ${stats.workingSets} sets · ${stats.minutes} min`;

  const when = days.length
    ? days.map((d) => dayLabel(d)).join(' · ')
    : 'Not scheduled';

  return (
    <Card tone="raised" onPress={onPress} accessibilityLabel={`${routine.name}. ${meta}.`}>
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
          <View style={{ flex: 1, gap: space.xs }}>
            <Text variant="h1" numberOfLines={2}>{routine.name}</Text>
            <Text variant="small" tone="faint" numeric>{meta}</Text>
          </View>
          <IconButton
            icon={More}
            label={`Options for ${routine.name}`}
            variant="plain"
            onPress={onMore}
            style={{ marginTop: -6, marginRight: -8 }}
          />
        </View>

        {coverage.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {coverage.map((m) => (
              <Chip key={m.muscle} label={titleCase(m.muscle)} size="sm" count={m.sets} />
            ))}
          </View>
        ) : null}

        <Text variant="label" tone="faint">{when}</Text>
      </View>
    </Card>
  );
}
