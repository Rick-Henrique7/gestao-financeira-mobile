import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../src/lib/theme';
import { useLoansStore } from '../src/stores/loansStore';
import { fmt } from '../src/lib/format';
import { FAB } from '../src/components/form/FAB';
import { LoanForm } from '../src/components/forms/LoanForm';
import { ScreenTitle } from '../src/components/ScreenTitle';

export default function LoansScreen() {
  const { loans, loading, refresh, pay, remove } = useLoansStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  const total      = loans.reduce((acc, l) => acc + l.amount, 0);
  const totalPaid  = loans.reduce((acc, l) => acc + l.amount_paid, 0);
  const totalOpen  = total - totalPaid;

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Empréstimos" subtitle="Valores a receber de amigos ou familia" />
        <View style={s.display}>
          <Text style={s.label}>A receber</Text>
          <Text style={[s.bigValue, { color: colors.success }]}>{fmt(totalOpen)}</Text>
          <Text style={s.sub}>
            {fmt(totalPaid)} recebido de {fmt(total)} emprestado
          </Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Emprestimos</Text>
          {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />}
          {!loading && loans.length === 0 && (
            <Text style={s.empty}>
              Nenhum emprestimo cadastrado. Toque + para adicionar.
            </Text>
          )}
          {loans.map((l) => (
            <View key={l.id} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{l.debtor_name}</Text>
                <Text style={s.meta}>
                  Vence {l.due_date.substring(8, 10)}/{l.due_date.substring(5, 7)} - {l.status}
                </Text>
                {l.amount_paid > 0 && (
                  <Text style={s.paidHint}>
                    Recebido: {fmt(l.amount_paid)} / {fmt(l.amount)}
                  </Text>
                )}
              </View>
              <View style={s.actions}>
                <Text style={s.amount}>{fmt(l.amount)}</Text>
                {l.status !== 'PAID' && (
                  <Pressable
                    onPress={() => pay(l.id, l.amount - l.amount_paid)}
                    style={s.payBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar ${l.debtor_name} como pago`}
                  >
                    <Text style={s.payBtnText}>Receber</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => remove(l.id)}
                  hitSlop={6}
                  style={s.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${l.debtor_name}`}
                >
                  <Text style={s.removeBtnText}>×</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar emprestimo" />
      <LoanForm visible={formOpen} onClose={() => setFormOpen(false)} />
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
  name: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  meta: { color: colors.muted, fontSize: typography.size.sm, marginTop: 2 },
  paidHint: { color: colors.success, fontSize: typography.size.xs, marginTop: 2 },
  actions: { alignItems: 'flex-end', gap: 6 },
  amount: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold, fontFamily: typography.fontFamily.mono },
  payBtn: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.button,
  },
  payBtnText: { color: colors.textOnNeon, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 2 },
  removeBtnText: { color: colors.muted, fontSize: typography.size.lg },
});
