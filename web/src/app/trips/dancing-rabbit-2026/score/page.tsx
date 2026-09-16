import Link from "next/link";

import { DancingRabbitScoreApp } from "@/components/dancing-rabbit-score-app";
import { dancingRabbitTrip } from "@/lib/dancing-rabbit";

export default function DancingRabbitScorePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,252,246,0.98),_rgba(238,242,229,1)_48%,_rgba(211,224,202,0.92)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[1.5rem] border border-line bg-card/90 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Live Scoring
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{dancingRabbitTrip.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Scores are saved in this browser and recalculated instantly for daily
              games, overall points, bounties, and settlement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/trips/dancing-rabbit-2026"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Trip home
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026/print"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Print cards
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026/score/mobile"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
            >
              Mobile scoring
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026/handicaps"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Handicaps
            </Link>
          </div>
        </header>

        <DancingRabbitScoreApp />
      </div>
    </main>
  );
}
