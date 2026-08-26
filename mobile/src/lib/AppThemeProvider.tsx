import React, { createContext, useContext, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { Theme, darkTheme, ColorScheme } from './theme';

interface ThemeContextValue {
  theme: Theme;
  scheme: ColorScheme;
  override: ColorScheme | null;
  setOverride: (s: ColorScheme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);
  // default scheme: 'dark' quando system for 'dark' ou null/undefined
  const scheme: ColorScheme = override ?? (system === 'light' ? 'light' : 'dark');
  const theme = scheme === 'light' ? lightTheme : darkTheme;
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, scheme, override, setOverride }),
    [theme, scheme, override],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook para acessar o tema ativo + controles.
 * Se usado fora de AppThemeProvider, retorna dark (fallback).
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: darkTheme,
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
 *
 * @example
 *   const s = useStyles(({ colors, spacing }) => ({
 *     root: { backgroundColor: colors.base, padding: spacing.lg },
 *   }));
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const { theme } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
