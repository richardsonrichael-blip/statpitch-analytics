import type { LiveFixture, MatchesPayload } from "@/data/mock-live";

/** API-Football free plan allows 100 requests/day, so cache per day for 15 minutes. */
const CACHE_MS = 15 * 60 * 1000;
let cache: { at: number; day: string; payload: MatchesPayload } | null = null;

const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"]);
const DONE = new Set(["FT", "AET", "PEN"]);

type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string } };
  league: { name: string; country: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
};

function mapStatus(short: string) {
  if (LIVE.has(short)) return "IN_PLAY";
  if (DONE.has(short)) return "FINISHED";
  return "TIMED";
}

/** Today's real football fixtures. Returns null when the feed is unavailable. */
export async function fetchTodayFootball(): Promise<MatchesPayload | null> {
  const key = process.env["API_FOOTBALL_KEY"];
  if (!key) return null;
  const day = new Date().toISOString().slice(0, 10);
  if (cache && cache.day === day && Date.now() - cache.at < CACHE_MS) return cache.payload;

  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${day}`, {
      headers: { "x-apisports-key": key },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { errors: unknown; response: ApiFixture[] };
    const errs = json.errors;
    if (errs && !Array.isArray(errs) && Object.keys(errs as object).length) {
      throw new Error(JSON.stringify(errs));
    }

    const rank = (s: string) => (s === "IN_PLAY" ? 0 : s === "TIMED" ? 1 : 2);
    const fixtures: LiveFixture[] = json.response
      .map((f) => {
        const status = mapStatus(f.fixture.status.short);
        return {
          id: `af-${f.fixture.id}`,
          league: `${f.league.name} · ${f.league.country}`,
          utcDate: f.fixture.date,
          status,
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeCrest: f.teams.home.logo || null,
          awayCrest: f.teams.away.logo || null,
          homeScore: f.goals.home,
          awayScore: f.goals.away,
          pills: [f.league.name, status === "IN_PLAY" ? "In play" : status === "FINISHED" ? "Full time" : "Upcoming"],
          // API-Football fixtures carry no probabilities; never invent them.
          homeWin: 0,
          draw: 0,
          awayWin: 0,
          probabilitiesAvailable: false,
          books: [],
        } satisfies LiveFixture;
      })
      .sort((a, b) => rank(a.status) - rank(b.status) || a.utcDate.localeCompare(b.utcDate))
      .slice(0, 40);

    const payload: MatchesPayload = {
      source: "live",
      liveCount: fixtures.filter((f) => f.status === "IN_PLAY").length,
      fixtures,
    };
    cache = { at: Date.now(), day, payload };
    return payload;
  } catch (e) {
    console.error("API-Football fetch failed", e instanceof Error ? e.message : e);
    return cache?.payload ?? null;
  }
}
