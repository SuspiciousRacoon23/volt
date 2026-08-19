import React from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import type { Exercise, GroupKind, PlannedExercise, PlannedSet, SetKind, Unit } from '@/data/types';
import { Drag, More, Note, Plus, Rest } from '@/icons';
import { fmtClock } from '@/lib/dates';
import { hairline, useTheme } from '@/theme';
import { Button, Chip, IconButton, Text } from '@/components/kit';

import type { DragBinding } from './DragList';
import { SetRow } from './SetRow';
import { titleCase, type GroupPosition } from './plannerUtils';

export type BuilderCardProps = {
  pe: PlannedExercise;
  exercise: Exercise | undefined;
  unit: Unit;
  drag: DragBinding;
  groupPos: GroupPosition;
  groupKind: GroupKind | null;
  expandedSetId: string | null;
  onToggleSet: (setId: string) => void;
  onSetChange: (setId: string, patch: Partial<PlannedSet>) => void;
  onSetRemove: (setId: string) => void;
  onAddSet: (kind: SetKind) => void;
  onOpenRest: () => void;
  onOpenActions: () => void;
};

function subtitleFor(exercise: Exercise | undefined): string {
  if (!exercise) return 'Exercise no longer in your library';
  const muscles = exercise.primary.map(titleCase).join(', ');
  return `${titleCase(exercise.equipment)} · ${muscles}`;
}

/**
 * One exercise in the builder. It reads as a card you can pick up: a handle on
 * the left, the sets stacked inside it, and everything else behind one menu.
 */
export function BuilderCard({
  pe, exercise, unit, drag, groupPos, groupKind, expandedSetId,
  onToggleSet, onSetChange, onSetRemove, onAddSet, onOpenRest, onOpenActions,
}: BuilderCardProps) {
  const { c, radius, space, shadow } = useTheme();

  const grouped = groupPos !== 'none';
  const hasWorking = pe.sets.some((s) => s.kind !== 'warmup');

  let workingCount = 0;
  const rows = pe.sets.map((set) => {
    const number = set.kind === 'working' ? (workingCount += 1) : null;
    return { set, number };
  });

  return (
    <View>
      {grouped && (groupPos === 'first' || groupPos === 'only') ? (
        <Text variant="label" tone="faint" style={{ marginBottom: space.xs, marginLeft: space.lg }}>
          {groupKind === 'circuit' ? 'Circuit' : 'Superset'}
        </Text>
      ) : null}

      <View>
        {grouped ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              top: groupPos === 'first' || groupPos === 'only' ? 2 : -10,
              bottom: groupPos === 'last' || groupPos === 'only' ? 2 : -10,
              width: 3,
              borderRadius: 2,
              backgroundColor: c.accent,
            }}
          />
        ) : null}

        <View
          style={[
            drag.dragging ? shadow.lifted : shadow.card,
            {
              marginLeft: grouped ? space.md : 0,
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              borderWidth: hairline,
              borderColor: drag.dragging ? c.borderStrong : c.border,
              padding: space.lg,
              gap: space.md,
            },
          ]}
        >
          {/* header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
            <GestureDetector gesture={drag.gesture}>
              <View
                accessibilityRole="adjustable"
                accessibilityLabel={`Reorder ${exercise?.name ?? 'exercise'}. Press and hold, then drag.`}
                style={{
                  width: 44,
                  height: 44,
                  marginLeft: -space.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Drag size={20} color={drag.dragging ? c.text : c.textFaint} />
              </View>
            </GestureDetector>

            <View style={{ flex: 1, gap: 2, paddingTop: 2 }}>
              <Text variant="h2" numberOfLines={2}>
                {exercise?.name ?? 'Unknown exercise'}
              </Text>
              <Text variant="small" tone="faint" numberOfLines={1}>
                {subtitleFor(exercise)}
              </Text>
            </View>

            <IconButton
              icon={More}
              label={`Options for ${exercise?.name ?? 'this exercise'}`}
              variant="plain"
              onPress={onOpenActions}
            />
          </View>

          {/* rest + note */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Chip
              icon={Rest}
              size="sm"
              label={`${fmtClock(pe.restSec)} rest`}
              onPress={onOpenRest}
            />
            <Chip
              icon={Note}
              size="sm"
              label={pe.notes ? 'Note added' : 'Add a note'}
              onPress={onOpenRest}
            />
          </View>

          {pe.notes ? (
            <Text variant="small" tone="muted" numberOfLines={3}>
              {pe.notes}
            </Text>
          ) : null}

          {/* sets */}
          <View style={{ borderTopWidth: hairline, borderTopColor: c.border, paddingTop: space.xs }}>
            {rows.map(({ set, number }, i) => (
              <View
                key={set.id}
                style={
                  i === 0
                    ? undefined
                    : { borderTopWidth: hairline, borderTopColor: c.border }
                }
              >
                <SetRow
                  set={set}
                  number={number}
                  unit={unit}
                  expanded={expandedSetId === set.id}
                  canRemove={pe.sets.length > 1}
                  onToggle={() => onToggleSet(set.id)}
                  onChange={(patch) => onSetChange(set.id, patch)}
                  onRemove={() => onSetRemove(set.id)}
                />
              </View>
            ))}
          </View>

          {/* add */}
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button
              label="Warm-up"
              variant="ghost"
              size="sm"
              icon={Plus}
              style={{ flex: 1 }}
              onPress={() => onAddSet('warmup')}
            />
            <Button
              label="Set"
              variant="secondary"
              size="sm"
              icon={Plus}
              style={{ flex: 1 }}
              onPress={() => onAddSet('working')}
            />
            {hasWorking ? (
              <Button
                label="Drop"
                variant="ghost"
                size="sm"
                icon={Plus}
                style={{ flex: 1 }}
                onPress={() => onAddSet('drop')}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
