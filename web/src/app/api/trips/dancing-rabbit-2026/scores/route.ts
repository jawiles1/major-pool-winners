import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type ScorePayload = {
  dayId?: string;
  playerId?: string;
  holeNumber?: number;
  gross?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ScorePayload;
  const dayId = payload.dayId?.trim();
  const playerId = payload.playerId?.trim();
  const holeNumber = Number(payload.holeNumber);
  const gross = Number(payload.gross);

  if (!dayId || !playerId || !Number.isInteger(holeNumber) || holeNumber < 1 || holeNumber > 18) {
    return NextResponse.json({ error: "Invalid score target." }, { status: 400 });
  }

  if (!Number.isFinite(gross) || gross <= 0) {
    await prisma.dancingRabbitScore.deleteMany({
      where: { dayId, playerId, holeNumber },
    });

    return NextResponse.json({ ok: true });
  }

  await prisma.dancingRabbitScore.upsert({
    where: {
      dayId_playerId_holeNumber: {
        dayId,
        playerId,
        holeNumber,
      },
    },
    update: { gross: Math.round(gross) },
    create: {
      dayId,
      playerId,
      holeNumber,
      gross: Math.round(gross),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const payload = (await request.json()) as { dayId?: string };
  const dayId = payload.dayId?.trim();

  if (!dayId) {
    return NextResponse.json({ error: "Missing day." }, { status: 400 });
  }

  await prisma.dancingRabbitScore.deleteMany({
    where: { dayId },
  });

  return NextResponse.json({ ok: true });
}
