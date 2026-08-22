import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Wallet, Target, ArrowUpRight } from "lucide-react";
import { fmt, fmtK } from "../lib/format";
import { MONO, DISPLAY, ttStyle } from "../lib/styles";
import { portfolio } from "../data/portfolio";
import { netWorthHistory } from "../data/netWorthHistory";
import { bills } from "../data/bills";

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export function DashboardView({ hide }: { hide: boolean }) {
  const totalNW = portfolio.reduce((s, p) => s + p.value, 0);
  const prevNW = 124300;
  const pct = ((totalNW - prevNW) / prevNW) * 100;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">
          Patrimônio Líquido
        </p>
        <div className="flex items-end gap-4 flex-wrap">
          <span className="text-5xl font-bold tracking-tight" style={MONO}>
            {hide ? "R$ ●●●●●●●●" : fmt(totalNW)}
          </span>
          <span className="flex items-center gap-1 text-primary text-sm mb-1 font-medium">
            <TrendingUp size={14} />
            +{pct.toFixed(1)}% este mês
          </span>
        </div>
        <p className="text-muted-foreground text-xs mt-2">
          Atualizado em 19 ago 2026 às 09:42
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Investimentos", val: 89200, Icon: TrendingUp, cls: "text-primary" },
          { label: "Contas Correntes", val: 8250, Icon: Wallet, cls: "text-sky-400" },
          { label: "Previdência", val: 30000, Icon: Target, cls: "text-violet-400" },
          { label: "Renda Mensal", val: 12500, Icon: ArrowUpRight, cls: "text-orange-400" },
        ].map(({ label, val, Icon, cls }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <Icon size={16} className={`${cls} mb-3`} />
            <div className="text-lg font-semibold" style={MONO}>
              {fmt(val, hide)}
            </div>
            <div className="text-muted-foreground text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={DISPLAY}>
              Evolução do Patrimônio
            </h3>
            <span className="text-xs text-muted-foreground">últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart
              data={netWorthHistory}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffe100" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffe100" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tick={{ fill: "#757575", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#757575", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtK}
                width={38}
              />
              <Tooltip
                {...ttStyle}
                formatter={(v: number) => [fmt(v), "Patrimônio"]}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#ffe100"
                strokeWidth={2}
                fill="url(#gradG)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3" style={DISPLAY}>
            Alocação
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={portfolio}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={64}
                dataKey="value"
                strokeWidth={0}
              >
                {portfolio.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {portfolio.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: p.color }}
                  />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <span style={MONO}>
                  {hide ? "••%" : `${((p.value / totalNW) * 100).toFixed(0)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming bills */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={DISPLAY}>
            Próximos Vencimentos
          </h3>
          <span className="text-xs text-muted-foreground">Setembro 2026</span>
        </div>
        <div>
          {bills
            .filter((b) => b.status === "pendente")
            .slice(0, 5)
            .map((b, i, arr) => (
              <div
                key={b.id}
                className={`flex items-center justify-between py-3 ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <div className="text-sm">{b.desc}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.cat} · vence {b.vence}
                  </div>
                </div>
                <div className="text-sm font-medium" style={MONO}>
                  {fmt(b.valor, hide)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
