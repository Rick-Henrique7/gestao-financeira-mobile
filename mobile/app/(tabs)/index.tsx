import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Wallet, ChevronRight, Plus, Settings as SettingsIcon, Bell, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, CreditCard, ArrowDownToLine,
  TrendingUp,
} from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useBillsStore } from '../../src/stores/billsStore';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { useGoalsStore } from '../../src/stores/goalsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { QuickEntryModal, type QuickEntryAction } from '../../src/components/QuickEntryModal';
import { CashflowForm } from '../../src/components/forms/CashflowForm';
import { ChooseGoalModal } from '../../src/components/ChooseGoalModal';
import { GoalDepositForm } from '../../src/components/forms/GoalDepositForm';
import { NotificationsModal } from '../../src/components/NotificationsModal';
import type { FinancialGoal, CashflowType } from '../../src/types';
import { fmt } from '../../src/lib/format';

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
};

type QuickActionKey = 'EXPENSE' | 'INCOME' | 'BILL' | 'GOAL_DEPOSIT';

const QUICK_ACTIONS: Array<{
  key: QuickActionKey;
  label: string;
  Icon: typeof ArrowUpRight;
  mapsTo?: QuickEntryAction;
}> = [
  { key: 'INCOME',        label: 'Receita',  Icon: ArrowDownLeft },
  { key: 'EXPENSE',       label: 'Despesa',  Icon: ArrowUpRight },
  { key: 'BILL',          label: 'Conta',    Icon: CreditCard },
  { key: 'GOAL_DEPOSIT',  label: 'Cofrinho', Icon: ArrowDownToLine },
];

