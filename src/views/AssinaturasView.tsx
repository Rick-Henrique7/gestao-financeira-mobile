import { SectionBtn } from "../app/components/app/SectionBtn";
import { fmt } from "../lib/format";
import { MONO } from "../lib/styles";
import { subs } from "../data/subscriptions";

// ─── ASSINATURAS ─────────────────────────────────────────────────────────────
export function AssinaturasView({ hide }: { hide: boolean }) {
  const totalMensal = subs.reduce((s, sub) => s + sub.valor, 0);
  const totalAnual = totalMensal * 12;

  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              Cofre de Assinaturas
            </p>
            <div className="text-4xl font-bold" style={MONO}>
              {fmt(totalAnual, hide)}
              <span className="text-lg text-muted-foreground font-normal">/ano</span>
            </div>
            <p className="text-muted-foreground text-xs mt-1.5">
              {fmt(totalMensal, hide)} por mês · {subs.length} assinaturas ativas
            </p>
          </div>
          <SectionBtn label="Adicionar" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subs.map((sub) => (
          <div
            key={sub.id}
            className="bg-card border border-border rounded-2xl p-4 hover:border-white/10 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-3"
              style={{ background: sub.bg }}
            >
              {sub.ini}
            </div>
            <div className="font-semibold text-sm">{sub.nome}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{sub.cat}</div>
            <div className="mt-3 font-semibold text-primary" style={MONO}>
              {fmt(sub.valor, hide)}
              <span className="text-muted-foreground font-normal text-xs">/mês</span>
            </div>
            <div className="text-muted-foreground text-xs mt-0.5" style={MONO}>
              {hide ? "R$ ••••••/ano" : fmt(sub.valor * 12) + "/ano"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
