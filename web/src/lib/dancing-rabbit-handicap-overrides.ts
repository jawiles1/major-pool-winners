"use client";

import { useEffect, useState } from "react";

import {
  createEmptyHandicapOverrideState,
  type HandicapOverrideState,
} from "@/lib/dancing-rabbit";

const handicapOverrideEventName = "dancing-rabbit-handicap-overrides-updated";
const stateEndpoint = "/api/trips/dancing-rabbit-2026/state";
const handicapsEndpoint = "/api/trips/dancing-rabbit-2026/handicaps";

export async function loadHandicapOverrides(): Promise<HandicapOverrideState> {
  const response = await fetch(stateEndpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load handicap overrides.");
  }

  const data = (await response.json()) as {
    handicapOverrides?: HandicapOverrideState;
  };

  return {
    ...createEmptyHandicapOverrideState(),
    ...data.handicapOverrides,
  };
}

export async function saveHandicapOverrides(overrides: HandicapOverrideState) {
  const response = await fetch(handicapsEndpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": "rabbit2026",
    },
    body: JSON.stringify({ overrides }),
  });

  if (!response.ok) {
    throw new Error("Unable to save handicap overrides.");
  }

  window.dispatchEvent(new Event(handicapOverrideEventName));
}

export function useHandicapOverrides(): [
  HandicapOverrideState,
  (overrides: HandicapOverrideState) => void,
] {
  const [overrides, setOverrides] = useState<HandicapOverrideState>(() =>
    createEmptyHandicapOverrideState(),
  );

  useEffect(() => {
    async function refresh() {
      if (document.hidden) return;
      try {
        setOverrides(await loadHandicapOverrides());
      } catch {
        // Retain the last known handicaps while the shared database is unavailable.
      }
    }

    refresh();
    const intervalId = window.setInterval(refresh, 60000);
    window.addEventListener(handicapOverrideEventName, refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(handicapOverrideEventName, refresh);
    };
  }, []);

  function updateOverrides(nextOverrides: HandicapOverrideState) {
    setOverrides(nextOverrides);
    saveHandicapOverrides(nextOverrides).catch(() => {
      setOverrides(overrides);
    });
  }

  return [overrides, updateOverrides];
}
