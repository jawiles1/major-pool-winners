"use client";

import { useMemo, useState } from "react";

import {
  createEmptyHandicapOverrideState,
  dancingRabbitTrip,
  getCourse,
  getPlayerDayHandicap,
  type DayId,
  type HandicapOverrideState,
} from "@/lib/dancing-rabbit";
import { useHandicapOverrides } from "@/lib/dancing-rabbit-handicap-overrides";

const adminPassword = "rabbit2026";

export function DancingRabbitHandicapAdmin() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [activeDayId, setActiveDayId] = useState<DayId>("friday");
  const [overrides, setOverrides] = useHandicapOverrides();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const activeDay =
    dancingRabbitTrip.days.find((day) => day.id === activeDayId) ??
    dancingRabbitTrip.days[0];
  const activeCourse = getCourse(activeDay.courseId);
  const effectiveDays = useMemo(
    () =>
      dancingRabbitTrip.days.slice(
        dancingRabbitTrip.days.findIndex((day) => day.id === activeDay.id),
      ),
    [activeDay.id],
  );

  function unlock() {
    if (password === adminPassword) {
      setIsUnlocked(true);
      setMessage("");
      return;
    }

    setMessage("That password did not match.");
  }

  function save() {
    const nextOverrides: HandicapOverrideState = {
      ...createEmptyHandicapOverrideState(),
      ...overrides,
    };

    for (const day of effectiveDays) {
      nextOverrides[day.id] = { ...nextOverrides[day.id] };

      for (const player of dancingRabbitTrip.players) {
        const draft = drafts[player.id]?.trim();

        if (!draft) {
          continue;
        }

        const value = Number(draft);

        if (!Number.isFinite(value) || value < 0 || value > 36) {
          setMessage("Use whole-number course handicaps from 0 to 36.");
          return;
        }

        nextOverrides[day.id]![player.id] = Math.round(value);
      }
    }

    setOverrides(nextOverrides);
    setDrafts({});
    setMessage(`Saved overrides for ${activeDay.label} and remaining days.`);
  }

  function clearFromDayForward() {
    const nextOverrides: HandicapOverrideState = {
      ...createEmptyHandicapOverrideState(),
      ...overrides,
    };

    for (const day of effectiveDays) {
      nextOverrides[day.id] = {};
    }

    setOverrides(nextOverrides);
    setDrafts({});
    setMessage(`Cleared overrides for ${activeDay.label} and remaining days.`);
  }

  if (!isUnlocked) {
    return (
      <section className="mx-auto w-full max-w-xl rounded-[1.5rem] border border-line bg-card/95 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Admin Access
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Handicap adjustments</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter the trip admin password to make day-specific handicap changes.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                unlock();
              }
            }}
            className="h-12 rounded-[0.8rem] border border-line bg-white px-3 text-base outline-none focus:border-accent"
            aria-label="Admin password"
          />
          <button
            type="button"
            onClick={unlock}
            className="h-12 rounded-full bg-accent px-5 text-sm font-semibold !text-white"
          >
            Unlock
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-red-700">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <article className="rounded-[1.5rem] border border-line bg-card/95 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Effective Starting Day
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {activeDay.label} - {activeCourse.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Changes apply to {effectiveDays.map((day) => day.label).join(", ")}.
              Earlier scorecards and scores stay on their original handicaps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dancingRabbitTrip.days.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  setActiveDayId(day.id);
                  setDrafts({});
                }}
                className={
                  day.id === activeDay.id
                    ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
                    : "rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
                }
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </article>

      <article className="overflow-hidden rounded-[1.5rem] border border-line bg-card/95">
        <div className="grid grid-cols-[1.2fr_0.65fr_0.65fr_0.8fr] bg-accent-strong px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] !text-white">
          <div>Player</div>
          <div>Base</div>
          <div>Current</div>
          <div>New</div>
        </div>
        {dancingRabbitTrip.players.map((player, index) => {
          const base = player.handicaps[activeDay.courseId];
          const current = getPlayerDayHandicap(activeDay, player, overrides);

          return (
            <label
              key={player.id}
              className={`grid grid-cols-[1.2fr_0.65fr_0.65fr_0.8fr] items-center gap-2 px-4 py-3 text-sm ${
                index % 2 === 0 ? "bg-background/70" : "bg-card"
              }`}
            >
              <div>
                <p className="font-semibold">{player.name}</p>
                <p className="text-xs text-muted">{activeCourse.tee} tees</p>
              </div>
              <div>{base}</div>
              <div className={current !== base ? "font-semibold text-accent" : ""}>
                {current}
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={36}
                value={drafts[player.id] ?? ""}
                onChange={(event) =>
                  setDrafts((currentDrafts) => ({
                    ...currentDrafts,
                    [player.id]: event.target.value,
                  }))
                }
                placeholder={`${current}`}
                className="h-11 w-full rounded-[0.65rem] border border-line bg-white px-2 text-center text-lg font-semibold outline-none focus:border-accent"
                aria-label={`${player.name} new handicap`}
              />
            </label>
          );
        })}
      </article>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card/95 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Save from {activeDay.label} forward</p>
          <p className="text-sm text-muted">
            Leave a player blank to keep their current value.
          </p>
          {message ? <p className="mt-2 text-sm font-semibold text-accent">{message}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearFromDayForward}
            className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold"
          >
            Clear from day
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
          >
            Save handicaps
          </button>
        </div>
      </div>
    </section>
  );
}
