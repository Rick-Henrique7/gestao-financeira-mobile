import { useEffect, useState } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { X, PiggyBank, Target as TargetIcon, Plane, Car, Home, GraduationCap, Heart, Gift, Smartphone, ShoppingBag, Briefcase, Wallet } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../lib/theme';
import { useGoalsStore } from '../stores/goalsStore';
import { useReducedMotion, safeModalAnimation } from '../lib/motion';
import { fmt } from '../lib/format';
import type { FinancialGoal } from '../types';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  default:      PiggyBank,
  Target:       TargetIcon,
  Plane:        Plane,
  Car:          Car,
  Home:         Home,
  GraduationCap:GraduationCap,
  Heart:        Heart,
  Gift:         Gift,
  Smartphone:   Smartphone,
  ShoppingBag:  ShoppingBag,
  Briefcase:    Briefcase,
  Wallet:       Wallet,
};

interface ChooseGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (goal: FinancialGoal) => void;
}

export function ChooseGoalModal({ visible, onClose, onSelect }: ChooseGoalModalProps) {
  const { goals, refresh } = useGoalsStore();
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (visible) {
      setLoading(true);
      refresh().finally(() => setLoading(false));
    }
  }, [visible, refresh]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={safeModalAnimation(reducedMotion)}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>
          <View style={s.header}>
            <Text style={s.title}>Aportar em qual cofrinho?</Text>
            <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <X size={18} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.body}>
            {loading ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.xl }} />
            ) : goals.length === 0 ? (
              <View style={s.empty}>
                <PiggyBank size={32} color={colors.muted} />
                <Text style={s.emptyText}>
                  Voce ainda nao tem cofrinhos. Crie um primeiro na aba Cofrinhos.
                </Text>
              </View>
            ) : (
              goals.map((g) => {
                const Icon = ICON_MAP[g.category_icon] ?? PiggyBank;
                const colorHex = g.color_hex || '#3B82F6';
                const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => {
                      onClose();
                      setTimeout(() => onSelect(g), 50);
                    }}
                    style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surfaceHigh }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Aportar em ${g.title}`}
                  >
                    <View style={[s.iconBox, { backgroundColor: colorHex }]}>
                      <Icon size={18} color={colors.base} strokeWidth={2.2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle} numberOfLines={1}>{g.title}</Text>
                      <Text style={s.rowSub}>
                        {fmt(g.current_amount)} / {fmt(g.target_amount)} ({pct.toFixed(0)}%)
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.base,
    borderTopLeftRadius: radius.display, borderTopRightRadius: radius.display,
    borderTopWidth: 1, borderColor: colors.border, maxHeight: '80%',
  },
  handleWrap: { alignItems: 'center', paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  closeBtn: { padding: 4 },
  body: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { color: colors.muted, fontSize: typography.size.sm, textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.button,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  rowSub: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
});
