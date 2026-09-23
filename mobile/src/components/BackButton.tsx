import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../lib/AppThemeProvider';

/**
 * BackButton — seta para voltar a tela anterior no Stack.
 * Usado como headerLeft em telas que foram abertas via router.push().
 *
 * Diferenca do DrawerMenu:
 * - DrawerMenu abre o menu lateral (não volta)
 * - BackButton chama router.back() (volta a tela anterior)
 *
 * A11y: announce "Voltar" para TalkBack.
 */
export function BackButton() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      accessibilityHint="Volta para a tela anterior"
    >
      <ChevronLeft size={26} color={colors.text} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

export default BackButton;
