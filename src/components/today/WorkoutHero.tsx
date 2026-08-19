import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/kit';
import { Bolt, Clock, Play, Target, type IconProps } from '@/icons';
import { hairline, useTheme } from '@/theme';
import { muscleLabel } from './muscles';
import type { MuscleGroup } from '@/data';

export type WorkoutHeroProps = {
  routineName: string;
  muscles: MuscleGroup[];
  minutes: number;
  sets: number;
  exercises: number;
  deload: boolean;
  /** True when a session is already open and this is a resume, not a start. */
  resuming: boolean;
  onStart: () => void;
  onOpenRoutine?: () => void;
};

/**
 * The loudest thing on the screen, and deliberately not a card: the routine
 * name in display type sitting directly on the page, then one lime button.
 * Launch to first set is one tap.
 */
export function WorkoutHero({
  routineName,
  muscles,
  minutes,
  sets,
  exercises,
  deload,
  resuming,
  onStart,
  onOpenRoutine,
}: WorkoutHeroProps) {
  const { c, radius, space } = useTheme();

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Text variant="label" tone="faint">
          {resuming ? 'In progress' : 'Today'}
        </Text>
        {deload ? (
          <View
            style={{
              paddingHorizontal: space.sm + 2,
              paddingVertical: 3,
              borderRadius: radius.sm,
              backgroundColor: c.surfaceAlt,
              borderWidth: hairline,
              borderColor: c.border,
            }}
          >
            <Text variant="label" tone="muted">
              Deload week
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        variant="display"
        numberOfLines={3}
        onPress={onOpenRoutine}
        suppressHighlighting
        style={{ marginTop: -space.xs }}
      >
        {routineName}
      </Text>

      {muscles.length ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Target size={16} color={c.textFaint} strokeWidth={1.75} />
          {muscles.map((m) => (
            <View
              key={m}
              style={{
                paddingHorizontal: space.md,
                paddingVertical: 5,
                borderRadius: radius.pill,
                backgroundColor: c.surfaceAlt,
              }}
            >
              <Text variant="small" tone="muted" weight="600">
                {muscleLabel(m)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Meta icon={Clock} text={`${minutes} min`} />
        <Meta icon={Bolt} text={`${sets} sets`} />
        <Meta icon={Target} text={`${exercises} exercises`} />
      </View>

      {deload ? (
        <Text variant="small" tone="muted">
          Deload week: targets are reduced. Keep loads near two thirds of usual and stop two reps
          short on every set.
        </Text>
      ) : null}

      <Button
        label={resuming ? 'Resume workout' : 'Start workout'}
        onPress={onStart}
        variant="primary"
        size="lg"
        icon={Play}
        fullWidth
        style={{ marginTop: space.xs }}
      />
    </View>
  );
}

function Meta({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<IconProps>;
  text: string;
}) {
  const { c, space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 }}>
      <Icon size={15} color={c.textFaint} strokeWidth={1.75} />
      <Text variant="small" tone="muted" numeric weight="600">
        {text}
      </Text>
    </View>
  );
}
