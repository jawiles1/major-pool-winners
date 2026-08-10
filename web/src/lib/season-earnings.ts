import type { Golfer, Member } from "@/lib/types";

type PlayerMajorEarnings = {
  memberId: string;
  golferId: string;
  masters: number;
  pgaChampionship: number;
  usOpen: number;
  openChampionship: number;
};

export type SeasonEarningsPlayerRow = PlayerMajorEarnings & {
  golferName: string;
  total: number;
};

export type SeasonEarningsDraftRow = {
  draftOrder: number;
  member: Member;
  players: SeasonEarningsPlayerRow[];
  seasonTotal: number;
  totalToDate: number;
};

export const seasonEarningsSources = {
  masters2026: "2026 Majors CSV export",
  finalLeaderboards2026:
    "ESPN final leaderboard officialAmount fields for the 2026 PGA Championship, U.S. Open, and The Open",
  draftOrderRule:
    "Lowest current-year team earnings pick first. Ties use total league-term winnings through the current season.",
} as const;

const teamEarningsThrough2025ByMemberId = new Map<string, number>([
  ["m1", 9844826.11],
  ["m2", 7470221.99],
  ["m3", 5705637.22],
  ["m4", 3907195.83],
  ["m5", 7428252.58],
  ["m6", 3805281.36],
]);

const playerEarnings2026: PlayerMajorEarnings[] = [
  {
    memberId: "m1",
    golferId: "g_scottie_scheffler",
    masters: 2430000,
    pgaChampionship: 364763,
    usOpen: 920882,
    openChampionship: 827500,
  },
  {
    memberId: "m1",
    golferId: "g_joaquin_niemann",
    masters: 0,
    pgaChampionship: 229129,
    usOpen: 617090,
    openChampionship: 0,
  },
  {
    memberId: "m1",
    golferId: "g_akshay_bhatia",
    masters: 25000,
    pgaChampionship: 0,
    usOpen: 280966,
    openChampionship: 0,
  },
  {
    memberId: "m1",
    golferId: "g_jason_day",
    masters: 427500,
    pgaChampionship: 26900,
    usOpen: 0,
    openChampionship: 0,
  },
  {
    memberId: "m1",
    golferId: "g_nick_dunlap",
    masters: 0,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 0,
  },
  {
    memberId: "m1",
    golferId: "g_cameron_young",
    masters: 1080000,
    pgaChampionship: 125523,
    usOpen: 72592,
    openChampionship: 1842000,
  },
  {
    memberId: "m2",
    golferId: "g_rory_mcilroy",
    masters: 4500000,
    pgaChampionship: 637050,
    usOpen: 128756,
    openChampionship: 69750,
  },
  {
    memberId: "m2",
    golferId: "g_russell_henley",
    masters: 1080000,
    pgaChampionship: 0,
    usOpen: 44938,
    openChampionship: 336380,
  },
  {
    memberId: "m2",
    golferId: "g_tommy_fleetwood",
    masters: 121500,
    pgaChampionship: 0,
    usOpen: 405862,
    openChampionship: 827500,
  },
  {
    memberId: "m2",
    golferId: "g_sepp_straka",
    masters: 83250,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 41350,
  },
  {
    memberId: "m2",
    golferId: "g_keegan_bradley",
    masters: 252000,
    pgaChampionship: 0,
    usOpen: 128756,
    openChampionship: 40075,
  },
  {
    memberId: "m2",
    golferId: "g_aaron_rai",
    masters: 61650,
    pgaChampionship: 3690000,
    usOpen: 405862,
    openChampionship: 0,
  },
  {
    memberId: "m3",
    golferId: "g_xander_schauffele",
    masters: 630000,
    pgaChampionship: 637050,
    usOpen: 405862,
    openChampionship: 164575,
  },
  {
    memberId: "m3",
    golferId: "g_viktor_hovland",
    masters: 315000,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 0,
  },
  {
    memberId: "m3",
    golferId: "g_hideki_matsuyama",
    masters: 427500,
    pgaChampionship: 125523,
    usOpen: 44938,
    openChampionship: 234325,
  },
  {
    memberId: "m3",
    golferId: "g_wyndham_clark",
    masters: 252000,
    pgaChampionship: 0,
    usOpen: 4500000,
    openChampionship: 0,
  },
  {
    memberId: "m3",
    golferId: "g_corey_conners",
    masters: 57600,
    pgaChampionship: 34186,
    usOpen: 181101,
    openChampionship: 336380,
  },
  {
    memberId: "m3",
    golferId: "g_jj_spaun",
    masters: 0,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 69750,
  },
  {
    memberId: "m4",
    golferId: "g_ludvig_aberg",
    masters: 252000,
    pgaChampionship: 843867,
    usOpen: 280966,
    openChampionship: 336380,
  },
  {
    memberId: "m4",
    golferId: "g_patrick_cantlay",
    masters: 427500,
    pgaChampionship: 78806,
    usOpen: 0,
    openChampionship: 102817,
  },
  {
    memberId: "m4",
    golferId: "g_sahith_theegala",
    masters: 0,
    pgaChampionship: 29218,
    usOpen: 405862,
    openChampionship: 45183,
  },
  {
    memberId: "m4",
    golferId: "g_maverick_mcnealy",
    masters: 315000,
    pgaChampionship: 229129,
    usOpen: 128756,
    openChampionship: 0,
  },
  {
    memberId: "m4",
    golferId: "g_matt_fitzpatrick",
    masters: 315000,
    pgaChampionship: 364763,
    usOpen: 230220,
    openChampionship: 0,
  },
  {
    memberId: "m4",
    golferId: "g_patrick_reed",
    masters: 427500,
    pgaChampionship: 496708,
    usOpen: 0,
    openChampionship: 51707,
  },
  {
    memberId: "m5",
    golferId: "g_bryson_dechambeau",
    masters: 25000,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 234325,
  },
  {
    memberId: "m5",
    golferId: "g_justin_thomas",
    masters: 83250,
    pgaChampionship: 843867,
    usOpen: 280966,
    openChampionship: 41988,
  },
  {
    memberId: "m5",
    golferId: "g_robert_macintyre",
    masters: 25000,
    pgaChampionship: 0,
    usOpen: 101859,
    openChampionship: 102817,
  },
  {
    memberId: "m5",
    golferId: "g_thomas_detry",
    masters: 0,
    pgaChampionship: 0,
    usOpen: 0,
    openChampionship: 69750,
  },
  {
    memberId: "m5",
    golferId: "g_tyrrell_hatton",
    masters: 1080000,
    pgaChampionship: 0,
    usOpen: 617090,
    openChampionship: 40800,
  },
  {
    memberId: "m5",
    golferId: "g_ben_griffin",
    masters: 0,
    pgaChampionship: 364763,
    usOpen: 280966,
    openChampionship: 43025,
  },
  {
    memberId: "m6",
    golferId: "g_jon_rahm",
    masters: 101250,
    pgaChampionship: 1804000,
    usOpen: 0,
    openChampionship: 51707,
  },
  {
    memberId: "m6",
    golferId: "g_collin_morikawa",
    masters: 725625,
    pgaChampionship: 34186,
    usOpen: 280966,
    openChampionship: 164575,
  },
  {
    memberId: "m6",
    golferId: "g_sungjae_im",
    masters: 69750,
    pgaChampionship: 0,
    usOpen: 72592,
    openChampionship: 234325,
  },
  {
    memberId: "m6",
    golferId: "g_brooks_koepka",
    masters: 427500,
    pgaChampionship: 34186,
    usOpen: 0,
    openChampionship: 102817,
  },
  {
    memberId: "m6",
    golferId: "g_cameron_smith",
    masters: 25000,
    pgaChampionship: 637050,
    usOpen: 0,
    openChampionship: 0,
  },
  {
    memberId: "m6",
    golferId: "g_chris_gotterup",
    masters: 178071,
    pgaChampionship: 496708,
    usOpen: 72592,
    openChampionship: 164575,
  },
];

