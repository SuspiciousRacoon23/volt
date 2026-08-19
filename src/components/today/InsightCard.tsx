import React from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/kit';
import { Bolt } from '@/icons';
import { useTheme } from '@/theme';

export type InsightCardProps = {
  /** One or two sentences from buildInsights. */
  lines: string[];
};

/** Arithmetic on your own data, stated plainly. No encouragement. */
export function InsightCard({ lines }: InsightCardProps) {
  const { c, space } = useTheme();
  if (!lines.length) return null;

  return (
    <Card tone="flat">
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Bolt size={18} color={c.textFaint} strokeWidth={1.75} />
        <View style={{ flex: 1, gap: space.sm }}>
          {lines.map((line) => (
            <Text key={line} variant="body" tone="muted">
              {line}
            </Text>
          ))}
        </View>
      </View>
    </Card>
  );
}
