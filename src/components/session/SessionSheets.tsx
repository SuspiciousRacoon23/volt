import React from 'react';

import type { ID, LoggedExercise, Unit } from '@/data/types';

import { ExercisePickerSheet, type PickerGroup } from './ExercisePickerSheet';
import { NoteSheet } from './NoteSheet';
import { PreviousSheet } from './PreviousSheet';
import { RestSheet } from './RestSheet';
import type { RestTimer } from './timers';

export type SheetName = 'none' | 'rest' | 'note' | 'previous' | 'replace' | 'add';

export type SessionSheetsProps = {
  sheet: SheetName;
  onClose: () => void;
  timer: RestTimer;
  restPreview: string;
  logged: LoggedExercise | undefined;
  exerciseName: string;
  unit: Unit;
  alternateGroups: PickerGroup[];
  addGroups: PickerGroup[];
  onNote: (value: string) => void;
  onReplace: (id: ID) => void;
  onAdd: (id: ID) => void;
};

/** Every overlay the session can raise, kept together and off the main screen. */
export function SessionSheets({
  sheet,
  onClose,
  timer,
  restPreview,
  logged,
  exerciseName,
  unit,
  alternateGroups,
  addGroups,
  onNote,
  onReplace,
  onAdd,
}: SessionSheetsProps) {
  return (
    <>
      <RestSheet visible={sheet === 'rest'} onClose={onClose} timer={timer} preview={restPreview} />

      {logged ? (
        <>
          <NoteSheet
            visible={sheet === 'note'}
            onClose={onClose}
            exerciseName={exerciseName}
            value={logged.notes ?? ''}
            onChange={onNote}
          />
          <PreviousSheet
            visible={sheet === 'previous'}
            onClose={onClose}
            exerciseId={logged.exerciseId}
            exerciseName={exerciseName}
            unit={unit}
          />
          <ExercisePickerSheet
            visible={sheet === 'replace'}
            onClose={onClose}
            title="Replace exercise"
            subtitle={`Swapping out ${exerciseName}. Sets you already logged stay as they are.`}
            groups={alternateGroups}
            onPick={onReplace}
          />
        </>
      ) : null}

      <ExercisePickerSheet
        visible={sheet === 'add'}
        onClose={onClose}
        title="Add an exercise"
        subtitle="It goes to the end of this workout."
        groups={addGroups}
        searchable
        onPick={onAdd}
      />
    </>
  );
}
