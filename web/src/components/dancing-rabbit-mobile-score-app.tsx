"use client";

import { useEffect, useState } from "react";

import {
  calculateDay,
  createEmptyScoreState,
  dancingRabbitTrip,
  formatMoney,
  getCourse,
  getDayDotString,
  getDay,
  getPlayer,
  getPlayerDayHandicap,
  getPlayerHoleScore,
  type DayId,
  type ScoreState,
} from "@/lib/dancing-rabbit";
import { useHandicapOverrides } from "@/lib/dancing-rabbit-handicap-overrides";
import { DancingRabbitDailyScorecards } from "@/components/dancing-rabbit-daily-scorecards";

const storageKey = "dancing-rabbit-2026-scores";
const stateEndpoint = "/api/trips/dancing-rabbit-2026/state";
const scoresEndpoint = "/api/trips/dancing-rabbit-2026/scores";

function loadInitialScores(): ScoreState {
  if (typeof window === "undefined") {
    return createEmptyScoreState();
  }

  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return createEmptyScoreState();
  }

  try {
    return { ...createEmptyScoreState(), ...JSON.parse(stored) };
  } catch {
    return createEmptyScoreState();
  }
}

export function DancingRabbitMobileScoreApp() {
  const [activeDayId, setActiveDayId] = useState<DayId>("thursday");
  const [activePairingId, setActivePairingId] = useState("thursday-1");
  const [activeHoleNumber, setActiveHoleNumber] = useState(1);
  const [scores, setScores] = useState<ScoreState>(() => loadInitialScores());
  const [handicapOverrides] = useHandicapOverrides();

  const activeDay = getDay(activeDayId);
  const activeCourse = getCourse(activeDay.courseId);
  const activeHole =
    activeCourse.holes.find((hole) => hole.number === activeHoleNumber) ??
    activeCourse.holes[0];
  const activePairing =
    activeDay.pairings.find((pairing) => pairing.id === activePairingId) ??
    activeDay.pairings[0];
  const activeResult = calculateDay(activeDay, scores, handicapOverrides);
  const pairingScore = activeResult.teamScores.find((score) =>
    score.id.startsWith(activePairing.id),
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    async function refreshScores() {
      try {
        const response = await fetch(stateEndpoint, { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { scores?: ScoreState };
        setScores({ ...createEmptyScoreState(), ...data.scores });
      } catch {
        // Keep the optimistic local state if the network is temporarily unavailable.
      }
    }

    refreshScores();
    const intervalId = window.setInterval(refreshScores, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  function changeDay(dayId: DayId) {
    const day = getDay(dayId);

    setActiveDayId(dayId);
    setActivePairingId(day.pairings[0].id);
    setActiveHoleNumber(1);
  }

  function updateScore(playerId: string, value: string) {
    const parsed = Number(value);

    setScores((current) => ({
      ...current,
      [activeDayId]: {
        ...current[activeDayId],
        [playerId]: {
          ...current[activeDayId]?.[playerId],
          [activeHole.number]: Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
        },
      },
    }));

    fetch(scoresEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayId: activeDayId,
        playerId,
        holeNumber: activeHole.number,
        gross: Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
      }),
    }).catch(() => {
      // Keep the local edit visible; polling will reconcile when connectivity returns.
    });
  }

  const enteredCount = activePairing.playerIds.filter((playerId) =>
    Boolean(scores[activeDayId]?.[playerId]?.[activeHole.number]),
  ).length;

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <section className="rounded-[1.25rem] border border-line bg-card/95 p-4">
        <h2 className="sr-only">{activeDay.label} scoring</h2>
        <div className="grid grid-cols-4 gap-1">
          {dancingRabbitTrip.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => changeDay(day.id)}
              className={
                day.id === activeDayId
                  ? "rounded-full bg-accent px-3 py-2 text-sm font-semibold !text-white"
                  : "rounded-full border border-line bg-background px-3 py-2 text-sm font-semibold"
              }
            >
              {day.label}
            </button>
          ))}
        </div>

        <label className="mt-3 block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Group
          </span>
          <select
            value={activePairing.id}
            onChange={(event) => {
              setActivePairingId(event.target.value);
              setActiveHoleNumber(1);
            }}
            className="mt-2 h-12 w-full rounded-[0.8rem] border border-line bg-white px-3 text-base font-semibold outline-none focus:border-accent"
          >
            {activeDay.pairings.map((pairing) => (
              <option key={pairing.id} value={pairing.id}>
                {pairing.name}:{" "}
                {pairing.playerIds.map((playerId) => getPlayer(playerId).shortName).join(", ")}
              </option>
            ))}
          </select>
        </label>
        <a href="#daily-scorecards" className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4">Daily totals &amp; scorecards</a>
      </section>

      <section className="rounded-[1.25rem] border border-line bg-card/95 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {activeCourse.name}
            </p>
            <h3 className="mt-1 text-4xl font-semibold">Hole {activeHole.number}</h3>
            <p className="mt-1 text-sm font-semibold text-muted">
              Par {activeHole.par} | {activeHole.yards} yards | Hcp {activeHole.strokeIndex}
            </p>
          </div>
          <div className="rounded-[0.85rem] bg-background px-3 py-2 text-center">
            <p className="text-2xl font-semibold">
              {enteredCount}/{activePairing.playerIds.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Entered
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-9 gap-1.5">
          {activeCourse.holes.map((hole) => (
            <button
              key={hole.number}
              type="button"
              onClick={() => setActiveHoleNumber(hole.number)}
              className={
                hole.number === activeHole.number
                  ? "h-10 rounded-[0.55rem] bg-accent text-sm font-semibold !text-white"
                  : "h-10 rounded-[0.55rem] border border-line bg-background text-sm font-semibold"
              }
              aria-label={`Hole ${hole.number}`}
            >
              {hole.number}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          {activePairing.playerIds.map((playerId) => {
            const player = getPlayer(playerId);
            const score = getPlayerHoleScore(
              activeDay,
              playerId,
              activeHole.number,
              scores,
              handicapOverrides,
            );
            const dots = getDayDotString(activeDay, player, activeHole, handicapOverrides);

            return (
              <label
                key={playerId}
                className="grid grid-cols-[1fr_96px_72px] items-center gap-3 rounded-[1rem] border border-line bg-background/80 p-3"
              >
                <div>
                  <p className="text-lg font-semibold leading-tight">{player.name}</p>
                  <p className="mt-1 text-xs font-medium uppercase text-muted">
                    Hcp {getPlayerDayHandicap(activeDay, player, handicapOverrides)}
                    {dots ? ` | ${dots}` : ""}
                  </p>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  value={scores[activeDayId]?.[playerId]?.[activeHole.number] || ""}
                  onChange={(event) => updateScore(playerId, event.target.value)}
                  className="h-16 w-full rounded-[0.7rem] border border-line bg-white text-center text-3xl font-semibold outline-none focus:border-accent"
                  aria-label={`${player.name} hole ${activeHole.number}`}
                />
                <div className="text-center">
                  <p className="text-3xl font-semibold">
                    {typeof score.net === "number" ? score.net : "-"}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {score.wasCapped ? "Cap" : "Net"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveHoleNumber((hole) => Math.max(1, hole - 1))}
            disabled={activeHole.number === 1}
            className="h-12 rounded-full border border-line bg-background text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveHoleNumber((hole) => Math.min(18, hole + 1))}
            disabled={activeHole.number === 18}
            className="h-12 rounded-full bg-accent text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      <DancingRabbitDailyScorecards day={activeDay} scores={scores} />

      <section className="rounded-[1.25rem] border border-line bg-card/95 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Live Check
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{activePairing.name}</p>
            <p className="text-sm text-muted">{pairingScore?.note ?? activeDay.format}</p>
          </div>
          <p className="text-2xl font-semibold">
            {pairingScore
              ? activeDay.format === "round-robin-press"
                ? formatMoney(pairingScore.value)
                : pairingScore.value
              : "-"}
          </p>
        </div>
      </section>
    </div>
  );
}
