import Link from "next/link";

import { golfers, leagueTerm, majors, members, rosters } from "@/lib/data";
import { getResolvedMajors, getStandings } from "@/lib/league";

export default function Home() {
  const resolvedMajors = getResolvedMajors(majors).sort((left, right) =>
    left.endDate.localeCompare(right.endDate),
  );
  const latestMajor = resolvedMajors.at(-1);
  const standings = getStandings(
    resolvedMajors,
    leagueTerm,
    golfers,
    rosters,
    members,
  );
  const leader = standings[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.95),_rgba(245,239,226,1)_45%,_rgba(228,218,193,0.95)_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Major Pool Winners
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Golf major draft league
            </h1>
          </div>
          <div className="rounded-full border border-line bg-card px-4 py-2 text-sm text-muted">
            2025 to 2028 term
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.45fr_0.9fr] lg:py-12">
          <div className="rounded-[2rem] border border-line bg-card/90 p-7 shadow-[0_20px_70px_rgba(23,60,39,0.08)] sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">
              Sunday sweat central
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Fast standings, clean payouts, and major-week drama in one place.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Built for a six-team golf league where the only thing that matters
              is who actually wins the majors and who needs to pay up after.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/seasons"
                className="rounded-full border border-line bg-transparent px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-white/50"
              >
                Browse seasons
              </Link>
              <a
                href="#mvp-sections"
                className="rounded-full border border-line bg-transparent px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-white/50"
              >
                Explore the MVP
              </a>
            </div>

            <div
              id="mvp-sections"
              className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                {
                  label: "History",
                  value: "2025 season",
                  note: "Start with the original draft and first major cycle.",
                },
                {
                  label: "Majors",
                  value: "4 events",
                  note: "Each season will get dedicated major pages.",
                },
                {
                  label: "Rosters",
                  value: "16 majors",
                  note: "The full 2025-2028 term is preserved year by year.",
                },
                {
                  label: "Ledger",
                  value: "5 payers",
                  note: "One drafted win creates five obligations.",
                },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-line bg-background/70 p-4"
                >
                  <p className="text-sm font-medium text-muted">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <section className="rounded-[2rem] border border-line bg-[#173c27] p-6 text-white shadow-[0_20px_60px_rgba(23,60,39,0.18)]">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/80">
                League snapshot
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">
                    Current leader
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {leader?.member.displayName ?? "League leader"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">
                    Featured season
                  </p>
                  <p className="mt-1 text-lg font-medium">
                    {latestMajor ? `${latestMajor.year} is the current checkpoint.` : "2025 is ready to review."}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">
                    Latest result
                  </p>
                  <p className="mt-1 text-base text-emerald-50">
                    {latestMajor
                      ? `${latestMajor.name} is settled.`
                      : "League history is loaded and ready to explore."}
                  </p>
                </div>
              </div>
            </section>

            <section
              id="coming-next"
              className="rounded-[2rem] border border-line bg-card p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Coming next
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-muted">
                <li>The 2025 season page now carries the original draft and offseason story.</li>
                <li>Next up is expanding from season history into standings and majors navigation.</li>
                <li>Major-specific pages will later support automated event updates.</li>
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
