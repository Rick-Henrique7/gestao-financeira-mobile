import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmt, fmtK } from "../lib/format";
import { MONO, DISPLAY, ttStyle } from "../lib/styles";
import { budgetData } from "../data/budgetData";

// ─── ORÇAMENTO ───────────────────────────────────────────────────────────────
export function OrcamentoView({ hide }: { hide: boolean }) {
  const totalGasto = budgetData.reduce((s, b) => s + b.gasto, 0);
  const totalLimite = budgetData.reduce((s, b) => s + b.limite, 0);
  const usedPct = (totalGasto / totalLimite) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground text-xs">Gasto total — Agosto 2026</p>
            <div className="text-3xl font-bold mt-1" style={MONO}>
              {fmt(totalGasto, hide)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Orçamento mensal</p>
            <div
              className="text-xl font-semibold text-muted-foreground mt-1"
              style={MONO}
            >
              {fmt(totalLimite, hide)}
            </div>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div
            className={`rounded-full h-2.5 transition-all duration-500 ${
              usedPct > 95 ? "bg-red-400" : usedPct > 80 ? "bg-amber-400" : "bg-primary"
            }`}
            style={{ width: `${Math.min(usedPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {usedPct.toFixed(0)}% do orçamento utilizado
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={DISPLAY}>
          Gasto por Categoria
        </h3>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={budgetData}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 64, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "#757575", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtK}
            />
            <YAxis
              type="category"
              dataKey="cat"
              tick={{ fill: "#757575", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={62}
            />
            <Tooltip {...ttStyle} formatter={(v: number) => [fmt(v), ""]} />
            <Bar
              dataKey="limite"
              fill="rgba(255,255,255,0.05)"
              radius={[0, 4, 4, 0]}
              barSize={10}
            />
            <Bar dataKey="gasto" radius={[0, 4, 4, 0]} barSize={10}>
              {budgetData.map((b, i) => {
                const p = b.gasto / b.limite;
                return (
                  <Cell
                    key={i}
                    fill={p > 1 ? "#e8395a" : p > 0.85 ? "#f59e0b" : "#00c47a"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={DISPLAY}>
          Detalhamento por Categoria
        </h3>
        <div className="space-y-4">
          {budgetData.map((b) => {
            const p = b.gasto / b.limite;
            const over = b.gasto > b.limite;
            return (
              <div key={b.cat}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{b.cat}</span>
                  <div className="flex items-center gap-2">
                    <span
                      style={MONO}
                      className={over ? "text-red-400 font-semibold" : "font-medium"}
                    >
                      {fmt(b.gasto, hide)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      / {fmt(b.limite, hide)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className={`rounded-full h-1.5 transition-all ${
                      over ? "bg-red-400" : p > 0.85 ? "bg-amber-400" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(p * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
