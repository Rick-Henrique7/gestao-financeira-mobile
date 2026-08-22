import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PiggyBank, Plus, ArrowDownToLine, ArrowUpFromLine, Target as TargetIcon,
  Plane, Car, Home, GraduationCap, Heart, Gift,
  Smartphone, ShoppingBag, Briefcase, Wallet, Trash2, Calculator,
} from 'lucide-react-native';
import { useGoalsStore } from '../src/stores/goalsStore';
import { fmt } from '../src/lib/format';
import { colors, radius, spacing, typography } from '../src/lib/theme';
import { FAB } from '../src/components/form/FAB';
import { GoalForm } from '../src/components/forms/GoalForm';
import { GoalDepositForm } from '../src/components/forms/GoalDepositForm';
import { GoalSimulatorForm } from '../src/components/forms/GoalSimulatorForm';
import type { FinancialGoal, GoalDepositType } from '../src/types';

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

const ICON_LABEL: Record<string, string> = {
  default: 'Geral', Target: 'Reserva', Plane: 'Viagem', Car: 'Carro', Home: 'Casa',
  GraduationCap: 'Estudo', Heart: 'Saude', Gift: 'Presente',
  Smartphone: 'Eletronico', ShoppingBag: 'Compras', Briefcase: 'Trabalho', Wallet: 'Outros',
};

