import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, FileSpreadsheet, ChevronRight } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme, useStyles } from '../src/lib/AppThemeProvider';
import { useBillsStore } from '../src/stores/billsStore';
import { useSubsStore } from '../src/stores/subscriptionsStore';
import { useGoalsStore } from '../src/stores/goalsStore';
import { useLoansStore } from '../src/stores/loansStore';
import { useIRPFStore } from '../src/stores/irpfStore';
import { useCashflowStore } from '../src/stores/cashflowStore';
import { fmt } from '../src/lib/format';

type ExportFormat = 'csv' | 'pdf';
type EntityKey = 'bills' | 'subs' | 'goals' | 'loans' | 'irpf' | 'cashflow';

const ENTITY_LABEL: Record<EntityKey, string> = {
  bills: 'Contas',
  subs: 'Assinaturas',
  goals: 'Cofrinhos',
  loans: 'Empréstimos',
  irpf: 'IRPF',
  cashflow: 'Lançamentos',
};

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCSV(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
}

function buildHtml(title: string, sections: Array<{ name: string; headers: string[]; rows: any[][] }>): string {
  const today = new Date().toISOString().slice(0, 10);
  const body = sections.map((sec) => `
    <h2 style="color:#0A0D0A;margin:24px 0 8px;">${sec.name}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#CCF050;color:#000;">
          ${sec.headers.map((h) => `<th style="padding:6px 8px;text-align:left;border:1px solid #ccc;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${sec.rows.map((r) => `
          <tr>
            ${r.map((cell) => `<td style="padding:6px 8px;border:1px solid #ddd;">${cell ?? ''}</td>`).join('')}
          </tr>
        `).join('') || `<tr><td colspan="${sec.headers.length}" style="padding:8px;color:#999;font-style:italic;">Nenhum registro</td></tr>`}
      </tbody>
    </table>
  `).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, sans-serif; padding: 24px; color: #0A0D0A; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #5A6959; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Exportado em ${today}</div>
  ${body}
</body>
</html>`;
}

export default function ExportScreen() {
  const { colors } = useTheme();
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  const s = useStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.base },
    scroll: { paddingHorizontal: t.spacing.lg, paddingBottom: 80, gap: t.spacing.md },
    intro: {
      color: t.colors.textMuted, fontSize: t.typography.size.sm,
      paddingHorizontal: t.spacing.xs,
    },
    card: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.display,
      padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border,
      gap: t.spacing.md,
    },
    cardTitle: { color: t.colors.text, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.semibold },
    cardSubtitle: { color: t.colors.textMuted, fontSize: t.typography.size.sm },
    row: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.spacing.md,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.md,
      backgroundColor: t.colors.surfaceHigh, borderRadius: t.radius.button,
      borderWidth: 1, borderColor: t.colors.border,
    },
    rowText: { flex: 1 },
    rowTitle: { color: t.colors.text, fontSize: t.typography.size.md, fontWeight: t.typography.weight.semibold },
    rowSub: { color: t.colors.textMuted, fontSize: t.typography.size.xs, marginTop: 2 },
    action: {
      flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
      gap: t.spacing.sm, paddingVertical: t.spacing.md,
      backgroundColor: t.colors.accent, borderRadius: t.radius.button,
    },
    actionSecondary: {
      backgroundColor: t.colors.surface,
      borderWidth: 1, borderColor: t.colors.accent,
    },
    actionText: { color: t.colors.textOnNeon, fontWeight: t.typography.weight.bold, fontSize: t.typography.size.md },
    actionTextSecondary: { color: t.colors.accent },
    footer: { color: t.colors.textMuted, fontSize: t.typography.size.xs, textAlign: 'center' as const, paddingTop: t.spacing.md },
  }));

  // Buscar dados (síncrono - stores Zustand já carregam no _layout)
  const { bills } = useBillsStore();
  const { subs } = useSubsStore();
  const { goals } = useGoalsStore();
  const { loans } = useLoansStore();
  const { records: irpfRecords, categories: irpfCategories } = useIRPFStore();
  const { transactions } = useCashflowStore();

  const counts: Record<EntityKey, number> = {
    bills: bills.length,
    subs: subs.length,
    goals: goals.length,
    loans: loans.length,
    irpf: irpfRecords.length,
    cashflow: transactions.length,
  };

  // ─── CSV ────────────────────────────────────────────────────────────────
  const buildCsvAll = (): string => {
    const parts: string[] = [];

    if (bills.length) {
      parts.push('# Contas');
      parts.push(toCSV(
        ['id', 'titulo', 'valor', 'categoria', 'vencimento', 'status'],
        bills.map((b) => [b.id, b.title, b.amount, b.category ?? '', b.due_date, b.status]),
      ));
    }
    if (subs.length) {
      parts.push('\n# Assinaturas');
      parts.push(toCSV(
        ['id', 'servico', 'valor_mensal', 'categoria', 'inicio', 'status'],
        subs.map((sub) => [sub.id, sub.service_name, sub.monthly_cost, sub.category ?? '', sub.start_date, sub.status]),
      ));
    }
    if (goals.length) {
      parts.push('\n# Cofrinhos');
      parts.push(toCSV(
        ['id', 'nome', 'alvo', 'atual', 'vencimento'],
        goals.map((g) => [g.id, g.name, g.target_amount, g.current_amount, g.deadline ?? '']),
      ));
    }
    if (loans.length) {
      parts.push('\n# Empréstimos');
      parts.push(toCSV(
        ['id', 'credor', 'valor_original', 'taxa_mensal', 'parcelas', 'data'],
        loans.map((l) => [l.id, l.creditor, l.original_amount, l.monthly_rate, l.installments, l.loan_date]),
      ));
    }
    if (transactions.length) {
      parts.push('\n# Lançamentos');
      parts.push(toCSV(
        ['id', 'tipo', 'valor', 'categoria', 'descricao', 'data'],
        transactions.map((t) => [t.id, t.type, t.amount, t.category, t.description ?? '', t.date]),
      ));
    }
    if (irpfRecords.length) {
      parts.push('\n# IRPF');
      const catName = (id: string) => irpfCategories.find((c) => c.id === id)?.name ?? '';
      parts.push(toCSV(
        ['id', 'titulo', 'categoria', 'valor_bruto', 'ticker', 'status'],
        irpfRecords.map((r) => [r.id, r.title, catName(r.category_id), r.gross_value, r.ticker ?? '', r.status]),
      ));
    }

    return parts.join('\n');
  };

  // ─── PDF ────────────────────────────────────────────────────────────────
  const buildPdfHtml = (): string => {
    const sections: Array<{ name: string; headers: string[]; rows: any[][] }> = [];

    if (bills.length) {
      sections.push({
        name: 'Contas',
        headers: ['Título', 'Valor', 'Categoria', 'Vencimento', 'Status'],
        rows: bills.map((b) => [b.title, fmt(b.amount), b.category ?? '-', b.due_date, b.status]),
      });
    }
    if (subs.length) {
      sections.push({
        name: 'Assinaturas',
        headers: ['Serviço', 'Mensal', 'Anual', 'Categoria', 'Status'],
        rows: subs.map((sub) => [sub.service_name, fmt(sub.monthly_cost), fmt(sub.monthly_cost * 12), sub.category ?? '-', sub.status]),
      });
    }
    if (goals.length) {
      sections.push({
        name: 'Cofrinhos',
        headers: ['Nome', 'Alvo', 'Atual', 'Progresso', 'Vencimento'],
        rows: goals.map((g) => {
          const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
          return [g.name, fmt(g.target_amount), fmt(g.current_amount), `${pct}%`, g.deadline ?? '-'];
        }),
      });
    }
    if (loans.length) {
      sections.push({
        name: 'Empréstimos',
        headers: ['Credor', 'Valor', 'Taxa/mês', 'Parcelas', 'Data'],
        rows: loans.map((l) => [l.creditor, fmt(l.original_amount), `${l.monthly_rate}%`, String(l.installments), l.loan_date]),
      });
    }
    if (transactions.length) {
      sections.push({
        name: 'Lançamentos',
        headers: ['Tipo', 'Valor', 'Categoria', 'Descrição', 'Data'],
        rows: transactions.map((t) => [t.type, fmt(t.amount), t.category, t.description ?? '-', t.date]),
      });
    }
    if (irpfRecords.length) {
      const catName = (id: string) => irpfCategories.find((c) => c.id === id)?.name ?? '-';
      sections.push({
        name: 'IRPF',
        headers: ['Título', 'Categoria', 'Valor', 'Ticker', 'Status'],
        rows: irpfRecords.map((r) => [r.title, catName(r.category_id), fmt(r.gross_value), r.ticker ?? '-', r.status]),
      });
    }

    if (sections.length === 0) {
      sections.push({
        name: 'Vazio',
        headers: ['Info'],
        rows: [['Nenhum dado cadastrado ainda. Adicione contas, assinaturas ou lançamentos para exportar.']],
      });
    }

    return buildHtml('Sistema Gerenciador Financeiro — Export', sections);
  };

  // ─── Save & share ──────────────────────────────────────────────────────
  const saveAndShare = async (uri: string, filename: string) => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'text/csv',
        dialogTitle: 'Salvar / compartilhar',
        UTI: filename.endsWith('.pdf') ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('Arquivo gerado', `Salvo em: ${uri}`);
    }
  };

  const handleCsv = async () => {
    if (busy) return;
    setBusy('csv');
    try {
      const csv = buildCsvAll();
      const filename = `sgf-export-${Date.now()}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
      await saveAndShare(fileUri, filename);
    } catch (err) {
      Alert.alert('Erro ao exportar CSV', String(err));
    } finally {
      setBusy(null);
    }
  };

  const handlePdf = async () => {
    if (busy) return;
    setBusy('pdf');
    try {
      const html = buildPdfHtml();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      // Renomear para SGF-<timestamp>.pdf
      const filename = `sgf-export-${Date.now()}.pdf`;
      const newUri = `${FileSystem.cacheDirectory}${filename}`;
      try {
        await FileSystem.moveAsync({ from: uri, to: newUri });
        await saveAndShare(newUri, filename);
      } catch {
        // Se move falhar, usa a uri original
        await saveAndShare(uri, filename);
      }
    } catch (err) {
      Alert.alert('Erro ao exportar PDF', String(err));
    } finally {
      setBusy(null);
    }
  };

  const totalRegistros = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.intro}>
          Escolha o formato. Os dados serao gerados a partir do que voce tem salvo no app (offline).
        </Text>

        <View style={s.card}>
          <View>
            <Text style={s.cardTitle}>Resumo dos dados</Text>
            <Text style={s.cardSubtitle}>{totalRegistros} registros disponiveis para exportar</Text>
          </View>
          {(Object.keys(counts) as EntityKey[]).map((key) => (
            <View key={key} style={s.row}>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>{ENTITY_LABEL[key]}</Text>
                <Text style={s.rowSub}>{counts[key]} {counts[key] === 1 ? 'registro' : 'registros'}</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </View>
          ))}
        </View>

        <View style={s.card}>
          <View>
            <Text style={s.cardTitle}>Formatos</Text>
            <Text style={s.cardSubtitle}>Salve no celular ou compartilhe</Text>
          </View>

          <Pressable
            onPress={handleCsv}
            disabled={!!busy}
            style={[s.action, s.actionSecondary]}
            accessibilityRole="button"
            accessibilityLabel="Exportar CSV"
          >
            {busy === 'csv' ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <FileSpreadsheet size={18} color={colors.accent} />
                <Text style={[s.actionText, s.actionTextSecondary]}>Exportar CSV</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={handlePdf}
            disabled={!!busy}
            style={s.action}
            accessibilityRole="button"
            accessibilityLabel="Exportar PDF"
          >
            {busy === 'pdf' ? (
              <ActivityIndicator color={colors.textOnNeon} />
            ) : (
              <>
                <FileText size={18} color={colors.textOnNeon} />
                <Text style={s.actionText}>Exportar PDF</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={s.footer}>
          Dica: CSV abre em Excel / Google Sheets. PDF e ideal para imprimir ou enviar ao contador.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
