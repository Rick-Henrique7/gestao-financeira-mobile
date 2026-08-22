import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface DateInputFieldProps {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  placeholder?: string;
  /** Label visivel (e tambem usado pelo screen reader via accessibilityLabel) */
  label?: string;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function DateInputField({
  value,
  onChange,
  invalid,
  placeholder = 'AAAA-MM-DD',
  label = 'Data',
}: DateInputFieldProps) {
  const [touched, setTouched] = useState(false);
  const isValidFormat = !value || ISO_RE.test(value);

  const format = (input: string): string => {
    const digits = input.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  };

  const showError = !isValidFormat && (touched || value.length > 0);

  return (
    <View
      style={[s.wrap, (invalid || showError) && s.invalid]}
      accessible
      accessibilityLabel={label}
      accessibilityHint="Formato AAAA-MM-DD"
    >
      <View style={s.inputRow}>
        <View style={{ flex: 1 }}>
          <TextInput
            value={value}
            onChange={(v) => { onChange(format(v.nativeEvent.text)); setTouched(true); }}
            placeholder={placeholder}
            style={s.input}
            keyboardType="number-pad"
            maxLength={10}
            placeholderTextColor={colors.muted}
            accessibilityLabel={`${label} (formato AAAA-MM-DD)`}
            accessibilityHint="Digite 8 digitos - a mascara adiciona os tracos automaticamente"
          />
        </View>
        <View style={s.icon}>
          <Calendar size={16} color={colors.muted} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.button,
  },
  invalid: { borderColor: colors.danger },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, paddingRight: 12 },
  input: {
    paddingVertical: 10, color: colors.text,
    fontSize: typography.size.md, fontFamily: typography.fontFamily.mono,
  },
  icon: { padding: 4 },
});
