import { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { X, TrendingDown, TrendingUp, PiggyBank, LucideIcon } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../lib/theme';

export type QuickEntryAction = 'EXPENSE' | 'INCOME' | 'GOAL_DEPOSIT';

interface QuickEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: QuickEntryAction) => void;
}

const ACTIONS: Array<{
  key: QuickEntryAction;
  label: string;
  sub: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
}> = [
  {
    key: 'EXPENSE',
    label: 'Nova despesa',
    sub: 'Registrar gasto',
    Icon: TrendingDown,
    color: colors.danger,
    bg: 'rgba(248, 113, 113, 0.12)',
  },
  {
    key: 'INCOME',
    label: 'Nova receita',
    sub: 'Registrar entrada',
    Icon: TrendingUp,
    color: colors.success,
    bg: 'rgba(0, 230, 118, 0.12)',
  },
  {
    key: 'GOAL_DEPOSIT',
    label: 'Aporte em cofrinho',
    sub: 'Guardar em uma meta',
    Icon: PiggyBank,
    color: colors.textOnNeon,
    bg: colors.accent,
  },
];

export function QuickEntryModal({ visible, onClose, onSelect }: QuickEntryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>
          <View style={s.header}>
            <Text style={s.title}>Novo Lancamento</Text>
            <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <X size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View style={s.body}>
            <Text style={s.hint}>Escolha o tipo de lancamento:</Text>
            {ACTIONS.map(({ key, label, sub, Icon, color, bg }) => (
              <Pressable
                key={key}
                onPress={() => {
                  onClose();
                  setTimeout(() => onSelect(key), 50);
                }}
                style={({ pressed }) => [
                  s.action,
                  { borderColor: color + '55' },
                  pressed && { backgroundColor: bg },
                ]}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityHint={sub}
              >
                <View style={[s.iconBox, { backgroundColor: bg }]}>
                  <Icon size={22} color={color} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionLabel}>{label}</Text>
                  <Text style={s.actionSub}>{sub}</Text>
                </View>
              </Pressable>
            ))}
          </View>
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
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  hint: { color: colors.muted, fontSize: typography.size.sm, marginBottom: spacing.xs },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.button,
    borderWidth: 1, backgroundColor: colors.surface,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  actionSub: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
});