export default function DashboardScreen() {
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.bgCanvas },

    // ── HERO (Figma: card verde-limão com dobra inferior arredondada) ──
    hero: {
      backgroundColor: t.colors.hero,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.lg,
      paddingBottom: t.spacing.xxl,
      borderBottomLeftRadius: t.radius.heroFold,
      borderBottomRightRadius: t.radius.heroFold,
    },
    heroHeader: {
      flexDirection: 'row' as const, alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: t.spacing.lg,
    },
    heroHeaderLeft: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
    },
    avatar: {
      width: 44, height: 44, borderRadius: t.radius.avatar,
      backgroundColor: t.colors.heroText,
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    avatarText: {
      color: t.colors.hero,
      fontWeight: t.typography.weight.black,
      fontSize: 16,
    },
    heroName: {
      color: t.colors.heroText,
      fontSize: t.typography.size.lg,
      fontWeight: t.typography.weight.black,
    },
    heroHandle: {
      color: t.colors.heroText + 'B3', // 70% opacity
      fontSize: t.typography.size.sm,
      marginTop: 1,
      fontWeight: t.typography.weight.medium,
    },
    heroIcons: {
      flexDirection: 'row' as const, gap: t.spacing.sm,
    },
    heroIconBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: t.colors.heroText,
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },

    heroBalanceRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: t.spacing.xs,
    },
    heroBalanceLabel: {
      color: t.colors.heroText,
      fontSize: t.typography.size.sm,
      fontWeight: t.typography.weight.semibold,
      letterSpacing: 0.3,
    },
    heroEye: { padding: 4 },
    heroValueRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
    },
    heroValue: {
      color: t.colors.heroText,
      fontSize: t.typography.size.hero,
      fontWeight: t.typography.weight.black,
      letterSpacing: t.typography.letterSpacing.tight,
    },
    heroTrendPill: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
      backgroundColor: t.colors.heroText,
      paddingHorizontal: t.spacing.md, paddingVertical: 6,
      borderRadius: t.radius.pill,
      alignSelf: 'flex-start' as const,
      marginTop: t.spacing.sm,
    },
    heroTrendText: {
      color: t.colors.hero,
      fontSize: t.typography.size.xs,
      fontWeight: t.typography.weight.bold,
    },

    heroActionsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginTop: t.spacing.lg,
    },
    heroAction: {
      alignItems: 'center' as const, gap: t.spacing.sm,
      width: 64,
    },
    heroActionBtn: {
      width: 56, height: 56, borderRadius: t.radius.button,
      backgroundColor: t.colors.heroText,
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    heroActionLabel: {
      color: t.colors.heroText,
      fontSize: t.typography.size.xs,
      fontWeight: t.typography.weight.semibold,
    },

    // ── CANVAS (seções abaixo do hero) ──
    scroll: { paddingTop: t.spacing.lg, paddingBottom: 140, gap: t.spacing.md },

    // Banner de pendentes (presente na 2ª imagem do kit)
    banner: {
      flexDirection: 'row' as const, alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.card,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
      marginHorizontal: t.spacing.lg,
    },
    bannerText: {
      color: t.colors.text,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.semibold,
    },

    // Lista de transações (Figma: ícone direcional circular à esquerda)
    sectionTitle: {
      color: t.colors.text,
      fontSize: t.typography.size.xl,
      fontWeight: t.typography.weight.black,
      paddingHorizontal: t.spacing.lg,
      marginTop: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    sectionSubtitle: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.sm,
      paddingHorizontal: t.spacing.lg,
      marginBottom: t.spacing.sm,
    },
    listRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
      backgroundColor: t.colors.surface,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
      marginHorizontal: t.spacing.lg,
      borderRadius: t.radius.card,
      borderWidth: 1, borderColor: t.colors.border,
    },
    listRowIconPos: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: t.colors.pos + '22',
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    listRowIconNeg: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: t.colors.neg + '22',
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    listRowIconGoal: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: t.colors.hero + '33',
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    listRowBody: { flex: 1 },
    listRowTitle: {
      color: t.colors.text,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.bold,
    },
    listRowSub: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.xs,
      marginTop: 2,
    },
    listRowValuePos: {
      color: t.colors.pos,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.bold,
    },
    listRowValueNeg: {
      color: t.colors.neg,
      fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.bold,
    },

    // Mini-chart
    chartCard: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.card,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
      marginHorizontal: t.spacing.lg,
    },
    chartHeader: {
      flexDirection: 'row' as const, justifyContent: 'space-between' as const,
      alignItems: 'center' as const, marginBottom: t.spacing.sm,
    },
    chartTitle: {
      color: t.colors.text, fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.semibold,
    },
    chartTrend: { fontSize: t.typography.size.xs, fontWeight: t.typography.weight.bold },
    chartTrendUp: { color: t.colors.success },
    chartTrendDown: { color: t.colors.danger },
    chartTrendFlat: { color: t.colors.muted },
    chartBarRow: {
      flexDirection: 'row' as const, alignItems: 'flex-end' as const,
      justifyContent: 'space-between' as const, height: 80, gap: 6,
    },
    chartBarCol: {
      flex: 1, alignItems: 'center' as const, justifyContent: 'flex-end' as const,
      height: '100%' as const,
    },
    chartBar: {
      width: '100%' as const, borderTopLeftRadius: 4, borderTopRightRadius: 4,
      backgroundColor: t.colors.hero,
    },
    chartBarNegative: { backgroundColor: t.colors.danger },
    chartBarMuted: { backgroundColor: t.colors.muted },
    chartBarLabel: { color: t.colors.textMuted, fontSize: 10, marginTop: 4 },
    chartBarLabelCurrent: { color: t.colors.text, fontWeight: t.typography.weight.bold },

    // Empty state
    empty: {
      marginHorizontal: t.spacing.lg, padding: t.spacing.xl,
      backgroundColor: t.colors.surface, borderRadius: t.radius.card,
      borderWidth: 1, borderColor: t.colors.border,
      alignItems: 'center' as const, gap: t.spacing.md,
    },
    emptyIconBox: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: t.colors.surfaceHigh,
      alignItems: 'center' as const, justifyContent: 'center' as const,
      borderWidth: 1.5, borderStyle: 'dashed' as const, borderColor: t.colors.hero + '55',
    },
    emptyTitle: {
      color: t.colors.text, fontSize: t.typography.size.md,
      fontWeight: t.typography.weight.bold, textAlign: 'center' as const,
    },
    emptyText: {
      color: t.colors.textMuted, fontSize: t.typography.size.sm,
      textAlign: 'center' as const,
    },
    emptyBtn: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      backgroundColor: t.colors.hero,
      paddingHorizontal: t.spacing.lg, paddingVertical: 12,
      borderRadius: t.radius.button, marginTop: t.spacing.sm,
    },
    emptyBtnText: {
      color: t.colors.heroText, fontWeight: t.typography.weight.bold,
    },

    // Loading / footer
    loading: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm,
    },
    loadingText: { color: t.colors.textMuted, fontSize: t.typography.size.sm },
    footer: {
      color: t.colors.textMuted, fontSize: t.typography.size.xs,
      textAlign: 'center' as const, letterSpacing: 1, marginTop: t.spacing.md,
    },
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

  const router = useRouter();
  const [quickOpen, setQuickOpen] = useState(false);
  const [cashflowType, setCashflowType] = useState<CashflowType | null>(null);
  const [chooseGoalOpen, setChooseGoalOpen] = useState(false);
  const [depositCtx, setDepositCtx] = useState<{ goal: FinancialGoal; type: 'DEPOSIT' | 'WITHDRAWAL' } | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mapeamento dos 4 botões do hero → comportamento existente do app
  const onHeroAction = (key: QuickActionKey) => {
    if (key === 'EXPENSE')      setCashflowType('EXPENSE');
    else if (key === 'INCOME')  setCashflowType('INCOME');
    else if (key === 'BILL')    setQuickOpen(true);
    else if (key === 'GOAL_DEPOSIT') setChooseGoalOpen(true);
  };

  const onGoalPicked = (goal: FinancialGoal) => {
    setDepositCtx({ goal, type: 'DEPOSIT' });
  };

  const displayName = settings?.display_name?.trim() || 'Convidado';
  const firstName = displayName.split(' ')[0];
  const lastName = displayName.split(' ')[1] || '';
  const initials = (firstName[0] || '?') + (lastName[0] || '');
  const proximos = bills.filter((b) => b.status === 'PENDING');
  const totalGoalsSaved = goals.reduce((acc, g) => acc + (g.current_amount ?? 0), 0);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();
  const isEmpty = bills.length === 0 && goals.length === 0 && summary.income === 0 && summary.expense === 0;

  // Saldo total mostrado no hero (mesma fórmula da PremiumHeroCard anterior)
  const totalBalance = summary.balance + totalGoalsSaved;

  // Trend pill: compara saldo atual com 0 (placeholder até termos histórico real)
  const trendLabel = (() => {
    if (summary.balance > 0) return `+${Math.round((summary.income || 1) / 100)}% este mes`;
    if (summary.balance < 0) return 'negativo';
    return 'sem variacao';
  })();

  // Transações recentes (até 4) — combina bills + cashflow do mês
  const recentTransactions = (() => {
    const items: Array<{
      id: string;
      title: string;
      sub: string;
      amount: number;
      kind: 'EXPENSE' | 'INCOME' | 'GOAL';
      dateLabel: string;
    }> = [];

    // Bills pagos no mês viram despesas
    bills
      .filter((b) => b.status === 'PAID')
      .slice(0, 3)
      .forEach((b) => {
        items.push({
          id: `bill-${b.id}`,
          title: b.title,
          sub: `Conta paga`,
          amount: -b.amount,
          kind: 'EXPENSE',
          dateLabel: 'pago',
        });
      });

    // Goals ativos viram "guardado"
    goals.slice(0, 2).forEach((g) => {
      items.push({
        id: `goal-${g.id}`,
        title: `Cofrinho: ${g.title}`,
        sub: `${Math.round((g.current_amount / Math.max(g.target_amount, 1)) * 100)}% da meta`,
        amount: g.current_amount,
        kind: 'GOAL',
        dateLabel: 'guardado',
      });
    });

    return items.slice(0, 4);
  })();

  // Mini-chart
  const monthLabels = (() => {
    const now = new Date();
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));
    }
    return labels;
  })();

  const monthlyBalances = [0, 0, 0, 0, 0, summary.balance];
  const maxAbsBalance = Math.max(1, ...monthlyBalances.map((v) => Math.abs(v)));
  const trendUp = summary.balance > 0;
  const trendDown = summary.balance < 0;
  const showChart = !isEmpty && monthlyBalances.some((v) => v !== 0);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* ── HERO VERDE-LIMÃO ── */}
      <View style={s.hero}>
        <View style={s.heroHeader}>
          <View style={s.heroHeaderLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.heroName}>{displayName}</Text>
              <Text style={s.heroHandle}>@{firstName.toLowerCase()}</Text>
            </View>
          </View>
          <View style={s.heroIcons}>
            <Pressable
              style={s.heroIconBtn}
              onPress={() => setNotificationsOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Notificacoes"
            >
              <Bell size={18} color={colors.hero} strokeWidth={2.2} />
            </Pressable>
            <Pressable
              style={s.heroIconBtn}
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Configuracoes"
            >
              <SettingsIcon size={18} color={colors.hero} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        <View style={s.heroBalanceRow}>
          <Text style={s.heroBalanceLabel}>Saldo total</Text>
          <Pressable
            style={s.heroEye}
            onPress={() => setShowBalance((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {showBalance
              ? <Eye size={18} color={colors.heroText} strokeWidth={2.2} />
              : <EyeOff size={18} color={colors.heroText} strokeWidth={2.2} />}
          </Pressable>
        </View>

        <View style={s.heroValueRow}>
          <Text style={s.heroValue}>
            {showBalance ? fmt(totalBalance) : '••••••'}
          </Text>
        </View>

        <View style={s.heroTrendPill}>
          <TrendingUp size={12} color={colors.hero} strokeWidth={2.5} />
          <Text style={s.heroTrendText}>{trendLabel}</Text>
        </View>

        <View style={s.heroActionsRow}>
          {QUICK_ACTIONS.map(({ key, label, Icon }) => (
            <Pressable
              key={key}
              style={s.heroAction}
              onPress={() => onHeroAction(key)}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={s.heroActionBtn}>
                <Icon size={22} color={colors.hero} strokeWidth={2.2} />
              </View>
              <Text style={s.heroActionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── CONTEÚDO DO CANVAS ── */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner de pendentes (visível na 2ª imagem do kit) */}
        {!isEmpty && proximos.length > 0 && (
          <Pressable
            style={s.banner}
            onPress={() => {/* ja estamos na home; sem destino extra */}}
            accessibilityRole="button"
          >
            <Text style={s.bannerText}>
              {proximos.length} conta{proximos.length === 1 ? '' : 's'} pendente{proximos.length === 1 ? '' : 's'} no app
            </Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Mini-chart de saldo */}
        {showChart && (
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>Saldo dos ultimos 6 meses</Text>
              <Text style={[
                s.chartTrend,
                trendUp ? s.chartTrendUp : trendDown ? s.chartTrendDown : s.chartTrendFlat,
              ]}>
                {trendUp ? '▲' : trendDown ? '▼' : '—'} {fmt(summary.balance)}
              </Text>
            </View>
            <View style={s.chartBarRow}>
              {monthlyBalances.map((value, idx) => {
                const heightPct = value === 0 ? 4 : (Math.abs(value) / maxAbsBalance) * 100;
                const isCurrent = idx === 5;
                const barStyle = value === 0
                  ? s.chartBarMuted
                  : (value < 0 ? s.chartBarNegative : s.chartBar);
                return (
                  <View key={idx} style={s.chartBarCol}>
                    <View
                      style={[s.chartBar, barStyle, { height: `${heightPct}%` }]}
                      accessibilityLabel={`${monthLabels[idx]}: ${fmt(value)}`}
                    />
                    <Text style={[s.chartBarLabel, isCurrent && s.chartBarLabelCurrent]}>
                      {monthLabels[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {loading && (
          <View style={s.loading} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.hero} size="small" />
            <Text style={s.loadingText}>Carregando dados...</Text>
          </View>
        )}

        {/* Lista de "transactions" — usa dados reais do app */}
        {!isEmpty && recentTransactions.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Movimentacoes</Text>
            <Text style={s.sectionSubtitle}>Recentes</Text>
            {recentTransactions.map((tx) => {
              const Icon = tx.kind === 'INCOME'
                ? ArrowDownLeft
                : tx.kind === 'GOAL'
                  ? ArrowDownToLine
                  : ArrowUpRight;
              const iconStyle = tx.kind === 'INCOME'
                ? s.listRowIconPos
                : tx.kind === 'GOAL'
                  ? s.listRowIconGoal
                  : s.listRowIconNeg;
              const valueStyle = (tx.kind === 'EXPENSE')
                ? s.listRowValueNeg
                : s.listRowValuePos;
              const sign = tx.amount < 0 ? '-' : '+';
              return (
                <View key={tx.id} style={s.listRow}>
                  <View style={iconStyle}>
                    <Icon
                      size={18}
                      color={tx.kind === 'GOAL' ? colors.hero : (tx.kind === 'INCOME' ? colors.pos : colors.neg)}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={s.listRowBody}>
                    <Text style={s.listRowTitle}>{tx.title}</Text>
                    <Text style={s.listRowSub}>{tx.sub}</Text>
                  </View>
                  <Text style={valueStyle}>
                    {sign}{fmt(Math.abs(tx.amount))}
                  </Text>
                </View>
              );
            })}
          </>
        )}

        {isEmpty && (
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <Wallet size={28} color={colors.hero} />
            </View>
            <Text style={s.emptyTitle}>Seu gerenciador esta pronto</Text>
            <Text style={s.emptyText}>
              Use os botoes acima para adicionar uma conta, lancar uma despesa ou criar seu primeiro cofrinho.
            </Text>
            <Pressable
              style={s.emptyBtn}
              onPress={() => setCashflowType('EXPENSE')}
              accessibilityRole="button"
            >
              <Plus size={18} color={colors.heroText} strokeWidth={2.5} />
              <Text style={s.emptyBtnText}>Adicionar primeiro lancamento</Text>
            </Pressable>
          </View>
        )}

        <Text style={s.footer}>
          {greeting}, {firstName}
        </Text>
      </ScrollView>

      <QuickEntryModal visible={quickOpen} onClose={() => setQuickOpen(false)} onSelect={(a) => onHeroAction(a as QuickActionKey)} />
      {cashflowType && (
        <CashflowForm visible={true} defaultType={cashflowType} onClose={() => setCashflowType(null)} />
      )}
      <ChooseGoalModal visible={chooseGoalOpen} onClose={() => setChooseGoalOpen(false)} onSelect={onGoalPicked} />
      {depositCtx && (
        <GoalDepositForm visible={true} goal={depositCtx.goal} type={depositCtx.type} onClose={() => setDepositCtx(null)} />
      )}
      <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </SafeAreaView>
  );
}
