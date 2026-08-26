import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { CashflowForm } from '../../src/components/forms/CashflowForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';

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
      flexDirection: 'row' as const, justifyContent: 'space-between' as const,
      paddingVertical: t.spacing.sm, borderBottomWidth: 1, borderBottomColor: t.colors.border,
    },
    cat: { color: t.colors.text, fontSize: t.typography.size.md },
    catValue: {
      color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold,
      fontFamily: t.typography.fontFamily.mono,
    },
    empty: { color: t.colors.textMuted, fontSize: t.typography.size.md, textAlign: 'center' as const, paddingVertical: t.spacing.lg },
    divider: { height: 1, backgroundColor: t.colors.border },
    spacer: { height: t.spacing.md },
  }));

  const { transactions, summary } = useCashflowStore();
  const [formOpen, setFormOpen] = useState(false);
  const byCategory = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Orçamento" subtitle="Receitas, despesas e saldo do mes" />
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
              Nenhuma despesa cadastrada. Toque + para adicionar um lancamento.
            </Text>
          ) : (
            Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => (
                <View key={cat} style={s.row}>
                  <Text style={s.cat}>{cat}</Text>
                  <Text style={s.catValue}>{fmt(total)}</Text>
                </View>
              ))
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar lancamento" />
      <CashflowForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </SafeAreaView>
  );
}
