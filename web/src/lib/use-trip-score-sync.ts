"use client";

import { useEffect, useRef, useState } from "react";
import { createEmptyScoreState, type DayId, type RecordedPayment, type ScoreState } from "./dancing-rabbit";

const scoreKey = "dancing-rabbit-2026-scores";
const queueKey = "dancing-rabbit-2026-pending-scores-v1";
type Edit = { id: string; dayId: DayId; playerId?: string; holeNumber?: number; gross?: number };

export function applyScoreEdit(scores: ScoreState, edit: Edit): ScoreState {
  if (!edit.playerId) return { ...scores, [edit.dayId]: createEmptyScoreState()[edit.dayId] };
  return { ...scores, [edit.dayId]: { ...scores[edit.dayId], [edit.playerId]: {
    ...scores[edit.dayId]?.[edit.playerId], [edit.holeNumber!]: edit.gross!,
  } } };
}

export function useTripScoreSync() {
  const [scores, setScores] = useState<ScoreState>(createEmptyScoreState);
  const [payments, setPayments] = useState<RecordedPayment[]>([]);
  const [message, setMessage] = useState("Connecting to shared scores…");
  const [initialized, setInitialized] = useState(false);
  const queue = useRef<Edit[]>([]);
  const revision = useRef(0);
  const ready = useRef(false);
  const retry = useRef<() => void>(() => {});
  const storageFailed = useRef(false);
  const clearing = useRef(false);

  function persistQueue() {
    try { localStorage.setItem(queueKey, JSON.stringify(queue.current)); storageFailed.current = false; }
    catch { storageFailed.current = true; }
  }

  useEffect(() => {
    let stopped = false;
    let busy = false;
    let timer: ReturnType<typeof setTimeout>;
    try {
      const cached = localStorage.getItem(scoreKey);
      if (cached && !localStorage.getItem(`${scoreKey}-recovery-backup`)) {
        localStorage.setItem(`${scoreKey}-recovery-backup`, cached);
      }
      const pending = localStorage.getItem(queueKey);
      // Never replay a destructive clear automatically after reconnecting.
      queue.current = pending ? (JSON.parse(pending) as Edit[]).filter(edit => edit.playerId) : [];
      const initial = cached ? { ...createEmptyScoreState(), ...JSON.parse(cached) } : createEmptyScoreState();
      setScores(queue.current.reduce(applyScoreEdit, initial));
    } catch { storageFailed.current = true; }
    ready.current = true;
    setInitialized(true);

    async function sync() {
      if (busy || stopped || clearing.current || document.hidden) return;
      busy = true;
      clearTimeout(timer);
      try {
        while (queue.current.length && !stopped) {
          const edit = queue.current[0];
          setMessage(`Saving ${queue.current.length} pending change(s)…`);
          const response = await fetch("/api/trips/dancing-rabbit-2026/scores", {
            method: edit.playerId ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(edit), signal: AbortSignal.timeout(15000),
          });
          if (!response.ok) throw new Error(`Save failed (${response.status})`);
          const result = await response.json();
          if (result.ok !== true) throw new Error("Save not acknowledged");
          if (stopped) return;
          queue.current = queue.current.filter((item) => item.id !== edit.id);
          persistQueue();
        }
        if (stopped) return;
        const startedAt = revision.current;
        const response = await fetch("/api/trips/dancing-rabbit-2026/state", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`Refresh failed (${response.status})`);
        const data = await response.json();
        if (!data.scores) throw new Error("Missing shared scores");
        if (!stopped && !clearing.current && startedAt === revision.current) {
          setScores(queue.current.reduce(applyScoreEdit, { ...createEmptyScoreState(), ...data.scores }));
          setPayments(data.payments ?? []);
          setMessage(queue.current.length ? "Changes waiting to save…" : "Shared scores up to date");
        }
      } catch {
        if (!stopped) setMessage(queue.current.length
          ? `${queue.current.length} change(s) NOT shared yet. ${storageFailed.current ? "Keep this page open; browser storage is unavailable." : "Retained on this device; retrying automatically."}`
          : "Cannot connect to shared scores. Displayed scores may be out of date. Retrying automatically.");
      } finally {
        busy = false;
        if (!stopped) timer = setTimeout(sync, queue.current.length ? 10000 : 30000);
      }
    }
    retry.current = () => { void sync(); };
    const resume = () => { if (!document.hidden) void sync(); };
    const warn = (event: BeforeUnloadEvent) => {
      if (queue.current.length) { event.preventDefault(); event.returnValue = ""; }
    };
    void sync();
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("beforeunload", warn);
    return () => { stopped = true; clearTimeout(timer); window.removeEventListener("online", resume); document.removeEventListener("visibilitychange", resume); window.removeEventListener("beforeunload", warn); };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(scoreKey, JSON.stringify(scores)); } catch { storageFailed.current = true; }
  }, [scores, initialized]);

  function enqueue(edit: Omit<Edit, "id">) {
    if (!ready.current || clearing.current) return;
    const operation = { ...edit, id: crypto.randomUUID() };
    queue.current.push(operation);
    revision.current += 1;
    persistQueue();
    setScores((current) => applyScoreEdit(current, operation));
    setMessage("Changes waiting to save…");
    retry.current();
  }

  return { scores, payments, setPayments, message, retry: () => retry.current(),
    updateScore: (dayId: DayId, playerId: string, holeNumber: number, value: string) => {
      const parsed = Number(value);
      enqueue({ dayId, playerId, holeNumber, gross: Number.isFinite(parsed) && parsed > 0 ? parsed : 0 });
    },
    clearDay: async (dayId: DayId, password?: string) => {
      if (clearing.current || queue.current.length) throw new Error("Wait for pending scores to finish saving before clearing.");
      clearing.current = true;
      revision.current += 1;
      try {
        const response = await fetch("/api/trips/dancing-rabbit-2026/scores", {
          method: "DELETE", headers: { "Content-Type": "application/json", ...(password ? { "x-admin-password": password } : {}) },
          body: JSON.stringify({ dayId }), signal: AbortSignal.timeout(15000),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Scores could not be cleared.");
        setScores(current => applyScoreEdit(current, { id: "clear", dayId }));
        setMessage("Selected day cleared successfully.");
      } finally { revision.current += 1; clearing.current = false; }
    },
  };
}
