import { NextResponse } from "next/server";

import {
  ESPN_OPEN_CHAMPIONSHIP_2026_EVENT_ID,
  ESPN_OPEN_CHAMPIONSHIP_2026_LEADERBOARD_URL,
  mapEspnGolfLeaderboard,
} from "@/lib/espn-golf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(ESPN_OPEN_CHAMPIONSHIP_2026_LEADERBOARD_URL, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: 30,
      },
    });

    if (!response.ok) {
      throw new Error(`ESPN leaderboard request failed: ${response.status}`);
    }

    const leaderboard = mapEspnGolfLeaderboard(await response.json(), {
      sourceUrl: ESPN_OPEN_CHAMPIONSHIP_2026_LEADERBOARD_URL,
      fallbackEventId: ESPN_OPEN_CHAMPIONSHIP_2026_EVENT_ID,
      fallbackEventName: "The Open",
      fallbackCourseName: "Royal Birkdale Golf Club",
    });

    return NextResponse.json(leaderboard, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load leaderboard data.";

    return NextResponse.json(
      {
        error: message,
        source: ESPN_OPEN_CHAMPIONSHIP_2026_LEADERBOARD_URL,
      },
      { status: 502 },
    );
  }
}
