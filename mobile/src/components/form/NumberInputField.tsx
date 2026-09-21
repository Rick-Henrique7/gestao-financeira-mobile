import React from 'react';
import { TextInput } from 'react-native';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';

interface NumberInputFieldProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  allowDecimals?: boolean;
}

export function NumberInputField({
  value,
  onChangeText,
  placeholder,
  invalid,
  allowDecimals = true,
}: NumberInputFieldProps) {
  const { colors } = useTheme();
  const s = useStyles((t) => ({
    input: {
      backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radius.button,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 14,
      minHeight: 52,
      color: t.colors.text,
      fontSize: t.typography.size.lg,
      fontFamily: t.typography.fontFamily.mono,
    },
    invalid: { borderColor: t.colors.danger },
  }));
  return (
    <TextInput
      style={[s.input, invalid && s.invalid]}
      value={value}
      onChangeText={(v) => {
        const clean = allowDecimals
          ? v.replace(/[^0-9.,]/g, '').replace(',', '.')
          : v.replace(/[^0-9]/g, '');
        onChangeText(clean);
      }}
      keyboardType="decimal-pad"
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
    />
  );
}
