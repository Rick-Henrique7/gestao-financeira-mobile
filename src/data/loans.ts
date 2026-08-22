import type { Loan } from "../types";

export const loans: Loan[] = [
  { id: 1, devedor: "João Cavalcanti", valor: 2500, parcela: "2/3", vence: "15/09/2026", status: "pendente" },
  { id: 2, devedor: "Maria Lopes", valor: 800, parcela: "3/3", vence: "01/08/2026", status: "pago" },
  { id: 3, devedor: "Rafael Torres", valor: 1200, parcela: "1/6", vence: "20/09/2026", status: "atrasado" },
  { id: 4, devedor: "Camila Ferreira", valor: 350, parcela: "1/1", vence: "30/09/2026", status: "pendente" },
];
