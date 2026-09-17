import { NextResponse } from "next/server";

import {
  createEmptyHandicapOverrideState,
  createEmptyScoreState,
  type DayId,
  type PlayerId,
} from "@/lib/dancing-rabbit";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [scoreRows, handicapRows, paymentRows] = await Promise.all([
    prisma.dancingRabbitScore.findMany(),
    prisma.dancingRabbitHandicapOverride.findMany(),
    prisma.dancingRabbitPayment.findMany({ orderBy: { paidAt: "asc" } }),
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
    payments: paymentRows.map((payment) => ({
      ...payment,
      paidAt: payment.paidAt.toISOString(),
    })),
    updatedAt,
  });
}
