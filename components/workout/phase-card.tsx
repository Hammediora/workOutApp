// components/workout/phase-card.tsx
"use client";

import { useState } from "react";
import { ChevronIcon } from "./icons";

interface PhaseCardProps {
  label: string;
  duration: number;
  description: string;
  items: string[];
}

export function PhaseCard({ label, duration, description, items }: PhaseCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-xl border border-border/60 p-4 transition-colors duration-200 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-expanded={open}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight truncate">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">{duration} min</span>
          <ChevronIcon className="w-4 h-4 text-muted-foreground" expanded={open} />
        </div>
      </div>

      {open && items.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-foreground/30">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}
