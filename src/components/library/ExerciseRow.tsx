import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Sparkline, Text } from '@/components/kit';
import type { Exercise, Unit } from '@/data/types';
import { ChevronRight, StarFilled } from '@/icons';
import { fmtWeight } from '@/lib';
import { useTheme } from '@/theme';

import { metaLine } from './labels';
import type { ExerciseStat } from './stats';

export type ExerciseRowProps = {
  exercise: Exercise;
  stat?: ExerciseStat;
  unit: Unit;
  onOpen: (id: string) => void;
};

function Row({ exercise, stat, unit, onOpen }: ExerciseRowProps) {
  const { c, space } = useTheme();
  const trend = stat && stat.points.length >= 2 ? stat.points : null;

  return (
    <Pressable
      onPress={() => onOpen(exercise.id)}
      accessibilityRole="button"
      accessibilityLabel={exercise.name}
      style={({ pressed }) => ({
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 }}>
          <Text variant="h2" numberOfLines={1} style={{ flexShrink: 1 }}>
            {exercise.name}
          </Text>
          {exercise.favourite ? <StarFilled size={13} color={c.textMuted} /> : null}
        </View>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {metaLine(exercise.equipment, exercise.primary)}
          {exercise.custom ? ' · Custom' : ''}
        </Text>
      </View>

      {stat ? (
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {trend ? <Sparkline data={trend} width={52} height={20} tone="muted" /> : null}
          <Text variant="small" tone="faint" numeric>
            {stat.bestWeight > 0
              ? `${fmtWeight(stat.bestWeight, unit)} × ${stat.bestReps}`
              : `${stat.sessions} sessions`}
          </Text>
        </View>
      ) : null}

      <ChevronRight size={18} color={c.textFaint} />
    </Pressable>
  );
}

export const ExerciseRow = memo(Row);
