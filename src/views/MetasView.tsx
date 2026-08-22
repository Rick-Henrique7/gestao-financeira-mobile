import { SectionBtn } from "../app/components/app/SectionBtn";
import { fmt } from "../lib/format";
import { MONO, DISPLAY } from "../lib/styles";
import { goals } from "../data/goals";

// ─── METAS ───────────────────────────────────────────────────────────────────
export function MetasView({ hide }: { hide: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={DISPLAY}>
            Metas & Cofrinhos
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {goals.length} objetivos ativos
          </p>
        </div>
        <SectionBtn label="Nova Meta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = (g.atual / g.meta) * 100;
          const remaining = g.meta - g.atual;
          const monthly = remaining / g.months;
          return (
            <div
              key={g.id}
              className="bg-card border border-border rounded-2xl p-5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-5 gap-2">
                <h3 className="font-semibold leading-snug" style={DISPLAY}>
                  {g.nome}
                </h3>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  Prazo: {g.prazo}
                </span>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold" style={MONO}>
                    {fmt(g.atual, hide)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    de {fmt(g.meta, hide)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold"
                    style={{ ...MONO, color: g.color }}
                  >
                    {pct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">concluído</div>
                </div>
              </div>

              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div
                  className="rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%`, background: g.color }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Faltam {fmt(remaining, hide)}</span>
                <span>
                  Sugestão mensal:{" "}
                  <span className="text-foreground font-semibold" style={MONO}>
                    {fmt(monthly, hide)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
