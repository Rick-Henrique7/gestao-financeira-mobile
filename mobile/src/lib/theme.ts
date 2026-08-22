// ─── THEME: FINTECH ULTRA-PREMIUM (NEON GREEN) ────────────────────────────────
// Paleta principal
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

export const colors = {
  // base / canvas
  bgCanvas: '#0A0D0A',
  base: '#0A0D0A',            // alias retrocompativel

  // accent (neon)
  accent: '#CCF050',
  accentBright: '#E2FF00',    // pico de saturacao para o valor principal
  accentSoft: '#E3FA7B',

  // surface (escuro)
  surfaceDark1: '#162016',
  surfaceDark2: '#1F2E1F',
  surface: '#162016',         // alias retrocompativel
  surfaceHigh: '#1F2E1F',     // alias retrocompativel

  // texto
  text: '#FFFFFF',
  textStrong: '#FFFFFF',
  textOnNeon: '#000000',
  textMuted: '#7A8977',
  muted: '#7A8977',           // alias retrocompativel

  // bordas
  border: 'rgba(204, 240, 80, 0.08)',
  borderStrong: 'rgba(204, 240, 80, 0.18)',

  // estado
  success: '#00E676',
  warn: '#FBBF24',
  danger: '#FF5252',
} as const;

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
