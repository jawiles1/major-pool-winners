"use client";

import Link from "next/link";

import { PrintButton } from "@/components/print-button";
import {
  dancingRabbitTrip,
  formatMoney,
  getCourse,
  getDayDotString,
  getPlayer,
  getPlayerDayHandicap,
  type HandicapOverrideState,
  type Pairing,
  type TripDay,
} from "@/lib/dancing-rabbit";
import { useHandicapOverrides } from "@/lib/dancing-rabbit-handicap-overrides";

export default function DancingRabbitPrintPage() {
  const [handicapOverrides] = useHandicapOverrides();

  return (
    <main className="scorecard-print-root min-h-screen bg-white text-[#15261c]">
      <div className="print:hidden mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Printable Cards
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{dancingRabbitTrip.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/trips/dancing-rabbit-2026"
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
          >
            Trip home
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="scorecard-print-stack mx-auto grid w-full max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:px-10 print:max-w-none print:px-0 print:pb-0">
        {dancingRabbitTrip.days.flatMap((day) =>
          day.pairings.map((pairing) => (
            <ScorecardSheet
              key={`${day.id}-${pairing.id}`}
              day={day}
              pairing={pairing}
              handicapOverrides={handicapOverrides}
            />
          )),
        )}
      </div>
    </main>
  );
}

function ScorecardSheet({
  day,
  pairing,
  handicapOverrides,
}: {
  day: TripDay;
  pairing: Pairing;
  handicapOverrides?: HandicapOverrideState;
}) {
  const course = getCourse(day.courseId);
  const totalPar = course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalYards = course.holes.reduce((sum, hole) => sum + hole.yards, 0);
  const playerIds = day.format === "scramble" ? [] : pairing.playerIds;

  return (
    <section className="scorecard-print-sheet break-after-page bg-white p-4 print:p-0">
      <header className="grid grid-cols-[1fr_0.38fr] bg-[#075b3f] px-8 py-5 text-white">
        <div>
          <h2 className="text-3xl font-medium uppercase tracking-wide">
            {day.label} - {course.name.replace("The ", "The ")}
          </h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]">
            {course.tee} tees | {totalYards.toLocaleString()} yards | Par {totalPar} |{" "}
            {course.rating} / {course.slope}
          </p>
        </div>
        <div className="text-right uppercase">
          <p className="text-2xl font-medium">{pairing.name}</p>
          <p className="mt-3 text-sm font-semibold tracking-[0.12em]">
            {getFormatSubtitle(day)}
          </p>
        </div>
      </header>

      <div className="px-8 pt-3">
        <div className="rounded bg-[#e6eee9] py-2 text-center text-sm font-semibold uppercase tracking-[0.08em] text-[#075b3f]">
          {getPotLine(day)}
        </div>
        {day.format === "scramble" && <p className="mt-2 text-sm">Team: {pairing.playerIds.map(id => getPlayer(id).name).join(", ")}</p>}
      </div>

      <div className="px-8 pt-5">
        <table className="w-full table-fixed border-collapse text-center text-[11px]">
          <thead>
            <tr>
              <th className="w-[150px] border-2 border-[#38413c] bg-[#075b3f] px-2 py-3 text-left text-sm font-semibold uppercase text-white">
                Player / Hole
              </th>
              {course.holes.slice(0, 9).map((hole) => (
                <th key={hole.number} className="border-2 border-[#38413c] bg-[#dde8e2] px-1 py-2 font-medium">
                  {hole.number}
                </th>
              ))}
              <th className="border-2 border-[#38413c] bg-[#dde8e2] px-1 py-2 font-medium">Out</th>
              {course.holes.slice(9).map((hole) => (
                <th key={hole.number} className="border-2 border-[#38413c] bg-[#e8edf1] px-1 py-2 font-medium">
                  {hole.number}
                </th>
              ))}
              <th className="border-2 border-[#38413c] bg-[#e8edf1] px-1 py-2 font-medium">In</th>
              <th className="border-2 border-[#38413c] bg-[#e8edf1] px-1 py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            <InfoRow label={`${course.tee} yards`} values={course.holes.map((hole) => hole.yards)} />
            <InfoRow label="Par" values={course.holes.map((hole) => hole.par)} />
            <InfoRow label="Stroke index" values={course.holes.map((hole) => hole.strokeIndex)} skipTotals />
            {playerIds.map((playerId) => {
              const player = getPlayer(playerId);

              return (
                <tr key={playerId} className="scorecard-print-player-row h-[58px]">
                  <th className="border-2 border-[#38413c] bg-[#fbfbfb] px-2 py-2 text-left align-top">
                    <span className="block text-base font-medium">{player.name}</span>
                    <span className="mt-2 block text-[11px] font-medium uppercase text-[#5c6660]">
                      Course handicap {getPlayerDayHandicap(day, player, handicapOverrides)}
                    </span>
                  </th>
                  {course.holes.slice(0, 9).map((hole) => (
                    <td key={hole.number} className="border-2 border-[#38413c] px-1 py-2 align-top">
                      <span className="block min-h-4 text-[11px] leading-none text-[#075b3f]">
                        {getDayDotString(day, player, hole, handicapOverrides)}
                      </span>
                    </td>
                  ))}
                  <td className="border-2 border-[#38413c] bg-[#f6f6f6]" />
                  {course.holes.slice(9).map((hole) => (
                    <td key={hole.number} className="border-2 border-[#38413c] px-1 py-2 align-top">
                      <span className="block min-h-4 text-[11px] leading-none text-[#075b3f]">
                        {getDayDotString(day, player, hole, handicapOverrides)}
                      </span>
                    </td>
                  ))}
                  <td className="border-2 border-[#38413c] bg-[#f6f6f6]" />
                  <td className="border-2 border-[#38413c] bg-[#f6f6f6]" />
                </tr>
              );
            })}
            {getGameRows(day).map((row) => (
              <BlankGameRow
                key={row.label}
                label={row.label}
                sublabel={row.sublabel}
                accent={row.accent}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="scorecard-print-details grid grid-cols-[1fr_0.52fr] gap-10 px-8 pt-3">
        <section>
          <h3 className="text-base font-medium uppercase">Scoring</h3>
          <div className="mt-2 space-y-1 text-sm leading-5">
            {getScoringNotes(day).map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-medium uppercase">{day.label} rules</h3>
          <div className="mt-2 space-y-1 text-sm leading-5">
            {getRulesNotes(day).map((note) => (
              <p key={note}>{note}</p>
            ))}
            <p>Tie: ______________________________</p>
          </div>
        </section>
      </div>

      <footer className="grid grid-cols-[0.34fr_0.32fr_0.34fr] items-end gap-8 px-8 pt-5 text-xs text-[#666]">
        <div className="border-t border-[#aaa] pt-2 uppercase">Scorer</div>
        <div className="border-t border-[#aaa] pt-2 uppercase">Attest</div>
        <div className="text-right">
          Dancing Rabbit 2026 | {day.label} | {pairing.name}
        </div>
      </footer>
    </section>
  );
}

function InfoRow({
  label,
  values,
  skipTotals = false,
}: {
  label: string;
  values: number[];
  skipTotals?: boolean;
}) {
  const out = values.slice(0, 9).reduce((sum, value) => sum + value, 0);
  const inTotal = values.slice(9).reduce((sum, value) => sum + value, 0);

  return (
    <tr>
      <th className="border-2 border-[#38413c] bg-[#f1f1f1] px-2 py-2 text-left font-medium uppercase">
        {label}
      </th>
      {values.slice(0, 9).map((value, index) => (
        <td key={`${label}-out-${index}`} className="border-2 border-[#38413c] px-1 py-2">
          {value}
        </td>
      ))}
      <td className="border-2 border-[#38413c] bg-[#f1f1f1] px-1 py-2 font-bold">
        {skipTotals ? "" : out}
      </td>
      {values.slice(9).map((value, index) => (
        <td key={`${label}-in-${index}`} className="border-2 border-[#38413c] px-1 py-2">
          {value}
        </td>
      ))}
      <td className="border-2 border-[#38413c] bg-[#f1f1f1] px-1 py-2 font-bold">
        {skipTotals ? "" : inTotal}
      </td>
      <td className="border-2 border-[#38413c] bg-[#f1f1f1] px-1 py-2 font-bold">
        {skipTotals ? "" : out + inTotal}
      </td>
    </tr>
  );
}

function BlankGameRow({
  label,
  sublabel,
  accent = false,
}: {
  label: string;
  sublabel?: string;
  accent?: boolean;
}) {
  const cells = Array.from({ length: 21 }, (_, index) => index);

  return (
    <tr className={accent ? "h-[46px] bg-[#e6eee9] text-[#075b3f]" : "h-[36px]"}>
      <th className="border-2 border-[#38413c] px-2 py-2 text-left align-middle">
        <span className="block text-sm font-medium uppercase">{label}</span>
        {sublabel ? (
          <span className="mt-1 block text-[11px] font-medium uppercase">{sublabel}</span>
        ) : null}
      </th>
      {cells.map((cell) => (
        <td key={`${label}-${cell}`} className="border-2 border-[#38413c]" />
      ))}
    </tr>
  );
}

function getFormatSubtitle(day: TripDay): string {
  if (day.format === "scramble") return "4-man gross scramble";
  if (day.format === "two-best-net") {
    return "2 best net balls of 4";
  }

  if (day.format === "round-robin-press") {
    return "Net best-ball matches";
  }

  if (day.format === "abc-best-ball") {
    return "A / B / C best ball";
  }

  return "Best gross + best net";
}

function getPotLine(day: TripDay): string {
  if (day.format === "scramble") return "$50 per player | Each bogey-or-worse hole: $10 penalty per player";
  if (day.format === "round-robin-press") {
    return `${formatMoney(day.matchStake ?? 0)} matches | automatic ${formatMoney(day.pressStake ?? 0)} presses at 2 down`;
  }

  if (day.format === "abc-best-ball") {
    return `A: ${formatMoney(day.abcStakes?.A ?? 0)} per player | B: ${formatMoney(day.abcStakes?.B ?? 0)} per player | C: ${formatMoney(day.abcStakes?.C ?? 0)} per player`;
  }

  return `${formatMoney(day.stakePerPlayer ?? 0)} per player`;
}

function getGameRows(day: TripDay): Array<{
  label: string;
  sublabel?: string;
  accent?: boolean;
}> {
  if (day.format === "scramble") return [{ label: "Team gross", sublabel: "One scramble score", accent: true }, { label: "Bogey penalty", sublabel: "$10/man for bogey or worse" }];
  if (day.format === "abc-best-ball") {
    return [
      { label: "A ball", sublabel: "Lowest net ball", accent: true },
      { label: "B ball", sublabel: "Second-lowest net ball", accent: true },
      { label: "C ball", sublabel: "Third-lowest net ball", accent: true },
    ];
  }

  if (day.format === "gross-and-net") {
    return [
      { label: "Team total", sublabel: "Best gross + best net", accent: true },
      { label: "Side game 1" },
      { label: "Side game 2" },
    ];
  }

  if (day.format === "round-robin-press") {
    return [
      { label: "Team total", sublabel: "Matches and presses", accent: true },
      { label: "Side game 1" },
      { label: "Side game 2" },
    ];
  }

  return [
    { label: "Team total", sublabel: "2 best net balls", accent: true },
    { label: "Side game 1" },
    { label: "Side game 2" },
  ];
}

function getScoringNotes(day: TripDay): string[] {
  if (day.format === "scramble") return ["Record one gross scramble score per team per hole. No handicap strokes or score caps.", "Each bogey-or-worse hole costs $10 per player to the opposing team (one penalty, even for double bogey or worse).", "Eagle bounties are off for Sunday."];
  const shared = [
    "Record each player's gross score. A green dot marks a hole where that player receives one handicap stroke.",
    "Maximum score on every hole: net double bogey (par + 2 + handicap strokes received).",
  ];

  if (day.format === "two-best-net") {
    return [
      shared[0],
      "For each hole, add the two lowest net scores and write the result in the TEAM TOTAL row.",
      shared[1],
    ];
  }

  if (day.format === "round-robin-press") {
    return [
      shared[0],
      "Use each 2-man team's lowest net score on each hole for every simultaneous match.",
      "Start a new press on the next hole whenever a match or press reaches 2-down.",
      shared[1],
    ];
  }

  if (day.format === "abc-best-ball") {
    return [
      shared[0],
      "For each hole, write the lowest net score on the A BALL row, second-lowest net score on B BALL, and third-lowest net score on C BALL.",
      "A, B, and C are separate games. Total each row independently for the 18-hole result.",
      shared[1],
    ];
  }

  return [
    shared[0],
    "Track best gross and best net independently. The same player may count for both on a hole.",
    shared[1],
  ];
}

function getRulesNotes(day: TripDay): string[] {
  if (day.format === "scramble") return ["Lowest 18-hole gross total wins $50 and 1 overall point per player. Penalties do not change the winner.", "A gross tie: no main-bet payment, ½ overall point each; bogey penalties still apply."];
  if (day.format === "two-best-net") {
    return [
      "Winning foursome: lowest 18-hole team total.",
      "If Thursday is not completed, it does not count toward the overall competition.",
    ];
  }

  if (day.format === "round-robin-press") {
    return [
      "Every 2-man team plays every other 2-man team.",
      "Friday overall point is based on combined net winnings by foursome.",
    ];
  }

  if (day.format === "abc-best-ball") {
    return [
      "A, B, and C are separate 18-hole competitions.",
      "Lowest total in each bucket wins that bucket.",
    ];
  }

  return [
    "Best gross and best net are separate competitions.",
    "Same player's score may count for both gross and net on the same hole.",
  ];
}
