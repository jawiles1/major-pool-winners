import Link from "next/link";
import { DancingRabbitOverall } from "@/components/dancing-rabbit-overall";
import { DancingRabbitPlayerHandicaps } from "@/components/dancing-rabbit-player-handicaps";

import {
  dancingRabbitTrip,
  formatMoney,
  getCourse,
} from "@/lib/dancing-rabbit";

export default function DancingRabbitTripPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,252,246,0.98),_rgba(238,242,229,1)_48%,_rgba(211,224,202,0.92)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,_rgba(18,55,35,0.97),_rgba(47,106,69,0.94)_56%,_rgba(220,190,118,0.72)_100%)] !text-white shadow-[0_30px_90px_rgba(18,55,35,0.18)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/85">
                2026 Golf Trip
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {dancingRabbitTrip.name}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Printable daily cards and live scoring for the four-day Dancing
                Rabbit game sheet: dots, net double bogey caps, presses, A/B/C
                balls, bounties, overall points, and settlement.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#overall-game" className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14">Overall game</Link>
                <Link
                  href="/trips/dancing-rabbit-2026/score"
                  className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14"
                >
                  Enter scores
                </Link>
                <Link
                  href="/trips/dancing-rabbit-2026/score/mobile"
                  className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14"
                >
                  Mobile scoring
                </Link>
                <Link
                  href="/trips/dancing-rabbit-2026/print"
                  className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14"
                >
                  Print scorecards
                </Link>
                <Link
                  href="/trips/dancing-rabbit-2026/verification"
                  className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14"
                >
                  Verification
                </Link>
                <Link
                  href="/trips/dancing-rabbit-2026/handicaps"
                  className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/14"
                >
                  Handicaps
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.5rem] border border-white/14 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                  Overall pool
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatMoney(dancingRabbitTrip.overallBuyIn)}/man
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/84">
                  Pays {dancingRabbitTrip.overallPayouts.map(formatMoney).join(" / ")}.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/14 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                  Field
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {dancingRabbitTrip.players.length} players
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/84">
                  Azaleas and Oaks Blue tee handicaps are preloaded.
                </p>
              </article>
            </div>
          </div>
        </header>

        <DancingRabbitOverall />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dancingRabbitTrip.days.map((day) => {
            const course = getCourse(day.courseId);

            return (
              <article key={day.id} className="rounded-[1.5rem] border border-line bg-card/90 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {day.label}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{course.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {day.time} - {course.tee} tees - {course.rating}/{course.slope}
                </p>
                <div className="mt-4 space-y-2 text-sm leading-6 text-muted">
                  <p>{formatLabel(day.format)}</p>
                  <p>
                    Overall: {day.overallEligible ? "eligible" : "excluded"}
                  </p>
                  <p>Skins: {day.skins === "none" ? "TBD/off" : day.skins}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Players
            </p>
            <DancingRabbitPlayerHandicaps />
          </article>

          <article className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Verified Course Data
            </p>
            <div className="mt-5 grid gap-4">
              {dancingRabbitTrip.courses.map((course) => (
                <div key={course.id} className="rounded-[1.25rem] border border-line bg-background/70 p-4">
                  <h2 className="text-lg font-semibold">{course.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {course.tee}: {course.holes.reduce((sum, hole) => sum + hole.yards, 0)} yards,
                    par {course.holes.reduce((sum, hole) => sum + hole.par, 0)},{" "}
                    {course.rating}/{course.slope}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-muted">{course.source}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm leading-6 text-muted">
              {dancingRabbitTrip.verificationNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function formatLabel(format: string): string {
  return format
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
