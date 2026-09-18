import { useEffect, useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { TextInputField } from '../form/TextInputField';
import { NumberInputField } from '../form/NumberInputField';
import { SelectField } from '../form/SelectField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useIRPFStore } from '../../stores/irpfStore';
import type { IRPFRecord } from '../../types';

interface IRPFFormProps {
  visible: boolean;
  onClose: () => void;
  /** Quando definido, o form entra em modo edicao */
  edit?: IRPFRecord | null;
}

export function IRPFForm({ visible, onClose, edit }: IRPFFormProps) {
  const add = useIRPFStore((s) => s.add);
  const update = useIRPFStore((s) => s.update);
  const categories = useIRPFStore((s) => s.categories);

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

  const isEdit = !!edit;

  // Inicializa campos com valores do edit (ou defaults)
  useEffect(() => {
    if (visible) {
      if (edit) {
        setTitle(edit.title);
        setFiscalYear(String(edit.fiscal_year));
        setCategoryId(edit.category_id);
        setCnpjCpf(edit.cnpj_cpf ?? '');
        setGrossValue(String(edit.gross_value ?? ''));
        setTicker(edit.ticker ?? '');
        setQuantity(String(edit.quantity ?? ''));
        setAvgPrice(String(edit.avg_price ?? ''));
        setDescription(edit.description ?? '');
      } else {
        setTitle('');
        setFiscalYear(String(new Date().getFullYear()));
        setCategoryId(categories[0]?.id ?? 'cat-rv');
        setCnpjCpf(''); setGrossValue(''); setTicker('');
        setQuantity(''); setAvgPrice(''); setDescription('');
      }
      setError(null);
    }
  }, [visible, edit, categories]);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  // Fallback se ainda nao carregou
  if (categoryOptions.length === 0) {
    categoryOptions.push(
      { value: 'cat-rv', label: 'Renda Variavel' },
      { value: 'cat-rt', label: 'Rendimentos' },
      { value: 'cat-bd', label: 'Bens e Direitos' },
      { value: 'cat-dd', label: 'Deducoes' },
    );
  }

  const onSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError('Titulo obrigatorio');
    const yr = parseInt(fiscalYear, 10);
    if (isNaN(yr) || yr < 2000 || yr > 2100) return setError('Ano invalido');
    const gv = parseFloat(grossValue.replace(',', '.')) || 0;
    const q = parseFloat(quantity.replace(',', '.')) || 0;
    const ap = parseFloat(avgPrice.replace(',', '.')) || 0;
    setSubmitting(true);
    try {
      if (isEdit && edit) {
        await update(edit.id, {
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
      } else {
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
      title={isEdit ? 'Editar registro IRPF' : 'Novo registro IRPF'}
      onClose={onClose}
      error={error}
    >
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
