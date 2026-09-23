import { useMemo } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import { X, Bell, Calendar, Check } from 'lucide-react-native';
import { useTheme, useStyles } from '../lib/AppThemeProvider';
import { useSettingsStore } from '../stores/settingsStore';
import { useBillsStore } from '../stores/billsStore';
import { useReducedMotion, safeModalAnimation } from '../lib/motion';
import { fmt } from '../lib/format';
import type { Bill } from '../types';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotifItem {
  bill: Bill;
  daysUntil: number;
  isOverdue: boolean;
}

/**
 * Diferenca em dias entre duas datas YYYY-MM-DD (date1 - date2) em horario local.
 * Considera apenas a parte da data (sem hora).
 */
function diffDaysFromToday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * NotificationsModal — lista contas a pagar que vencem dentro do periodo
 * configurado em settings.alert_days_before (default 3).
 *
 * Tipos de item:
 *  - Atrasada (daysUntil < 0): vermelho, "X dias atrasada"
 *  - Hoje (daysUntil === 0): amarelo, "Vence hoje"
 *  - Proxima (0 < daysUntil <= alert_days_before): "Vence em X dias"
 *
 * Respita settings.notify_due_soon: se 0, lista vazia com mensagem "desativado".
 */
export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const settings = useSettingsStore((s) => s.settings);
  const bills = useBillsStore((s) => s.bills);

  const alertDays = settings?.alert_days_before ?? 3;
  const notifyEnabled = settings?.notify_due_soon === 1;

  const items = useMemo<NotifItem[]>(() => {
    if (!notifyEnabled) return [];
    const result: NotifItem[] = [];
    for (const b of bills) {
      if (b.status === 'PAID') continue;
      const daysUntil = diffDaysFromToday(b.due_date);
      const isOverdue = daysUntil < 0;
      // Inclui atrasadas e as que estao dentro do lead time (incluindo hoje)
      if (isOverdue || daysUntil <= alertDays) {
        result.push({ bill: b, daysUntil, isOverdue });
      }
    }
    // Ordena: atrasadas primeiro (mais atrasada primeiro), depois por proximidade
    result.sort((a, b) => a.daysUntil - b.daysUntil);
    return result;
  }, [bills, alertDays, notifyEnabled]);

  const s = useStyles((t) => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'flex-end' as const,
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: t.radius.display,
      borderTopRightRadius: t.radius.display,
      borderTopWidth: 1,
      borderColor: t.colors.border,
      maxHeight: '85%' as const,
    },
    handleWrap: {
      alignItems: 'center' as const, paddingTop: 8, paddingBottom: 4,
    },
    handle: {
      width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.muted,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    title: {
      color: t.colors.text,
      fontSize: t.typography.size.lg,
      fontWeight: t.typography.weight.bold,
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.xs,
      marginTop: 2,
    },
    closeBtn: { padding: 4 },
    body: { paddingBottom: t.spacing.xxl },

    empty: {
      alignItems: 'center' as const,
      gap: t.spacing.md,
      padding: t.spacing.xxl,
    },
    emptyIcon: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: t.colors.surfaceHigh,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1.5, borderStyle: 'dashed' as const,
      borderColor: t.colors.accent + '55',
    },
    emptyTitle: {
      color: t.colors.text,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.bold,
      textAlign: 'center' as const,
    },
    emptyText: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.sm,
      textAlign: 'center' as const,
      lineHeight: 20,
    },

    sectionLabel: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.xs,
      fontWeight: t.typography.weight.semibold,
      textTransform: 'uppercase' as const,
      letterSpacing: 1.2,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: t.spacing.xs,
    },

    item: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    itemIcon: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    itemIconOverdue: { backgroundColor: t.colors.danger + '22' },
    itemIconToday: { backgroundColor: t.colors.warn + '22' },
    itemIconUpcoming: { backgroundColor: t.colors.accent + '22' },
    itemBody: { flex: 1 },
    itemTitle: {
      color: t.colors.text,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.semibold,
    },
    itemMeta: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.xs,
      marginTop: 2,
    },
    itemRight: { alignItems: 'flex-end' as const },
    itemDays: {
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.black,
    },
    itemDaysOverdue: { color: t.colors.danger },
    itemDaysToday: { color: t.colors.warn },
    itemDaysUpcoming: { color: t.colors.accent },
    itemAmount: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.xs,
      marginTop: 2,
    },
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType={safeModalAnimation(reducedMotion)}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>
          <View style={s.header}>
            <View>
              <Text style={s.title}>Notificacoes</Text>
              <Text style={s.subtitle}>
                {notifyEnabled
                  ? `Alerta de contas a vencer em ate ${alertDays} dia${alertDays === 1 ? '' : 's'}`
                  : 'Alertas de vencimento desativados'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <X size={18} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 480 }}>
            {!notifyEnabled ? (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Bell size={26} color={colors.muted} />
                </View>
                <Text style={s.emptyTitle}>Alertas desativados</Text>
                <Text style={s.emptyText}>
                  Ative a opcao "Contas a vencer" em Configuracoes para receber
                  avisos de vencimento.
                </Text>
              </View>
            ) : items.length === 0 ? (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Check size={26} color={colors.accent} />
                </View>
                <Text style={s.emptyTitle}>Nenhuma conta proxima do vencimento</Text>
                <Text style={s.emptyText}>
                  Nao ha contas a pagar vencendo nos proximos {alertDays} dia{alertDays === 1 ? '' : 's'}
                  {' '}ou atrasadas.
                </Text>
              </View>
            ) : (
              <>
                <Text style={s.sectionLabel}>
                  {items.length} {items.length === 1 ? 'conta' : 'contas'} no alerta
                </Text>
                {items.map(({ bill, daysUntil, isOverdue }) => {
                  const iconBg = isOverdue
                    ? s.itemIconOverdue
                    : daysUntil === 0
                      ? s.itemIconToday
                      : s.itemIconUpcoming;
                  const iconColor = isOverdue
                    ? colors.danger
                    : daysUntil === 0
                      ? colors.warn
                      : colors.accent;
                  const daysColor = isOverdue
                    ? s.itemDaysOverdue
                    : daysUntil === 0
                      ? s.itemDaysToday
                      : s.itemDaysUpcoming;
                  const dayLabel = isOverdue
                    ? `${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'dia atrasada' : 'dias atrasada'}`
                    : daysUntil === 0
                      ? 'Vence hoje'
                      : `${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`;
                  return (
                    <View key={bill.id} style={s.item}>
                      <View style={[s.itemIcon, iconBg]}>
                        <Calendar size={18} color={iconColor} strokeWidth={2.2} />
                      </View>
                      <View style={s.itemBody}>
                        <Text style={s.itemTitle} numberOfLines={1}>
                          {bill.title}
                        </Text>
                        <Text style={s.itemMeta}>
                          {bill.category ?? 'Outros'} - vence {bill.due_date.substring(8, 10)}/{bill.due_date.substring(5, 7)}
                        </Text>
                      </View>
                      <View style={s.itemRight}>
                        <Text style={[s.itemDays, daysColor]}>{dayLabel}</Text>
                        <Text style={s.itemAmount}>{fmt(bill.amount)}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
}
