# Sample Data Starter

Use this as a guide for initial `/data` JSON files.

## members.json

```json
[
  { "id": "m1", "displayName": "Josh", "teamName": "Team Josh" },
  { "id": "m2", "displayName": "Member 2", "teamName": "Team 2" },
  { "id": "m3", "displayName": "Member 3", "teamName": "Team 3" },
  { "id": "m4", "displayName": "Member 4", "teamName": "Team 4" },
  { "id": "m5", "displayName": "Member 5", "teamName": "Team 5" },
  { "id": "m6", "displayName": "Member 6", "teamName": "Team 6" }
]
```

## golfers.json

```json
[
  { "id": "g_scottie_scheffler", "name": "Scottie Scheffler", "normalizedName": "scottie scheffler" },
  { "id": "g_rory_mcilroy", "name": "Rory McIlroy", "normalizedName": "rory mcilroy" },
  { "id": "g_jj_spaun", "name": "J.J. Spaun", "normalizedName": "jj spaun" }
]
```

## rosters.json

```json
[
  { "id": "p1", "memberId": "m1", "golferId": "g_scottie_scheffler", "draftYear": 2025, "leagueTermId": "term_2025_2028" },
  { "id": "p2", "memberId": "m2", "golferId": "g_rory_mcilroy", "draftYear": 2025, "leagueTermId": "term_2025_2028" }
]
```

## majors.json

```json
[
  {
    "id": "major_2025_masters",
    "year": 2025,
    "name": "Masters",
    "startDate": "2025-04-10",
    "endDate": "2025-04-13",
    "venue": "Augusta National Golf Club",
    "location": "Augusta, Georgia",
    "status": "completed",
    "winnerName": "Rory McIlroy",
    "winnerGolferId": "g_rory_mcilroy"
  },
  {
    "id": "major_2025_pga",
    "year": 2025,
    "name": "PGA Championship",
    "startDate": "2025-05-15",
    "endDate": "2025-05-18",
    "venue": "Quail Hollow Club",
    "location": "Charlotte, North Carolina",
    "status": "completed",
    "winnerName": "Scottie Scheffler",
    "winnerGolferId": "g_scottie_scheffler"
  },
  {
    "id": "major_2025_us_open",
    "year": 2025,
    "name": "U.S. Open",
    "startDate": "2025-06-12",
    "endDate": "2025-06-15",
    "venue": "Oakmont Country Club",
    "location": "Oakmont, Pennsylvania",
    "status": "completed",
    "winnerName": "J.J. Spaun"
  },
  {
    "id": "major_2025_open",
    "year": 2025,
    "name": "The Open Championship",
    "startDate": "2025-07-17",
    "endDate": "2025-07-20",
    "venue": "Royal Portrush",
    "location": "Portrush, Northern Ireland",
    "status": "completed",
    "winnerName": "Scottie Scheffler",
    "winnerGolferId": "g_scottie_scheffler"
  }
]
```
