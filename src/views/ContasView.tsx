import { Badge } from "../app/components/app/Badge";
import { SectionBtn } from "../app/components/app/SectionBtn";
import { fmt } from "../lib/format";
import { MONO, DISPLAY } from "../lib/styles";
import { bills } from "../data/bills";

// ─── CONTAS A PAGAR ──────────────────────────────────────────────────────────
export function ContasView({ hide }: { hide: boolean }) {
  const pendentes = bills.filter((b) => b.status === "pendente");
  const pagas = bills.filter((b) => b.status === "pago");
  const totalPendente = pendentes.reduce((s, b) => s + b.valor, 0);
  const totalPago = pagas.reduce((s, b) => s + b.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-muted-foreground text-xs mb-1">
            A pagar em setembro
          </div>
          <div className="text-2xl font-bold mt-1" style={MONO}>
            {fmt(totalPendente, hide)}
          </div>
          <div className="text-xs text-amber-400 mt-1.5 font-medium">
            {pendentes.length} contas pendentes
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-muted-foreground text-xs mb-1">Já pago no mês</div>
          <div className="text-2xl font-bold text-primary mt-1" style={MONO}>
            {fmt(totalPago, hide)}
          </div>
          <div className="text-xs text-green-400 mt-1.5 font-medium">
            {pagas.length} {pagas.length === 1 ? "conta quitada" : "contas quitadas"}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold" style={DISPLAY}>
            Pendentes
          </h3>
          <SectionBtn label="Adicionar" />
        </div>
        <div className="divide-y divide-border">
          {pendentes.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm">{b.desc}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {b.cat} · vence {b.vence}/2026
                </div>
              </div>
              <div className="text-sm font-semibold" style={MONO}>
                {fmt(b.valor, hide)}
              </div>
              <Badge status="pendente" />
            </div>
          ))}
        </div>
      </div>

      {pagas.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground" style={DISPLAY}>
              Quitadas
            </h3>
          </div>
          <div className="divide-y divide-border">
            {pagas.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 px-5 py-3.5 opacity-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm line-through">{b.desc}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.cat} · venceu {b.vence}/2026
                  </div>
                </div>
                <div className="text-sm font-semibold" style={MONO}>
                  {fmt(b.valor, hide)}
                </div>
                <Badge status="pago" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
