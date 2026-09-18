// ─── THEME: FINTECH ULTRA-PREMIUM (NEON GREEN) ────────────────────────────────
// Paleta principal (DARK - atual)
//   - bg-canvas #0A0D0A   (fundo dark com matiz oliva/grafite)
//   - accent   #CCF050     (neon green / lime - CTAs e destaques)
//   - accent2  #E2FF00     (variante mais saturada para o hero)
//   - accent-soft #E3FA7B  (cards internos de destaque)
//   - surface-1 #162016    (botoes escuros, numpad, cards secundarios)
//   - surface-2 #1F2E1F    (hover/pressed, bordas ativas)
//   - text-strong #FFFFFF
//   - text-on-neon #000000
//   - text-muted #7A8977
//   - status-neg #FF5252 / status-pos #00E676

// ─── TOKENS ESTÁTICOS (não mudam com tema) ───────────────────────────────────
export const radius = {
  display: 32,
  card: 24,
  button: 20,
  pill: 9999,
  small: 12,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typography = {
  fontFamily: {
    mono: 'monospace',
    sans: undefined as string | undefined,
  },
  size: {
    xs: 10,
    sm: 11,
    md: 13,
    lg: 14,
    xl: 18,
    xxl: 22,
    hero: 36,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },
  letterSpacing: {
    tight: -1,
    snug: -0.3,
    wide: 1.2,
  },
} as const;

// ─── PALETAS ────────────────────────────────────────────────────────────────

/** Dark theme — paleta atual (referência). */
export const darkColors = {
  bgCanvas: '#0A0D0A',
  base: '#0A0D0A',
  accent: '#CCF050',
  accentBright: '#E2FF00',
  accentSoft: '#E3FA7B',
  surfaceDark1: '#162016',
  surfaceDark2: '#1F2E1F',
  surface: '#162016',
  surfaceHigh: '#1F2E1F',
  text: '#FFFFFF',
  textStrong: '#FFFFFF',
  textOnNeon: '#000000',
  textMuted: '#7A8977',
  muted: '#7A8977',
  border: 'rgba(204, 240, 80, 0.08)',
  borderStrong: 'rgba(204, 240, 80, 0.18)',
  success: '#00E676',
  warn: '#FBBF24',
  danger: '#FF5252',
} as const;

/**
 * Light theme — paleta otimizada para modo claro.
 *
 * Mantem a identidade neon (#CCF050 accent) porem com backgrounds
 * claros o suficiente pra ler confortavelmente durante o dia.
 *
 * Hierarquia:
 *  - bgCanvas/base (#F8F9F3) — fundo neutro levemente amarelado
 *  - surface (#EEF0E5) — cards com leve elevacao
 *  - surfaceHigh (#FFFFFF) — inputs e elementos mais altos
 *  - text (#0A0D0A) — preto grafite (mesmo do bgCanvas dark)
 *  - textMuted (#5A6959) — verde musgo desaturado (combina com accent)
 */
export const lightColors = {
  bgCanvas: '#F8F9F3',
  base: '#F8F9F3',
  accent: '#CCF050',
  accentBright: '#7AB800',
  accentSoft: '#E3FA7B',
  surfaceDark1: '#E5E8D8',
  surfaceDark2: '#D8DBC6',
  surface: '#EEF0E5',
  surfaceHigh: '#FFFFFF',
  text: '#0A0D0A',
  textStrong: '#0A0D0A',
  textOnNeon: '#000000',
  textMuted: '#5A6959',
  muted: '#5A6959',
  border: 'rgba(10, 13, 10, 0.12)',
  borderStrong: 'rgba(10, 13, 10, 0.25)',
  success: '#00A853',
  warn: '#C77800',
  danger: '#D32F2F',
} as const;

// ─── TEMAS COMPLETOS ───────────────────────────────────────────────────────
export type ColorScheme = 'light' | 'dark';
/** Cores de qualquer tema (dark ou light) — uniao para flexibilidade */
export type ThemeColors = typeof darkColors | typeof lightColors;
export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  scheme: ColorScheme;
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  scheme: 'dark',
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  scheme: 'light',
};

// ─── BACK-COMPAT ────────────────────────────────────────────────────────────
// Componentes que ainda importam `colors` direto (não refatorados para useTheme)
// continuam funcionando no dark fixo. Refatorar gradualmente para respeitar
// o tema ativo.
export const colors = darkColors;
