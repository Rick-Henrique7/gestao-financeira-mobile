import { useMemo, useState } from "react";
import { Calculator, TrendingUp, Wallet } from "lucide-react";
import { fmt } from "../lib/format";
import { MONO, DISPLAY } from "../lib/styles";

// ─── SIMULAÇÕES ──────────────────────────────────────────────────────────────
export function SimulacoesView() {
  const [jc, setJc] = useState({ capital: "10000", taxa: "1", periodo: "12" });
  const [rf, setRf] = useState({ aporte: "5000", taxa: "12.5", prazo: "24" });

  const jcResult = useMemo(() => {
    const C = parseFloat(jc.capital) || 0;
    const i = (parseFloat(jc.taxa) || 0) / 100;
    const n = parseFloat(jc.periodo) || 0;
    const M = C * Math.pow(1 + i, n);
    const rendimento = M - C;
    const rentPct = C > 0 ? (rendimento / C) * 100 : 0;
    return { montante: M, rendimento, rentPct };
  }, [jc]);

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

  const inputCls =
    "w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors placeholder:text-muted-foreground";
  const labelCls = "text-xs text-muted-foreground mb-1.5 block font-medium";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Juros Compostos */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calculator size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={DISPLAY}>
                Juros Compostos
              </h3>
              <p className="text-muted-foreground text-xs">M = C × (1 + i)ⁿ</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Capital inicial (R$)</label>
              <input
                className={inputCls}
                value={jc.capital}
                onChange={(e) => setJc((p) => ({ ...p, capital: e.target.value }))}
                type="number"
                placeholder="10.000,00"
              />
            </div>
            <div>
              <label className={labelCls}>Taxa mensal (%)</label>
              <input
                className={inputCls}
                value={jc.taxa}
                onChange={(e) => setJc((p) => ({ ...p, taxa: e.target.value }))}
                type="number"
                step="0.1"
                placeholder="1.0"
              />
            </div>
            <div>
              <label className={labelCls}>Período (meses)</label>
              <input
                className={inputCls}
                value={jc.periodo}
                onChange={(e) => setJc((p) => ({ ...p, periodo: e.target.value }))}
                type="number"
                placeholder="12"
              />
            </div>
          </div>
          <div className="mt-5 p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montante Final</span>
              <span className="font-bold text-primary" style={MONO}>
                {fmt(jcResult.montante)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rendimento Bruto</span>
              <span className="font-medium" style={MONO}>
                {fmt(jcResult.rendimento)}
              </span>
            </div>
            <div className="border-t border-primary/10 pt-2.5 flex justify-between text-sm">
              <span className="text-muted-foreground">Rentabilidade Total</span>
              <span className="font-bold text-primary" style={MONO}>
                {jcResult.rentPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Renda Fixa */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-sky-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={DISPLAY}>
                Renda Fixa com IR
              </h3>
              <p className="text-muted-foreground text-xs">
                Tabela regressiva de Imposto de Renda
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Valor a investir (R$)</label>
              <input
                className={inputCls}
                value={rf.aporte}
                onChange={(e) => setRf((p) => ({ ...p, aporte: e.target.value }))}
                type="number"
                placeholder="5.000,00"
              />
            </div>
            <div>
              <label className={labelCls}>Taxa anual (%)</label>
              <input
                className={inputCls}
                value={rf.taxa}
                onChange={(e) => setRf((p) => ({ ...p, taxa: e.target.value }))}
                type="number"
                step="0.1"
                placeholder="12.5"
              />
            </div>
            <div>
              <label className={labelCls}>Prazo (meses)</label>
              <input
                className={inputCls}
                value={rf.prazo}
                onChange={(e) => setRf((p) => ({ ...p, prazo: e.target.value }))}
                type="number"
                placeholder="24"
              />
            </div>
          </div>
          <div className="mt-5 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rendimento Bruto</span>
              <span className="font-medium" style={MONO}>
                {fmt(rfResult.bruto)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                IR ({rfResult.aliquotaPct.toFixed(1)}%)
              </span>
              <span className="font-medium text-red-400" style={MONO}>
                −{fmt(rfResult.ir)}
              </span>
            </div>
            <div className="border-t border-sky-500/10 pt-2.5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rendimento Líquido</span>
                <span className="font-bold text-sky-400" style={MONO}>
                  {fmt(rfResult.liquido)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montante Final</span>
                <span className="font-bold" style={MONO}>
                  {fmt(rfResult.montante)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly health summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Wallet size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={DISPLAY}>
              Saúde Financeira do Mês
            </h3>
            <p className="text-muted-foreground text-xs">
              Agosto 2026 — baseado nos dados cadastrados
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Renda", val: 12500, cls: "text-primary" },
            { label: "Despesas Fixas", val: 6267.5, cls: "text-foreground" },
            { label: "Gastos Variáveis", val: 2540, cls: "text-orange-400" },
            { label: "Saldo Livre", val: 3692.5, cls: "text-sky-400" },
          ].map((item) => (
            <div key={item.label} className="bg-secondary rounded-xl p-3.5">
              <div className={`text-xl font-bold ${item.cls}`} style={MONO}>
                {fmt(item.val)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
