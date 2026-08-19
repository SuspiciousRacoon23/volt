import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Divider, Sheet, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import type { ID, Unit } from '@/data/types';
import { dateLabel, relative } from '@/lib/dates';
import { workingSets } from '@/lib/sets';
import { fmtVolume } from '@/lib/units';

import { performanceLine } from './format';

export type PreviousSheetProps = {
  visible: boolean;
  onClose: () => void;
  exerciseId: ID;
  exerciseName: string;
  unit: Unit;
};

/** The last three times this lift was trained. Facts only, no commentary. */
export function PreviousSheet({ visible, onClose, exerciseId, exerciseName, unit }: PreviousSheetProps) {
  const state = useStore();

  const entries = useMemo(() => {
    const out: { id: string; ts: number; line: string; volume: number; sessionName: string }[] = [];
    const sessions = Object.values(state.sessions)
      .filter((s) => s.endedAt !== null)
      .sort((a, b) => b.startedAt - a.startedAt);
    for (const s of sessions) {
      for (const le of s.exercises) {
        if (le.exerciseId !== exerciseId) continue;
        const sets = workingSets(le.sets);
        if (!sets.length) continue;
        out.push({
          id: `${s.id}-${le.id}`,
          ts: s.startedAt,
          line: performanceLine(sets, unit),
          volume: sets.reduce((n, x) => n + x.weight * x.reps, 0),
          sessionName: s.name,
        });
      }
      if (out.length >= 3) break;
    }
    return out.slice(0, 3);
  }, [exerciseId, state.sessions, unit]);

  return (
    <Sheet visible={visible} onClose={onClose} title={exerciseName} subtitle="Your last three sessions">
      <View style={{ paddingBottom: 24 }}>
        {entries.length === 0 ? (
          <Text variant="body" tone="muted">
            You have not logged this exercise before. Today is the baseline.
          </Text>
        ) : (
          entries.map((e, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider spacing={16} /> : null}
              <View style={{ gap: 4, paddingVertical: 4 }}>
                <Text variant="label" tone="faint">
                  {`${dateLabel(e.ts)} · ${relative(e.ts)}`}
                </Text>
                <Text variant="h2" numeric>
                  {e.line}
                </Text>
                <Text variant="small" tone="muted">
                  {`${e.sessionName} · ${fmtVolume(e.volume, unit)} of work`}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </Sheet>
  );
}
