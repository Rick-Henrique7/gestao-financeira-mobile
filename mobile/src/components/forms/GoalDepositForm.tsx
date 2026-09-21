import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { NumberInputField } from '../form/NumberInputField';
import { DateInputField } from '../form/DateInputField';
import { TextInputField } from '../form/TextInputField';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';
import { useGoalsStore } from '../../stores/goalsStore';
import { fmt } from '../../lib/format';
import type { GoalDepositType, FinancialGoal } from '../../types';

interface GoalDepositFormProps {
  visible: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  type: GoalDepositType;
}

const today = () => new Date().toISOString().slice(0, 10);

export function GoalDepositForm({ visible, onClose, goal, type }: GoalDepositFormProps) {
  const deposit = useGoalsStore((s) => s.deposit);
  const withdraw = useGoalsStore((s) => s.withdraw);
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    goalInfo: {
      backgroundColor: t.colors.surfaceHigh, borderRadius: t.radius.button,
      padding: t.spacing.md, marginBottom: t.spacing.md,
      borderWidth: 1, borderColor: t.colors.border,
    },
    goalName: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold },
    goalBalance: { color: t.colors.muted, fontSize: t.typography.size.sm, marginTop: 2 },
    goalBalanceVal: { color: t.colors.accent, fontWeight: t.typography.weight.semibold },
    btn: {
      flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
      gap: t.spacing.sm, paddingVertical: 14, borderRadius: t.radius.button, marginTop: t.spacing.md,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: t.colors.textOnNeon, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
  }));

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDeposit = type === 'DEPOSIT';
  const title = isDeposit ? 'Aportar no cofrinho' : 'Resgatar do cofrinho';
  const submitLabel = isDeposit ? 'Confirmar aporte' : 'Confirmar resgate';
  const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;
  const accent = isDeposit ? colors.success : colors.danger;

  const reset = () => {
    setAmount(''); setDate(today()); setNotes(''); setError(null);
  };

  const onSubmit = async () => {
    if (!goal) return;
    setError(null);
    const v = parseFloat(amount);
    if (!amount || isNaN(v) || v <= 0) return setError('Valor invalido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Data invalida');
    if (notes.length > 150) return setError('Observacao muito longa (max 150)');
    if (!isDeposit && v > goal.current_amount) {
      return setError(`Saldo insuficiente. Disponivel: ${fmt(goal.current_amount)}`);
    }
    setSubmitting(true);
    try {
      if (isDeposit) {
        await deposit(goal.id, v, date, notes.trim() || undefined);
      } else {
        await withdraw(goal.id, v, date, notes.trim() || undefined);
      }
      reset();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal visible={visible} title={title} onClose={onClose} error={error}>
      {goal && (
        <View style={s.goalInfo}>
          <Text style={s.goalName} numberOfLines={1}>{goal.title}</Text>
          <Text style={s.goalBalance}>
            Saldo atual: <Text style={s.goalBalanceVal}>{fmt(goal.current_amount)}</Text>
          </Text>
        </View>
      )}

      <FormField label={isDeposit ? 'Valor a aportar (R$)' : 'Valor a resgatar (R$)'} required>
        <NumberInputField
          value={amount}
          onChangeText={setAmount}
          placeholder={isDeposit ? '500,00' : '100,00'}
        />
      </FormField>

      <FormField label="Data" required>
        <DateInputField value={date} onChange={setDate} />
      </FormField>

      <FormField
        label="Observacao"
        hint={isDeposit ? 'Ex: Bonus de trabalho' : 'Ex: Uso emergencial'}
      >
        <TextInputField
          value={notes}
          onChangeText={setNotes}
          placeholder={isDeposit ? 'Origem do valor' : 'Motivo do resgate'}
          maxLength={150}
        />
      </FormField>

      <Pressable
        onPress={onSubmit}
        disabled={submitting}
        style={[s.btn, { backgroundColor: accent }, submitting && s.btnDisabled]}
      >
        <Icon size={18} color={colors.base} />
        <Text style={s.btnText}>{submitting ? 'Salvando...' : submitLabel}</Text>
      </Pressable>
    </FormModal>
  );
}

