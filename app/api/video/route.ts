import { NextResponse } from "next/server";
import ytSearch from "youtube-sr";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    try {
        // Search for the top video
        const videos = await ytSearch.search(query, { limit: 1, type: "video" });
        if (videos && videos.length > 0) {
            return NextResponse.json({ videoId: videos[0].id });
        }
        return NextResponse.json({ error: "No video found" }, { status: 404 });
    } catch (e) {
        console.error("YouTube search error:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
