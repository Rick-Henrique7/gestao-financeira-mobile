import { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { TrendingUp, Calendar } from 'lucide-react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { NumberInputField } from '../form/NumberInputField';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { fmt } from '../../lib/format';
import type { FinancialGoal } from '../../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_MONTH = MS_PER_DAY * 30;

interface GoalSimulatorFormProps {
  visible: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
}

export function GoalSimulatorForm({ visible, onClose, goal }: GoalSimulatorFormProps) {
  const [extra, setExtra] = useState('');

  const result = useMemo(() => {
    if (!goal) return null;
    const v = parseFloat(extra || '0');
    const extraVal = isNaN(v) || v < 0 ? 0 : v;

    const hoje = Date.now();
    const alvo = new Date(goal.target_date).getTime();
    const mesesOriginais = Math.max(1, Math.ceil((alvo - hoje) / MS_PER_MONTH));

    const restante = Math.max(0, goal.target_amount - goal.current_amount);
    const aporteCalculado = restante / mesesOriginais;
    const aporteTotal = aporteCalculado + extraVal;

    if (restante <= 0) {
      return {
        mesesOriginais, mesesComExtras: 0, mesesEconomizados: mesesOriginais,
        aporteCalculado, dataProjetada: new Date(hoje).toISOString().slice(0, 10),
        jaAlcancado: true,
      };
    }
    if (aporteTotal <= 0) {
      return {
        mesesOriginais, mesesComExtras: Infinity, mesesEconomizados: 0,
        aporteCalculado, dataProjetada: null, jaAlcancado: false,
      };
    }
    const mesesComExtras = Math.ceil(restante / aporteTotal);
    const mesesEconomizados = Math.max(0, mesesOriginais - mesesComExtras);
    const dataProjetadaMs = hoje + mesesComExtras * MS_PER_MONTH;
    const dataProjetada = new Date(dataProjetadaMs).toISOString().slice(0, 10);
    return {
      mesesOriginais, mesesComExtras, mesesEconomizados, aporteCalculado,
      dataProjetada, jaAlcancado: false,
    };
  }, [goal, extra]);

  return (
    <FormModal visible={visible} title="Simular aporte" onClose={onClose}>
      {goal && (
        <View style={s.goalInfo}>
          <Text style={s.goalName} numberOfLines={1}>{goal.title}</Text>
          <View style={s.goalStatsRow}>
            <Text style={s.goalStat}>Atual: <Text style={s.goalStatVal}>{fmt(goal.current_amount)}</Text></Text>
            <Text style={s.goalStat}>Meta: <Text style={s.goalStatVal}>{fmt(goal.target_amount)}</Text></Text>
            <Text style={s.goalStat}>
              Prazo: <Text style={s.goalStatVal}>
                {new Date(goal.target_date).toLocaleDateString('pt-BR')}
              </Text>
            </Text>
          </View>
        </View>
      )}

      <FormField label="Aporte mensal extra (R$)" hint="Adicional ao aporte calculado">
        <NumberInputField value={extra} onChangeText={setExtra} placeholder="100,00" />
      </FormField>

      {result && (
        <View style={s.resultBox}>
          {result.jaAlcancado ? (
            <>
              <Text style={s.resultTitle}>Meta ja alcancada</Text>
              <Text style={s.resultText}>
                Voce ja tem {fmt(goal!.current_amount)} (meta: {fmt(goal!.target_amount)}).
              </Text>
            </>
          ) : (
            <>
              <Text style={s.resultTitle}>Resultado da simulacao</Text>
              <View style={s.resultRow}>
                <View style={s.resultItem}>
                  <Text style={s.resultItemLabel}>Aporte necessario</Text>
                  <Text style={s.resultItemVal}>
                    {fmt(result.aporteCalculado)}<Text style={s.resultItemUnit}>/mes</Text>
                  </Text>
                </View>
                <View style={s.resultItem}>
                  <Text style={s.resultItemLabel}>Prazo original</Text>
                  <Text style={s.resultItemVal}>
                    {result.mesesOriginais}<Text style={s.resultItemUnit}> meses</Text>
                  </Text>
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.resultItem}>
                <View style={s.resultItemHeader}>
                  <Calendar size={14} color={colors.muted} />
                  <Text style={s.resultItemLabel}>Data projetada</Text>
                </View>
                <Text style={s.resultItemVal}>
                  {result.dataProjetada
                    ? new Date(result.dataProjetada).toLocaleDateString('pt-BR')
                    : 'indefinido'}
                </Text>
              </View>
              <View style={s.savingBox}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={s.savingText}>
                  {result.mesesEconomizados > 0
                    ? `Economia de ${result.mesesEconomizados} ${result.mesesEconomizados === 1 ? 'mes' : 'meses'}`
                    : 'Sem ganho de tempo com esse aporte extra'}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      <Pressable onPress={onClose} style={s.btn}>
        <Text style={s.btnText}>Fechar</Text>
      </Pressable>
    </FormModal>
  );
}

const s = StyleSheet.create({
  goalInfo: {
    backgroundColor: colors.surfaceHigh, borderRadius: radius.button,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  goalName: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  goalStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  goalStat: { color: colors.muted, fontSize: typography.size.xs },
  goalStatVal: { color: colors.text, fontWeight: typography.weight.semibold },
  resultBox: {
    backgroundColor: colors.surface, borderRadius: radius.button,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    gap: spacing.md,
  },
  resultTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  resultRow: { flexDirection: 'row', gap: spacing.md },
  resultItem: { flex: 1, gap: 4 },
  resultItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultItemLabel: { color: colors.muted, fontSize: typography.size.xs },
  resultItemVal: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold, fontFamily: typography.fontFamily.mono },
  resultItemUnit: { color: colors.muted, fontSize: typography.size.sm, fontWeight: typography.weight.regular },
  divider: { height: 1, backgroundColor: colors.border },
  savingBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderRadius: radius.button, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  savingText: { color: colors.success, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, flex: 1 },
  resultText: { color: colors.muted, fontSize: typography.size.sm },
  btn: {
    backgroundColor: colors.accent, paddingVertical: 14,
    borderRadius: radius.button, alignItems: 'center', marginTop: spacing.md,
  },
  btnText: { color: colors.base, fontSize: typography.size.md, fontWeight: typography.weight.bold },
});
