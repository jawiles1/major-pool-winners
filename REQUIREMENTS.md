# Requirements

## Functional Requirements

### League Setup

- Store league name.
- Store league start year and end year.
- Store six league members.
- Store each member's drafted golfers.
- Support exactly six golfers per member for the current league term.
- Allow the league term to be changed later without rewriting the app.

### Team Rosters

- Show each member's team name, owner name, and drafted golfers.
- Show whether each golfer is active, injured, retired, LIV/PGA/other, or unknown if that data is manually supplied.
- Show each golfer's major wins during the league term.

### Majors Schedule

- Show the four majors for a selected year.
- Include tournament name, dates, venue, location, defending champion, and status.
- Supported statuses:
  - Upcoming
  - In Progress
  - Completed
  - Winner Undrafted
  - Winner Drafted / Payout Due
  - Payout Complete

### Results

- Record each major result.
- Store winner name.
- Match winner to drafted golfer if applicable.
- Calculate payout recipient if winner was drafted.
- Mark no payout if winner was undrafted.

### Standings

- Rank teams by total earnings.
- Support year-specific standings.
- Support all-time/current-term standings.
- Show number of major wins by drafted golfers.
- Show number of payout events.
- Show unpaid/settlement status if desired.

### Payouts

- Store payout amount per major win.
- Default rule: winner's owner receives payout from the other five members.
- Store payment obligations as individual records.
- Support paid/unpaid tracking per member obligation.

Example payout record:

- Major: 2025 PGA Championship
- Winner: Scottie Scheffler
- Winning owner: Josh
- Owes: the other five members
- Amount per member: configurable
- Status: pending or paid

### Admin

MVP admin can be lightweight. Accept any of these:

- Edit source JSON files
- Import CSV exported from Google Sheets
- Pull directly from Google Sheets API
- Use a protected admin page later

## Non-Functional Requirements

- Mobile-first design.
- Fast page load.
- Simple data model.
- Easy to update during major weeks.
- Avoid over-engineering authentication for MVP.
- Clear empty states when a major winner was undrafted.

## Out of Scope for MVP

- Real-money payment processing.
- User accounts for each member.
- Complex fantasy golf scoring.
- Live shot-by-shot leaderboard integration.
- Automated official results scraping unless added later.
