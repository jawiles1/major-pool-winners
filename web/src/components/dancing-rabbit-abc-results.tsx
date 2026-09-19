import { formatMoney, getPlayer, type DailyResult } from "@/lib/dancing-rabbit";

export function DancingRabbitAbcResults({ result }: { result: DailyResult }) {
  if (result.day.id !== "saturday") return null;
  const [first, second] = result.day.pairings;

  return (
    <section id="abc-results" aria-labelledby="abc-results-title" className="rounded-[1.5rem] border border-line bg-card/90 p-5">
      <h2 id="abc-results-title" className="text-xl font-semibold">Saturday ABC Results</h2>
      <p className="mt-2 text-sm text-muted">{result.complete ? "All 18 holes complete." : "Round in progress — results and payouts are not final."} A = lowest net, B = second-lowest net, C = third-lowest net on each hole.</p>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{result.day.pairings.map(pairing => (
        <p key={pairing.id}><strong>{pairing.name}:</strong> {pairing.playerIds.map(id => getPlayer(id).shortName).join(", ")}</p>
      ))}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{(["A", "B", "C"] as const).map(ball => {
        const firstScore = result.teamScores.find(score => score.id === `${first.id}-${ball}`)?.value;
        const secondScore = result.teamScores.find(score => score.id === `${second.id}-${ball}`)?.value;
        const tied = firstScore === secondScore;
        const winner = (firstScore ?? 0) < (secondScore ?? 0) ? first : second;
        return <article key={ball} className="rounded-xl border border-line bg-background/70 p-4">
          <h3 className="text-lg font-semibold">{ball} ball · {formatMoney(result.day.abcStakes?.[ball] ?? 0)}/player</h3>
          <dl className="mt-3 space-y-2">{[[first.name, firstScore], [second.name, secondScore]].map(([name, score]) => (
            <div key={name} className="flex justify-between gap-3"><dt>{name}</dt><dd className="font-semibold">{result.complete ? score : "Pending"}</dd></div>
          ))}</dl>
          <p className="mt-3 font-semibold text-accent">{!result.complete ? "Awaiting all scores" : tied ? "Tied — no payment" : `${winner.name} wins by ${Math.abs((firstScore ?? 0) - (secondScore ?? 0))}`}</p>
        </article>;
      })}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{result.day.pairings.map(pairing => {
        const net = result.playerNet[pairing.playerIds[0]] ?? 0;
        return <p key={pairing.id} className="rounded-xl border border-line p-3"><strong>{pairing.name}: </strong>{!result.complete ? "Payout pending" : net === 0 ? "Even — $0 per player" : `Each player ${net > 0 ? "wins" : "loses"} ${formatMoney(Math.abs(net))} in ABC bets`}</p>;
      })}</div>
      <p className="mt-3 text-sm text-muted">ABC bets only. Eagle bounties are separate and included in the day’s settlement. Payment splits between recipients do not change each player’s total.</p>
    </section>
  );
}
