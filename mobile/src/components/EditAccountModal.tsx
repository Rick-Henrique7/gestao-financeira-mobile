import { useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { FormModal } from './form/FormModal';
import { FormField } from './form/FormField';
import { TextInputField } from './form/TextInputField';
import { NumberInputField } from './form/NumberInputField';
import { useSettingsStore } from '../stores/settingsStore';
import { useStyles } from '../lib/AppThemeProvider';

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
}

export function EditAccountModal({ visible, onClose, currentName, currentEmail }: EditAccountModalProps) {
  const { update } = useSettingsStore();
  const s = useStyles((t) => ({
    btn: {
      backgroundColor: t.colors.accent, paddingVertical: 14,
      borderRadius: t.radius.button, alignItems: 'center' as const, marginTop: t.spacing.md,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: t.colors.textOnNeon, fontWeight: t.typography.weight.bold, fontSize: t.typography.size.md },
  }));
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [salary, setSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setEmail(currentEmail);
      setSalary('');
      setError(null);
    }
  }, [visible, currentName, currentEmail]);

  const onSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError('Nome nao pode ser vazio');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Email invalido');
    }
    setSubmitting(true);
    try {
      const salaryNum = parseFloat(salary.replace(',', '.')) || 0;
      await update({
        display_name: name.trim(),
        email: email.trim(),
        monthly_salary: salaryNum,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal visible={visible} title="Editar conta" onClose={onClose} error={error}>
      <FormField label="Nome" required>
        <TextInputField
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          maxLength={80}
        />
      </FormField>
      <FormField label="Email">
        <TextInputField
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          maxLength={120}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </FormField>
      <FormField label="Salario mensal (R$)" hint="Opcional. Usado para calcular % de comprometimento.">
        <NumberInputField
          value={salary}
          onChangeText={setSalary}
          placeholder="0,00"
        />
      </FormField>
      <Pressable
        onPress={onSubmit}
        disabled={submitting}
        style={[s.btn, submitting && s.btnDisabled]}
      >
        <Text style={s.btnText}>{submitting ? 'Salvando...' : 'Salvar'}</Text>
      </Pressable>
    </FormModal>
  );
}
