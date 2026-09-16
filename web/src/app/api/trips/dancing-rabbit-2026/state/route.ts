import { NextResponse } from "next/server";

import {
  createEmptyHandicapOverrideState,
  createEmptyScoreState,
  type DayId,
  type HandicapOverrideState,
  type PlayerId,
  type ScoreState,
} from "@/lib/dancing-rabbit";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [scoreRows, handicapRows] = await Promise.all([
    prisma.dancingRabbitScore.findMany(),
    prisma.dancingRabbitHandicapOverride.findMany(),
  ]);
  const scores = createEmptyScoreState();
  const handicapOverrides = createEmptyHandicapOverrideState();
  let updatedAt = 0;

  for (const row of scoreRows) {
    const dayId = row.dayId as DayId;
    const playerId = row.playerId as PlayerId;

    if (!scores[dayId]?.[playerId]) {
      continue;
    }

    scores[dayId][playerId][row.holeNumber] = row.gross;
    updatedAt = Math.max(updatedAt, row.updatedAt.getTime());
  }

  for (const row of handicapRows) {
    const dayId = row.dayId as DayId;

    if (!handicapOverrides[dayId]) {
      continue;
    }

    handicapOverrides[dayId]![row.playerId] = row.handicap;
    updatedAt = Math.max(updatedAt, row.updatedAt.getTime());
  }

  return NextResponse.json({
    scores,
    handicapOverrides,
    updatedAt,
  } satisfies {
    scores: ScoreState;
    handicapOverrides: HandicapOverrideState;
    updatedAt: number;
  });
}
