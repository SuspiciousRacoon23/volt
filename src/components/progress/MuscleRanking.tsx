import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/kit';
import { useTheme } from '@/theme';

import type { MuscleRow } from './progressData';

const NAMES: Record<string, string> = {
  chest: 'Chest',
  back: 'Lower back',
  lats: 'Lats',
  traps: 'Traps',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Adductors',
  calves: 'Calves',
  neck: 'Neck',
};

/** Working sets per muscle, ranked. Ink bars — the lime on this panel is spent elsewhere. */
export function MuscleRanking({ rows, limit = 8 }: { rows: readonly MuscleRow[]; limit?: number }) {
  const { c, radius, space } = useTheme();
  const top = rows[0]?.sets ?? 1;
  const shown = rows.slice(0, limit);

  if (shown.length === 0) {
    return (
      <Text variant="small" tone="muted">
        No working sets logged in this window.
      </Text>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      {shown.map((r) => (
        <View key={r.group} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text variant="small" weight="600">
              {NAMES[r.group] ?? r.group}
            </Text>
            <Text variant="small" tone="muted" numeric>
              {r.sets % 1 === 0 ? r.sets : r.sets.toFixed(1)} sets
            </Text>
          </View>
          <View
            style={{
              height: 8,
              borderRadius: radius.sm,
              backgroundColor: c.surfaceAlt,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.max(3, Math.round((r.sets / Math.max(top, 1)) * 100))}%`,
                height: '100%',
                borderRadius: radius.sm,
                backgroundColor: c.text,
                opacity: 0.85,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
