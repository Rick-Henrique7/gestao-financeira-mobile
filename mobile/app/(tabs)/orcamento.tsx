import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronRight, Trash2, X } from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { CashflowForm } from '../../src/components/forms/CashflowForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';

const monthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
};

export default function OrcamentoScreen() {
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.base },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 100, gap: t.spacing.md },
    display: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
    },
    label: { color: t.colors.textMuted, fontSize: t.typography.size.sm, textTransform: 'uppercase' as const, letterSpacing: 1 },
    bigValue: {
      fontSize: t.typography.size.xxl, fontWeight: t.typography.weight.bold,
      fontFamily: t.typography.fontFamily.mono,
    },
    title: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold, marginBottom: t.spacing.md },
    row: {
      paddingVertical: t.spacing.sm,
      borderBottomWidth: 1, borderBottomColor: t.colors.border,
    },
    rowHeader: {
      flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
      paddingVertical: t.spacing.sm,
    },
    rowHeaderPressed: { backgroundColor: t.colors.surfaceHigh },
    cat: { color: t.colors.text, fontSize: t.typography.size.md },
    catCount: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginLeft: 6 },
    catValue: {
      color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold,
      fontFamily: t.typography.fontFamily.mono,
    },
    empty: { color: t.colors.textMuted, fontSize: t.typography.size.md, textAlign: 'center' as const, paddingVertical: t.spacing.lg },
    divider: { height: 1, backgroundColor: t.colors.border },
    spacer: { height: t.spacing.md },
    expandBody: {
      backgroundColor: t.colors.surfaceHigh,
      borderRadius: t.radius.button,
      padding: t.spacing.sm, gap: 4,
      marginVertical: t.spacing.xs,
    },
    txRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      paddingVertical: 6, paddingHorizontal: t.spacing.xs,
    },
    txDate: { color: t.colors.textMuted, fontSize: t.typography.size.xs, fontFamily: t.typography.fontFamily.mono, width: 60 },
    txDesc: { color: t.colors.text, fontSize: t.typography.size.sm, flex: 1 },
    txAmount: {
      color: t.colors.text, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.semibold,
      fontFamily: t.typography.fontFamily.mono, marginRight: t.spacing.xs,
    },
    txRemove: {
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: t.colors.surface, alignItems: 'center' as const, justifyContent: 'center' as const,
      borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    hint: { color: t.colors.textMuted, fontSize: 11, marginTop: t.spacing.xs, fontStyle: 'italic' as const },
  }));

  const { transactions, summary, refresh, remove } = useCashflowStore();
  const [formOpen, setFormOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const { start, end } = useMemo(() => monthRange(), []);

  useEffect(() => {
    refresh(start, end);
  }, [refresh, start, end]);

  // Agrupa transacoes por categoria (so EXPENSE)
  const byCategory = useMemo(() => {
    const grouped: Record<string, { total: number; txs: typeof transactions }> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        if (!grouped[t.category]) grouped[t.category] = { total: 0, txs: [] };
        grouped[t.category].total += t.amount;
        grouped[t.category].txs.push(t);
      });
    return grouped;
  }, [transactions]);

  const confirmDelete = (id: string, label: string) => {
    Alert.alert(
      'Remover lancamento',
      `Deseja remover "${label}"? Esta acao nao pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => { void remove(id); } },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Orcamento" subtitle="Receitas, despesas e saldo do mes" />
        <View style={s.display}>
          <Text style={s.label}>Receitas</Text>
          <Text style={[s.bigValue, { color: colors.success }]}>{fmt(summary.income)}</Text>
          <View style={s.spacer} />
          <Text style={s.label}>Despesas</Text>
          <Text style={[s.bigValue, { color: colors.danger }]}>{fmt(summary.expense)}</Text>
          <View style={s.spacer} />
          <View style={s.divider} />
          <View style={s.spacer} />
          <Text style={s.label}>Saldo</Text>
          <Text style={[s.bigValue, { color: colors.accent }]}>{fmt(summary.balance)}</Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Gastos por Categoria</Text>
          {Object.keys(byCategory).length === 0 ? (
            <Text style={s.empty}>
              Nenhuma despesa cadastrada neste mes. Toque + para adicionar.
            </Text>
          ) : (
            <>
              {Object.entries(byCategory)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([cat, { total, txs }]) => {
                  const isOpen = expandedCat === cat;
                  return (
                    <View key={cat} style={s.row}>
                      <Pressable
                        onPress={() => setExpandedCat(isOpen ? null : cat)}
                        style={({ pressed }) => [s.rowHeader, pressed && s.rowHeaderPressed]}
                        accessibilityRole="button"
                        accessibilityLabel={`${cat}: ${txs.length} lancamentos, total ${fmt(total)}`}
                        accessibilityState={{ expanded: isOpen }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          {isOpen
                            ? <ChevronDown size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                            : <ChevronRight size={14} color={colors.textMuted} style={{ marginRight: 4 }} />}
                          <Text style={s.cat}>{cat}</Text>
                          <Text style={s.catCount}>({txs.length})</Text>
                        </View>
                        <Text style={s.catValue}>{fmt(total)}</Text>
                      </Pressable>
                      {isOpen && (
                        <View style={s.expandBody}>
                          {txs
                            .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
                            .map((tx) => (
                              <View key={tx.id} style={s.txRow}>
                                <Text style={s.txDate}>
                                  {tx.transaction_date.substring(8, 10)}/{tx.transaction_date.substring(5, 7)}
                                </Text>
                                <Text style={s.txDesc} numberOfLines={1}>
                                  {tx.description || '(sem descricao)'}
                                </Text>
                                <Text style={s.txAmount}>{fmt(tx.amount)}</Text>
                                <Pressable
                                  onPress={() => confirmDelete(tx.id, tx.description || cat)}
                                  style={s.txRemove}
                                  hitSlop={6}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remover ${tx.description || cat}`}
                                >
                                  <X size={12} color={colors.danger} />
                                </Pressable>
                              </View>
                            ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              <Text style={s.hint}>Toque na categoria para ver os lancamentos</Text>
            </>
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar lancamento" />
      <CashflowForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </SafeAreaView>
  );
}
