import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { dancingRabbitTrip } from "@/lib/dancing-rabbit";

type ScorePayload = {
  dayId?: string;
  playerId?: string;
  holeNumber?: number;
  gross?: number;
};

export async function POST(request: Request) {
  try {
    return await saveScore(request);
  } catch (error) {
    console.error("[trip-scores] Save failed", error);
    return NextResponse.json({ error: "Score was not confirmed saved. Please retry." }, { status: 503 });
  }
}

async function saveScore(request: Request) {
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
  try {
    return await clearScores(request);
  } catch (error) {
    console.error("[trip-scores] Clear failed", error);
    return NextResponse.json({ error: "Scores could not be cleared. Please retry." }, { status: 503 });
  }
}

async function clearScores(request: Request) {
  const payload = (await request.json()) as { dayId?: string };
  const dayId = payload.dayId?.trim();

  if (!dayId || !dancingRabbitTrip.days.some((day) => day.id === dayId)) {
    return NextResponse.json({ error: "Missing day." }, { status: 400 });
  }

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long", timeZone: "America/Chicago",
  }).format(new Date()).toLowerCase();
  const isAdmin = request.headers.get("x-admin-password") ===
    (process.env.DANCING_RABBIT_ADMIN_PASSWORD ?? "rabbit2026");
  const cleared = await prisma.$transaction(async (tx) => {
    const paid = await tx.dancingRabbitPayment.count({ where: { dayId } });
    if (!isAdmin && (dayId !== today || paid > 0)) return false;
    await tx.dancingRabbitScore.deleteMany({ where: { dayId } });
    return true;
  });

  if (!cleared) return NextResponse.json({
    error: "Scores for a prior, future, or settled day cannot be cleared except by an administrator.",
    adminRequired: true,
  }, { status: 403 });

  return NextResponse.json({ ok: true });
}
