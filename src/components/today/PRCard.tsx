import React from 'react';
import { Pressable, View } from 'react-native';

import { Card, Divider, Text } from '@/components/kit';
import type { Exercise, ID, PR, Unit } from '@/data';
import { Trophy } from '@/icons';
import { fmtVolume, fmtWeight, relative } from '@/lib';
import { useTheme } from '@/theme';

export type PRCardProps = {
  prs: PR[];
  exercises: Record<ID, Exercise>;
  unit: Unit;
  onOpenExercise: (exerciseId: ID) => void;
};

/** Records are one of the few things that earn lime, and only the mark does. */
export function PRCard({ prs, exercises, unit, onOpenExercise }: PRCardProps) {
  const { c, space } = useTheme();
  if (!prs.length) return null;

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          marginBottom: space.md,
        }}
      >
        <Trophy size={17} color={c.accent} strokeWidth={1.9} />
        <Text variant="label" tone="faint">
          Recent records
        </Text>
      </View>

      {prs.map((pr, i) => {
        const name = exercises[pr.exerciseId]?.name ?? 'Unknown exercise';
        return (
          <View key={pr.id}>
            {i > 0 ? <Divider spacing={space.md} /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${kindLabel(pr.kind)}`}
              onPress={() => onOpenExercise(pr.exerciseId)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                minHeight: 44,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" weight="700" numberOfLines={1}>
                  {name}
                </Text>
                <Text variant="small" tone="muted" numeric>
                  {`${kindLabel(pr.kind)} · ${prValue(pr, unit)}`}
                </Text>
              </View>
              <Text variant="small" tone="faint">
                {relative(pr.ts)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

function kindLabel(kind: PR['kind']): string {
  switch (kind) {
    case 'weight':
      return 'Heaviest set';
    case 'reps':
      return 'Most reps';
    case 'volume':
      return 'Most volume';
    default:
      return 'Estimated max';
  }
}

function prValue(pr: PR, unit: Unit): string {
  if (pr.kind === 'volume') return fmtVolume(pr.value, unit);
  if (pr.kind === 'reps') {
    const load = pr.weight ? ` at ${fmtWeight(pr.weight, unit)}` : '';
    return `${Math.round(pr.value)} reps${load}`;
  }
  return fmtWeight(pr.value, unit);
}
