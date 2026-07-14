import type { Metadata } from "next";
import Link from "next/link";

import {
  MajorScoreboard,
  type LeagueMajorScoreboardRow,
} from "@/components/major-scoreboard";
import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { pgaChampionship2026Field } from "@/lib/major-fields";
import {
  buildPayoutDecision,
  getActiveRostersForYear,
  normalizeGolferNameForFieldCheck,
} from "@/lib/league";

export const metadata: Metadata = {
  title: "2026 PGA Championship | Major Pool Winners",
  description:
    "League-focused 2026 PGA Championship result, payout summary, and scoring archive.",
};

const seasonYear = 2026;
const pgaMajorId = "major_2026_pga";
const eventWeekStartDate = "2026-05-11";
const leaderboardApiPath = "/api/majors/2026-pga-championship/leaderboard";
const pgaResult = {
  winner: "Aaron Rai",
  score: "9-under 271",
  margin: "3 strokes",
  runnerUp: "Jon Rahm and Alex Smalley",
  finalRound: "65",
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  return (
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start) +
    " - " +
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end)
  );
}

export default function PgaChampionship2026Page() {
  const pgaMajor = majors.find((major) => major.id === pgaMajorId);
  const payoutDecision = pgaMajor
    ? buildPayoutDecision(pgaMajor, leagueTerm, golfers, rosters, members)
    : null;
  const leagueRows = getLeaguePgaRows();
  const draftedInFieldRows = leagueRows.filter((row) => row.isInField);
  const missingRows = leagueRows.filter((row) => !row.isInField);
  const winningMember = payoutDecision?.winnerMatch.member;
  const payoutEvent = payoutDecision?.payoutEvent;
  const teams = members.map((member) => {
    const teamRows = leagueRows
      .filter((row) => row.memberId === member.id)
      .sort((left, right) => left.golferName.localeCompare(right.golferName));

    return {
      member,
      rows: teamRows,
      inFieldCount: teamRows.filter((row) => row.isInField).length,
    };
  });

  const championshipDates = pgaMajor
    ? formatDateRange(pgaMajor.startDate, pgaMajor.endDate)
    : "May 14 - May 17, 2026";
  const eventWeekDates = pgaMajor
    ? formatDateRange(eventWeekStartDate, pgaMajor.endDate)
    : "May 11 - May 17, 2026";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.96),_rgba(245,239,226,1)_44%,_rgba(223,233,229,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,_rgba(18,52,45,0.98),_rgba(36,96,103,0.94)_52%,_rgba(187,157,83,0.86)_100%)] text-white shadow-[0_30px_90px_rgba(18,52,45,0.18)]">
          <div className="grid gap-7 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-9 lg:py-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
                Final major result
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                2026 PGA Championship
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Aaron Rai closed with a {pgaResult.finalRound} at Aronimink to
                win the Wanamaker Trophy at {pgaResult.score}, {pgaResult.margin} clear of{" "}
                {pgaResult.runnerUp}. The league result is settled here with
                field context, payout impact, and the final ESPN scoring archive.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/seasons/2026"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  Back to 2026 season
                </Link>
                <Link
                  href="/majors"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  Majors hub
                </Link>
                <a
                  href="https://www.espn.com/golf/leaderboard?tournamentId=401811947"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  ESPN leaderboard
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HeroMetric
                label="Champion"
                value={pgaResult.winner}
                note={`${pgaResult.score} at ${pgaMajor?.venue ?? "Aronimink Golf Club"}`}
              />
              <HeroMetric
                label="League winner"
                value={winningMember?.displayName ?? "Rostered winner"}
                note={
                  winningMember
                    ? `${winningMember.teamName} held Rai for the PGA payout.`
                    : "Winner ownership is unresolved."
                }
              />
              <HeroMetric
                label="Payout"
                value={
                  payoutEvent
                    ? `$${payoutEvent.totalPayout.toLocaleString()}`
                    : "Pending"
                }
                note={
                  payoutEvent
                    ? `$${payoutEvent.amountPerLosingMember} per losing member, marked complete.`
                    : "No payout event is available."
                }
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <DashboardStat
            label="Field size"
            value={pgaChampionship2026Field.length.toString()}
            note="Stored PGA Championship field used for league matching."
          />
          <DashboardStat
            label="Drafted in field"
            value={draftedInFieldRows.length.toString()}
            note="Active league golfers matched into the PGA field."
          />
          <DashboardStat
            label="Runner-up score"
            value="-6"
            note="Jon Rahm and Alex Smalley finished three shots back."
          />
          <DashboardStat
            label="Payment status"
            value="Paid"
            note="All five losing-member obligations are marked complete."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[1.5rem] border border-line bg-card/92 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Result
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Rai breaks through
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              The final leaderboard has Rai first, Rahm and Smalley tied second,
              and Justin Thomas, Matti Schmid, and Ludvig Aberg tied fourth.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-line bg-card/92 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              League impact
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Team Buckingham cashes
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Ed Buckingham rostered Aaron Rai, so the PGA joins the 2026
              Masters as a drafted-winner payout for Team Buckingham.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-line bg-card/92 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Event window
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {championshipDates}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Event-week tracking ran {eventWeekDates}, with final scoring now
              preserved from the ESPN feed.
            </p>
          </article>
        </section>

        <MajorScoreboard
          rows={leagueRows}
          leaderboardApiPath={leaderboardApiPath}
          eyebrow="Final scoreboard"
          title="Drafted golfers by finish"
          description="The table is limited to active league golfers and now acts as the scoring archive for the completed PGA Championship."
        />

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[2rem] border border-line bg-card/92 p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                  Drafted field
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Team-by-team field availability
                </h2>
              </div>
              <p className="text-sm text-muted">
                {draftedInFieldRows.length} league golfers currently available.
              </p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {teams.map((team) => (
                <article
                  key={team.member.id}
                  className="rounded-[1.35rem] border border-line bg-background/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        {team.member.teamName}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {team.member.displayName}
                      </h3>
                    </div>
                    <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {team.inFieldCount}/{team.rows.length}
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {team.rows.map((row) => (
                      <li
                        key={row.golferId}
                        className="flex items-center justify-between gap-3 rounded-[1rem] border border-line bg-white/55 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {row.golferName}
                        </span>
                        <span
                          className={
                            row.isInField
                              ? "text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700"
                              : "text-xs font-semibold uppercase tracking-[0.12em] text-amber-700"
                          }
                        >
                          {row.isInField ? "In" : "Out"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <section className="rounded-[2rem] border border-line bg-card/92 p-5 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Missing watch
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Active golfers not listed
              </h2>
              <div className="mt-5 space-y-3">
                {missingRows.length > 0 ? (
                  missingRows.map((row) => (
                    <article
                      key={row.golferId}
                      className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4"
                    >
                      <p className="font-semibold text-amber-950">
                        {row.golferName}
                      </p>
                      <p className="mt-1 text-sm text-amber-800">
                        {row.teamName} | {row.memberName}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                    Every active league golfer is currently listed in the field.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-[#173c27] p-5 text-white sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100/85">
                Scoring archive
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Final leaderboard
              </h2>
              <p className="mt-4 text-sm leading-6 text-emerald-50/86">
                Use ESPN for the full tournament board, player scorecards, and
                finishing positions beyond the league-owned golfers shown here.
              </p>
              <a
                href="https://www.espn.com/golf/leaderboard?tournamentId=401811947"
                className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
              >
                View ESPN leaderboard
              </a>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function HeroMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold leading-7">{value}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-50/82">{note}</p>
    </article>
  );
}

function DashboardStat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-line bg-card/92 p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
    </article>
  );
}

function getLeaguePgaRows(): LeagueMajorScoreboardRow[] {
  const activeRosterPicks = getActiveRostersForYear(rosters, seasonYear);
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const membersById = new Map(members.map((member) => [member.id, member]));
  const memberSortOrder = new Map(
    members.map((member, index) => [member.id, member.initialDraftOrder ?? index]),
  );
  const fieldNames = new Set(
    pgaChampionship2026Field.map((fieldGolfer) =>
      normalizeGolferNameForFieldCheck(fieldGolfer),
    ),
  );

  return activeRosterPicks
    .flatMap((rosterPick) => {
      const golfer = golfersById.get(rosterPick.golferId);
      const member = membersById.get(rosterPick.memberId);

      if (!golfer || !member) {
        return [];
      }

      return [
        {
          golferId: golfer.id,
          memberId: member.id,
          golferName: golfer.name,
          memberName: member.displayName,
          teamName: member.teamName ?? member.displayName,
          isInField: fieldNames.has(normalizeGolferNameForFieldCheck(golfer.name)),
        },
      ];
    })
    .sort((left, right) => {
      const leftOrder =
        memberSortOrder.get(left.memberId) ?? Number.POSITIVE_INFINITY;
      const rightOrder =
        memberSortOrder.get(right.memberId) ?? Number.POSITIVE_INFINITY;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.golferName.localeCompare(right.golferName);
    });
}
