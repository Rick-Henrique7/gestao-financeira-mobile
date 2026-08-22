import { Plus } from "lucide-react";

// ─── SECTION BUTTON ──────────────────────────────────────────────────────────
export function SectionBtn({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-primary border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
    >
      <Plus size={12} />
      {label}
    </button>
  );
}
