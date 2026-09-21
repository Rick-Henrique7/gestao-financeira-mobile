import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../../lib/AppThemeProvider';

// ─── FORM FIELD (label + children) ──────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, hint, children }: FormFieldProps) {
  const s = useStyles((t) => ({
    field: { gap: 6 },
    label: {
      color: t.colors.text,
      fontSize: t.typography.size.sm,
      fontWeight: t.typography.weight.semibold,
    },
    required: { color: t.colors.danger },
    hint: { color: t.colors.muted, fontSize: t.typography.size.xs },
  }));
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
