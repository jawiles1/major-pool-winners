import Link from "next/link";

import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { usOpen2026Field } from "@/lib/major-fields";
import {
  buildPayoutDecision,
  getFieldAvailabilityForYear,
  getMemberRosterForYear,
  getResolvedMajors,
  getSeasonMajors,
  getStandings,
} from "@/lib/league";

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start) +
    " - " +
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Season2026Page() {
  const seasonYear = 2026;
  const seasonMajors = getSeasonMajors(majors, seasonYear);
  const resolvedMajors = getResolvedMajors(seasonMajors);
  const upcomingMajors = seasonMajors.filter((major) => major.status === "upcoming");
  const payoutDecisions = resolvedMajors.map((major) =>
    buildPayoutDecision(major, leagueTerm, golfers, rosters, members),
  );
  const standings = getStandings(
    resolvedMajors,
    leagueTerm,
    golfers,
    rosters,
    members,
  );
  const leader = standings[0];
  const usOpenFieldAvailability = getFieldAvailabilityForYear(
    rosters,
    golfers,
    seasonYear,
    [...usOpen2026Field],
  );
  const missingUsOpenGolfersText =
    usOpenFieldAvailability.missingGolfers.map((golfer) => golfer.name).join(" and ");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_42%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(15,55,74,0.97),_rgba(26,104,130,0.93)_54%,_rgba(128,181,190,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(15,55,74,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/85">
                Current Season
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                2026 has two majors settled, and Shinnecock is next.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-cyan-50/88 sm:text-base">
                This page tracks the live season state after the 2025 offseason:
                completed majors, upcoming schedule, and the current rosters in
                play for the year.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/seasons"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Back to seasons
                </Link>
                <Link
                  href="/standings"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Open standings
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                  Current leader
                </p>
                <p className="mt-2 text-3xl font-semibold">{leader?.member.displayName}</p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/82">
                  {leader ? `${formatCurrency(leader.totalWon)} earned so far.` : "No results yet."}
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Resolved majors",
              value: resolvedMajors.length.toString(),
              note: "Completed and paid majors in 2026 so far.",
            },
            {
              label: "Upcoming majors",
              value: upcomingMajors.length.toString(),
              note: "Remaining events still to be played this season.",
            },
            {
              label: "Season status",
              value: "In progress",
              note: "The U.S. Open is the next active major page.",
            },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-line bg-card/90 p-5">
              <p className="text-sm font-medium text-muted">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Completed majors
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            2026 results so far
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {payoutDecisions.map(({ payoutEvent, winnerMatch }) => {
              const major = resolvedMajors.find((entry) => entry.id === payoutEvent.majorId);
              const winnerName = winnerMatch.golfer?.name ?? major?.winnerName ?? "Unknown winner";
              return (
                <article key={payoutEvent.id} className="rounded-[1.5rem] border border-line bg-background/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {major?.name}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{winnerName}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {major ? `${formatDateRange(major.startDate, major.endDate)} • ${major.venue}` : "Major details unavailable"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {winnerMatch.member
                      ? `${winnerMatch.member.displayName} held the winner. Payout settled at ${formatCurrency(payoutEvent.totalPayout)} total.`
                      : "Winner was not rostered, so no payout event was created."}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Upcoming schedule
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Remaining 2026 majors
          </h2>
          <div className="mt-6 rounded-[1.5rem] border border-line bg-background/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              U.S. Open field check
            </p>
            <p className="mt-3 text-base leading-7 text-foreground">
              {usOpenFieldAvailability.listedGolferCount} of {usOpenFieldAvailability.activeGolferCount} active league golfers are listed for the upcoming U.S. Open.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {usOpenFieldAvailability.missingGolfers.length > 0
                ? `${missingUsOpenGolfersText} ${usOpenFieldAvailability.missingGolfers.length === 1 ? "is" : "are"} not in the current field list.`
                : "Every active league golfer is currently listed in the field."}
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {upcomingMajors.map((major) => (
              <article key={major.id} className="rounded-[1.5rem] border border-line bg-background/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {major.name}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{major.venue}</h3>
                <p className="mt-2 text-sm text-muted">{major.location}</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {formatDateRange(major.startDate, major.endDate)}
                </p>
                {major.id === "major_2026_us_open" ? (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm leading-6 text-muted">
                      {usOpenFieldAvailability.missingGolfers.length > 0
                        ? `League golfers not currently listed: ${missingUsOpenGolfersText}.`
                        : "All active league golfers are currently listed in the field."}
                    </p>
                    <Link
                      href="/majors/2026-us-open"
                      className="inline-flex rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card"
                    >
                      Open U.S. Open dashboard
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            2026 rosters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Teams currently in play
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const roster = getMemberRosterForYear(member.id, rosters, golfers, seasonYear);
              return (
                <article key={member.id} className="rounded-[1.5rem] border border-line bg-background/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {member.teamName}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{member.displayName}</h3>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2">
                    {roster.map((golfer) => (
                      <li key={golfer.id}>{golfer.name}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
