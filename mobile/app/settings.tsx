import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, Download, LogOut, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../src/lib/theme';
import { ScreenTitle } from '../src/components/ScreenTitle';

const items = [
  { label: 'Conta',          sub: 'Rafael Souza · rafael@email.com', Icon: User },
  { label: 'Notificações',   sub: 'Alertas de vencimento',          Icon: Bell },
  { label: 'Segurança',      sub: 'Biometria, PIN',                  Icon: Shield },
  { label: 'Backup',         sub: 'Google Drive (em breve)',         Icon: Download },
  { label: 'Sair',           sub: 'Encerrar sessão',                 Icon: LogOut, danger: true },
] as const;

export default function SettingsScreen() {
  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Configurações" subtitle="Conta, segurança e backup" />
        {items.map(({ label, sub, Icon, danger }) => (
          <Pressable
            key={label}
            style={({ pressed }) => [s.row, danger && s.rowDanger, pressed && s.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={sub}
          >
            <View style={[s.iconWrap, danger && s.iconWrapDanger]}>
              <Icon size={18} color={danger ? colors.danger : colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.label, danger && { color: colors.danger }]}>
                {label}
              </Text>
              <Text style={s.sub}>{sub}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        ))}

        <Text style={s.version}>Gerenciador Financeiro v0.3.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 20, paddingBottom: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.card, borderWidth: 1, borderColor: colors.border,
  },
  rowDanger: { borderColor: 'rgba(248, 113, 113, 0.25)' },
  rowPressed: { backgroundColor: colors.surfaceHigh },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.button,
    backgroundColor: 'rgba(204, 240, 80, 0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  label: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  sub: { color: colors.muted, fontSize: typography.size.sm, marginTop: 2 },
  version: {
    color: colors.muted, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.xl, letterSpacing: 1,
  },
});
