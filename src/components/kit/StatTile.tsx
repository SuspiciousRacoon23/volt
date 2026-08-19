import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { IconProps } from '@/icons';
import { tap as hapticTap } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { Text } from './Text';
import { usePressAnim } from './press';

export type StatTileProps = {
  label: string;
  value: string | number;
  /** Rendered smaller, right after the value — 'kg', 'min', 'sets'. */
  unit?: string;
  /** Signed change, already formatted, e.g. '+7.5%'. */
  delta?: string;
  /** `up` renders lime (an improvement). `down` renders muted, never red, unless `danger`. */
  deltaTone?: 'up' | 'down' | 'flat' | 'danger';
  icon?: React.ComponentType<IconProps>;
  footnote?: string;
  /** Emphasise the whole tile — reserve for a record. */
  accent?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaTone = 'flat',
  icon: Icon,
  footnote,
  accent = false,
  onPress,
  size = 'md',
  style,
  testID,
}: StatTileProps) {
  const { c, radius, space } = useTheme();
  const anim = usePressAnim(0.98);

  const deltaColour =
    deltaTone === 'up' ? c.accent : deltaTone === 'danger' ? c.danger : c.textMuted;

  const body = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 }}>
        {Icon ? <Icon size={13} color={c.textFaint} strokeWidth={2} /> : null}
        <Text variant="label" tone="faint" numberOfLines={1} style={{ flexShrink: 1 }}>
          {label}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: space.sm }}>
        <Text variant={size === 'sm' ? 'h1' : 'title'} numeric numberOfLines={1}>
          {String(value)}
        </Text>
        {unit ? (
          <Text variant="small" tone="muted" weight="600">
            {unit}
          </Text>
        ) : null}
      </View>

      {delta || footnote ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            marginTop: space.xs,
          }}
        >
          {delta ? (
            <Text variant="small" color={deltaColour} weight="700" numeric>
              {delta}
            </Text>
          ) : null}
          {footnote ? (
            <Text variant="small" tone="faint" numberOfLines={1} style={{ flexShrink: 1 }}>
              {footnote}
            </Text>
          ) : null}
        </View>
      ) : null}
    </>
  );

  const container: StyleProp<ViewStyle> = [
    {
      flex: 1,
      minWidth: 120,
      padding: size === 'sm' ? space.md : space.lg,
      borderRadius: radius.lg,
      backgroundColor: accent ? c.accentSoft : c.surface,
      borderWidth: hairline,
      borderColor: accent ? c.accent : c.border,
    },
    style,
  ];

  if (!onPress) {
    return (
      <View testID={testID} style={container}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${String(value)}${unit ? ` ${unit}` : ''}`}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      onPressIn={anim.onPressIn}
      onPressOut={anim.onPressOut}
      style={{ flex: 1 }}
    >
      <Animated.View style={[container, anim.style]}>{body}</Animated.View>
    </Pressable>
  );
}
