import Link from "next/link";

import {
  annualDropDecisions,
  draftBoard,
  golfers,
  leagueTerm,
  majors,
  members,
  replacementDraftPicks,
  rosters,
} from "@/lib/data";
import {
  buildPayoutDecision,
  getActiveRostersForYear,
  getDraftBoardForSeason,
  getDropDecisionsForSeason,
  getMemberRosterForYear,
  getSeasonMajors,
} from "@/lib/league";

const seasonYear = 2025;

export default function DataCheck2025Page() {
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const membersById = new Map(members.map((member) => [member.id, member]));

  const draftBoard2025 = getDraftBoardForSeason(draftBoard, seasonYear);
  const activeRosters2025 = getActiveRostersForYear(rosters, seasonYear);
  const seasonMajors = getSeasonMajors(majors, seasonYear);
  const payoutDecisions = seasonMajors.map((major) =>
    buildPayoutDecision(major, leagueTerm, golfers, rosters, members),
  );
  const dropDecisions = getDropDecisionsForSeason(
    annualDropDecisions,
    seasonYear,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.95),_rgba(245,239,226,1)_45%,_rgba(228,218,193,0.95)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Data Check
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              2025 season history
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              This view verifies the original 2025 draft, active team rosters,
              major results, and the offseason changes that shaped the 2026
              starting board.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-line bg-card px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-white/60"
            >
              Back home
            </Link>
            <div className="rounded-full border border-line bg-card px-5 py-2 text-sm text-muted">
              {leagueTerm.name}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Original picks",
              value: draftBoard2025.length.toString(),
              note: "Snake draft entries saved from the 2025 board.",
            },
            {
              label: "2025 roster spots",
              value: activeRosters2025.length.toString(),
              note: "Six active golfers for each of the six teams.",
            },
            {
              label: "2025 majors",
              value: seasonMajors.length.toString(),
              note: "Completed majors with payout checks.",
            },
            {
              label: "Offseason moves",
              value: `${dropDecisions.filter((decision) => decision.action === "drop").length} drops`,
              note: "Five drops, one keep, then a replacement round.",
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
                Original draft board
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2025 pick-by-pick draft
              </h2>
            </div>
            <p className="text-sm text-muted">
              Preserved for historical context, not just current roster state.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {draftBoard2025.map((pick) => {
              const member = membersById.get(pick.memberId);
              const golfer = golfersById.get(pick.golferId);

              return (
                <article
                  key={pick.id}
                  className="rounded-[1.25rem] border border-line bg-background/70 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Pick {pick.pickNumber}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {golfer?.name ?? pick.golferId}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {member?.displayName} • {pick.teamName}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent">
                    Draft order {pick.draftOrder}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Team rosters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Active rosters during the 2025 majors
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const memberGolfers = getMemberRosterForYear(
                member.id,
                rosters,
                golfers,
                seasonYear,
              );

              return (
                <article
                  key={member.id}
                  className="rounded-[1.5rem] border border-line bg-background/70 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {member.teamName}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{member.displayName}</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
                    {memberGolfers.map((golfer) => (
                      <li key={golfer.id}>{golfer.name}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Major results
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            2025 major outcomes and payout checks
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {payoutDecisions.map(({ payoutEvent, obligations, winnerMatch }) => {
              const major = seasonMajors.find(
                (seasonMajor) => seasonMajor.id === payoutEvent.majorId,
              );
              const winnerName =
                winnerMatch.golfer?.name ?? major?.winnerName ?? "Unknown winner";

              return (
                <article
                  key={payoutEvent.id}
                  className="rounded-[1.5rem] border border-line bg-background/70 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {major?.name}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{winnerName}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {winnerMatch.member
                      ? `${winnerMatch.member.displayName} held the winning golfer.`
                      : "Winner was not rostered during the 2025 season."}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {payoutEvent.isDraftedWinner
                      ? `Payout complete: $${payoutEvent.amountPerLosingMember} from each of ${obligations.length} members for a total of $${payoutEvent.totalPayout}.`
                      : "No payout event should be created for this result."}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Offseason moves
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Drops and adds heading into 2026
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {members.map((member) => {
              const dropDecision = dropDecisions.find(
                (decision) => decision.memberId === member.id,
              );
              const replacementPick = replacementDraftPicks.find(
                (pick) => pick.memberId === member.id && pick.seasonYear === seasonYear,
              );
              const droppedGolfer = dropDecision?.droppedGolferId
                ? golfersById.get(dropDecision.droppedGolferId)
                : undefined;
              const addedGolfer = replacementPick
                ? golfersById.get(replacementPick.golferId)
                : undefined;

              return (
                <article
                  key={member.id}
                  className="rounded-[1.5rem] border border-line bg-background/70 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {member.teamName}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{member.displayName}</h3>
                  {dropDecision?.action === "drop" ? (
                    <div className="mt-4 space-y-2 text-sm leading-6 text-muted">
                      <p>Dropped: {droppedGolfer?.name ?? "Unknown golfer"}</p>
                      <p>
                        Added: {addedGolfer?.name ?? "Unknown golfer"}
                      </p>
                      <p>
                        Replacement order:{" "}
                        {replacementPick?.draftOrder ?? "Not recorded"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-muted">
                      No change. This roster carried all six golfers into 2026.
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-dashed border-line bg-white/40 p-4 text-sm leading-6 text-muted">
            Replacement slot 5 is intentionally absent because Ed Buckingham kept
            his roster and did not make a pick in the 2025 offseason round.
          </div>
        </section>
      </div>
    </main>
  );
}
