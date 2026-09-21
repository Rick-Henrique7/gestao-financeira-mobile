import { useState } from 'react';
import { Pressable, Text, View, ScrollView } from 'react-native';
import {
  Target, Plane, Car, Home, GraduationCap, Heart, Gift,
  Smartphone, ShoppingBag, Briefcase, Wallet, PiggyBank,
} from 'lucide-react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { DateInputField } from '../form/DateInputField';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';
import { useGoalsStore } from '../../stores/goalsStore';

const COLOR_CHOICES = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444',
  '#06B6D4', '#A78BFA', '#FB923C', '#FFF500',
];

const ICON_CHOICES = [
  { key: 'default',      label: 'Padrao',     Icon: PiggyBank },
  { key: 'Target',       label: 'Reserva',    Icon: Target },
  { key: 'Plane',        label: 'Viagem',     Icon: Plane },
  { key: 'Car',          label: 'Carro',      Icon: Car },
  { key: 'Home',         label: 'Casa',       Icon: Home },
  { key: 'GraduationCap',label: 'Estudo',     Icon: GraduationCap },
  { key: 'Heart',        label: 'Saude',      Icon: Heart },
  { key: 'Gift',         label: 'Presente',   Icon: Gift },
  { key: 'Smartphone',   label: 'Eletronico', Icon: Smartphone },
  { key: 'ShoppingBag',  label: 'Compras',    Icon: ShoppingBag },
  { key: 'Briefcase',    label: 'Trabalho',   Icon: Briefcase },
  { key: 'Wallet',       label: 'Geral',      Icon: Wallet },
] as const;

const oneYearFromNow = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export function GoalForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useGoalsStore((s) => s.add);
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    iconRow: { flexDirection: 'row' as const, gap: t.spacing.sm, paddingVertical: t.spacing.xs },
    iconChip: {
      width: 44, height: 44, borderRadius: t.radius.button,
      backgroundColor: t.colors.surfaceHigh, alignItems: 'center' as const, justifyContent: 'center' as const,
      borderWidth: 2, borderColor: t.colors.border,
    },
    iconChipActive: { borderColor: t.colors.accent },
    colorRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 10, paddingVertical: 6 },
    colorChip: {
      width: 36, height: 36, borderRadius: 18,
      borderWidth: 3, borderColor: 'transparent',
    },
    colorChipActive: { borderColor: t.colors.text },
    colorDot: {
      width: 36, height: 36, borderRadius: 18,
      borderWidth: 2, borderColor: 'transparent',
    },
    colorDotSelected: { borderColor: t.colors.text },
    iconScroll: { marginHorizontal: -t.spacing.lg, paddingHorizontal: t.spacing.lg },
    iconItem: {
      alignItems: 'center' as const, justifyContent: 'center' as const,
      paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.button, backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1, borderColor: t.colors.border,
      marginRight: t.spacing.sm, minWidth: 70,
    },
    iconItemSelected: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    iconLabel: { color: t.colors.text, fontSize: t.typography.size.xs, marginTop: 4 },
    iconLabelSelected: { color: t.colors.base, fontWeight: t.typography.weight.semibold },
    btn: {
      backgroundColor: t.colors.accent, paddingVertical: 14, borderRadius: t.radius.button,
      alignItems: 'center' as const, marginTop: t.spacing.md,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: t.colors.textOnNeon, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
  }));

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [targetDate, setTargetDate] = useState(oneYearFromNow());
  const [colorHex, setColorHex] = useState('#3B82F6');
  const [categoryIcon, setCategoryIcon] = useState<string>('default');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle(''); setTarget(''); setCurrent('0');
    setTargetDate(oneYearFromNow());
    setColorHex('#3B82F6');
    setCategoryIcon('default');
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const t = parseFloat(target);
    const c = parseFloat(current);
    if (!title.trim()) return setError('Titulo obrigatorio');
    if (!target || isNaN(t) || t <= 0) return setError('Valor alvo invalido');
    if (isNaN(c) || c < 0) return setError('Valor atual invalido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return setError('Data invalida');
    setSubmitting(true);
    try {
      await add({
        title: title.trim(),
        target_amount: t,
        current_amount: c,
        target_date: targetDate,
        color_hex: colorHex,
        category_icon: categoryIcon,
      });
      reset();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal visible={visible} title="Novo Cofrinho" onClose={onClose} error={error}>
      <FormField label="Nome do cofrinho" required>
        <TextInputField
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Reserva de emergencia"
          maxLength={100}
        />
      </FormField>

      <FormField label="Valor alvo (R$)" required>
        <NumberInputField value={target} onChangeText={setTarget} placeholder="10000,00" />
      </FormField>

      <FormField label="Valor inicial (R$)" hint="Opcional. Quanto ja tem guardado.">
        <NumberInputField value={current} onChangeText={setCurrent} placeholder="0,00" />
      </FormField>

      <FormField label="Data alvo" required hint="Prazo final para atingir a meta">
        <DateInputField value={targetDate} onChange={setTargetDate} />
      </FormField>

      <FormField label="Cor do card">
        <View style={s.colorRow}>
          {COLOR_CHOICES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColorHex(c)}
              style={[
                s.colorDot,
                { backgroundColor: c },
                colorHex === c && s.colorDotSelected,
              ]}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Icone">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.iconScroll}>
          {ICON_CHOICES.map(({ key, label, Icon }) => {
            const selected = categoryIcon === key;
            return (
              <Pressable
                key={key}
                onPress={() => setCategoryIcon(key)}
                style={[s.iconItem, selected && s.iconItemSelected]}
              >
                <Icon size={20} color={selected ? colors.base : colors.text} />
                <Text style={[s.iconLabel, selected && s.iconLabelSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </FormField>

      <Pressable onPress={onSubmit} disabled={submitting} style={[s.btn, submitting && s.btnDisabled]}>
        <Text style={s.btnText}>{submitting ? 'Salvando...' : 'Criar cofrinho'}</Text>
      </Pressable>
    </FormModal>
  );
}

