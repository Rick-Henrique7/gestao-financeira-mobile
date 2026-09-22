// ─── SHAPEGRID (Reanimated puro, sem Skia) ───────────────────────────────────
// Versão simplificada do ShapeGrid do React Bits, feita com View+transform.
// Skia 1.x é incompatível com React 19 / RN 0.83, então esta versão troca
// o Canvas por Views posicionadas e animadas via Reanimated.
//
// Visual:
//   - Grid de linhas verdes-limão com opacidade 0.18
//   - Animação diagonal lenta (loop infinito)
//   - Vinhette simulada com gradiente opaco via View absoluta
//   - pointerEvents="none" -> toques atravessam

import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useTheme } from '../lib/AppThemeProvider';

interface ShapeGridProps {
  squareSize?: number;
  speed?: number;
  borderOpacity?: number;
  animated?: boolean;
}

const DEFAULTS = {
  squareSize: 56,
  speed: 0.5,
  borderOpacity: 0.18,
};

export function ShapeGrid({
  squareSize = DEFAULTS.squareSize,
  speed = DEFAULTS.speed,
  borderOpacity = DEFAULTS.borderOpacity,
  animated = true,
}: ShapeGridProps) {
  const { colors, scheme } = useTheme();
  const { width, height } = useWindowDimensions();

  // Tempo de animação em segundos (loop infinito)
  const t = useSharedValue(0);

  React.useEffect(() => {
    if (!animated) return;
    // Período = tamanho/speed segundos (grid volta a parecer igual)
    const periodSec = squareSize / Math.max(speed * 60, 1);
    t.value = withRepeat(
      withTiming(periodSec, { duration: periodSec * 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [animated, squareSize, speed, t]);

  // Quantas linhas precisamos? +2 folga para o efeito de loop
  const cols = Math.ceil(width / squareSize) + 3;
  const rows = Math.ceil(height / squareSize) + 3;

  // Cor com opacidade (#RRGGBBAA)
  const colorHex = useMemo(() => {
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

  // Estilo animado do container: desliza diagonalmente
  const containerStyle = useAnimatedStyle(() => {
    const offset = (t.value * speed * 60) % squareSize;
    return {
      transform: [
        { translateX: -offset },
        { translateY: -offset },
      ],
    };
  });

  // Vinhette simulada: View centralizada grande com bordas transparentes
  // (no light, é branco; no dark, é preto)
  const vignetteStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    width: Math.min(width, height) * 2,
    height: Math.min(width, height) * 2,
    marginLeft: -Math.min(width, height),
    marginTop: -Math.min(width, height),
    borderRadius: Math.min(width, height),
    backgroundColor: scheme === 'light' ? '#FFFFFF' : '#000000',
    opacity: 0.65,
  }), [scheme, width, height]);

  return (
    <View pointerEvents="none" style={[styles.fill, { backgroundColor: colors.bgCanvas }]}>
      {/* Grid animado */}
      <Animated.View style={[styles.fill, styles.overflow, containerStyle]}>
        {/* Linhas verticais */}
        {Array.from({ length: cols }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: i * squareSize,
              top: 0,
              width: 1,
              height: rows * squareSize,
              backgroundColor: colorHex,
            }}
          />
        ))}
        {/* Linhas horizontais */}
        {Array.from({ length: rows }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              top: i * squareSize,
              left: 0,
              height: 1,
              width: cols * squareSize,
              backgroundColor: colorHex,
            }}
          />
        ))}
      </Animated.View>

      {/* Vinhette: por cima do grid, "limpa" a área central */}
      <View style={vignetteStyle} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  overflow: {
    overflow: 'hidden',
  },
});

export default ShapeGrid;
