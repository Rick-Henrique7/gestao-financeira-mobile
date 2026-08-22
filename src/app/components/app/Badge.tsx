// ─── BADGE ───────────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  pago: "bg-green-500/15 text-green-400",
  anexado: "bg-green-500/15 text-green-400",
  pendente: "bg-primary/15 text-primary",
  atrasado: "bg-red-500/15 text-red-400",
};

const labelMap: Record<string, string> = {
  pago: "Pago",
  anexado: "Anexado",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
        colorMap[status] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      {labelMap[status] ?? status}
    </span>
  );
}
