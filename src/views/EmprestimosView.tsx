import { Badge } from "../app/components/app/Badge";
import { SectionBtn } from "../app/components/app/SectionBtn";
import { fmt } from "../lib/format";
import { MONO, DISPLAY } from "../lib/styles";
import { loans } from "../data/loans";

// ─── EMPRÉSTIMOS ─────────────────────────────────────────────────────────────
export function EmprestimosView({ hide }: { hide: boolean }) {
  const totalPendente = loans
    .filter((l) => l.status !== "pago")
    .reduce((s, l) => s + l.valor, 0);
  const totalPago = loans
    .filter((l) => l.status === "pago")
    .reduce((s, l) => s + l.valor, 0);
  const totalAtrasado = loans
    .filter((l) => l.status === "atrasado")
    .reduce((s, l) => s + l.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "A Receber", val: totalPendente, cls: "text-foreground" },
          { label: "Já Recebido", val: totalPago, cls: "text-green-400" },
          { label: "Em Atraso", val: totalAtrasado, cls: "text-red-400" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`text-xl font-bold ${c.cls}`} style={MONO}>
              {fmt(c.val, hide)}
            </div>
            <div className="text-muted-foreground text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold" style={DISPLAY}>
            Empréstimos Pessoais
          </h3>
          <SectionBtn label="Novo" />
        </div>
        <div className="divide-y divide-border">
          {loans.map((loan) => {
            const initials = loan.devedor
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");
            return (
              <div
                key={loan.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{loan.devedor}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Parcela {loan.parcela} · vence {loan.vence}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm font-semibold" style={MONO}>
                    {fmt(loan.valor, hide)}
                  </div>
                  <Badge status={loan.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
