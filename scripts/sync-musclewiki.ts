/**
 * MuscleWiki Sync Script
 *
 * Budget: 500 API calls/month (free tier)
 * Strategy:
 *   - Fetch exercise list pages (500 per page = ~4 calls)
 *   - Fetch detail for ~400 exercises (most important categories)
 *   - Total: ~404 calls, well within budget
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { inferMovementPattern, resolveBodyPart } from "../lib/exercisedb/normalize";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const API_BASE = "https://api.musclewiki.com";
const API_KEY = process.env.MUSCLEWIKI_API_KEY!;

const headers: Record<string, string> = {
    "X-API-Key": API_KEY,
    "Accept": "application/json",
};

// Categories we care about for strength training
const PRIORITY_CATEGORIES = [
    "barbell",
    "dumbbells",
    "bodyweight",
    "cables",
    "machine",
    "kettlebells",
    "band",
];

// Map MuscleWiki category → our equipment string
const EQUIP_MAP: Record<string, string> = {
    barbell: "barbell",
    dumbbells: "dumbbell",
    bodyweight: "body weight",
    cables: "cable",
    machine: "machine",
    kettlebells: "kettlebell",
    band: "band",
    "smith-machine": "machine",
    "ez bar": "barbell",
    "trap bar": "barbell",
    plate: "barbell",
};

// Map MuscleWiki muscle → our body part
const MUSCLE_TO_BODYPART: Record<string, string> = {
    chest: "chest",
    "anterior deltoid": "shoulders",
    "lateral deltoid": "shoulders",
    "posterior deltoid": "shoulders",
    shoulders: "shoulders",
    biceps: "arms",
    triceps: "arms",
    forearms: "arms",
    abdominals: "abs",
    obliques: "abs",
    quadriceps: "legs",
    hamstrings: "legs",
    calves: "calves",
    glutes: "legs",
    "lower back": "back",
    lats: "back",
    "upper back": "back",
    traps: "back",
};

// Map MuscleWiki force → our movement pattern (rudimentary, refined by name heuristic)
function inferPatternFromMuscleWiki(
    name: string,
    force: string | null,
    mechanic: string | null,
    muscles: string[],
    category: string
): string {
    const lName = name.toLowerCase();
    const lMuscles = muscles.map(m => m.toLowerCase());

    // Chest exercises
    if (lMuscles.some(m => m.includes("chest"))) {
        if (lName.includes("fly") || lName.includes("crossover")) return "horizontal_push";
        if (lName.includes("incline") || lName.includes("overhead")) return "vertical_push";
        return "horizontal_push";
    }

    // Back exercises
    if (lMuscles.some(m => m.includes("lat") || m.includes("upper back"))) {
        if (lName.includes("row")) return "horizontal_pull";
        if (lName.includes("pull") || lName.includes("chin") || lName.includes("pulldown")) return "vertical_pull";
        return "horizontal_pull";
    }

    // Legs
    if (lMuscles.some(m => m.includes("quad"))) {
        if (lName.includes("squat") || lName.includes("leg press")) return "squat";
        if (lName.includes("lunge") || lName.includes("split")) return "lunge";
        return "squat";
    }

    if (lMuscles.some(m => m.includes("hamstring") || m.includes("glute"))) {
        if (lName.includes("deadlift") || lName.includes("hip thrust") || lName.includes("good morning")) return "hinge";
        return "hinge";
    }

    if (lMuscles.some(m => m.includes("calf"))) return "isolation";

    // Shoulders
    if (lMuscles.some(m => m.includes("deltoid") || m.includes("shoulder"))) {
        if (lName.includes("press")) return "vertical_push";
        if (lName.includes("raise") || lName.includes("lateral")) return "isolation";
        if (force === "pull") return "horizontal_pull";
        return "vertical_push";
    }

    // Arms → isolation
    if (lMuscles.some(m => m.includes("bicep") || m.includes("tricep") || m.includes("forearm"))) {
        return "isolation";
    }

    // Abs
    if (lMuscles.some(m => m.includes("abdominal") || m.includes("oblique"))) {
        return "core";
    }

    // Fallback by force
    if (force === "push") return "horizontal_push";
    if (force === "pull") return "horizontal_pull";

    return "isolation";
}

async function main() {
    console.log("🏋️ Starting MuscleWiki exercise sync...\n");

    if (!API_KEY) {
        console.error("❌ No MUSCLEWIKI_API_KEY in .env");
        process.exit(1);
    }

    let callCount = 0;
    let upsertedCount = 0;

    // Step 1: Fetch exercise IDs per priority category
    console.log("Step 1: Fetching exercise lists by category...");
    const exerciseIds: number[] = [];

    for (const cat of PRIORITY_CATEGORIES) {
        let offset = 0;
        let total = Infinity;

        while (offset < total) {
            const url = `${API_BASE}/exercises?limit=100&offset=${offset}&category=${cat}`;
            const res: Response = await fetch(url, { headers });
            callCount++;

            if (!res.ok) {
                console.error(`  ⚠️ Failed for ${cat} (offset ${offset}): ${res.status}`);
                break;
            }

            const data: { total: number; results: { id: number; name: string }[] } = await res.json();
            total = data.total;
            for (const ex of data.results) {
                if (!exerciseIds.includes(ex.id)) {
                    exerciseIds.push(ex.id);
                }
            }
            offset += 100;
        }
        console.log(`  ${cat}: done`);
    }

    console.log(`  Total unique exercises: ${exerciseIds.length} (${callCount} API calls used)\n`);

    // Step 2: Fetch details for each exercise
    console.log("Step 2: Fetching exercise details with videos...");
    const budgetRemaining = 490 - callCount; // leave 10 call buffer
    const idsToFetch = exerciseIds.slice(0, budgetRemaining);
    console.log(`  Fetching ${idsToFetch.length} exercises (budget: ${budgetRemaining} remaining)\n`);

    for (const id of idsToFetch) {
        try {
            const res: Response = await fetch(`${API_BASE}/exercises/${id}`, { headers });
            callCount++;

            if (!res.ok) continue;

            const ex = await res.json();
            const name: string = ex.name || "";
            if (!name) continue;

            const muscles: string[] = ex.primary_muscles || [];
            const category: string = ex.category || "";
            const force: string | null = ex.force || null;
            const mechanic: string | null = ex.mechanic || null;
            const difficulty: string | null = ex.difficulty || null;
            const steps: { number: number; description: string }[] = ex.steps || [];
            const videos: { url: string; angle: string }[] = ex.videos || [];

            // Get first male front video, then any video
            const bestVideo = videos.find(v =>
                v.url.includes("male") && v.url.includes("front")
            ) || videos[0];

            const videoUrl = bestVideo?.url || null;

            const equipment = EQUIP_MAP[category.toLowerCase()] || category.toLowerCase();
            const target = muscles[0]?.toLowerCase() || "full body";
            const bodyPart = MUSCLE_TO_BODYPART[target] || "other";
            const movementPattern = inferPatternFromMuscleWiki(name, force, mechanic, muscles, category);
            const instructions = steps.map(s => s.description);

            // Use musclewiki:<id> to not collide with wger IDs
            const dbId = `mw_${id}`;

            await db.exercise.upsert({
                where: { id: dbId },
                update: {
                    name,
                    equipment,
                    target,
                    bodyPart,
                    movementPattern,
                    difficulty: difficulty?.toLowerCase() || null,
                    force: force?.toLowerCase() || null,
                    mechanic: mechanic?.toLowerCase() || null,
                    instructions,
                    gifUrl: "",
                    videoUrl,
                },
                create: {
                    id: dbId,
                    name,
                    equipment,
                    target,
                    bodyPart,
                    movementPattern,
                    difficulty: difficulty?.toLowerCase() || null,
                    force: force?.toLowerCase() || null,
                    mechanic: mechanic?.toLowerCase() || null,
                    instructions,
                    gifUrl: "",
                    videoUrl,
                },
            });

            upsertedCount++;
            if (upsertedCount % 50 === 0) {
                console.log(`  Progress: ${upsertedCount} exercises synced (${callCount} API calls)...`);
            }
        } catch (e) {
            console.error(`  ⚠️ Error parsing/upserting ${id}:`, e);
        }
    }

    console.log(`\n✅ MuscleWiki sync complete!`);
    console.log(`   Synced: ${upsertedCount} exercises`);
    console.log(`   API calls used: ${callCount} / 500`);

    await pool.end();
}

main().catch((err) => {
    console.error("Fatal sync error:", err);
    process.exit(1);
});
