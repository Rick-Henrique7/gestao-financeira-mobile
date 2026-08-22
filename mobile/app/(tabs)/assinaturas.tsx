import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubsStore } from '../../src/stores/subscriptionsStore';
import { fmt } from '../../src/lib/format';
import { colors, radius, spacing, typography } from '../../src/lib/theme';
import { FAB } from '../../src/components/form/FAB';
import { SubscriptionForm } from '../../src/components/forms/SubscriptionForm';

export default function AssinaturasScreen() {
  const { subs } = useSubsStore();
  const [formOpen, setFormOpen] = useState(false);
  const totalMensal = subs.filter((s) => s.status === 'ACTIVE').reduce((acc, s) => acc + s.monthly_cost, 0);
  const totalAnual = totalMensal * 12;

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={[s.display, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
          <Text style={[s.label, { color: colors.textOnNeon }]}>Cofre de Assinaturas</Text>
          <Text style={[s.bigValue, { color: colors.textOnNeon }]}>
            {fmt(totalAnual)}
            <Text style={[s.unit, { color: colors.textOnNeon, opacity: 0.7 }]}>/ano</Text>
          </Text>
          <Text style={[s.sub, { color: colors.textOnNeon, opacity: 0.75 }]}>
            {fmt(totalMensal)} por mes · {subs.length} assinaturas ativas
          </Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Suas Assinaturas</Text>
          {subs.length === 0 ? (
            <Text style={s.empty}>
              Nenhuma assinatura cadastrada. Toque + para adicionar.
            </Text>
          ) : (
            <View style={s.grid}>
              {subs.map((sub) => (
                <View key={sub.id} style={s.card}>
                  <View style={[s.avatar, { backgroundColor: sub.color }]}>
                    <Text style={s.avatarText}>{sub.initials}</Text>
                  </View>
                  <Text style={s.serviceName} numberOfLines={1}>{sub.service_name}</Text>
                  {sub.category && <Text style={s.category} numberOfLines={1}>{sub.category}</Text>}
                  <Text style={s.price}>
                    {fmt(sub.monthly_cost)}<Text style={s.unit}>/mes</Text>
                  </Text>
                  <Text style={s.yearly}>{fmt(sub.monthly_cost * 12)}/ano</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar assinatura" />
      <SubscriptionForm visible={formOpen} onClose={() => setFormOpen(false)} />
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
  unit: { fontSize: typography.size.lg, color: colors.muted, fontWeight: typography.weight.regular },
  sub: { color: colors.muted, fontSize: typography.size.sm, marginTop: spacing.xs },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  empty: { color: colors.muted, fontSize: typography.size.md, textAlign: 'center', paddingVertical: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%', flexGrow: 1, backgroundColor: colors.surfaceHigh,
    borderRadius: radius.display, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  avatar: { width: 40, height: 40, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.text, fontWeight: typography.weight.bold, fontSize: typography.size.md },
  serviceName: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  category: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
  price: { color: colors.accent, fontSize: typography.size.md, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono, marginTop: spacing.sm },
  yearly: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2, fontFamily: typography.fontFamily.mono },
});
