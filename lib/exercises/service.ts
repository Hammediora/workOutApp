import { db } from "@/lib/db";
import { MovementPattern } from "../workout/movement-patterns";

export async function getExerciseById(id: string) {
    return await db.exercise.findUnique({
        where: { id },
    });
}

export async function getExercisesByPattern(pattern: MovementPattern, limit = 10) {
    return await db.exercise.findMany({
        where: { movementPattern: pattern },
        take: limit,
    });
}

export async function searchExercises(query: string, limit = 20) {
    return await db.exercise.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive", // Postgres only feature though
            },
        },
        take: limit,
    });
}
