"use client";

import { useState } from "react";

export function PrintButton({ label = "Print" }: { label?: string }) {
  const [message, setMessage] = useState("");

  function handlePrint() {
    setMessage("");

    let printStarted = false;
    const markPrintStarted = () => {
      printStarted = true;
      setMessage("");
    };

    try {
      window.addEventListener("beforeprint", markPrintStarted, { once: true });
      window.focus();
      window.print();

      window.setTimeout(() => {
        window.removeEventListener("beforeprint", markPrintStarted);

        if (!printStarted) {
          setMessage("If the print dialog did not open, press Cmd+P.");
        }
      }, 500);
    } catch {
      window.removeEventListener("beforeprint", markPrintStarted);
      setMessage("Press Cmd+P to print these cards.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold !text-white"
      >
        {label}
      </button>
      {message ? <p className="text-xs font-medium text-muted">{message}</p> : null}
    </div>
  );
}
