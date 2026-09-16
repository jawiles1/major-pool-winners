"use client";

import { useEffect, useState } from "react";

import {
  createEmptyHandicapOverrideState,
  type HandicapOverrideState,
} from "@/lib/dancing-rabbit";

export const handicapOverrideStorageKey = "dancing-rabbit-2026-handicap-overrides";
const handicapOverrideEventName = "dancing-rabbit-handicap-overrides-updated";

export function loadHandicapOverrides(): HandicapOverrideState {
  if (typeof window === "undefined") {
    return createEmptyHandicapOverrideState();
  }

  const stored = window.localStorage.getItem(handicapOverrideStorageKey);

  if (!stored) {
    return createEmptyHandicapOverrideState();
  }

  try {
    return { ...createEmptyHandicapOverrideState(), ...JSON.parse(stored) };
  } catch {
    return createEmptyHandicapOverrideState();
  }
}

export function saveHandicapOverrides(overrides: HandicapOverrideState) {
  window.localStorage.setItem(handicapOverrideStorageKey, JSON.stringify(overrides));
  window.dispatchEvent(new Event(handicapOverrideEventName));
}

export function useHandicapOverrides(): [
  HandicapOverrideState,
  (overrides: HandicapOverrideState) => void,
] {
  const [overrides, setOverrides] = useState<HandicapOverrideState>(() =>
    loadHandicapOverrides(),
  );

  useEffect(() => {
    function refresh() {
      setOverrides(loadHandicapOverrides());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === handicapOverrideStorageKey) {
        refresh();
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(handicapOverrideEventName, refresh);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(handicapOverrideEventName, refresh);
    };
  }, []);

  function updateOverrides(nextOverrides: HandicapOverrideState) {
    saveHandicapOverrides(nextOverrides);
    setOverrides(nextOverrides);
  }

  return [overrides, updateOverrides];
}
