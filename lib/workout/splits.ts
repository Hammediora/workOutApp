import { MovementPattern, UserWorkoutProfile } from "./types";

export type DayTemplate = {
    name: string;
    focus: string;
    slots: MovementPattern[];
};

export type SplitTemplate = {
    id: string;
    days: DayTemplate[];
};

export const SPLITS: Record<string, SplitTemplate> = {
    full_body_2: {
        id: "full_body_2",
        days: [
            { name: "Day A", focus: "Full Body", slots: ["squat", "horizontal_push", "horizontal_pull", "core"] },
            { name: "Day B", focus: "Full Body", slots: ["hinge", "vertical_push", "vertical_pull", "core"] },
        ],
    },
    full_body_3: {
        id: "full_body_3",
        days: [
            { name: "Day A", focus: "Full Body", slots: ["squat", "horizontal_push", "horizontal_pull", "core"] },
            { name: "Day B", focus: "Full Body", slots: ["hinge", "vertical_push", "vertical_pull", "core"] },
            { name: "Day C", focus: "Full Body", slots: ["lunge", "horizontal_push", "horizontal_pull", "conditioning"] },
        ],
    },
    upper_lower_4: {
        id: "upper_lower_4",
        days: [
            { name: "Upper A", focus: "Upper Body", slots: ["horizontal_push", "horizontal_pull", "vertical_push", "isolation"] },
            { name: "Lower A", focus: "Lower Body", slots: ["squat", "hinge", "core"] },
            { name: "Upper B", focus: "Upper Body", slots: ["vertical_push", "vertical_pull", "horizontal_push", "isolation"] },
            { name: "Lower B", focus: "Lower Body", slots: ["lunge", "squat", "core", "conditioning"] },
        ],
    },
    upper_lower_plus_full_body_5: {
        id: "upper_lower_plus_full_body_5",
        days: [
            { name: "Upper", focus: "Upper Body", slots: ["horizontal_push", "horizontal_pull", "vertical_push", "isolation"] },
            { name: "Lower", focus: "Lower Body", slots: ["squat", "hinge", "core"] },
            { name: "Push", focus: "Push", slots: ["horizontal_push", "vertical_push", "isolation"] },
            { name: "Pull", focus: "Pull", slots: ["vertical_pull", "horizontal_pull", "isolation", "core"] },
            { name: "Full Body", focus: "Full Body", slots: ["lunge", "horizontal_push", "horizontal_pull", "conditioning"] },
        ],
    },
    ppl_plus_upper_lower_5: {
        id: "ppl_plus_upper_lower_5",
        days: [
            { name: "Push", focus: "Push", slots: ["horizontal_push", "vertical_push", "isolation"] },
            { name: "Pull", focus: "Pull", slots: ["horizontal_pull", "vertical_pull", "isolation"] },
            { name: "Legs", focus: "Legs", slots: ["squat", "hinge", "core"] },
            { name: "Upper", focus: "Upper Body", slots: ["horizontal_push", "vertical_pull", "isolation", "core"] },
            { name: "Lower", focus: "Lower Body", slots: ["lunge", "squat", "conditioning"] },
        ],
    },
    ppl_6: {
        id: "ppl_6",
        days: [
            { name: "Push A", focus: "Push", slots: ["horizontal_push", "vertical_push", "isolation"] },
            { name: "Pull A", focus: "Pull", slots: ["horizontal_pull", "vertical_pull", "isolation"] },
            { name: "Legs A", focus: "Legs", slots: ["squat", "hinge", "core"] },
            { name: "Push B", focus: "Push", slots: ["vertical_push", "horizontal_push", "isolation"] },
            { name: "Pull B", focus: "Pull", slots: ["vertical_pull", "horizontal_pull", "isolation"] },
            { name: "Legs B", focus: "Legs", slots: ["hinge", "lunge", "conditioning"] },
        ],
    },
    ppl_5: {
        id: "ppl_5",
        days: [
            { name: "Push", focus: "Push", slots: ["horizontal_push", "vertical_push", "isolation"] },
            { name: "Pull", focus: "Pull", slots: ["horizontal_pull", "vertical_pull", "isolation"] },
            { name: "Legs", focus: "Legs", slots: ["squat", "lunge", "core"] },
            { name: "Push", focus: "Push", slots: ["vertical_push", "horizontal_push", "isolation"] },
            { name: "Pull", focus: "Pull", slots: ["vertical_pull", "horizontal_pull", "isolation"] },
        ]
    }
};

export function chooseSplit(profile: UserWorkoutProfile): string {
    const { daysPerWeek, experience } = profile;

    if (daysPerWeek === 2) return "full_body_2";
    if (daysPerWeek === 3) return "full_body_3";
    if (daysPerWeek === 4) return "upper_lower_4";
    if (daysPerWeek === 5) {
        return experience === "beginner" ? "upper_lower_plus_full_body_5" : "ppl_plus_upper_lower_5";
    }
    if (daysPerWeek === 6) {
        return experience === "advanced" ? "ppl_6" : "ppl_5";
    }

    return "full_body_3";
}

export function getMovementTemplates(splitId: string, profile: UserWorkoutProfile): DayTemplate[] {
    const split = SPLITS[splitId];
    if (!split) return SPLITS["full_body_3"].days;

    // Apply any profile specific mutators to the base template if needed based on focus areas, etc.
    return split.days;
}
