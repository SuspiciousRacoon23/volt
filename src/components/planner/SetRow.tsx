import React from 'react';
import { Pressable, View } from 'react-native';

import type { PlannedSet, Unit } from '@/data/types';
import { Close } from '@/icons';
import { displayWeight, fmtWeight, toKg, unitLabel } from '@/lib/units';
import { hairline, useTheme } from '@/theme';
import { Chip, IconButton, Stepper, Text } from '@/components/kit';

export type SetRowProps = {
  set: PlannedSet;
  /** Working-set ordinal, or null for warm-up and drop sets. */
  number: number | null;
  unit: Unit;
  expanded: boolean;
  canRemove: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PlannedSet>) => void;
  onRemove: () => void;
};

const RPE_CHOICES = [6, 7, 8, 9, 10];

function badgeText(set: PlannedSet, number: number | null): string {
  if (set.kind === 'warmup') return 'W';
  if (set.kind === 'drop') return 'D';
  if (set.kind === 'failure') return 'F';
  return String(number ?? 1);
}

/**
 * One planned set. Collapsed it is a single readable line; tapped it opens the
 * two steppers that actually change it. Warm-ups are outlined, working sets are
 * solid, drop sets sit indented under the set they follow.
 */
export function SetRow({
  set, number, unit, expanded, canRemove, onToggle, onChange, onRemove,
}: SetRowProps) {
  const { c, radius, space } = useTheme();

  const warmup = set.kind === 'warmup';
  const drop = set.kind === 'drop';
  const step = unit === 'kg' ? 2.5 : 5;
  const weightValue = set.weight == null ? 0 : displayWeight(set.weight, unit);

  const summary = set.weight == null ? 'weight open' : fmtWeight(set.weight, unit);

  return (
    <View style={{ marginLeft: drop ? space.xl : 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Set ${badgeText(set, number)}, ${set.reps} reps, ${summary}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingRight: space.xs,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: warmup ? 'transparent' : c.surfaceAlt,
            borderWidth: warmup ? hairline : 0,
            borderColor: c.borderStrong,
          }}
        >
          <Text variant="small" weight="700" tone={warmup ? 'faint' : 'default'}>
            {badgeText(set, number)}
          </Text>
        </View>

        <Text variant="body" numeric weight="700">
          {set.reps}
          <Text variant="small" tone="faint" weight="700">
            {' reps'}
          </Text>
        </Text>

        <Text variant="small" tone="faint">·</Text>

        <Text variant="body" numeric tone={set.weight == null ? 'faint' : 'default'} weight="700">
          {set.weight == null ? '—' : String(weightValue)}
          <Text variant="small" tone="faint" weight="700">
            {` ${unitLabel(unit)}`}
          </Text>
        </Text>

        <View style={{ flex: 1 }} />

        {set.rpe != null && !expanded ? (
          <Text variant="small" tone="faint" numeric>{`RPE ${set.rpe}`}</Text>
        ) : null}
      </Pressable>

      {expanded ? (
        <View
          style={{
            gap: space.md,
            paddingTop: space.sm,
            paddingBottom: space.lg,
            paddingLeft: 40,
          }}
        >
          <Stepper
            label="Reps"
            size="sm"
            value={set.reps}
            min={1}
            max={100}
            step={1}
            onChange={(v) => onChange({ reps: v })}
          />
          <Stepper
            label={`Target weight (${unitLabel(unit)})`}
            size="sm"
            value={weightValue}
            min={0}
            max={1000}
            step={step}
            formatValue={(v) => (v <= 0 ? '—' : String(v))}
            onChange={(v) => onChange({ weight: v <= 0 ? null : toKg(v, unit) })}
          />

          <View style={{ gap: space.sm }}>
            <Text variant="label" tone="faint">Target effort</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Chip
                label="None"
                size="sm"
                selected={set.rpe == null}
                onPress={() => onChange({ rpe: null })}
              />
              {RPE_CHOICES.map((r) => (
                <Chip
                  key={r}
                  label={`RPE ${r}`}
                  size="sm"
                  selected={set.rpe === r}
                  onPress={() => onChange({ rpe: r })}
                />
              ))}
            </View>
          </View>

          {canRemove ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <IconButton icon={Close} label="Remove this set" variant="outline" onPress={onRemove} />
              <Text variant="small" tone="muted">Remove this set</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
