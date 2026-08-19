import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { EmptyState, IconButton, Screen, Text } from '@/components/kit';
import { AlternatesBlock } from '@/components/library/AlternatesBlock';
import { ExerciseHero } from '@/components/library/ExerciseHero';
import { HistoryBlock } from '@/components/library/HistoryBlock';
import { InstructionsBlock } from '@/components/library/InstructionsBlock';
import { MuscleBlock } from '@/components/library/MuscleBlock';
import { recentPerformances } from '@/components/library/stats';
import { exerciseHistory, prsForExercise, useActions, useStore } from '@/data';
import type { Exercise } from '@/data/types';
import { Chart, Library, Star, StarFilled } from '@/icons';
import { useTheme } from '@/theme';

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const state = useStore();
  const actions = useActions();
  const { space } = useTheme();

  const exercise = state.exercises[id];

  const history = useMemo(
    () => (exercise ? exerciseHistory(state, exercise.id) : []),
    [exercise, state],
  );
  const prs = useMemo(
    () => (exercise ? prsForExercise(state, exercise.id) : []),
    [exercise, state],
  );
  const performances = useMemo(
    () => (exercise ? recentPerformances(state, exercise.id, 3) : []),
    [exercise, state],
  );
  const alternates = useMemo(
    () =>
      (exercise?.alternates ?? [])
        .map((aid) => state.exercises[aid])
        .filter((e): e is Exercise => Boolean(e)),
    [exercise, state.exercises],
  );

  const openExercise = useCallback((next: string) => {
    router.push({ pathname: '/exercise/[id]', params: { id: next } });
  }, []);

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/library');
  }, []);

  if (!exercise) {
    return (
      <Screen title="Exercise" onBack={back}>
        <EmptyState
          icon={Library}
          title="That exercise is gone"
          body="It may have been deleted. Everything else is still in your library."
          action={{ label: 'Back to library', onPress: () => router.replace('/library') }}
        />
      </Screen>
    );
  }

  const trained = history.length > 0;

  return (
    <Screen
      title={exercise.name}
      subtitle={exercise.custom ? 'Your own exercise' : undefined}
      onBack={back}
      headerRight={
        <IconButton
          icon={exercise.favourite ? StarFilled : Star}
          label={exercise.favourite ? 'Remove from favourites' : 'Add to favourites'}
          variant="surface"
          active={Boolean(exercise.favourite)}
          size={46}
          onPress={() => actions.toggleFavourite(exercise.id)}
        />
      }
    >
      <View style={{ gap: space.xxxl, paddingTop: space.xs }}>
        <ExerciseHero exercise={exercise} />

        {exercise.instructions.length || exercise.mistakes.length ? (
          <InstructionsBlock instructions={exercise.instructions} mistakes={exercise.mistakes} />
        ) : null}

        <MuscleBlock primary={exercise.primary} secondary={exercise.secondary} />

        <AlternatesBlock alternates={alternates} onOpen={openExercise} />

        {trained ? (
          <HistoryBlock
            exerciseName={exercise.name}
            history={history}
            prs={prs}
            performances={performances}
            unit={state.settings.unit}
          />
        ) : (
          <View style={{ gap: space.lg }}>
            <Text variant="label" tone="faint">
              Your history
            </Text>
            <EmptyState
              icon={Chart}
              title="You have not trained this yet"
              body="Put it in a routine. After the first logged set your estimated max, records and last performances appear here."
              action={{ label: 'Add it to a routine', onPress: () => router.push('/train') }}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
