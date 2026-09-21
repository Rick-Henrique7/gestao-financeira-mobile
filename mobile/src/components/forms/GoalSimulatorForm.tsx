import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TrendingUp, Calendar } from 'lucide-react-native';
import { FormModal } from '../form/FormModal';
import { FormField } from '../form/FormField';
import { NumberInputField } from '../form/NumberInputField';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';
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
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    goalInfo: {
      backgroundColor: t.colors.surfaceHigh, borderRadius: t.radius.button,
      padding: t.spacing.md, borderWidth: 1, borderColor: t.colors.border,
    },
    goalName: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold },
    goalStatsRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.spacing.md, marginTop: t.spacing.sm },
    goalStat: { color: t.colors.muted, fontSize: t.typography.size.xs },
    goalStatVal: { color: t.colors.text, fontWeight: t.typography.weight.semibold },
    resultBox: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.button,
      padding: t.spacing.md, borderWidth: 1, borderColor: t.colors.border,
      gap: t.spacing.md,
    },
    resultTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold },
    resultRow: { flexDirection: 'row' as const, gap: t.spacing.md },
    resultItem: { flex: 1, gap: 4 },
    resultItemHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
    resultItemLabel: { color: t.colors.muted, fontSize: t.typography.size.xs },
    resultItemVal: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.bold, fontFamily: t.typography.fontFamily.mono },
    resultItemUnit: { color: t.colors.muted, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.regular },
    divider: { height: 1, backgroundColor: t.colors.border },
    savingBox: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.sm,
      backgroundColor: 'rgba(0, 230, 118, 0.12)',
      borderRadius: t.radius.button, padding: t.spacing.md,
      borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)',
    },
    savingText: { color: t.colors.success, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.semibold, flex: 1 },
    resultText: { color: t.colors.muted, fontSize: t.typography.size.sm },
    btn: {
      backgroundColor: t.colors.accent, paddingVertical: 14, borderRadius: t.radius.button,
      alignItems: 'center' as const, marginTop: t.spacing.md,
    },
    btnText: { color: t.colors.textOnNeon, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold },
  }));

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

