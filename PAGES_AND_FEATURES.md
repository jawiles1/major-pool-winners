# Pages and Feature Ideas

## MVP Pages

### Home

Purpose: quick snapshot.

Show:

- Current leader
- Next major
- Most recent major result
- Current year payout total
- Link to standings and rosters

### Standings

Show:

- Rank
- Member/team
- Total earnings
- Major wins by drafted golfers
- Last payout
- Year filter and full-term filter

### Teams

Show:

- Six member cards
- Six golfers per member
- Major wins during league term
- Fun badges such as "Major Machine", "Needs a Sunday Charge", or "Undrafted Pain"

### Majors

Show:

- Current year schedule
- Venue/date info
- Winner when completed
- Payout status

### Results / Ledger

Show:

- Every completed major in the league term
- Winner
- Drafted owner if applicable
- Payout amount
- Paid/unpaid status

### Admin / Data Check

Show:

- Imported rows
- Name matching warnings
- Missing winners
- Duplicate golfer names
- Invalid roster sizes

## Nice-to-Have Pages

### Live Major Dashboard

During a major, show:

- Drafted golfers in the field
- Drafted golfers near the lead
- Potential payout scenarios
- "If the tournament ended now" projected payout

This can be manual for MVP or automated later with a leaderboard data source.

### Rivalry Page

Show:

- Head-to-head payout wins by owner
- Who has paid whom most often
- Biggest swing major
- Most painful undrafted winner

### Draft Board / League History

Show:

- Original draft order if available
- Pick number by golfer
- Retrospective value by golfer
- Best and worst picks based on major payouts

### Settlement Page

Show:

- Who owes whom
- Paid/unpaid status
- Copyable payment reminder text

### Notifications Page

Allow the manager to generate updates:

- Pre-major preview
- Daily recap
- Final payout notice
- Payment reminder

## Communication Ideas

### Email Updates

Best for richer updates and archives.

Examples:

- Monday major preview
- Daily evening recap during majors
- Final payout summary

Tools to consider:

- Resend
- SendGrid
- Postmark

### SMS Updates

Best for short alerts.

Examples:

- "Scheffler wins. Josh collects $X from each member."
- "Three drafted golfers are T5 or better heading into Sunday."

Tools to consider:

- Twilio
- Simple copy/paste text generation for MVP

### Slack / GroupMe / iMessage Workaround

For MVP, generate a copyable message that the league manager can paste into an existing group chat.

## Suggested Copyable Update Formats

### Pre-Major Preview

```txt
Major week: {major_name}
Venue: {venue}, {location}
Dates: {start_date}-{end_date}
Drafted golfers to watch: {golfers}
Current leader: {member} with ${earnings}
```

### Final Result

```txt
{winner_name} won the {year} {major_name}.
League result: {drafted_owner_or_undrafted_message}
Payout: {payout_summary}
Updated standings: {top_3}
```
