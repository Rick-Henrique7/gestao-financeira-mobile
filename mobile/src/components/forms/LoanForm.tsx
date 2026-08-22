import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { DateInputField } from '../form/DateInputField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useLoansStore } from '../../stores/loansStore';

const today = () => new Date().toISOString().slice(0, 10);
const oneMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

export function LoanForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useLoansStore((s) => s.add);
  const [debtor, setDebtor] = useState('');
  const [amount, setAmount] = useState('');
  const [loanDate, setLoanDate] = useState(today());
  const [dueDate, setDueDate] = useState(oneMonth());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDebtor(''); setAmount(''); setLoanDate(today()); setDueDate(oneMonth());
    setNotes(''); setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const a = parseFloat(amount);
    if (!debtor.trim()) return setError('Nome do devedor obrigatorio');
    if (!amount || isNaN(a) || a <= 0) return setError('Valor invalido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(loanDate)) return setError('Data de emprestimo invalida');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setError('Data de vencimento invalida');
    setSubmitting(true);
    try {
      await add({
        debtor_name: debtor.trim(),
        amount: a,
        loan_date: loanDate,
        due_date: dueDate,
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
    <FormModal visible={visible} title="Novo emprestimo" onClose={onClose} error={error}>
      <FormField label="Nome do devedor" required>
        <TextInputField value={debtor} onChangeText={setDebtor} placeholder="Ex: Joao" maxLength={80} />
      </FormField>
      <FormField label="Valor (R$)" required>
        <NumberInputField value={amount} onChangeText={setAmount} placeholder="0,00" />
      </FormField>
      <FormField label="Data do emprestimo" required>
        <DateInputField value={loanDate} onChange={setLoanDate} />
      </FormField>
      <FormField label="Vencimento" required>
        <DateInputField value={dueDate} onChange={setDueDate} />
      </FormField>
      <FormField label="Observacao">
        <TextInputField value={notes} onChangeText={setNotes} placeholder="Opcional" maxLength={200} multiline />
      </FormField>
      <Pressable onPress={onSubmit} disabled={submitting} style={[s.btn, submitting && s.btnDisabled]}>
        <Text style={s.btnText}>{submitting ? 'Salvando...' : 'Adicionar'}</Text>
      </Pressable>
    </FormModal>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: colors.accent, paddingVertical: 14, borderRadius: radius.button,
    alignItems: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.textOnNeon, fontSize: typography.size.md, fontWeight: typography.weight.bold },
});
