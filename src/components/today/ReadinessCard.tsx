import React from 'react';
import { View } from 'react-native';

import { Button, Card, Ring, Text } from '@/components/kit';
import type { Readiness } from '@/data';
import { Brain, ChevronRight } from '@/icons';
import { readinessScore, readinessSummary, readinessVerdict } from '@/lib';
import { useReducedMotion, useTheme } from '@/theme';

export type ReadinessCardProps = {
  /** Today's check-in, or null when it has not been done yet. */
  readiness: Readiness | null;
  onOpen: () => void;
};

/** Ten seconds of self-report, or the verdict it produced. */
export function ReadinessCard({ readiness, onOpen }: ReadinessCardProps) {
  const { c, space } = useTheme();
  const reduced = useReducedMotion();

  if (!readiness) {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
          <Brain size={22} color={c.textMuted} strokeWidth={1.75} />
          <View style={{ flex: 1, gap: space.xs }}>
            <Text variant="h2">How are you today?</Text>
            <Text variant="small" tone="muted">
              Six questions, about ten seconds. It sets what today should ask of you.
            </Text>
          </View>
        </View>
        <Button
          label="Check in"
          onPress={onOpen}
          variant="secondary"
          size="md"
          fullWidth
          style={{ marginTop: space.lg }}
        />
      </Card>
    );
  }

  const score = readinessScore(readiness);
  const verdict = readinessVerdict(readiness);

  return (
    <Card onPress={onOpen} accessibilityLabel={`Readiness ${verdict}, ${score} out of 100`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Ring
          progress={score / 100}
          size={62}
          thickness={5}
          color={c.text}
          trackColor={c.surfaceAlt}
          animated={!reduced}
        >
          <Text variant="h2" numeric>
            {score}
          </Text>
        </Ring>

        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="label" tone="faint">
            Readiness
          </Text>
          <Text variant="h2">{verdict}</Text>
        </View>

        <ChevronRight size={20} color={c.textFaint} strokeWidth={1.75} />
      </View>

      <Text variant="small" tone="muted" style={{ marginTop: space.md }}>
        {readinessSummary(readiness)}
      </Text>
    </Card>
  );
}
