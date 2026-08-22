import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 200;
const BUTTON_WIDTH = 130;
const BUTTON_HEIGHT = 50;

function buildPath(w: number, h: number, bw: number, bh: number, r: number, cr: number): string {
  const buttonX = w - bw;
  const buttonY = h - bh;
  return [
    `M ${r},0`, `H ${w - r}`,
    `A ${r},${r} 0 0 1 ${w},${r}`,
    `V ${buttonY}`,
    `H ${buttonX + cr}`,
    `A ${cr},${cr} 0 0 0 ${buttonX},${buttonY + cr}`,
    `V ${h - r}`,
    `A ${r},${r} 0 0 1 ${buttonX - r},${h}`,
    `H ${r}`,
    `A ${r},${r} 0 0 1 0,${h - r}`,
    `V ${r}`,
    `A ${r},${r} 0 0 1 ${r},0`,
    'Z',
  ].join(' ');
}

interface ConcaveCardProps {
  totalValue: number;
  variationPct: number;
  variationText?: string;
  guardLabel: string;
  guardValue: number;
  guardHint?: string;
  marginLabel: string;
  marginValue: number;
  marginHint?: string;
  hideValues: boolean;
  onToggleHide: () => void;
  buttonLabel: string;
  onButtonPress: () => void;
}

export function ConcaveCard({
  totalValue, variationPct, variationText,
  guardLabel, guardValue, guardHint,
  marginLabel, marginValue, marginHint,
  hideValues, onToggleHide,
  buttonLabel, onButtonPress,
}: ConcaveCardProps) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  const bw = BUTTON_WIDTH;
  const bh = BUTTON_HEIGHT;
  const r = 24;
  const cr = 16;
  const path = buildPath(w, h, bw, bh, r, cr);
  const trendingUp = variationPct >= 0;
  const marginPositive = marginValue >= 0;

  return (
    <View style={[s.container, { width: w, height: h }]}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#5B2DCC" />
            <Stop offset="100%" stopColor="#421C9B" />
          </LinearGradient>
        </Defs>
        <Path d={path} fill="url(#heroBg)" />
      </Svg>

      <View style={s.content}>
        <View>
          <Text style={s.label}>PATRIMÔNIO LÍQUIDO</Text>
          <View style={s.valueRow}>
            <Text style={s.value}>
              {hideValues ? '••••••••' : formatBRL(totalValue)}
            </Text>
            <TouchableOpacity
              onPress={onToggleHide}
              style={s.eyeBtn}
              hitSlop={8}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {hideValues
                ? <EyeOff size={18} color="rgba(255,255,255,0.85)" />
                : <Eye size={18} color="rgba(255,255,255,0.85)" />}
            </TouchableOpacity>
          </View>
          <View style={s.trendRow}>
            {trendingUp
              ? <TrendingUp size={13} color="rgba(255,255,255,0.95)" />
              : <TrendingDown size={13} color="rgba(255,255,255,0.95)" />}
            <Text style={s.trendText}>
              {variationText ?? `${trendingUp ? '+' : ''}${variationPct.toFixed(2)}% em relação ao mês anterior`}
            </Text>
          </View>
        </View>

        <View style={s.footer}>
          <View style={s.col}>
            <Text style={s.colLabel}>{guardLabel.toUpperCase()}</Text>
            <Text style={s.colValue}>
              {hideValues ? '••••••' : formatBRL(guardValue)}
            </Text>
            {guardHint ? <Text style={s.colHint}>{guardHint}</Text> : null}
          </View>
          <View style={s.col}>
            <Text style={s.colLabel}>{marginLabel.toUpperCase()}</Text>
            <Text style={s.colValue}>
              {hideValues
                ? '••••••'
                : `${marginPositive ? '+' : ''}${formatBRL(marginValue)}`}
            </Text>
            {marginHint ? <Text style={s.colHint}>{marginHint}</Text> : null}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onButtonPress}
        activeOpacity={0.85}
        style={s.button}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        <Text style={s.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const s = StyleSheet.create({
  container: { position: 'relative', alignSelf: 'center', marginVertical: 8 },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.5, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  value: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', fontFamily: 'monospace' },
  eyeBtn: { padding: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' },
  footer: {
    flexDirection: 'row', gap: 24, marginBottom: 6,
    paddingRight: BUTTON_WIDTH + 10,
  },
  col: { gap: 2 },
  colLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 1 },
  colValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  colHint: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  button: {
    position: 'absolute', right: 0, bottom: 0,
    width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
    backgroundColor: '#111111', borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
