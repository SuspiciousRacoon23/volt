import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/kit';
import type { PR, Session, Unit } from '@/data';
import { Check } from '@/icons';
import { timeLabel } from '@/lib';
import { hairline, useTheme } from '@/theme';
import { SessionRecap } from './SessionRecap';

export type TrainedTodayHeroProps = {
  session: Session;
  unit: Unit;
  prs: PR[];
  onTrainAgain: () => void;
};

/**
 * Once the day's work is logged the screen goes quiet. No start button
 * shouting at someone who has already finished — just the record.
 */
export function TrainedTodayHero({ session, unit, prs, onTrainAgain }: TrainedTodayHeroProps) {
  const { c, radius, space } = useTheme();

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.accent,
          }}
        >
          <Check size={13} color={c.accentInk} strokeWidth={2.4} />
        </View>
        <Text variant="label" tone="faint">
          {`Completed · ${timeLabel(session.startedAt)}`}
        </Text>
      </View>

      <Text variant="title" numberOfLines={2} style={{ marginTop: -space.xs }}>
        {session.name}
      </Text>

      <SessionRecap session={session} unit={unit} />

      {prs.length ? (
        <View
          style={{
            paddingVertical: space.md,
            paddingHorizontal: space.lg,
            borderRadius: radius.md,
            backgroundColor: c.surface,
            borderWidth: hairline,
            borderColor: c.border,
          }}
        >
          <Text variant="small" tone="muted">
            {prs.length === 1
              ? 'You set one personal record in this session.'
              : `You set ${prs.length} personal records in this session.`}
          </Text>
        </View>
      ) : null}

      <Button
        label="Train again"
        onPress={onTrainAgain}
        variant="ghost"
        size="md"
        fullWidth
        style={{ marginTop: -space.xs }}
      />
    </View>
  );
}
