import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownLeft, Plus, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../src/lib/theme';
import { useBillsStore } from '../../src/stores/billsStore';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { useGoalsStore } from '../../src/stores/goalsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { QuickEntryModal, type QuickEntryAction } from '../../src/components/QuickEntryModal';
import { CashflowForm } from '../../src/components/forms/CashflowForm';
import { ChooseGoalModal } from '../../src/components/ChooseGoalModal';
import { GoalDepositForm } from '../../src/components/forms/GoalDepositForm';
import { PremiumHeroCard } from '../../src/components/PremiumHeroCard';
import type { FinancialGoal, CashflowType } from '../../src/types';

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
};

const FAVORITE_CONTACTS = [
  { id: 'add', isAdd: true },
  { id: 'c1', name: 'Alina', handle: '@alina00', initials: 'A', color: '#FF6B6B' },
  { id: 'c2', name: 'Mark',  handle: '@markd',   initials: 'M', color: '#3B82F6' },
  { id: 'c3', name: 'Rosy',  handle: '@rosy',    initials: 'R', color: '#A78BFA' },
  { id: 'c4', name: 'Erick', handle: '@erick_x', initials: 'E', color: '#F59E0B' },
] as const;

const RECENT_TX = [
  { id: 't1', direction: 'OUT' as const, title: 'Send Money to Kuralshi M.', subtitle: 'Trx ID: CURR03L39', amount: -450, time: 'Today  05:29 PM' },
  { id: 't2', direction: 'IN'  as const, title: 'Receive from Alina',        subtitle: 'Trx ID: CURR02L44', amount: 1250, time: 'Today  12:37 PM' },
];

