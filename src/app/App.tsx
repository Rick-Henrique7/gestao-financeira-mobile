import { useState } from "react";
import { Eye, EyeOff, Bell } from "lucide-react";
import { BottomTabBar } from "./components/app/BottomTabBar";
import { viewTitles } from "../lib/nav";
import { DISPLAY } from "../lib/styles";
import { DashboardView } from "../views/DashboardView";
import { IRPFView } from "../views/IRPFView";
import { EmprestimosView } from "../views/EmprestimosView";
import { ContasView } from "../views/ContasView";
import { OrcamentoView } from "../views/OrcamentoView";
import { MetasView } from "../views/MetasView";
import { AssinaturasView } from "../views/AssinaturasView";
import { SimulacoesView } from "../views/SimulacoesView";
import type { View } from "../types";

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [hide, setHide] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md px-4 py-3.5 flex items-center gap-3">
        <h1 className="text-sm font-semibold flex-1" style={DISPLAY}>
          {viewTitles[view]}
        </h1>
        <button
          onClick={() => setHide((h) => !h)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title={hide ? "Mostrar valores" : "Ocultar valores"}
        >
          {hide ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <Bell size={17} />
        </button>
      </header>

      {/* Main content — pb-20 deixa espaço pra tab bar fixa no rodapé */}
      <main className="p-4 pb-24 overflow-y-auto">
        {view === "dashboard" && <DashboardView hide={hide} />}
        {view === "irpf" && <IRPFView />}
        {view === "emprestimos" && <EmprestimosView hide={hide} />}
        {view === "contas" && <ContasView hide={hide} />}
        {view === "orcamento" && <OrcamentoView hide={hide} />}
        {view === "metas" && <MetasView hide={hide} />}
        {view === "assinaturas" && <AssinaturasView hide={hide} />}
        {view === "simulacoes" && <SimulacoesView />}
      </main>

      <BottomTabBar current={view} onChange={setView} />
    </div>
  );
}
