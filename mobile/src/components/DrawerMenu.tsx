import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, X, CreditCard, Target, Calculator, Settings, FileDown } from 'lucide-react-native';
import { useTheme, useStyles } from '../lib/AppThemeProvider';
import { useReducedMotion, safeModalAnimation } from '../lib/motion';

const items = [
  { label: 'Empréstimos',      sub: 'Valores a receber',       Icon: CreditCard, route: '/loans' },
  { label: 'Metas & Cofrinhos', sub: 'Objetivos financeiros',   Icon: Target,     route: '/goals' },
  { label: 'Simulações',        sub: 'Calculadoras e juros',    Icon: Calculator, route: '/simulacoes' },
  { label: 'Exportar dados',    sub: 'CSV ou PDF',              Icon: FileDown,   route: '/export' },
  { label: 'Configurações',     sub: 'Conta, biometria, backup', Icon: Settings,  route: '/settings' },
] as const;

export function DrawerMenu() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const s = useStyles((t) => ({
    btn: { padding: 8, marginLeft: 4 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row' as const },
    sheet: {
      width: '85%' as const, maxWidth: 360, backgroundColor: t.colors.base,
      borderRightWidth: 1, borderRightColor: t.colors.border, paddingTop: 48,
    },
    header: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12,
      paddingHorizontal: 20, paddingBottom: 20,
      borderBottomWidth: 1, borderBottomColor: t.colors.border,
    },
    logoBox: {
      width: 40, height: 40, borderRadius: t.radius.button,
      backgroundColor: t.colors.accent, alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    logoText: { color: t.colors.base, fontWeight: t.typography.weight.bold, fontSize: t.typography.size.md },
    title: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold },
    subtitle: { color: t.colors.textMuted, fontSize: t.typography.size.xs + 1, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginTop: 2 },
    closeBtn: { padding: 8 },
    list: { padding: 12, gap: 4 },
    item: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12,
      backgroundColor: t.colors.surface,
      padding: 14, borderRadius: t.radius.display,
      borderWidth: 1, borderColor: t.colors.border,
    },
    iconWrap: {
      width: 36, height: 36, borderRadius: t.radius.button,
      backgroundColor: t.colors.accent,
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    itemLabel: { color: t.colors.text, fontSize: t.typography.size.md + 1, fontWeight: t.typography.weight.semibold },
    itemSub: { color: t.colors.textMuted, fontSize: t.typography.size.xs + 1, marginTop: 2 },
  }));

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={s.btn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
      >
        <Menu size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType={safeModalAnimation(reducedMotion)}
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={s.overlay} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.header}>
              <View style={s.logoBox}>
                <Text style={s.logoText}>FB</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>FinançasBR</Text>
                <Text style={s.subtitle}>Ferramentas</Text>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={s.closeBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.list}>
              {items.map(({ label, sub, Icon, route }) => (
                <TouchableOpacity
                  key={route}
                  style={s.item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setOpen(false);
                    setTimeout(() => router.push(route as any), 150);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint={sub}
                >
                  <View style={s.iconWrap}>
                    <Icon size={18} color={colors.textOnNeon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemLabel}>{label}</Text>
                    <Text style={s.itemSub}>{sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
