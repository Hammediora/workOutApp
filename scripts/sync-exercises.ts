import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
    WgerExerciseRaw,
    inferMovementPattern,
    resolveEquipment,
    resolveTarget,
    resolveBodyPart,
} from "../lib/exercisedb/normalize";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const WGER_BASE = "https://wger.de/api/v2";
const WGER_TOKEN = process.env.WGER_TOKEN;

const headers: Record<string, string> = {
    "Accept": "application/json",
};
if (WGER_TOKEN) {
    headers["Authorization"] = `Token ${WGER_TOKEN}`;
}

async function fetchAllPages<T>(url: string): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
        console.log(`  Fetching: ${nextUrl}`);
        const res: Response = await fetch(nextUrl, { headers });
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
        const data: { results: T[]; next: string | null } = await res.json();
        results.push(...data.results);
        nextUrl = data.next;
    }

    return results;
}

async function fetchTranslations(): Promise<Map<number, { name: string; description: string }>> {
    // Fetch English exercise names (language=2 is English in wger)
    const url = `${WGER_BASE}/exercise/search/?format=json&language=english&term=`;

    // The search endpoint isn't paginated the same way.
    // Instead, let's fetch translations directly.
    const translations: any[] = await fetchAllPages(`${WGER_BASE}/exercise/?language=2&format=json&limit=100`);

    // But the exercise endpoint doesn't have names. We need the exerciseinfo endpoint or we grab
    // translations from a different source.
    // Actually, the wger exercise endpoint only returns IDs/category/muscles.
    // Names come from a separate translation table.

    // Let's use the search API to build a name map from the exerciseinfo endpoint.
    // Actually the most reliable approach: fetch /api/v2/exerciseinfo/ which has translations embedded.

    return new Map();
}

async function main() {
    console.log("🏋️ Starting wger.de exercise sync...\n");

    // Step 1: Fetch all exercises (base data: category, muscles, equipment)
    console.log("Step 1: Fetching exercise base data...");
    const exercises = await fetchAllPages<WgerExerciseRaw>(
        `${WGER_BASE}/exercise/?language=2&format=json&limit=100`
    );
    console.log(`  Found ${exercises.length} exercises.\n`);

    // Step 2: Fetch English names via exerciseinfo (contains translations)
    // We'll batch-fetch exerciseinfo for each exercise
    console.log("Step 2: Fetching exercise names and images...");

    let upsertedCount = 0;
    let skippedCount = 0;

    for (const ex of exercises) {
        try {
            const infoRes = await fetch(`${WGER_BASE}/exerciseinfo/${ex.id}/?format=json`, { headers });

            if (!infoRes.ok) {
                skippedCount++;
                continue;
            }

            const info = await infoRes.json();

            // Find English translation
            const englishTranslation = info.translations?.find(
                (t: any) => t.language === 2
            );

            if (!englishTranslation || !englishTranslation.name) {
                skippedCount++;
                continue;
            }

            const name = englishTranslation.name;
            const description = englishTranslation.description || "";

            // Get image
            const mainImage = info.images?.find((img: any) => img.is_main);
            const gifUrl = mainImage?.image || "";

            // Resolve fields
            const equipment = resolveEquipment(ex.equipment);
            const target = resolveTarget(ex.muscles);
            const bodyPart = resolveBodyPart(ex.category);
            const movementPattern = inferMovementPattern(ex.category, ex.muscles, ex.equipment, name);

            // Extract instructions from description (strip HTML)
            const cleanDesc = description.replace(/<[^>]*>/g, "").trim();
            const instructions = cleanDesc
                ? cleanDesc.split(/\.\s+/).filter((s: string) => s.length > 5).map((s: string) => s.trim() + ".")
                : [];

            await db.exercise.upsert({
                where: { id: ex.id.toString() },
                update: {
                    name,
                    equipment,
                    target,
                    bodyPart,
                    movementPattern,
                    instructions,
                    gifUrl,
                },
                create: {
                    id: ex.id.toString(),
                    name,
                    equipment,
                    target,
                    bodyPart,
                    movementPattern,
                    instructions,
                    gifUrl,
                },
            });

            upsertedCount++;

            if (upsertedCount % 50 === 0) {
                console.log(`  Progress: ${upsertedCount} exercises synced...`);
            }
        } catch (err) {
            skippedCount++;
        }
    }

    console.log(`\n✅ Sync complete!`);
    console.log(`   Synced: ${upsertedCount} exercises`);
    console.log(`   Skipped: ${skippedCount} exercises (no English name or API error)`);

    await pool.end();
}

main().catch((err) => {
    console.error("Fatal sync error:", err);
    process.exit(1);
});
