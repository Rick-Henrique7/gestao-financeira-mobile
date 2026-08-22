import {
  LayoutDashboard,
  Receipt,
  BarChart2,
  Tv,
  FileText,
  CreditCard,
  Target,
  Calculator,
  MoreHorizontal,
} from "lucide-react";
import type { View } from "../types";

// ─── TABS PRIMÁRIAS (BOTTOM TAB BAR) ─────────────────────────────────────────
// Os 4 itens mais usados no dia a dia. Aparecem sempre no rodapé.
export const primaryNav = [
  { id: "dashboard", label: "Início", Icon: LayoutDashboard },
  { id: "contas", label: "Contas", Icon: Receipt },
  { id: "orcamento", label: "Orçamento", Icon: BarChart2 },
  { id: "assinaturas", label: "Assinaturas", Icon: Tv },
] as const satisfies ReadonlyArray<{ id: View; label: string; Icon: typeof LayoutDashboard }>;

// ─── TABS SECUNDÁRIAS (SHEET "MAIS") ─────────────────────────────────────────
// Os 4 itens menos frequentes. Acessíveis via botão "Mais".
export const secondaryNav = [
  { id: "irpf", label: "IRPF 2026", Icon: FileText },
  { id: "emprestimos", label: "Empréstimos", Icon: CreditCard },
  { id: "metas", label: "Metas & Cofrinhos", Icon: Target },
  { id: "simulacoes", label: "Simulações", Icon: Calculator },
] as const satisfies ReadonlyArray<{ id: View; label: string; Icon: typeof LayoutDashboard }>;

// ─── TUDO (lookup) ───────────────────────────────────────────────────────────
export const allNavItems = [...primaryNav, ...secondaryNav] as const;

// ─── ÍCONE DA TAB "MAIS" ──────────────────────────────────────────────────────
export const MoreIcon = MoreHorizontal;

// ─── TÍTULOS DO TOPBAR ────────────────────────────────────────────────────────
export const viewTitles: Record<View, string> = {
  dashboard: "Início",
  irpf: "IRPF 2026",
  emprestimos: "Empréstimos",
  contas: "Contas a Pagar",
  orcamento: "Orçamento & Gastos",
  metas: "Metas & Cofrinhos",
  assinaturas: "Cofre de Assinaturas",
  simulacoes: "Simulações & Calculadoras",
};
