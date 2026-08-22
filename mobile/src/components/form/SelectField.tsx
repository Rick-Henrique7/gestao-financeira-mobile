import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  value: T | '';
  onChange: (v: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  invalid?: boolean;
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  invalid,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[s.field, invalid && s.invalid]}
      >
        <Text style={[s.value, !current && s.placeholder]}>
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color={colors.muted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={s.overlay} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>
            <Text style={s.title}>{placeholder}</Text>
            <ScrollView contentContainerStyle={s.list}>
              {options.map((opt) => {
                const selected = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => { onChange(opt.value); setOpen(false); }}
                    style={[s.item, selected && s.itemSelected]}
                  >
                    <Text style={[s.itemLabel, selected && s.itemLabelSelected]}>
                      {opt.label}
                    </Text>
                    {selected ? <Text style={s.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.button, paddingHorizontal: spacing.md, paddingVertical: 14, minHeight: 52,
  },
  invalid: { borderColor: colors.danger },
  value: { color: colors.text, fontSize: typography.size.lg },
  placeholder: { color: colors.muted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.base, borderTopLeftRadius: radius.display,
    borderTopRightRadius: radius.display, maxHeight: '70%',
  },
  handleWrap: { alignItems: 'center', paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted },
  title: {
    color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  list: { padding: spacing.sm, paddingBottom: spacing.xxl },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderRadius: radius.button, backgroundColor: colors.surface,
    marginBottom: 4,
  },
  itemSelected: { backgroundColor: 'rgba(204, 240, 80, 0.12)' },
  itemLabel: { color: colors.text, fontSize: typography.size.md },
  itemLabelSelected: { color: colors.textOnNeon, fontWeight: typography.weight.semibold },
  check: { color: colors.textOnNeon, fontSize: typography.size.lg, fontWeight: typography.weight.bold },
});
