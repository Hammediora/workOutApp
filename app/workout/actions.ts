"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MovementPattern } from "@/lib/workout/movement-patterns";

export async function getSwapCandidates(pattern: MovementPattern, limit = 10) {
    if (!pattern) return [];
    return await db.exercise.findMany({
        where: { movementPattern: pattern },
        take: limit,
    });
}

export async function swapWorkoutExercise(
    workoutExerciseId: string,
    newExerciseId: string,
    workoutDayId: string
) {
    await db.workoutExercise.update({
        where: { id: workoutExerciseId },
        data: { exerciseId: newExerciseId },
    });

    // Revalidate to show new exercise instantly
    revalidatePath(`/workout/${workoutDayId}`);
}
