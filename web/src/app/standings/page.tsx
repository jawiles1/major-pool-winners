import Link from "next/link";

import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { getResolvedMajors, getSeasonMajors, getStandings } from "@/lib/league";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StandingsPage() {
  const majors2025 = getSeasonMajors(majors, 2025);
  const majors2026Resolved = getResolvedMajors(getSeasonMajors(majors, 2026));
  const allResolvedMajors = getResolvedMajors(majors);

  const standings2025 = getStandings(
    majors2025,
    leagueTerm,
    golfers,
    rosters,
    members,
  );
  const standings2026 = getStandings(
    majors2026Resolved,
    leagueTerm,
    golfers,
    rosters,
    members,
  );
  const standingsToDate = getStandings(
    allResolvedMajors,
    leagueTerm,
    golfers,
    rosters,
    members,
  );

  const leaderToDate = standingsToDate[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_45%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(59,34,20,0.97),_rgba(137,87,44,0.93)_52%,_rgba(221,190,118,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(59,34,20,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/85">
                Standings
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Who has actually made the majors pay off.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-amber-50/88 sm:text-base">
                Standings are ranked by total earnings from major payouts. This
                page shows the 2025 race, the 2026 picture so far, and the full
                leaderboard across all completed majors to date.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/ledger"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Open ledger
                </Link>
                <Link
                  href="/majors"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Browse majors
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">
                  Leader to date
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {leaderToDate?.member.displayName}
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50/82">
                  {leaderToDate
                    ? `${formatCurrency(leaderToDate.totalWon)} in payout earnings so far.`
                    : "No resolved majors yet."}
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">
                  Resolved majors
                </p>
                <p className="mt-2 text-3xl font-semibold">{allResolvedMajors.length}</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/82">
                  Includes the full 2025 season plus the 2026 Masters and PGA.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "2025 completed majors",
              value: majors2025.length.toString(),
              note: "The inaugural season’s full payout race.",
            },
            {
              label: "2026 completed majors",
              value: majors2026Resolved.length.toString(),
              note: "Current season results recorded so far.",
            },
            {
              label: "Ranking rule",
              value: "Payout earnings",
              note: "Teams are ordered by total payout dollars won, not net settlement.",
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

        <StandingsSection
          title="All majors to date"
          subtitle="Combined leaderboard across every completed major currently in the system."
          rows={standingsToDate}
        />

        <StandingsSection
          title="2025 season standings"
          subtitle="The original season leaderboard from the first four majors."
          rows={standings2025}
        />

        <StandingsSection
          title="2026 season standings"
          subtitle="Current standings based on completed 2026 majors so far."
          rows={standings2026}
        />
      </div>
    </main>
  );
}

function StandingsSection({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ReturnType<typeof getStandings>;
}) {
  return (
    <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Leaderboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line">
        <div className="grid grid-cols-[0.55fr_1.9fr_1fr_0.8fr] gap-3 bg-[#173c27] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50">
          <div>Rank</div>
          <div>Team</div>
          <div>Earnings</div>
          <div>Wins</div>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.member.id}
            className={`grid grid-cols-[0.55fr_1.9fr_1fr_0.8fr] gap-3 px-4 py-4 text-sm ${
              index % 2 === 0 ? "bg-card/70" : "bg-background/70"
            }`}
          >
            <div className="font-semibold text-foreground">{row.rank}</div>
            <div>
              <p className="font-semibold text-foreground">{row.member.displayName}</p>
              <p className="text-xs text-muted">{row.member.teamName}</p>
            </div>
            <div className="font-semibold text-foreground">
              {formatCurrency(row.totalWon)}
            </div>
            <div className="text-muted">{row.draftedWins}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
