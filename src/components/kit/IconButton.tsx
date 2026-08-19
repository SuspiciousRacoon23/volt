import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { IconProps } from '@/icons';
import { tap as hapticTap } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { usePressAnim } from './press';

export type IconButtonVariant = 'plain' | 'surface' | 'outline' | 'accent' | 'danger';

export type IconButtonProps = {
  icon: React.ComponentType<IconProps>;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Required — an icon-only control must announce itself. */
  label: string;
  variant?: IconButtonVariant;
  /** Touch target. Never below 44. */
  size?: number;
  iconSize?: number;
  strokeWidth?: number;
  filled?: boolean;
  disabled?: boolean;
  /** Selected state — inverts a `surface` button. */
  active?: boolean;
  silent?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function IconButton({
  icon: Icon,
  onPress,
  onLongPress,
  label,
  variant = 'plain',
  size = 44,
  iconSize,
  strokeWidth = 1.75,
  filled,
  disabled = false,
  active = false,
  silent = false,
  style,
  testID,
}: IconButtonProps) {
  const { c, radius } = useTheme();
  const anim = usePressAnim(0.92);
  const [pressed, setPressed] = React.useState(false);

  const target = Math.max(size, 44);
  const glyph = iconSize ?? Math.round(target * 0.5);

  const surface: Record<IconButtonVariant, ViewStyle> = {
    plain: { backgroundColor: 'transparent' },
    surface: { backgroundColor: active ? c.text : c.surfaceAlt },
    outline: { backgroundColor: 'transparent', borderWidth: hairline, borderColor: c.border },
    accent: { backgroundColor: c.accent },
    danger: { backgroundColor: c.surfaceAlt },
  };

  const ink: Record<IconButtonVariant, string> = {
    plain: active ? c.accent : c.text,
    surface: active ? c.bg : c.text,
    outline: c.text,
    accent: c.accentInk,
    danger: c.danger,
  };

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (!silent) hapticTap();
    onPress?.();
  }, [disabled, onPress, silent]);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      hitSlop={6}
      disabled={disabled}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={() => {
        setPressed(true);
        anim.onPressIn();
      }}
      onPressOut={() => {
        setPressed(false);
        anim.onPressOut();
      }}
      style={style}
    >
      <Animated.View
        style={[
          styles.base,
          surface[variant],
          {
            width: target,
            height: target,
            borderRadius: radius.pill,
            opacity: disabled ? 0.4 : 1,
          },
          anim.style,
        ]}
      >
        {pressed && !disabled ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: c.accentInk, opacity: 0.08, borderRadius: radius.pill },
            ]}
          />
        ) : null}
        <Icon size={glyph} color={ink[variant]} strokeWidth={strokeWidth} filled={filled} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
