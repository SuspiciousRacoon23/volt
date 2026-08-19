import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, KitProvider, useConfirm, useToast } from '@/components/kit';
import {
  BottomControls,
  ExercisePane,
  FinishSummary,
  RestPill,
  SessionSheets,
  SessionTopBar,
  nextPreview,
  performanceLine,
  sessionProgress,
  setLine,
  useElapsed,
  useRestTimer,
} from '@/components/session';
import type { PickerGroup, SheetName } from '@/components/session';
import { useActions, useStore } from '@/data/store';
import { lastPerformance } from '@/data/selectors';
import type { Exercise, ID, LoggedExercise, LoggedSet, PR, Session } from '@/data/types';
import { Barbell, Plus } from '@/icons';
import { press as hapticPress, warn as hapticWarn } from '@/lib/haptics';
import { sessionInsight } from '@/lib/insights';
import { detectPRs } from '@/lib/prs';
import { sessionVolume } from '@/lib/sets';
import { hairline, useReducedMotion, useTheme } from '@/theme';

export default function SessionRoute(): React.JSX.Element {
  return (
    <KitProvider>
      <SessionRoot />
    </KitProvider>
  );
}

function SessionRoot(): React.JSX.Element {
  useKeepAwake();
  const { c } = useTheme();
  const { active, hydrated } = useStore();

  useEffect(() => {
    if (hydrated && !active) router.replace('/');
  }, [active, hydrated]);

  if (!active) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return <ActiveSession session={active} />;
}

/* ------------------------------------------------------------------ */

