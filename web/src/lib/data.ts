import annualDropDecisionsData from "../../data/annual-drop-decisions.json";
import draftBoardData from "../../data/draft-board.json";
import golfersData from "../../data/golfers.json";
import leagueTermData from "../../data/league-term.json";
import majorsData from "../../data/majors.json";
import membersData from "../../data/members.json";
import replacementDraftPicksData from "../../data/replacement-draft-picks.json";
import rostersData from "../../data/rosters.json";

import type {
  AnnualDropDecision,
  DraftBoardPick,
  Golfer,
  LeagueData,
  LeagueTerm,
  Major,
  Member,
  ReplacementDraftPick,
  RosterPick,
} from "@/lib/types";

export const leagueTerm = leagueTermData as LeagueTerm;
export const members = membersData as Member[];
export const golfers = golfersData as Golfer[];
export const rosters = rostersData as RosterPick[];
export const majors = majorsData as Major[];
export const annualDropDecisions =
  annualDropDecisionsData as AnnualDropDecision[];
export const replacementDraftPicks =
  replacementDraftPicksData as ReplacementDraftPick[];
export const draftBoard = draftBoardData as DraftBoardPick[];

export function getLeagueData(): LeagueData {
  return {
    leagueTerm,
    members,
    golfers,
    rosters,
    majors,
    annualDropDecisions,
    replacementDraftPicks,
    draftBoard,
  };
}
