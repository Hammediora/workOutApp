// app/workout/[id]/client.tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getSwapCandidates, swapWorkoutExercise } from "../actions";
import { Exercise, WorkoutExercise } from "@prisma/client";
import { cn } from "@/lib/utils";

type FullWorkoutExercise = WorkoutExercise & { exercise: Exercise };

export function WorkoutDayClient({
  workoutDayId,
  initialExercises,
}: {
  workoutDayId: string;
  initialExercises: FullWorkoutExercise[];
}) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState<string | null>(null);
  const [swapCandidates, setSwapCandidates] = useState<Exercise[]>([]);
  const [loadingSwaps, setLoadingSwaps] = useState(false);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = initialExercises.length > 0 && completedCount === initialExercises.length;

  const toggleCheck = (id: string, checked: boolean) =>
    setCompleted((prev) => ({ ...prev, [id]: checked }));

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setIsSwapping(null);
  };

  const initSwap = async (item: FullWorkoutExercise) => {
    setIsSwapping(item.id);
    setLoadingSwaps(true);
    try {
      // @ts-ignore
      const candidates = await getSwapCandidates(item.exercise.movementPattern);
      setSwapCandidates(candidates.filter((c) => c.id !== item.exercise.id));
    } finally {
      setLoadingSwaps(false);
    }
  };

  const confirmSwap = async (workoutExerciseId: string, newExerciseId: string) => {
    await swapWorkoutExercise(workoutExerciseId, newExerciseId, workoutDayId);
    setIsSwapping(null);
  };

  return (
    <div className="space-y-6">

      {/* Session header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Working sets
        </p>
        {initialExercises.length > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {allDone ? "Session complete" : `${completedCount} / ${initialExercises.length} done`}
          </p>
        )}
      </div>

      {/* Progression reminder */}
      <div className="pl-4 border-l-2 border-foreground/20">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {allDone
            ? "Rest, eat your protein, and show up heavier next time."
            : "Beat last week's weight by 5 lbs on every lift. Log it."
          }
        </p>
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {initialExercises.map((item) => {
          const isChecked = completed[item.id] ?? false;
          const isExpanded = expandedId === item.id;
          const swappingThis = isSwapping === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isChecked
                  ? "border-border/30 bg-muted/20 opacity-60"
                  : isExpanded
                  ? "border-border shadow-sm"
                  : "border-border/60 hover:border-border"
              )}
            >
              <div className="flex items-center p-4 gap-3">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(c) => toggleCheck(item.id, c as boolean)}
                  className="w-5 h-5 shrink-0"
                />
                <div
                  className="flex-1 cursor-pointer select-none min-w-0"
                  onClick={() => toggleExpand(item.id)}
                >
                  <p className={cn("text-sm font-semibold tracking-tight truncate", isChecked && "line-through text-muted-foreground")}>
                    {item.exercise.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                    {item.sets} sets × {item.reps} reps · {item.restSeconds}s rest
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs text-muted-foreground"
                  onClick={() => toggleExpand(item.id)}
                >
                  {isExpanded ? "Close" : "Details"}
                </Button>
              </div>

              {/* Details */}
              {isExpanded && !swappingThis && (
                <div className="px-4 pb-4 border-t border-border/40 pt-4">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {item.exercise.gifUrl && (
                      <div className="sm:w-28 aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted/20 shrink-0">
                        <img
                          src={item.exercise.gifUrl}
                          alt={item.exercise.name}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {item.exercise.target}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {item.exercise.equipment}
                        </span>
                      </div>
                      {item.exercise.instructions && (
                        <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 marker:text-foreground/30">
                          {item.exercise.instructions.slice(0, 3).map((inst, i) => (
                            <li key={i} className="leading-relaxed">{inst}</li>
                          ))}
                        </ol>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initSwap(item)}
                      >
                        Swap Exercise
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Swap view */}
              {isExpanded && swappingThis && (
                <div className="p-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold">Select replacement</p>
                    <Button variant="ghost" size="sm" onClick={() => setIsSwapping(null)}>Cancel</Button>
                  </div>
                  {loadingSwaps ? (
                    <p className="text-sm text-muted-foreground">Finding alternatives…</p>
                  ) : swapCandidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No alternatives found.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {swapCandidates.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => confirmSwap(item.id, c.id)}
                          className="flex items-center text-left p-3 rounded-lg border border-border/60 hover:border-border transition-colors"
                        >
                          {c.gifUrl && (
                            <img src={c.gifUrl} className="w-10 h-10 rounded object-cover mr-3 shrink-0" alt={c.name} />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.equipment}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
