import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Chip, IconButton, Text } from '@/components/kit';
import type { Exercise, LoggedExercise, Unit } from '@/data/types';
import { ChevronRight, Clock, ExerciseFigure, Note, Plus, Swap, Trash, figureFor } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { SetRow } from './SetRow';
import { setOrdinal } from './format';

export type ExercisePaneProps = {
  width: number;
  logged: LoggedExercise;
  exercise: Exercise | undefined;
  index: number;
  total: number;
  unit: Unit;
  currentSetId: string | null;
  /** 'Last time: 80 kg × 8, 8, 7' — already formatted. */
  lastLine: string | null;
  perSide: boolean;
  bottomPad: number;
  onSelectSet: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
  onAddSet: () => void;
  onAddWarmup: () => void;
  onOpenNote: () => void;
  onOpenPrevious: () => void;
  onReplace: () => void;
  onTogglePerSide: () => void;
  onRemoveExercise: () => void;
};

/** One exercise, in focus. Everything about it is reachable without leaving. */
export function ExercisePane({
  width,
  logged,
  exercise,
  index,
  total,
  unit,
  currentSetId,
  lastLine,
  perSide,
  bottomPad,
  onSelectSet,
  onRemoveSet,
  onAddSet,
  onAddWarmup,
  onOpenNote,
  onOpenPrevious,
  onReplace,
  onTogglePerSide,
  onRemoveExercise,
}: ExercisePaneProps) {
  const { c, radius, space } = useTheme();

  const name = exercise?.name ?? 'Exercise';
  const figure = figureFor({
    movement: exercise?.movement ?? 'push',
    equipment: exercise?.equipment ?? 'other',
    name,
  });
  const meta = exercise ? [exercise.equipment, ...exercise.primary].join(' · ') : '';

  return (
    <ScrollView
      style={{ width }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: space.lg,
        paddingBottom: bottomPad,
        gap: space.lg,
      }}>
      <View style={{ gap: space.xs }}>
        <Text variant="label" tone="faint">
          {`Exercise ${index + 1} of ${total}`}
        </Text>
        <Text variant="title" numberOfLines={2}>
          {name}
        </Text>
        <Text variant="small" tone="faint">
          {meta}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.lg,
          padding: space.lg,
          borderRadius: radius.lg,
          backgroundColor: c.surface,
          borderWidth: hairline,
          borderColor: c.border,
        }}>
        <ExerciseFigure figure={figure} size={104} color={c.text} accent={c.textFaint} />
        <View style={{ flex: 1, gap: space.xs }}>
          <Text variant="label" tone="faint">
            Demonstration
          </Text>
          <Text variant="small" tone="muted">
            {exercise?.cues ?? exercise?.instructions[0] ?? 'Move under control through the full range.'}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous performance"
        onPress={onOpenPrevious}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          paddingHorizontal: space.md,
          borderRadius: radius.md,
          backgroundColor: pressed ? c.surfaceAlt : 'transparent',
          borderWidth: hairline,
          borderColor: c.border,
        })}>
        <Clock size={18} color={c.textFaint} />
        <Text variant="small" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
          {lastLine ? `Last time: ${lastLine}` : 'No previous record for this lift.'}
        </Text>
        <ChevronRight size={16} color={c.textFaint} />
      </Pressable>

      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="label" tone="faint" style={{ flex: 1 }}>
            Sets
          </Text>
          <IconButton icon={Note} label="Note for this exercise" variant="plain" size={44} iconSize={20} onPress={onOpenNote} />
          <IconButton icon={Swap} label="Replace this exercise" variant="plain" size={44} iconSize={20} onPress={onReplace} />
          <IconButton icon={Plus} label="Add a set" variant="plain" size={44} iconSize={20} onPress={onAddSet} />
        </View>

        <View style={{ gap: space.xs }}>
          {logged.sets.map((s) => (
            <SetRow
              key={s.id}
              set={s}
              number={setOrdinal(logged.sets, s.id)}
              unit={unit}
              current={s.id === currentSetId}
              onPress={() => onSelectSet(s.id)}
              onLongPress={() => onRemoveSet(s.id)}
            />
          ))}
        </View>

        <Text variant="small" tone="faint">
          Tap a set to edit it. Press and hold to remove it.
        </Text>
      </View>

      {logged.notes ? (
        <View
          style={{
            padding: space.md,
            borderRadius: radius.md,
            backgroundColor: c.surfaceAlt,
          }}>
          <Text variant="small" tone="muted">
            {logged.notes}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Chip label="Add warm-up" icon={Plus} onPress={onAddWarmup} />
        {exercise?.unilateral ? (
          <Chip label="Log left and right" selected={perSide} onPress={onTogglePerSide} />
        ) : null}
        <Chip label="Remove exercise" icon={Trash} onPress={onRemoveExercise} />
      </View>
    </ScrollView>
  );
}
