import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useActions, useStore } from '@/data/store';
import type { GroupKind, ID, PlannedSet, Routine, SetKind } from '@/data/types';
import { Barbell, ChevronLeft, Plus } from '@/icons';
import { press as hapticPress } from '@/lib/haptics';
import { useTheme } from '@/theme';
import { Button, Confirm, EmptyState, IconButton, Screen, Text } from '@/components/kit';
import {
  BuilderCard, DragList, ExerciseActionsSheet, ExercisePickerSheet, RestNotesSheet,
  addExercise, addSetAt, duplicateExerciseAt, groupKindAt, groupPosition, groupWithNext,
  moveExercise, removeExerciseAt, removeSet, replaceExerciseAt, routineStats, setGroupKindAt,
  ungroupAt, updateSet,
} from '@/components/planner';

type PickerMode = { kind: 'add' } | { kind: 'replace'; index: number };

/**
 * The visual routine builder. Everything here writes straight through to the
 * store, so there is no save button and nothing to lose.
 */
export default function RoutineBuilderScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useStore();
  const { saveRoutine, startSession } = useActions();
  const { space } = useTheme();

  const routine = typeof id === 'string' ? state.routines[id] : undefined;

  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [actionsIndex, setActionsIndex] = useState<number | null>(null);
  const [restIndex, setRestIndex] = useState<number | null>(null);
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  const update = useCallback(
    (fn: (r: Routine) => Routine) => {
      if (!routine) return;
      saveRoutine(fn(routine));
    },
    [routine, saveRoutine],
  );

  const keys = useMemo(() => (routine?.exercises ?? []).map((pe) => pe.id), [routine?.exercises]);

  const onReorder = useCallback(
    (from: number, to: number) => update((r) => moveExercise(r, from, to)),
    [update],
  );

  const onPick = useCallback(
    (exerciseId: ID) => {
      const mode = picker;
      setPicker(null);
      if (!mode) return;
      if (mode.kind === 'add') {
        update((r) => addExercise(r, exerciseId, state.settings.defaultRestSec));
      } else {
        update((r) => replaceExerciseAt(r, mode.index, (pe) => ({ ...pe, exerciseId })));
      }
    },
    [picker, state.settings.defaultRestSec, update],
  );

  if (!routine) {
    return (
      <Screen title="Routine" onBack={() => router.back()}>
        <EmptyState
          icon={Barbell}
          title="This routine is gone"
          body="It was deleted, or the link is out of date."
          action={{ label: 'Back to Train', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const stats = routineStats(routine);
  const actionsPe = actionsIndex != null ? routine.exercises[actionsIndex] : null;
  const restPe = restIndex != null ? routine.exercises[restIndex] : null;
  const removePe = pendingRemove != null ? routine.exercises[pendingRemove] : null;

  const nameOf = (exerciseId: ID) => state.exercises[exerciseId]?.name ?? 'this exercise';

  const onStart = () => {
    hapticPress();
    if (!state.active) startSession(routine.id);
    router.push('/session');
  };

  return (
    <Screen
      header={
        <BuilderHeader
          name={routine.name}
          summary={
            stats.exercises === 0
              ? 'Nothing planned yet'
              : `${stats.exercises} exercises · ${stats.workingSets} sets · about ${stats.minutes} min`
          }
          onChangeName={(name) => update((r) => ({ ...r, name }))}
          onBack={() => router.back()}
        />
      }
      footer={
        stats.exercises > 0 ? (
          <Button
            label={state.active ? 'Return to your workout' : 'Start this workout'}
            size="lg"
            fullWidth
            onPress={onStart}
          />
        ) : undefined
      }
    >
      <View style={{ gap: space.lg }}>
        {routine.exercises.length === 0 ? (
          <EmptyState
            icon={Barbell}
            title="Empty routine"
            body="Add the first movement. You can reorder and group them once there are a few."
            action={{ label: 'Add an exercise', onPress: () => setPicker({ kind: 'add' }) }}
          />
        ) : (
          <DragList
            keys={keys}
            gap={space.md}
            onReorder={onReorder}
            renderItem={(index, drag) => {
              const pe = routine.exercises[index];
              if (!pe) return null;
              return (
                <BuilderCard
                  pe={pe}
                  exercise={state.exercises[pe.exerciseId]}
                  unit={state.settings.unit}
                  drag={drag}
                  groupPos={groupPosition(routine.exercises, index)}
                  groupKind={groupKindAt(routine, index)}
                  expandedSetId={expandedSetId}
                  onToggleSet={(setId) => setExpandedSetId(expandedSetId === setId ? null : setId)}
                  onSetChange={(setId, patch: Partial<PlannedSet>) =>
                    update((r) => updateSet(r, index, setId, patch))
                  }
                  onSetRemove={(setId) => {
                    setExpandedSetId(null);
                    update((r) => removeSet(r, index, setId));
                  }}
                  onAddSet={(kind: SetKind) => update((r) => addSetAt(r, index, kind))}
                  onOpenRest={() => setRestIndex(index)}
                  onOpenActions={() => setActionsIndex(index)}
                />
              );
            }}
          />
        )}

        {routine.exercises.length > 0 ? (
          <Button
            label="Add an exercise"
            variant="secondary"
            icon={Plus}
            fullWidth
            onPress={() => setPicker({ kind: 'add' })}
          />
        ) : null}

        {routine.exercises.length > 1 ? (
          <Text variant="small" tone="faint" center>
            Press and hold the handle to move an exercise.
          </Text>
        ) : null}
      </View>

      <ExercisePickerSheet
        visible={picker !== null}
        onClose={() => setPicker(null)}
        exercises={state.exercises}
        usedIds={routine.exercises.map((pe) => pe.exerciseId)}
        title={picker?.kind === 'replace' ? 'Replace with' : 'Add an exercise'}
        onPick={onPick}
      />

      <ExerciseActionsSheet
        visible={actionsPe !== null}
        onClose={() => setActionsIndex(null)}
        name={actionsPe ? nameOf(actionsPe.exerciseId) : ''}
        canGroupNext={actionsIndex != null && actionsIndex < routine.exercises.length - 1}
        canMoveUp={actionsIndex != null && actionsIndex > 0}
        canMoveDown={actionsIndex != null && actionsIndex < routine.exercises.length - 1}
        groupKind={actionsIndex != null ? groupKindAt(routine, actionsIndex) : null}
        onReplace={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) setPicker({ kind: 'replace', index });
        }}
        onDuplicate={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => duplicateExerciseAt(r, index));
        }}
        onGroupNext={(kind: GroupKind) => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => groupWithNext(r, index, kind));
        }}
        onSetGroupKind={(kind: GroupKind) => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => setGroupKindAt(r, index, kind));
        }}
        onUngroup={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => ungroupAt(r, index));
        }}
        onMoveTop={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => moveExercise(r, index, 0));
        }}
        onMoveBottom={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          if (index != null) update((r) => moveExercise(r, index, routine.exercises.length - 1));
        }}
        onRemove={() => {
          const index = actionsIndex;
          setActionsIndex(null);
          setPendingRemove(index);
        }}
      />

      <RestNotesSheet
        visible={restPe !== null}
        onClose={() => setRestIndex(null)}
        name={restPe ? nameOf(restPe.exerciseId) : ''}
        restSec={restPe?.restSec ?? state.settings.defaultRestSec}
        notes={restPe?.notes ?? ''}
        onChangeRest={(sec) => {
          if (restIndex == null) return;
          update((r) => replaceExerciseAt(r, restIndex, (pe) => ({ ...pe, restSec: sec })));
        }}
        onChangeNotes={(notes) => {
          if (restIndex == null) return;
          update((r) => replaceExerciseAt(r, restIndex, (pe) => ({ ...pe, notes })));
        }}
      />

      <Confirm
        visible={removePe !== null}
        title={`Remove ${removePe ? nameOf(removePe.exerciseId) : 'this exercise'}?`}
        message="It is taken out of this routine only."
        confirmLabel="Remove"
        destructive
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          const index = pendingRemove;
          setPendingRemove(null);
          if (index != null) update((r) => removeExerciseAt(r, index));
        }}
      />
    </Screen>
  );
}

/* ----------------------------------------------------------------- header */

function BuilderHeader({
  name, summary, onChangeName, onBack,
}: {
  name: string;
  summary: string;
  onChangeName: (name: string) => void;
  onBack: () => void;
}) {
  const { c, space, type } = useTheme();

  return (
    <View style={{ paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.lg, gap: space.sm }}>
      <View style={{ marginLeft: -10 }}>
        <IconButton icon={ChevronLeft} label="Back" onPress={onBack} iconSize={22} />
      </View>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        onBlur={() => {
          if (!name.trim()) onChangeName('Untitled routine');
        }}
        placeholder="Name this routine"
        placeholderTextColor={c.textFaint}
        selectionColor={c.accent}
        style={[type.title, { color: c.text, paddingVertical: 2 }]}
      />
      <Text variant="small" tone="faint" numeric>{summary}</Text>
    </View>
  );
}
