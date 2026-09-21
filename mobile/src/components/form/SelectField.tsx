import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';
import { useReducedMotion, safeModalAnimation } from '../../lib/motion';

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
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const current = options.find((o) => o.value === value);

  const s = useStyles((t) => ({
    field: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radius.button,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 14,
      minHeight: 52,
    },
    invalid: { borderColor: t.colors.danger },
    value: { color: t.colors.text, fontSize: t.typography.size.lg },
    placeholder: { color: t.colors.muted },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' as const },
    sheet: {
      backgroundColor: t.colors.base,
      borderTopLeftRadius: t.radius.display,
      borderTopRightRadius: t.radius.display,
      maxHeight: '70%',
    },
    handleWrap: { alignItems: 'center' as const, paddingTop: 8 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.muted },
    title: {
      color: t.colors.text,
      fontSize: t.typography.size.lg,
      fontWeight: t.typography.weight.semibold,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
    },
    list: { padding: t.spacing.sm, paddingBottom: t.spacing.xxl },
    item: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.md,
      borderRadius: t.radius.button,
      backgroundColor: t.colors.surface,
      marginBottom: 4,
    },
    itemSelected: { backgroundColor: 'rgba(204, 240, 80, 0.12)' },
    itemLabel: { color: t.colors.text, fontSize: t.typography.size.md },
    itemLabelSelected: { color: t.colors.textOnNeon, fontWeight: t.typography.weight.semibold },
  }));

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
        animationType={reducedMotion ? 'none' : 'fade'}
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
                    {selected ? <Check size={18} color={colors.textOnNeon} /> : null}
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
