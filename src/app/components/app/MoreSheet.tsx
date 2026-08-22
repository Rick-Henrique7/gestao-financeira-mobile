import { X } from "lucide-react";
import { secondaryNav } from "../../../lib/nav";
import { DISPLAY } from "../../../lib/styles";
import type { View } from "../../../types";

// ─── SHEET "MAIS" (ITENS SECUNDÁRIOS) ────────────────────────────────────────
export function MoreSheet({
  open,
  onOpenChange,
  current,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: View;
  onChange: (v: View) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 animate-in fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet content */}
      <div
        className="relative w-full max-w-md bg-card border-t border-border rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Handle bar (visual cue iOS-like) */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-sm" style={DISPLAY}>
            Mais opções
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Itens secundários */}
        <ul className="px-2 py-2 pb-4">
          {secondaryNav.map(({ id, label, Icon }) => {
            const active = current === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onChange(id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors text-left ${
                    active
                      ? "bg-secondary text-foreground font-medium"
                      : "text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-primary" : "text-muted-foreground"}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                      Atual
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
