import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useSubsStore } from '../../stores/subscriptionsStore';

export function SubscriptionForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useSubsStore((s) => s.add);
  const [serviceName, setServiceName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#FFF500');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setServiceName(''); setMonthlyCost(''); setBillingDay('1');
    setCategory(''); setColor('#FFF500'); setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const m = parseFloat(monthlyCost);
    const d = parseInt(billingDay, 10);
    if (!serviceName.trim()) return setError('Nome do servico obrigatorio');
    if (!monthlyCost || isNaN(m) || m <= 0) return setError('Custo invalido');
    if (isNaN(d) || d < 1 || d > 31) return setError('Dia de cobranca 1-31');
    setSubmitting(true);
    try {
      await add({
        service_name: serviceName.trim(),
        monthly_cost: m,
        billing_day: d,
        category: category.trim() || undefined,
        color,
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
    <FormModal visible={visible} title="Nova assinatura" onClose={onClose} error={error}>
      <FormField label="Servico" required>
        <TextInputField value={serviceName} onChangeText={setServiceName} placeholder="Ex: Netflix" maxLength={60} />
      </FormField>
      <FormField label="Custo mensal (R$)" required>
        <NumberInputField value={monthlyCost} onChangeText={setMonthlyCost} placeholder="39,90" />
      </FormField>
      <FormField label="Dia de cobranca" required hint="1 a 31">
        <TextInputField
          value={billingDay}
          onChangeText={(v) => setBillingDay(v.replace(/[^0-9]/g, '').slice(0, 2))}
          keyboardType="number-pad"
          placeholder="1"
        />
      </FormField>
      <FormField label="Categoria" hint="Ex: Streaming, Musica, Trabalho">
        <TextInputField value={category} onChangeText={setCategory} placeholder="Opcional" maxLength={50} />
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
