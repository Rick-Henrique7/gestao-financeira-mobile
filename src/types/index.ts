// ─── TYPES ───────────────────────────────────────────────────────────────────
export type View =
  | "dashboard"
  | "irpf"
  | "emprestimos"
  | "contas"
  | "orcamento"
  | "metas"
  | "assinaturas"
  | "simulacoes";

export type LoanStatus = "pendente" | "pago" | "atrasado";
export type BillStatus = "pendente" | "pago";

export interface Loan {
  id: number;
  devedor: string;
  valor: number;
  parcela: string;
  vence: string;
  status: LoanStatus;
}

export interface Bill {
  id: number;
  desc: string;
  valor: number;
  vence: string;
  status: BillStatus;
  cat: string;
}

export interface Goal {
  id: number;
  nome: string;
  atual: number;
  meta: number;
  prazo: string;
  color: string;
  months: number;
}

export interface Subscription {
  id: number;
  nome: string;
  valor: number;
  cat: string;
  bg: string;
  ini: string;
}

export interface BudgetItem {
  cat: string;
  gasto: number;
  limite: number;
}

export interface NetWorthPoint {
  mes: string;
  valor: number;
}

export interface PortfolioItem {
  name: string;
  value: number;
  color: string;
}

export interface IRPFRecord {
  desc: string;
  data: string;
  tipo: string;
  ok: boolean;
}
