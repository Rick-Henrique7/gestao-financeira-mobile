import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useStyles, useTheme } from '../lib/AppThemeProvider';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * OnboardingModal — aparece na primeira entrada do usuario no app
 * (quando settings.display_name ainda e o default 'Convidado').
 *
 * Bloqueante: ate o usuario salvar o nome, o modal fica aberto
 * e impede qualquer interacao com o app (overlay + nao-dismissavel
 * no tap fora).
 *
 * Validacao: nome obrigatorio, max 80 chars.
 */
export function OnboardingModal() {
  const { colors } = useTheme();
  const { settings, refresh, update } = useSettingsStore();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Garante que settings foi carregado antes de decidir se mostra
  useEffect(() => {
    if (!settings) refresh();
  }, [settings, refresh]);

  const isDefault = !settings?.display_name || settings.display_name.trim() === 'Convidado';
  const visible = !!settings && isDefault;

  const s = useStyles((t) => ({
    overlay: {
      position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
      justifyContent: 'center' as const, alignItems: 'center' as const,
    },
    card: {
      width: '88%' as const, maxWidth: 420,
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.display,
      borderWidth: 1, borderColor: t.colors.border,
      padding: t.spacing.xl,
      gap: t.spacing.md,
    },
    iconBox: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: t.colors.surfaceDark1,
      borderWidth: 1.5, borderStyle: 'dashed' as const,
      borderColor: t.colors.accent + '55',
      alignItems: 'center' as const, justifyContent: 'center' as const,
      alignSelf: 'center' as const, marginBottom: t.spacing.xs,
    },
    title: {
      color: t.colors.text, fontSize: t.typography.size.xl,
      fontWeight: t.typography.weight.bold, textAlign: 'center' as const,
    },
    sub: {
      color: t.colors.textMuted, fontSize: t.typography.size.sm,
      textAlign: 'center' as const, lineHeight: 20,
    },
    input: {
      backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1, borderColor: t.colors.border,
      borderRadius: t.radius.button,
      paddingHorizontal: t.spacing.md, paddingVertical: 14,
      minHeight: 52,
      color: t.colors.text, fontSize: t.typography.size.lg,
    },
    inputInvalid: { borderColor: t.colors.danger },
    inputHint: { color: t.colors.textMuted, fontSize: t.typography.size.xs },
    errorBox: {
      backgroundColor: 'rgba(248, 113, 113, 0.12)',
      borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)',
      borderRadius: t.radius.button, padding: t.spacing.sm,
    },
    errorText: { color: t.colors.danger, fontSize: t.typography.size.sm },
    btn: {
      backgroundColor: t.colors.accent,
      paddingVertical: 14, borderRadius: t.radius.button,
      alignItems: 'center' as const,
      marginTop: t.spacing.xs,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: t.colors.textOnNeon, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
  }));

  const onSubmit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor, digite seu nome.');
      return;
    }
    if (trimmed.length > 80) {
      setError('Nome muito longo (maximo 80 caracteres).');
      return;
    }
    setSubmitting(true);
    try {
      await update({ display_name: trimmed });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={s.overlay} pointerEvents="auto">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <View style={s.iconBox}>
              <Text style={{ fontSize: 28 }}>👋</Text>
            </View>
            <Text style={s.title}>Bem-vindo!</Text>
            <Text style={s.sub}>
              Como podemos te chamar? Esse nome aparecera no cabecalho e nos
              relatorios.
            </Text>

            <TextInput
              style={[s.input, error && s.inputInvalid]}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error) setError(null);
              }}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
              maxLength={80}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              accessibilityLabel="Digite seu nome"
              accessibilityHint="Obrigatorio, maximo 80 caracteres"
            />

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              style={[s.btn, submitting && s.btnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Confirmar nome"
            >
              <Text style={s.btnText}>
                {submitting ? 'Salvando...' : 'Comecar'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
