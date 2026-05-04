import Link from "next/link";

import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { buildPayoutDecision, getSeasonMajors } from "@/lib/league";

const seasonYear = 2025;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export default function LedgerPage() {
  const membersById = new Map(members.map((member) => [member.id, member]));
  const seasonMajors = getSeasonMajors(majors, seasonYear);
  const payoutDecisions = seasonMajors.map((major) =>
    buildPayoutDecision(major, leagueTerm, golfers, rosters, members),
  );

  const payoutEvents = payoutDecisions.filter(
    ({ payoutEvent }) => payoutEvent.isDraftedWinner,
  );
  const noPayoutEvents = payoutDecisions.filter(
    ({ payoutEvent }) => !payoutEvent.isDraftedWinner,
  );

  const memberLedger = members
    .map((member) => {
      const won = payoutEvents
        .filter(({ payoutEvent }) => payoutEvent.winningMemberId === member.id)
        .reduce((sum, { payoutEvent }) => sum + payoutEvent.totalPayout, 0);

      const owes = payoutEvents
        .flatMap(({ obligations }) => obligations)
        .filter((obligation) => obligation.fromMemberId === member.id)
        .reduce((sum, obligation) => sum + obligation.amount, 0);

      return {
        member,
        won,
        owes,
        net: won - owes,
      };
    })
    .sort((left, right) => right.net - left.net);

  const totalObligations = payoutEvents.reduce(
    (sum, { obligations }) => sum + obligations.length,
    0,
  );
  const totalPayoutValue = payoutEvents.reduce(
    (sum, { payoutEvent }) => sum + payoutEvent.totalPayout,
    0,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_45%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(36,37,67,0.97),_rgba(44,72,111,0.94)_52%,_rgba(140,156,197,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(36,37,67,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-100/85">
                League Ledger
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                The payout trail from the majors to every member.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-50/88 sm:text-base">
                This page shows each 2025 payout event, the obligations it
                created, and the net result by owner. It is the first step
                toward the full settlement tracking view.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/majors"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  View majors
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
                <p className="text-xs uppercase tracking-[0.18em] text-slate-100/80">
                  2025 payout events
                </p>
                <p className="mt-2 text-3xl font-semibold">{payoutEvents.length}</p>
                <p className="mt-2 text-sm leading-6 text-slate-50/82">
                  Drafted winning majors that generated obligations.
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-100/80">
                  Total obligations
                </p>
                <p className="mt-2 text-3xl font-semibold">{totalObligations}</p>
                <p className="mt-2 text-sm leading-6 text-slate-50/82">
                  Five obligations are created each time a rostered golfer wins.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Total payout value",
              value: formatCurrency(totalPayoutValue),
              note: "Combined value of all 2025 drafted-winner events.",
            },
            {
              label: "Undrafted winners",
              value: noPayoutEvents.length.toString(),
              note: "Majors that did not create any payment obligations.",
            },
            {
              label: "Per-loss amount",
              value: formatCurrency(leagueTerm.payoutAmountPerMember),
              note: "The standard amount owed to the winning owner by each loser.",
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
                Member summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Net position after the 2025 majors
              </h2>
            </div>
            <p className="text-sm text-muted">
              Positive net means a team collected more than it owed.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {memberLedger.map(({ member, won, owes, net }) => (
              <article
                key={member.id}
                className="rounded-[1.5rem] border border-line bg-background/70 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {member.teamName}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{member.displayName}</h3>
                <div className="mt-4 space-y-2 text-sm leading-6 text-muted">
                  <p>Collected: {formatCurrency(won)}</p>
                  <p>Owed: {formatCurrency(owes)}</p>
                  <p className="font-semibold text-foreground">
                    Net: {formatCurrency(net)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Event ledger
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2025 payout events and obligations
              </h2>
            </div>
            <p className="text-sm text-muted">
              A full settlement tracker can layer paid and unpaid states on top of this.
            </p>
          </div>

          <div className="mt-6 grid gap-6">
            {payoutDecisions.map(({ payoutEvent, obligations, winnerMatch }) => {
              const major = seasonMajors.find(
                (seasonMajor) => seasonMajor.id === payoutEvent.majorId,
              );
              const winnerName =
                winnerMatch.golfer?.name ?? major?.winnerName ?? "Unknown winner";
              const winningMember = payoutEvent.winningMemberId
                ? membersById.get(payoutEvent.winningMemberId)
                : undefined;

              return (
                <article
                  key={payoutEvent.id}
                  className="rounded-[1.75rem] border border-line bg-background/70 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        {major?.name}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{winnerName}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {major
                          ? `${formatDateRange(major.startDate, major.endDate)} • ${major.venue}`
                          : "Major details unavailable"}
                      </p>
                    </div>
                    <div className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {payoutEvent.isDraftedWinner ? "Ledger event" : "No payout"}
                    </div>
                  </div>

                  {payoutEvent.isDraftedWinner ? (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm leading-6 text-muted">
                        {winningMember?.displayName} collected{" "}
                        {formatCurrency(payoutEvent.amountPerLosingMember)} from
                        each of {obligations.length} members for a total of{" "}
                        {formatCurrency(payoutEvent.totalPayout)}.
                      </p>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {obligations.map((obligation) => {
                          const fromMember = membersById.get(obligation.fromMemberId);
                          const toMember = membersById.get(obligation.toMemberId);

                          return (
                            <article
                              key={obligation.id}
                              className="rounded-[1.25rem] border border-line bg-card/80 p-4"
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                Obligation
                              </p>
                              <p className="mt-2 text-sm font-semibold">
                                {fromMember?.displayName} to {toMember?.displayName}
                              </p>
                              <p className="mt-2 text-lg font-semibold">
                                {formatCurrency(obligation.amount)}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                                Status: {obligation.status}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-muted">
                      The winning golfer was not on a league roster, so no
                      payment obligations were created for this major.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
