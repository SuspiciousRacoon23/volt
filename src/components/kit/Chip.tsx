import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { IconProps } from '@/icons';
import { select as hapticSelect } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { Text } from './Text';
import { usePressAnim } from './press';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ComponentType<IconProps>;
  /** Trailing count, e.g. a filter match total. */
  count?: number;
  size?: 'sm' | 'md';
  /**
   * Selected chips invert to ink by default. Set `accent` only when the chip
   * genuinely means progress, a record or an improvement.
   */
  accent?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Chip({
  label,
  selected = false,
  onPress,
  icon: Icon,
  count,
  size = 'md',
  accent = false,
  disabled = false,
  style,
  testID,
}: ChipProps) {
  const { c, radius, space } = useTheme();
  const anim = usePressAnim(0.95);

  const height = size === 'sm' ? 30 : 36;
  const interactive = Boolean(onPress) && !disabled;

  const bg = selected ? (accent ? c.accent : c.text) : c.surfaceAlt;
  const ink = selected ? (accent ? c.accentInk : c.bg) : c.textMuted;

  const inner = (
    <Animated.View
      style={[
        {
          height,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.xs + 2,
          paddingHorizontal: size === 'sm' ? space.md : space.lg - 2,
          borderRadius: radius.pill,
          backgroundColor: bg,
          borderWidth: selected ? 0 : hairline,
          borderColor: c.border,
          opacity: disabled ? 0.4 : 1,
        },
        interactive ? anim.style : null,
        style,
      ]}
    >
      {Icon ? <Icon size={size === 'sm' ? 14 : 16} color={ink} strokeWidth={2} /> : null}
      <Text variant="small" color={ink} weight="600" numberOfLines={1}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Text variant="small" color={ink} weight="600" numeric style={{ opacity: 0.6 }}>
          {String(count)}
        </Text>
      ) : null}
    </Animated.View>
  );

  if (!interactive) return <View testID={testID}>{inner}</View>;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={{ top: 6, bottom: 6 }}
      disabled={disabled}
      onPress={() => {
        hapticSelect();
        onPress?.();
      }}
      onPressIn={anim.onPressIn}
      onPressOut={anim.onPressOut}
    >
      {inner}
    </Pressable>
  );
}
