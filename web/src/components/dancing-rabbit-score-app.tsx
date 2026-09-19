"use client";

import { useMemo, useState } from "react";

import {
  calculateTrip,
  dancingRabbitTrip,
  formatMoney,
  getCourse,
  getDayDotString,
  getDay,
  getPlayer,
  getPlayerDayHandicap,
  getPlayerHoleScore,
  type DaySettlement,
  type RecordedPayment,
  type SettlementTransfer,
} from "@/lib/dancing-rabbit";
import { useTripScoreSync } from "@/lib/use-trip-score-sync";
import { useCurrentTripDay } from "@/lib/use-current-trip-day";
import { useHandicapOverrides } from "@/lib/dancing-rabbit-handicap-overrides";
import { DancingRabbitDailyScorecards } from "@/components/dancing-rabbit-daily-scorecards";
import { DancingRabbitAbcResults } from "@/components/dancing-rabbit-abc-results";

const paymentsEndpoint = "/api/trips/dancing-rabbit-2026/payments";

export function DancingRabbitScoreApp() {
  const [activeDayId, setActiveDayId] = useCurrentTripDay();
  const [activeHoleNumber, setActiveHoleNumber] = useState(1);
  const sync = useTripScoreSync();
  const { scores } = sync;
  const { payments, setPayments } = sync;
  const [paymentAction, setPaymentAction] = useState<string>();
  const [paymentError, setPaymentError] = useState<string>();
  const [clearError, setClearError] = useState<string>();
  const [clearing, setClearing] = useState(false);
  const [handicapOverrides] = useHandicapOverrides();
  const calculations = useMemo(
    () => calculateTrip(scores, handicapOverrides, payments),
    [scores, handicapOverrides, payments],
  );
  const activeDay = getDay(activeDayId);
  const activeCourse = getCourse(activeDay.courseId);
  const activeHole =
    activeCourse.holes.find((hole) => hole.number === activeHoleNumber) ??
    activeCourse.holes[0];
  const activeResult = calculations.dayResults.find(
    (result) => result.day.id === activeDayId,
  );

  function updateScore(playerId: string, holeNumber: number, value: string) { sync.updateScore(activeDayId, playerId, holeNumber, value); }
  async function clearDay(password?: string) {
    setClearError(undefined);
    setClearing(true);
    try { await sync.clearDay(activeDayId, password); }
    catch (error) { setClearError(error instanceof Error ? error.message : "Scores could not be cleared."); }
    finally { setClearing(false); }
  }

  async function recordPayments(
    settlement: DaySettlement,
    transfers: SettlementTransfer[],
  ) {
    if (!transfers.length) {
      return;
    }

    setPaymentAction(settlement.day.id);
    setPaymentError(undefined);

    try {
      const response = await fetch(paymentsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payments: transfers.map((transfer) => ({
            dayId: settlement.day.id,
            fromPlayerId: transfer.from.id,
            toPlayerId: transfer.to.id,
            amount: transfer.amount,
            calculationKey: settlement.calculationKey,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("The payment could not be saved.");
      }

      const data = (await response.json()) as { payments?: RecordedPayment[] };
      setPayments((current) => [...current, ...(data.payments ?? [])]);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "The payment could not be saved.");
    } finally {
      setPaymentAction(undefined);
    }
  }

  async function undoPayment(payment: RecordedPayment) {
    setPaymentAction(payment.id);
    setPaymentError(undefined);

    try {
      const response = await fetch(paymentsEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      if (!response.ok) {
        throw new Error("The payment could not be removed.");
      }

      setPayments((current) => current.filter((item) => item.id !== payment.id));
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "The payment could not be removed.");
    } finally {
      setPaymentAction(undefined);
    }
  }

  return (
    <div className="grid gap-6">
      <div role="status" className="rounded-xl border border-line bg-card p-3 text-sm"><p>{sync.message}</p><button type="button" onClick={sync.retry} className="mt-1 font-semibold underline">Retry / refresh</button></div>
      <section className="rounded-[1.5rem] border border-line bg-card/90 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Live Score Entry
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {activeDay.label} - {activeCourse.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => clearDay()}
            disabled={clearing}
            className="w-full rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold sm:w-auto"
          >
            Clear {activeDay.label}
          </button>
        </div>

        {clearError && <div role="alert" className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <p>{clearError}</p>
          {clearError.includes("administrator") && <button type="button" disabled={clearing} className="mt-2 font-semibold underline" onClick={() => {
            const password = window.prompt(`Administrator password to clear ${activeDay.label}. Payment history will remain recorded.`);
            if (password && window.confirm(`Clear all scores for ${activeDay.label} as administrator?`)) void clearDay(password);
          }}>Clear as administrator</button>}
        </div>}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {dancingRabbitTrip.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => {
                setActiveDayId(day.id);
                setActiveHoleNumber(1);
                setClearError(undefined);
              }}
              className={
                day.id === activeDayId
                  ? "shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
                  : "shrink-0 rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
              }
            >
              {day.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <div className="rounded-[1.5rem] border border-line bg-card/90 p-3 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted">
                  Enter every player&apos;s gross score for the selected hole.
                </p>
                <p className="mt-1 text-xs text-muted">
                  Net double bogey cap is applied to every entered score.
                </p>
              </div>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-accent sm:block">
                {activeCourse.tee} {activeCourse.rating}/{activeCourse.slope}
              </p>
            </div>

            <div className="rounded-[1rem] border border-line bg-background/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Hole {activeHole.number}
                  </p>
                  <div className="mt-1 flex items-baseline gap-4">
                    <p className="text-3xl font-semibold">Par {activeHole.par}</p>
                    <p className="text-sm font-semibold text-muted">
                      {activeHole.yards} yards | Stroke index {activeHole.strokeIndex}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => setActiveHoleNumber((hole) => Math.max(1, hole - 1))}
                    disabled={activeHole.number === 1}
                    className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHoleNumber((hole) => Math.min(18, hole + 1))}
                    disabled={activeHole.number === 18}
                    className="rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next hole
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-9 gap-1.5 sm:grid-cols-[repeat(18,minmax(0,1fr))]">
                {activeCourse.holes.map((hole) => (
                  <button
                    key={hole.number}
                    type="button"
                    onClick={() => setActiveHoleNumber(hole.number)}
                    className={
                      hole.number === activeHole.number
                        ? "h-10 rounded-[0.55rem] bg-accent text-sm font-semibold !text-white"
                        : "h-10 rounded-[0.55rem] border border-line bg-card text-sm font-semibold"
                    }
                    aria-label={`Hole ${hole.number}`}
                  >
                    {hole.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            {activeDay.pairings.map((pairing) => (
              <article key={pairing.id} className="rounded-[1rem] border border-line bg-background/70 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{pairing.name}</h3>
                    <p className="text-xs text-muted">
                      Hole {activeHole.number} gross scores
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    Gross in | Net out
                  </p>
                </div>

                <div className="mt-3 overflow-hidden rounded-[0.85rem] border border-line">
                  <div className="grid grid-cols-[minmax(112px,1fr)_82px_72px_86px] bg-accent-strong px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] !text-white sm:grid-cols-[minmax(180px,1fr)_96px_90px_112px]">
                    <div>Player</div>
                    <div className="text-center">Gross</div>
                    <div className="text-center">Par</div>
                    <div className="text-center">Net</div>
                  </div>
                  {pairing.playerIds.map((playerId, index) => {
                    const player = getPlayer(playerId);
                    const score = getPlayerHoleScore(
                      activeDay,
                      playerId,
                      activeHole.number,
                      scores,
                      handicapOverrides,
                    );
                    const strokes = getDayDotString(
                      activeDay,
                      player,
                      activeHole,
                      handicapOverrides,
                    );

                    return (
                      <label
                        key={playerId}
                        className={`grid grid-cols-[minmax(112px,1fr)_82px_72px_86px] items-center gap-2 px-3 py-3 sm:grid-cols-[minmax(180px,1fr)_96px_90px_112px] ${
                          index % 2 === 0 ? "bg-card" : "bg-background/80"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold sm:text-base">{player.name}</p>
                          <p className="text-[11px] font-medium uppercase text-muted">
                            Hcp {getPlayerDayHandicap(activeDay, player, handicapOverrides)}
                            {strokes ? ` | ${strokes}` : ""}
                          </p>
                        </div>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={12}
                          value={scores[activeDayId]?.[playerId]?.[activeHole.number] || ""}
                          onChange={(event) =>
                            updateScore(playerId, activeHole.number, event.target.value)
                          }
                          className="h-12 w-full rounded-[0.45rem] border border-line bg-white text-center text-xl font-semibold outline-none focus:border-accent sm:h-14 sm:text-2xl"
                          aria-label={`${player.name} hole ${activeHole.number}`}
                        />
                        <div className="text-center text-2xl font-semibold sm:text-3xl">
                          {activeHole.par}
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold sm:text-3xl">
                            {typeof score.net === "number" ? score.net : "-"}
                          </p>
                          <p className="min-h-4 text-[10px] font-medium uppercase text-muted">
                            {score.wasCapped ? "Cap" : "Net"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <section className="rounded-[1.5rem] border border-line bg-card/90 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Daily Standings
            </p>
            <div className="mt-4 grid gap-3">
              {activeResult?.teamScores.map((score) => (
                <div key={score.id} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-sm">
                  <div>
                    <p className="font-semibold">{score.label}</p>
                    <p className="text-xs text-muted">{score.note}</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {activeDay.format === "round-robin-press"
                      ? formatMoney(score.value)
                      : score.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm leading-6 text-muted">
              {activeResult?.summaries.map((summary) => <p key={summary}>{summary}</p>)}
            </div>
          </section>

          {activeResult?.fridayMatches ? (
            <section className="rounded-[1.5rem] border border-line bg-card/90 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Friday Matches
              </p>
              <div className="mt-4 grid gap-3">
                {activeResult.fridayMatches.map((match) => (
                  <details key={match.id} className="rounded-[0.85rem] border border-line bg-background/70 p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      {match.teamA.name} vs {match.teamB.name}
                    </summary>
                    <div className="mt-3 grid gap-2 text-sm">
                      {match.segments.map((segment) => (
                        <div key={segment.id} className="flex items-center justify-between gap-3">
                          <span>{segment.label}</span>
                          <span className="font-semibold">
                            {segment.margin === 0
                              ? "AS"
                              : `${Math.abs(segment.margin)} ${segment.margin > 0 ? match.teamA.name : match.teamB.name}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>

      {activeResult && <DancingRabbitAbcResults result={activeResult} />}
      <DancingRabbitDailyScorecards day={activeDay} scores={scores} />

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.5rem] border border-line bg-card/90 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Overall Standings
          </p>
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-line">
            <div className="grid grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr_0.8fr] bg-accent-strong px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] !text-white">
              <div>Player</div>
              <div>Pts</div>
              <div>Daily</div>
              <div>Bounty</div>
              <div>Net</div>
            </div>
            {calculations.overallRows.map((row, index) => (
              <div
                key={row.player.id}
                className={`grid grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr_0.8fr] px-3 py-2 text-sm ${
                  index % 2 === 0 ? "bg-background/70" : "bg-card"
                }`}
              >
                <div className="font-semibold">{row.player.shortName}</div>
                <div>{row.points}</div>
                <div>{formatMoney(row.grossMoney)}</div>
                <div>{formatMoney(row.bountyMoney)}</div>
                <div className="font-semibold">{formatMoney(row.net)}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            Points and net track completed golf results and do not reset when payments are recorded. Net includes completed daily games and bounties. The {formatMoney(dancingRabbitTrip.overallBuyIn)} overall
            buy-in and final payouts are {calculations.overallComplete ? "now included" : "held until every overall round is complete"}.
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-line bg-card/90 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Bounties and Settlement
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            <div>
              <h3 className="font-semibold">Bounties</h3>
              <div className="mt-2 grid gap-2 text-sm">
                {calculations.bounties.length ? (
                  calculations.bounties.map((bounty) => (
                    <div key={`${bounty.day.id}-${bounty.hole.number}-${bounty.player.id}`} className="rounded-[0.75rem] border border-line bg-background/70 p-3">
                      <p className="font-semibold">
                        {bounty.player.shortName} - {bounty.day.label} #{bounty.hole.number}
                      </p>
                      <p className="text-muted">
                        {bounty.note}: {formatMoney(bounty.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No bounties yet.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Daily Settlements</h3>
              {paymentError ? (
                <p className="mt-2 rounded-[0.75rem] border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                  {paymentError}
                </p>
              ) : null}
              <div className="mt-2 grid gap-3 text-sm">
                {calculations.daySettlements.map((settlement) => (
                  <div
                    key={settlement.day.id}
                    className="rounded-[0.9rem] border border-line bg-background/70 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{settlement.day.label}</p>
                        <p className="text-xs text-muted">
                          {settlement.complete
                            ? settlement.settled
                              ? "Settled"
                              : `${settlement.remainingTransfers.length} payment${settlement.remainingTransfers.length === 1 ? "" : "s"} remaining`
                            : "Finish all scores before settling"}
                          {settlement.totalPaid > 0
                            ? ` · ${formatMoney(settlement.totalPaid)} recorded paid`
                            : ""}
                        </p>
                      </div>
                      {settlement.complete && settlement.remainingTransfers.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => recordPayments(settlement, settlement.remainingTransfers)}
                          disabled={paymentAction === settlement.day.id}
                          className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {paymentAction === settlement.day.id ? "Saving…" : "Mark day settled"}
                        </button>
                      ) : null}
                    </div>

                    {settlement.needsReconciliation ? (
                      <p className="mt-3 rounded-[0.65rem] border border-amber-300 bg-amber-50 p-2 text-xs leading-5 text-amber-900">
                        Scores changed after a payment was recorded. The transfers below reconcile the updated result with money already paid.
                      </p>
                    ) : null}

                    {settlement.complete && settlement.remainingTransfers.length ? (
                      <div className="mt-3 grid gap-2">
                        {settlement.remainingTransfers.map((transfer) => (
                          <div
                            key={`${transfer.from.id}-${transfer.to.id}-${transfer.amount}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-[0.65rem] border border-line bg-card p-2"
                          >
                            <p>
                              <span className="font-semibold">{transfer.from.shortName}</span>
                              <span> pays </span>
                              <span className="font-semibold">{transfer.to.shortName}</span>
                              <span>: {formatMoney(transfer.amount)}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => recordPayments(settlement, [transfer])}
                              disabled={paymentAction === settlement.day.id}
                              className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Mark paid
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : settlement.settled ? (
                      <p className="mt-3 text-xs font-semibold text-accent">
                        {settlement.calculatedTransfers.length ? "All payments recorded." : "No payments due."}
                      </p>
                    ) : null}

                    {settlement.payments.length ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-semibold text-muted">
                          Payment history ({settlement.payments.length})
                        </summary>
                        <div className="mt-2 grid gap-2">
                          {settlement.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <span>
                                {getPlayer(payment.fromPlayerId).shortName} paid {getPlayer(payment.toPlayerId).shortName} {formatMoney(payment.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => undoPayment(payment)}
                                disabled={paymentAction === payment.id}
                                className="font-semibold text-muted underline underline-offset-2 disabled:opacity-50"
                              >
                                Undo
                              </button>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <h3 className="font-semibold">Total Remaining</h3>
                <p className="mt-1 text-xs leading-5 text-muted">
                  This nets every unpaid completed day together{calculations.overallComplete ? ", including the final overall pot." : ". The overall pot is not due yet."}
                </p>
                <div className="mt-2 grid gap-2">
                  {calculations.settlement.length ? (
                    calculations.settlement.map((transfer) => (
                      <div key={`${transfer.from.id}-${transfer.to.id}-${transfer.amount}`} className="rounded-[0.65rem] border border-line bg-card p-2">
                        <span className="font-semibold">{transfer.from.shortName}</span>
                        <span> pays </span>
                        <span className="font-semibold">{transfer.to.shortName}</span>
                        <span>: {formatMoney(transfer.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Nothing currently owed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
