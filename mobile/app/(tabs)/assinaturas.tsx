import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pause, Play, Trash2 } from 'lucide-react-native';
import { useStyles, useTheme } from '../../src/lib/AppThemeProvider';
import { useSubsStore } from '../../src/stores/subscriptionsStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { SubscriptionForm } from '../../src/components/forms/SubscriptionForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import type { Subscription } from '../../src/types';

export default function AssinaturasScreen() {
  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: 'transparent' },
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
    cardPaused: { opacity: 0.5 },
    avatar: { width: 40, height: 40, borderRadius: t.radius.button, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: t.spacing.sm },
    avatarText: { color: t.colors.text, fontWeight: t.typography.weight.bold, fontSize: t.typography.size.md },
    serviceName: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold },
    category: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2 },
    price: { color: t.colors.accent, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono, marginTop: t.spacing.sm },
    yearly: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2, fontFamily: t.typography.fontFamily.mono },
    statusBadge: {
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start',
      marginTop: t.spacing.xs,
    },
    statusBadgeActive: { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
    statusBadgePaused: { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
    statusBadgeCancelled: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
    statusText: { fontSize: 10, fontWeight: t.typography.weight.semibold },
    statusTextActive: { color: t.colors.success },
    statusTextPaused: { color: '#FBBF24' },
    statusTextCancelled: { color: t.colors.danger },
    cardActions: {
      flexDirection: 'row' as const, gap: 4, marginTop: t.spacing.sm,
      justifyContent: 'flex-end' as const,
    },
    actionBtn: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: t.colors.surface,
      alignItems: 'center' as const, justifyContent: 'center' as const,
      borderWidth: 1, borderColor: t.colors.border,
    },
    actionBtnDanger: { borderColor: 'rgba(248, 113, 113, 0.3)' },
    hint: { color: t.colors.textMuted, fontSize: 11, marginTop: t.spacing.xs, textAlign: 'center' as const, fontStyle: 'italic' as const },
  }));

  const { subs, remove, toggle } = useSubsStore();
  const { colors } = useTheme();
  const mutedColor = colors.muted;
  const successColor = colors.success;
  const dangerColor = colors.danger;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const totalMensal = subs.filter((sub) => sub.status === 'ACTIVE').reduce((acc, sub) => acc + sub.monthly_cost, 0);
  const totalAnual = totalMensal * 12;

  const onEdit = (sub: Subscription) => {
    setEditing(sub);
    setFormOpen(true);
  };

  const onCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = (sub: Subscription) => {
    Alert.alert(
      'Remover assinatura',
      `Deseja remover "${sub.service_name}"? Esta acao nao pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => { void remove(sub.id); } },
      ],
      { cancelable: true }
    );
  };

  const statusLabel = (status: string) => {
    if (status === 'ACTIVE') return 'Ativa';
    if (status === 'PAUSED') return 'Pausada';
    return 'Cancelada';
  };
  const statusStyle = (status: string) => {
    if (status === 'ACTIVE') return [s.statusBadge, s.statusBadgeActive];
    if (status === 'PAUSED') return [s.statusBadge, s.statusBadgePaused];
    return [s.statusBadge, s.statusBadgeCancelled];
  };
  const statusTextStyle = (status: string) => {
    if (status === 'ACTIVE') return [s.statusText, s.statusTextActive];
    if (status === 'PAUSED') return [s.statusText, s.statusTextPaused];
    return [s.statusText, s.statusTextCancelled];
  };

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
            {fmt(totalMensal)} por mes · {subs.filter(s => s.status === 'ACTIVE').length} ativas de {subs.length}
          </Text>
        </View>

        <View style={s.display}>
          <Text style={s.title}>Suas Assinaturas</Text>
          {subs.length === 0 ? (
            <Text style={s.empty}>
              Nenhuma assinatura cadastrada. Toque + para adicionar.
            </Text>
          ) : (
            <>
              <View style={s.grid}>
                {subs.map((sub) => (
                  <Pressable
                    key={sub.id}
                    onPress={() => onEdit(sub)}
                    style={[s.card, sub.status !== 'ACTIVE' && s.cardPaused]}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${sub.service_name}`}
                    accessibilityHint="Toque para editar, icone de lixeira para remover"
                  >
                    <View style={[s.avatar, { backgroundColor: sub.color }]}>
                      <Text style={s.avatarText}>{sub.initials}</Text>
                    </View>
                    <Text style={s.serviceName} numberOfLines={1}>{sub.service_name}</Text>
                    {sub.category && <Text style={s.category} numberOfLines={1}>{sub.category}</Text>}
                    <Text style={s.price}>
                      {fmt(sub.monthly_cost)}<Text style={s.unit}>/mes</Text>
                    </Text>
                    <Text style={s.yearly}>{fmt(sub.monthly_cost * 12)}/ano</Text>
                    <View style={statusStyle(sub.status)}>
                      <Text style={statusTextStyle(sub.status)}>{statusLabel(sub.status)}</Text>
                    </View>
                    <View style={s.cardActions}>
                      {sub.status !== 'CANCELLED' && (
                        <Pressable
                          onPress={(e) => { e.stopPropagation(); void toggle(sub.id); }}
                          style={s.actionBtn}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={sub.status === 'ACTIVE' ? `Pausar ${sub.service_name}` : `Reativar ${sub.service_name}`}
                        >
                          {sub.status === 'ACTIVE'
                            ? <Pause size={14} color={mutedColor} />
                            : <Play size={14} color={successColor} />}
                        </Pressable>
                      )}
                      <Pressable
                        onPress={(e) => { e.stopPropagation(); confirmDelete(sub); }}
                        style={[s.actionBtn, s.actionBtnDanger]}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${sub.service_name}`}
                      >
                        <Trash2 size={14} color={dangerColor} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
              <Text style={s.hint}>Toque no card para editar. Pause ou remova com os icones.</Text>
            </>
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar assinatura" />
      <SubscriptionForm visible={formOpen} onClose={onCloseForm} edit={editing} />
    </SafeAreaView>
  );
}
