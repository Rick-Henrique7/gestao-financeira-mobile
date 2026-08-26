import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownLeft,
  CreditCard, Wallet, Trophy, Bell, LucideIcon,
} from 'lucide-react-native';
// PremiumHeroCard usa darkColors fixo: o design do hero (neon green + botoes
// escuros + texto preto sobre neon) e parte da identidade visual e nao muda
// com o tema do sistema. Para temas light, considere uma variante deste
// componente (ex: PremiumHeroCardLight) que use bgCanvas light e accent dark.
import { darkColors, radius, spacing, typography } from '../lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_WIDTH = SCREEN_WIDTH;
const HERO_HEIGHT = 320;
const R_BOTTOM = 36;
const NOTCH_W = 56;
const NOTCH_H = 16;

const ACTION_BUTTONS: Array<{ key: string; label: string; Icon: LucideIcon }> = [
  { key: 'send',     label: 'Send',     Icon: ArrowUpRight },
  { key: 'request',  label: 'Request',  Icon: ArrowDownLeft },
  { key: 'payment',  label: 'Payment',  Icon: CreditCard },
  { key: 'withdraw', label: 'Withdraw', Icon: Wallet },
];

function buildHeroPath(w: number, h: number, r: number, nw: number, nh: number): string {
  const cx = w / 2;
  return [
    `M 0,0`, `H ${w}`,
    `V ${h - r}`,
    `A ${r},${r} 0 0 1 ${w - r},${h}`,
    `H ${cx + nw / 2}`,
    `A ${nw / 2},${nh} 0 0 1 ${cx - nw / 2},${h}`,
    `H ${r}`,
    `A ${r},${r} 0 0 1 0,${h - r}`,
    `V 0`, 'Z',
  ].join(' ');
}

interface PremiumHeroCardProps {
  displayName: string;
  handle: string;
  totalValue: number;
  variationPct: number;
  variationText?: string;
  hideValues: boolean;
  onToggleHide: () => void;
  onAction: (key: string) => void;
  onRewards: () => void;
  onAlerts: () => void;
  alertCount: number;
}

export function PremiumHeroCard({
  displayName, handle, totalValue, variationPct, variationText,
  hideValues, onToggleHide, onAction, onRewards, onAlerts, alertCount,
}: PremiumHeroCardProps) {
  const w = HERO_WIDTH;
  const h = HERO_HEIGHT;
  const path = buildHeroPath(w, h, R_BOTTOM, NOTCH_W, NOTCH_H);
  const name = displayName?.trim() || 'Convidado';
  const first = name.split(' ')[0];
  const full = name;
  const handleText = handle?.trim() || (first.toLowerCase() + '_user');
  const trendingUp = variationPct >= 0;

  return (
    <View style={[s.container, { width: w, height: h }]}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="neonHero" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#E2FF00" />
            <Stop offset="60%"  stopColor="#CCF050" />
            <Stop offset="100%" stopColor="#A8D63A" />
          </LinearGradient>
        </Defs>
        <Path d={path} fill="url(#neonHero)" />
      </Svg>

      <View style={s.topBar}>
        <View style={s.userBox}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(first[0] + (full.split(' ')[1]?.[0] || '')).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName} numberOfLines={1}>{full}</Text>
            <Text style={s.userHandle} numberOfLines={1}>@{handleText}</Text>
          </View>
        </View>
        <View style={s.topActions}>
          <Pressable
            onPress={onRewards}
            style={s.topIconBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Recompensas"
          >
            <Trophy size={18} color={darkColors.text} />
          </Pressable>
          <Pressable
            onPress={onAlerts}
            style={s.topIconBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Alertas${alertCount ? ` (${alertCount})` : ''}`}
          >
            <Bell size={16} color={darkColors.text} />
            {alertCount > 0 && <View style={s.alertDot} />}
          </Pressable>
        </View>
      </View>

      <View style={s.balanceBox}>
        <Text style={s.balanceLabel}>Total Balance</Text>
        <View style={s.balanceRow}>
          <Text style={s.balanceValue}>
            {hideValues ? '••••••' : formatUSD(totalValue)}
          </Text>
          <Pressable
            onPress={onToggleHide}
            hitSlop={8}
            style={s.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            accessibilityState={{ selected: hideValues }}
          >
            <Eye size={18} color={darkColors.textOnNeon} opacity={0.7} />
          </Pressable>
        </View>

        <View style={s.pill}>
          <View style={s.pillIconBox}>
            <TrendingUp size={12} color={darkColors.accent} />
          </View>
          <Text style={s.pillText}>
            {variationText ?? `${trendingUp ? '+' : ''}${variationPct.toFixed(0)}% Last week`}
          </Text>
        </View>
      </View>

      <View style={s.actionRow}>
        {ACTION_BUTTONS.map(({ key, label, Icon }) => (
          <View key={key} style={s.actionItem}>
            <Pressable
              onPress={() => onAction(key)}
              style={({ pressed }) => [s.actionBtn, pressed && s.actionBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Icon size={22} color={darkColors.text} strokeWidth={2} />
            </Pressable>
            <Text style={s.actionLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const s = StyleSheet.create({
  container: { position: 'relative', alignSelf: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, gap: 12,
  },
  userBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: darkColors.textOnNeon,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: darkColors.bgCanvas,
  },
  avatarText: { color: darkColors.accent, fontWeight: '800', fontSize: 13 },
  userName: { color: darkColors.textOnNeon, fontSize: 14, fontWeight: '700' },
  userHandle: { color: 'rgba(0,0,0,0.6)', fontSize: 11, fontWeight: '500', marginTop: 1 },
  topActions: { flexDirection: 'row', gap: 8 },
  topIconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: darkColors.bgCanvas,
    alignItems: 'center', justifyContent: 'center',
  },
  alertDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: darkColors.danger,
    borderWidth: 1.5, borderColor: darkColors.bgCanvas,
  },
  balanceBox: { paddingHorizontal: 20, paddingTop: 18, gap: 6 },
  balanceLabel: { color: 'rgba(0,0,0,0.6)', fontSize: typography.size.sm, fontWeight: '600', textTransform: 'capitalize' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceValue: {
    color: darkColors.textOnNeon, fontSize: 36,
    fontWeight: '800', letterSpacing: -1,
  },
  eyeBtn: { padding: 4, marginLeft: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: darkColors.bgCanvas,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, gap: 6, marginTop: 4,
  },
  pillIconBox: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(204, 240, 80, 0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  pillText: { color: darkColors.accent, fontSize: 11, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, marginTop: 18,
  },
  actionItem: { alignItems: 'center', gap: 6 },
  actionBtn: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: darkColors.surfaceDark1,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  actionBtnPressed: { backgroundColor: darkColors.surfaceDark2 },
  actionLabel: {
    color: darkColors.textOnNeon, fontSize: 11, fontWeight: '600', textAlign: 'center',
    letterSpacing: 0.2,
  },
});
