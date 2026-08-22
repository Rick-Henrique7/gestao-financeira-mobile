import type { Bill } from "../types";

export const bills: Bill[] = [
  { id: 1, desc: "Aluguel", valor: 2200, vence: "05/09", status: "pendente", cat: "Moradia" },
  { id: 2, desc: "Internet Vivo Fibra", valor: 119.9, vence: "10/09", status: "pendente", cat: "Utilidades" },
  { id: 3, desc: "Energia CEMIG", valor: 287.5, vence: "12/09", status: "pendente", cat: "Utilidades" },
  { id: 4, desc: "Condomínio", valor: 580, vence: "15/09", status: "pendente", cat: "Moradia" },
  { id: 5, desc: "Smart Fit", valor: 99.9, vence: "18/09", status: "pendente", cat: "Saúde" },
  { id: 6, desc: "IPTU — parcela 8/10", valor: 340, vence: "20/09", status: "pendente", cat: "Impostos" },
  { id: 7, desc: "Plano Unimed", valor: 890, vence: "25/09", status: "pendente", cat: "Saúde" },
  { id: 8, desc: "Fatura Nubank", valor: 1250, vence: "03/09", status: "pago", cat: "Cartão" },
];
