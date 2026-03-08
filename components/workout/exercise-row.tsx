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
