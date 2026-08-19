import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, Segmented, Stepper, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import type { Routine } from '@/data/types';
import { estimateRange, estimateSeconds, fmtClock, plannedSetCount } from '@/lib';
import { useTheme } from '@/theme';

const MODES = [
  { value: 'routine' as const, label: 'A routine' },
  { value: 'custom' as const, label: 'Build one' },
];

function synth(exercises: number, setsEach: number, restSec: number): Routine {
  return {
    id: 'estimate-draft',
    name: 'Draft',
    exercises: Array.from({ length: exercises }, (_, i) => ({
      id: `e${i}`,
      exerciseId: `x${i}`,
      restSec,
      sets: Array.from({ length: setsEach }, (_, j) => ({
        id: `s${i}-${j}`,
        kind: 'working' as const,
        reps: 8,
        weight: null,
        rpe: null,
      })),
    })),
    groups: {},
    estMinutes: 0,
  };
}

/** How long a session will actually take, warm-ups and rest included. */
export function ToolDuration(): React.JSX.Element {
  const state = useStore();
  const { space } = useTheme();

  const routines = useMemo(
    () => Object.values(state.routines).filter((r) => !r.archived),
    [state.routines],
  );

  const [mode, setMode] = useState<'routine' | 'custom'>(routines.length ? 'routine' : 'custom');
  const [picked, setPicked] = useState<string | null>(routines[0]?.id ?? null);
  const [exercises, setExercises] = useState(5);
  const [setsEach, setSetsEach] = useState(3);
  const [rest, setRest] = useState(state.settings.defaultRestSec);

  const routine =
    mode === 'routine'
      ? routines.find((r) => r.id === picked) ?? null
      : synth(exercises, setsEach, rest);

  const seconds = estimateSeconds(routine);
  const minutes = Math.round(seconds / 60);

  return (
    <View style={{ gap: space.lg }}>
      <Segmented items={MODES} value={mode} onChange={setMode} />

      {mode === 'routine' ? (
        routines.length === 0 ? (
          <Text variant="small" tone="muted">
            You have no routines yet. Build one on the Train tab, or estimate a
            session by hand.
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {routines.map((r) => (
              <Chip
                key={r.id}
                label={r.name}
                selected={r.id === picked}
                onPress={() => setPicked(r.id)}
                size="sm"
              />
            ))}
          </View>
        )
      ) : (
        <View style={{ gap: space.md }}>
          <Stepper label="Exercises" value={exercises} onChange={setExercises} step={1} min={1} max={15} />
          <Stepper label="Sets each" value={setsEach} onChange={setSetsEach} step={1} min={1} max={10} />
          <Stepper
            label="Rest between sets"
            value={rest}
            onChange={setRest}
            step={15}
            min={30}
            max={360}
            formatValue={(v) => fmtClock(v)}
          />
        </View>
      )}

      <Card tone="plain">
        <View style={{ alignItems: 'center', gap: space.xs, paddingVertical: space.sm }}>
          <Text variant="label" tone="faint">
            Estimated duration
          </Text>
          <Text variant="display" numeric>
            {minutes}
          </Text>
          <Text variant="small" tone="muted">
            minutes {routine ? `· usually ${estimateRange(routine)}` : ''}
          </Text>
        </View>
      </Card>

      <Text variant="small" tone="faint">
        {routine
          ? `${plannedSetCount(routine)} working sets, rest included. Supersets shorten this; long conversations do not.`
          : 'Pick a routine to estimate it.'}
      </Text>
    </View>
  );
}
