import Link from "next/link";

import { golfers, members } from "@/lib/data";
import {
  getSeason2026EarningsDraftRows,
  seasonEarningsSources,
  type SeasonEarningsPlayerRow,
} from "@/lib/season-earnings";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DataCheck2026Page() {
  const draftRows = getSeason2026EarningsDraftRows(members, golfers);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,248,244,0.98),_rgba(245,239,226,1)_46%,_rgba(222,233,229,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(24,58,49,0.98),_rgba(48,104,113,0.94)_52%,_rgba(210,189,117,0.86)_100%)] text-white shadow-[0_30px_90px_rgba(18,52,45,0.18)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/85">
                Data Check
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                2026 replacement draft earnings audit.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/88 sm:text-base">
                This page backs up the 2027 drop-and-add order shown on the
                2026 season page. It uses player prize-money earnings by major,
                then ranks teams from lowest 2026 earnings to highest.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/seasons/2026"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Back to 2026 season
                </Link>
                <Link
                  href="/ledger"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Open ledger
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">
                  First pick
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {draftRows[0]?.member.displayName}
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/82">
                  {draftRows[0]
                    ? `${draftRows[0].member.teamName} had the lowest 2026 team earnings.`
                    : "Draft order unavailable."}
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Rule",
              value: "Low to high",
              note: seasonEarningsSources.draftOrderRule,
            },
            {
              label: "Masters source",
              value: "CSV",
              note: seasonEarningsSources.masters2026,
            },
            {
              label: "Final source",
              value: "ESPN",
              note: seasonEarningsSources.finalLeaderboards2026,
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
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                2027 replacement draft order
              </h2>
            </div>
            <p className="text-sm text-muted">No tie-breaker was needed.</p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-line">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[0.55fr_1.7fr_1fr_1fr] gap-3 bg-[#173c27] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50">
                <div>Pick</div>
                <div>Team</div>
                <div>2026 earnings</div>
                <div>Total winnings</div>
              </div>
              {draftRows.map((row, index) => (
                <div
                  key={row.member.id}
                  className={`grid grid-cols-[0.55fr_1.7fr_1fr_1fr] gap-3 px-4 py-4 text-sm ${
                    index % 2 === 0 ? "bg-card/70" : "bg-background/70"
                  }`}
                >
                  <div className="font-semibold text-foreground">
                    {row.draftOrder}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {row.member.displayName}
                    </p>
                    <p className="text-xs text-muted">{row.member.teamName}</p>
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(row.seasonTotal)}
                  </div>
                  <div className="text-muted">{formatCurrency(row.totalToDate)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Player earnings by major
          </h2>

          <div className="mt-6 grid gap-6">
            {draftRows.map((row) => (
              <article
                key={row.member.id}
                className="rounded-[1.75rem] border border-line bg-background/70 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Pick {row.draftOrder}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {row.member.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {row.member.teamName}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatCurrency(row.seasonTotal)}
                  </p>
                </div>

                <PlayerEarningsTable players={row.players} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function PlayerEarningsTable({
  players,
}: {
  players: SeasonEarningsPlayerRow[];
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-line">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[1.6fr_repeat(5,_1fr)] gap-3 bg-card px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <div>Player</div>
          <div>Masters</div>
          <div>PGA</div>
          <div>U.S. Open</div>
          <div>The Open</div>
          <div>Total</div>
        </div>
        {players.map((player, index) => (
          <div
            key={player.golferId}
            className={`grid grid-cols-[1.6fr_repeat(5,_1fr)] gap-3 px-4 py-3 text-sm ${
              index % 2 === 0 ? "bg-white/50" : "bg-background/70"
            }`}
          >
            <div className="font-semibold text-foreground">
              {player.golferName}
            </div>
            <div className="text-muted">{formatCurrency(player.masters)}</div>
            <div className="text-muted">
              {formatCurrency(player.pgaChampionship)}
            </div>
            <div className="text-muted">{formatCurrency(player.usOpen)}</div>
            <div className="text-muted">
              {formatCurrency(player.openChampionship)}
            </div>
            <div className="font-semibold text-foreground">
              {formatCurrency(player.total)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
