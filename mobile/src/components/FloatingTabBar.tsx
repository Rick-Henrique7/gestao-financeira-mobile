import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Home, CreditCard, History, Search, QrCode, LucideIcon } from 'lucide-react-native';
import { colors } from '../lib/theme';

export type TabKey = 'home' | 'cards' | 'scan' | 'history' | 'search';

interface FloatingTabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

const TABS: Array<{ key: TabKey; label: string; Icon: LucideIcon; isCenter?: boolean }> = [
  { key: 'home',    label: 'Home',    Icon: Home },
  { key: 'cards',   label: 'Cards',   Icon: CreditCard },
  { key: 'scan',    label: 'Scan',    Icon: QrCode,   isCenter: true },
  { key: 'history', label: 'History', Icon: History },
  { key: 'search',  label: 'Search',  Icon: Search },
];

export function FloatingTabBar({ active, onChange }: FloatingTabBarProps) {
  return (
    <View style={s.bar} accessibilityRole="tablist">
      {TABS.map(({ key, label, Icon, isCenter }) => {
        if (isCenter) {
          return (
            <View key={key} style={s.centerSlot}>
              <View style={s.centerRing}>
                <Pressable
                  onPress={() => onChange(key)}
                  style={s.centerBtn}
                  accessibilityRole="tab"
                  accessibilityLabel="Escanear QR"
                  accessibilityState={{ selected: active === key }}
                  hitSlop={6}
                >
                  <Icon size={24} color={colors.accent} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          );
        }
        const isActive = active === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={s.tab}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            hitSlop={6}
          >
            <Icon
              size={22}
              color={isActive ? colors.textOnNeon : colors.textMuted}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <Text style={[
              s.label,
              { color: isActive ? colors.textOnNeon : colors.textMuted, fontWeight: isActive ? '600' : '500' },
            ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const BAR_H = 68;

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16, right: 16, bottom: 24,
    height: BAR_H,
    backgroundColor: colors.accent,
    borderRadius: BAR_H / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, letterSpacing: 0.3 },
  centerSlot: { flex: 1.1, alignItems: 'center', justifyContent: 'center' },
  centerRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -28,
    borderWidth: 2, borderColor: colors.bgCanvas,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6, shadowRadius: 14, elevation: 14,
  },
  centerBtn: {
    width: '100%', height: '100%',
    borderRadius: 32,
    backgroundColor: colors.surfaceDark1,
    alignItems: 'center', justifyContent: 'center',
  },
});
