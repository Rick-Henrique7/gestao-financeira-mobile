// ─── THEME: FINANCE KIT (FIGMA UI KIT) ───────────────────────────────────────
// Paleta principal extraída do kit "Finance Management Mobile App UI UX Kit"
// (referência visual nas imagens em Downloads/finance*.jpeg).
//
// Dark (canônico - única tela do kit com referência):
//   - bgCanvas    #000000   canvas puro, sob o hero
//   - heroLime    #D4F542   verde-limão saturado do card topo (sem gradiente)
//   - heroText    #000000   tudo dentro do hero (label, valor, ícones)
//   - surface     #161616   cards no canvas (Contas, Orcamento, etc.)
//   - surfaceHigh #1F1F1F   hover / pressed / inputs
//   - text        #FFFFFF   títulos de seção no canvas
//   - textMuted   #7C7C7C   "@handle", "Trx ID", datas
//   - pos         #26D07C   verde de "Receive" / sucesso
//   - neg         #FF4D4D   vermelho de "Send" / erro
//   - tabActive   #D4F542   tab selecionada
//
// Regra de ouro: tudo dentro do hero verde-limão é PRETO.
// Tudo no canvas escuro é BRANCO.

import type { TextStyle } from 'react-native';

// ─── TOKENS ESTÁTICOS (não mudam com tema) ───────────────────────────────────
export const radius = {
  display: 28,
  card: 24,
  heroFold: 36,   // dobra inferior do hero (Figma usa ~36px)
  button: 20,
  pill: 9999,
  small: 12,
  avatar: 22,
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
    xs: 11,
    sm: 12,
    md: 13,
    lg: 15,
    xl: 18,
    xxl: 22,
    hero: 40,        // valor do saldo (Figma usa ~40-42px)
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

/** Dark theme — paleta canônica do kit Figma. */
export const darkColors = {
  bgCanvas: '#000000',
  base: '#000000',

  hero: '#D4F542',          // verde-limão do card topo (Figma)
  heroText: '#000000',      // tudo dentro do hero é preto
  heroMuted: '#1F2B0F',     // pill escura sobre o hero

  // aliases (back-compat com código que usava nomes do design anterior)
  accent: '#D4F542',
  accentBright: '#D4F542',
  accentSoft: '#D4F542',

  surface: '#161616',       // cards de seção (Contas, Orcamento...)
  surfaceHigh: '#1F1F1F',   // hover/pressed/inputs
  surfaceDark1: '#0F0F0F',  // botões pretos (mantém nome p/ compat)
  surfaceDark2: '#1F1F1F',

  text: '#FFFFFF',
  textStrong: '#FFFFFF',
  textMuted: '#7C7C7C',
  textOnNeon: '#000000',    // alias semântico (mantido p/ compat)
  muted: '#7C7C7C',

  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  success: '#26D07C',
  pos: '#26D07C',
  warn: '#FBBF24',
  danger: '#FF4D4D',
  neg: '#FF4D4D',

  // tabs
  tabActive: '#D4F542',
  tabInactive: '#5C5C5C',
} as const;

/**
 * Light theme — interpretação consistente com o kit.
 * Como o kit só tem variante dark, o light é uma extrapolação que mantém:
 *  - hero verde-limão como identidade (text preto dentro)
 *  - canvas claro (#FFFFFF ou off-white)
 *  - mesma regra: hero preto, canvas escuro-text
 */
export const lightColors = {
  bgCanvas: '#FFFFFF',
  base: '#FFFFFF',

  hero: '#D4F542',
  heroText: '#000000',
  heroMuted: '#1F2B0F',

  // aliases (back-compat)
  accent: '#1E9E5F',
  accentBright: '#1E9E5F',
  accentSoft: '#D4F542',

  surface: '#F4F4F4',
  surfaceHigh: '#EBEBEB',
  surfaceDark1: '#000000',
  surfaceDark2: '#262626',

  text: '#0A0A0A',
  textStrong: '#0A0A0A',
  textMuted: '#6B6B6B',
  textOnNeon: '#000000',
  muted: '#6B6B6B',

  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.18)',

  success: '#1E9E5F',
  pos: '#1E9E5F',
  warn: '#B86E00',
  danger: '#D63A3A',
  neg: '#D63A3A',

  tabActive: '#1E9E5F',
  tabInactive: '#9A9A9A',
} as const;

