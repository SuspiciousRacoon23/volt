import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Card, ProgressBar, Ring, Text } from '@/components/kit';
import type { Readiness } from '@/data/types';
import { Info } from '@/icons';
import {
  READINESS_CAVEAT,
  readinessFactors,
  readinessScore,
  readinessSummary,
  readinessVerdict,
} from '@/lib';
import { useTheme } from '@/theme';

/** Ready is the only verdict that earns lime. */
function verdictColor(verdict: string, c: { accent: string; text: string; warn: string }): string {
  if (verdict === 'Ready') return c.accent;
  if (verdict === 'Recover') return c.warn;
  return c.text;
}

export function VerdictPanel({ readiness }: { readiness: Readiness }): React.JSX.Element {
  const { c, space } = useTheme();

  const score = readinessScore(readiness);
  const verdict = readinessVerdict(readiness);
  const summary = readinessSummary(readiness);
  const tint = verdictColor(verdict, c);

  const drivers = useMemo(() => {
    const factors = readinessFactors(readiness);
    return [...factors].sort((a, b) => a.normalised - b.normalised).slice(0, 3);
  }, [readiness]);

  return (
    <View style={{ gap: space.lg }}>
      <Card tone="plain">
        <View style={{ alignItems: 'center', gap: space.lg, paddingVertical: space.md }}>
          <Ring progress={score / 100} size={148} thickness={10} color={tint}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="title" numeric>
                {score}
              </Text>
              <Text variant="label" tone="faint">
                Score
              </Text>
            </View>
          </Ring>

          <View style={{ alignItems: 'center', gap: space.xs }}>
            <Text variant="h1" color={tint}>
              {verdict}
            </Text>
            <Text variant="body" tone="muted" center>
              {summary}
            </Text>
          </View>
        </View>
      </Card>

      <Card tone="plain" title="What drove it">
        <View style={{ gap: space.md, marginTop: space.sm }}>
          {drivers.map((f) => (
            <View key={f.key} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="small">{f.label}</Text>
                <Text variant="small" tone="faint" numeric>
                  {Math.round(f.weight * 100)}% weight
                </Text>
              </View>
              <ProgressBar value={f.normalised} tone="neutral" height={6} />
            </View>
          ))}
          <Text variant="small" tone="faint">
            Soreness and joints carry the most weight because they predict a bad
            session more reliably than anything else you answered.
          </Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: space.xs }}>
        <Info size={18} color={c.textFaint} />
        <Text variant="small" tone="faint" style={{ flex: 1 }}>
          {READINESS_CAVEAT}
        </Text>
      </View>
    </View>
  );
}
