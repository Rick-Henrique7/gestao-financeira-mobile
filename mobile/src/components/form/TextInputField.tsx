import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';

interface TextInputFieldProps extends Omit<TextInputProps, 'style'> {
  invalid?: boolean;
}

export function TextInputField({ invalid, multiline, ...rest }: TextInputFieldProps) {
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
    },
    multiline: {
      minHeight: 90,
      paddingTop: 12,
      textAlignVertical: 'top' as const,
    },
    invalid: { borderColor: t.colors.danger },
  }));
  return (
    <TextInput
      style={[s.input, multiline && s.multiline, invalid && s.invalid]}
      placeholderTextColor={colors.muted}
      multiline={multiline}
      {...rest}
    />
  );
}
