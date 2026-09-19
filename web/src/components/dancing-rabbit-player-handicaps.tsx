"use client";

import { useEffect, useState } from "react";
import { dancingRabbitTrip, getPlayerDayHandicap, type HandicapOverrideState } from "@/lib/dancing-rabbit";
import { loadHandicapOverrides } from "@/lib/dancing-rabbit-handicap-overrides";

export function DancingRabbitPlayerHandicaps() {
  const [overrides, setOverrides] = useState<HandicapOverrideState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let busy = false;
    async function refresh() {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const saved = await loadHandicapOverrides();
        if (active) { setOverrides(saved); setFailed(false); }
      } catch { if (active) setFailed(true); }
      finally { busy = false; }
    }
    void refresh();
    const timer = setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  return (
    <>
      <p className="mt-2 text-sm text-muted">Course handicaps by day, including saved adjustments.</p>
      {(!overrides || failed) && <p role="status" className="mt-2 text-sm text-muted">{failed ? "Unable to refresh handicaps. Any displayed values are the last loaded adjustments." : "Loading saved handicaps…"}</p>}
      <div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-line">
        <table className="w-full min-w-[380px] text-left text-sm">
          <thead className="bg-accent-strong !text-white">
            <tr><th scope="col" className="px-3 py-3">Player</th>{dancingRabbitTrip.days.map(day => <th key={day.id} scope="col" className="px-2 py-3 text-center">{day.label.slice(0, 3)}</th>)}</tr>
          </thead>
          <tbody>{dancingRabbitTrip.players.map((player, index) => (
            <tr key={player.id} className={index % 2 === 0 ? "bg-background/70" : "bg-card"}>
              <th scope="row" className="px-3 py-3 font-semibold">{player.name}</th>
              {dancingRabbitTrip.days.map(day => <td key={day.id} className="px-2 py-3 text-center">{overrides ? getPlayerDayHandicap(day, player, overrides) : "—"}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