function ActiveSession({ session }: { session: Session }): React.JSX.Element {
  const { c, space } = useTheme();
  const state = useStore();
  const actions = useActions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const confirm = useConfirm();

  const unit = state.settings.unit;
  const timer = useRestTimer();
  const elapsed = useElapsed(session.startedAt);

  const [exIndex, setExIndex] = useState(0);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [perSide, setPerSide] = useState<Record<ID, boolean>>({});
  const [sheet, setSheet] = useState<SheetName>('none');
  const [finish, setFinish] = useState<{ preview: Session; prs: PR[]; insight: string } | null>(null);
  const [finishing, setFinishing] = useState(false);

  const pager = useRef<FlatList<LoggedExercise> | null>(null);
  const pendingRight = useRef<ID | null>(null);

  const list = session.exercises;
  const index = Math.min(exIndex, Math.max(0, list.length - 1));
  const logged: LoggedExercise | undefined = list[index];
  const exercise: Exercise | undefined = logged ? state.exercises[logged.exerciseId] : undefined;

  /* ------------------------------------------------------------ focus */

  const currentSet: LoggedSet | null = useMemo(() => {
    if (!logged) return null;
    if (selectedSetId) {
      const picked = logged.sets.find((s) => s.id === selectedSetId);
      if (picked) return picked;
    }
    return logged.sets.find((s) => !s.done) ?? logged.sets[logged.sets.length - 1] ?? null;
  }, [logged, selectedSetId]);

  const sideMode = Boolean(logged && perSide[logged.id] && exercise?.unilateral);
  const side: 'L' | 'R' | null = sideMode ? (currentSet?.side ?? 'L') : null;

  // The right-side set is created by `addSet`, so it is stamped once it exists.
  useEffect(() => {
    const exId = pendingRight.current;
    if (!exId) return;
    const le = session.exercises.find((x) => x.id === exId);
    if (!le) {
      pendingRight.current = null;
      return;
    }
    const last = le.sets[le.sets.length - 1];
    if (last && !last.done && last.side !== 'R') {
      pendingRight.current = null;
      actions.logSet(le.id, last.id, { side: 'R' });
    }
  }, [actions, session]);

  useEffect(() => {
    pager.current?.scrollToOffset({ offset: index * width, animated: !reduced });
  }, [index, reduced, width]);

  const goTo = useCallback((next: number) => {
    setExIndex(next);
    setSelectedSetId(null);
  }, []);

  /* ------------------------------------------------------- the one tap */

  const nextTarget = useMemo(() => {
    if (!logged || !currentSet) return null;
    const rest = logged.sets.find((s) => !s.done && s.id !== currentSet.id);
    if (rest) return { exercise, logged, set: rest };
    for (let i = 1; i <= list.length; i += 1) {
      const cand = list[(index + i) % list.length];
      const set = cand?.sets.find((s) => !s.done && s.id !== currentSet.id);
      if (cand && set) return { exercise: state.exercises[cand.exerciseId], logged: cand, set };
    }
    return null;
  }, [currentSet, exercise, index, list, logged, state.exercises]);

  /**
   * Finishing is a request, not an immediate read. The last SET DONE dispatches
   * before this runs, so building the summary from the session in scope here
   * would drop the set the user just completed — and any record won on it.
   * The effect below builds it once the store has caught up.
   */
  const openFinish = useCallback(() => setFinishing(true), []);

  useEffect(() => {
    if (!finishing) return;
    const preview: Session = {
      ...session,
      endedAt: Date.now(),
      exercises: session.exercises
        .map((le) => ({ ...le, sets: le.sets.filter((s) => s.done) }))
        .filter((le) => le.sets.length > 0),
    };
    const history = Object.values(state.sessions).filter((s) => s.endedAt !== null);
    setFinishing(false);
    setFinish({
      preview,
      prs: detectPRs(preview, history, state.exercises),
      insight: sessionInsight(preview, history, unit),
    });
  }, [finishing, session, state.exercises, state.sessions, unit]);

  const onDone = useCallback(() => {
    if (!logged || !currentSet) return;

    if (sideMode && (currentSet.side ?? 'L') === 'L') {
      actions.logSet(logged.id, currentSet.id, { done: true, side: 'L' });
      actions.addSet(logged.id, currentSet.kind);
      pendingRight.current = logged.id;
      setSelectedSetId(null);
      return;
    }

    actions.logSet(logged.id, currentSet.id, { done: true, ...(sideMode ? { side: 'R' as const } : null) });
    setSelectedSetId(null);
    timer.start(logged.restSec > 0 ? logged.restSec : state.settings.defaultRestSec);

    const moreHere = logged.sets.some((s) => !s.done && s.id !== currentSet.id);
    if (moreHere) return;

    for (let i = 1; i <= list.length; i += 1) {
      const at = (index + i) % list.length;
      const cand = list[at];
      if (cand && cand.sets.some((s) => !s.done && s.id !== currentSet.id)) {
        goTo(at);
        toast.show(`Next: ${state.exercises[cand.exerciseId]?.name ?? 'next exercise'}`);
        return;
      }
    }
    openFinish();
  }, [
    actions, currentSet, goTo, index, list, logged, openFinish, sideMode,
    state.exercises, state.settings.defaultRestSec, timer, toast,
  ]);

  /* -------------------------------------------------------- edit a set */

  const patch = useCallback(
    (p: Partial<LoggedSet>) => {
      if (!logged || !currentSet) return;
      actions.logSet(logged.id, currentSet.id, p);
    },
    [actions, currentSet, logged],
  );

  const removeSet = useCallback(
    (setId: string) => {
      if (!logged) return;
      if (logged.sets.length <= 1) return;
      hapticWarn();
      actions.removeSet(logged.id, setId);
      if (selectedSetId === setId) setSelectedSetId(null);
      toast.show('Set removed');
    },
    [actions, logged, selectedSetId, toast],
  );

  const removeExercise = useCallback(async () => {
    if (!logged) return;
    const ok = await confirm({
      title: 'Remove this exercise?',
      message: 'Sets you already logged for it will be removed with it.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    actions.removeExerciseFromSession(logged.id);
    goTo(Math.max(0, index - 1));
  }, [actions, confirm, goTo, index, logged]);

  /* -------------------------------------------------------- exercises */

  const alternateGroups = useMemo<PickerGroup[]>(() => {
    if (!exercise) return [];
    const all = Object.values(state.exercises);
    const direct = exercise.alternates
      .map((id) => state.exercises[id])
      .filter((e): e is Exercise => Boolean(e));
    const taken = new Set([exercise.id, ...direct.map((e) => e.id)]);
    const sameMuscle = all
      .filter((e) => !taken.has(e.id) && e.primary.some((m) => exercise.primary.includes(m)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 24);
    return [
      { label: 'Direct alternates', items: direct },
      { label: 'Same muscle', items: sameMuscle },
    ];
  }, [exercise, state.exercises]);

  const addGroups = useMemo<PickerGroup[]>(() => {
    const all = Object.values(state.exercises);
    const recent = [...all]
      .filter((e) => typeof e.lastUsed === 'number')
      .sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0))
      .slice(0, 6);
    return [
      { label: 'Recent', items: recent },
      { label: 'All exercises', items: [...all].sort((a, b) => a.name.localeCompare(b.name)) },
    ];
  }, [state.exercises]);

  /* ------------------------------------------------------------ finish */

  const onSave = useCallback(() => {
    timer.skip();
    actions.finishSession();
    router.replace('/');
  }, [actions, timer]);

  const onDiscard = useCallback(async () => {
    const ok = await confirm({
      title: 'Discard this workout?',
      message: 'Every set you logged in it will be removed. This cannot be undone.',
      confirmLabel: 'Discard',
      destructive: true,
    });
    if (!ok) return;
    timer.skip();
    actions.discardSession();
    router.replace('/');
  }, [actions, confirm, timer]);

  const leave = useCallback(() => {
    hapticPress();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  /* ------------------------------------------------------------ render */

  if (finish) {
    return (
      <FinishSummary
        session={finish.preview}
        unit={unit}
        prs={finish.prs}
        exercises={state.exercises}
        insight={finish.insight}
        onSave={onSave}
        onResume={() => {
          setFinishing(false);
          setFinish(null);
        }}
        onDiscard={onDiscard}
      />
    );
  }

  const progress = sessionProgress(session);
  // Every pane gets its own previous line — a pane one swipe away must not
  // claim there is no history for a lift that has plenty.
  const lastLines: Record<ID, string | null> = {};
  for (const le of list) {
    if (le.exerciseId in lastLines) continue;
    const prev = lastPerformance(state, le.exerciseId);
    lastLines[le.exerciseId] = prev ? performanceLine(prev.sets, unit) : null;
  }
  const restVisible = timer.running || timer.finished;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + space.sm }}>
      <SessionTopBar
        name={session.name}
        elapsedMs={elapsed}
        volumeKg={sessionVolume(session)}
        unit={unit}
        index={index}
        total={Math.max(1, list.length)}
        progress={progress.total > 0 ? progress.done / progress.total : 0}
        onClose={leave}
        onFinish={openFinish}
      />

      {list.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.lg }}>
          <EmptyState
            icon={Barbell}
            title="Nothing in this workout yet"
            body="Add the first exercise and start logging."
            action={{ label: 'Add exercise', onPress: () => setSheet('add') }}
          />
        </View>
      ) : (
        <FlatList
          ref={pager}
          data={list}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => {
            const at = Math.round(e.nativeEvent.contentOffset.x / width);
            if (at !== index) goTo(at);
          }}
          renderItem={({ item, index: i }) => (
            <ExercisePane
              width={width}
              logged={item}
              exercise={state.exercises[item.exerciseId]}
              index={i}
              total={list.length}
              unit={unit}
              currentSetId={i === index ? (currentSet?.id ?? null) : null}
              lastLine={lastLines[item.exerciseId] ?? null}
              perSide={Boolean(perSide[item.id])}
              bottomPad={space.xxl}
              onSelectSet={setSelectedSetId}
              onRemoveSet={removeSet}
              onAddSet={() => actions.addSet(item.id)}
              onAddWarmup={() => actions.addSet(item.id, 'warmup')}
              onOpenNote={() => setSheet('note')}
              onOpenPrevious={() => setSheet('previous')}
              onReplace={() => setSheet('replace')}
              onTogglePerSide={() => setPerSide((p) => ({ ...p, [item.id]: !p[item.id] }))}
              onRemoveExercise={removeExercise}
            />
          )}
        />
      )}

      <View
        style={{
          gap: space.sm,
          paddingHorizontal: space.lg,
          paddingTop: space.md,
          paddingBottom: insets.bottom + space.md,
          borderTopWidth: hairline,
          borderTopColor: c.border,
          backgroundColor: c.bg,
        }}>
        {restVisible ? <RestPill timer={timer} onPress={() => setSheet('rest')} /> : null}

        <BottomControls
          unit={unit}
          weightKg={currentSet?.weight ?? 0}
          reps={currentSet?.reps ?? 0}
          rpe={currentSet?.rpe ?? null}
          onWeight={(kg) => patch({ weight: kg })}
          onReps={(reps) => patch({ reps })}
          onRpe={(rpe) => patch({ rpe })}
          side={side}
          doneLabel={side === 'L' ? 'Log left' : side === 'R' ? 'Log right' : 'Set done'}
          summary={setLine(currentSet, unit)}
          onDone={onDone}
          disabled={!currentSet}
        />

        <Button
          label="Add an exercise"
          variant="ghost"
          size="sm"
          icon={Plus}
          fullWidth
          onPress={() => setSheet('add')}
        />
      </View>

      <SessionSheets
        sheet={sheet}
        onClose={() => setSheet('none')}
        timer={timer}
        restPreview={nextPreview(nextTarget, unit)}
        logged={logged}
        exerciseName={exercise?.name ?? 'Exercise'}
        unit={unit}
        alternateGroups={alternateGroups}
        addGroups={addGroups}
        onNote={(v) => {
          if (logged) actions.setExerciseNote(logged.id, v);
        }}
        onReplace={(id) => {
          if (logged) actions.replaceExercise(logged.id, id);
          setSheet('none');
          setSelectedSetId(null);
        }}
        onAdd={(id) => {
          actions.addExerciseToSession(id);
          setSheet('none');
          setExIndex(list.length);
        }}
      />
    </View>
  );
}
