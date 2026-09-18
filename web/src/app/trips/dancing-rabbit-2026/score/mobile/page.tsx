import Link from "next/link";

import { DancingRabbitMobileScoreApp } from "@/components/dancing-rabbit-mobile-score-app";
import { dancingRabbitTrip } from "@/lib/dancing-rabbit";

export default function DancingRabbitMobileScorePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,252,246,0.98),_rgba(238,242,229,1)_48%,_rgba(211,224,202,0.92)_100%)]">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-3 py-4">
        <h1 className="sr-only">{dancingRabbitTrip.name} mobile scoring</h1>
        <DancingRabbitMobileScoreApp />
        <nav aria-label="Scoring links" className="flex flex-wrap justify-center gap-2">
            <Link
              href="/trips/dancing-rabbit-2026/score"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Full scoring
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Trip home
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026/handicaps"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Handicaps
            </Link>
        </nav>
      </div>
    </main>
  );
}
