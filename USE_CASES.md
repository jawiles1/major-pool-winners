# Use Cases

## UC-01: View League Standings

As a league member, I want to see the current standings so I know who is leading based on major payouts.

Acceptance criteria:

- Standings show all six members.
- Standings are sorted by total earnings descending.
- Ties are displayed clearly.
- The page can filter by year or show full league term.

## UC-02: View Team Rosters

As a league member, I want to see every member's drafted golfers so I can track who has a chance during each major.

Acceptance criteria:

- Each member has exactly six golfers listed.
- Golfer names are consistent across rosters and results.
- If a golfer has won a counted major, show the count or badge.

## UC-03: View Upcoming Majors

As a league member, I want to see the upcoming majors for the year so I know when league events happen.

Acceptance criteria:

- Page shows Masters, PGA Championship, U.S. Open, and Open Championship.
- Each major shows dates, course, city/state/country, and status.
- Completed majors show winner and payout result.

## UC-04: Determine Payout After a Major

As the league manager, I want to enter a major winner and have the site determine whether a payout is due.

Acceptance criteria:

- If the winner is drafted, the site identifies the owner.
- If the winner is undrafted, the site says no payout.
- If the winner is drafted, the site creates five obligations from the other members to the owner.

## UC-05: Track Payment Status

As the league manager, I want to track who has paid after each major.

Acceptance criteria:

- Each obligation can be marked paid or unpaid.
- Standings use earned payout value, not necessarily collected value, unless configured otherwise.
- A settlement page shows who owes whom.

## UC-06: Send Major Week Updates

As the league manager, I want league members to receive updates during majors.

Acceptance criteria:

- Updates can be generated manually for MVP.
- Update includes current major, drafted golfers in contention, projected payout owner if leader wins, and standings impact.
- Delivery can be email, SMS, or copyable text.
