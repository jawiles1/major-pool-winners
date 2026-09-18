import tripData from "../../data/dancing-rabbit-2026.json";

export type PlayerId = string;
export type CourseId = "azaleas" | "oaks";
export type DayId = "thursday" | "friday" | "saturday" | "sunday";
export type TripFormat =
  | "two-best-net"
  | "round-robin-press"
  | "abc-best-ball"
  | "gross-and-net";
export type SkinsMode = "gross" | "net" | "both" | "none";

export type Hole = {
  number: number;
  par: number;
  yards: number;
  strokeIndex: number;
};

export type Course = {
  id: CourseId;
  name: string;
  tee: string;
  rating: number;
  slope: number;
  source: string;
  holes: Hole[];
};

export type Player = {
  id: PlayerId;
  name: string;
  shortName: string;
  handicaps: Record<CourseId, number>;
  note?: string;
};

export type Pairing = {
  id: string;
  name: string;
  playerIds: PlayerId[];
};

export type FridayTeam = {
  id: string;
  name: string;
  playerIds: PlayerId[];
  foursomeId: string;
};

export type TripDay = {
  id: DayId;
  label: string;
  date: string;
  time: string;
  courseId: CourseId;
  format: TripFormat;
  stakePerPlayer?: number;
  matchStake?: number;
  pressStake?: number;
  pressTriggerDown?: number;
  abcStakes?: Record<"A" | "B" | "C", number>;
  overallEligible: boolean;
  skins: SkinsMode;
  pairings: Pairing[];
  teams?: FridayTeam[];
};

export type TripData = {
  id: string;
  name: string;
  location: string;
  overallBuyIn: number;
  overallPayouts: number[];
  players: Player[];
  courses: Course[];
  days: TripDay[];
  bounties: {
    id: string;
    label: string;
    kind: "gross" | "net";
    amountFromEachOtherPlayer: number;
  }[];
  verificationNotes: string[];
};

export type ScoreState = Record<DayId, Record<PlayerId, Record<number, number>>>;
export type HandicapOverrideState = Partial<Record<DayId, Record<PlayerId, number>>>;

export type PlayerHoleScore = {
  player: Player;
  gross?: number;
  cappedGross?: number;
  strokes: number;
  net?: number;
  cap: number;
  wasCapped: boolean;
};

export type MoneyLine = {
  dayId: DayId;
  from: PlayerId;
  to: PlayerId;
  amount: number;
  note: string;
};

export type RecordedPayment = {
  id: string;
  dayId: DayId;
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  amount: number;
  calculationKey: string;
  paidAt: string;
};

export type BountyResult = {
  day: TripDay;
  hole: Hole;
  player: Player;
  kind: "gross" | "net";
  amount: number;
  note: string;
};

export type DailyResult = {
  day: TripDay;
  summaries: string[];
  playerNet: Record<PlayerId, number>;
  teamScores: { id: string; label: string; value: number; note?: string }[];
  moneyLines: MoneyLine[];
  winnerPlayerIds: PlayerId[];
  tied: boolean;
  complete: boolean;
  fridayMatches?: FridayMatchResult[];
};

export type FridayMatchResult = {
  id: string;
  teamA: FridayTeam;
  teamB: FridayTeam;
  segments: {
    id: string;
    label: string;
    startHole: number;
    margin: number;
    winnerTeamId?: string;
    amount: number;
  }[];
  teamNet: Record<string, number>;
};

export type OverallRow = {
  player: Player;
  points: number;
  grossMoney: number;
  bountyMoney: number;
  overallPayout: number;
  net: number;
};

export type SettlementTransfer = {
  from: Player;
  to: Player;
  amount: number;
};

export type DaySettlement = {
  day: TripDay;
  complete: boolean;
  calculationKey: string;
  calculatedTransfers: SettlementTransfer[];
  remainingTransfers: SettlementTransfer[];
  payments: RecordedPayment[];
  totalPaid: number;
  settled: boolean;
  needsReconciliation: boolean;
};

