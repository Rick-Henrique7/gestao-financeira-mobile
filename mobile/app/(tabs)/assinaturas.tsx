import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from '../../src/lib/AppThemeProvider';
import { useSubsStore } from '../../src/stores/subscriptionsStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { SubscriptionForm } from '../../src/components/forms/SubscriptionForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';

export default function AssinaturasScreen() {
  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.base },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 100, gap: t.spacing.md },
    display: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
    },
    displayOnNeon: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    label: { color: t.colors.textMuted, fontSize: t.typography.size.xs, textTransform: 'uppercase' as const, letterSpacing: 1.5, fontWeight: t.typography.weight.semibold },
    labelOnNeon: { color: t.colors.textOnNeon },
    bigValue: { fontSize: 36, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono, marginTop: t.spacing.xs },
    bigValueOnNeon: { color: t.colors.textOnNeon },
    unit: { fontSize: t.typography.size.lg, color: t.colors.textMuted, fontWeight: t.typography.weight.regular },
    unitOnNeon: { color: t.colors.textOnNeon, opacity: 0.7 },
    sub: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: t.spacing.xs },
    subOnNeon: { color: t.colors.textOnNeon, opacity: 0.75 },
    title: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold, marginBottom: t.spacing.md },
    empty: { color: t.colors.textMuted, fontSize: t.typography.size.md, textAlign: 'center' as const, paddingVertical: t.spacing.lg },
    grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.spacing.sm },
    card: {
      width: '48%' as const, flexGrow: 1, backgroundColor: t.colors.surfaceHigh,
      borderRadius: t.radius.display, padding: t.spacing.md, borderWidth: 1, borderColor: t.colors.border,
    },
    avatar: { width: 40, height: 40, borderRadius: t.radius.button, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: t.spacing.sm },
    avatarText: { color: t.colors.text, fontWeight: t.typography.weight.bold, fontSize: t.typography.size.md },
    serviceName: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold },
    category: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2 },
    price: { color: t.colors.accent, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono, marginTop: t.spacing.sm },
    yearly: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2, fontFamily: t.typography.fontFamily.mono },
  }));

  const { subs } = useSubsStore();
  const [formOpen, setFormOpen] = useState(false);
  const totalMensal = subs.filter((sub) => sub.status === 'ACTIVE').reduce((acc, sub) => acc + sub.monthly_cost, 0);
  const totalAnual = totalMensal * 12;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Assinaturas" subtitle="Cofre de servicos recorrentes" />
        <View style={[s.display, s.displayOnNeon]}>
          <Text style={[s.label, s.labelOnNeon]}>Cofre de Assinaturas</Text>
          <Text style={[s.bigValue, s.bigValueOnNeon]}>
            {fmt(totalAnual)}
            <Text style={[s.unit, s.unitOnNeon]}>/ano</Text>
          </Text>
          <Text style={[s.sub, s.subOnNeon]}>
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
