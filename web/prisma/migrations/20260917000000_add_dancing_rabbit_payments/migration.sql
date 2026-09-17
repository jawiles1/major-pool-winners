CREATE TABLE "DancingRabbitPayment" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "fromPlayerId" TEXT NOT NULL,
    "toPlayerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "calculationKey" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DancingRabbitPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DancingRabbitPayment_dayId_idx" ON "DancingRabbitPayment"("dayId");
CREATE INDEX "DancingRabbitPayment_fromPlayerId_idx" ON "DancingRabbitPayment"("fromPlayerId");
CREATE INDEX "DancingRabbitPayment_toPlayerId_idx" ON "DancingRabbitPayment"("toPlayerId");
