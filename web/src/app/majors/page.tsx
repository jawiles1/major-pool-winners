import Link from "next/link";

import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { buildPayoutDecision, getSeasonMajors } from "@/lib/league";

const completedSeasonYear = 2025;
const upcomingSeasonYear = 2026;

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

export default function MajorsPage() {
  const majors2025 = getSeasonMajors(majors, completedSeasonYear);
  const majors2026 = getSeasonMajors(majors, upcomingSeasonYear);
  const payoutDecisions2025 = majors2025.map((major) =>
    buildPayoutDecision(major, leagueTerm, golfers, rosters, members),
  );

  const draftedWins = payoutDecisions2025.filter(
    ({ payoutEvent }) => payoutEvent.isDraftedWinner,
  ).length;
  const totalPayoutValue = payoutDecisions2025.reduce(
    (sum, { payoutEvent }) => sum + payoutEvent.totalPayout,
    0,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_45%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(40,61,24,0.97),_rgba(85,112,54,0.93)_54%,_rgba(194,165,96,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(23,60,39,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-100/85">
                Majors Hub
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                The four events that drive every season.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-lime-50/88 sm:text-base">
                This page tracks the completed majors from 2025 and the current
                2026 season state. It is the launch point for the dedicated
                major pages that support scoring, field context, and final payout
                summaries.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/seasons/2025"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  View 2025 season
                </Link>
                <Link
                  href="/teams"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Browse teams
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-lime-100/80">
                  2025 drafted winners
                </p>
                <p className="mt-2 text-3xl font-semibold">{draftedWins}</p>
                <p className="mt-2 text-sm leading-6 text-lime-50/82">
                  Three of the four 2025 majors produced league payouts.
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-lime-100/80">
                  2025 payout value
                </p>
                <p className="mt-2 text-3xl font-semibold">${totalPayoutValue}</p>
                <p className="mt-2 text-sm leading-6 text-lime-50/82">
                  Total value created by 2025 winning golfers held by teams.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "League term",
              value: "16 majors",
              note: "Four majors across each season from 2025 through 2028.",
            },
            {
              label: "Completed archive",
              value: majors2025.length.toString(),
              note: "2025 is ready for payout and history review.",
            },
            {
              label: "Next wave",
              value: majors2026.length.toString(),
              note: "2026 results and remaining major pages are loaded.",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-line bg-card/90 p-5"
            >
              <p className="text-sm font-medium text-muted">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Completed season
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2025 majors and payout outcomes
              </h2>
            </div>
            <p className="text-sm text-muted">
              Historical view of the season that started the league term.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {payoutDecisions2025.map(({ payoutEvent, obligations, winnerMatch }) => {
              const major = majors2025.find(
                (seasonMajor) => seasonMajor.id === payoutEvent.majorId,
              );
              const winnerName =
                winnerMatch.golfer?.name ?? major?.winnerName ?? "Unknown winner";

              return (
                <article
                  key={payoutEvent.id}
                  className="rounded-[1.5rem] border border-line bg-background/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        {major?.name}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{winnerName}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {formatDateRange(
                          major?.startDate ?? "",
                          major?.endDate ?? "",
                        )}{" "}
                        • {major?.venue}
                      </p>
                    </div>
                    <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {payoutEvent.isDraftedWinner ? "Payout complete" : "Undrafted result"}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted">
                    {winnerMatch.member
                      ? `${winnerMatch.member.displayName} held the winner. ${obligations.length} member payments were settled at $${payoutEvent.amountPerLosingMember} each.`
                      : "No league payout was triggered because the winning golfer was not rostered during the season."}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Current season
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2026 majors results and schedule
              </h2>
            </div>
            <p className="text-sm text-muted">
              Masters, PGA, and U.S. Open are settled. The Open is ready for tournament week.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {majors2026.map((major) => (
              <article
                key={major.id}
                className="rounded-[1.5rem] border border-line bg-background/70 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      {major.name}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{major.venue}</h3>
                    <p className="mt-2 text-sm text-muted">{major.location}</p>
                  </div>
                  <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {major.status.replaceAll("_", " ")}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted">
                  {formatDateRange(major.startDate, major.endDate)}
                </p>
                {major.winnerName ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Winner: {major.winnerName}
                  </p>
                ) : null}

                <div className="mt-4 rounded-[1.25rem] border border-dashed border-line bg-white/40 p-4 text-sm leading-6 text-muted">
                  {major.id === "major_2026_pga" ? (
                    <Link
                      href="/majors/2026-pga-championship"
                      className="font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Open the final PGA Championship result page.
                    </Link>
                  ) : major.id === "major_2026_us_open" ? (
                    <Link
                      href="/majors/2026-us-open"
                      className="font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Open the final U.S. Open result page.
                    </Link>
                  ) : major.id === "major_2026_open" ? (
                    <Link
                      href="/majors/2026-open-championship"
                      className="font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Open the Open Championship command center.
                    </Link>
                  ) : (
                    "Daily leaderboard tracking and cut-status context will live on the dedicated page for this major."
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
