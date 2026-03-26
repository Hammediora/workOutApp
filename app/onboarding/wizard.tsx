"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePreview } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "goal",
    title: "Primary Objective",
    options: [
      { label: "Build Muscle", value: "muscle_gain", description: "Increase muscle size and definition." },
      { label: "Gain Strength", value: "strength", description: "Increase maximal force output." },
      { label: "Lose Fat", value: "fat_loss", description: "Burn fat while preserving muscle." },
      { label: "General Fitness", value: "general_fitness", description: "Move better, feel better." },
    ],
  },
  {
    id: "experienceLevel",
    title: "Experience Level",
    options: [
      { label: "Beginner", value: "beginner", description: "Less than 1 year of consistent training." },
      { label: "Intermediate", value: "intermediate", description: "1-3 years of consistent training." },
      { label: "Advanced", value: "advanced", description: "3+ years of structured training." },
    ],
  },
  {
    id: "daysPerWeek",
    title: "Training Frequency",
    options: [
      { label: "2 Days / Week", value: 2, description: "Minimal time. Maximum efficiency." },
      { label: "3 Days / Week", value: 3, description: "Full Body split. Best for most people." },
      { label: "4 Days / Week", value: 4, description: "Upper / Lower split. Great balance." },
      { label: "5 Days / Week", value: 5, description: "Push / Pull / Legs + Upper / Lower." },
      { label: "6 Days / Week", value: 6, description: "Push / Pull / Legs × 2. High volume." },
    ],
  },
  {
    id: "location",
    title: "Training Environment",
    options: [
      { label: "Commercial Gym", value: "gym", description: "Access to barbells, machines, and cables." },
      { label: "Home", value: "home", description: "Dumbbells, bands, or bodyweight only." },
    ],
  },
];

export function OnboardingWizard({ userId }: { userId?: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[stepIndex];
  const selectedValue = answers[currentStep.id];

  const handleSelect = (value: any) => {
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
  };

  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((p) => p + 1);
    } else {
      setIsSubmitting(true);
      try {
        const program = await generatePreview({
          goal: answers.goal,
          experienceLevel: answers.experienceLevel,
          daysPerWeek: parseInt(answers.daysPerWeek.toString()),
          location: answers.location,
        });

        // Store in sessionStorage so the preview page can read it
        sessionStorage.setItem("workoutPreview", JSON.stringify(program));
        router.push("/preview");
      } catch (e) {
        console.error(e);
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((p) => p - 1);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
        <div className="flex space-x-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-8 rounded-full transition-colors",
                i <= stepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">{currentStep.title}</h2>
        <div className="space-y-3">
          {currentStep.options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt.label}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={stepIndex === 0 || isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedValue === undefined || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? "Generating..." : stepIndex === STEPS.length - 1 ? "Generate my plan" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
