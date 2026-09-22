import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useBillsStore } from '../../src/stores/billsStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { BillForm } from '../../src/components/forms/BillForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import type { Bill } from '../../src/types';

type FilterKey = 'PENDING' | 'OVERDUE' | 'PAID' | 'ALL';
type SortKey = 'DUE_DATE' | 'AMOUNT' | 'CATEGORY';

const FILTER_TABS: Array<{ key: FilterKey; label: string }> = [
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'OVERDUE', label: 'Vencidas' },
  { key: 'PAID',    label: 'Pagas' },
  { key: 'ALL',     label: 'Todas' },
];

export default function BillsScreen() {
  const { colors, typography } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: 'transparent' },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 100, gap: t.spacing.md },
    display: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
    },
    label: { color: t.colors.textMuted, fontSize: t.typography.size.xs, textTransform: 'uppercase' as const, letterSpacing: 1.5, fontWeight: t.typography.weight.semibold },
    bigValue: { fontSize: 32, fontWeight: t.typography.weight.black, letterSpacing: t.typography.letterSpacing.tight, marginTop: t.spacing.xs },
    sub: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: t.spacing.xs },
    title: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold, marginBottom: t.spacing.md },
    empty: { color: t.colors.textMuted, fontSize: t.typography.size.md, textAlign: 'center' as const, paddingVertical: t.spacing.lg },
    row: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
      paddingVertical: t.spacing.md,
      borderBottomWidth: 1, borderBottomColor: t.colors.border,
    },
    rowDone: { opacity: 0.5 },
    checkbox: {
      width: 22, height: 22, borderRadius: 6,
      borderWidth: 2, borderColor: t.colors.borderStrong,
    },
    checkboxDone: { backgroundColor: t.colors.accent, borderColor: t.colors.accent, alignItems: 'center' as const, justifyContent: 'center' as const },
    strikethrough: { textDecorationLine: 'line-through' as const },
    billTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.medium },
    billMeta: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: 2 },
    billAmount: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold },
    summaryRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingTop: t.spacing.md },
    summaryLabel: { color: t.colors.textMuted, fontSize: t.typography.size.sm },
    summaryValue: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
    loading: { marginVertical: 16 },
    // Filter chips
    filterRow: {
      flexDirection: 'row' as const, gap: t.spacing.sm,
      paddingVertical: t.spacing.xs,
    },
    filterChip: {
      paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.pill, backgroundColor: t.colors.surface,
      borderWidth: 1, borderColor: t.colors.border,
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
    },
    filterChipActive: {
      backgroundColor: t.colors.accent, borderColor: t.colors.accent,
    },
    filterChipText: { color: t.colors.textMuted, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.semibold },
    filterChipTextActive: { color: t.colors.textOnNeon },
    filterChipCount: {
      color: t.colors.textMuted, fontSize: 10, fontWeight: t.typography.weight.bold,
      paddingHorizontal: 5, paddingVertical: 1,
      borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)',
      minWidth: 18, textAlign: 'center' as const,
    },
    filterChipCountActive: { color: t.colors.textOnNeon, backgroundColor: 'rgba(0,0,0,0.15)' },
    sortRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm, marginTop: t.spacing.sm },
    sortChip: {
      paddingHorizontal: t.spacing.sm, paddingVertical: 4,
      borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1, borderColor: t.colors.border,
    },
    sortChipActive: { backgroundColor: t.colors.surfaceHigh, borderColor: t.colors.accent },
    sortChipText: { color: t.colors.textMuted, fontSize: t.typography.size.xs, fontWeight: t.typography.weight.semibold },
    sortChipTextActive: { color: t.colors.accent },
  }));

  const { bills, loading, refresh, togglePaid, remove } = useBillsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('PENDING');
  const [sort, setSort] = useState<SortKey>('DUE_DATE');

  useEffect(() => { refresh(); }, [refresh]);

  const pending  = bills.filter((b) => b.status === 'PENDING');
  const paid     = bills.filter((b) => b.status === 'PAID');
  const overdue  = bills.filter((b) => b.status === 'OVERDUE');
  const totalPending  = pending.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid     = paid.reduce((acc, b) => acc + b.amount, 0);

  // Filtragem + ordenacao
  const filtered = useMemo(() => {
    let arr: Bill[];
    if (filter === 'ALL') arr = bills;
    else arr = bills.filter((b) => b.status === filter);
    arr = [...arr].sort((a, b) => {
      if (sort === 'AMOUNT') return b.amount - a.amount;
      if (sort === 'CATEGORY') return (a.category ?? 'z').localeCompare(b.category ?? 'z');
      // default: due_date
      return a.due_date.localeCompare(b.due_date);
    });
    return arr;
  }, [bills, filter, sort]);

  const countFor = (key: FilterKey): number => {
    if (key === 'PENDING') return pending.length;
    if (key === 'OVERDUE') return overdue.length;
    if (key === 'PAID') return paid.length;
    return bills.length;
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Contas" subtitle="Suas contas a pagar e historico" />
        <View style={s.display}>
          <Text style={s.label}>A pagar</Text>
          <Text style={[s.bigValue, { color: colors.danger }]}>{fmt(totalPending)}</Text>
          <Text style={s.sub}>{pending.length} contas pendentes</Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Filtro</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {FILTER_TABS.map((f) => {
              const active = filter === f.key;
              const count = countFor(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[s.filterChip, active && s.filterChipActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${f.label} (${count})`}
                >
                  <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                    {f.label}
                  </Text>
                  <Text style={[s.filterChipCount, active && s.filterChipCountActive]}>
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={s.sortRow}>
            <Text style={s.sortChipText}>Ordenar por:</Text>
            {(['DUE_DATE', 'AMOUNT', 'CATEGORY'] as SortKey[]).map((sKey) => {
              const labels: Record<SortKey, string> = {
                DUE_DATE: 'Vencimento',
                AMOUNT: 'Valor',
                CATEGORY: 'Categoria',
              };
              const active = sort === sKey;
              return (
                <Pressable
                  key={sKey}
                  onPress={() => setSort(sKey)}
                  style={[s.sortChip, active && s.sortChipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[s.sortChipText, active && s.sortChipTextActive]}>
                    {labels[sKey]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.display}>
          <Text style={s.title}>
            {filter === 'ALL' ? 'Todas as contas' : `Contas ${FILTER_TABS.find(f => f.key === filter)?.label.toLowerCase()}`}
          </Text>
          {loading && <ActivityIndicator color={colors.accent} style={s.loading} />}
          {!loading && filtered.length === 0 && (
            <Text style={s.empty}>Nenhuma conta neste filtro</Text>
          )}
          {filtered.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => togglePaid(b.id)}
              onLongPress={() => {
                Alert.alert(
                  'Remover conta',
                  `Deseja remover "${b.title}"? Esta acao nao pode ser desfeita.`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Remover', style: 'destructive', onPress: () => { void remove(b.id); } },
                  ],
                  { cancelable: true }
                );
              }}
              style={[s.row, b.status === 'PAID' && s.rowDone]}
              accessibilityRole="button"
              accessibilityLabel={`${b.status === 'PAID' ? 'Desmarcar' : 'Marcar'} ${b.title} como ${b.status === 'PAID' ? 'paga' : 'paga'}`}
              accessibilityHint="Toque longo para remover"
            >
              <View style={[s.checkbox, b.status === 'PAID' && s.checkboxDone]}>
                {b.status === 'PAID' && <Check size={12} color={colors.textOnNeon} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.billTitle, b.status === 'PAID' && s.strikethrough]}>
                  {b.title}
                </Text>
                <Text style={s.billMeta}>
                  {b.category ?? 'Outros'} - vence {b.due_date.substring(8, 10)}/{b.due_date.substring(5, 7)}
                </Text>
              </View>
              <Text style={[s.billAmount, b.status === 'PAID' && s.strikethrough]}>
                {fmt(b.amount)}
              </Text>
            </Pressable>
          ))}
        </View>

        {(paid.length > 0 || overdue.length > 0) && (
          <View style={s.display}>
            <Text style={s.title}>Resumo historico</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total pago</Text>
              <Text style={s.summaryValue}>{fmt(totalPaid)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar conta" />
      <BillForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </SafeAreaView>
  );
}
