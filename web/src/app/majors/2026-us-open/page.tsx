import type { Metadata } from "next";
import Link from "next/link";

import {
  MajorScoreboard,
  type LeagueMajorScoreboardRow,
} from "@/components/major-scoreboard";
import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { usOpen2026Field } from "@/lib/major-fields";
import {
  buildPayoutDecision,
  getActiveRostersForYear,
  normalizeGolferNameForFieldCheck,
} from "@/lib/league";

export const metadata: Metadata = {
  title: "2026 U.S. Open | Major Pool Winners",
  description:
    "League-focused 2026 U.S. Open result, payout summary, and scoring archive.",
};

const seasonYear = 2026;
const usOpenMajorId = "major_2026_us_open";
const leaderboardApiPath = "/api/majors/2026-us-open/leaderboard";
const usOpenResult = {
  winner: "Wyndham Clark",
  score: "4-under",
  margin: "1 stroke",
  runnerUp: "Sam Burns",
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

export default function UsOpen2026Page() {
  const usOpenMajor = majors.find((major) => major.id === usOpenMajorId);
  const payoutDecision = usOpenMajor
    ? buildPayoutDecision(usOpenMajor, leagueTerm, golfers, rosters, members)
    : null;
  const leagueRows = getLeagueUsOpenRows();
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

  const championshipDates = usOpenMajor
    ? formatDateRange(usOpenMajor.startDate, usOpenMajor.endDate)
    : "Jun 18 - Jun 21, 2026";
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,248,244,0.98),_rgba(245,239,226,1)_46%,_rgba(222,233,229,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,_rgba(24,58,49,0.98),_rgba(48,104,113,0.94)_52%,_rgba(210,189,117,0.86)_100%)] text-white shadow-[0_30px_90px_rgba(18,52,45,0.18)]">
          <div className="grid gap-7 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-9 lg:py-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/85">
                Final major result
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                2026 U.S. Open
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Wyndham Clark won the 126th U.S. Open at Shinnecock Hills at{" "}
                {usOpenResult.score}, {usOpenResult.margin} clear of{" "}
                {usOpenResult.runnerUp}. The league result is settled here with
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
                  href="https://www.espn.com/golf/leaderboard?tournamentId=401811952"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  ESPN leaderboard
                </a>
                <a
                  href="https://www.usopen.com/2026/players.html"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  USGA players
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HeroMetric
                label="Champion"
                value={usOpenResult.winner}
                note={`${usOpenResult.score} at ${usOpenMajor?.venue ?? "Shinnecock Hills Golf Club"}`}
              />
              <HeroMetric
                label="League winner"
                value={winningMember?.displayName ?? "Rostered winner"}
                note={
                  winningMember
                    ? `${winningMember.teamName} held Clark for the U.S. Open payout.`
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
            value={usOpen2026Field.length.toString()}
            note="Current ESPN field stored for league matching."
          />
          <DashboardStat
            label="Drafted in field"
            value={draftedInFieldRows.length.toString()}
            note="Active league golfers matched into the U.S. Open field before play."
          />
          <DashboardStat
            label="Final score"
            value="-4"
            note={`${championshipDates}; Sam Burns finished one shot back.`}
          />
          <DashboardStat
            label="Payment status"
            value="Paid"
            note="All five losing-member obligations are marked complete."
          />
        </section>

        <MajorScoreboard
          rows={leagueRows}
          leaderboardApiPath={leaderboardApiPath}
          eyebrow="League scoreboard"
          title="Drafted golfers at Shinnecock"
          description="The table is limited to active league golfers. Final scoring is preserved from the ESPN feed, with the U.S. Open payout marked complete."
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
                Shinnecock setup
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Par 70, 7,440 yards
              </h2>
              <p className="mt-4 text-sm leading-6 text-emerald-50/86">
                The championship returns to Southampton for the sixth U.S. Open
                at Shinnecock Hills. Wyndham Clark&apos;s win produced a paid league
                payout for Team Connors.
              </p>
              <a
                href="https://www.espn.com/golf/leaderboard?tournamentId=401811952"
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

function getLeagueUsOpenRows(): LeagueMajorScoreboardRow[] {
  const activeRosterPicks = getActiveRostersForYear(rosters, seasonYear);
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const membersById = new Map(members.map((member) => [member.id, member]));
  const memberSortOrder = new Map(
    members.map((member, index) => [member.id, member.initialDraftOrder ?? index]),
  );
  const fieldNames = new Set(
    usOpen2026Field.map((fieldGolfer) =>
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
