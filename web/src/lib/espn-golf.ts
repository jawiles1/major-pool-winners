export const ESPN_PGA_CHAMPIONSHIP_2026_EVENT_ID = "401811947";
export const ESPN_PGA_CHAMPIONSHIP_2026_LEADERBOARD_URL =
  `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${ESPN_PGA_CHAMPIONSHIP_2026_EVENT_ID}`;

type EspnRawStat = {
  name?: string;
  displayValue?: string;
  value?: number;
};

type EspnRawLineScore = {
  period?: number;
  value?: number;
  displayValue?: string;
  currentPosition?: number;
  teeTime?: string;
  isPlayoff?: boolean;
};

type EspnRawPosition = {
  displayName?: string;
  isTie?: boolean;
};

type EspnRawWeather = {
  displayValue?: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  lastUpdated?: string;
};

type EspnRawCompetitor = {
  id?: string;
  sortOrder?: number;
  score?: {
    value?: number;
    displayValue?: string;
  };
  status?: {
    detail?: string;
    displayValue?: string;
    period?: number;
    teeTime?: string;
    startHole?: number;
    thru?: number;
    displayThru?: string;
    type?: {
      description?: string;
      shortDetail?: string;
      state?: string;
      completed?: boolean;
    };
    position?: EspnRawPosition;
  };
  athlete?: {
    id?: string;
    displayName?: string;
    shortName?: string;
    headshot?: {
      href?: string;
    };
    flag?: {
      href?: string;
      alt?: string;
    };
    links?: Array<{
      href?: string;
    }>;
  };
  linescores?: EspnRawLineScore[];
  statistics?: EspnRawStat[];
};

type EspnRawLeaderboard = {
  events?: Array<{
    id?: string;
    name?: string;
    date?: string;
    endDate?: string;
    status?: {
      type?: {
        description?: string;
        state?: string;
        completed?: boolean;
      };
    };
    courses?: Array<{
      name?: string;
      totalYards?: number;
      shotsToPar?: number;
      address?: {
        city?: string;
        state?: string;
      };
      weather?: EspnRawWeather;
    }>;
    competitions?: Array<{
      competitors?: EspnRawCompetitor[];
    }>;
  }>;
};

export type EspnGolfRoundScore = {
  period: number;
  strokes: number | null;
  scoreToPar: string | null;
  teeTime: string | null;
  positionAfterRound: string | null;
  isPlayoff: boolean;
};

export type EspnGolfLeaderboardCompetitor = {
  espnId: string;
  displayName: string;
  shortName: string;
  sortOrder: number | null;
  position: string;
  totalScore: string;
  totalStrokes: number | null;
  today: string;
  thru: string;
  currentRound: number | null;
  teeTime: string | null;
  startHole: number | null;
  status: string;
  statusState: string;
  scoreToPar: string;
  headshotUrl: string | null;
  flagUrl: string | null;
  flagAlt: string | null;
  playerUrl: string | null;
  roundScores: EspnGolfRoundScore[];
};

export type EspnGolfLeaderboardPayload = {
  fetchedAt: string;
  source: {
    provider: "ESPN";
    url: string;
    eventId: string;
    note: string;
  };
  event: {
    id: string;
    name: string;
    status: string;
    statusState: string;
    completed: boolean;
    startDate: string | null;
    endDate: string | null;
  };
  course: {
    name: string;
    totalYards: number | null;
    par: number | null;
    location: string;
    weather: string | null;
  } | null;
  competitors: EspnGolfLeaderboardCompetitor[];
};

