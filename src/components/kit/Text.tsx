import React from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type TypeVariant } from '@/theme';

export type TextTone =
  | 'default'
  | 'muted'
  | 'faint'
  | 'accent'
  | 'danger'
  | 'warn'
  | 'onAccent'
  | 'inverse';

export type TextProps = Omit<RNTextProps, 'style'> & {
  /** Key of the theme type scale. Defaults to `body`. */
  variant?: TypeVariant;
  /** Semantic colour role. Defaults to `default`. */
  tone?: TextTone;
  /** Tabular numerals — use for anything that changes in place (weights, timers). */
  numeric?: boolean;
  /** Force upper case. The `label` variant does this on its own. */
  uppercase?: boolean;
  center?: boolean;
  /** Escape hatch for a palette colour a tone does not cover. */
  color?: string;
  weight?: TextStyle['fontWeight'];
  /** Slight optical tightening for large numbers set in `display`/`title`. */
  style?: RNTextProps['style'];
  children?: React.ReactNode;
};

/**
 * The only text component in VOLT. Every string on screen goes through it so
 * the type scale and the palette stay in one place.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  numeric,
  uppercase,
  center,
  color,
  weight,
  style,
  children,
  ...rest
}: TextProps) {
  const { c, type } = useTheme();

  const toneColour: Record<TextTone, string> = {
    default: c.text,
    muted: c.textMuted,
    faint: c.textFaint,
    accent: c.accent,
    danger: c.danger,
    warn: c.warn,
    onAccent: c.accentInk,
    inverse: c.bg,
  };

  const upper = uppercase ?? variant === 'label';

  const content =
    upper && typeof children === 'string' ? children.toUpperCase() : children;

  return (
    <RNText
      allowFontScaling
      {...rest}
      style={[
        type[variant] as TextStyle,
        { color: color ?? toneColour[tone] },
        numeric ? styles.numeric : null,
        upper ? styles.upper : null,
        center ? styles.center : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {content}
    </RNText>
  );
}

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
  upper: { textTransform: 'uppercase' },
  center: { textAlign: 'center' },
});
