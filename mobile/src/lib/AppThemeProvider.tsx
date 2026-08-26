import React, { createContext, useContext, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import {
  Theme,
  ThemeColors,
  ColorScheme,
  darkTheme,
  lightTheme,
  darkColors,
  spacing,
  radius,
  typography,
} from './theme';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  scheme: ColorScheme;
  override: ColorScheme | null;
  setOverride: (s: ColorScheme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const scheme: ColorScheme = override ?? (system === 'light' ? 'light' : 'dark');
  const theme = scheme === 'light' ? lightTheme : darkTheme;
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: theme.colors,
      spacing: theme.spacing,
      radius: theme.radius,
      typography: theme.typography,
      scheme,
      override,
      setOverride,
    }),
    [theme, scheme, override],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook para acessar o tema ativo + tokens derivados.
 * - `theme`  : objeto completo (debug, helpers custom)
 * - `colors` : tokens de cor (use direto: `colors.accent`)
 * - `spacing`/`radius`/`typography` : design tokens
 *
 * Se usado fora de AppThemeProvider, retorna dark como fallback.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: darkTheme,
      colors: darkColors,
      spacing,
      radius,
      typography,
      scheme: 'dark',
      override: null,
      setOverride: () => {},
    };
  }
  return ctx;
}

/**
 * Helper para criar StyleSheet memoizado baseado no tema.
 * Re-cria o StyleSheet apenas quando o tema mudar (não a cada render).
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const { theme } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
