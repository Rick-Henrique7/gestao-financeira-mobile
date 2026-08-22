import { useState } from "react";
import { CheckCircle2, Clock, Download, Plus } from "lucide-react";
import { Badge } from "../app/components/app/Badge";
import { DISPLAY } from "../lib/styles";
import { irpfData } from "../data/irpfData";

// ─── IRPF ────────────────────────────────────────────────────────────────────
export function IRPFView() {
  const [tab, setTab] = useState<string>("Renda Variável");
  const tabs = Object.keys(irpfData);
  const allDocs = Object.values(irpfData).flat();
  const done = allDocs.filter((d) => d.ok).length;
  const total = allDocs.length;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold" style={DISPLAY}>
              IRPF 2026 — Exercício 2026
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              {done} de {total} comprovantes anexados
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-primary border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            <Download size={12} />
            Exportar ZIP
          </button>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mb-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso: {((done / total) * 100).toFixed(0)}%</span>
          <span>Prazo final: 30/04/2027</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const pending = irpfData[t].filter((d) => !d.ok).length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  active
                    ? "text-primary border-b-2 border-primary font-medium -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    pending > 0
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {pending > 0 ? pending : "✓"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-1.5">
          {(irpfData[tab] ?? []).map((doc, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  doc.ok
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {doc.ok ? <CheckCircle2 size={15} /> : <Clock size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-snug">{doc.desc}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{doc.tipo}</span>
                  {doc.data !== "—" && (
                    <span className="text-xs text-muted-foreground">{doc.data}</span>
                  )}
                </div>
              </div>
              <Badge status={doc.ok ? "anexado" : "pendente"} />
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
            <Plus size={14} />
            Adicionar comprovante
          </button>
        </div>
      </div>
    </div>
  );
}
