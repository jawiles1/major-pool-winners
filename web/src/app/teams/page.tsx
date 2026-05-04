import Link from "next/link";

import {
  annualDropDecisions,
  golfers,
  members,
  replacementDraftPicks,
  rosters,
} from "@/lib/data";
import {
  getDropDecisionsForSeason,
  getMemberRosterForYear,
} from "@/lib/league";

const originalSeasonYear = 2025;
const currentSeasonYear = 2026;

export default function TeamsPage() {
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const dropDecisions2025 = getDropDecisionsForSeason(
    annualDropDecisions,
    originalSeasonYear,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_45%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(20,46,33,0.97),_rgba(36,88,57,0.94)_52%,_rgba(190,167,104,0.78)_100%)] text-white shadow-[0_30px_90px_rgba(23,60,39,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/85">
                Team Directory
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Every roster, with the 2025 roots still visible.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/88 sm:text-base">
                This page shows the active 2026 teams while keeping the original
                2025 draft context and the offseason changes that brought each
                roster to its current shape.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/seasons/2025"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  View 2025 season
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Back home
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                  Active season
                </p>
                <p className="mt-2 text-3xl font-semibold">{currentSeasonYear}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/82">
                  Current roster view uses the post-2025 replacement draft.
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                  Original teams
                </p>
                <p className="mt-2 text-3xl font-semibold">{members.length}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/82">
                  All six original owners remain intact across the term.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "2026 roster spots",
              value: "36",
              note: "Six active golfers for each of six teams.",
            },
            {
              label: "2025 offseason moves",
              value: "5",
              note: "Five teams made one drop-and-add move.",
            },
            {
              label: "Stable roster",
              value: "1",
              note: "Ed Buckingham carried all six golfers forward unchanged.",
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
                Current teams
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2026 active rosters
              </h2>
            </div>
            <p className="text-sm text-muted">
              Built from the original draft plus the 2025 offseason.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const currentRoster = getMemberRosterForYear(
                member.id,
                rosters,
                golfers,
                currentSeasonYear,
              );
              const originalRoster = getMemberRosterForYear(
                member.id,
                rosters,
                golfers,
                originalSeasonYear,
              );
              const dropDecision = dropDecisions2025.find(
                (decision) => decision.memberId === member.id,
              );
              const replacementPick = replacementDraftPicks.find(
                (pick) =>
                  pick.memberId === member.id &&
                  pick.seasonYear === originalSeasonYear,
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
                  className="rounded-[1.75rem] border border-line bg-background/70 p-5"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      {member.teamName}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {member.displayName}
                    </h3>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Active {currentSeasonYear} roster
                    </p>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-foreground sm:grid-cols-2">
                      {currentRoster.map((golfer) => (
                        <li
                          key={golfer.id}
                          className="rounded-xl border border-line bg-card/80 px-3 py-2"
                        >
                          {golfer.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-line bg-white/40 p-4 text-sm leading-6 text-muted">
                    {dropDecision?.action === "drop" ? (
                      <p>
                        Offseason move: dropped {droppedGolfer?.name} and added{" "}
                        {addedGolfer?.name}.
                      </p>
                    ) : (
                      <p>
                        Offseason move: no change. All six original 2025 golfers
                        carried forward.
                      </p>
                    )}
                  </div>

                  <details className="mt-4 group">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-accent">
                      View original 2025 roster
                    </summary>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2">
                      {originalRoster.map((golfer) => (
                        <li key={golfer.id}>{golfer.name}</li>
                      ))}
                    </ul>
                  </details>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
