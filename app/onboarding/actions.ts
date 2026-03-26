"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { chooseSplit, getMovementTemplates } from "@/lib/workout/splits";
import { scoreExercise } from "@/lib/workout/scoring";
import { getPrescription, getExerciseCountLimit } from "@/lib/workout/prescriptions";
import { getWarmup, getCooldown, getConditioning, estimateExerciseMinutes } from "@/lib/workout/phases";
import { redirect } from "next/navigation";
import type {
    UserWorkoutProfile,
    GeneratedWorkoutProgram,
    GeneratedWorkoutDay,
    GeneratedWorkoutExercise,
    Goal,
    Experience,
} from "@/lib/workout/types";

/**
 * Generate a workout plan preview (no DB persistence).
 * Works for both anonymous and authenticated users.
 */
export async function generatePreview(data: {
    goal: string;
    experienceLevel: string;
    location: string;
    daysPerWeek: number;
}): Promise<GeneratedWorkoutProgram> {
    const availableEquipment =
        data.location === "gym"
            ? ["barbell", "dumbbell", "machine", "cable", "body weight", "kettlebell"]
            : ["dumbbell", "body weight", "band"];

    const profile: UserWorkoutProfile = {
        goal: data.goal as Goal,
        experience: data.experienceLevel as Experience,
        location: data.location as any,
        availableEquipment,
        daysPerWeek: data.daysPerWeek as any,
        sessionLength: 60,
        focusAreas: [],
        avoidAreas: [],
    };

    // Step 1: Choose split
    const splitKey = chooseSplit(profile);
    const dayTemplates = getMovementTemplates(splitKey, profile);
    const activeDays = dayTemplates.slice(0, profile.daysPerWeek);

    const usedExerciseIds = new Set<string>();
    const generatedDays: GeneratedWorkoutDay[] = [];

    // Step 2: For each day, fill movement slots
    for (let dIndex = 0; dIndex < activeDays.length; dIndex++) {
        const dayTemp = activeDays[dIndex];
        const maxExercises = getExerciseCountLimit(profile.sessionLength);
        const constrainedSlots = dayTemp.slots.slice(0, maxExercises);
        const dailyExercises: GeneratedWorkoutDay["exercises"] = [];
        let orderIndex = 0;
        let exerciseMinutesTotal = 0;

        for (const pattern of constrainedSlots) {
            const candidates = await db.exercise.findMany({
                where: { movementPattern: pattern },
                take: 50,
            });

            if (candidates.length === 0) continue;

            // Score, shuffle for variety, then sort by score
            const ranked = candidates
                .map((ex) => ({
                    exercise: ex,
                    score: scoreExercise(ex, profile, usedExerciseIds),
                }))
                .sort(() => Math.random() - 0.5)
                .sort((a, b) => b.score - a.score);

            const best = ranked[0].exercise;
            usedExerciseIds.add(best.id);

            const prescription = getPrescription(profile.goal, pattern);
            const estMinutes = estimateExerciseMinutes(prescription.sets, prescription.restSeconds);
            exerciseMinutesTotal += estMinutes;

            dailyExercises.push({
                exerciseId: best.id,
                name: best.name,
                targetMuscle: best.target,
                movementPattern: pattern,
                sets: prescription.sets,
                reps: prescription.reps,
                restSeconds: prescription.restSeconds,
                orderIndex,
                imageUrl: best.gifUrl || undefined,
                estimatedMinutes: estMinutes,
            });
            orderIndex++;
        }


        const warmup = getWarmup(profile.goal, dayTemp.focus);
        const cooldown = getCooldown(profile.goal);
        const conditioning = getConditioning(profile.goal);
        const totalMinutes = warmup.durationMinutes + exerciseMinutesTotal + cooldown.durationMinutes + conditioning.durationMinutes;

        generatedDays.push({
            name: dayTemp.name,
            dayIndex: dIndex,
            focus: dayTemp.focus,
            totalMinutes,
            warmup,
            exercises: dailyExercises,
            conditioning,
            cooldown,
        });
    }

    return {
        splitKey,
        goal: profile.goal,
        experience: profile.experience,
        days: generatedDays,
    };
}

