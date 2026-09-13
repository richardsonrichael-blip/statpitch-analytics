import { createClient } from "@supabase/supabase-js";

import type { BookPrice, LiveFixture, MatchesPayload } from "@/data/mock-live";
import type { SportId } from "@/data/sports";
import type { Database } from "@/integrations/supabase/types";

/** Sports with a draw outcome in the h2h market. */
const DRAW_SPORTS = new Set<SportId>(["football", "cricket", "ice-hockey"]);

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Remove bookmaker margin from decimal odds and return integer percentages. */
function deVig(home: number, draw: number | null, away: number) {
  const raw = [home, draw, away].map((o) => (o && o > 1 ? 1 / o : 0));
  const total = raw.reduce((a, b) => a + b, 0);
  if (total <= 0) return { homeWin: 50, draw: 0, awayWin: 50 };
  const pct = raw.map((r) => Math.round((r / total) * 100));
  const drift = 100 - pct.reduce((a, b) => a + b, 0);
  pct[0] = (pct[0] ?? 0) + drift;
  return { homeWin: Math.max(1, pct[0]!), draw: pct[1] ?? 0, awayWin: Math.max(1, pct[2]!) };
}

type Row = Database["public"]["Tables"]["matches"]["Row"];

function parseBooks(value: unknown): BookPrice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const b = entry as Record<string, unknown>;
      const homeDecimal = Number(b["homeDecimal"]);
      const awayDecimal = Number(b["awayDecimal"]);
      const drawRaw = b["drawDecimal"];
      if (!homeDecimal || !awayDecimal || typeof b["name"] !== "string") return null;
      return {
        name: b["name"],
        homeDecimal,
        drawDecimal: drawRaw == null ? null : Number(drawRaw) || null,
        awayDecimal,
      } satisfies BookPrice;
    })
    .filter((b): b is BookPrice => b !== null)
    .slice(0, 6);
}

function mapRow(row: Row, sport: SportId): LiveFixture | null {
  const books = parseBooks(row.books);
  if (books.length === 0) return null;

  const drawPrices = books.map((b) => b.drawDecimal).filter((d): d is number => !!d);
  const { homeWin, draw, awayWin } = deVig(
    median(books.map((b) => b.homeDecimal)),
    DRAW_SPORTS.has(sport) && drawPrices.length > 0 ? median(drawPrices) : null,
    median(books.map((b) => b.awayDecimal)),
  );

  const isLive = row.status === "IN_PLAY" || row.status === "LIVE" || row.status === "PAUSED";
  const bestHome = Math.max(...books.map((b) => b.homeDecimal));

  return {
    id: row.id,
    league: row.league,
    utcDate: row.commence_time,
    status: row.status,
    home: row.home_team,
    away: row.away_team,
    homeCrest: null,
    awayCrest: null,
    homeScore: row.home_score,
    awayScore: row.away_score,
    pills: [
      row.league,
      isLive ? "In play" : "Upcoming",
      `Best ${bestHome.toFixed(2)} on ${row.home_team}`,
      `${books.length} books priced`,
    ],
    homeWin,
    draw,
    awayWin,
    books,
  };
}

/** Fixtures + bookmaker prices for one sport, read from our own database. */
export async function fetchSportMatches(sport: SportId): Promise<MatchesPayload> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    console.error("Supabase server env is not configured");
    return { source: "mock", liveCount: 0, fixtures: [] };
  }

  const supabase = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, sport, league, commence_time, home_team, away_team, status, home_score, away_score, books",
    )
    .eq("sport", sport)
    .gte("commence_time", cutoff)
    .order("commence_time", { ascending: true })
    .limit(24);

  if (error) {
    console.error("matches read failed", error.message);
    return { source: "mock", liveCount: 0, fixtures: [] };
  }

  const fixtures = (data ?? [])
    .map((row) => mapRow(row as Row, sport))
    .filter((f): f is LiveFixture => f !== null);

  return {
    source: fixtures.length > 0 ? "live" : "mock",
    liveCount: fixtures.filter(
      (f) => f.status === "IN_PLAY" || f.status === "LIVE" || f.status === "PAUSED",
    ).length,
    fixtures,
  };
}
