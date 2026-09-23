import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Bell, Shield, Download, Info, ChevronRight, RotateCcw,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { colors, radius, spacing, typography } from '../src/lib/theme';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useBillsStore } from '../src/stores/billsStore';
import { useSubsStore } from '../src/stores/subscriptionsStore';
import { useGoalsStore } from '../src/stores/goalsStore';
import { useLoansStore } from '../src/stores/loansStore';
import { useIRPFStore } from '../src/stores/irpfStore';
import { useCashflowStore } from '../src/stores/cashflowStore';
import { ScreenTitle } from '../src/components/ScreenTitle';
import { EditAccountModal } from '../src/components/EditAccountModal';

interface SettingsEntry {
  key: string;
  label: string;
  sub: string;
  Icon: React.ComponentType<any>;
  /** Right side: 'chevron' | 'switch' | 'chips' */
  right?: 'chevron' | 'switch' | 'chips';
  switchValue?: boolean;
  chips?: Array<{ label: string; value: number; active: boolean }>;
  chipsLabel?: string;
  onPress?: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const { settings, refresh, update, toggleHideValues } = useSettingsStore();
  const { bills } = useBillsStore();
  const { subs } = useSubsStore();
  const { goals } = useGoalsStore();
  const { loans } = useLoansStore();
  const { records: irpfRecords } = useIRPFStore();
  const { transactions } = useCashflowStore();

  const [editOpen, setEditOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hide = settings?.hide_values === 1;
  // Versao lida do package.json (resolve em build time)
  let appVersion = '1.0.0';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    appVersion = pkg.version ?? '1.0.0';
  } catch {}
  const notifyDue = settings?.notify_due_soon === 1;
  const notifyGoal = settings?.notify_goal_milestone === 1;
  const notifyBudget = settings?.notify_budget_exceeded === 1;
  const alertDays = settings?.alert_days_before ?? 3;
  const displayName = settings?.display_name ?? 'Convidado';
  const email = settings?.email ?? '';

