"use client";

import { useState, useSyncExternalStore } from "react";
import { type DayId } from "./dancing-rabbit";

const subscribe = () => () => {};
const serverDay = (): DayId => "thursday";

export function currentTripDay(now = new Date()): DayId {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long", timeZone: "America/Chicago",
  }).format(now).toLowerCase();
  return ["thursday", "friday", "saturday", "sunday"].includes(weekday)
    ? weekday as DayId : "thursday";
}

export function useCurrentTripDay() {
  const today = useSyncExternalStore(subscribe, currentTripDay, serverDay);
  const [selectedDay, setSelectedDay] = useState<DayId | null>(null);
  return [selectedDay ?? today, setSelectedDay] as const;
}
