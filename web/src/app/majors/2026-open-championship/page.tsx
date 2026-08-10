import type { Metadata } from "next";
import Link from "next/link";

import {
  MajorScoreboard,
  type LeagueMajorScoreboardRow,
} from "@/components/major-scoreboard";
import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { openChampionship2026Field } from "@/lib/major-fields";
import {
  buildPayoutDecision,
  getActiveRostersForYear,
  normalizeGolferNameForFieldCheck,
} from "@/lib/league";

export const metadata: Metadata = {
  title: "2026 Open Championship | Major Pool Winners",
  description:
    "League-focused 2026 Open Championship result, field context, and payout summary.",
};

const seasonYear = 2026;
const openMajorId = "major_2026_open";
const leaderboardApiPath = "/api/majors/2026-open-championship/leaderboard";
const openResult = {
  winner: "Ryan Fox",
  score: "10-under",
  runnerUp: "Cameron Young",
  margin: "1 stroke",
  third: "Sam Burns",
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

export default function OpenChampionship2026Page() {
  const openMajor = majors.find((major) => major.id === openMajorId);
  const payoutDecision = openMajor
    ? buildPayoutDecision(openMajor, leagueTerm, golfers, rosters, members)
    : null;
  const leagueRows = getLeagueOpenRows();
  const draftedInFieldRows = leagueRows.filter((row) => row.isInField);
  const missingRows = leagueRows.filter((row) => !row.isInField);
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

  const championshipDates = openMajor
    ? formatDateRange(openMajor.startDate, openMajor.endDate)
    : "Jul 16 - Jul 19, 2026";
  const payoutEvent = payoutDecision?.payoutEvent;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(240,248,250,0.98),_rgba(245,239,226,1)_46%,_rgba(225,233,218,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,_rgba(20,45,61,0.98),_rgba(36,92,86,0.94)_52%,_rgba(201,176,100,0.86)_100%)] text-white shadow-[0_30px_90px_rgba(18,52,45,0.18)]">
          <div className="grid gap-7 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-9 lg:py-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/85">
                Final major result
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                2026 Open Championship
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cyan-50/90 sm:text-base">
                Ryan Fox won the 154th Open Championship at Royal Birkdale at{" "}
                {openResult.score}, {openResult.margin} clear of{" "}
                {openResult.runnerUp}. The league result is settled here with
                field context, final leaderboard access, and payout status.
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
                  href="https://www.espn.com/golf/leaderboard?tournamentId=401811957"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  ESPN leaderboard
                </a>
                <a
                  href="https://www.theopen.com/field"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  The Open field
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HeroMetric
                label="Champion"
                value={openResult.winner}
                note={`${openResult.score} at ${openMajor?.venue ?? "Royal Birkdale Golf Club"}`}
              />
              <HeroMetric
                label="League payout"
                value={payoutEvent?.isDraftedWinner ? "Paid" : "No payout"}
                note={
                  payoutEvent?.isDraftedWinner
                    ? "All losing-member obligations are marked complete."
                    : "Fox was not rostered, so no payment obligations were created."
                }
              />
              <HeroMetric
                label="Runner-up"
                value={openResult.runnerUp}
                note={`${openResult.third} finished third at 8-under.`}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <DashboardStat
            label="Field size"
            value={openChampionship2026Field.length.toString()}
            note="Final stored field used for league matching."
          />
          <DashboardStat
            label="Drafted in field"
            value={draftedInFieldRows.length.toString()}
            note="Active league golfers matched into The Open field."
          />
          <DashboardStat
            label="Final score"
            value="-10"
            note={`${championshipDates}; Cameron Young finished one shot back.`}
          />
          <DashboardStat
            label="Payment status"
            value={payoutEvent?.isDraftedWinner ? "Paid" : "Clear"}
            note={
              payoutEvent?.isDraftedWinner
                ? "All losing-member obligations are marked complete."
                : "No league obligations were created for the undrafted winner."
            }
          />
        </section>

        <MajorScoreboard
          rows={leagueRows}
          leaderboardApiPath={leaderboardApiPath}
          eyebrow="League scoreboard"
          title="Drafted golfers at Royal Birkdale"
          description="The table is limited to active league golfers. Final scoring is preserved from the ESPN feed, with the Open result marked settled."
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
                {draftedInFieldRows.length} league golfers were in the field.
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
                Birkdale setup
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Par 70, 7,156 yards
              </h2>
              <p className="mt-4 text-sm leading-6 text-emerald-50/86">
                Fox closed 72-68-62-68 for 270 and birdied the 72nd hole to
                avoid a playoff. The result did not create a league payout
                because the champion was not on an active roster.
              </p>
              <a
                href="https://www.espn.com/golf/leaderboard?tournamentId=401811957"
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
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold leading-7">{value}</p>
      <p className="mt-2 text-sm leading-6 text-cyan-50/82">{note}</p>
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

function getLeagueOpenRows(): LeagueMajorScoreboardRow[] {
  const activeRosterPicks = getActiveRostersForYear(rosters, seasonYear);
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const membersById = new Map(members.map((member) => [member.id, member]));
  const memberSortOrder = new Map(
    members.map((member, index) => [member.id, member.initialDraftOrder ?? index]),
  );
  const fieldNames = new Set(
    openChampionship2026Field.map((fieldGolfer) =>
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
