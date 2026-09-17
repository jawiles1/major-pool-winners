import { NextResponse } from "next/server";

import { dancingRabbitTrip, type DayId } from "@/lib/dancing-rabbit";
import { prisma } from "@/lib/prisma";

type PaymentInput = {
  dayId?: string;
  fromPlayerId?: string;
  toPlayerId?: string;
  amount?: number;
  calculationKey?: string;
};

const dayIds = new Set(dancingRabbitTrip.days.map((day) => day.id));
const playerIds = new Set(dancingRabbitTrip.players.map((player) => player.id));

export async function POST(request: Request) {
  const body = (await request.json()) as { payments?: PaymentInput[] };
  const payments = body.payments;

  if (!Array.isArray(payments) || payments.length === 0 || payments.length > 20) {
    return NextResponse.json({ error: "Provide between 1 and 20 payments." }, { status: 400 });
  }

  try {
    const validated = payments.map((payment) => {
      const dayId = payment.dayId?.trim() as DayId | undefined;
      const fromPlayerId = payment.fromPlayerId?.trim();
      const toPlayerId = payment.toPlayerId?.trim();
      const amount = Math.round(Number(payment.amount) * 100) / 100;
      const calculationKey = payment.calculationKey;

      if (
        !dayId ||
        !dayIds.has(dayId) ||
        !fromPlayerId ||
        !playerIds.has(fromPlayerId) ||
        !toPlayerId ||
        !playerIds.has(toPlayerId) ||
        fromPlayerId === toPlayerId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        typeof calculationKey !== "string" ||
        calculationKey.length > 20_000
      ) {
        throw new Error("Invalid payment.");
      }

      return { dayId, fromPlayerId, toPlayerId, amount, calculationKey };
    });

    const created = await prisma.$transaction(
      validated.map((data) => prisma.dancingRabbitPayment.create({ data })),
    );

    return NextResponse.json({
      ok: true,
      payments: created.map((payment) => ({
        ...payment,
        paidAt: payment.paidAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid payment.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { paymentId?: string };
  const paymentId = body.paymentId?.trim();

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment." }, { status: 400 });
  }

  await prisma.dancingRabbitPayment.deleteMany({ where: { id: paymentId } });

  return NextResponse.json({ ok: true });
}
