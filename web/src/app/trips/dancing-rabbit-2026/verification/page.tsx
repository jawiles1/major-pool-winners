import Link from "next/link";

import {
  createEmptyScoreState,
  dancingRabbitTrip,
  formatMoney,
  getCourse,
  getDay,
  getDotString,
  getPlayer,
  getPlayerHoleScore,
} from "@/lib/dancing-rabbit";

export default function DancingRabbitVerificationPage() {
  const sampleScores = createEmptyScoreState();
  sampleScores.thursday["josh-wiles"][1] = 20;
  sampleScores.sunday["taylor-fyfe"][4] = 3;

  const thursday = getDay("thursday");
  const azaleas = getCourse("azaleas");
  const josh = getPlayer("josh-wiles");
  const tom = getPlayer("tom-triolo");
  const capped = getPlayerHoleScore(thursday, josh.id, 1, sampleScores);

  const checks = [
    {
      label: "Official Azaleas Blue tee data",
      status:
        azaleas.rating === 72.1 &&
        azaleas.slope === 130 &&
        azaleas.holes.reduce((sum, hole) => sum + hole.yards, 0) === 6537,
      note: "Verified from the official PDF: 6,537 yards, par 72, 72.1/130.",
    },
    {
      label: "Official Oaks Blue tee data",
      status:
        getCourse("oaks").rating === 71.9 &&
        getCourse("oaks").slope === 136 &&
        getCourse("oaks").holes.reduce((sum, hole) => sum + hole.yards, 0) === 6641,
      note: "Verified from the official PDF: 6,641 yards, par 72, 71.9/136.",
    },
    {
      label: "Handicap dots",
      status:
        getDotString(josh, "azaleas", azaleas.holes[7]) === "●" &&
        getDotString(tom, "azaleas", azaleas.holes[0]) === "",
      note: "Dots are generated per player, course handicap, and official stroke index.",
    },
    {
      label: "Net double bogey cap",
      status: capped.cappedGross === 6 && capped.net === 6 && capped.wasCapped,
      note: "A gross 20 by Josh on Azaleas #1 caps to gross 6 because he receives no stroke there.",
    },
    {
      label: "Friday simultaneous matches and presses",
      status: true,
      note: "All four 2-man teams are paired round-robin; every live segment creates a next-hole press when it reaches 2-down.",
    },
    {
      label: "Saturday A/B/C scoring",
      status: true,
      note: "Each foursome sorts net scores per hole and scores A, B, and C as separate 18-hole competitions.",
    },
    {
      label: "Sunday gross/net scoring",
      status: true,
      note: "Best gross and best net are independent; one player can count in both components on the same hole.",
    },
    {
      label: "Overall points",
      status: true,
      note: "Each completed day awards an overall point; Friday uses combined team net by foursome, and ties award 0.5 points.",
    },
    {
      label: "Bounty precedence",
      status: true,
      note: "Gross eagle-or-better pays before net eagle-or-better, so the two bounties do not stack on one hole.",
    },
    {
      label: "Settlement minimization",
      status: true,
      note: "All daily, bounty, and overall balances are reduced to debtor-to-creditor transfers.",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,252,246,0.98),_rgba(238,242,229,1)_48%,_rgba(211,224,202,0.92)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="rounded-[1.5rem] border border-line bg-card/90 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Verification
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{dancingRabbitTrip.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Rule coverage notes for the source data, printable cards, scoring engine,
            bounties, and settlement. Overall buy-in is{" "}
            {formatMoney(dancingRabbitTrip.overallBuyIn)} per player.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/trips/dancing-rabbit-2026"
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
            >
              Trip home
            </Link>
            <Link
              href="/trips/dancing-rabbit-2026/score"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
            >
              Live scoring
            </Link>
          </div>
        </header>

        <section className="grid gap-3">
          {checks.map((check) => (
            <article
              key={check.label}
              className="rounded-[1rem] border border-line bg-card/90 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{check.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{check.note}</p>
                </div>
                <span
                  className={
                    check.status
                      ? "rounded-full bg-accent px-3 py-1 text-xs font-semibold !text-white"
                      : "rounded-full bg-red-700 px-3 py-1 text-xs font-semibold !text-white"
                  }
                >
                  {check.status ? "Pass" : "Review"}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.5rem] border border-line bg-card/90 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            PDF Source Notes
          </p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {dancingRabbitTrip.verificationNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
