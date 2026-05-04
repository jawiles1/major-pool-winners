# Google Sheets Integration Guide

## Recommendation

Start Codex with static JSON or CSV data exported from the current Google Sheet. Once the website structure is correct, add live Google Sheets integration.

This avoids spending too much early effort on authentication and lets the league validate pages, calculations, and workflows first.

## Best MVP Path

1. Export the current Google Sheet tabs as CSV.
2. Add the CSV files to the project under `/data`.
3. Codex builds parsers that convert CSV rows into the data model.
4. Once the app works, replace CSV import with Google Sheets API or a published CSV URL.

## Option A: Public Published CSV URL

Use this if the sheet does not contain sensitive information.

Steps:

1. In Google Sheets, choose `File > Share > Publish to web`.
2. Publish the relevant tab as CSV.
3. Copy the generated CSV URL.
4. Store it in `.env.local` as something like:

```txt
GOOGLE_SHEET_ROSTERS_CSV_URL=https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv
```

Pros:

- Very simple.
- No Google API auth needed.
- Good for read-only public data.

Cons:

- Anyone with the published URL can access it.
- Updates may be cached.

## Option B: Google Sheets API with Service Account

Use this if the sheet should remain private.

Steps:

1. Create a Google Cloud project.
2. Enable Google Sheets API.
3. Create a service account.
4. Download service account credentials.
5. Share the Google Sheet with the service account email.
6. Store credentials securely in environment variables.

Suggested env vars:

```txt
GOOGLE_SHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

Pros:

- Keeps the sheet private.
- More flexible.

Cons:

- More setup.
- Requires secure environment variable handling.

## Option C: Manual JSON Data

Use this for the first Codex pass.

Create files:

```txt
/data/members.json
/data/golfers.json
/data/rosters.json
/data/majors.json
/data/payouts.json
```

Pros:

- Fastest way to build and test.
- No auth or external dependencies.

Cons:

- Updates require editing files.

## What to Do Before Opening Codex

You can link the spreadsheet later. For the first Codex session, prepare one of these:

1. Export the Google Sheet as CSV and upload/add it to the repo.
2. Copy sample rows into `/data/sample-*.csv`.
3. Provide the published CSV URL if you are comfortable making that tab public.

Recommended: use CSV exports first, then wire the live Google Sheet after the app works.

## Suggested Sheet Tabs

- Members
- Rosters
- Majors
- Results
- PaymentStatus

## Suggested Columns

### Members

```txt
member_id,display_name,team_name,email,phone
```

### Rosters

```txt
member_id,golfer_name,draft_year,league_term
```

### Majors

```txt
year,major_name,start_date,end_date,venue,location,status,winner_name
```

### Results

```txt
year,major_name,winner_name,drafted_owner,payout_amount_per_member,total_payout,notes
```

### PaymentStatus

```txt
year,major_name,from_member,to_member,amount,status,paid_at
```