export function getSeason2026EarningsDraftRows(
  members: Member[],
  golfers: Golfer[],
): SeasonEarningsDraftRow[] {
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const memberRows = members.map((member) => {
    const players = playerEarnings2026
      .filter((row) => row.memberId === member.id)
      .map((row) => ({
        ...row,
        golferName: golfersById.get(row.golferId)?.name ?? row.golferId,
        total:
          row.masters +
          row.pgaChampionship +
          row.usOpen +
          row.openChampionship,
      }))
      .sort((left, right) => left.golferName.localeCompare(right.golferName));
    const seasonTotal = players.reduce((sum, player) => sum + player.total, 0);
    const totalToDate =
      (teamEarningsThrough2025ByMemberId.get(member.id) ?? 0) + seasonTotal;

    return {
      draftOrder: 0,
      member,
      players,
      seasonTotal,
      totalToDate,
    };
  });

  return memberRows
    .sort((left, right) => {
      if (left.seasonTotal !== right.seasonTotal) {
        return left.seasonTotal - right.seasonTotal;
      }

      if (left.totalToDate !== right.totalToDate) {
        return left.totalToDate - right.totalToDate;
      }

      return left.member.displayName.localeCompare(right.member.displayName);
    })
    .map((row, index) => ({
      ...row,
      draftOrder: index + 1,
    }));
}
