import { Exercise } from "@prisma/client";
import { UserWorkoutProfile, Goal } from "./types";

/**
 * Location heuristic — which equipment is available at home vs gym.
 */
export function getExerciseLocationTags(equipment: string): string[] {
    const homeFriendly = ["body weight", "dumbbell", "band", "kettlebell", "medicine ball"];
    if (homeFriendly.includes(equipment)) {
        return ["home", "gym"];
    }
    return ["gym"];
}

/**
 * Scores an exercise candidate for a given user profile.
 * Higher score = better fit. Used to rank and select the best exercise per slot.
 */
export function scoreExercise(
    exercise: Exercise,
    profile: UserWorkoutProfile,
    alreadyUsedIds: Set<string>
): number {
    let score = 0;

    // ─── 1. No duplicates ────────────────────────────
    if (alreadyUsedIds.has(exercise.id)) {
        return -999;
    }

    // ─── 2. Equipment match ──────────────────────────
    const locationTags = getExerciseLocationTags(exercise.equipment);

    if (profile.location === "home" && locationTags.includes("home")) score += 20;
    if (profile.location === "gym" && locationTags.includes("gym")) score += 20;

    if (profile.availableEquipment && profile.availableEquipment.length > 0) {
        if (profile.availableEquipment.includes(exercise.equipment)) {
            score += 25;
        } else if (exercise.equipment !== "body weight") {
            score -= 50;
        }
    }

    // ─── 3. Difficulty match ─────────────────────────
    // Now using actual difficulty data from MuscleWiki where available
    const difficulty = exercise.difficulty?.toLowerCase() || null;

    if (difficulty) {
        // Direct match from MuscleWiki data
        if (profile.experience === "beginner") {
            if (difficulty === "beginner" || difficulty === "novice") score += 25;
            if (difficulty === "advanced") score -= 15;
        } else if (profile.experience === "intermediate") {
            if (difficulty === "intermediate") score += 20;
        } else {
            if (difficulty === "advanced") score += 20;
            if (difficulty === "beginner" || difficulty === "novice") score -= 10;
        }
    } else {
        // Heuristic fallback for exercises without difficulty
        const isBeginnerFriendly = ["body weight", "machine", "cable"].includes(exercise.equipment);
        if (profile.experience === "beginner" && isBeginnerFriendly) score += 15;
        if (profile.experience === "advanced" && !isBeginnerFriendly) score += 10;
    }

    // ─── 4. Goal-specific scoring ────────────────────
    const mechanic = exercise.mechanic?.toLowerCase() || null;
    const force = exercise.force?.toLowerCase() || null;

    if (profile.goal === "strength") {
        // Strength: prefer compound movements, barbells, heavy equipment
        if (mechanic === "compound") score += 20;
        if (exercise.equipment === "barbell") score += 15;
        if (mechanic === "isolation") score -= 5;
    }

    if (profile.goal === "muscle_gain") {
        // Hypertrophy: prefer compound first, then isolation accessories
        if (mechanic === "compound") score += 15;
        // Dumbbells great for hypertrophy (range of motion)
        if (exercise.equipment === "dumbbell") score += 10;
        if (exercise.equipment === "cable") score += 8;
    }

    if (profile.goal === "fat_loss") {
        // Fat loss: prefer compound, full-body movements, bodyweight
        if (mechanic === "compound") score += 20;
        if (exercise.equipment === "body weight") score += 10;
        if (force === "push" || force === "pull") score += 5;
    }

    if (profile.goal === "general_fitness") {
        // General: balanced, prefer easier exercises
        if (exercise.equipment === "body weight") score += 10;
        if (exercise.equipment === "dumbbell") score += 8;
        if (mechanic === "compound") score += 10;
    }

    // ─── 5. Focus / avoid areas ──────────────────────
    if (profile.focusAreas && profile.focusAreas.includes(exercise.target)) {
        score += 10;
    }
    if (profile.avoidAreas && profile.avoidAreas.includes(exercise.bodyPart)) {
        score -= 200;
    }

    // ─── 6. Prefer exercises with videos/images ──────
    if (exercise.videoUrl) score += 15;
    if (exercise.gifUrl && exercise.gifUrl.length > 0) score += 5;

    // ─── 7. Prefer well-named exercises ──────────────
    // Filter out garbage names (single words, all caps, very short)
    const name = exercise.name;
    if (name.length < 5) score -= 30;
    if (name === name.toUpperCase() && name.length > 3) score -= 10;

    return score;
}
