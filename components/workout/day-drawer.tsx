// components/workout/day-drawer.tsx
"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { GeneratedWorkoutDay } from "@/lib/workout/types";
import { ClockIcon, ChevronRightIcon } from "./icons";
import { PhaseCard } from "./phase-card";
import { ExerciseRow } from "./exercise-row";

interface DayDrawerProps {
  day: GeneratedWorkoutDay;
  onSwap: (dayIndex: number, exerciseIndex: number) => void;
  swappingId: string | null;
}

export function DayDrawer({ day, onSwap, swappingId }: DayDrawerProps) {
  return (
    <Drawer>
      {/* Trigger — the day row in the schedule */}
      <DrawerTrigger asChild>
        <button
          type="button"
          className="w-full text-left rounded-2xl border border-border/50 p-5 flex items-center justify-between gap-4 hover:border-border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] text-foreground text-xs font-bold flex items-center justify-center shrink-0">
              D{day.dayIndex + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight truncate">{day.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {day.focus} · {day.exercises.length} exercises
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
            <span className="text-xs tabular-nums">{day.totalMinutes} min</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>
        </button>
      </DrawerTrigger>

      {/* Bottom sheet content */}
      <DrawerContent className="max-h-[92vh]">
        {/* Drawer header */}
        <DrawerHeader className="text-left border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] text-foreground text-xs font-bold flex items-center justify-center shrink-0">
              D{day.dayIndex + 1}
            </div>
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold tracking-tight">
                {day.name}
              </DrawerTitle>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3" />
                {day.totalMinutes} min · {day.exercises.length} exercises
              </p>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 pb-8 space-y-5 pt-5">
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
      </DrawerContent>
    </Drawer>
  );
}