/**
 * White theme — paleta branca + roxo real.
 *
 * Regra (do user):
 *   - Onde era verde no dark/light, agora e roxo (#6D28D9)
 *   - Onde era preto (textOnNeon / fundo do hero), agora e branco
 *
 * Hero:
 *   - bg do hero: roxo (#6D28D9) — substitui o verde-limao
 *   - texto/icones dentro do hero: branco (inverte o contraste do dark)
 *
 * Canvas:
 *   - fundo: branco (#FFFFFF)
 *   - texto principal: preto (contraste no canvas claro)
 *   - cards: cinza muito claro (#F4F4F4) pra hierarquia
 *
 * Tab ativa: roxo
 */
export const whiteColors = {
  bgCanvas: '#FFFFFF',
  base: '#FFFFFF',

  hero:        '#6D28D9',  // roxo real (substitui verde-limao)
  heroText:    '#FFFFFF',  // branco dentro do hero (inverte o preto do dark)
  heroMuted:   '#F4EBFF',  // pill clara sobre o hero (lilás bem suave)

  // aliases (back-compat com codigo legado)
  accent:       '#6D28D9',
  accentBright: '#6D28D9',
  accentSoft:   '#A78BFA',  // lilás mais claro para destaques secundarios

  surface:      '#F4F4F4',
  surfaceHigh:  '#EAE7F4',  // leve tom lilás no hover/inputs (liga com accent)
  surfaceDark1: '#6D28D9',
  surfaceDark2: '#5B21B6',

  text:         '#0A0A0A',
  textStrong:   '#0A0A0A',
  textMuted:    '#6B7280',
  textOnNeon:   '#FFFFFF',  // texto dentro do hero = branco
  muted:        '#6B7280',

  border:       'rgba(109, 40, 217, 0.14)',  // bordas com matiz roxa
  borderStrong: 'rgba(109, 40, 217, 0.28)',

  success: '#1E9E5F',
  pos:     '#1E9E5F',
  warn:    '#B86E00',
  danger:  '#D63A3A',
  neg:     '#D63A3A',

  tabActive:   '#6D28D9',
  tabInactive: '#9A9A9A',
} as const;

// ─── TEMAS COMPLETOS ────────────────────────────────────────────────────────
export type ColorScheme = 'light' | 'dark' | 'white';
export type ThemeColors = typeof darkColors | typeof lightColors | typeof whiteColors;
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

export const whiteTheme: Theme = {
  colors: whiteColors,
  spacing,
  radius,
  typography,
  scheme: 'white',
};

// ─── BACK-COMPAT ────────────────────────────────────────────────────────────
// Componentes legados que ainda importam `colors`/`accent` direto continuam
// funcionando. `accent` aponta para o hero (verde-limão) para preservar
// a identidade visual.
export const colors = darkColors;
export const accent = darkColors.hero;
export const accentBright = darkColors.hero;
export const accentSoft = darkColors.hero;
export const bgCanvas = darkColors.bgCanvas;
export const surfaceDark1 = darkColors.surfaceDark1;
export const surfaceDark2 = darkColors.surfaceHigh;
export const text = darkColors.text;
export const textOnNeon = darkColors.textOnNeon;
export const textMuted = darkColors.textMuted;
export const success = darkColors.success;
export const danger = darkColors.danger;
export const radius_display = radius.display;
export const radius_button = radius.button;
export const radius_pill = radius.pill;

// helper para centralizar estilos de texto (mantido p/ compat)
export const textPresets = {
  hero: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.black,
    letterSpacing: typography.letterSpacing.tight,
  } as TextStyle,
  display: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
  } as TextStyle,
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  } as TextStyle,
  body: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
  } as TextStyle,
  caption: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
  } as TextStyle,
};