  // ─── Backup: exporta tudo como JSON ──────────────────────────────────────
  const exportBackup = async () => {
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        bills,
        subscriptions: subs,
        goals,
        loans,
        irpfRecords,
        cashflowTransactions: transactions,
      };
      const json = JSON.stringify(backup, null, 2);
      const filename = `sgf-backup-${Date.now()}.json`;
      const uri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, json, { encoding: 'utf8' });
      await Share.share({
        url: uri,
        title: 'Backup Sistema Gerenciador Financeiro',
        message: 'Backup dos dados do Sistema Gerenciador Financeiro',
      });
    } catch (err) {
      Alert.alert('Erro ao exportar backup', String(err));
    }
  };

  // ─── Sections ────────────────────────────────────────────────────────────
  const sectionConta: SettingsEntry[] = [
    {
      key: 'conta',
      label: 'Conta',
      sub: email ? `${displayName} · ${email}` : displayName,
      Icon: User,
      right: 'chevron',
      onPress: () => setEditOpen(true),
    },
  ];

  const sectionPrivacidade: SettingsEntry[] = [
    {
      key: 'hide',
      label: 'Esconder valores',
      sub: 'Ocultar valores em todas as telas (privacidade)',
      Icon: Shield,
      right: 'switch',
      switchValue: hide,
      onPress: () => { void toggleHideValues(); },
    },
  ];

  const alertDaysOptions = [3, 7, 12, 15, 30];

  const sectionNotif: SettingsEntry[] = [
    {
      key: 'n-due',
      label: 'Contas a vencer',
      sub: `Avisar quando faltar ate ${alertDays} ${alertDays === 1 ? 'dia' : 'dias'} para o vencimento`,
      Icon: Bell,
      right: 'switch',
      switchValue: notifyDue,
      onPress: () => { void update({ notify_due_soon: notifyDue ? 0 : 1 }); },
    },
    {
      key: 'n-due-days',
      label: 'Periodo de alerta',
      sub: notifyDue
        ? 'Quantos dias antes do vencimento a conta aparece em Notificacoes'
        : 'Ative "Contas a vencer" para usar',
      Icon: Bell,
      right: 'chips',
      chips: alertDaysOptions.map((d) => ({
        label: `${d}d`,
        value: d,
        active: alertDays === d,
      })),
      chipsLabel: 'dias',
      onPress: () => {}, // chips individuais tem seus proprios handlers
    },
    {
      key: 'n-goal',
      label: 'Marcos de meta',
      sub: 'Notificar ao atingir 25%, 50%, 75% e 100% do cofrinho',
      Icon: Bell,
      right: 'switch',
      switchValue: notifyGoal,
      onPress: () => { void update({ notify_goal_milestone: notifyGoal ? 0 : 1 }); },
    },
    {
      key: 'n-budget',
      label: 'Orcamento estourado',
      sub: 'Avisar quando as despesas do mes ultrapassarem a renda',
      Icon: Bell,
      right: 'switch',
      switchValue: notifyBudget,
      onPress: () => { void update({ notify_budget_exceeded: notifyBudget ? 0 : 1 }); },
    },
  ];

  const sectionDados: SettingsEntry[] = [
    {
      key: 'backup',
      label: 'Backup completo',
      sub: 'Exportar todos os dados em JSON (compartilhar/salvar)',
      Icon: Download,
      right: 'chevron',
      onPress: exportBackup,
    },
    {
      key: 'onboarding-reset',
      label: 'Reativar onboarding',
      sub: 'Limpar nome salvo e mostrar a tela de boas-vindas novamente',
      Icon: RotateCcw,
      right: 'chevron',
      onPress: () => {
        Alert.alert(
          'Reativar onboarding?',
          'Seu nome sera limpo e a tela de boas-vindas aparecera no proximo acesso.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reativar',
              style: 'destructive',
              onPress: async () => {
                try {
                  await update({ display_name: 'Convidado' });
                  Alert.alert(
                    'Pronto!',
                    'Feche e abra o app para ver a tela de boas-vindas novamente.',
                  );
                } catch (e) {
                  Alert.alert('Erro', String(e));
                }
              },
            },
          ],
          { cancelable: true },
        );
      },
    },
    {
      key: 'sobre',
      label: 'Sobre o app',
      sub: 'Versao, build, links uteis',
      Icon: Info,
      right: 'chevron',
      onPress: () => setAboutOpen(true),
    },
  ];

  const renderSection = (title: string, entries: SettingsEntry[]) => (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        const { Icon } = entry;
        const isChips = entry.right === 'chips';
        return (
          <Pressable
            key={entry.key}
            onPress={entry.right === 'switch' ? entry.onPress : (entry.onPress ?? (() => {}))}
            disabled={isChips}
            style={({ pressed }) => [
              s.row,
              !isLast && s.rowBorder,
              pressed && s.rowPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={entry.label}
            accessibilityHint={entry.sub}
            accessibilityState={entry.right === 'switch' ? { checked: !!entry.switchValue } : undefined}
          >
            <View style={s.iconWrap}>
              <Icon size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{entry.label}</Text>
              <Text style={s.sub}>{entry.sub}</Text>
              {isChips && entry.chips ? (
                <View style={chipS.row}>
                  {entry.chips.map((c) => (
                    <Pressable
                      key={c.value}
                      onPress={() => { void update({ alert_days_before: c.value }); }}
                      style={[chipS.chip, c.active && chipS.chipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: c.active }}
                      accessibilityLabel={`Alertar ${c.label} antes`}
                    >
                      <Text style={[chipS.chipText, c.active && chipS.chipTextActive]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
            {entry.right === 'switch' ? (
              <Switch
                value={entry.switchValue}
                onValueChange={entry.onPress}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={entry.switchValue ? colors.textOnNeon : colors.muted}
                accessibilityLabel={`Toggle ${entry.label}`}
              />
            ) : !isChips ? (
              <ChevronRight size={18} color={colors.muted} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Configuracoes" subtitle="Conta, privacidade e dados" />
        {renderSection('Conta', sectionConta)}
        {renderSection('Privacidade', sectionPrivacidade)}
        {renderSection('Notificacoes', sectionNotif)}
        {renderSection('Dados', sectionDados)}

        <Text style={s.version}>Gerenciador Financeiro Mobile</Text>
        <Text style={s.versionSub}>v{appVersion} · Offline-first · React Native + Expo</Text>
      </ScrollView>

      <EditAccountModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        currentName={displayName}
        currentEmail={email}
      />

      <AboutModal visible={aboutOpen} onClose={() => setAboutOpen(false)} />
    </SafeAreaView>
  );
}

// ─── AboutModal ──────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  // Versao lida do package.json (import estatico resolve em build time)
  let version = '1.0.0';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    version = pkg.version ?? '1.0.0';
  } catch {}
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: visible ? 'auto' : 'none' }]}>
      {visible && (
        <Pressable style={aboutS.overlay} onPress={onClose}>
          <Pressable style={aboutS.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={aboutS.handle} />
            <Text style={aboutS.title}>Sobre o app</Text>
            <Text style={aboutS.line}>Versao: v{version}</Text>
            <Text style={aboutS.line}>Plataforma: React Native + Expo SDK 55</Text>
            <Text style={aboutS.line}>Banco de dados: SQLite (local)</Text>
            <Text style={aboutS.line}>Licenca: Apache 2.0</Text>
            <Text style={aboutS.line}>Autor: Henrique Moraes dos Santos</Text>
            <Text style={aboutS.line}>GitHub: github.com/Rick-Henrique7</Text>
            <Text style={aboutS.note}>
              App 100% offline. Nenhum dado sai do seu celular sem sua acao explicita
              (exportacao de CSV/PDF ou backup JSON).
            </Text>
            <Pressable style={aboutS.btn} onPress={onClose}>
              <Text style={aboutS.btnText}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingTop: 8, paddingBottom: spacing.xxl, gap: spacing.md },
  section: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  sectionTitle: {
    color: colors.muted, fontSize: typography.size.xs,
    textTransform: 'uppercase', letterSpacing: 1.5,
    fontWeight: typography.weight.semibold,
    paddingHorizontal: spacing.xs, marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.button,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  rowPressed: { backgroundColor: colors.surfaceHigh },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.button,
    backgroundColor: 'rgba(204, 240, 80, 0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  sub: { color: colors.muted, fontSize: typography.size.xs, marginTop: 2 },
  version: {
    color: colors.muted, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.xl, letterSpacing: 1,
  },
  versionSub: {
    color: colors.muted, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: 4, opacity: 0.7,
  },
});

const chipS = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  chipTextActive: {
    color: colors.textOnNeon,
  },
});

const aboutS = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, width: '100%', maxWidth: 400, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.muted, alignSelf: 'center', marginBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.sm },
  line: { color: colors.text, fontSize: typography.size.sm, fontFamily: typography.fontFamily.mono },
  note: { color: colors.muted, fontSize: typography.size.sm, marginTop: spacing.md, lineHeight: 20 },
  btn: {
    backgroundColor: colors.accent, paddingVertical: 14,
    borderRadius: radius.button, alignItems: 'center', marginTop: spacing.md,
  },
  btnText: { color: colors.textOnNeon, fontWeight: typography.weight.bold, fontSize: typography.size.md },
});
