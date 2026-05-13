"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", state: "live" },
  { href: "/standings", label: "Standings", state: "live" },
  { href: "/seasons", label: "Seasons", state: "live" },
  { href: "/teams", label: "Teams", state: "live" },
  { href: "/majors", label: "Majors", state: "live" },
  { href: "/majors/2026-pga-championship", label: "2026 PGA", state: "live" },
  { href: "/ledger", label: "Ledger", state: "live" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const activeHref = navItems
    .filter((item) =>
      item.href === "/"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/88 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Major Pool Winners
            </span>
            <span className="mt-1 text-lg font-semibold tracking-tight">
              Golf major draft league
            </span>
          </Link>

          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-line bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/60"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
