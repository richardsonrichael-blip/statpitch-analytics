import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { LiveFixture } from "@/data/mock-live";
import { detectGoals, scoreMap, type ScoreMap } from "@/lib/goal-alerts";

const KEY = "statpitch:goal-alerts";

export function useGoalAlerts(fixtures: LiveFixture[]) {
  const [enabled, setEnabled] = useState(true);
  const prev = useRef<ScoreMap | null>(null);

  useEffect(() => { setEnabled(localStorage.getItem(KEY) !== "off"); }, []);

  useEffect(() => {
    if (prev.current && enabled) {
      for (const { fixture: f, side } of detectGoals(prev.current, fixtures)) {
        const scorer = side === "home" ? f.home : f.away;
        const msg = `⚽ GOAL! ${scorer}`;
        const desc = `${f.home} ${f.homeScore} - ${f.awayScore} ${f.away}${f.minute ? ` · ${f.minute}'` : ""}`;
        toast.success(msg, { description: desc, duration: 10_000 });
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          new Notification(msg, { body: desc });
        }
      }
    }
    prev.current = scoreMap(fixtures);
  }, [fixtures, enabled]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(KEY, next ? "on" : "off");
    if (next && typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
  };
  return { enabled, toggle };
}
