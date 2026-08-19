import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/kit';
import type { Session, Unit } from '@/data';
import { relative } from '@/lib';
import { useTheme } from '@/theme';
import { SessionRecap } from './SessionRecap';

export type RestDayHeroProps = {
  /** The last completed session, for the recap. Null on a brand new account. */
  last: Session | null;
  unit: Unit;
  daysSinceTraining: number | null;
  deload: boolean;
  onTrainAnyway: () => void;
};

/**
 * A scheduled rest day is a planned part of the week, not an empty screen.
 * It states the recovery position, recaps the last session, and still leaves
 * a door open to train.
 */
export function RestDayHero({
  last,
  unit,
  daysSinceTraining,
  deload,
  onTrainAnyway,
}: RestDayHeroProps) {
  const { space } = useTheme();

  return (
    <View style={{ gap: space.lg }}>
      <Text variant="label" tone="faint">
        {deload ? 'Today · Deload week' : 'Today'}
      </Text>

      <Text variant="display" style={{ marginTop: -space.xs }}>
        Rest day
      </Text>

      <Text variant="body" tone="muted">
        {restLine(daysSinceTraining, deload)}
      </Text>

      {last ? (
        <View style={{ gap: space.md, marginTop: space.xs }}>
          <Text variant="label" tone="faint">
            {`Last session · ${last.name} · ${relative(last.startedAt)}`}
          </Text>
          <SessionRecap session={last} unit={unit} />
        </View>
      ) : null}

      <Button
        label="Train anyway"
        onPress={onTrainAnyway}
        variant="secondary"
        size="lg"
        fullWidth
        style={{ marginTop: space.xs }}
      />
    </View>
  );
}

function restLine(days: number | null, deload: boolean): string {
  if (deload) {
    return 'Nothing is scheduled. This is a deload week, so the rest is doing the work.';
  }
  if (days === null) {
    return 'Nothing is scheduled today. Recovery is where the last session gets paid for.';
  }
  if (days === 0) return 'Nothing further is scheduled. You have already trained today.';
  if (days === 1) return 'Nothing is scheduled today. You trained yesterday, so this is earned.';
  if (days <= 3) {
    return `Nothing is scheduled today. It has been ${days} days since your last session.`;
  }
  return `Nothing is scheduled today. It has been ${days} days since you last trained.`;
}
