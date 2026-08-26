import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, TrendingUp, Wallet } from 'lucide-react-native';
import { fmt } from '../src/lib/format';
import { colors, radius, spacing, typography } from '../src/lib/theme';
import { ScreenTitle } from '../src/components/ScreenTitle';

export default function SimulacoesScreen() {
  const [jc, setJc] = useState({ capital: '10000', taxa: '1', periodo: '12' });
  const jcResult = useMemo(() => {
    const C = parseFloat(jc.capital) || 0;
    const i = (parseFloat(jc.taxa) || 0) / 100;
    const n = parseFloat(jc.periodo) || 0;
    const M = C * Math.pow(1 + i, n);
    return { montante: M, rendimento: M - C, rentPct: C > 0 ? ((M - C) / C) * 100 : 0 };
  }, [jc]);

  const [rf, setRf] = useState({ aporte: '5000', taxa: '12.5', prazo: '24' });
  const rfResult = useMemo(() => {
    const P = parseFloat(rf.aporte) || 0;
    const taxaAnual = parseFloat(rf.taxa) || 0;
    const taxaMensal = taxaAnual / 12 / 100;
    const n = parseFloat(rf.prazo) || 0;
    const M = P * Math.pow(1 + taxaMensal, n);
    const bruto = M - P;
    const aliquota = n > 24 ? 0.15 : n > 12 ? 0.175 : n > 6 ? 0.2 : 0.225;
    const ir = bruto * aliquota;
    const liquido = bruto - ir;
    return { montante: P + liquido, bruto, ir, liquido, aliquotaPct: aliquota * 100 };
  }, [rf]);

  const inputCls = {
    backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    color: colors.text, fontSize: 14,
  } as const;
  const labelCls = {
    color: colors.muted, fontSize: 11, fontWeight: '500' as const,
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5,
  };

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <ScreenTitle title="Simulações" subtitle="Calcule juros compostos e investimentos" />
        <View style={s.display}>
          <View style={s.headerRow}>
            <View style={[s.iconBox, { backgroundColor: colors.accent }]}>
              <Calculator size={16} color={colors.textOnNeon} />
            </View>
            <View>
              <Text style={s.title}>Juros Compostos</Text>
              <Text style={s.formula}>M = C × (1 + i)ⁿ</Text>
            </View>
          </View>

          <View style={s.field}>
            <Text style={labelCls}>Capital inicial (R$)</Text>
            <TextInput
              style={inputCls} value={jc.capital}
              onChangeText={(v) => setJc((p) => ({ ...p, capital: v }))}
              keyboardType="numeric" placeholder="10000" placeholderTextColor={colors.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={labelCls}>Taxa mensal (%)</Text>
            <TextInput
              style={inputCls} value={jc.taxa}
              onChangeText={(v) => setJc((p) => ({ ...p, taxa: v }))}
              keyboardType="numeric" placeholder="1.0" placeholderTextColor={colors.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={labelCls}>Período (meses)</Text>
            <TextInput
              style={inputCls} value={jc.periodo}
              onChangeText={(v) => setJc((p) => ({ ...p, periodo: v }))}
              keyboardType="numeric" placeholder="12" placeholderTextColor={colors.muted}
            />
          </View>

          <View style={s.resultBox}>
            <View style={s.resultRow}>
              <Text style={s.resultLabelOnNeon}>Montante Final</Text>
              <Text style={s.resultValueOnNeon}>{fmt(jcResult.montante)}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabelOnNeon}>Rendimento</Text>
              <Text style={s.resultValueOnNeon}>{fmt(jcResult.rendimento)}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabelOnNeon}>Rentabilidade</Text>
              <Text style={s.resultValueOnNeon}>{jcResult.rentPct.toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        <View style={s.display}>
          <View style={s.headerRow}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
              <TrendingUp size={16} color="#60A5FA" />
            </View>
            <View>
              <Text style={s.title}>Renda Fixa com IR</Text>
              <Text style={s.formula}>Tabela regressiva</Text>
            </View>
          </View>

          <View style={s.field}>
            <Text style={labelCls}>Valor a investir (R$)</Text>
            <TextInput
              style={inputCls} value={rf.aporte}
              onChangeText={(v) => setRf((p) => ({ ...p, aporte: v }))}
              keyboardType="numeric" placeholder="5000" placeholderTextColor={colors.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={labelCls}>Taxa anual (%)</Text>
            <TextInput
              style={inputCls} value={rf.taxa}
              onChangeText={(v) => setRf((p) => ({ ...p, taxa: v }))}
              keyboardType="numeric" placeholder="12.5" placeholderTextColor={colors.muted}
            />
          </View>
          <View style={s.field}>
            <Text style={labelCls}>Prazo (meses)</Text>
            <TextInput
              style={inputCls} value={rf.prazo}
              onChangeText={(v) => setRf((p) => ({ ...p, prazo: v }))}
              keyboardType="numeric" placeholder="24" placeholderTextColor={colors.muted}
            />
          </View>

          <View style={s.resultBoxAlt}>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Rendimento Bruto</Text>
              <Text style={s.resultValue}>{fmt(rfResult.bruto)}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>IR ({rfResult.aliquotaPct.toFixed(1)}%)</Text>
              <Text style={[s.resultValue, { color: colors.danger }]}>−{fmt(rfResult.ir)}</Text>
            </View>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Rendimento Líquido</Text>
              <Text style={[s.resultValue, { color: '#60A5FA' }]}>{fmt(rfResult.liquido)}</Text>
            </View>
            <View style={[s.resultRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(96, 165, 250, 0.2)', marginTop: 4 }]}>
              <Text style={s.resultLabel}>Montante Final</Text>
              <Text style={[s.resultValue, { color: '#60A5FA' }]}>{fmt(rfResult.montante)}</Text>
            </View>
          </View>
        </View>

        <View style={s.display}>
          <View style={s.headerRow}>
            <View style={[s.iconBox, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
              <Wallet size={16} color="#A78BFA" />
            </View>
            <View>
              <Text style={s.title}>Saúde Financeira</Text>
              <Text style={s.formula}>Resumo do mês</Text>
            </View>
          </View>
          <View style={s.healthGrid}>
            {[
              { label: 'Renda',            val: 12500,   color: colors.accent },
              { label: 'Despesas Fixas',   val: 6267.5,  color: colors.text },
              { label: 'Gastos Variáveis',  val: 2540,    color: '#FB923C' },
              { label: 'Saldo Livre',      val: 3692.5,  color: '#60A5FA' },
            ].map((item) => (
              <View key={item.label} style={s.healthCard}>
                <Text style={[s.healthValue, { color: item.color }]}>{fmt(item.val)}</Text>
                <Text style={s.healthLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: 20, paddingBottom: spacing.xxl, gap: spacing.md },
  display: {
    backgroundColor: colors.surface, borderRadius: radius.display,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  formula: { color: colors.muted, fontSize: typography.size.xs, fontFamily: typography.fontFamily.mono, marginTop: 2 },
  field: { marginBottom: spacing.md },
  resultBox: {
    backgroundColor: colors.accent, borderRadius: radius.display,
    padding: spacing.md, borderWidth: 1, borderColor: colors.accent,
    marginTop: spacing.md, gap: spacing.sm,
  },
  resultBoxAlt: {
    backgroundColor: 'rgba(96, 165, 250, 0.05)', borderRadius: radius.display,
    padding: spacing.md, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.2)',
    marginTop: spacing.md, gap: spacing.sm,
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resultLabel: { color: colors.muted, fontSize: typography.size.sm, fontWeight: '500' },
  resultValue: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold, fontFamily: typography.fontFamily.mono },
  resultLabelOnNeon: { color: 'rgba(0,0,0,0.65)', fontSize: typography.size.sm, fontWeight: '500' },
  resultValueOnNeon: { color: colors.textOnNeon, fontSize: typography.size.md, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  healthCard: {
    width: '48%', flexGrow: 1, backgroundColor: colors.surfaceHigh,
    borderRadius: radius.display, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  healthValue: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  healthLabel: { color: colors.muted, fontSize: typography.size.xs, marginTop: 4 },
});
