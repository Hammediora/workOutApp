import { MovementPattern } from "../workout/types";

// ─── wger API types ───────────────────────────────────
export type WgerExerciseRaw = {
    id: number;
    uuid: string;
    category: number; // links to exercisecategory
    muscles: number[];
    muscles_secondary: number[];
    equipment: number[];
};

export type WgerTranslation = {
    id: number;
    name: string;
    description: string;
    exercise: number;
    language: number;
};

export type WgerImage = {
    id: number;
    exercise_base: number;
    image: string; // URL
    is_main: boolean;
};

// ─── Lookup maps ──────────────────────────────────────

/** wger category ID → our body part string */
const CATEGORY_MAP: Record<number, string> = {
    10: "abs",
    8: "arms",
    12: "back",
    14: "calves",
    15: "cardio",
    11: "chest",
    9: "legs",
    13: "shoulders",
};

/** wger equipment ID → our equipment string */
const EQUIPMENT_MAP: Record<number, string> = {
    1: "barbell",
    2: "barbell",     // SZ-Bar treated as barbell
    3: "dumbbell",
    4: "body weight",  // Gym mat
    5: "body weight",  // Swiss ball
    6: "body weight",  // Pull-up bar
    7: "body weight",  // none (bodyweight)
    8: "machine",      // Bench
    9: "machine",      // Incline bench
    10: "kettlebell",
    11: "band",         // Resistance band
};

/** wger muscle ID → our target string */
const MUSCLE_MAP: Record<number, string> = {
    1: "biceps",
    2: "shoulders",
    3: "serratus",
    4: "chest",
    5: "triceps",
    6: "abs",
    7: "calves",
    8: "glutes",
    9: "traps",
    10: "quads",
    11: "hamstrings",
    12: "lats",
    13: "brachialis",
    14: "obliques",
    15: "calves",
};

// ─── Movement pattern heuristic ───────────────────────

export function inferMovementPattern(
    categoryId: number,
    muscles: number[],
    equipmentIds: number[],
    name: string
): MovementPattern {
    const lName = name.toLowerCase();

    // Cardio
    if (categoryId === 15) return "conditioning";

    // Abs
    if (categoryId === 10) return "core";
    if (muscles.includes(6) || muscles.includes(14)) return "core";

    // Legs category
    if (categoryId === 9) {
        if (lName.includes("squat") || lName.includes("leg press")) return "squat";
        if (lName.includes("lunge") || lName.includes("split squat") || lName.includes("step")) return "lunge";
        if (lName.includes("deadlift") || lName.includes("hip thrust") || lName.includes("good morning") || lName.includes("romanian")) return "hinge";
        if (muscles.includes(11) || muscles.includes(8)) return "hinge";  // hamstrings or glutes
        if (muscles.includes(10)) return "squat"; // quads
        return "squat"; // default for legs
    }

    // Chest category → push
    if (categoryId === 11) {
        if (lName.includes("fly") || lName.includes("crossover")) return "horizontal_push";
        if (lName.includes("incline") || lName.includes("overhead") || lName.includes("military")) return "vertical_push";
        return "horizontal_push"; // bench press etc.
    }

    // Shoulders category
    if (categoryId === 13) {
        if (lName.includes("press") || lName.includes("raise") && lName.includes("front")) return "vertical_push";
        if (lName.includes("lateral") || lName.includes("rear") || lName.includes("face pull")) return "isolation";
        return "vertical_push";
    }

    // Back category → pull
    if (categoryId === 12) {
        if (lName.includes("row")) return "horizontal_pull";
        if (lName.includes("pull") || lName.includes("chin") || lName.includes("lat pull") || lName.includes("pulldown")) return "vertical_pull";
        if (lName.includes("deadlift") || lName.includes("good morning")) return "hinge";
        if (lName.includes("shrug")) return "isolation";
        return "horizontal_pull"; // default
    }

    // Arms category → isolation
    if (categoryId === 8) {
        if (lName.includes("dip") || lName.includes("close grip") || lName.includes("skull")) return "horizontal_push";
        return "isolation";
    }

    // Calves
    if (categoryId === 14) return "isolation";

    return "isolation";
}

export function resolveEquipment(equipmentIds: number[]): string {
    if (equipmentIds.length === 0) return "body weight";
    return EQUIPMENT_MAP[equipmentIds[0]] || "body weight";
}

export function resolveTarget(muscles: number[]): string {
    if (muscles.length === 0) return "full body";
    return MUSCLE_MAP[muscles[0]] || "full body";
}

export function resolveBodyPart(categoryId: number): string {
    return CATEGORY_MAP[categoryId] || "other";
}
