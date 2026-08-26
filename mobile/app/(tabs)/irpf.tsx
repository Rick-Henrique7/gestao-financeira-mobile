import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, AlertCircle } from 'lucide-react-native';
import { useTheme, useStyles } from '../../src/lib/AppThemeProvider';
import { useIRPFStore } from '../../src/stores/irpfStore';
import { fmt } from '../../src/lib/format';
import { FAB } from '../../src/components/form/FAB';
import { IRPFForm } from '../../src/components/forms/IRPFForm';
import { ScreenTitle } from '../../src/components/ScreenTitle';

export default function IRPFTabScreen() {
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.base },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 100, gap: t.spacing.md },
    display: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
    },
    title: { color: t.colors.text, fontSize: t.typography.size.xl, fontWeight: t.typography.weight.semibold },
    sub: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: 4 },
    progressBar: { height: 6, backgroundColor: t.colors.surfaceHigh, borderRadius: 3, marginTop: t.spacing.md, overflow: 'hidden' as const },
    progressFill: { height: '100%' as const, backgroundColor: t.colors.accent, borderRadius: 3 },
    metaText: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: t.spacing.sm },
    tabs: { gap: t.spacing.sm, paddingVertical: t.spacing.xs },
    tab: {
      color: t.colors.textMuted, fontSize: t.typography.size.md, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.pill, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
      overflow: 'hidden' as const,
    },
    tabActive: { color: t.colors.base, backgroundColor: t.colors.accent, borderColor: t.colors.accent, fontWeight: t.typography.weight.semibold },
    row: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
      backgroundColor: t.colors.surface, padding: t.spacing.md,
      borderRadius: t.radius.display, borderWidth: 1, borderColor: t.colors.border,
    },
    statusIcon: { width: 32, height: 32, borderRadius: t.radius.button, alignItems: 'center' as const, justifyContent: 'center' as const },
    statusIconDone: { backgroundColor: t.colors.accent },
    statusIconPending: { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
    rowTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.medium },
    rowMeta: { color: t.colors.textMuted, fontSize: t.typography.size.sm, marginTop: 2, fontFamily: t.typography.fontFamily.mono },
    pill: { paddingHorizontal: t.spacing.sm, paddingVertical: 4, borderRadius: t.radius.pill },
    pillDone: { backgroundColor: t.colors.accent },
    pillPending: { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
    pillText: { fontSize: t.typography.size.xs, fontWeight: t.typography.weight.semibold },
    pillTextDone: { color: t.colors.textOnNeon },
    pillTextPending: { color: '#FBBF24' },
    empty: { color: t.colors.textMuted, fontSize: t.typography.size.md, textAlign: 'center' as const, paddingVertical: t.spacing.lg },
    loading: { marginTop: t.spacing.xl },
  }));

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
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="IRPF 2026" subtitle="Comprovantes e categorias" />
        <View style={s.display}>
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
          <ActivityIndicator color={colors.accent} style={s.loading} />
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
                <View style={[s.statusIcon, isAtt ? s.statusIconDone : s.statusIconPending]}>
                  {isAtt ? (
                    <Check size={18} color={colors.textOnNeon} strokeWidth={3} />
                  ) : (
                    <AlertCircle size={18} color="#FBBF24" strokeWidth={3} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{r.title}</Text>
                  <Text style={s.rowMeta}>
                    {fmt(r.gross_value)}{r.ticker ? ` · ${r.ticker}` : ''}
                  </Text>
                </View>
                <View style={[s.pill, isAtt ? s.pillDone : s.pillPending]}>
                  <Text style={[s.pillText, isAtt ? s.pillTextDone : s.pillTextPending]}>
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
