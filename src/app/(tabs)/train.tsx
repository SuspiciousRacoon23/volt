import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useActions, useStore } from '@/data/store';
import type { ID, Routine, Session } from '@/data/types';
import { Barbell, Calendar, Duplicate, Edit, Plus, Trash } from '@/icons';
import { press as hapticPress } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';
import { Button, Confirm, EmptyState, Screen, Sheet, Text } from '@/components/kit';
import {
  ActionRow, DuplicateSheet, RoutineCard, ScheduleSheet, TemplateSheet, WEEK_ORDER, WeekStrip,
  cloneRoutine, emptyRoutine, routineFromSession, scheduledDays,
} from '@/components/planner';

/**
 * Train — the planning surface. The week on top, your routines below, and the
 * three ways to make a new one within a thumb's reach.
 */
export default function TrainScreen(): React.JSX.Element {
  const { space } = useTheme();
  const state = useStore();
  const { saveRoutine, deleteRoutine, setScheduleDay, toggleDeloadWeek } = useActions();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [menuId, setMenuId] = useState<ID | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Routine | null>(null);

  const routines = useMemo(() => sortRoutines(state.routines, state.schedule.byDay), [state.routines, state.schedule.byDay]);

  const pastSessions = useMemo<Session[]>(
    () =>
      Object.values(state.sessions)
        .filter((s) => s.endedAt !== null && s.exercises.length > 0)
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 12),
    [state.sessions],
  );

  const open = useCallback((id: ID) => {
    router.push({ pathname: '/routine/[id]', params: { id } });
  }, []);

  const onCreate = useCallback(() => {
    hapticPress();
    const r = emptyRoutine('New routine');
    saveRoutine(r);
    open(r.id);
  }, [open, saveRoutine]);

  const onAddTemplate = useCallback(
    (source: Routine[], _programme: string) => {
      const copies = source.map((r) => cloneRoutine(r));
      copies.forEach((r) => saveRoutine(r));
      setTemplatesOpen(false);
      if (copies.length === 1) open(copies[0].id);
    },
    [open, saveRoutine],
  );

  const onDuplicateSession = useCallback(
    (session: Session) => {
      const r = routineFromSession(session);
      saveRoutine(r);
      setDuplicateOpen(false);
      open(r.id);
    },
    [open, saveRoutine],
  );

  const menuRoutine = menuId ? state.routines[menuId] ?? null : null;

  return (
    <Screen
      title="Train"
      subtitle="Plan the week, then run it."
      footer={
        <Button label="New routine" icon={Plus} size="lg" fullWidth onPress={onCreate} />
      }
    >
      <View style={{ gap: space.xxl }}>
        <WeekStrip
          schedule={state.schedule}
          routines={state.routines}
          onPress={() => setScheduleOpen(true)}
        />

        <View style={{ gap: space.md }}>
          <Text variant="label" tone="faint">Routines</Text>
          {routines.length === 0 ? (
            <EmptyState
              icon={Barbell}
              title="No routines yet"
              body="Start from a template, or build one exercise at a time."
              action={{ label: 'Start from a template', onPress: () => setTemplatesOpen(true) }}
              secondaryAction={{ label: 'Build from scratch', onPress: onCreate }}
            />
          ) : null}
          {routines.map((r) => (
            <RoutineCard
              key={r.id}
              routine={r}
              exercises={state.exercises}
              days={scheduledDays(state.schedule, r.id)}
              onPress={() => open(r.id)}
              onMore={() => setMenuId(r.id)}
            />
          ))}
        </View>

        {routines.length ? (
          <CreateSection
            onTemplates={() => setTemplatesOpen(true)}
            onDuplicate={() => setDuplicateOpen(true)}
            onSchedule={() => setScheduleOpen(true)}
          />
        ) : null}
      </View>

      <ScheduleSheet
        visible={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        schedule={state.schedule}
        routines={routines}
        onAssign={setScheduleDay}
        onToggleDeload={toggleDeloadWeek}
      />

      <TemplateSheet
        visible={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onAdd={onAddTemplate}
      />

      <DuplicateSheet
        visible={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        sessions={pastSessions}
        unit={state.settings.unit}
        onPick={onDuplicateSession}
      />

      <Sheet
        visible={menuRoutine !== null}
        onClose={() => setMenuId(null)}
        title={menuRoutine?.name ?? ''}
      >
        <View>
          <ActionRow
            first
            icon={Edit}
            label="Edit routine"
            onPress={() => {
              const id = menuId;
              setMenuId(null);
              if (id) open(id);
            }}
          />
          <ActionRow
            icon={Duplicate}
            label="Duplicate"
            hint="A separate copy you can change freely."
            onPress={() => {
              if (!menuRoutine) return;
              const copy = cloneRoutine(menuRoutine, `${menuRoutine.name} copy`);
              saveRoutine(copy);
              setMenuId(null);
              open(copy.id);
            }}
          />
          <ActionRow
            icon={Calendar}
            label="Schedule it"
            onPress={() => {
              setMenuId(null);
              setScheduleOpen(true);
            }}
          />
          <ActionRow
            icon={Trash}
            label="Delete routine"
            danger
            onPress={() => {
              setPendingDelete(menuRoutine);
              setMenuId(null);
            }}
          />
        </View>
      </Sheet>

      <Confirm
        visible={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? 'this routine'}?`}
        message="Workouts you already logged from it are kept."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteRoutine(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Screen>
  );
}

/* ------------------------------------------------------------------ parts */

function CreateSection({
  onTemplates, onDuplicate, onSchedule,
}: {
  onTemplates: () => void;
  onDuplicate: () => void;
  onSchedule: () => void;
}) {
  const { c, radius, space } = useTheme();
  return (
    <View style={{ gap: space.md }}>
      <Text variant="label" tone="faint">Faster ways in</Text>
      <View
        style={{
          paddingHorizontal: space.lg,
          borderRadius: radius.lg,
          borderWidth: hairline,
          borderColor: c.border,
          backgroundColor: c.surface,
        }}
      >
        <ActionRow
          first
          icon={Barbell}
          label="Start from a template"
          hint="Push · Pull · Legs, Upper · Lower, or Full Body."
          onPress={onTemplates}
        />
        <ActionRow
          icon={Duplicate}
          label="Duplicate a past workout"
          hint="Rebuild a session you liked, weights included."
          onPress={onDuplicate}
        />
        <ActionRow
          icon={Calendar}
          label="Edit the week"
          hint="Assign a routine to each day and mark deload weeks."
          onPress={onSchedule}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ order */

/** Scheduled routines first, in the order the week runs them. */
function sortRoutines(map: Record<ID, Routine>, byDay: Record<number, ID | null>): Routine[] {
  const slot = new Map<ID, number>();
  WEEK_ORDER.forEach((day, i) => {
    const id = byDay[day];
    if (id && !slot.has(id)) slot.set(id, i);
  });
  return Object.values(map)
    .filter((r) => !r.archived)
    .sort((a, b) => {
      const sa = slot.get(a.id) ?? 99;
      const sb = slot.get(b.id) ?? 99;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    });
}
