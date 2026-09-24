import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import {
  Theme,
  ThemeColors,
  ColorScheme,
  darkTheme,
  lightTheme,
  whiteTheme,
  darkColors,
  spacing,
  radius,
  typography,
} from './theme';
import { useSettingsStore } from '../stores/settingsStore';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  scheme: ColorScheme;
  setScheme: (s: ColorScheme | null) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEMES: Record<ColorScheme, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  white: whiteTheme,
};

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const settings = useSettingsStore((s) => s.settings);
  const refreshSettings = useSettingsStore((s) => s.refresh);
  // Snapshot local do override (para aplicar imediatamente antes do DB terminar)
  const [localOverride, setLocalOverride] = useState<ColorScheme | null>(null);

  // Carrega settings no mount (caso ainda nao tenha sido carregado)
  useEffect(() => {
    if (!settings) void refreshSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Override persistido tem prioridade; senao segue o sistema
  const persistedOverride = (settings?.theme_override ?? null) as ColorScheme | null;
  const active = localOverride ?? persistedOverride;
  const scheme: ColorScheme = active ?? (system === 'light' ? 'light' : 'dark');
  const theme = THEMES[scheme];

  const setScheme = async (s: ColorScheme | null) => {
    setLocalOverride(s); // aplica imediato
    await useSettingsStore.getState().update({ theme_override: s });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: theme.colors,
      spacing: theme.spacing,
      radius: theme.radius,
      typography: theme.typography,
      scheme,
      setScheme,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, scheme],
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
      setScheme: async () => {},
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
