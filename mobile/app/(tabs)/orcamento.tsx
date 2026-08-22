import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCashflowStore } from '../../src/stores/cashflowStore';
import { fmt } from '../../src/lib/format';
import { colors, radius, spacing, typography } from '../../src/lib/theme';
import { FAB } from '../../src/components/form/FAB';
import { CashflowForm } from '../../src/components/forms/CashflowForm';

export default function OrcamentoScreen() {
  const { transactions, summary } = useCashflowStore();
  const [formOpen, setFormOpen] = useState(false);
  const byCategory = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.display}>
          <Text style={s.label}>Receitas</Text>
          <Text style={[s.bigValue, { color: colors.success }]}>{fmt(summary.income)}</Text>
          <View style={{ height: spacing.md }} />
          <Text style={s.label}>Despesas</Text>
          <Text style={[s.bigValue, { color: colors.danger }]}>{fmt(summary.expense)}</Text>
          <View style={{ height: spacing.md }} />
          <View style={s.divider} />
          <View style={{ height: spacing.md }} />
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 20, paddingBottom: 100, gap: spacing.md },
  display: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: typography.size.sm, textTransform: 'uppercase', letterSpacing: 1 },
  bigValue: {
    fontSize: typography.size.xxl, fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily.mono,
  },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  cat: { color: colors.text, fontSize: typography.size.md },
  catValue: {
    color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold,
    fontFamily: typography.fontFamily.mono,
  },
  empty: { color: colors.muted, fontSize: typography.size.md, textAlign: 'center', paddingVertical: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border },
});
