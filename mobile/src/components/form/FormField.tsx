import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../lib/theme';

// ─── FORM FIELD (label + children) ──────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <View style={s.field}>
      <Text style={s.label}>
        {label}
        {required ? <Text style={s.required}> *</Text> : null}
      </Text>
      {children}
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  required: { color: colors.danger },
  hint: { color: colors.muted, fontSize: typography.size.xs },
});
