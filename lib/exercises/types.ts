import { MovementPattern } from "../workout/types";

export type ExerciseRecord = {
    id: string;
    name: string;
    bodyPart: string;
    targetMuscle: string;
    equipment: string;
    movementPattern: MovementPattern;
    instructions: string[];
    gifUrl?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    locationTags: ("home" | "gym")[];
};
