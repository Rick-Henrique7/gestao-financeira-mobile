import { useEffect, useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { SelectField } from '../form/SelectField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useSubsStore } from '../../stores/subscriptionsStore';
import type { Subscription, SubscriptionStatus } from '../../types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE'    as SubscriptionStatus, label: 'Ativa' },
  { value: 'PAUSED'   as SubscriptionStatus, label: 'Pausada' },
  { value: 'CANCELLED' as SubscriptionStatus, label: 'Cancelada' },
];

interface SubscriptionFormProps {
  visible: boolean;
  onClose: () => void;
  /** Quando definido, o form entra em modo de edicao */
  edit?: Subscription | null;
}

export function SubscriptionForm({ visible, onClose, edit }: SubscriptionFormProps) {
  const add = useSubsStore((s) => s.add);
  const update = useSubsStore((s) => s.update);

  const [serviceName, setServiceName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#FFF500');
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!edit;

  // Carrega valores do item sendo editado
  useEffect(() => {
    if (visible) {
      if (edit) {
        setServiceName(edit.service_name);
        setMonthlyCost(String(edit.monthly_cost));
        setBillingDay(String(edit.billing_day));
        setCategory(edit.category ?? '');
        setColor(edit.color);
        setStatus(edit.status);
      } else {
        setServiceName(''); setMonthlyCost(''); setBillingDay('1');
        setCategory(''); setColor('#FFF500'); setStatus('ACTIVE');
      }
      setError(null);
    }
  }, [visible, edit]);

  const onSubmit = async () => {
    setError(null);
    const m = parseFloat(monthlyCost.replace(',', '.'));
    const d = parseInt(billingDay, 10);
    if (!serviceName.trim()) return setError('Nome do servico obrigatorio');
    if (!monthlyCost || isNaN(m) || m <= 0) return setError('Custo invalido');
    if (isNaN(d) || d < 1 || d > 31) return setError('Dia de cobranca 1-31');
    setSubmitting(true);
    try {
      if (isEdit && edit) {
        await update(edit.id, {
          service_name: serviceName.trim(),
          monthly_cost: m,
          billing_day: d,
          category: category.trim() || undefined,
          color,
          status,
        });
      } else {
        await add({
          service_name: serviceName.trim(),
          monthly_cost: m,
          billing_day: d,
          category: category.trim() || undefined,
          color,
          status,
        });
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={isEdit ? 'Editar assinatura' : 'Nova assinatura'}
      onClose={onClose}
      error={error}
    >
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
      {isEdit && (
        <FormField label="Status">
          <SelectField
            value={status}
            onChange={(v) => setStatus(v as SubscriptionStatus)}
            options={STATUS_OPTIONS}
            placeholder="Status"
          />
        </FormField>
      )}
      <Pressable onPress={onSubmit} disabled={submitting} style={[s.btn, submitting && s.btnDisabled]}>
        <Text style={s.btnText}>{submitting ? 'Salvando...' : (isEdit ? 'Salvar alteracoes' : 'Adicionar')}</Text>
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
