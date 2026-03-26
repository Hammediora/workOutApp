export const MOVEMENT_PATTERNS = {
    HORIZONTAL_PUSH: "horizontal_push",
    HORIZONTAL_PULL: "horizontal_pull",
    VERTICAL_PUSH: "vertical_push",
    VERTICAL_PULL: "vertical_pull",
    SQUAT: "squat",
    HINGE: "hinge",
    LUNGE: "lunge",
    CORE: "core",
    ISOLATION: "isolation", // For curls, extensions, raises, etc.
} as const;

export type MovementPattern = typeof MOVEMENT_PATTERNS[keyof typeof MOVEMENT_PATTERNS];

export function determineMovementPattern(name: string, target: string, bodyPart: string): MovementPattern {
    const n = name.toLowerCase();

    // Hinge
    if (n.includes("deadlift") || n.includes("good morning") || n.includes("kettlebell swing") || n.includes("hip thrust") || target === "glutes") {
        if (!n.includes("squat") && !n.includes("lunge")) return MOVEMENT_PATTERNS.HINGE;
    }

    // Squat
    if (n.includes("squat") || n.includes("leg press") || n.includes("hack squat") || target === "quads" && n.includes("squat")) {
        return MOVEMENT_PATTERNS.SQUAT;
    }

    // Lunge
    if (n.includes("lunge") || n.includes("split squat") || n.includes("step up")) {
        return MOVEMENT_PATTERNS.LUNGE;
    }

    // Horizontal Push
    if (n.includes("bench press") || n.includes("push up") || n.includes("push-up") || n.includes("chest press") || (bodyPart === "chest" && n.includes("press"))) {
        return MOVEMENT_PATTERNS.HORIZONTAL_PUSH;
    }

    // Vertical Push
    if (n.includes("overhead press") || n.includes("military press") || n.includes("shoulder press") || n.includes("push press")) {
        return MOVEMENT_PATTERNS.VERTICAL_PUSH;
    }

    // Horizontal Pull
    if (n.includes("row") && !n.includes("upright")) {
        return MOVEMENT_PATTERNS.HORIZONTAL_PULL;
    }

    // Vertical Pull
    if (n.includes("pull up") || n.includes("pull-up") || n.includes("chin up") || n.includes("chin-up") || n.includes("lat pulldown")) {
        return MOVEMENT_PATTERNS.VERTICAL_PULL;
    }

    // Core
    if (bodyPart === "waist" || target === "abs" || n.includes("crunch") || n.includes("plank") || n.includes("sit up")) {
        return MOVEMENT_PATTERNS.CORE;
    }

    // Fallback to Isolation for things like bicep curls, tricep extensions, calf raises, lat raises
    return MOVEMENT_PATTERNS.ISOLATION;
}
