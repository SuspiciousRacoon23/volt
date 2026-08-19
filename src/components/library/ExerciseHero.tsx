import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Divider, Text } from '@/components/kit';
import type { Exercise } from '@/data/types';
import { ExerciseFigure, figureFor } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { EQUIPMENT_LABEL, MOVEMENT_LABEL } from './labels';

export type ExerciseHeroProps = { exercise: Exercise };

/** The demonstration figure and the one line to hold in your head. */
export function ExerciseHero({ exercise }: ExerciseHeroProps) {
  const { c, radius, space } = useTheme();

  const figure = useMemo(
    () =>
      figureFor({
        movement: exercise.movement,
        equipment: exercise.equipment,
        name: exercise.name,
      }),
    [exercise.equipment, exercise.movement, exercise.name],
  );

  const facts = [
    EQUIPMENT_LABEL[exercise.equipment],
    MOVEMENT_LABEL[exercise.movement],
    exercise.unilateral ? 'One side at a time' : 'Both sides',
  ];

  return (
    <View
      style={{
        borderRadius: radius.lg,
        backgroundColor: c.surface,
        borderWidth: hairline,
        borderColor: c.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: space.xl,
          backgroundColor: c.surfaceAlt,
        }}
      >
        <ExerciseFigure figure={figure} size={168} color={c.text} accent={c.textFaint} />
      </View>

      <View style={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {facts.map((f, i) => (
            <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              {i > 0 ? <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: c.textFaint }} /> : null}
              <Text variant="small" tone="muted">
                {f}
              </Text>
            </View>
          ))}
        </View>

        {exercise.cues ? (
          <>
            <Divider />
            <View style={{ gap: space.xs }}>
              <Text variant="label" tone="faint">
                Cue
              </Text>
              <Text variant="h2">{exercise.cues}</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
