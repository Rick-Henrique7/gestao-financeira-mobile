import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface TextInputFieldProps extends Omit<TextInputProps, 'style'> {
  invalid?: boolean;
}

export function TextInputField({ invalid, multiline, ...rest }: TextInputFieldProps) {
  return (
    <TextInput
      style={[s.input, multiline && s.multiline, invalid && s.invalid]}
      placeholderTextColor={colors.muted}
      multiline={multiline}
      {...rest}
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
  },
  multiline: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  invalid: { borderColor: colors.danger },
});
