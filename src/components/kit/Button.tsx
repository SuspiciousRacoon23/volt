import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import type { IconProps } from '@/icons';
import { press as hapticPress, tap as hapticTap } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { Text } from './Text';
import { usePressAnim } from './press';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hand-drawn icon component from `@/icons`, e.g. `icon={Play}`. */
  icon?: React.ComponentType<IconProps>;
  /** Icon placed after the label instead of before it. */
  iconRight?: React.ComponentType<IconProps>;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Suppress the haptic (for a button fired inside an already-buzzing flow). */
  silent?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

const HEIGHT: Record<ButtonSize, number> = { sm: 44, md: 50, lg: 56 };
const PAD: Record<ButtonSize, number> = { sm: 14, md: 18, lg: 22 };

/**
 * Primary is the only lime surface in the kit. One per screen, and it is the
 * thing the user came to tap.
 */
export function Button({
  label,
  onPress,
  variant = 'secondary',
  size,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  silent = false,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const { c, radius, space } = useTheme();
  const anim = usePressAnim(0.97);
  const [pressed, setPressed] = React.useState(false);

  // A primary action is always a full 56pt target.
  const resolvedSize: ButtonSize = size ?? (variant === 'primary' ? 'lg' : 'md');
  const height = variant === 'primary' ? Math.max(HEIGHT[resolvedSize], 56) : HEIGHT[resolvedSize];

  const inert = disabled || loading;

  const surface: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: c.accent },
    secondary: { backgroundColor: c.surface, borderWidth: hairline, borderColor: c.borderStrong },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: c.surfaceAlt, borderWidth: hairline, borderColor: c.border },
  };

  const ink: Record<ButtonVariant, string> = {
    primary: c.accentInk,
    secondary: c.text,
    ghost: c.text,
    danger: c.danger,
  };

  const handlePress = useCallback(() => {
    if (inert) return;
    if (!silent) (variant === 'primary' ? hapticPress : hapticTap)();
    onPress?.();
  }, [inert, onPress, silent, variant]);

  const iconSize = resolvedSize === 'sm' ? 18 : 20;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inert, busy: loading }}
      disabled={inert}
      onPress={handlePress}
      onPressIn={() => {
        setPressed(true);
        anim.onPressIn();
      }}
      onPressOut={() => {
        setPressed(false);
        anim.onPressOut();
      }}
      style={[fullWidth ? styles.full : styles.auto, style]}
    >
      <Animated.View
        style={[
          styles.base,
          surface[variant],
          {
            height,
            borderRadius: variant === 'ghost' ? radius.md : radius.lg,
            paddingHorizontal: variant === 'ghost' ? space.sm : PAD[resolvedSize],
            gap: space.sm,
            opacity: inert ? 0.45 : 1,
          },
          anim.style,
        ]}
      >
        {/* Pressed darkening. accentInk is near-black in both schemes, so this
            reads as a press on lime, on white and on near-black alike. */}
        {pressed && !inert ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: c.accentInk,
                opacity: variant === 'primary' ? 0.16 : 0.07,
                borderRadius: variant === 'ghost' ? radius.md : radius.lg,
              },
            ]}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator size="small" color={ink[variant]} />
        ) : (
          <>
            {Icon ? <Icon size={iconSize} color={ink[variant]} strokeWidth={2} /> : null}
            <Text
              variant={resolvedSize === 'sm' ? 'small' : 'body'}
              color={ink[variant]}
              weight="700"
              numberOfLines={1}
            >
              {label}
            </Text>
            {IconRight ? <IconRight size={iconSize} color={ink[variant]} strokeWidth={2} /> : null}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
