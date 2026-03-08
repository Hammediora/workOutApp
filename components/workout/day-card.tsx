// components/workout/day-card.tsx
"use client";

import { useState } from "react";
import type { GeneratedWorkoutDay } from "@/lib/workout/types";
import { ClockIcon, ChevronIcon } from "./icons";
import { PhaseCard } from "./phase-card";
import { ExerciseRow } from "./exercise-row";

interface DayCardProps {
  day: GeneratedWorkoutDay;
  defaultOpen: boolean;
  onSwap: (dayIndex: number, exerciseIndex: number) => void;
  swappingId: string | null;
}

export function DayCard({ day, defaultOpen, onSwap, swappingId }: DayCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className={[
      "rounded-2xl border transition-all duration-200",
      expanded ? "border-border bg-card shadow-sm" : "border-border/50 hover:border-border",
    ].join(" ")}>
      {/* Header */}
      <button
        type="button"
        className="w-full text-left p-5 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] text-foreground text-xs font-bold flex items-center justify-center shrink-0">
            D{day.dayIndex + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight truncate">{day.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{day.focus} · {day.exercises.length} exercises</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="w-3.5 h-3.5" />
            {day.totalMinutes} min
          </span>
          <ChevronIcon className="w-4 h-4 text-muted-foreground" expanded={expanded} />
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/40 space-y-5 pt-5">
          {/* Warm-up */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2">
              Warm-Up
            </p>
            <PhaseCard
              label={day.warmup.label}
              duration={day.warmup.durationMinutes}
              description={day.warmup.description}
              items={day.warmup.items}
            />
          </div>

          {/* Working sets */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1">
              Working Sets
            </p>
            <div className="divide-y divide-border/40">
              {day.exercises.map((ex, i) => (
                <ExerciseRow
                  key={`${ex.exerciseId}-${i}`}
                  exercise={ex}
                  index={i}
                  dayIndex={day.dayIndex}
                  onSwap={onSwap}
                  isSwapping={swappingId === `${day.dayIndex}-${i}`}
                />
              ))}
            </div>
          </div>

          {/* Conditioning (optional) */}
          {day.conditioning && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2">
                Conditioning
              </p>
              <PhaseCard
                label={day.conditioning.label}
                duration={day.conditioning.durationMinutes}
                description={day.conditioning.description}
                items={day.conditioning.items}
              />
            </div>
          )}

          {/* Cool-down */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2">
              Cool-Down
            </p>
            <PhaseCard
              label={day.cooldown.label}
              duration={day.cooldown.durationMinutes}
              description={day.cooldown.description}
              items={day.cooldown.items}
            />
          </div>
        </div>
      )}
    </div>
  );
}
