import type { IRPFRecord } from "../types";

export const irpfData: Record<string, IRPFRecord[]> = {
  "Renda Variável": [
    { desc: "Informe PETR4 — XP Investimentos", data: "15/03/2026", tipo: "Ação", ok: true },
    { desc: "Informe VALE3 — Rico Investimentos", data: "15/03/2026", tipo: "Ação", ok: true },
    { desc: "Informe HGLG11 (FII) — Nubank", data: "—", tipo: "FII", ok: false },
    { desc: "Notas de Corretagem Jan–Jun 2026", data: "—", tipo: "Corretagem", ok: false },
  ],
  Rendimentos: [
    { desc: "Informe — Empresa ABC Ltda (CNPJ 12.345.678/0001-99)", data: "28/02/2026", tipo: "Salário", ok: true },
    { desc: "Extrato Dividendos — Banco Safra", data: "10/03/2026", tipo: "Dividendo", ok: true },
    { desc: "Rendimentos de Poupança — Caixa Federal", data: "—", tipo: "Poupança", ok: false },
  ],
  "Bens e Direitos": [
    { desc: "IPTU 2026 — Rua das Flores, 123 — São Paulo/SP", data: "05/01/2026", tipo: "Imóvel", ok: true },
    { desc: "CRLV 2026 — Honda Civic 2023 (EXL 2.0)", data: "—", tipo: "Veículo", ok: false },
  ],
  Deduções: [
    { desc: "Recibos Médicos — Dr. Ricardo Alves (CRM 12.345/SP)", data: "Vários", tipo: "Saúde", ok: true },
    { desc: "Comprovante Plano Unimed Gold", data: "12/03/2026", tipo: "Saúde", ok: true },
    { desc: "Recibo Escola Particular — Gabriel Silva (2026)", data: "—", tipo: "Educação", ok: false },
    { desc: "Declaração PGBL — Bradesco Previdência", data: "—", tipo: "Previdência", ok: false },
  ],
};
