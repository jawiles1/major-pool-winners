# Golf Major Draft League Website - Codex Project Brief

## Goal
Build a simple website for a six-member golf league where each member drafted six golfers for a four-year period. League payouts occur only when a drafted golfer wins one of the four men's major championships.

The site should replace or augment the current Google Sheet with a clean, mobile-friendly experience showing:

- League members and rosters
- Major championship schedule for the current year
- Results and payout history
- Standings based on team earnings from major wins
- Optional communications during major weeks by email, SMS, or both

## League Rules Summary

- League has 6 members.
- Each member drafted 6 golfers.
- Draft term lasts 4 years.
- Only the 4 men's majors count:
  - Masters Tournament
  - PGA Championship
  - U.S. Open
  - The Open Championship
- When a drafted golfer wins a major, the team owner receives a payout from the other 5 members.
- If the winner was not drafted, no payout is made.
- Standings are determined by total team earnings from major payouts.

## Example: 2025 Season

- Rory McIlroy won the 2025 Masters and was drafted, so his team owner received a payout from the other five members.
- Scottie Scheffler won the 2025 PGA Championship and 2025 Open Championship and was drafted, so his team owner received two payouts.
- J.J. Spaun won the 2025 U.S. Open but was not drafted, so no payout occurred for that major.

## Desired MVP

1. Public or password-protected league homepage
2. Member/team roster page
3. Current-year majors page
4. Standings page
5. Major results and payout history page
6. Admin/update path that can sync from Google Sheets or use manual JSON/CSV imports

## Recommended Stack

For a simple Codex-built MVP:

- Next.js or Vite + React
- TypeScript
- Tailwind CSS
- Static data files first, then Google Sheets integration
- Deployment on Vercel, Netlify, or Cloudflare Pages

Start with static JSON/CSV data because it will be faster to validate the design. Add Google Sheets sync after the data model is stable.

## Vercel Deployment

The Next.js app lives in the `web/` directory. In Vercel, set the project
**Root Directory** to `web` so Vercel installs dependencies from
`web/package.json` and runs the Next build there.

Recommended Vercel settings:

- Framework Preset: Next.js
- Root Directory: `web`
- Install Command: default, or `npm ci`
- Build Command: default, or `npm run build`
- Output Directory: default

## Operator Notes

Use Codex for normal season maintenance. The app is currently driven by local
JSON/TypeScript data in `web/data` and `web/src/lib`, then deployed from the
GitHub `main` branch to Vercel.

Good update prompts:

- `Run updates for 2027 Masters`
- `Run updates for 2027 PGA Championship`
- `Run updates for 2027 U.S. Open`
- `Run updates for 2027 Open Championship`
- `Close out 2027 Masters`
- `Close out 2027 PGA Championship`
- `Close out 2027 U.S. Open`
- `Close out 2027 Open Championship`
- `Calculate the 2027 replacement draft order`

For a major-week update, Codex should verify the current field, scoring source,
venue details, and links, then update the relevant season/major pages. For a
closeout, Codex should verify the final result, update `web/data/majors.json`,
mark any payout obligations paid when the winner is rostered, update affected
season/ledger/standings copy, and run `npm run lint` plus `npm run build` in
`web/`.

Replacement draft order is based on lowest current-year team prize-money
earnings first. If current-year earnings are tied, use total league-term
winnings through that season as the tie-breaker. Keep the season page summary
compact and link to a detail page where participants can audit the player-level
earnings.

## Key Product Principle

The website should be simple enough for league members to check during a major on their phone in under 10 seconds.
