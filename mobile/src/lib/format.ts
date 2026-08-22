// ─── HELPERS DE FORMATAÇÃO (BR) ───────────────────────────────────────────────
const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const fmt = (n: number, hide = false): string =>
  hide ? 'R$ ••••••' : brl.format(n);

export const fmtK = (v: number): string =>
  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
