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

type ApiOdds = {
  fixture: { id: number };
  bookmakers: {
    bets: { name: string; values: { value: string; odd: string }[] }[];
  }[];
};

/** Median 1X2 odds per fixture from the odds feed (one extra request per cache cycle). */
async function fetchMatchWinnerOdds(key: string, day: string) {
  const byFixture = new Map<number, { home: number[]; draw: number[]; away: number[] }>();
  try {
    // The feed paginates (10 per page); walk every page once per cache cycle.
    let page = 1;
    let totalPages = 1;
    do {
      const res = await fetch(`https://v3.football.api-sports.io/odds?date=${day}&page=${page}`, {
        headers: { "x-apisports-key": key },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        errors: unknown;
        response: ApiOdds[];
        paging?: { total?: number };
      };
      const errs = json.errors;
      if (errs && !Array.isArray(errs) && Object.keys(errs as object).length) {
        throw new Error(JSON.stringify(errs));
      }
      // Cap at 10 pages (100 fixtures) per cycle to protect the daily request quota.
      totalPages = Math.min(10, Math.max(1, json.paging?.total ?? 1));
      for (const entry of json.response) {
        for (const bookmaker of entry.bookmakers) {
          const bet = bookmaker.bets.find((b) => b.name === "Match Winner");
          if (!bet) continue;
          const home = Number(bet.values.find((v) => v.value === "Home")?.odd);
          const draw = Number(bet.values.find((v) => v.value === "Draw")?.odd);
          const away = Number(bet.values.find((v) => v.value === "Away")?.odd);
          if (!(home > 1) || !(draw > 1) || !(away > 1)) continue;
          const slot = byFixture.get(entry.fixture.id) ?? { home: [], draw: [], away: [] };
          slot.home.push(home);
          slot.draw.push(draw);
          slot.away.push(away);
          byFixture.set(entry.fixture.id, slot);
        }
      }
      page += 1;
    } while (page <= totalPages);
  } catch (e) {
    console.error("API-Football odds fetch failed", e instanceof Error ? e.message : e);
  }
  return byFixture;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** Implied Probability % = (1 / Odds) x 100, with the bookmaker margin removed. */
function deVig(home: number, draw: number, away: number) {
  const raw = [1 / home, 1 / draw, 1 / away];
  const total = raw.reduce((a, b) => a + b, 0);
  const pct = raw.map((r) => Math.round((r / total) * 100));
  const drift = 100 - pct.reduce((a, b) => a + b, 0);
  pct[0] = (pct[0] ?? 0) + drift;
  return { homeWin: pct[0] ?? 0, draw: pct[1] ?? 0, awayWin: pct[2] ?? 0 };
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

    const oddsByFixture = await fetchMatchWinnerOdds(key, day);

    const rank = (s: string) => (s === "IN_PLAY" ? 0 : s === "TIMED" ? 1 : 2);
    const fixtures: LiveFixture[] = json.response
      .map((f) => {
        const status = mapStatus(f.fixture.status.short);
        const odds = oddsByFixture.get(f.fixture.id);
        const probabilities = odds
          ? deVig(median(odds.home), median(odds.draw), median(odds.away))
          : null;
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
          // Probabilities come only from real 1X2 odds; never invent them.
          homeWin: probabilities?.homeWin ?? 0,
          draw: probabilities?.draw ?? 0,
          awayWin: probabilities?.awayWin ?? 0,
          probabilitiesAvailable: probabilities !== null,
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
