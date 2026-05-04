import Link from "next/link";

import { majors } from "@/lib/data";
import { getSeasonMajors } from "@/lib/league";

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

export default function Season2027Page() {
  const seasonMajors = getSeasonMajors(majors, 2027);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.97),_rgba(245,239,226,1)_42%,_rgba(226,214,184,0.98)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="overflow-hidden rounded-[2.5rem] border border-line bg-[linear-gradient(135deg,_rgba(64,44,85,0.97),_rgba(106,72,140,0.93)_54%,_rgba(178,156,205,0.82)_100%)] text-white shadow-[0_30px_90px_rgba(64,44,85,0.16)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-100/85">
                Future Season
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                2027 is on deck, with the major roadmap already in place.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-violet-50/88 sm:text-base">
                This is a forward-looking season stub. The venues and dates are
                loaded so the league can plan ahead, and this page can grow into
                a full season view once results start landing.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/seasons" className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14">
                  Back to seasons
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-line bg-card/90 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            2027 schedule
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Major venues already set
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {seasonMajors.map((major) => (
              <article key={major.id} className="rounded-[1.5rem] border border-line bg-background/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {major.name}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{major.venue}</h3>
                <p className="mt-2 text-sm text-muted">{major.location}</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {formatDateRange(major.startDate, major.endDate)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
