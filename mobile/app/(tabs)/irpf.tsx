import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIRPFStore } from '../../src/stores/irpfStore';
import { fmt } from '../../src/lib/format';
import { colors, radius, spacing, typography } from '../../src/lib/theme';
import { FAB } from '../../src/components/form/FAB';
import { IRPFForm } from '../../src/components/forms/IRPFForm';

export default function IRPFTabScreen() {
  const { records, categories, loading, refresh, refreshCategories } = useIRPFStore();
  const [activeTab, setActiveTab] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    refresh();
    refreshCategories();
  }, [refresh, refreshCategories]);

  useEffect(() => {
    if (!activeTab && categories.length > 0) setActiveTab(categories[0].name);
  }, [activeTab, categories]);

  const activeRecords = records.filter((r) => {
    const cat = categories.find((c) => c.id === r.category_id);
    return cat?.name === activeTab;
  });

  const done = records.filter((r) => r.status === 'ATTACHED').length;
  const total = records.length;
  const progressPct = total > 0 ? (done / total) * 100 : 0;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.display}>
          <Text style={s.title}>IRPF 2026</Text>
          <Text style={s.sub}>{done} de {total} comprovantes anexados</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={s.metaText}>
            {progressPct.toFixed(0)}% concluido · Prazo: 30/04/2027
          </Text>
        </View>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
            {categories.map((c) => {
              const isActive = activeTab === c.name;
              return (
                <Text
                  key={c.id}
                  onPress={() => setActiveTab(c.name)}
                  style={[s.tab, isActive && s.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  {c.name}
                </Text>
              );
            })}
          </ScrollView>
        )}

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : activeRecords.length === 0 ? (
          <View style={s.display}>
            <Text style={s.empty}>
              Nenhum registro em "{activeTab || 'esta categoria'}". Toque + para adicionar.
            </Text>
          </View>
        ) : (
          activeRecords.map((r) => {
            const isAtt = r.status === 'ATTACHED';
            return (
              <View key={r.id} style={s.row}>
                <View style={[s.statusIcon, { backgroundColor: isAtt ? colors.accent : 'rgba(251, 191, 36, 0.15)' }]}>
                  <Text style={{ color: isAtt ? colors.textOnNeon : '#FBBF24', fontWeight: typography.weight.bold }}>
                    {isAtt ? '✓' : '!'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{r.title}</Text>
                  <Text style={s.rowMeta}>
                    {fmt(r.gross_value)}{r.ticker ? ` · ${r.ticker}` : ''}
                  </Text>
                </View>
                <View style={[s.pill, { backgroundColor: isAtt ? colors.accent : 'rgba(251, 191, 36, 0.15)' }]}>
                  <Text style={[s.pillText, { color: isAtt ? colors.textOnNeon : '#FBBF24' }]}>
                    {isAtt ? 'Anexado' : 'Pendente'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <FAB onPress={() => setFormOpen(true)} accessibilityLabel="Adicionar registro IRPF" />
      <IRPFForm visible={formOpen} onClose={() => setFormOpen(false)} />
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
  title: { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.semibold },
  sub: { color: colors.muted, fontSize: typography.size.sm, marginTop: 4 },
  progressBar: { height: 6, backgroundColor: colors.surfaceHigh, borderRadius: 3, marginTop: spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  metaText: { color: colors.muted, fontSize: typography.size.xs, marginTop: spacing.sm },
  tabs: { gap: spacing.sm, paddingVertical: spacing.xs },
  tab: {
    color: colors.muted, fontSize: typography.size.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  tabActive: { color: colors.base, backgroundColor: colors.accent, borderColor: colors.accent, fontWeight: typography.weight.semibold },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.display, borderWidth: 1, borderColor: colors.border,
  },
  statusIcon: { width: 32, height: 32, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.medium },
  rowMeta: { color: colors.muted, fontSize: typography.size.sm, marginTop: 2, fontFamily: typography.fontFamily.mono },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  empty: { color: colors.muted, fontSize: typography.size.md, textAlign: 'center', paddingVertical: spacing.lg },
});
