# Data Model

## Recommended Entities

### Member

```ts
type Member = {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  teamName?: string;
};
```

### Golfer

```ts
type Golfer = {
  id: string;
  name: string;
  normalizedName: string;
};
```

### RosterPick

```ts
type RosterPick = {
  id: string;
  memberId: string;
  golferId: string;
  draftYear: number;
  leagueTermId: string;
};
```

### LeagueTerm

```ts
type LeagueTerm = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  payoutAmountPerMember: number;
};
```

### Major

```ts
type Major = {
  id: string;
  year: number;
  name: 'Masters' | 'PGA Championship' | 'U.S. Open' | 'The Open Championship';
  startDate: string;
  endDate: string;
  venue?: string;
  location?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  winnerGolferId?: string;
  winnerName?: string;
};
```

### PayoutEvent

```ts
type PayoutEvent = {
  id: string;
  majorId: string;
  winnerGolferId?: string;
  winningMemberId?: string;
  isDraftedWinner: boolean;
  amountPerLosingMember: number;
  totalPayout: number;
};
```

### PaymentObligation

```ts
type PaymentObligation = {
  id: string;
  payoutEventId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  status: 'unpaid' | 'paid';
  paidAt?: string;
};
```

## Derived Calculations

### Team Earnings

For each member:

```txt
sum(PayoutEvent.totalPayout where winningMemberId = member.id)
```

### Total Payout for a Drafted Major Winner

```txt
amountPerLosingMember * 5
```

### No-Payout Major

If the major winner does not match any drafted golfer in the current league term:

```txt
isDraftedWinner = false
totalPayout = 0
no payment obligations created
```

## Name Matching Recommendation

Normalize golfer names before matching:

- Lowercase
- Remove punctuation
- Trim spaces
- Convert repeated spaces to one space
- Consider a manual alias table for names like "J.J. Spaun" vs "JJ Spaun"
