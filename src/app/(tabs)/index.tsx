import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/kit';
import { InsightCard } from '@/components/today/InsightCard';
import { NextUpCard } from '@/components/today/NextUpCard';
import { PRCard } from '@/components/today/PRCard';
import { ReadinessCard } from '@/components/today/ReadinessCard';
import { RestDayHero } from '@/components/today/RestDayHero';
import { Rise } from '@/components/today/Rise';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TrainedTodayHero } from '@/components/today/TrainedTodayHero';
import { WeekStrip } from '@/components/today/WeekStrip';
import { WorkoutHero } from '@/components/today/WorkoutHero';
import { targetMuscles } from '@/components/today/muscles';
import {
  isDeloadWeek,
  nextTrainingDay,
  recentPRs,
  streak,
  todayReadiness,
  todayRoutine,
  useActions,
  useStore,
  weekSessions,
  type ID,
  type Session,
} from '@/data';
import { buildInsights, daysBetween, estimateMinutes, plannedSetCount, startOfDay } from '@/lib';
import { useTheme } from '@/theme';

const PR_WINDOW_DAYS = 45;

export default function TodayScreen() {
  const state = useStore();
  const { startSession } = useActions();
  const router = useRouter();
  const { space } = useTheme();

  const now = Date.now();
  const today = startOfDay(now);

  const routine = todayRoutine(state);
  const deload = isDeloadWeek(state);
  const readiness = todayReadiness(state);
  const next = nextTrainingDay(state);
  const unit = state.settings.unit;

  const thisWeek = weekSessions(state);
  const completedDays = useMemo(
    () => Array.from(new Set(thisWeek.map((s) => startOfDay(s.startedAt)))),
    [thisWeek],
  );

  const trainedToday = useMemo<Session | null>(() => {
    const done = thisWeek.filter((s) => startOfDay(s.startedAt) === today);
    return done.length ? done[done.length - 1] : null;
  }, [thisWeek, today]);

  const lastSession = useMemo<Session | null>(() => {
    const finished = Object.values(state.sessions)
      .filter((s) => s.endedAt !== null)
      .sort((a, b) => b.startedAt - a.startedAt);
    return finished[0] ?? null;
  }, [state.sessions]);

  const prs = useMemo(
    () => recentPRs(state, 3).filter((p) => daysBetween(p.ts, now) <= PR_WINDOW_DAYS),
    [state, now],
  );

  const insights = useMemo(
    () =>
      buildInsights(
        {
          sessions: state.sessions,
          exercises: state.exercises,
          prs: state.prs,
          body: state.body,
          settings: { unit, weeklyGoal: state.settings.weeklyGoal },
        },
        { limit: 2 },
      ),
    [state.sessions, state.exercises, state.prs, state.body, state.settings.weeklyGoal, unit],
  );

  const scheduled = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (let d = 0; d < 7; d++) map[d] = Boolean(state.schedule.byDay[d]);
    return map;
  }, [state.schedule.byDay]);

  const days = streak(state);
  const streakDays = state.settings.streaksEnabled ? days : null;

  const openSession = () => router.push('/session');
  const openRoutine = (id: ID) => router.push({ pathname: '/routine/[id]', params: { id } });
  const openExercise = (id: ID) => router.push({ pathname: '/exercise/[id]', params: { id } });

  const start = () => {
    if (!state.active && routine) startSession(routine.id);
    openSession();
  };

  const hero = (() => {
    if (state.active) {
      const name = state.active.name;
      return (
        <WorkoutHero
          routineName={name}
          muscles={targetMuscles(routine, state.exercises)}
          minutes={routine ? routine.estMinutes || estimateMinutes(routine) : 0}
          sets={routine ? plannedSetCount(routine) : 0}
          exercises={state.active.exercises.length}
          deload={deload}
          resuming
          onStart={openSession}
        />
      );
    }
    if (trainedToday) {
      return (
        <TrainedTodayHero
          session={trainedToday}
          unit={unit}
          prs={state.prs.filter((p) => p.sessionId === trainedToday.id)}
          onTrainAgain={() => router.push('/train')}
        />
      );
    }
    if (routine) {
      return (
        <WorkoutHero
          routineName={routine.name}
          muscles={targetMuscles(routine, state.exercises)}
          minutes={routine.estMinutes || estimateMinutes(routine)}
          sets={plannedSetCount(routine)}
          exercises={routine.exercises.length}
          deload={deload}
          resuming={false}
          onStart={start}
          onOpenRoutine={() => openRoutine(routine.id)}
        />
      );
    }
    return (
      <RestDayHero
        last={lastSession}
        unit={unit}
        daysSinceTraining={lastSession ? daysBetween(lastSession.startedAt, now) : null}
        deload={deload}
        onTrainAnyway={() => router.push('/train')}
      />
    );
  })();

  return (
    <Screen header={<TodayHeader name={state.settings.name} streakDays={streakDays} />}>
      <View style={{ gap: space.lg }}>
        <Rise index={0}>{hero}</Rise>

        <Rise index={1} style={{ marginTop: space.sm }}>
          <WeekStrip
            completedDays={completedDays}
            scheduled={scheduled}
            weeklyGoal={state.settings.weeklyGoal}
          />
        </Rise>

        <Rise index={2}>
          <ReadinessCard readiness={readiness} onOpen={() => router.push('/checkin')} />
        </Rise>

        {prs.length ? (
          <Rise index={3}>
            <PRCard
              prs={prs}
              exercises={state.exercises}
              unit={unit}
              onOpenExercise={openExercise}
            />
          </Rise>
        ) : null}

        {insights.length ? (
          <Rise index={4}>
            <InsightCard lines={insights} />
          </Rise>
        ) : null}

        {next ? (
          <Rise index={5}>
            <NextUpCard
              day={next.day}
              routineName={next.routine.name}
              minutes={next.routine.estMinutes || estimateMinutes(next.routine)}
              onPress={() => openRoutine(next.routine.id)}
            />
          </Rise>
        ) : null}
      </View>
    </Screen>
  );
}