export type TripCalculations = {
  dayResults: DailyResult[];
  bounties: BountyResult[];
  overallRows: OverallRow[];
  settlement: SettlementTransfer[];
  daySettlements: DaySettlement[];
  overallComplete: boolean;
  moneyLines: MoneyLine[];
};

export const dancingRabbitTrip = tripData as TripData;

export function getCourse(courseId: CourseId): Course {
  const course = dancingRabbitTrip.courses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`Unknown course: ${courseId}`);
  }

  return course;
}

export function getPlayer(playerId: PlayerId): Player {
  const player = dancingRabbitTrip.players.find((item) => item.id === playerId);

  if (!player) {
    throw new Error(`Unknown player: ${playerId}`);
  }

  return player;
}

export function getDay(dayId: DayId): TripDay {
  const day = dancingRabbitTrip.days.find((item) => item.id === dayId);

  if (!day) {
    throw new Error(`Unknown day: ${dayId}`);
  }

  return day;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCourseHandicap(player: Player, courseId: CourseId): number {
  return player.handicaps[courseId];
}

export function getPlayerDayHandicap(
  day: TripDay,
  player: Player,
  overrides?: HandicapOverrideState,
): number {
  const override = overrides?.[day.id]?.[player.id];

  return typeof override === "number" && override >= 0
    ? override
    : getCourseHandicap(player, day.courseId);
}

export function getHoleStrokes(handicap: number, strokeIndex: number): number {
  const base = Math.floor(handicap / 18);
  const remainder = handicap % 18;

  return base + (strokeIndex <= remainder ? 1 : 0);
}

export function getPlayerHoleScore(
  day: TripDay,
  playerId: PlayerId,
  holeNumber: number,
  scores: ScoreState,
  overrides?: HandicapOverrideState,
): PlayerHoleScore {
  const player = getPlayer(playerId);
  const course = getCourse(day.courseId);
  const hole = course.holes[holeNumber - 1];
  const handicap = getPlayerDayHandicap(day, player, overrides);
  const strokes = getHoleStrokes(handicap, hole.strokeIndex);
  const cap = hole.par + 2 + strokes;
  const gross = scores[day.id]?.[playerId]?.[holeNumber];

  if (!gross) {
    return {
      player,
      strokes,
      cap,
      wasCapped: false,
    };
  }

  const cappedGross = Math.min(gross, cap);

  return {
    player,
    gross,
    cappedGross,
    strokes,
    net: cappedGross - strokes,
    cap,
    wasCapped: gross > cap,
  };
}

export function getDotString(player: Player, courseId: CourseId, hole: Hole): string {
  const strokes = getHoleStrokes(
    getCourseHandicap(player, courseId),
    hole.strokeIndex,
  );

  return "●".repeat(strokes);
}

export function getDayDotString(
  day: TripDay,
  player: Player,
  hole: Hole,
  overrides?: HandicapOverrideState,
): string {
  return "●".repeat(
    getHoleStrokes(getPlayerDayHandicap(day, player, overrides), hole.strokeIndex),
  );
}

export function createEmptyScoreState(): ScoreState {
  return dancingRabbitTrip.days.reduce((state, day) => {
    state[day.id] = {};

    for (const player of dancingRabbitTrip.players) {
      state[day.id][player.id] = {};
    }

    return state;
  }, {} as ScoreState);
}

export function createEmptyHandicapOverrideState(): HandicapOverrideState {
  return dancingRabbitTrip.days.reduce((state, day) => {
    state[day.id] = {};
    return state;
  }, {} as HandicapOverrideState);
}

function withPlayerAmount(
  playerNet: Record<PlayerId, number>,
  playerId: PlayerId,
  amount: number,
) {
  playerNet[playerId] = (playerNet[playerId] ?? 0) + amount;
}

function addTransfer(
  moneyLines: MoneyLine[],
  playerNet: Record<PlayerId, number>,
  dayId: DayId,
  from: PlayerId,
  to: PlayerId,
  amount: number,
  note: string,
) {
  moneyLines.push({ dayId, from, to, amount, note });
  withPlayerAmount(playerNet, from, -amount);
  withPlayerAmount(playerNet, to, amount);
}

function splitPairingStake(
  day: TripDay,
  winner: Pairing,
  loser: Pairing,
  stake: number,
  note: string,
): { playerNet: Record<PlayerId, number>; moneyLines: MoneyLine[] } {
  const playerNet: Record<PlayerId, number> = {};
  const moneyLines: MoneyLine[] = [];

  for (const from of loser.playerIds) {
    for (const to of winner.playerIds) {
      addTransfer(
        moneyLines,
        playerNet,
        day.id,
        from,
        to,
        stake / winner.playerIds.length,
        note,
      );
    }
  }

  return { playerNet, moneyLines };
}

function hasAllScores(day: TripDay, scores: ScoreState): boolean {
  return day.pairings
    .flatMap((pairing) => pairing.playerIds)
    .every((playerId) =>
      getCourse(day.courseId).holes.every(
        (hole) => Boolean(scores[day.id]?.[playerId]?.[hole.number]),
      ),
    );
}

function getPairingHoleNets(
  day: TripDay,
  pairing: Pairing,
  holeNumber: number,
  scores: ScoreState,
  overrides?: HandicapOverrideState,
): number[] {
  return pairing.playerIds
    .map((playerId) => getPlayerHoleScore(day, playerId, holeNumber, scores, overrides).net)
    .filter((net): net is number => typeof net === "number")
    .sort((left, right) => left - right);
}

function calculateThursday(day: TripDay, scores: ScoreState, overrides?: HandicapOverrideState): DailyResult {
  const [first, second] = day.pairings;
  const course = getCourse(day.courseId);
  const pairingTotals = day.pairings.map((pairing) => {
    const value = course.holes.reduce((sum, hole) => {
      const nets = getPairingHoleNets(day, pairing, hole.number, scores, overrides);
      return nets.length >= 2 ? sum + nets[0] + nets[1] : sum;
    }, 0);

    return { pairing, value };
  });

  const complete = hasAllScores(day, scores);
  const tied = complete && pairingTotals[0].value === pairingTotals[1].value;
  const winner =
    complete && !tied
      ? pairingTotals[0].value < pairingTotals[1].value
        ? first
        : second
      : undefined;
  const loser = winner?.id === first.id ? second : first;
  const settlement =
    winner && loser
      ? splitPairingStake(day, winner, loser, day.stakePerPlayer ?? 0, day.label)
      : { playerNet: {}, moneyLines: [] };

  return {
    day,
    summaries: [
      "2 best net balls by foursome.",
      complete
        ? tied
          ? "The foursomes are tied."
          : `${winner?.name} wins the daily game.`
        : "Enter all gross scores to settle the daily game.",
    ],
    playerNet: settlement.playerNet,
    teamScores: pairingTotals.map(({ pairing, value }) => ({
      id: pairing.id,
      label: pairing.name,
      value,
      note: "2 best net total",
    })),
    moneyLines: settlement.moneyLines,
    winnerPlayerIds: winner?.playerIds ?? [],
    tied,
    complete,
  };
}

function bestBallNetForTeam(
  day: TripDay,
  team: FridayTeam,
  holeNumber: number,
  scores: ScoreState,
  overrides?: HandicapOverrideState,
): number | undefined {
  const nets = team.playerIds
    .map((playerId) => getPlayerHoleScore(day, playerId, holeNumber, scores, overrides).net)
    .filter((net): net is number => typeof net === "number")
    .sort((left, right) => left - right);

  return nets[0];
}

function teamCombinations(teams: FridayTeam[]): [FridayTeam, FridayTeam][] {
  const combinations: [FridayTeam, FridayTeam][] = [];

  for (let left = 0; left < teams.length; left += 1) {
    for (let right = left + 1; right < teams.length; right += 1) {
      combinations.push([teams[left], teams[right]]);
    }
  }

  return combinations;
}

function calculateFriday(day: TripDay, scores: ScoreState, overrides?: HandicapOverrideState): DailyResult {
  const teams = day.teams ?? [];
  const course = getCourse(day.courseId);
  const playerNet: Record<PlayerId, number> = {};
  const moneyLines: MoneyLine[] = [];
  const matchResults: FridayMatchResult[] = [];
  const teamNet = Object.fromEntries(teams.map((team) => [team.id, 0]));
  const stake = day.matchStake ?? 10;
  const pressStake = day.pressStake ?? 10;
  const trigger = day.pressTriggerDown ?? 2;

  for (const [teamA, teamB] of teamCombinations(teams)) {
    const segments: FridayMatchResult["segments"] = [
      { id: `${teamA.id}-${teamB.id}-main`, label: "Original", startHole: 1, margin: 0, amount: stake },
    ];

    for (const hole of course.holes) {
      const aNet = bestBallNetForTeam(day, teamA, hole.number, scores, overrides);
      const bNet = bestBallNetForTeam(day, teamB, hole.number, scores, overrides);

      if (typeof aNet !== "number" || typeof bNet !== "number") {
        continue;
      }

      const holeResult = aNet === bNet ? 0 : aNet < bNet ? 1 : -1;

      for (const segment of segments) {
        if (hole.number >= segment.startHole) {
          segment.margin += holeResult;
        }
      }

      const triggeredSegments = segments.filter(
        (segment) =>
          !segment.winnerTeamId &&
          Math.abs(segment.margin) >= trigger &&
          hole.number < 18 &&
          !segments.some((other) => other.id === `${segment.id}-press`),
      );

      for (const segment of triggeredSegments) {
        segments.push({
          id: `${segment.id}-press`,
          label: `${segment.label} press after ${Math.abs(segment.margin)} down`,
          startHole: hole.number + 1,
          margin: 0,
          amount: pressStake,
        });
      }
    }

    for (const segment of segments) {
      segment.winnerTeamId =
        segment.margin > 0 ? teamA.id : segment.margin < 0 ? teamB.id : undefined;

      if (!segment.winnerTeamId) {
        continue;
      }

      const winner = segment.winnerTeamId === teamA.id ? teamA : teamB;
      const loser = winner.id === teamA.id ? teamB : teamA;
      teamNet[winner.id] += segment.amount;
      teamNet[loser.id] -= segment.amount;

      for (const from of loser.playerIds) {
        for (const to of winner.playerIds) {
          addTransfer(
            moneyLines,
            playerNet,
            day.id,
            from,
            to,
            segment.amount / winner.playerIds.length,
            `Friday ${teamA.name} vs ${teamB.name} - ${segment.label}`,
          );
        }
      }
    }

    matchResults.push({
      id: `${teamA.id}-${teamB.id}`,
      teamA,
      teamB,
      segments,
      teamNet: { [teamA.id]: teamNet[teamA.id], [teamB.id]: teamNet[teamB.id] },
    });
  }

  const foursomeNet = day.pairings.map((pairing) => {
    const value = teams
      .filter((team) => team.foursomeId === pairing.id)
      .reduce((sum, team) => sum + teamNet[team.id], 0);

    return { pairing, value };
  });
  const complete = hasAllScores(day, scores);
  const tied = complete && foursomeNet[0].value === foursomeNet[1].value;
  const winner =
    complete && !tied
      ? foursomeNet[0].value > foursomeNet[1].value
        ? foursomeNet[0].pairing
        : foursomeNet[1].pairing
      : undefined;

  return {
    day,
    summaries: [
      "Every 2-man team plays every other team in net best-ball match play.",
      "Presses are created automatically from the next hole when a segment reaches 2-down.",
    ],
    playerNet,
    teamScores: [
      ...teams.map((team) => ({
        id: team.id,
        label: team.name,
        value: teamNet[team.id],
        note: "Team match/press net",
      })),
      ...foursomeNet.map(({ pairing, value }) => ({
        id: pairing.id,
        label: `${pairing.name} combined`,
        value,
        note: "Overall-point comparator",
      })),
    ],
    moneyLines,
    winnerPlayerIds: winner?.playerIds ?? [],
    tied,
    complete,
    fridayMatches: matchResults,
  };
}

function calculateSaturday(day: TripDay, scores: ScoreState, overrides?: HandicapOverrideState): DailyResult {
  const course = getCourse(day.courseId);
  const buckets = ["A", "B", "C"] as const;
  const totals = day.pairings.map((pairing) => ({
    pairing,
    buckets: { A: 0, B: 0, C: 0 },
  }));
  const playerNet: Record<PlayerId, number> = {};
  const moneyLines: MoneyLine[] = [];

  for (const hole of course.holes) {
    for (const total of totals) {
      const sorted = total.pairing.playerIds
        .map((playerId) => getPlayerHoleScore(day, playerId, hole.number, scores, overrides))
        .filter((score) => typeof score.net === "number")
        .sort((left, right) => (left.net ?? 99) - (right.net ?? 99));

      for (const [index, bucket] of buckets.entries()) {
        total.buckets[bucket] += sorted[index]?.net ?? 0;
      }
    }
  }

  for (const bucket of buckets) {
    const first = totals[0];
    const second = totals[1];

    if (first.buckets[bucket] === second.buckets[bucket]) {
      continue;
    }

    const winner = first.buckets[bucket] < second.buckets[bucket] ? first.pairing : second.pairing;
    const loser = winner.id === first.pairing.id ? second.pairing : first.pairing;
    const settlement = splitPairingStake(
      day,
      winner,
      loser,
      day.abcStakes?.[bucket] ?? 0,
      `Saturday ${bucket} ball`,
    );

    for (const [playerId, amount] of Object.entries(settlement.playerNet)) {
      withPlayerAmount(playerNet, playerId, amount);
    }

    moneyLines.push(...settlement.moneyLines);
  }

  const complete = hasAllScores(day, scores);
  const combined = totals.map((total) => ({
    pairing: total.pairing,
    value: total.buckets.A + total.buckets.B + total.buckets.C,
  }));
  const tied = complete && combined[0].value === combined[1].value;
  const winner =
    complete && !tied
      ? combined[0].value < combined[1].value
        ? combined[0].pairing
        : combined[1].pairing
      : undefined;

  return {
    day,
    summaries: [
      "A, B, and C are separate competitions using the lowest, second-lowest, and third-lowest net balls in each foursome.",
    ],
    playerNet,
    teamScores: totals.flatMap((total) =>
      buckets.map((bucket) => ({
        id: `${total.pairing.id}-${bucket}`,
        label: `${total.pairing.name} ${bucket}`,
        value: total.buckets[bucket],
        note: `${formatMoney(day.abcStakes?.[bucket] ?? 0)}/man`,
      })),
    ),
    moneyLines,
    winnerPlayerIds: winner?.playerIds ?? [],
    tied,
    complete,
  };
}

function calculateSunday(day: TripDay, scores: ScoreState, overrides?: HandicapOverrideState): DailyResult {
  const course = getCourse(day.courseId);
  const totals = day.pairings.map((pairing) => ({
    pairing,
    gross: 0,
    net: 0,
  }));

  for (const hole of course.holes) {
    for (const total of totals) {
      const holeScores = total.pairing.playerIds.map((playerId) =>
        getPlayerHoleScore(day, playerId, hole.number, scores, overrides),
      );
      const grossScores = holeScores
        .map((score) => score.cappedGross)
        .filter((gross): gross is number => typeof gross === "number")
        .sort((left, right) => left - right);
      const netScores = holeScores
        .map((score) => score.net)
        .filter((net): net is number => typeof net === "number")
        .sort((left, right) => left - right);

      total.gross += grossScores[0] ?? 0;
      total.net += netScores[0] ?? 0;
    }
  }

  const playerNet: Record<PlayerId, number> = {};
  const moneyLines: MoneyLine[] = [];

  for (const key of ["gross", "net"] as const) {
    if (totals[0][key] === totals[1][key]) {
      continue;
    }

    const winner = totals[0][key] < totals[1][key] ? totals[0].pairing : totals[1].pairing;
    const loser = winner.id === totals[0].pairing.id ? totals[1].pairing : totals[0].pairing;
    const settlement = splitPairingStake(
      day,
      winner,
      loser,
      day.stakePerPlayer ?? 0,
      `Sunday best ${key}`,
    );

    for (const [playerId, amount] of Object.entries(settlement.playerNet)) {
      withPlayerAmount(playerNet, playerId, amount);
    }

    moneyLines.push(...settlement.moneyLines);
  }

  const complete = hasAllScores(day, scores);
  const firstCombined = totals[0].gross + totals[0].net;
  const secondCombined = totals[1].gross + totals[1].net;
  const tied = complete && firstCombined === secondCombined;
  const winner =
    complete && !tied
      ? firstCombined < secondCombined
        ? totals[0].pairing
        : totals[1].pairing
      : undefined;

  return {
    day,
    summaries: [
      "Best gross and best net are scored independently on each hole.",
      "The same player may count for both gross and net on the same hole.",
    ],
    playerNet,
    teamScores: totals.flatMap((total) => [
      {
        id: `${total.pairing.id}-gross`,
        label: `${total.pairing.name} gross`,
        value: total.gross,
        note: "Best gross",
      },
      {
        id: `${total.pairing.id}-net`,
        label: `${total.pairing.name} net`,
        value: total.net,
        note: "Best net",
      },
    ]),
    moneyLines,
    winnerPlayerIds: winner?.playerIds ?? [],
    tied,
    complete,
  };
}

export function calculateDay(day: TripDay, scores: ScoreState, overrides?: HandicapOverrideState): DailyResult {
  if (day.format === "two-best-net") {
    return calculateThursday(day, scores, overrides);
  }

  if (day.format === "round-robin-press") {
    return calculateFriday(day, scores, overrides);
  }

  if (day.format === "abc-best-ball") {
    return calculateSaturday(day, scores, overrides);
  }

  return calculateSunday(day, scores, overrides);
}

export function calculateBounties(
  scores: ScoreState,
  overrides?: HandicapOverrideState,
): {
  bounties: BountyResult[];
  moneyLines: MoneyLine[];
  playerNet: Record<PlayerId, number>;
} {
  const bounties: BountyResult[] = [];
  const moneyLines: MoneyLine[] = [];
  const playerNet: Record<PlayerId, number> = {};

  for (const day of dancingRabbitTrip.days) {
    const course = getCourse(day.courseId);

    for (const hole of course.holes) {
      for (const player of dancingRabbitTrip.players) {
        const score = getPlayerHoleScore(day, player.id, hole.number, scores, overrides);

        if (!score.gross || typeof score.net !== "number") {
          continue;
        }

        const grossQualifies = score.gross <= hole.par - 2;
        const netQualifies = score.net <= hole.par - 2;

        if (!grossQualifies && !netQualifies) {
          continue;
        }

        const kind = grossQualifies ? "gross" : "net";
        const bounty = dancingRabbitTrip.bounties.find((item) => item.kind === kind);

        if (!bounty) {
          continue;
        }

        const totalAmount =
          bounty.amountFromEachOtherPlayer * (dancingRabbitTrip.players.length - 1);

        bounties.push({
          day,
          hole,
          player,
          kind,
          amount: totalAmount,
          note: bounty.label,
        });

        for (const payer of dancingRabbitTrip.players) {
          if (payer.id === player.id) {
            continue;
          }

          addTransfer(
            moneyLines,
            playerNet,
            day.id,
            payer.id,
            player.id,
            bounty.amountFromEachOtherPlayer,
            `${day.label} hole ${hole.number} ${bounty.label}`,
          );
        }
      }
    }
  }

  return { bounties, moneyLines, playerNet };
}

function calculateOverallPayouts(dayResults: DailyResult[]): Record<PlayerId, number> {
  const points = Object.fromEntries(
    dancingRabbitTrip.players.map((player) => [player.id, 0]),
  ) as Record<PlayerId, number>;

  for (const result of dayResults) {
    if (!result.day.overallEligible || !result.complete) {
      continue;
    }

    if (result.tied) {
      for (const player of dancingRabbitTrip.players) {
        points[player.id] += 0.5;
      }
    } else {
      for (const playerId of result.winnerPlayerIds) {
        points[playerId] += 1;
      }
    }
  }

  const grouped = new Map<number, PlayerId[]>();

  for (const [playerId, pointValue] of Object.entries(points)) {
    const group = grouped.get(pointValue) ?? [];
    group.push(playerId);
    grouped.set(pointValue, group);
  }

  const payouts = Object.fromEntries(
    dancingRabbitTrip.players.map((player) => [player.id, 0]),
  ) as Record<PlayerId, number>;
  const sortedGroups = [...grouped.entries()].sort((left, right) => right[0] - left[0]);
  let payoutIndex = 0;

  for (const [, playerIds] of sortedGroups) {
    const groupPayout = dancingRabbitTrip.overallPayouts
      .slice(payoutIndex, payoutIndex + playerIds.length)
      .reduce((sum, amount) => sum + amount, 0);

    for (const playerId of playerIds) {
      payouts[playerId] = groupPayout / playerIds.length;
    }

    payoutIndex += playerIds.length;
  }

  return payouts;
}

function minimizeTransfers(balances: Record<PlayerId, number>): SettlementTransfer[] {
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -0.001)
    .map(([playerId, amount]) => ({ playerId, amount: -amount }))
    .sort((left, right) => right.amount - left.amount);
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0.001)
    .map(([playerId, amount]) => ({ playerId, amount }))
    .sort((left, right) => right.amount - left.amount);
  const transfers: SettlementTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      from: getPlayer(debtor.playerId),
      to: getPlayer(creditor.playerId),
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.001) {
      debtorIndex += 1;
    }

    if (creditor.amount <= 0.001) {
      creditorIndex += 1;
    }
  }

  return transfers;
}

