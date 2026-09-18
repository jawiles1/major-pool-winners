import { dancingRabbitTrip, getCourse, type ScoreState, type TripDay } from "@/lib/dancing-rabbit";

export function DancingRabbitDailyScorecards({ day, scores }: { day: TripDay; scores: ScoreState }) {
  const course = getCourse(day.courseId);

  return (
    <section id="daily-scorecards" className="rounded-[1.25rem] border border-line bg-card/95 p-4 scroll-mt-4">
      <h2 className="text-xl font-semibold">{day.label} scorecards</h2>
      <p className="mt-1 text-sm text-muted">Actual gross strokes as entered, before handicap or scoring caps. Tap a player to compare each hole with your paper card.</p>
      <div className="mt-4 grid gap-2">
        {dancingRabbitTrip.players.map((player) => {
          const holes = course.holes.map((hole) => {
            const value = scores[day.id]?.[player.id]?.[hole.number];
            return { ...hole, score: Number.isFinite(value) && value > 0 ? value : undefined };
          });
          const entered = holes.filter((hole) => hole.score !== undefined).length;
          const total = holes.reduce((sum, hole) => sum + (hole.score ?? 0), 0);
          const par = holes.reduce((sum, hole) => sum + hole.par, 0);
          const relative = total - par;
          return (
            <details key={`${day.id}-${player.id}`} className="rounded-xl border border-line bg-background/70 p-3">
              <summary className="cursor-pointer">
                <span className="font-semibold">{player.name}</span>
                <span className="float-right ml-2 font-semibold tabular-nums">{entered ? total : "—"}{entered === 18 ? ` (${relative === 0 ? "E" : relative > 0 ? `+${relative}` : relative})` : ""}</span>
                <span className="mt-1 block text-xs text-muted">{entered === 18 ? "18 holes · gross total" : entered ? `${entered}/18 holes · subtotal` : "No scores entered"}</span>
              </summary>
              {[holes.slice(0, 9), holes.slice(9)].map((nine, index) => {
                const complete = nine.every((hole) => hole.score !== undefined);
                const subtotal = nine.reduce((sum, hole) => sum + (hole.score ?? 0), 0);
                return (
                  <div key={index} className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[300px] text-center text-xs tabular-nums">
                      <caption className="mb-1 text-left font-semibold">{index === 0 ? "Front nine" : "Back nine"}</caption>
                      <thead><tr className="bg-card"><th scope="col" className="p-1">Hole</th>{nine.map((hole) => <th scope="col" key={hole.number} className="p-1">{hole.number}</th>)}<th scope="col">{index === 0 ? "Out" : "In"}</th></tr></thead>
                      <tbody>
                        <tr className="text-muted"><th scope="row" className="p-1">Par</th>{nine.map((hole) => <td key={hole.number}>{hole.par}</td>)}<td>{nine.reduce((sum, hole) => sum + hole.par, 0)}</td></tr>
                        <tr className="font-semibold"><th scope="row" className="p-1">Gross</th>{nine.map((hole) => <td key={hole.number}>{hole.score ?? "—"}</td>)}<td>{complete ? subtotal : `${subtotal}*`}</td></tr>
                      </tbody>
                    </table>
                    {!complete && <p className="mt-1 text-xs text-muted">* Subtotal; missing holes shown as —.</p>}
                  </div>
                );
              })}
            </details>
          );
        })}
      </div>
    </section>
  );
}