export function normalizeScoringName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/[.'’,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapEspnGolfLeaderboard(
  rawLeaderboard: unknown,
  sourceUrl = ESPN_PGA_CHAMPIONSHIP_2026_LEADERBOARD_URL,
): EspnGolfLeaderboardPayload {
  const leaderboard = rawLeaderboard as EspnRawLeaderboard;
  const event = leaderboard.events?.[0];
  const course = event?.courses?.[0];
  const competitors = event?.competitions?.[0]?.competitors ?? [];

  return {
    fetchedAt: new Date().toISOString(),
    source: {
      provider: "ESPN",
      url: sourceUrl,
      eventId: event?.id ?? ESPN_PGA_CHAMPIONSHIP_2026_EVENT_ID,
      note: "Unauthenticated ESPN leaderboard JSON. Useful for live scoring, but not a guaranteed long-term contract.",
    },
    event: {
      id: event?.id ?? ESPN_PGA_CHAMPIONSHIP_2026_EVENT_ID,
      name: event?.name ?? "PGA Championship",
      status: event?.status?.type?.description ?? "Unknown",
      statusState: event?.status?.type?.state ?? "unknown",
      completed: event?.status?.type?.completed ?? false,
      startDate: event?.date ?? null,
      endDate: event?.endDate ?? null,
    },
    course: course
      ? {
          name: course.name ?? "Aronimink Golf Club",
          totalYards: course.totalYards ?? null,
          par: course.shotsToPar ?? null,
          location: [course.address?.city, course.address?.state]
            .filter(Boolean)
            .join(", "),
          weather: formatWeather(course.weather),
        }
      : null,
    competitors: competitors
      .map(mapCompetitor)
      .filter((competitor): competitor is EspnGolfLeaderboardCompetitor =>
        Boolean(competitor),
      )
      .sort((left, right) => {
        const leftOrder = left.sortOrder ?? Number.POSITIVE_INFINITY;
        const rightOrder = right.sortOrder ?? Number.POSITIVE_INFINITY;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.displayName.localeCompare(right.displayName);
      }),
  };
}

function mapCompetitor(
  competitor: EspnRawCompetitor,
): EspnGolfLeaderboardCompetitor | null {
  const displayName = competitor.athlete?.displayName;

  if (!competitor.id || !displayName) {
    return null;
  }

  const scoreToPar = getStatisticDisplay(competitor.statistics, "scoreToPar");
  const status = competitor.status;

  return {
    espnId: competitor.id,
    displayName,
    shortName: competitor.athlete?.shortName ?? displayName,
    sortOrder: competitor.sortOrder ?? null,
    position: formatPosition(status?.position),
    totalScore: competitor.score?.displayValue ?? scoreToPar ?? "-",
    totalStrokes: competitor.score?.value ?? null,
    today: status?.detail ?? status?.displayValue ?? "-",
    thru: status?.type?.shortDetail === "F"
      ? "F"
      : status?.displayThru ?? formatNumber(status?.thru),
    currentRound: status?.period ?? null,
    teeTime: status?.teeTime ?? null,
    startHole: status?.startHole ?? null,
    status: status?.type?.description ?? "Unknown",
    statusState: status?.type?.state ?? "unknown",
    scoreToPar: scoreToPar ?? competitor.score?.displayValue ?? "-",
    headshotUrl: competitor.athlete?.headshot?.href ?? null,
    flagUrl: competitor.athlete?.flag?.href ?? null,
    flagAlt: competitor.athlete?.flag?.alt ?? null,
    playerUrl: competitor.athlete?.links?.[0]?.href ?? null,
    roundScores: (competitor.linescores ?? [])
      .filter((lineScore) => typeof lineScore.period === "number")
      .map((lineScore) => ({
        period: lineScore.period as number,
        strokes: lineScore.value ?? null,
        scoreToPar: lineScore.displayValue ?? null,
        teeTime: lineScore.teeTime ?? null,
        positionAfterRound: formatNumber(lineScore.currentPosition),
        isPlayoff: lineScore.isPlayoff ?? false,
      })),
  };
}

function getStatisticDisplay(
  statistics: EspnRawStat[] | undefined,
  name: string,
): string | null {
  return statistics?.find((statistic) => statistic.name === name)?.displayValue ?? null;
}

function formatNumber(value: number | undefined): string {
  return typeof value === "number" ? value.toString() : "-";
}

function formatPosition(position: EspnRawPosition | undefined): string {
  if (!position?.displayName || position.displayName === "-") {
    return "-";
  }

  return position.isTie ? `T${position.displayName}` : position.displayName;
}

function formatWeather(weather: EspnRawWeather | undefined): string | null {
  if (!weather) {
    return null;
  }

  const condition = weather.displayValue;
  const temperature =
    typeof weather.temperature === "number" ? `${weather.temperature}F` : null;
  const wind =
    typeof weather.windSpeed === "number" && weather.windDirection
      ? `${weather.windSpeed} mph ${weather.windDirection}`
      : null;

  return [condition, temperature, wind].filter(Boolean).join(" | ") || null;
}
