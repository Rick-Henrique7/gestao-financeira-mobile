import { useState } from "react";
import { primaryNav, secondaryNav } from "../../../lib/nav";
import type { View } from "../../../types";
import { MoreSheet } from "./MoreSheet";

// ─── BOTTOM TAB BAR ──────────────────────────────────────────────────────────
export function BottomTabBar({
  current,
  onChange,
}: {
  current: View;
  onChange: (v: View) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border"
        role="navigation"
        aria-label="Navegação principal"
      >
        <ul className="flex items-stretch justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {primaryNav.map(({ id, label, Icon }) => {
            const active = current === id;
            return (
              <li key={id} className="flex-1 min-w-0">
                <button
                  onClick={() => onChange(id)}
                  className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                  <span className="text-[10px] font-medium truncate max-w-full">
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
          {/* Tab "Mais" — abre sheet com itens secundários */}
          <li className="flex-1 min-w-0">
            <button
              onClick={() => setMoreOpen(true)}
              className="w-full flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </li>
        </ul>
      </nav>

      <MoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        current={current}
        onChange={(v) => {
          onChange(v);
          setMoreOpen(false);
        }}
      />
    </>
  );
}
