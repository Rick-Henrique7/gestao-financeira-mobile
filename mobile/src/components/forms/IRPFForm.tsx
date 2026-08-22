import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { SelectField } from '../form/SelectField';
import { ImagePickerField } from '../form/ImagePickerField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useIRPFStore } from '../../stores/irpfStore';

const categoryOptions = [
  { value: 'cat-rv', label: 'Renda Variavel' },
  { value: 'cat-rt', label: 'Rendimentos' },
  { value: 'cat-bd', label: 'Bens e Direitos' },
  { value: 'cat-dd', label: 'Deducoes' },
];

export function IRPFForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const add = useIRPFStore((s) => s.add);
  const [title, setTitle] = useState('');
  const [fiscalYear, setFiscalYear] = useState(String(new Date().getFullYear()));
  const [categoryId, setCategoryId] = useState<string>('cat-rv');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [grossValue, setGrossValue] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle(''); setFiscalYear(String(new Date().getFullYear()));
    setCategoryId('cat-rv'); setCnpjCpf(''); setGrossValue('');
    setTicker(''); setQuantity(''); setAvgPrice(''); setDescription('');
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError('Titulo obrigatorio');
    const yr = parseInt(fiscalYear, 10);
    if (isNaN(yr) || yr < 2000 || yr > 2100) return setError('Ano invalido');
    const gv = parseFloat(grossValue) || 0;
    const q = parseFloat(quantity) || 0;
    const ap = parseFloat(avgPrice) || 0;
    setSubmitting(true);
    try {
      await add({
        title: title.trim(),
        fiscal_year: yr,
        category_id: categoryId,
        cnpj_cpf: cnpjCpf.trim() || undefined,
        gross_value: gv,
        ticker: ticker.trim() || undefined,
        quantity: q,
        avg_price: ap,
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
    <FormModal visible={visible} title="Novo registro IRPF" onClose={onClose} error={error}>
      <FormField label="Titulo" required>
        <TextInputField value={title} onChangeText={setTitle} placeholder="Ex: Acoes PETR4" maxLength={100} />
      </FormField>
      <FormField label="Categoria" required>
        <SelectField value={categoryId} onChange={(v) => setCategoryId(v)} options={categoryOptions} />
      </FormField>
      <FormField label="Ano fiscal" required>
        <TextInputField
          value={fiscalYear}
          onChangeText={(v) => setFiscalYear(v.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          placeholder="2026"
        />
      </FormField>
      <FormField label="CNPJ/CPF">
        <TextInputField value={cnpjCpf} onChangeText={setCnpjCpf} placeholder="Opcional" maxLength={18} />
      </FormField>
      <FormField label="Valor bruto (R$)">
        <NumberInputField value={grossValue} onChangeText={setGrossValue} placeholder="0,00" />
      </FormField>
      <FormField label="Ticker" hint="Ex: PETR4, VALE3 (se renda variavel)">
        <TextInputField value={ticker} onChangeText={setTicker} placeholder="Opcional" maxLength={10} />
      </FormField>
      <FormField label="Quantidade">
        <NumberInputField value={quantity} onChangeText={setQuantity} placeholder="0" allowDecimals={false} />
      </FormField>
      <FormField label="Preco medio (R$)">
        <NumberInputField value={avgPrice} onChangeText={setAvgPrice} placeholder="0,00" />
      </FormField>
      <FormField label="Descricao">
        <TextInputField value={description} onChangeText={setDescription} placeholder="Opcional" maxLength={200} multiline />
      </FormField>
      <FormField label="Comprovante" hint="Anexe a nota de corretora ou informe">
        <ImagePickerField />
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
