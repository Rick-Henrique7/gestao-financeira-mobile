import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, ChevronRight, Plus } from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useBillsStore } from '../../src/stores/billsStore';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { useGoalsStore } from '../../src/stores/goalsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { QuickEntryModal, type QuickEntryAction } from '../../src/components/QuickEntryModal';
import { CashflowForm } from '../../src/components/forms/CashflowForm';
import { ChooseGoalModal } from '../../src/components/ChooseGoalModal';
import { GoalDepositForm } from '../../src/components/forms/GoalDepositForm';
import type { FinancialGoal, CashflowType } from '../../src/types';

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
};

export default function DashboardScreen() {
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.bgCanvas },
    header: {
      flexDirection: 'row' as const, alignItems: 'center' as const,
      paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.lg, paddingBottom: t.spacing.md,
      gap: t.spacing.md,
    },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: t.colors.surfaceDark1,
      borderWidth: 1, borderColor: t.colors.accent + '55',
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    avatarText: { color: t.colors.accent, fontWeight: t.typography.weight.bold, fontSize: 16 },
    greetBox: { flex: 1 },
    greet: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.bold },
    subgreet: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: 2 },

    summary: {
      flexDirection: 'row' as const, gap: t.spacing.sm,
      paddingHorizontal: t.spacing.lg, marginTop: t.spacing.sm,
    },
    summaryCard: {
      flex: 1, backgroundColor: t.colors.surface,
      borderRadius: t.radius.display, padding: t.spacing.md,
      borderWidth: 1, borderColor: t.colors.border,
    },
    summaryLabel: {
      color: t.colors.textMuted, fontSize: t.typography.size.xs,
      textTransform: 'uppercase' as const, letterSpacing: 1.2, fontWeight: t.typography.weight.semibold,
    },
    summaryValue: {
      color: t.colors.text, fontSize: t.typography.size.lg,
      fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono, marginTop: 4,
    },
    summarySub: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2 },

    scroll: { paddingTop: t.spacing.lg, paddingBottom: 120, gap: t.spacing.md },
    sectionTitle: {
      color: t.colors.text, fontSize: t.typography.size.lg,
      fontWeight: t.typography.weight.bold, paddingHorizontal: t.spacing.lg, marginBottom: t.spacing.sm,
    },

    listRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
      backgroundColor: t.colors.surface, padding: t.spacing.md,
      marginHorizontal: t.spacing.lg,
      borderRadius: t.radius.display, borderWidth: 1, borderColor: t.colors.border,
    },
    listRowIcon: {
      width: 40, height: 40, borderRadius: t.radius.button,
      backgroundColor: t.colors.surfaceDark1,
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    listRowTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold, flex: 1 },
    listRowSub: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2 },

    empty: {
      marginHorizontal: t.spacing.lg, padding: t.spacing.xl,
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      borderWidth: 1, borderColor: t.colors.border,
      alignItems: 'center' as const, gap: t.spacing.md,
    },
    emptyIconBox: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: t.colors.surfaceDark1, alignItems: 'center' as const, justifyContent: 'center' as const,
      borderWidth: 1.5, borderStyle: 'dashed' as const, borderColor: t.colors.accent + '55',
    },
    emptyTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold, textAlign: 'center' as const },
    emptyText: { color: t.colors.textMuted, fontSize: t.typography.size.sm, textAlign: 'center' as const },
    emptyBtn: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      backgroundColor: t.colors.accent, paddingHorizontal: t.spacing.lg, paddingVertical: 10,
      borderRadius: t.radius.button, marginTop: t.spacing.sm,
    },
    emptyBtnText: { color: t.colors.textOnNeon, fontWeight: t.typography.weight.bold },

    footer: { color: t.colors.textMuted, fontSize: t.typography.size.xs, textAlign: 'center' as const, letterSpacing: 1, marginTop: t.spacing.md },
    loading: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm,
    },
    loadingText: { color: t.colors.textMuted, fontSize: t.typography.size.sm },
  }));

  const { bills, loading: billsLoading, refresh: refreshBills } = useBillsStore();
  const { summary, refresh: refreshCashflow } = useCashflowStore();
  const { goals, refresh: refreshGoals } = useGoalsStore();
  const { settings, refresh: refreshSettings } = useSettingsStore();
  const loading = billsLoading;

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

  const displayName = settings?.display_name?.trim() || 'Convidado';
  const firstName = displayName.split(' ')[0];
  const initials = (firstName[0] || '?') + (displayName.split(' ')[1]?.[0] || '');
  const proximos = bills.filter((b) => b.status === 'PENDING');
  const totalGoalsSaved = goals.reduce((acc, g) => acc + (g.current_amount ?? 0), 0);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();
  const isEmpty = bills.length === 0 && goals.length === 0 && summary.income === 0 && summary.expense === 0;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials.toUpperCase()}</Text>
        </View>
        <View style={s.greetBox}>
          <Text style={s.greet}>{greeting}, {firstName}</Text>
          <Text style={s.subgreet}>
            {isEmpty
              ? 'Vamos comecar?'
              : `${proximos.length} conta${proximos.length === 1 ? '' : 's'} pendente${proximos.length === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>

      <View style={s.summary}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Receitas (mes)</Text>
          <Text style={[s.summaryValue, { color: colors.success }]}>
            R$ {summary.income.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={s.summarySub}>do orcamento</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Despesas (mes)</Text>
          <Text style={[s.summaryValue, { color: colors.danger }]}>
            R$ {summary.expense.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={s.summarySub}>do orcamento</Text>
        </View>
      </View>

      <View style={s.summary}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Saldo (mes)</Text>
          <Text style={[s.summaryValue, { color: summary.balance >= 0 ? colors.success : colors.danger }]}>
            R$ {summary.balance.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={s.summarySub}>receitas - despesas</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Cofrinhos</Text>
          <Text style={[s.summaryValue, { color: colors.accent }]}>
            R$ {totalGoalsSaved.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={s.summarySub}>{goals.length} meta{goals.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={s.loading} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={s.loadingText}>Carregando dados...</Text>
          </View>
        )}

        {isEmpty ? (
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <Wallet size={28} color={colors.accent} />
            </View>
            <Text style={s.emptyTitle}>Seu gerenciador esta pronto</Text>
            <Text style={s.emptyText}>
              Use o botao + para adicionar uma conta, lancar uma despesa ou criar seu primeiro cofrinho.
            </Text>
            <Pressable style={s.emptyBtn} onPress={() => setQuickOpen(true)}>
              <Plus size={18} color={colors.textOnNeon} />
              <Text style={s.emptyBtnText}>Adicionar primeiro lancamento</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={s.sectionTitle}>Atalhos</Text>
            <Pressable style={s.listRow} onPress={() => setQuickOpen(true)} accessibilityRole="button">
              <View style={s.listRowIcon}>
                <Plus size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.listRowTitle}>Lancamento rapido</Text>
                <Text style={s.listRowSub}>Despesa, receita ou aporte em cofrinho</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          </>
        )}

        <Text style={s.footer}>
          {bills.length} conta{bills.length === 1 ? '' : 's'} · {goals.length} cofrinho{goals.length === 1 ? '' : 's'}
        </Text>
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