/**
 * Save a previously generated plan to the authenticated user's account.
 */
export async function savePlan(program: GeneratedWorkoutProgram) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    const userId = session.user.id;

    // Save profile
    await db.fitnessProfile.upsert({
        where: { userId },
        create: {
            userId,
            goal: program.goal,
            experienceLevel: program.experience,
            location: "gym",
            daysPerWeek: program.days.length,
            sessionLength: 60,
            availableEquipment: [],
            focusAreas: [],
            avoidAreas: [],
        },
        update: {
            goal: program.goal,
            daysPerWeek: program.days.length,
        },
    });

    // Persist the program
    await db.workoutProgram.create({
        data: {
            userId,
            name: `${program.days.length}-Day ${program.goal.replace("_", " ")} Program`,
            days: {
                create: program.days.map((day) => ({
                    dayIndex: day.dayIndex,
                    name: day.name,
                    exercises: {
                        create: day.exercises.map((ex) => ({
                            exerciseId: ex.exerciseId,
                            sets: ex.sets,
                            reps: ex.reps,
                            restSeconds: ex.restSeconds,
                            orderIndex: ex.orderIndex,
                        })),
                    },
                })),
            },
        },
    });

    redirect("/dashboard");
}

/**
 * Get an alternative exercise for swapping.
 */
export async function getAlternativeExercise(data: {
    movementPattern: string;
    currentExerciseId: string;
    goal: string;
    experienceLevel: string;
    location: string;
    daysPerWeek: number;
    alreadyUsedIds: string[];
}): Promise<GeneratedWorkoutExercise | null> {
    const profile: UserWorkoutProfile = {
        goal: data.goal as Goal,
        experience: data.experienceLevel as Experience,
        location: data.location as any,
        availableEquipment:
            data.location === "gym"
                ? ["barbell", "dumbbell", "machine", "cable", "body weight", "kettlebell"]
                : ["dumbbell", "body weight", "band"],
        daysPerWeek: data.daysPerWeek as any,
        sessionLength: 60,
        focusAreas: [],
        avoidAreas: [],
    };
    const usedSet = new Set(data.alreadyUsedIds);
    usedSet.add(data.currentExerciseId); // Penalize the current one

    // Fetch the current exercise to get its exact target muscle
    const currentEx = await db.exercise.findUnique({
        where: { id: data.currentExerciseId },
    });

    if (!currentEx) return null;

    // First try to find alternatives that match BOTH pattern AND exact target muscle
    let candidates = await db.exercise.findMany({
        where: {
            movementPattern: data.movementPattern,
            target: currentEx.target,
        },
        take: 100,
    });

    // Fallback: If no direct exact match, fallback to broad pattern match
    if (candidates.length === 0) {
        candidates = await db.exercise.findMany({
            where: { movementPattern: data.movementPattern },
            take: 100,
        });
    }

    if (candidates.length === 0) return null;

    const ranked = candidates
        .map((ex) => ({
            exercise: ex,
            score: scoreExercise(ex, profile, usedSet),
        }))
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => b.score - a.score);

    const best = ranked.find(r => r.exercise.id !== data.currentExerciseId)?.exercise;
    if (!best) return null;

    const prescription = getPrescription(profile.goal, data.movementPattern as any);
    const estMinutes = estimateExerciseMinutes(prescription.sets, prescription.restSeconds);

    return {
        exerciseId: best.id,
        name: best.name,
        targetMuscle: best.target,
        movementPattern: data.movementPattern as any,
        sets: prescription.sets,
        reps: prescription.reps,
        restSeconds: prescription.restSeconds,
        orderIndex: 0,
        imageUrl: best.gifUrl || undefined,
        estimatedMinutes: estMinutes,
    };
}
