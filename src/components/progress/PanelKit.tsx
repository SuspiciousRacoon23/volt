import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Chip, Text } from '@/components/kit';
import { useTheme } from '@/theme';

/**
 * The small shared furniture of the Progress screen: the headline sentence
 * every panel opens with, a section wrapper, and a range switch.
 */

export function Headline({ text, caption }: { text: string; caption: string }) {
  const { space } = useTheme();
  return (
    <View style={{ gap: space.sm, marginBottom: space.xl }}>
      <Text variant="label" tone="faint">
        {caption}
      </Text>
      <Text variant="h1" style={{ maxWidth: 460 }}>
        {text}
      </Text>
    </View>
  );
}

export function Section({
  title,
  right,
  children,
  style,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { space } = useTheme();
  return (
    <View style={[{ marginTop: space.xxl }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
          marginBottom: space.md,
          minHeight: 20,
        }}
      >
        <Text variant="label" tone="faint" style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export type RangeOption<T extends string> = { value: T; label: string };

export function RangeSwitch<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly RangeOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.xs + 2 }}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          size="sm"
          selected={o.value === value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}

/** A quiet note. Used for the privacy line above progress photos. */
export function Notice({ children }: { children: React.ReactNode }) {
  const { c, radius, space } = useTheme();
  return (
    <View
      style={{
        backgroundColor: c.surfaceAlt,
        borderRadius: radius.md,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
      }}
    >
      <Text variant="small" tone="muted">
        {children}
      </Text>
    </View>
  );
}
