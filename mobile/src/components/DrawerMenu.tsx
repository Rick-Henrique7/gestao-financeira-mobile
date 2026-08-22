import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, X, CreditCard, Target, Calculator, Settings } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../lib/theme';

const items = [
  { label: 'Empréstimos',     sub: 'Valores a receber',    Icon: CreditCard, route: '/loans' },
  { label: 'Metas & Cofrinhos', sub: 'Objetivos financeiros', Icon: Target,    route: '/goals' },
  { label: 'Simulações',      sub: 'Calculadoras e juros',  Icon: Calculator, route: '/simulacoes' },
  { label: 'Configurações',   sub: 'Conta, biometria, backup', Icon: Settings, route: '/settings' },
] as const;

export function DrawerMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.btn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
      >
        <Menu size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>FB</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>FinançasBR</Text>
                <Text style={styles.subtitle}>Ferramentas</Text>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles.closeBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
              >
                <X size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              {items.map(({ label, sub, Icon, route }) => (
                <TouchableOpacity
                  key={route}
                  style={styles.item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setOpen(false);
                    setTimeout(() => router.push(route as any), 150);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint={sub}
                >
                  <View style={styles.iconWrap}>
                    <Icon size={18} color={colors.textOnNeon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>{label}</Text>
                    <Text style={styles.itemSub}>{sub}</Text>
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

const styles = StyleSheet.create({
  btn: { padding: 8, marginLeft: 4 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row' },
  sheet: {
    width: '85%', maxWidth: 360, backgroundColor: colors.base,
    borderRightWidth: 1, borderRightColor: colors.border, paddingTop: 48,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logoBox: {
    width: 40, height: 40, borderRadius: radius.button,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: colors.base, fontWeight: '700', fontSize: 14 },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  subtitle: { color: colors.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
  closeBtn: { padding: 8 },

  list: { padding: 12, gap: 4 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface,
    padding: 14, borderRadius: radius.display,
    borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.button,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  itemLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  itemSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
