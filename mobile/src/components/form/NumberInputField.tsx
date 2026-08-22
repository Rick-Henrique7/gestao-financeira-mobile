import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

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

const s = StyleSheet.create({
  input: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
    color: colors.text,
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.mono,
  },
  invalid: { borderColor: colors.danger },
});
