import { db } from "@/lib/db";
import { UserWorkoutProfile, GeneratedWorkoutProgram, GeneratedWorkoutDay, GeneratedWorkoutExercise } from "./types";
import { chooseSplit, getMovementTemplates } from "./splits";
import { scoreExercise } from "./scoring";
import { getPrescription, getExerciseCountLimit } from "./prescriptions";
import { getWarmup, getCooldown, estimateExerciseMinutes } from "./phases";

export async function buildWorkoutProgram(profile: UserWorkoutProfile) {
    const splitKey = chooseSplit(profile);
    const dayTemplates = getMovementTemplates(splitKey, profile);
    const activeDays = dayTemplates.slice(0, profile.daysPerWeek);

    const usedExerciseIds = new Set<string>();
    const generatedDays: GeneratedWorkoutDay[] = [];

    for (let dIndex = 0; dIndex < activeDays.length; dIndex++) {
        const dayTemp = activeDays[dIndex];
        const dailyExercises: GeneratedWorkoutExercise[] = [];
        const maxExercises = getExerciseCountLimit(profile.sessionLength);
        const constrainedSlots = dayTemp.slots.slice(0, maxExercises);
        let orderIndex = 0;
        let exerciseMinutesTotal = 0;

        for (const pattern of constrainedSlots) {
            const candidates = await db.exercise.findMany({
                where: { movementPattern: pattern },
                take: 50,
            });

            if (candidates.length === 0) continue;

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
        const totalMinutes = warmup.durationMinutes + exerciseMinutesTotal + cooldown.durationMinutes;

        generatedDays.push({
            name: dayTemp.name,
            dayIndex: dIndex,
            focus: dayTemp.focus,
            totalMinutes,
            warmup,
            exercises: dailyExercises,
            cooldown,
        });
    }

    // Persist
    const program = await db.workoutProgram.create({
        data: {
            userId: (profile as any).userId,
            name: `${profile.daysPerWeek}-Day ${profile.goal.replace("_", " ")} Program`,
            days: {
                create: generatedDays.map((day) => ({
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
        include: {
            days: { include: { exercises: true } },
        },
    });

    return program;
}
