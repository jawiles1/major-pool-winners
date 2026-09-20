/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test harness for transpiling the app without a test framework. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const ts = require("typescript");

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const localRequire = createRequire(filename);
  const compiledModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require: name => mocks[name] ?? localRequire(name), console, process });
  return compiledModule.exports;
}

const lib = load("src/lib/dancing-rabbit.ts");
const day = lib.getDay("sunday");
const holes = lib.getCourse(day.courseId).holes;
const [a, b] = day.pairings;
function fixture() {
  const scores = lib.createEmptyScoreState();
  for (const team of day.pairings) for (const hole of holes) scores.sunday[team.id][hole.number] = hole.par;
  return scores;
}
function calculate(scores) { return lib.calculateDay(day, scores); }
function balanced(result) {
  const balances = {};
  for (const line of result.moneyLines) {
    balances[line.from] = (balances[line.from] ?? 0) - line.amount;
    balances[line.to] = (balances[line.to] ?? 0) + line.amount;
  }
  for (const player of lib.dancingRabbitTrip.players) assert.equal(balances[player.id] ?? 0, result.playerNet[player.id] ?? 0);
  assert.equal(Object.values(result.playerNet).reduce((sum, value) => sum + value, 0), 0);
}

let scores = fixture();
let result = calculate(scores);
assert(result.complete && result.tied);
assert.equal(result.moneyLines.length, 0);
assert.equal(lib.calculateTrip(scores).overallRows.find(row => row.player.id === a.playerIds[0]).points, 0.5);

scores.sunday[a.id][1] -= 1;
result = calculate(scores);
assert.equal(result.playerNet[a.playerIds[0]], 50);
assert.equal(result.playerNet[b.playerIds[0]], -50);
assert.equal(result.winnerPlayerIds.length, 4);
assert.equal(lib.calculateTrip(scores).overallRows.find(row => row.player.id === a.playerIds[0]).points, 1);
assert.equal(lib.calculateTrip(scores).overallRows.find(row => row.player.id === b.playerIds[0]).points, 0);
balanced(result);

scores = fixture();
scores.sunday[a.id][1] += 1;
scores.sunday[a.id][2] += 3;
result = calculate(scores);
assert.equal(result.scrambleTeams[0].bogeyHoles.length, 2);
assert.equal(result.scrambleTeams[0].total, holes.reduce((sum, h) => sum + h.par, 0) + 4);
assert.equal(result.playerNet[a.playerIds[0]], -70);
assert.equal(result.playerNet[b.playerIds[0]], 70);
balanced(result);

// Both teams bogey the same hole: penalties cancel, gross tie earns half points.
scores = fixture();
scores.sunday[a.id][1] += 1;
scores.sunday[b.id][1] += 1;
result = calculate(scores);
assert(result.tied);
assert.equal(result.playerNet[a.playerIds[0]], 0);
balanced(result);

// Equal gross totals can still owe a bogey penalty.
scores = fixture();
scores.sunday[a.id][1] += 1;
scores.sunday[a.id][2] -= 1;
result = calculate(scores);
assert(result.tied);
assert.equal(result.playerNet[a.playerIds[0]], -10);
assert.equal(result.playerNet[b.playerIds[0]], 10);
balanced(result);

// A large uncapped score is retained but triggers only one penalty.
scores = fixture();
scores.sunday[a.id][1] = 15;
result = calculate(scores);
assert.equal(result.scrambleTeams[0].penaltyNet, -10);
assert.equal(result.scrambleTeams[0].total, holes.reduce((sum, h) => sum + h.par, 0) - holes[0].par + 15);
const overrides = { sunday: Object.fromEntries(lib.dancingRabbitTrip.players.map(p => [p.id, 54])) };
assert.equal(JSON.stringify(result), JSON.stringify(lib.calculateDay(day, scores, overrides)));

// No Sunday bounty, even with eagle team scores or legacy individual scores.
scores.sunday[a.id][1] = 1;
scores.sunday[a.playerIds[0]][1] = 1;
assert.equal(lib.calculateBounties(scores, overrides).bounties.filter(x => x.day.id === "sunday").length, 0);
delete scores.sunday[b.id][18];
result = calculate(scores);
assert(!result.complete);
assert.equal(result.moneyLines.length, 0);
assert.equal(result.winnerPlayerIds.length, 0);

// Legacy individual Sunday scores never substitute for missing team scores.
scores = lib.createEmptyScoreState();
for (const player of lib.dancingRabbitTrip.players) for (const hole of holes) scores.sunday[player.id][hole.number] = hole.par;
assert(!calculate(scores).complete);

// Mock the real persistence routes: no production database writes.
async function testPersistence() {
  const rows = [];
  const prisma = { dancingRabbitScore: {
    upsert: async ({ create }) => rows.push({ ...create, updatedAt: new Date() }),
    findMany: async () => rows,
  }, dancingRabbitHandicapOverride: { findMany: async () => [] }, dancingRabbitPayment: { findMany: async () => [] } };
  const mocks = { "@/lib/dancing-rabbit": lib, "@/lib/prisma": { prisma } };
  const api = load("src/app/api/trips/dancing-rabbit-2026/scores/route.ts", mocks);
  const state = load("src/app/api/trips/dancing-rabbit-2026/state/route.ts", mocks);
  const request = playerId => new Request("http://localhost/scores", { method: "POST", body: JSON.stringify({ dayId: "sunday", playerId, holeNumber: 1, gross: 5 }) });
  assert.equal((await api.POST(request(a.id))).status, 200);
  assert.equal((await api.POST(request(a.playerIds[0]))).status, 400);
  assert.equal(rows.length, 1);
  const saved = await (await state.GET()).json();
  assert.equal(saved.scores.sunday[a.id][1], 5);
}

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const mocks = { "@/lib/dancing-rabbit": lib };
const { DancingRabbitSundayResults } = load("src/components/dancing-rabbit-sunday-results.tsx", mocks);
const html = renderToStaticMarkup(React.createElement(DancingRabbitSundayResults, { result }));
assert(html.includes("Sunday Scramble Results") && html.includes("Pending"));
const { DancingRabbitDailyScorecards } = load("src/components/dancing-rabbit-daily-scorecards.tsx", mocks);
const cards = renderToStaticMarkup(React.createElement(DancingRabbitDailyScorecards, { day, scores: fixture() }));
assert.equal((cards.match(/<details/g) ?? []).length, 2);

testPersistence().then(() => console.log("PASS: scramble totals, caps/strokes ignored, win/tie points, bogey penalties, balanced payouts, bounties disabled, incomplete/legacy scores, team scorecards and API round-trip")).catch(error => { console.error(error); process.exitCode = 1; });