export default function GoalsScreen() {
  const { goals, refresh, remove, refreshRecentDeposits, recentDeposits } = useGoalsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [depositCtx, setDepositCtx] = useState<{ goal: FinancialGoal; type: GoalDepositType } | null>(null);
  const [simGoal, setSimGoal] = useState<FinancialGoal | null>(null);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (goals.length > 0) {
      refreshRecentDeposits(10);
    }
  }, [goals.length, refreshRecentDeposits]);

  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.h1}>Cofrinhos</Text>
          <Text style={s.sub}>
            {goals.length} {goals.length === 1 ? 'objetivo ativo' : 'objetivos ativos'}
          </Text>
        </View>

        {goals.length > 0 && (
          <View style={s.summary}>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <Text style={s.summaryLabel}>Total guardado</Text>
                <Text style={s.summaryValue}>{fmt(totalSaved)}</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={s.summaryLabel}>Total meta</Text>
                <Text style={[s.summaryValue, { color: colors.muted }]}>{fmt(totalTarget)}</Text>
              </View>
            </View>
            <View style={s.summaryBarBg}>
              <View
                style={[
                  s.summaryBarFill,
                  {
                    width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={s.summaryPct}>
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% do total
            </Text>
          </View>
        )}

        {goals.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <PiggyBank size={48} color={colors.muted} strokeWidth={1.5} />
            </View>
            <Text style={s.emptyTitle}>Voce ainda nao criou nenhum cofrinho</Text>
            <Text style={s.emptySub}>
              Defina uma meta (ex: Reserva de emergencia) para comecar a guardar.
            </Text>
            <Pressable onPress={() => setFormOpen(true)} style={s.emptyBtn}>
              <Plus size={18} color={colors.base} />
              <Text style={s.emptyBtnText}>Criar primeiro cofrinho</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.grid}>
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onDeposit={() => setDepositCtx({ goal: g, type: 'DEPOSIT' })}
                onWithdraw={() => setDepositCtx({ goal: g, type: 'WITHDRAWAL' })}
                onSimulate={() => setSimGoal(g)}
                onDelete={() => {
                  Alert.alert(
                    'Excluir cofrinho?',
                    `Esta acao nao pode ser desfeita. O cofrinho "${g.title}" e todos os seus depositos serao removidos.`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Excluir', style: 'destructive', onPress: () => { void remove(g.id); } },
                    ],
                    { cancelable: true }
                  );
                }}
              />
            ))}
          </View>
        )}

        {recentDeposits.length > 0 && (
          <View style={s.activity}>
            <Text style={s.activityTitle}>Atividade recente</Text>
            {recentDeposits.slice(0, 5).map((d) => {
              const goal = goals.find((x) => x.id === d.goal_id);
              const isDep = d.type === 'DEPOSIT';
              return (
                <View key={d.id} style={s.activityRow}>
                  <View style={[s.activityDot, { backgroundColor: isDep ? colors.success : colors.danger }]}>
                    {isDep ? <ArrowDownToLine size={12} color={colors.base} /> : <ArrowUpFromLine size={12} color={colors.base} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityText} numberOfLines={1}>
                      {isDep ? 'Aporte' : 'Resgate'} em {goal?.title ?? 'cofrinho'}
                    </Text>
                    {d.notes ? <Text style={s.activityNote} numberOfLines={1}>{d.notes}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.activityVal, { color: isDep ? colors.success : colors.danger }]}>
                      {isDep ? '+' : '−'} {fmt(d.amount)}
                    </Text>
                    <Text style={s.activityDate}>
                      {new Date(d.transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar cofrinho" />
      <GoalForm visible={formOpen} onClose={() => setFormOpen(false)} />

      {depositCtx && (
        <GoalDepositForm
          visible={true}
          goal={depositCtx.goal}
          type={depositCtx.type}
          onClose={() => setDepositCtx(null)}
        />
      )}

      <GoalSimulatorForm
        visible={simGoal !== null}
        goal={simGoal}
        onClose={() => setSimGoal(null)}
      />
    </SafeAreaView>
  );
}

function GoalCard({
  goal, onDeposit, onWithdraw, onSimulate, onDelete,
}: {
  goal: FinancialGoal;
  onDeposit: () => void;
  onWithdraw: () => void;
  onSimulate: () => void;
  onDelete: () => void;
}) {
  const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const months = Math.max(1, Math.ceil(
    (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
  ));
  const monthly = remaining > 0 ? remaining / months : 0;
  const Icon = ICON_MAP[goal.category_icon] ?? PiggyBank;
  const colorHex = goal.color_hex || '#3B82F6';

  return (
    <View style={[s.card, { borderColor: colorHex + '44' }]}>
      <View style={s.cardTop}>
        <View style={[s.iconCircle, { backgroundColor: colorHex }]}>
          <Icon size={20} color={colors.base} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={1}>{goal.title}</Text>
          <Text style={s.cardCategory}>{ICON_LABEL[goal.category_icon] ?? 'Geral'}</Text>
        </View>
        <View style={s.cardActions}>
          <Pressable
            onPress={onSimulate}
            style={s.iconBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Simular aporte do cofrinho ${goal.title}`}
          >
            <Calculator size={14} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={s.iconBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Excluir cofrinho ${goal.title}`}
            accessibilityHint="Acao irreversivel - abre dialogo de confirmacao"
          >
            <Trash2 size={14} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <View style={s.valueRow}>
        <View>
          <Text style={s.currentValue}>{fmt(goal.current_amount)}</Text>
          <Text style={s.targetValue}>de {fmt(goal.target_amount)}</Text>
        </View>
        <Text style={[s.pct, { color: colorHex }]}>{pct.toFixed(0)}%</Text>
      </View>

      <View style={s.barBg}>
        <View style={[s.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: colorHex }]} />
      </View>

      <View style={s.cardInfo}>
        <Text style={s.infoText}>
          Prazo: {new Date(goal.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
        <Text style={s.infoText}>
          {remaining > 0 ? `Sugestao: ${fmt(monthly)}/mes` : 'Meta atingida!'}
        </Text>
      </View>

      <View style={s.btnRow}>
        <Pressable
          onPress={onDeposit}
          style={[s.actionBtn, { backgroundColor: colors.success + '22', borderColor: colors.success + '55' }]}
          accessibilityRole="button"
          accessibilityLabel={`Aportar no cofrinho ${goal.title}`}
        >
          <ArrowDownToLine size={14} color={colors.success} />
          <Text style={[s.actionBtnText, { color: colors.success }]}>Aportar</Text>
        </Pressable>
        <Pressable
          onPress={onWithdraw}
          style={[s.actionBtn, { backgroundColor: colors.danger + '22', borderColor: colors.danger + '55' }]}
          disabled={goal.current_amount <= 0}
          accessibilityRole="button"
          accessibilityLabel={`Resgatar do cofrinho ${goal.title}`}
          accessibilityState={{ disabled: goal.current_amount <= 0 }}
        >
          <ArrowUpFromLine size={14} color={colors.danger} />
          <Text style={[s.actionBtnText, { color: colors.danger }]}>Resgatar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 20, paddingBottom: 100, gap: spacing.md },
  header: { gap: 4, marginBottom: spacing.sm },
  h1: { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.semibold },
  sub: { color: colors.muted, fontSize: typography.size.sm },
  summary: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { gap: 2 },
  summaryLabel: { color: colors.muted, fontSize: typography.size.xs, letterSpacing: 1 },
  summaryValue: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  summaryBarBg: { height: 6, backgroundColor: colors.surfaceHigh, borderRadius: 3, overflow: 'hidden' },
  summaryBarFill: { height: '100%', borderRadius: 3 },
  summaryPct: { color: colors.muted, fontSize: typography.size.xs, textAlign: 'right' },
  empty: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: spacing.md,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  emptySub: { color: colors.muted, fontSize: typography.size.sm, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderRadius: radius.button, marginTop: spacing.sm,
  },
  emptyBtnText: { color: colors.base, fontWeight: typography.weight.bold, fontSize: typography.size.md },
  grid: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  cardCategory: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { padding: 10, borderRadius: radius.small, backgroundColor: colors.surfaceHigh },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  currentValue: { color: colors.text, fontSize: typography.size.xxl, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  targetValue: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
  pct: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  barBg: { height: 8, backgroundColor: colors.surfaceHigh, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  infoText: { color: colors.muted, fontSize: typography.size.xs },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: radius.button, borderWidth: 1,
  },
  actionBtnText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  activity: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  activityTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold, marginBottom: spacing.xs },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  activityDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityText: { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  activityNote: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
  activityVal: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  activityDate: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
});
