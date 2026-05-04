export const majorNames = [
  "Masters",
  "PGA Championship",
  "U.S. Open",
  "The Open Championship",
] as const;

export const majorStatuses = [
  "upcoming",
  "in_progress",
  "completed",
  "winner_undrafted",
  "winner_drafted_payout_due",
  "payout_complete",
] as const;

export const paymentStatuses = ["unpaid", "paid"] as const;
export const dropDecisionActions = ["keep", "drop"] as const;
export const rosterAcquisitionTypes = [
  "initial_draft",
  "replacement_draft",
  "manual_adjustment",
] as const;
export const replacementPlayerSources = [
  "undrafted_pool",
  "dropped_by_other_manager",
  "redrafted_self",
] as const;

export type MajorName = (typeof majorNames)[number];
export type MajorStatus = (typeof majorStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type DropDecisionAction = (typeof dropDecisionActions)[number];
export type RosterAcquisitionType = (typeof rosterAcquisitionTypes)[number];
export type ReplacementPlayerSource =
  (typeof replacementPlayerSources)[number];

export type Member = {
  id: string;
  teamId?: string;
  displayName: string;
  email?: string;
  phone?: string;
  teamName?: string;
  initialDraftOrder?: number;
};

export type Golfer = {
  id: string;
  name: string;
  normalizedName: string;
};

export type RosterPick = {
  id: string;
  memberId: string;
  golferId: string;
  leagueTermId: string;
  acquiredYear: number;
  acquisitionType: RosterAcquisitionType;
  draftYear?: number;
  startYear?: number;
  endYear?: number;
  droppedAfterYear?: number;
  replacementDraftPickId?: string;
};

export type AnnualDropDecision = {
  id: string;
  leagueTermId: string;
  seasonYear: number;
  memberId: string;
  action: DropDecisionAction;
  droppedGolferId?: string;
  notes?: string;
};

export type ReplacementDraftPick = {
  id: string;
  leagueTermId: string;
  seasonYear: number;
  round: number;
  draftOrder: number;
  memberId: string;
  golferId: string;
  source: ReplacementPlayerSource;
  replacesGolferId?: string;
  previousMemberId?: string;
};

export type DraftBoardPick = {
  id: string;
  leagueTermId: string;
  seasonYear: number;
  pickNumber: number;
  draftOrder: number;
  memberId: string;
  teamName: string;
  golferId: string;
};

export type LeagueTerm = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  payoutAmountPerMember: number;
};

export type Major = {
  id: string;
  year: number;
  name: MajorName;
  startDate: string;
  endDate: string;
  venue?: string;
  location?: string;
  status: MajorStatus;
  winnerGolferId?: string;
  winnerName?: string;
};

export type PayoutEvent = {
  id: string;
  majorId: string;
  winnerGolferId?: string;
  winningMemberId?: string;
  isDraftedWinner: boolean;
  amountPerLosingMember: number;
  totalPayout: number;
};

export type PaymentObligation = {
  id: string;
  payoutEventId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
};

export type LeagueData = {
  leagueTerm: LeagueTerm;
  members: Member[];
  golfers: Golfer[];
  rosters: RosterPick[];
  majors: Major[];
  annualDropDecisions?: AnnualDropDecision[];
  replacementDraftPicks?: ReplacementDraftPick[];
  draftBoard?: DraftBoardPick[];
};

export type WinnerMatch = {
  golfer?: Golfer;
  rosterPick?: RosterPick;
  member?: Member;
  matchedBy: "winnerGolferId" | "winnerName" | "none";
};

export type PayoutDecision = {
  payoutEvent: PayoutEvent;
  obligations: PaymentObligation[];
  winnerMatch: WinnerMatch;
};

export type StandingsRow = {
  member: Member;
  rank: number;
  totalWon: number;
  totalOwed: number;
  net: number;
  draftedWins: number;
  payoutEvents: number;
  paidObligations: number;
  unpaidObligations: number;
  lastWinningMajorId?: string;
};
