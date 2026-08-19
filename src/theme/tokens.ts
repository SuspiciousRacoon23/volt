import { Platform, StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

/**
 * VOLT design tokens.
 * White / black / grey + electric lime. Lime is scarce: primary action,
 * completed set, progress fill, personal record, improvement. Nothing else.
 */

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string; // electric lime
  accentSoft: string; // low-alpha lime wash for fills
  accentInk: string; // text/icon colour placed ON accent
  danger: string;
  warn: string;
  scrim: string;
};

export const light: Palette = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceAlt: '#F1F1F3',
  border: '#E6E6E9',
  borderStrong: '#D2D2D7',
  text: '#08080A',
  textMuted: '#6B6B75',
  textFaint: '#A6A6AF',
  accent: '#CCFF00',
  accentSoft: 'rgba(204,255,0,0.16)',
  accentInk: '#08080A',
  danger: '#E5484D',
  warn: '#F5A524',
  scrim: 'rgba(8,8,10,0.45)',
};

export const dark: Palette = {
  bg: '#08080A',
  surface: '#121214',
  surfaceAlt: '#1B1B1F',
  border: '#26262B',
  borderStrong: '#3A3A41',
  text: '#FAFAFA',
  textMuted: '#9B9BA5',
  textFaint: '#6B6B75',
  accent: '#CCFF00',
  accentSoft: 'rgba(204,255,0,0.14)',
  accentInk: '#08080A',
  danger: '#FF6369',
  warn: '#FFB224',
  scrim: 'rgba(0,0,0,0.6)',
};

export const palettes = { light, dark } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export type Space = typeof space;

export const radius = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 } as const;
export type Radius = typeof radius;

/**
 * Type scale. Every entry is TextStyle-compatible so consumers can spread
 * `...type.h1` into a style object without a cast.
 */
export const type = {
  display: { fontSize: 52, lineHeight: 52, fontWeight: '800', letterSpacing: -2 },
  title: { fontSize: 32, lineHeight: 36, fontWeight: '800', letterSpacing: -1 },
  h1: { fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.6 },
  h2: { fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.4 }, // render UPPERCASE
} as const satisfies Record<string, TextStyle>;
export type Type = typeof type;
export type TypeVariant = keyof Type;

export type Shadow = { card: ViewStyle; lifted: ViewStyle };

/**
 * Whisper-soft elevation only. Shadows separate a surface from the page;
 * they are never a visual effect in their own right.
 */
const softShadow = (
  y: number,
  blur: number,
  opacity: number,
  elevation: number,
  colour: string,
  webAlpha: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: colour,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation, shadowColor: colour },
    default: { boxShadow: `0px ${y}px ${blur}px rgba(8,8,10,${webAlpha})` } as ViewStyle,
  }) as ViewStyle;

/** Light-scheme elevation. */
export const shadow: Shadow = {
  card: softShadow(2, 8, 0.05, 1, '#08080A', 0.05),
  lifted: softShadow(8, 20, 0.09, 4, '#08080A', 0.09),
};

/**
 * Dark-scheme elevation. A drop shadow under a near-black surface reads as mud,
 * so it is pulled back further and depth is carried mostly by `surfaceAlt`.
 */
export const shadowDark: Shadow = {
  card: softShadow(2, 10, 0.28, 1, '#000000', 0.3),
  lifted: softShadow(10, 26, 0.42, 5, '#000000', 0.45),
};

export const shadows = { light: shadow, dark: shadowDark } as const;

/** Minimum touch target sizes, in points. */
export const hit = { min: 44, primary: 56 } as const;

/** Hairline border width that stays crisp on every density. */
export const hairline: number = Platform.OS === 'web' ? 1 : StyleSheet.hairlineWidth;
