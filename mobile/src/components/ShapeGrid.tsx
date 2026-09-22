// ─── SHAPEGRID (versão RN/Skia) ─────────────────────────────────────────────
// Porta do componente React Bits "ShapeGrid" para React Native.
//
// Comportamento:
//   - Grid de quadrados com borda verde-limao (#D4F542)
//   - Animacao diagonal lenta (configuravel)
//   - Vignette radial sutil no centro para nao competir com o conteudo
//   - Sem interacao (nao reage a touch) - e puramente decorativo
//
// Como e usado:
//   - Renderizado uma unica vez no root layout, atras de todas as telas
//   - pointerEvents="none" garante que toques atravessam
//   - Respeita light/dark: usa o accent do tema ativo

import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Group,
  Path,
  Skia,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  RadialGradient,
  Rect,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '../lib/AppThemeProvider';

interface ShapeGridProps {
  /** Tamanho do quadrado em pixels. Padrao 48 (mais "respirado"). */
  squareSize?: number;
  /** Velocidade da animacao em pixels por frame (60fps). Padrao 0.4. */
  speed?: number;
  /** Opacidade da borda (0-1). Padrao 0.18 para ficar discreto. */
  borderOpacity?: number;
  /** Raio do vinhette central. Padrao 0.55 (55% do menor lado). */
  vignetteRadius?: number;
  /** Se true, mostra a animacao. Default true. */
  animated?: boolean;
}

const DEFAULTS = {
  squareSize: 48,
  speed: 0.4,
  borderOpacity: 0.18,
  vignetteRadius: 0.55,
};

/**
 * ShapeGrid em Skia.
 *
 * Implementacao: desenhamos uma malha de linhas (nao retangulos fechados) para
 * ser mais leve — cada celula e apenas as 4 linhas que a delimitam, compartilhadas
 * com as celulas vizinhas. Isso reduz o total de paths a ~(width+h)/size * 2.
 *
 * A animacao e feita deslocando o offset por withRepeat(withTiming, -1).
 */
export function ShapeGrid({
  squareSize = DEFAULTS.squareSize,
  speed = DEFAULTS.speed,
  borderOpacity = DEFAULTS.borderOpacity,
  vignetteRadius = DEFAULTS.vignetteRadius,
  animated = true,
}: ShapeGridProps) {
  const { colors, scheme } = useTheme();
  const { width, height } = useWindowDimensions();

  // Tempo em segundos desde o inicio da animacao (para deslocar o grid)
  const t = useSharedValue(0);

  React.useEffect(() => {
    if (!animated) return;
    // loop infinito: avanca "speed" pixels a cada 1s
    // Wrap period = squareSize/speed segundos (ate o grid voltar identico)
    const periodSec = squareSize / Math.max(speed * 60, 1);
    t.value = withRepeat(
      withTiming(periodSec, { duration: periodSec * 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [animated, squareSize, speed, t]);

  // Hex helper para cor com opacidade
  const colorHex = useMemo(() => {
    // Aceita cor em formato #RRGGBB; transforma em #RRGGBBAA
    const c = colors.hero;
    if (c.length === 7) {
      const alphaHex = Math.round(Math.max(0, Math.min(1, borderOpacity)) * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
      return `${c}${alphaHex}`;
    }
    return c;
  }, [colors.hero, borderOpacity]);

  // Limites do desenho (com folga para a animacao nao mostrar borda)
  const cols = Math.ceil(width / squareSize) + 3;
  const rows = Math.ceil(height / squareSize) + 3;

  // Path estatico: malha de linhas verticais + horizontais.
  // O deslocamento e aplicado via transform do Group.
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    // Verticais
    for (let i = 0; i <= cols; i++) {
      const x = i * squareSize;
      p.moveTo(x, 0);
      p.lineTo(x, rows * squareSize);
    }
    // Horizontais
    for (let j = 0; j <= rows; j++) {
      const y = j * squareSize;
      p.moveTo(0, y);
      p.lineTo(cols * squareSize, y);
    }
    return p;
  }, [cols, rows, squareSize]);

  // Paint da malha
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeWidth(1);
    p.setStrokeCap(StrokeCap.Butt);
    p.setStrokeJoin(StrokeJoin.Miter);
    p.setColor(Skia.Color(colorHex));
    return p;
  }, [colorHex]);

  // Transformacao animada: deslocamento diagonal em pixels
  const transform = useDerivedValue(() => {
    const offset = (t.value * speed * 60) % squareSize;
    return [
      { translateX: -offset },
      { translateY: -offset },
    ];
  });

  // Vinhette radial
  const vignetteColors = useMemo(() => {
    const center = 'rgba(0,0,0,0)';
    // No dark, vinhette preta para escurecer cantos. No light, branca para clarear.
    const edge = scheme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)';
    return [center, edge] as const;
  }, [scheme]);

  // Geometria do vinhette
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * vignetteRadius * 2;

  return (
    <View pointerEvents="none" style={[styles.fill, { backgroundColor: colors.bgCanvas }]}>
      <Canvas style={styles.fill}>
        <Group transform={transform}>
          <Path path={path} paint={paint} />
        </Group>
        {/* Vinhette sutil: limpa a area central e mantem o grid nas bordas */}
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={{ x: cx, y: cy }}
            r={r}
            colors={vignetteColors as unknown as string[]}
            positions={[0.4, 1]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ShapeGrid;
