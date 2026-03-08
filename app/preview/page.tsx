// app/preview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePlan, getAlternativeExercise } from "@/app/onboarding/actions";
import type { GeneratedWorkoutProgram } from "@/lib/workout/types";
import { ClockIcon } from "@/components/workout/icons";
import { DayCard } from "@/components/workout/day-card";
import { DayDrawer } from "@/components/workout/day-drawer";
import { ProgressionNote } from "@/components/workout/progression-note";

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  strength: "Strength",
  general_fitness: "General Fitness",
};

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildSchedule(program: GeneratedWorkoutProgram) {
  const len = program.days.length;
  return WEEK_DAYS.map((dayName, index) => {
    let workoutDay = null;
    if (len === 2 && (index === 0 || index === 3)) workoutDay = program.days[index === 0 ? 0 : 1];
    if (len === 3 && (index === 0 || index === 2 || index === 4)) workoutDay = program.days[index === 0 ? 0 : index === 2 ? 1 : 2];
    if (len === 4 && (index === 0 || index === 1 || index === 3 || index === 4)) workoutDay = program.days[index === 0 ? 0 : index === 1 ? 1 : index === 3 ? 2 : 3];
    if (len === 5 && index !== 2 && index !== 6) {
      const dayMap: (number | null)[] = [0, 1, null, 2, 3, 4, null];
      const mapped = dayMap[index];
      if (mapped !== null) workoutDay = program.days[mapped];
    }
    if (len === 6 && index !== 6) workoutDay = program.days[index];
    return { dayName, workoutDay };
  });
}

export default function PreviewPage() {
  const router = useRouter();
  const [program, setProgram] = useState<GeneratedWorkoutProgram | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("workoutPreview");
    if (!stored) { router.replace("/onboarding"); return; }
    setProgram(JSON.parse(stored));
  }, [router]);

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Building your plan…</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try { await savePlan(program); } catch { setIsSaving(false); }
  };

  const handleSwap = async (dayIndex: number, exerciseIndex: number) => {
    const day = program.days[dayIndex];
    const exercise = day.exercises[exerciseIndex];
    const swapKey = `${dayIndex}-${exerciseIndex}`;
    setSwappingId(swapKey);
    try {
      const alreadyUsedIds = program.days.flatMap(d => d.exercises.map(e => e.exerciseId));
      const newEx = await getAlternativeExercise({
        movementPattern: exercise.movementPattern,
        currentExerciseId: exercise.exerciseId,
        goal: program.goal,
        experienceLevel: program.experience,
        location: "gym",
        daysPerWeek: program.days.length,
        alreadyUsedIds,
      });
      if (newEx) {
        const updated = { ...program };
        updated.days[dayIndex].exercises[exerciseIndex] = { ...newEx, orderIndex: exercise.orderIndex };
        setProgram(updated);
        sessionStorage.setItem("workoutPreview", JSON.stringify(updated));
      }
    } finally {
      setSwappingId(null);
    }
  };

  const schedule = buildSchedule(program);
  const totalMinutes = program.days.reduce((sum, d) => sum + d.totalMinutes, 0);
  const totalExercises = program.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const goalLabel = GOAL_LABELS[program.goal] ?? program.goal;

  return (
    <div className="space-y-12 pb-16 pt-4">

      {/* Page header */}
      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Your program
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {program.days.length}-Day {goalLabel} Program
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
          {program.days.length} training days, {7 - program.days.length} rest days.
          Starting Monday with {schedule[0].workoutDay?.focus ?? "Active Recovery"}.
          Use the Swap button if an exercise doesn't suit your equipment.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5" />
            {totalMinutes} min / week
          </span>
          <span>{totalExercises} exercises</span>
          <span className="capitalize">{program.experience}</span>
        </div>
      </div>

      {/* Progressive overload */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          How to progress
        </p>
        <ProgressionNote goal={program.goal} />
      </div>

      {/* Weekly schedule */}
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Weekly schedule
        </p>
        {schedule.map((item, i) => (
          item.workoutDay ? (
            <div key={i} className="relative">
              <div className="absolute -left-1 sm:-left-4 top-5 uppercase tracking-widest text-[9px] font-bold text-muted-foreground/30 rotate-180 [writing-mode:vertical-rl] h-max select-none">
                {item.dayName}
              </div>
              <div className="ml-6 sm:ml-8">
                {/* Mobile: bottom sheet drawer */}
                <div className="md:hidden">
                  <DayDrawer
                    day={item.workoutDay}
                    onSwap={handleSwap}
                    swappingId={swappingId}
                  />
                </div>
                {/* Desktop: inline accordion */}
                <div className="hidden md:block">
                  <DayCard
                    day={item.workoutDay}
                    defaultOpen={i === 0}
                    onSwap={handleSwap}
                    swappingId={swappingId}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="relative">
              <div className="absolute -left-1 sm:-left-4 top-5 uppercase tracking-widest text-[9px] font-bold text-muted-foreground/30 rotate-180 [writing-mode:vertical-rl] h-max select-none">
                {item.dayName}
              </div>
              <div className="ml-6 sm:ml-8">
                <div className="rounded-2xl border border-dashed border-border/40 px-5 py-4">
                  <p className="text-sm font-medium text-muted-foreground">Rest Day</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Recovery, protein, mobility.</p>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-border p-5 sm:p-8 space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Ready to train
          </p>
          <h2 className="text-xl font-semibold tracking-tight mt-1">Save this program</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          Sign in to save your plan, track weights each session, and log progress week by week.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Button size="lg" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto sm:min-w-[180px]">
            {isSaving ? "Saving…" : "Sign in & Save Plan"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              sessionStorage.removeItem("workoutPreview");
              router.push("/onboarding");
            }}
          >
            Regenerate
          </Button>
        </div>
      </div>

    </div>
  );
}
