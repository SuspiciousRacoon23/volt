import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import {
  dark,
  light,
  radius,
  shadow as shadowLight,
  shadowDark,
  space,
  type,
  type Palette,
  type Radius,
  type Shadow,
  type Space,
  type Type,
} from './tokens';
import { useSettingsSafe } from './storeBridge';

export type Scheme = 'light' | 'dark';

export type Theme = {
  c: Palette;
  scheme: Scheme;
  space: Space;
  radius: Radius;
  type: Type;
  shadow: Shadow;
};

const buildTheme = (scheme: Scheme): Theme => ({
  c: scheme === 'dark' ? dark : light,
  scheme,
  space,
  radius,
  type,
  shadow: scheme === 'dark' ? shadowDark : shadowLight,
});

const fallbackTheme = buildTheme('light');

const ThemeContext = createContext<Theme>(fallbackTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const system = useColorScheme();
  const settings = useSettingsSafe();
  const mode = settings?.themeMode ?? 'system';

  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(() => buildTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Resolved scheme only, for consumers that do not need the full palette. */
export function useScheme(): Scheme {
  return useContext(ThemeContext).scheme;
}
