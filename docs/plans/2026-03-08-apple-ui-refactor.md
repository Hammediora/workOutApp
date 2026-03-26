# Apple UI Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strip the "AI UI" aesthetic and rebuild every screen with Apple-level design: monochromatic, typographic hierarchy, intentional whitespace, no decorative color, no emojis in labels, modular components.

**Architecture:** Split the monolithic `preview/page.tsx` (600+ lines) into focused UI components under `components/workout/`. Refactor `dashboard/page.tsx` and `workout/[id]/client.tsx` to remove gimmick banners and improve content clarity. Apply a strict design system: weight + size = hierarchy, border-l accent = callout, no colored badges.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS v4, shadcn/ui, TypeScript, Inter (already loaded)

---

## Design System Reference

Apply these rules in EVERY task. Never deviate.

**Typography:**
```
Section label:  text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground
Card title:     text-base font-semibold tracking-tight
Section title:  text-xl font-semibold tracking-tight
Page title:     text-2xl sm:text-3xl font-bold tracking-tight
Body:           text-sm leading-relaxed text-muted-foreground
Metadata:       text-xs text-muted-foreground
Number badge:   text-xs font-bold tabular-nums
```

**Color rules (NON-NEGOTIABLE):**
- NO emerald, green, blue, or any hue-based color for callouts or banners
- Callouts use: `border-l-2 border-foreground/20 pl-4` — typographic, not colorful
- Active/selected state: `border-foreground bg-foreground/[0.03]`
- Hover: `hover:border-foreground/30`
- No gradients anywhere
- No emoji in UI copy or labels
- Badges: plain `text-xs text-muted-foreground` — no colored backgrounds

**Spacing:**
- Between major page sections: `space-y-12`
- Card internal padding: `p-5` or `p-6`
- Between list items: `space-y-2` or `divide-y divide-border/40`

**Buttons:** `primary` and `outline` only. Size `default` or `lg`.

**Section header pattern:**
```tsx
<div className="mb-4">
  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Label</p>
  <h2 className="text-xl font-semibold tracking-tight mt-0.5">Title</h2>
</div>
```

---

### Task 1: Create component directory + shared icon file

**Files:**
- Create: `components/workout/icons.tsx`

**Step 1: Create the icons file**

```tsx
// components/workout/icons.tsx

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ChevronIcon({ className, expanded }: { className?: string; expanded: boolean }) {
  return (
    <svg
      className={[className, "transition-transform duration-200", expanded ? "rotate-180" : ""].filter(Boolean).join(" ")}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function SwapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
    </svg>
  );
}

export function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
    </svg>
  );
}
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors from this file.

**Step 3: Commit**
```bash
git add components/workout/icons.tsx
git commit -m "feat: add shared workout icon components"
```

---

### Task 2: Create PhaseCard component

**Files:**
- Create: `components/workout/phase-card.tsx`

**Step 1: Write the component**

```tsx
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
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add components/workout/phase-card.tsx
git commit -m "feat: extract PhaseCard as standalone component"
```

---

### Task 3: Create ExerciseRow component

**Files:**
- Create: `components/workout/exercise-row.tsx`

This is the most complex extracted component. It handles video fetching, expand/collapse, and swap actions. Keep all focus tip logic here.

**Step 1: Write the component**

```tsx
// components/workout/exercise-row.tsx
"use client";

import { useState } from "react";
import type { GeneratedWorkoutDay } from "@/lib/workout/types";
import { SwapIcon, PlayIcon } from "./icons";

const PATTERN_LABELS: Record<string, string> = {
  squat: "Quad & Glute",
  hinge: "Hamstring & Lower Back",
  lunge: "Unilateral Leg",
  horizontal_push: "Chest & Front Shoulder",
  vertical_push: "Overhead Shoulder",
  horizontal_pull: "Mid-Back & Lat",
  vertical_pull: "Lat & Wide Back",
  core: "Core",
  carry: "Full Body",
  conditioning: "Conditioning",
  isolation: "Isolation",
};

const PATTERN_TIPS: Record<string, string> = {
  squat: "Keep your chest up and push your knees out. Drive through your mid-foot.",
  hinge: "Push your hips back as if closing a door behind you. Keep a neutral spine.",
  lunge: "Keep your torso upright. Drop the back knee straight down.",
  horizontal_push: "Retract your shoulder blades. Elbows tucked at ~45 degrees.",
  vertical_push: "Brace your core. Don't arch your lower back.",
  horizontal_pull: "Pull elbows toward your hips. Squeeze your back at the top.",
  vertical_pull: "Depress your shoulders first, then pull with your lats.",
  core: "Focus on tension, not speed. Keep your breathing steady.",
  isolation: "Control the eccentric. Squeeze at the peak contraction.",
};

interface ExerciseRowProps {
  exercise: GeneratedWorkoutDay["exercises"][0];
  index: number;
  dayIndex: number;
  onSwap: (dayIndex: number, exerciseIndex: number) => void;
  isSwapping: boolean;
}

