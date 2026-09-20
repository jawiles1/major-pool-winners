import { formatMoney, getPlayer, type DailyResult } from "@/lib/dancing-rabbit";

export function DancingRabbitSundayResults({ result }: { result: DailyResult }) {
  if (!result.scrambleTeams) return null;
  const winner = result.scrambleTeams.find(team => result.winnerPlayerIds.includes(team.pairing.playerIds[0]));
  return (
    <section id="sunday-results" aria-labelledby="sunday-results-title" className="rounded-[1.5rem] border border-line bg-card/90 p-5">
      <h2 id="sunday-results-title" className="text-xl font-semibold">Sunday Scramble Results</h2>
      <p className="mt-2 text-sm text-muted">Four-man scramble · gross only · no handicap strokes or score caps · eagle bounties off.</p>
      <p className="mt-2 text-sm">Lowest 18-hole total wins {formatMoney(result.day.stakePerPlayer ?? 0)} per player and 1 overall point each. A tied round splits the point (½ each) with no main-bet payment.</p>
      <p className="mt-2 text-sm">Every bogey-or-worse hole costs {formatMoney(result.day.bogeyPenaltyPerPlayer ?? 0)} per player, paid to the other team. Double bogey or worse is still one penalty. Equal penalties cancel; penalties do not change the gross winner or overall point.</p>
      <p className="mt-4 font-semibold text-accent">{!result.complete ? "Round in progress — settlement pending all 36 team scores" : result.tied ? "Gross totals tied — bogey penalties still apply" : `${winner?.pairing.name} wins the scramble`}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{result.scrambleTeams.map(team => (
        <article key={team.pairing.id} className="rounded-xl border border-line bg-background/70 p-4">
          <h3 className="text-lg font-semibold">{team.pairing.name}</h3>
          <p className="text-sm text-muted">{team.pairing.playerIds.map(id => getPlayer(id).shortName).join(", ")}</p>
          <p className="mt-3 text-xl font-semibold">Gross {team.entered ? team.total : "—"} <span className="text-sm font-normal">({team.entered}/18 holes{team.entered < 18 ? "; subtotal" : ""})</span></p>
          <p className="mt-2 text-sm">Bogey-or-worse holes: {team.bogeyHoles.length ? team.bogeyHoles.join(", ") : "None recorded"}</p>
          <p className="text-sm">Penalty incurred per player: {formatMoney(team.bogeyHoles.length * (result.day.bogeyPenaltyPerPlayer ?? 0))}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Main bet / player</dt><dd>{result.complete ? formatMoney(team.mainNet) : "Pending"}</dd></div>
            <div className="flex justify-between"><dt>Net penalties / player</dt><dd>{result.complete ? formatMoney(team.penaltyNet) : "Pending"}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total / player</dt><dd>{result.complete ? formatMoney(team.mainNet + team.penaltyNet) : "Pending"}</dd></div>
          </dl>
        </article>
      ))}</div>
      <p className="mt-3 text-sm text-muted">Positive amounts are winnings; negative amounts are owed. Overall trip prizes are separate.</p>
    </section>
  );
}