function createPlayerBalances(): Record<PlayerId, number> {
  return Object.fromEntries(
    dancingRabbitTrip.players.map((player) => [player.id, 0]),
  ) as Record<PlayerId, number>;
}

function applyMoneyLines(
  balances: Record<PlayerId, number>,
  moneyLines: MoneyLine[],
) {
  for (const line of moneyLines) {
    balances[line.from] -= line.amount;
    balances[line.to] += line.amount;
  }
}

function applyPayments(
  balances: Record<PlayerId, number>,
  payments: RecordedPayment[],
) {
  for (const payment of payments) {
    balances[payment.fromPlayerId] += payment.amount;
    balances[payment.toPlayerId] -= payment.amount;
  }
}

function getCalculationKey(moneyLines: MoneyLine[]): string {
  return JSON.stringify(
    moneyLines
      .map((line) => ({
        from: line.from,
        to: line.to,
        amount: Number(line.amount.toFixed(4)),
        note: line.note,
      }))
      .sort((left, right) =>
        `${left.from}|${left.to}|${left.amount}|${left.note}`.localeCompare(
          `${right.from}|${right.to}|${right.amount}|${right.note}`,
        ),
      ),
  );
}

export function calculateTrip(
  scores: ScoreState,
  overrides?: HandicapOverrideState,
  payments: RecordedPayment[] = [],
): TripCalculations {
  const dayResults = dancingRabbitTrip.days.map((day) => calculateDay(day, scores, overrides));
  const bountyResult = calculateBounties(scores, overrides);
  const overallPayouts = calculateOverallPayouts(dayResults);
  const completeDayIds = new Set(
    dayResults.filter((result) => result.complete).map((result) => result.day.id),
  );
  const moneyLines = [
    ...dayResults.filter((result) => result.complete).flatMap((result) => result.moneyLines),
    ...bountyResult.moneyLines.filter((line) => completeDayIds.has(line.dayId)),
  ];
  const overallComplete = dayResults
    .filter((result) => result.day.overallEligible)
    .every((result) => result.complete);
  const earnedBalances = createPlayerBalances();
  const balances = createPlayerBalances();

  applyMoneyLines(earnedBalances, moneyLines);
  applyMoneyLines(balances, moneyLines);
  applyPayments(balances, payments);

  if (overallComplete) {
    for (const player of dancingRabbitTrip.players) {
      earnedBalances[player.id] -= dancingRabbitTrip.overallBuyIn;
      earnedBalances[player.id] += overallPayouts[player.id];
      balances[player.id] -= dancingRabbitTrip.overallBuyIn;
      balances[player.id] += overallPayouts[player.id];
    }
  }

  const daySettlements = dancingRabbitTrip.days.map((day): DaySettlement => {
    const result = dayResults.find((entry) => entry.day.id === day.id)!;
    const dayMoneyLines = result.complete
      ? moneyLines.filter((line) => line.dayId === day.id)
      : [];
    const dayPayments = payments.filter((payment) => payment.dayId === day.id);
    const calculationKey = getCalculationKey(dayMoneyLines);
    const calculatedBalances = createPlayerBalances();
    const remainingBalances = createPlayerBalances();

    applyMoneyLines(calculatedBalances, dayMoneyLines);
    applyMoneyLines(remainingBalances, dayMoneyLines);
    applyPayments(remainingBalances, dayPayments);

    const remainingTransfers = minimizeTransfers(remainingBalances);

    return {
      day,
      complete: result.complete,
      calculationKey,
      calculatedTransfers: minimizeTransfers(calculatedBalances),
      remainingTransfers,
      payments: dayPayments,
      totalPaid: dayPayments.reduce((sum, payment) => sum + payment.amount, 0),
      settled: result.complete && remainingTransfers.length === 0,
      needsReconciliation: dayPayments.some(
        (payment) => payment.calculationKey !== calculationKey,
      ),
    };
  });

  const overallRows = dancingRabbitTrip.players
    .map((player) => {
      const points = dayResults.reduce((sum, result) => {
        if (!result.day.overallEligible || !result.complete) {
          return sum;
        }

        if (result.tied) {
          return sum + 0.5;
        }

        return sum + (result.winnerPlayerIds.includes(player.id) ? 1 : 0);
      }, 0);

      const grossMoney = dayResults.reduce(
        (sum, result) => sum + (result.complete ? (result.playerNet[player.id] ?? 0) : 0),
        0,
      );
      const bountyMoney = moneyLines.reduce((sum, line) => {
        if (!line.note.toLowerCase().includes("eagle")) {
          return sum;
        }

        if (line.from === player.id) {
          return sum - line.amount;
        }

        return line.to === player.id ? sum + line.amount : sum;
      }, 0);

      return {
        player,
        points,
        grossMoney,
        bountyMoney,
        overallPayout: overallComplete ? overallPayouts[player.id] : 0,
        net: earnedBalances[player.id],
      };
    })
    .sort((left, right) => right.points - left.points || right.net - left.net);

  return {
    dayResults,
    bounties: bountyResult.bounties,
    overallRows,
    settlement: minimizeTransfers(balances),
    daySettlements,
    overallComplete,
    moneyLines,
  };
}
