import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const adminPassword = process.env.DANCING_RABBIT_ADMIN_PASSWORD ?? "rabbit2026";

type HandicapPayload = {
  overrides?: Partial<Record<string, Record<string, number>>>;
};

export async function PUT(request: Request) {
  if (request.headers.get("x-admin-password") !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as HandicapPayload;
  const overrides = payload.overrides ?? {};

  const writes = [];

  for (const [dayId, playerValues] of Object.entries(overrides)) {
    for (const [playerId, handicap] of Object.entries(playerValues ?? {})) {
      if (!Number.isInteger(handicap) || handicap < 0 || handicap > 36) {
        continue;
      }

      writes.push(
        prisma.dancingRabbitHandicapOverride.create({
          data: {
            dayId,
            playerId,
            handicap,
          },
        }),
      );
    }
  }

  await prisma.$transaction([
    prisma.dancingRabbitHandicapOverride.deleteMany(),
    ...writes,
  ]);

  return NextResponse.json({ ok: true });
}
