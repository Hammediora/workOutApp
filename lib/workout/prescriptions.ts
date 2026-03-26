import { Goal, MovementPattern } from "./types";

export function getPrescription(
    goal: Goal,
    movementPattern: MovementPattern
): { sets: number; reps: string; restSeconds: number } {
    const isCompound = [
        "squat",
        "hinge",
        "lunge",
        "horizontal_push",
        "vertical_push",
        "horizontal_pull",
        "vertical_pull",
    ].includes(movementPattern);

    if (goal === "strength") {
        return isCompound
            ? { sets: 4, reps: "4-6", restSeconds: 120 }
            : { sets: 3, reps: "8-10", restSeconds: 60 };
    }

    if (goal === "muscle_gain" || goal === "hypertrophy" as any) {
        return isCompound
            ? { sets: 4, reps: "6-10", restSeconds: 90 }
            : { sets: 3, reps: "10-15", restSeconds: 60 };
    }

    // general_fitness or fat_loss
    return isCompound
        ? { sets: 3, reps: "8-12", restSeconds: 75 }
        : { sets: 2, reps: "12-15", restSeconds: 45 };
}

export function getExerciseCountLimit(sessionLength: number): number {
    if (sessionLength === 30) return 4;
    if (sessionLength === 45) return 5;
    if (sessionLength === 60) return 6;
    return 7; // 75+
}
