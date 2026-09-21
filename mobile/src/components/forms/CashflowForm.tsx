import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { DateInputField } from '../form/DateInputField';
import { SelectField } from '../form/SelectField';
import { useStyles } from '../../lib/AppThemeProvider';
import { useCashflowStore } from '../../stores/cashflowStore';
import type { CashflowType } from '../../types';

const typeOptions = [
  { value: 'INCOME' as CashflowType,  label: 'Receita' },
  { value: 'EXPENSE' as CashflowType, label: 'Despesa' },
];

const today = () => new Date().toISOString().slice(0, 10);

export function CashflowForm({
  visible,
  onClose,
  defaultType = 'EXPENSE',
}: {
  visible: boolean;
  onClose: () => void;
  defaultType?: CashflowType;
}) {
  const add = useCashflowStore((s) => s.add);

  const s = useStyles((t) => ({
    btn: {
      backgroundColor: t.colors.accent, paddingVertical: 14, borderRadius: t.radius.button,
      alignItems: 'center' as const, marginTop: t.spacing.md,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: t.colors.textOnNeon, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
  }));

  const [type, setType] = useState<CashflowType>(defaultType);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setType(defaultType); setCategory(''); setAmount('');
    setDate(today()); setDescription('');
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const a = parseFloat(amount);
    if (!category.trim()) return setError('Categoria obrigatoria');
    if (!amount || isNaN(a) || a <= 0) return setError('Valor invalido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Data invalida');
    setSubmitting(true);
    try {
      await add({
        type,
        category: category.trim(),
        amount: a,
        transaction_date: date,
        description: description.trim() || undefined,
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
    <FormModal visible={visible} title="Novo Lancamento" onClose={onClose} error={error}>
      <FormField label="Tipo" required>
        <SelectField value={type} onChange={(v) => setType(v as CashflowType)} options={typeOptions} />
      </FormField>
      <FormField label="Categoria" required>
        <TextInputField value={category} onChangeText={setCategory} placeholder="Ex: Alimentacao" maxLength={50} />
      </FormField>
      <FormField label="Valor (R$)" required>
        <NumberInputField value={amount} onChangeText={setAmount} placeholder="0,00" />
      </FormField>
      <FormField label="Data" required>
        <DateInputField value={date} onChange={setDate} />
      </FormField>
      <FormField label="Descricao">
        <TextInputField value={description} onChangeText={setDescription} placeholder="Opcional" maxLength={100} />
      </FormField>
      <Pressable onPress={onSubmit} disabled={submitting} style={[s.btn, submitting && s.btnDisabled]}>
        <Text style={s.btnText}>{submitting ? 'Salvando...' : 'Adicionar'}</Text>
      </Pressable>
    </FormModal>
  );
}

