import { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { DateInputField } from '../form/DateInputField';
import { SelectField } from '../form/SelectField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useBillsStore } from '../../stores/billsStore';
import type { Frequency } from '../../types';

const FREQ_OPTIONS = [
  { value: 'WEEKLY' as Frequency,   label: 'Semanal' },
  { value: 'MONTHLY' as Frequency,  label: 'Mensal' },
  { value: 'YEARLY' as Frequency,   label: 'Anual' },
];

const oneMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

export function BillForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useBillsStore((s) => s.add);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(oneMonth());
  const [isRecurrent, setIsRecurrent] = useState(0);
  const [frequency, setFrequency] = useState<Frequency | ''>('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle(''); setAmount(''); setDueDate(oneMonth());
    setIsRecurrent(0); setFrequency(''); setCategory(''); setNotes('');
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const a = parseFloat(amount);
    if (!title.trim()) return setError('Titulo obrigatorio');
    if (!amount || isNaN(a) || a <= 0) return setError('Valor invalido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setError('Data invalida');
    if (isRecurrent && !frequency) return setError('Escolha a frequencia');
    setSubmitting(true);
    try {
      await add({
        title: title.trim(),
        amount: a,
        due_date: dueDate,
        is_recurrent: isRecurrent,
        frequency: (isRecurrent ? frequency : null) as Frequency | null,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
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
    <FormModal visible={visible} title="Nova conta" onClose={onClose} error={error}>
      <FormField label="Titulo" required>
        <TextInputField value={title} onChangeText={setTitle} placeholder="Ex: Conta de luz" maxLength={80} />
      </FormField>
      <FormField label="Valor (R$)" required>
        <NumberInputField value={amount} onChangeText={setAmount} placeholder="0,00" />
      </FormField>
      <FormField label="Vencimento" required>
        <DateInputField value={dueDate} onChange={setDueDate} />
      </FormField>
      <FormField label="Recorrente?">
        <View style={s.toggleRow}>
          {([0, 1] as const).map((v) => (
            <Pressable
              key={v}
              onPress={() => setIsRecurrent(v)}
              style={[s.toggleBtn, isRecurrent === v && s.toggleBtnActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isRecurrent === v }}
            >
              <Text style={[s.toggleText, isRecurrent === v && s.toggleTextActive]}>
                {v === 1 ? 'Sim' : 'Nao'}
              </Text>
            </Pressable>
          ))}
        </View>
      </FormField>
      {isRecurrent === 1 && (
        <FormField label="Frequencia" required>
          <SelectField value={frequency} onChange={(v) => setFrequency(v)} options={FREQ_OPTIONS} />
        </FormField>
      )}
      <FormField label="Categoria" hint="Ex: Moradia, Transporte, Saude">
        <TextInputField value={category} onChangeText={setCategory} placeholder="Opcional" maxLength={50} />
      </FormField>
      <FormField label="Observacao">
        <TextInputField value={notes} onChangeText={setNotes} placeholder="Opcional" maxLength={200} multiline />
      </FormField>
      <Pressable onPress={onSubmit} disabled={submitting} style={[s.btn, submitting && s.btnDisabled]}>
        <Text style={s.btnText}>{submitting ? 'Salvando...' : 'Adicionar conta'}</Text>
      </Pressable>
    </FormModal>
  );
}

const s = StyleSheet.create({
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.button,
    backgroundColor: colors.surfaceHigh, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  toggleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { color: colors.text, fontWeight: typography.weight.semibold },
  toggleTextActive: { color: colors.textOnNeon },
  btn: {
    backgroundColor: colors.accent, paddingVertical: 14, borderRadius: radius.button,
    alignItems: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.textOnNeon, fontSize: typography.size.md, fontWeight: typography.weight.bold },
});
