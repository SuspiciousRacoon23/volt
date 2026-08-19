import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/kit';
import { Warning } from '@/icons';
import { hairline, useTheme } from '@/theme';

export type InstructionsBlockProps = {
  instructions: readonly string[];
  mistakes: readonly string[];
};

function Step({ n, text }: { n: number; text: string }) {
  const { c, radius, space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: radius.pill,
          backgroundColor: c.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        <Text variant="small" tone="muted" numeric weight="700">
          {n}
        </Text>
      </View>
      <Text style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}

export function InstructionsBlock({ instructions, mistakes }: InstructionsBlockProps) {
  const { c, radius, space } = useTheme();

  return (
    <View style={{ gap: space.xxl }}>
      {instructions.length ? (
        <View style={{ gap: space.lg }}>
          <Text variant="label" tone="faint">
            How to do it
          </Text>
          <View style={{ gap: space.lg }}>
            {instructions.map((line, i) => (
              <Step key={line} n={i + 1} text={line} />
            ))}
          </View>
        </View>
      ) : null}

      {mistakes.length ? (
        <View
          style={{
            gap: space.md,
            padding: space.lg,
            borderRadius: radius.lg,
            backgroundColor: c.surfaceAlt,
            borderWidth: hairline,
            borderColor: c.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Warning size={16} color={c.warn} strokeWidth={2} />
            <Text variant="label" color={c.warn}>
              Common mistakes
            </Text>
          </View>
          <View style={{ gap: space.md }}>
            {mistakes.map((m) => (
              <View key={m} style={{ flexDirection: 'row', gap: space.md }}>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: c.warn,
                    marginTop: 9,
                  }}
                />
                <Text variant="body" tone="muted" style={{ flex: 1 }}>
                  {m}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
