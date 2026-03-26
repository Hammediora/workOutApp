import { Goal, WarmupBlock, CooldownBlock, ConditioningBlock } from "./types";

/**
 * Goal-adaptive warm-up blocks.
 * Strength / muscle_gain → more activation and mobility
 * Fat loss → slightly more cardio to get heart rate up
 * General → balanced approach
 */
export function getWarmup(goal: Goal, focus: string): WarmupBlock {
    const baseMobility = [
        "Arm circles — 30 sec each direction",
        "Leg swings — 10 each side",
        "Hip circles — 10 each direction",
        "Cat-cow stretches — 10 reps",
        "World's greatest stretch — 5 each side",
    ];

    if (goal === "fat_loss") {
        return {
            type: "warmup",
            label: "Dynamic Warm-Up + Cardio Primer",
            durationMinutes: 10,
            description: "Elevate heart rate and prepare joints for training.",
            items: [
                "Jumping jacks — 60 sec",
                "High knees — 30 sec",
                "Butt kicks — 30 sec",
                ...baseMobility.slice(0, 3),
                "Bodyweight squats — 15 reps",
                "Inchworms — 5 reps",
            ],
        };
    }

    if (goal === "strength") {
        return {
            type: "warmup",
            label: "Activation & Mobility",
            durationMinutes: 8,
            description: "Prime the nervous system and open joints for heavy loading.",
            items: [
                "Light cardio (bike or walk) — 3 min",
                ...baseMobility,
                "Band pull-aparts — 15 reps",
                "Glute bridges — 10 reps",
                focus.toLowerCase().includes("upper")
                    ? "Push-up to downward dog — 5 reps"
                    : "Goblet squat hold — 30 sec",
            ],
        };
    }

    if (goal === "muscle_gain") {
        return {
            type: "warmup",
            label: "Dynamic Warm-Up",
            durationMinutes: 8,
            description: "Increase blood flow and wake up target muscle groups.",
            items: [
                "Light cardio (jump rope or bike) — 3 min",
                ...baseMobility.slice(0, 3),
                "Bodyweight squats — 15 reps",
                "Band pull-aparts — 15 reps",
                "Push-ups — 10 reps",
            ],
        };
    }

    // general_fitness
    return {
        type: "warmup",
        label: "Full-Body Warm-Up",
        durationMinutes: 10,
        description: "Get moving with a mix of cardio and mobility work.",
        items: [
            "Brisk walk or light jog — 3 min",
            ...baseMobility,
            "Bodyweight squats — 10 reps",
            "Arm swings — 20 reps",
        ],
    };
}

export function getCooldown(goal: Goal): CooldownBlock {
    const baseStretches = [
        "Standing quad stretch — 30 sec each",
        "Standing hamstring stretch — 30 sec each",
        "Chest doorway stretch — 30 sec",
        "Cross-body shoulder stretch — 30 sec each",
        "Child's pose — 45 sec",
    ];

    if (goal === "fat_loss") {
        return {
            type: "cooldown",
            label: "Steady-State Cooldown",
            durationMinutes: 5,
            description: "Bring heart rate down gradually and stretch tight muscles.",
            items: [
                "Slow walk — 2 min",
                ...baseStretches.slice(0, 3),
                "Deep breathing — 60 sec",
            ],
        };
    }

    return {
        type: "cooldown",
        label: "Stretch & Recover",
        durationMinutes: 5,
        description: "Static stretching to improve recovery and flexibility.",
        items: [
            ...baseStretches,
            "Deep breathing — 60 sec",
        ],
    };
}

export function getConditioning(goal: Goal): ConditioningBlock {
    if (goal === "fat_loss") {
        return {
            type: "conditioning",
            label: "HIIT Finisher",
            durationMinutes: 15,
            description: "High-Intensity Interval Training to maximize calorie burn post-workout.",
            items: [
                "Bike or Rower / 30 sec sprint, 30 sec rest — 10 rounds",
                "Light walking to flush legs — 5 min",
            ],
        };
    }

    if (goal === "general_fitness") {
        return {
            type: "conditioning",
            label: "Steady-State Conditioning",
            durationMinutes: 20,
            description: "Moderate intensity cardio for cardiovascular health.",
            items: [
                "Brisk incline walk, light jog, or cycling",
                "Keep heart rate at 120-140 BPM",
            ],
        };
    }

    if (goal === "muscle_gain" || goal === "strength") {
        return {
            type: "conditioning",
            label: "Light Active Recovery",
            durationMinutes: 10,
            description: "Very light cardio to aid recovery without blunting muscle growth.",
            items: [
                "Slow walk or easy cycling",
                "Keep heart rate under 110 BPM",
            ],
        };
    }

    // Default fallback
    return {
        type: "conditioning",
        label: "Light Walk",
        durationMinutes: 10,
        description: "Easy cooldown walk.",
        items: ["10 minute walk"],
    };
}

/**
 * Estimate total time for an exercise block (sets × time-under-tension + rest).
 */
export function estimateExerciseMinutes(sets: number, restSeconds: number): number {
    const avgSetDuration = 45; // seconds per working set
    const totalSeconds = sets * avgSetDuration + (sets - 1) * restSeconds;
    return Math.ceil(totalSeconds / 60);
}
