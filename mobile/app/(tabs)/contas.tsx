import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../src/lib/theme';
import { useBillsStore } from '../../src/stores/billsStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { BillForm } from '../../src/components/forms/BillForm';

export default function BillsScreen() {
  const { bills, loading, refresh, togglePaid, remove } = useBillsStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  const pending  = bills.filter((b) => b.status === 'PENDING');
  const paid     = bills.filter((b) => b.status === 'PAID');
  const overdue  = bills.filter((b) => b.status === 'OVERDUE');
  const totalPending  = pending.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid     = paid.reduce((acc, b) => acc + b.amount, 0);

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.display}>
          <Text style={s.label}>A pagar</Text>
          <Text style={[s.bigValue, { color: colors.danger }]}>{fmt(totalPending)}</Text>
          <Text style={s.sub}>{pending.length} contas pendentes</Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Contas pendentes</Text>
          {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />}
          {!loading && pending.length === 0 && (
            <Text style={s.empty}>Nenhuma conta pendente</Text>
          )}
          {pending.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => togglePaid(b.id)}
              onLongPress={() => remove(b.id)}
              style={s.row}
              accessibilityRole="button"
              accessibilityLabel={`Marcar ${b.title} como paga`}
              accessibilityHint="Toque longo para remover"
            >
              <View style={s.checkbox} />
              <View style={{ flex: 1 }}>
                <Text style={s.billTitle}>{b.title}</Text>
                <Text style={s.billMeta}>
                  {b.category ?? 'Outros'} - vence {b.due_date.substring(8, 10)}/{b.due_date.substring(5, 7)}
                </Text>
              </View>
              <Text style={s.billAmount}>{fmt(b.amount)}</Text>
            </Pressable>
          ))}
        </View>

        {(paid.length > 0 || overdue.length > 0) && (
          <View style={s.display}>
            <Text style={s.title}>Histórico</Text>
            {[...paid, ...overdue].map((b) => (
              <View key={b.id} style={[s.row, b.status === 'PAID' && s.rowDone]}>
                <View style={[s.checkbox, b.status === 'PAID' && s.checkboxDone]}>
                  {b.status === 'PAID' && <Check size={12} color={colors.base} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.billTitle, b.status === 'PAID' && s.strikethrough]}>
                    {b.title}
                  </Text>
                  <Text style={s.billMeta}>
                    {b.status === 'PAID' ? 'Pago' : 'Vencido'} - {b.due_date.substring(0, 10)}
                  </Text>
                </View>
                <Text style={[s.billAmount, b.status === 'PAID' && s.strikethrough]}>
                  {fmt(b.amount)}
                </Text>
              </View>
            ))}
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100, gap: spacing.md },
  display: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: typography.weight.semibold },
  bigValue: { fontSize: 36, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono, marginTop: spacing.xs },
  sub: { color: colors.muted, fontSize: typography.size.sm, marginTop: spacing.xs },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  empty: { color: colors.muted, fontSize: typography.size.md, textAlign: 'center', paddingVertical: spacing.lg },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowDone: { opacity: 0.5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.borderStrong,
  },
  checkboxDone: { backgroundColor: colors.accent, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  strikethrough: { textDecorationLine: 'line-through' },
  billTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.medium },
  billMeta: { color: colors.muted, fontSize: typography.size.sm, marginTop: 2 },
  billAmount: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold, fontFamily: typography.fontFamily.mono },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md },
  summaryLabel: { color: colors.muted, fontSize: typography.size.sm },
  summaryValue: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
});
