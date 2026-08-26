import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useBillsStore } from '../../src/stores/billsStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { BillForm } from '../../src/components/forms/BillForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';

export default function BillsScreen() {
  const { colors, typography } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.base },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 100, gap: t.spacing.md },
    display: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
    },
    label: { color: t.colors.textMuted, fontSize: t.typography.size.xs, textTransform: 'uppercase' as const, letterSpacing: 1.5, fontWeight: t.typography.weight.semibold },
    bigValue: { fontSize: 36, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono, marginTop: t.spacing.xs },
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
    billAmount: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold, fontFamily: t.typography.fontFamily.mono },
    summaryRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingTop: t.spacing.md },
    summaryLabel: { color: t.colors.textMuted, fontSize: t.typography.size.sm },
    summaryValue: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono },
    loading: { marginVertical: 16 },
  }));

  const { bills, loading, refresh, togglePaid, remove } = useBillsStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  const pending  = bills.filter((b) => b.status === 'PENDING');
  const paid     = bills.filter((b) => b.status === 'PAID');
  const overdue  = bills.filter((b) => b.status === 'OVERDUE');
  const totalPending  = pending.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid     = paid.reduce((acc, b) => acc + b.amount, 0);

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
          <Text style={s.title}>Contas pendentes</Text>
          {loading && <ActivityIndicator color={colors.accent} style={s.loading} />}
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
                  {b.status === 'PAID' && <Check size={12} color={colors.textOnNeon} />}
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
