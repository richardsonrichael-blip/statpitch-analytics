import { useEffect, useState } from "react";
import type { OddsFormat } from "@/lib/odds";

const KEY = "statpitch:odds-format";
const EVENT = "statpitch:odds-format-change";

function read(): OddsFormat {
  if (typeof window === "undefined") return "decimal";
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "fractional" || v === "american" ? v : "decimal";
  } catch {
    return "decimal";
  }
}

export function setOddsFormat(format: OddsFormat) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, format);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Shared odds display format. Starts as decimal on the server to keep SSR stable. */
export function useOddsFormat() {
  const [format, setFormat] = useState<OddsFormat>("decimal");

  useEffect(() => {
    const sync = () => setFormat(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { format, setFormat: setOddsFormat };
}