export default function DashboardScreen() {
  const { bills, loading: billsLoading, refresh: refreshBills } = useBillsStore();
  const { summary, loading: cashLoading, refresh: refreshCashflow } = useCashflowStore();
  const { loading: goalsLoading, refresh: refreshGoals, goals } = useGoalsStore();
  const { settings, refresh: refreshSettings, toggleHideValues } = useSettingsStore();

  const hide = settings?.hide_values === 1;
  // Loading geral: qualquer store ainda buscando dados
  const loading = billsLoading || cashLoading || goalsLoading;

  useEffect(() => {
    refreshBills();
    refreshSettings();
    refreshGoals();
    const { start, end } = monthRange();
    refreshCashflow(start, end);
  }, [refreshBills, refreshSettings, refreshGoals, refreshCashflow]);

  const [quickOpen, setQuickOpen] = useState(false);
  const [cashflowType, setCashflowType] = useState<CashflowType | null>(null);
  const [chooseGoalOpen, setChooseGoalOpen] = useState(false);
  const [depositCtx, setDepositCtx] = useState<{ goal: FinancialGoal; type: 'DEPOSIT' | 'WITHDRAWAL' } | null>(null);

  const onQuickSelect = (action: QuickEntryAction) => {
    if (action === 'EXPENSE') setCashflowType('EXPENSE');
    else if (action === 'INCOME') setCashflowType('INCOME');
    else setChooseGoalOpen(true);
  };

  const onGoalPicked = (goal: FinancialGoal) => {
    setDepositCtx({ goal, type: 'DEPOSIT' });
  };

  const displayName = settings?.display_name ?? 'Janvis David';
  const handle = settings?.email?.split('@')[0] ?? 'janvisd';
  const proximos = bills.filter((b) => b.status === 'PENDING');
  const alertCount = proximos.length;

  const totalNW = 23590.73;
  const variationPct = 24;

  const onAction = (key: string) => {
    if (key === 'withdraw') setCashflowType('EXPENSE');
    else setQuickOpen(true);
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <PremiumHeroCard
        displayName={displayName}
        handle={handle}
        totalValue={totalNW}
        variationPct={variationPct}
        variationText="+24% Last week"
        hideValues={hide}
        onToggleHide={toggleHideValues}
        onAction={onAction}
        onRewards={() => {}}
        onAlerts={() => {}}
        alertCount={alertCount}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={s.loadingBanner} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={s.loadingText}>Carregando dados...</Text>
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Favourite Contacts</Text>
            <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel="Ver todos os contatos">
              <Text style={s.viewAll}>View all  ›</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.contactsRow}>
            {FAVORITE_CONTACTS.map((c) => {
              if (c.isAdd) {
                return (
                  <View key={c.id} style={s.contactItem}>
                    <Pressable style={s.contactAdd} accessibilityRole="button" accessibilityLabel="Adicionar contato">
                      <Plus size={20} color={colors.accent} />
                    </Pressable>
                    <Text style={s.contactName}>Add</Text>
                  </View>
                );
              }
              return (
                <View key={c.id} style={s.contactItem}>
                  <View style={[s.contactAvatar, { backgroundColor: c.color }]}>
                    <Text style={s.contactInitials}>{c.initials}</Text>
                  </View>
                  <Text style={s.contactName} numberOfLines={1}>{c.name}</Text>
                  <Text style={s.contactHandle} numberOfLines={1}>{c.handle}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>Transactions</Text>
              <Text style={s.sectionSubtitle}>Today</Text>
            </View>
            <Pressable hitSlop={6} accessibilityRole="button" accessibilityLabel="Ver todas as transacoes">
              <Text style={s.viewAll}>View all  ›</Text>
            </Pressable>
          </View>

          {RECENT_TX.map((tx) => {
            const positive = tx.direction === 'IN';
            const Icon = positive ? ArrowDownLeft : ArrowUpRight;
            const color = positive ? colors.success : colors.danger;
            return (
              <View key={tx.id} style={s.txRow}>
                <View style={[s.txIconBox, { backgroundColor: color + '22' }]}>
                  <Icon size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txTitle} numberOfLines={1}>{tx.title}</Text>
                  <Text style={s.txSubtitle} numberOfLines={1}>{tx.subtitle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.txAmount, { color }]}>
                    {positive ? '+' : '−'}${Math.abs(tx.amount).toFixed(2)}
                  </Text>
                  <Text style={s.txTime}>{tx.time}</Text>
                </View>
              </View>
            );
          })}

          {!bills.length ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
          ) : proximos.length > 0 ? (
            <Pressable style={s.viewAllRow}>
              <Text style={s.viewAllText}>{proximos.length} contas reais pendentes no app</Text>
              <ChevronRight size={14} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <Text style={s.footer}>{bills.length} contas · {goals.length} cofrinhos</Text>
      </ScrollView>

      <QuickEntryModal visible={quickOpen} onClose={() => setQuickOpen(false)} onSelect={onQuickSelect} />
      {cashflowType && (
        <CashflowForm visible={true} defaultType={cashflowType} onClose={() => setCashflowType(null)} />
      )}
      <ChooseGoalModal visible={chooseGoalOpen} onClose={() => setChooseGoalOpen(false)} onSelect={onGoalPicked} />
      {depositCtx && (
        <GoalDepositForm visible={true} goal={depositCtx.goal} type={depositCtx.type} onClose={() => setDepositCtx(null)} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingTop: 20, paddingBottom: 120, gap: spacing.md },
  section: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  sectionSubtitle: { color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 },
  viewAll: { color: colors.textMuted, fontSize: typography.size.sm, fontWeight: '500' },
  contactsRow: { gap: 14, paddingRight: 20 },
  contactItem: { alignItems: 'center', width: 60, gap: 4 },
  contactAdd: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.accent + '55',
    backgroundColor: colors.surfaceDark1,
    alignItems: 'center', justifyContent: 'center',
  },
  contactAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  contactInitials: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  contactName: { color: colors.text, fontSize: 11, fontWeight: '600', marginTop: 2 },
  contactHandle: { color: colors.textMuted, fontSize: 9 },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  txIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: '600' },
  txSubtitle: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  txAmount: { fontSize: typography.size.md, fontWeight: '700', fontFamily: 'monospace' },
  txTime: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  viewAllRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: colors.surfaceDark1, borderRadius: 12, marginTop: 8,
  },
  viewAllText: { color: colors.textMuted, fontSize: typography.size.sm, flex: 1 },
  loadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.border,
  },
  loadingText: { color: colors.textMuted, fontSize: typography.size.sm },
  footer: { color: colors.textMuted, fontSize: typography.size.xs, textAlign: 'center', letterSpacing: 1, marginTop: spacing.md },
});
