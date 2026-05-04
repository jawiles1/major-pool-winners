# Initial Codex Prompt

You are building a simple website for a six-member golf major draft league.

Read these project files first:

- README.md
- REQUIREMENTS.md
- USE_CASES.md
- DATA_MODEL.md
- GOOGLE_SHEETS_INTEGRATION.md
- PAGES_AND_FEATURES.md

## Build the MVP

Create a mobile-friendly web app with:

1. Home page
2. Standings page
3. Teams page
4. Majors page
5. Results/Ledger page
6. Simple data validation page or component

## Implementation Preferences

- Use TypeScript.
- Use React with either Next.js or Vite.
- Use Tailwind CSS for styling.
- Store initial data in local JSON files under `/data`.
- Keep all calculations in pure utility functions with tests if practical.
- Do not add real payment processing.
- Do not require login for the first version unless a simple password gate is easy.

## Core Calculation Logic

Implement functions for:

- Normalizing golfer names
- Matching major winner to drafted golfer
- Determining whether a payout is due
- Creating payment obligations
- Calculating team earnings
- Sorting standings
- Filtering standings by year and full league term

## Seed Data

Use placeholder data if actual league data is not provided yet. Include the known 2025 examples:

- Rory McIlroy won the 2025 Masters and was drafted.
- Scottie Scheffler won the 2025 PGA Championship and 2025 Open Championship and was drafted.
- J.J. Spaun won the 2025 U.S. Open and was undrafted.

Represent unknown member names as Member 1, Member 2, etc., until real data is supplied.

## UI Tone

Make the site simple, clean, and fun. This is a friends' league, not an enterprise dashboard.

Use small personality touches like:

- "No payout. The board whiffed."
- "Payout pending. Check your Venmo."
- "Sunday sweat alert."

## Deliverables

- Working app
- Clear file structure
- README with setup instructions
- Sample data files
- Calculation utilities
- Basic tests for payout and standings logic
