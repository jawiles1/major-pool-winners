import { getPlayer, type Hole, type Pairing } from "@/lib/dancing-rabbit";

export function DancingRabbitScrambleInput({ pairing, hole, value, onChange }: {
  pairing: Pairing; hole: Hole; value?: number; onChange: (value: string) => void;
}) {
  return <label className="block rounded-xl border border-line bg-background/70 p-4">
    <span className="block text-lg font-semibold">{pairing.name} — team gross score</span>
    <span className="mt-1 block text-sm text-muted">{pairing.playerIds.map(id => getPlayer(id).shortName).join(", ")}</span>
    <span className="mt-2 block text-sm">One score for the whole team. No strokes or caps.</span>
    <input type="number" inputMode="numeric" min={1} step={1} value={value || ""} onChange={event => onChange(event.target.value)} aria-label={`${pairing.name} scramble hole ${hole.number}`} className="mt-3 h-16 w-full rounded-lg border border-line bg-white text-center text-3xl font-semibold" />
    <span className="mt-2 block text-sm font-semibold">{value && value > hole.par ? "Bogey or worse — $10 penalty per player" : value ? "No bogey penalty" : "Awaiting team score"}</span>
  </label>;
}
