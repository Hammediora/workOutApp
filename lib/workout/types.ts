export type Goal = "fat_loss" | "muscle_gain" | "strength" | "general_fitness";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Location = "home" | "gym";
export type SessionLength = 30 | 45 | 60 | 75;
export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;

export type UserWorkoutProfile = {
    goal: Goal;
    experience: Experience;
    location: Location;
    availableEquipment: string[];
    daysPerWeek: DaysPerWeek;
    sessionLength: SessionLength;
    focusAreas: string[];
    avoidAreas?: string[];
};

export type MovementPattern =
    | "squat"
    | "hinge"
    | "lunge"
    | "horizontal_push"
    | "vertical_push"
    | "horizontal_pull"
    | "vertical_pull"
    | "core"
    | "carry"
    | "conditioning"
    | "isolation";

// ─── Generated Program Types ─────────────────────────

export type WarmupBlock = {
    type: "warmup";
    label: string;
    durationMinutes: number;
    description: string;
    items: string[];
};

export type CooldownBlock = {
    type: "cooldown";
    label: string;
    durationMinutes: number;
    description: string;
    items: string[];
};

export type ConditioningBlock = {
    type: "conditioning";
    label: string;
    durationMinutes: number;
    description: string;
    items: string[];
};

export type GeneratedWorkoutExercise = {
    exerciseId: string;
    name: string;
    targetMuscle: string;
    movementPattern: MovementPattern;
    sets: number;
    reps: string;
    restSeconds: number;
    notes?: string;
    orderIndex: number;
    imageUrl?: string;
    estimatedMinutes: number;
};

export type GeneratedWorkoutDay = {
    name: string;
    dayIndex: number;
    focus: string;
    totalMinutes: number;
    warmup: WarmupBlock;
    exercises: GeneratedWorkoutExercise[];
    conditioning?: ConditioningBlock;
    cooldown: CooldownBlock;
};

export type GeneratedWorkoutProgram = {
    splitKey: string;
    goal: Goal;
    experience: Experience;
    days: GeneratedWorkoutDay[];
};