export function ExerciseRow({ exercise, index, dayIndex, onSwap, isSwapping }: ExerciseRowProps) {
  const [showMedia, setShowMedia] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const patternLabel = PATTERN_LABELS[exercise.movementPattern] ?? exercise.movementPattern.replace(/_/g, " ");
  const focusTip = PATTERN_TIPS[exercise.movementPattern];

  const handleShowMedia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMedia) {
      setShowMedia(false);
      return;
    }
    setShowMedia(true);
    if (!videoId && !isLoadingVideo) {
      setIsLoadingVideo(true);
      try {
        const res = await fetch(`/api/video?q=how+to+${encodeURIComponent(exercise.name)}+exercise+form`);
        const data = await res.json();
        if (data.videoId) setVideoId(data.videoId);
      } finally {
        setIsLoadingVideo(false);
      }
    }
  };

  return (
    <div className="py-5">
      <div className="flex items-start gap-4">
        {/* Index */}
        <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-muted-foreground/60 mt-0.5 text-right">
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{exercise.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{patternLabel}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold tabular-nums">
                {exercise.sets} × {exercise.reps}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {exercise.restSeconds}s rest
              </p>
            </div>
          </div>

          {/* Focus tip — typographic callout, no color */}
          {focusTip && (
            <div className="mt-3 pl-3 border-l-2 border-foreground/15">
              <p className="text-xs text-muted-foreground leading-relaxed">{focusTip}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={handleShowMedia}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <PlayIcon className="w-3.5 h-3.5" />
              {showMedia ? "Hide" : "Watch Tutorial"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSwap(dayIndex, index); }}
              disabled={isSwapping}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-40"
            >
              <SwapIcon className="w-3.5 h-3.5" />
              {isSwapping ? "Swapping…" : "Swap"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded video */}
      {showMedia && (
        <div className="mt-4 ml-10">
          {isLoadingVideo ? (
            <p className="text-xs text-muted-foreground">Loading tutorial…</p>
          ) : videoId ? (
            <div className="rounded-lg overflow-hidden border border-border/50 aspect-video w-full max-w-xs">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                title={`${exercise.name} tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Tutorial not available.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add components/workout/exercise-row.tsx
git commit -m "feat: extract ExerciseRow component with clean design"
```

---

### Task 4: Create DayCard component

**Files:**
- Create: `components/workout/day-card.tsx`

**Step 1: Write the component**

```tsx
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
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add components/workout/day-card.tsx
git commit -m "feat: extract DayCard with section label hierarchy"
```

---

### Task 5: Create ProgressionNote component

This replaces the emerald/green AI banner. Pure typography, no color gimmicks.

**Files:**
- Create: `components/workout/progression-note.tsx`

**Step 1: Write the component**

```tsx
// components/workout/progression-note.tsx

interface ProgressionNoteProps {
  goal: string;
}

const GOAL_NOTES: Record<string, { headline: string; body: string }> = {
  fat_loss: {
    headline: "Add weight every week.",
    body: "Aim for 2.5–5 lb increases each session. Getting stronger while in a deficit is the fastest body composition change you can make.",
  },
  strength: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases on your main lifts each session. Progressive overload is the only mechanism that drives strength adaptation.",
  },
  muscle_gain: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases across the board. Muscles grow in response to progressive tension — the number must go up over time.",
  },
  general_fitness: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases each session. Small, consistent gains compound into significant results. Write down what you lift — beat it next time.",
  },
};

const DEFAULT_NOTE = {
  headline: "Add weight every week.",
  body: "Aim to increase each lift by 5 lbs per session. Progressive overload is the primary driver of every training adaptation.",
};

export function ProgressionNote({ goal }: ProgressionNoteProps) {
  const note = GOAL_NOTES[goal] ?? DEFAULT_NOTE;

  return (
    <div className="pl-4 border-l-2 border-foreground/20 space-y-1">
      <p className="text-sm font-semibold tracking-tight">{note.headline}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{note.body}</p>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add components/workout/progression-note.tsx
git commit -m "feat: add ProgressionNote component — clean typographic callout"
```

---

### Task 6: Refactor preview/page.tsx

Replace the 600-line monolith with a clean ~100-line page that imports the extracted components. Remove all AI UI: the emerald banner, emoji badge, gradient CTA, cheesy headline.

**Files:**
- Modify: `app/preview/page.tsx`

**Step 1: Replace the entire file**

```tsx
// app/preview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePlan, getAlternativeExercise } from "@/app/onboarding/actions";
import type { GeneratedWorkoutProgram } from "@/lib/workout/types";
import { ClockIcon } from "@/components/workout/icons";
import { DayCard } from "@/components/workout/day-card";
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
        <div className="flex items-center gap-5 text-xs text-muted-foreground pt-1">
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
                <DayCard
                  day={item.workoutDay}
                  defaultOpen={i === 0}
                  onSwap={handleSwap}
                  swappingId={swappingId}
                />
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
      <div className="rounded-2xl border border-border p-8 space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Ready to train
          </p>
          <h2 className="text-xl font-semibold tracking-tight mt-1">Save this program</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          Sign in to save your plan, track weights each session, and log progress week by week.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
          <Button size="lg" onClick={handleSave} disabled={isSaving} className="min-w-[180px]">
            {isSaving ? "Saving…" : "Sign in & Save Plan"}
          </Button>
          <Button
            size="lg"
            variant="outline"
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
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add app/preview/page.tsx
git commit -m "refactor: preview page — modular, clean Apple-level design"
```

---

### Task 7: Refactor dashboard/page.tsx

Remove the AI green banner. Add a clean progression reminder. Show exercise names in day cards.

**Files:**
- Modify: `app/dashboard/page.tsx`

**Step 1: Replace file**

```tsx
// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const program = await db.workoutProgram.findFirst({
    where: { userId: session.user.id },
    include: {
      days: {
        orderBy: { dayIndex: "asc" },
        include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!program) redirect("/onboarding");

  return (
    <div className="space-y-12">

      {/* Page header */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Active program
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{program.name}</h1>
        <p className="text-sm text-muted-foreground">
          Select a day to view your workout and track your sets.
        </p>
      </div>

      {/* Progression reminder */}
      <div className="pl-4 border-l-2 border-foreground/20 space-y-1">
        <p className="text-sm font-semibold tracking-tight">Add weight every week.</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aim for 5 lb increases on each lift per session. Write down what you lifted — beat it next time.
        </p>
      </div>

      {/* Day grid */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-4">
          This week
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {program.days.map((day) => (
            <div
              key={day.id}
              className="rounded-2xl border border-border/60 p-5 flex flex-col gap-4 hover:border-border transition-colors duration-200"
            >
              <div>
                <p className="text-xs text-muted-foreground">{day.exercises.length} exercises</p>
                <h2 className="text-base font-semibold tracking-tight mt-0.5">{day.name}</h2>
              </div>

              <ul className="space-y-1.5 flex-1">
                {day.exercises.slice(0, 4).map((ex) => (
                  <li key={ex.id} className="flex items-baseline gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-foreground/20 shrink-0 mt-1.5" />
                    <span className="truncate">{ex.exercise?.name ?? "Exercise"}</span>
                    <span className="shrink-0 ml-auto tabular-nums">{ex.sets}×{ex.reps}</span>
                  </li>
                ))}
                {day.exercises.length > 4 && (
                  <li className="text-xs text-muted-foreground/50 pl-3">
                    +{day.exercises.length - 4} more
                  </li>
                )}
              </ul>

              <Link href={`/workout/${day.id}`}>
                <Button className="w-full" size="default">
                  Start Workout
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Regenerate */}
      <div className="flex justify-end pt-4 border-t border-border/40">
        <Link href="/onboarding">
          <Button variant="outline" size="sm">Regenerate Plan</Button>
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add app/dashboard/page.tsx
git commit -m "refactor: dashboard — clean design, show exercise names"
```

---

### Task 8: Refactor workout/[id]/client.tsx

Remove the gimmick coach banner. Add a minimal, clean workout header instead.

**Files:**
- Modify: `app/workout/[id]/client.tsx`

**Step 1: Replace the file**

```tsx
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

      {/* Session status */}
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
            ? "Solid session. Rest, eat your protein, and show up heavier next time."
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
```

**Step 2: Verify TypeScript**
Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**
```bash
git add app/workout/[id]/client.tsx
git commit -m "refactor: workout client — clean design, remove gimmick banners"
```

---

### Task 9: Final verification pass

**Step 1: Full TypeScript check**
Run: `npx tsc --noEmit`
Expected: 0 errors.

**Step 2: Dev server check**
Run: `npm run dev`
Manually verify at each route:
- `/` — landing page unchanged
- `/onboarding` — wizard unchanged
- `/preview` — clean header, section labels, no green banners
- `/dashboard` — exercise names shown, clean progression note
- `/workout/[id]` — clean session header, progression note

**Step 3: Mobile check**
Open DevTools → 320px width. Verify:
- No horizontal scroll
- Tap targets all readable
- Exercise names don't overflow

**Step 4: Final commit**
```bash
git add -A
git commit -m "refactor: Apple-level UI — remove AI aesthetic, modular components, typography hierarchy"
```

---

## Summary of Files Created/Modified

| Action | File |
|---|---|
| Create | `components/workout/icons.tsx` |
| Create | `components/workout/phase-card.tsx` |
| Create | `components/workout/exercise-row.tsx` |
| Create | `components/workout/day-card.tsx` |
| Create | `components/workout/progression-note.tsx` |
| Modify | `app/preview/page.tsx` |
| Modify | `app/dashboard/page.tsx` |
| Modify | `app/workout/[id]/client.tsx` |
