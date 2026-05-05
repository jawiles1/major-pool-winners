import type {
  AnnualDropDecision,
  DraftBoardPick,
  Golfer,
  LeagueTerm,
  Major,
  Member,
  PaymentObligation,
  PayoutDecision,
  PayoutEvent,
  RosterPick,
  StandingsRow,
  WinnerMatch,
} from "@/lib/types";

export function normalizeGolferName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.'’,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findWinnerMatch(
  major: Major,
  golfers: Golfer[],
  rosters: RosterPick[],
  members: Member[],
  leagueTermId: string,
): WinnerMatch {
  const termRosters = rosters.filter(
    (pick) =>
      pick.leagueTermId === leagueTermId && isRosterPickActiveInYear(pick, major.year),
  );

  if (major.winnerGolferId) {
    const rosterPick = termRosters.find((pick) => pick.golferId === major.winnerGolferId);
    const golfer = golfers.find((entry) => entry.id === major.winnerGolferId);
    const member = rosterPick
      ? members.find((entry) => entry.id === rosterPick.memberId)
      : undefined;

    return {
      golfer,
      rosterPick,
      member,
      matchedBy: rosterPick ? "winnerGolferId" : "none",
    };
  }

  if (!major.winnerName) {
    return { matchedBy: "none" };
  }

  const normalizedWinnerName = normalizeGolferName(major.winnerName);
  const golfer = golfers.find(
    (entry) => entry.normalizedName === normalizedWinnerName,
  );

  if (!golfer) {
    return { matchedBy: "none" };
  }

  const rosterPick = termRosters.find((pick) => pick.golferId === golfer.id);
  const member = rosterPick
    ? members.find((entry) => entry.id === rosterPick.memberId)
    : undefined;

  return {
    golfer,
    rosterPick,
    member,
    matchedBy: rosterPick ? "winnerName" : "none",
  };
}

export function buildPayoutDecision(
  major: Major,
  leagueTerm: LeagueTerm,
  golfers: Golfer[],
  rosters: RosterPick[],
  members: Member[],
): PayoutDecision {
  const winnerMatch = findWinnerMatch(
    major,
    golfers,
    rosters,
    members,
    leagueTerm.id,
  );

  const isDraftedWinner = Boolean(winnerMatch.member && winnerMatch.rosterPick);

  const payoutEvent: PayoutEvent = {
    id: `payout_${major.id}`,
    majorId: major.id,
    winnerGolferId: winnerMatch.golfer?.id ?? major.winnerGolferId,
    winningMemberId: winnerMatch.member?.id,
    isDraftedWinner,
    amountPerLosingMember: isDraftedWinner
      ? leagueTerm.payoutAmountPerMember
      : 0,
    totalPayout: isDraftedWinner
      ? leagueTerm.payoutAmountPerMember * Math.max(members.length - 1, 0)
      : 0,
  };

  const obligations: PaymentObligation[] = isDraftedWinner
    ? members
        .filter((member) => member.id !== winnerMatch.member?.id)
        .map((member) => ({
          id: `obligation_${major.id}_${member.id}`,
          payoutEventId: payoutEvent.id,
          fromMemberId: member.id,
          toMemberId: winnerMatch.member!.id,
          amount: leagueTerm.payoutAmountPerMember,
          status: major.status === "payout_complete" ? "paid" : "unpaid",
        }))
    : [];

  return {
    payoutEvent,
    obligations,
    winnerMatch,
  };
}

export function isRosterPickActiveInYear(
  rosterPick: RosterPick,
  year: number,
): boolean {
  const startsBy = rosterPick.startYear ?? rosterPick.acquiredYear;
  const endsAfter = rosterPick.endYear ?? Number.POSITIVE_INFINITY;

  return year >= startsBy && year <= endsAfter;
}

export function getActiveRostersForYear(
  rosters: RosterPick[],
  year: number,
): RosterPick[] {
  return rosters.filter((rosterPick) => isRosterPickActiveInYear(rosterPick, year));
}

export function getMemberRosterForYear(
  memberId: string,
  rosters: RosterPick[],
  golfers: Golfer[],
  year: number,
): Golfer[] {
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));

  return getActiveRostersForYear(rosters, year)
    .filter((rosterPick) => rosterPick.memberId === memberId)
    .map((rosterPick) => golfersById.get(rosterPick.golferId))
    .filter((golfer): golfer is Golfer => Boolean(golfer))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getSeasonMajors(majors: Major[], year: number): Major[] {
  return majors.filter((major) => major.year === year);
}

export function getDraftBoardForSeason(
  draftBoard: DraftBoardPick[],
  year: number,
): DraftBoardPick[] {
  return draftBoard
    .filter((pick) => pick.seasonYear === year)
    .sort((left, right) => left.pickNumber - right.pickNumber);
}

export function getDropDecisionsForSeason(
  annualDropDecisions: AnnualDropDecision[],
  year: number,
): AnnualDropDecision[] {
  return annualDropDecisions
    .filter((decision) => decision.seasonYear === year)
    .sort((left, right) => left.memberId.localeCompare(right.memberId));
}

export function getResolvedMajors(majors: Major[]): Major[] {
  return majors.filter(
    (major) => major.status !== "upcoming" && major.status !== "in_progress",
  );
}

export function getStandings(
  majors: Major[],
  leagueTerm: LeagueTerm,
  golfers: Golfer[],
  rosters: RosterPick[],
  members: Member[],
): StandingsRow[] {
  const payoutDecisions = majors.map((major) =>
    buildPayoutDecision(major, leagueTerm, golfers, rosters, members),
  );

  const rows = members.map((member) => {
    const winningEvents = payoutDecisions.filter(
      ({ payoutEvent }) => payoutEvent.winningMemberId === member.id,
    );
    const outgoingObligations = payoutDecisions
      .flatMap(({ obligations }) => obligations)
      .filter((obligation) => obligation.fromMemberId === member.id);

    const totalWon = winningEvents.reduce(
      (sum, { payoutEvent }) => sum + payoutEvent.totalPayout,
      0,
    );
    const totalOwed = outgoingObligations.reduce(
      (sum, obligation) => sum + obligation.amount,
      0,
    );

    return {
      member,
      rank: 0,
      totalWon,
      totalOwed,
      net: totalWon - totalOwed,
      draftedWins: winningEvents.length,
      payoutEvents: winningEvents.length,
      paidObligations: outgoingObligations.filter(
        (obligation) => obligation.status === "paid",
      ).length,
      unpaidObligations: outgoingObligations.filter(
        (obligation) => obligation.status === "unpaid",
      ).length,
      lastWinningMajorId: winningEvents.at(-1)?.payoutEvent.majorId,
    } satisfies StandingsRow;
  });

  const sortedRows = rows.sort((left, right) => {
    if (right.totalWon !== left.totalWon) {
      return right.totalWon - left.totalWon;
    }
    if (right.draftedWins !== left.draftedWins) {
      return right.draftedWins - left.draftedWins;
    }
    return left.member.displayName.localeCompare(right.member.displayName);
  });

  return sortedRows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}
