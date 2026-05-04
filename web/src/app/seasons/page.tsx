import Link from "next/link";

import { majors } from "@/lib/data";
import { getResolvedMajors, getSeasonMajors } from "@/lib/league";

const seasonYears = [2025, 2026, 2027, 2028] as const;

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start) +
    " - " +
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end);
}

export default function SeasonsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_45%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(37,49,74,0.97),_rgba(66,93,133,0.93)_52%,_rgba(177,186,202,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(37,49,74,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-100/85">
                Seasons
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                The full league term, one season at a time.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-sky-50/88 sm:text-base">
                Start with the fully documented 2025 season, move into the live
                2026 story, and keep future years in view as the four-year major
                cycle unfolds.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/standings"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  View standings
                </Link>
                <Link
                  href="/majors"
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Browse majors
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
                  Season pages
                </p>
                <p className="mt-2 text-3xl font-semibold">4</p>
                <p className="mt-2 text-sm leading-6 text-sky-50/82">
                  One page for each year from 2025 through 2028.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          {seasonYears.map((year) => {
            const seasonMajors = getSeasonMajors(majors, year);
            const resolvedMajors = getResolvedMajors(seasonMajors);
            const firstMajor = seasonMajors[0];
            const seasonState =
              resolvedMajors.length === 0
                ? "Upcoming"
                : resolvedMajors.length === seasonMajors.length
                  ? "Completed"
                  : "In progress";

            return (
              <Link
                key={year}
                href={`/seasons/${year}`}
                className="rounded-[2rem] border border-line bg-card/90 p-6 transition hover:bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                      Season {year}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {year} majors
                    </h2>
                  </div>
                  <div className="rounded-full border border-line bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {seasonState}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted">
                  {resolvedMajors.length} of {seasonMajors.length} majors resolved.
                </p>
                {firstMajor ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Opens with {firstMajor.name}:{" "}
                    {formatDateRange(firstMajor.startDate, firstMajor.endDate)}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
