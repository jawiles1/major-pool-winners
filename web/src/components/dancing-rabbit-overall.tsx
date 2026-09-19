"use client";

import { useEffect, useState } from "react";
import { calculateTrip, dancingRabbitTrip, formatMoney, type ScoreState, type HandicapOverrideState } from "@/lib/dancing-rabbit";

export function DancingRabbitOverall() {
  const [results, setResults] = useState<ReturnType<typeof calculateTrip> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let busy = false;
    async function refresh() {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const response = await fetch("/api/trips/dancing-rabbit-2026/state", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error("Unable to load standings");
        const data = await response.json() as { scores: ScoreState; handicapOverrides: HandicapOverrideState };
        const next = calculateTrip(data.scores, data.handicapOverrides);
        if (active) { setResults(next); setFailed(false); }
      } catch { if (active) setFailed(true); }
      finally { busy = false; }
    }
    void refresh();
    const timer = setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  const days = results?.dayResults.filter(result => result.day.overallEligible) ?? [];
  return (
    <section id="overall-game" aria-labelledby="overall-game-title" className="scroll-mt-24 rounded-[1.5rem] border border-line bg-card/90 p-5 sm:p-8">
      <h2 id="overall-game-title" className="text-2xl font-semibold">Overall game</h2>
      <p role="status" className="mt-2 text-sm text-muted">
        {failed ? "Unable to refresh standings. Any results below are the last successfully loaded scores." : results ? `${days.filter(result => result.complete).length} of ${days.length} rounds complete · Updates every 30 seconds` : "Loading saved standings…"}
      </p>
      {results && <>
        <div className="mt-4 flex flex-wrap gap-2">{days.map(result => <span key={result.day.id} className="rounded-full border border-line px-3 py-2 text-sm">{result.day.label}: {result.complete ? "Complete" : "Pending"}</span>)}</div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Overall points by day and current rank</caption>
            <thead className="bg-accent-strong !text-white"><tr>
              <th scope="col" className="p-3">Rank</th><th scope="col" className="p-3">Player</th>
              {days.map(result => <th scope="col" key={result.day.id} className="p-3 text-center">{result.day.label.slice(0, 3)}</th>)}
              <th scope="col" className="p-3 text-center">Points</th>
            </tr></thead>
            <tbody>{results.overallRows.map((row, index) => {
              const rank = results.overallRows.findIndex(other => other.points === row.points) + 1;
              const tied = results.overallRows.filter(other => other.points === row.points).length > 1;
              return <tr key={row.player.id} className={index % 2 === 0 ? "bg-background/70" : "bg-card"}>
                <td className="p-3">{tied ? "T" : ""}{rank}</td><th scope="row" className="p-3 font-semibold">{row.player.name}</th>
                {days.map(result => <td key={result.day.id} className="p-3 text-center">{!result.complete ? "—" : result.tied ? 0.5 : result.winnerPlayerIds.includes(row.player.id) ? 1 : 0}</td>)}
                <td className="p-3 text-center text-lg font-semibold">{row.points}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">Completed rounds only: win = 1 point, tie = ½ point. Payments do not change standings. Equal points share a rank.</p>
        <p className="mt-2 text-sm text-muted">Overall pool: {formatMoney(dancingRabbitTrip.overallBuyIn)} per player. Prizes: {dancingRabbitTrip.overallPayouts.map(formatMoney).join(" / ")}. {results.overallComplete ? "All rounds are complete; final payouts are available in scoring." : "Standings are provisional until all four rounds are complete."}</p>
      </>}
    </section>
  );
}
