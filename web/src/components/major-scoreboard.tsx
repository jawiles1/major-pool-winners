"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  EspnGolfLeaderboardPayload,
  EspnGolfRoundScore,
} from "@/lib/espn-golf";
import { normalizeScoringName } from "@/lib/espn-golf";

export type LeagueMajorScoreboardRow = {
  golferId: string;
  memberId: string;
  golferName: string;
  memberName: string;
  teamName: string;
  isInField: boolean;
};

type MajorScoreboardProps = {
  rows: LeagueMajorScoreboardRow[];
  leaderboardApiPath: string;
  eyebrow: string;
  title: string;
  description: string;
  scoreboardTimeZone?: string;
  scoreboardTimeZoneLabel?: string;
};

const roundNumbers = [1, 2, 3, 4] as const;
const leagueTimeZone = "America/Chicago";

export function MajorScoreboard({
  rows,
  leaderboardApiPath,
  eyebrow,
  title,
  description,
  scoreboardTimeZone = leagueTimeZone,
  scoreboardTimeZoneLabel = "Central time",
}: MajorScoreboardProps) {
  const [leaderboard, setLeaderboard] =
    useState<EspnGolfLeaderboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch(leaderboardApiPath, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.error ?? `Leaderboard request failed: ${response.status}`,
        );
      }

      setLeaderboard(await response.json());
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load live scoring.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [leaderboardApiPath]);

  useEffect(() => {
    let isMounted = true;

    async function refreshIfMounted() {
      if (isMounted) {
        await loadLeaderboard();
      }
    }

    refreshIfMounted();
    const interval = window.setInterval(refreshIfMounted, 60_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [loadLeaderboard]);

  const mergedRows = useMemo(() => {
    const competitorsByName = new Map(
      leaderboard?.competitors.map((competitor) => [
        normalizeScoringName(competitor.displayName),
        competitor,
      ]) ?? [],
    );

    return rows
      .map((row) => ({
        ...row,
        live: competitorsByName.get(normalizeScoringName(row.golferName)) ?? null,
      }))
      .sort((left, right) => {
        if (left.isInField !== right.isInField) {
          return left.isInField ? -1 : 1;
        }

        const leftOrder = left.live?.sortOrder ?? Number.POSITIVE_INFINITY;
        const rightOrder = right.live?.sortOrder ?? Number.POSITIVE_INFINITY;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        const teamSort = left.teamName.localeCompare(right.teamName);

        if (teamSort !== 0) {
          return teamSort;
        }

        return left.golferName.localeCompare(right.golferName);
      });
  }, [leaderboard, rows]);

  const scoredLeagueGolfers = mergedRows.filter((row) => row.live).length;
  const leagueLeader = mergedRows.find(
    (row) => row.live?.position && row.live.position !== "-",
  );

  return (
    <section className="rounded-[2rem] border border-line bg-card/92 p-5 shadow-[0_24px_70px_rgba(21,38,28,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Tee times shown in {scoreboardTimeZoneLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeaderboard}
          className="w-full rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background sm:w-auto"
        >
          {isRefreshing ? "Refreshing" : "Refresh scores"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <article className="rounded-[1.25rem] border border-line bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Event status
          </p>
          <p className="mt-2 text-xl font-semibold">
            {leaderboard?.event.status ?? "Loading"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {leaderboard?.event.statusState ?? "Waiting for ESPN feed"}
          </p>
        </article>

        <article className="rounded-[1.25rem] border border-line bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            League rows matched
          </p>
          <p className="mt-2 text-xl font-semibold">
            {scoredLeagueGolfers} of {rows.length}
          </p>
          <p className="mt-1 text-sm text-muted">
            Scoring rows currently matched by golfer name.
          </p>
        </article>

        <article className="rounded-[1.25rem] border border-line bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            League leader
          </p>
          <p className="mt-2 text-xl font-semibold">
            {leagueLeader?.golferName ?? "No scores yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {leagueLeader?.live
              ? `${leagueLeader.live.position} for ${leagueLeader.teamName}`
              : "Tee times load before round scores post."}
          </p>
        </article>
      </div>

      {leaderboard?.course ? (
        <div className="mt-4 rounded-[1.25rem] border border-line bg-white/55 p-4 text-sm leading-6 text-muted">
          {leaderboard.course.name}
          {leaderboard.course.par ? ` | Par ${leaderboard.course.par}` : null}
          {leaderboard.course.totalYards
            ? ` | ${leaderboard.course.totalYards.toLocaleString()} yards`
            : null}
          {leaderboard.course.weather ? ` | ${leaderboard.course.weather}` : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
          Live scoring is unavailable right now. {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-[1.35rem] border border-line">
        <table className="min-w-[1120px] w-full border-collapse bg-background/70 text-sm">
          <thead>
            <tr className="bg-[#173c27] text-left text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50">
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Golfer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Today</th>
              <th className="px-4 py-3">Thru</th>
              {roundNumbers.map((roundNumber) => (
                <th key={roundNumber} className="px-4 py-3">
                  R{roundNumber}
                </th>
              ))}
              <th className="px-4 py-3">Field</th>
            </tr>
          </thead>
          <tbody>
            {mergedRows.map((row, index) => (
              <tr
                key={row.golferId}
                className={index % 2 === 0 ? "bg-card/80" : "bg-background/80"}
              >
                <td className="px-4 py-4 font-semibold text-foreground">
                  {row.live?.position ?? "-"}
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{row.teamName}</p>
                  <p className="mt-1 text-xs text-muted">{row.memberName}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{row.golferName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {row.live?.status ?? "No scoring row"}
                  </p>
                </td>
                <td className="px-4 py-4 font-semibold text-foreground">
                  {formatScoreValue(row.live?.totalScore)}
                </td>
                <td className="px-4 py-4 text-muted">
                  {formatScoreValue(row.live?.today)}
                </td>
                <td className="px-4 py-4 text-muted">{row.live?.thru ?? "-"}</td>
                {roundNumbers.map((roundNumber) => (
                  <td key={roundNumber} className="px-4 py-4 text-muted">
                    {formatRoundScore(
                      row.live?.roundScores.find(
                        (roundScore) => roundScore.period === roundNumber,
                      ) ?? null,
                      scoreboardTimeZone,
                    )}
                  </td>
                ))}
                <td className="px-4 py-4">
                  <span
                    className={
                      row.isInField
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800"
                        : "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-800"
                    }
                  >
                    {row.isInField ? "In" : "Missing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Last fetched:{" "}
          {leaderboard?.fetchedAt ? formatFetchedAt(leaderboard.fetchedAt) : "Not yet"}
        </p>
        <p>
          Source:{" "}
          {leaderboard?.source.url ? (
            <a
              href={leaderboard.source.url}
              className="font-semibold text-accent underline-offset-4 hover:underline"
            >
              ESPN public leaderboard JSON
            </a>
          ) : (
            "ESPN public leaderboard JSON"
          )}
        </p>
      </div>
    </section>
  );
}

function formatRoundScore(
  roundScore: EspnGolfRoundScore | null,
  timeZone: string,
): string {
  if (!roundScore) {
    return "TBD";
  }

  if (roundScore.strokes !== null) {
    return roundScore.scoreToPar
      ? `${roundScore.strokes} (${formatScoreValue(roundScore.scoreToPar)})`
      : roundScore.strokes.toString();
  }

  if (roundScore.teeTime) {
    return formatTeeTime(roundScore.teeTime, timeZone);
  }

  return "Pending";
}

function formatScoreValue(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || /^-+$/.test(trimmedValue)) {
    return "-";
  }

  return trimmedValue.replace(/^-{2,}(?=\d|\()/, "-");
}

function formatTeeTime(teeTime: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(teeTime));
}

function formatFetchedAt(fetchedAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(fetchedAt));
}
