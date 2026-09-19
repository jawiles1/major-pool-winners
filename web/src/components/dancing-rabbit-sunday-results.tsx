import { formatMoney, getPlayer, type DailyResult } from "@/lib/dancing-rabbit";

export function DancingRabbitSundayResults({ result }: { result: DailyResult }) {
  if (result.day.id !== "sunday") return null;
  const [first, second] = result.day.pairings;
  const combined = result.day.pairings.map(pairing => result.teamScores
    .filter(score => score.id === `${pairing.id}-gross` || score.id === `${pairing.id}-net`)
    .reduce((sum, score) => sum + score.value, 0));
  const winner = combined[0] < combined[1] ? first : second;

  return (
    <section id="sunday-results" aria-labelledby="sunday-results-title" className="rounded-[1.5rem] border border-line bg-card/90 p-5">
      <h2 id="sunday-results-title" className="text-xl font-semibold">Sunday Low Gross &amp; Low Net Results</h2>
      <p className="mt-2 text-sm text-muted">{result.complete ? "All 18 holes complete." : "Round in progress — results and payouts are not final."} One {formatMoney(result.day.stakePerPlayer ?? 0)}-per-player bet on the combined total of one low gross plus one low net per hole over 18 holes. The same player may count for both.</p>
      <p className="mt-2 text-sm text-muted">Uses the existing net-double-bogey scoring cap, including for the gross ball. Actual uncapped strokes are shown in the individual scorecards.</p>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{result.day.pairings.map(pairing => (
        <p key={pairing.id}><strong>{pairing.name}:</strong> {pairing.playerIds.map(id => getPlayer(id).shortName).join(", ")}</p>
      ))}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{(["gross", "net"] as const).map(ball => {
        const firstScore = result.teamScores.find(score => score.id === `${first.id}-${ball}`)?.value;
        const secondScore = result.teamScores.find(score => score.id === `${second.id}-${ball}`)?.value;
        return <article key={ball} className="rounded-xl border border-line bg-background/70 p-4">
          <h3 className="text-lg font-semibold">Low {ball} subtotal</h3>
          <dl className="mt-3 space-y-2">{[[first.name, firstScore], [second.name, secondScore]].map(([name, score]) => (
            <div key={name} className="flex justify-between gap-3"><dt>{name}</dt><dd className="font-semibold">{result.complete ? score : "Pending"}</dd></div>
          ))}</dl>
        </article>;
      })}</div>
      <div className="mt-4 rounded-xl border border-line bg-background/70 p-4">
        <h3 className="text-lg font-semibold">Combined gross + net · {formatMoney(result.day.stakePerPlayer ?? 0)}/player</h3>
        {result.day.pairings.map((pairing, index) => <p key={pairing.id} className="mt-2 flex justify-between gap-3"><span>{pairing.name}</span><strong>{result.complete ? combined[index] : "Pending"}</strong></p>)}
        <p className="mt-3 font-semibold text-accent">{!result.complete ? "Awaiting all scores" : combined[0] === combined[1] ? "Tied — no payment" : `${winner.name} wins by ${Math.abs(combined[0] - combined[1])}`}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{result.day.pairings.map(pairing => {
        const net = result.playerNet[pairing.playerIds[0]] ?? 0;
        return <p key={pairing.id} className="rounded-xl border border-line p-3"><strong>{pairing.name}: </strong>{!result.complete ? "Payout pending" : net === 0 ? "Even — $0 per player" : `Each player ${net > 0 ? "wins" : "loses"} ${formatMoney(Math.abs(net))} in Sunday bets`}</p>;
      })}</div>
      <p className="mt-3 text-sm text-muted">One combined Sunday bet only: maximum game loss is {formatMoney(result.day.stakePerPlayer ?? 0)} per player, plus any bounties. Eagle bounties and the overall trip pool are separate. Payment splits between recipients do not change each player’s total.</p>
    </section>
  );
}
