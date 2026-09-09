import type { LiveFixture, MatchesPayload } from "@/data/mock-live";
import type { SportId } from "@/data/sports";

const BASE = "https://api.the-odds-api.com/v4/sports";

/** League keys queried per sport tab on The Odds API. */
const SPORT_KEYS: Record<SportId, string[]> = {
  football: [
    "soccer_epl",
    "soccer_uefa_champs_league",
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
  ],
  basketball: ["basketball_nba", "basketball_euroleague", "basketball_wnba"],
  tennis: ["tennis_atp_us_open", "tennis_wta_us_open"],
  "american-football": ["americanfootball_nfl", "americanfootball_ncaaf"],
  "ice-hockey": ["icehockey_nhl", "icehockey_liiga", "icehockey_sweden_hockey_league"],
  cricket: ["cricket_odi", "cricket_international_t20", "cricket_test_match", "cricket_ipl"],
  combat: ["mma_mixed_martial_arts", "boxing_boxing"],
};

/** Sports with a draw outcome in the h2h market. */
const DRAW_SPORTS = new Set<SportId>(["football", "cricket", "ice-hockey"]);

type ApiOutcome = { name: string; price: number };
type ApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string | null;
  away_team: string | null;
  bookmakers?: {
    key: string;
    title: string;
    markets?: { key: string; outcomes?: ApiOutcome[] }[];
  }[];
};

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

function mapEvent(event: ApiEvent, sport: SportId): LiveFixture | null {
  const home = event.home_team;
  const away = event.away_team;
  if (!home || !away) return null;

  const books = (event.bookmakers ?? [])
    .map((b) => {
      const outcomes = b.markets?.find((m) => m.key === "h2h")?.outcomes ?? [];
      const priceFor = (name: string) => outcomes.find((o) => o.name === name)?.price ?? null;
      const homeDecimal = priceFor(home);
      const awayDecimal = priceFor(away);
      if (!homeDecimal || !awayDecimal) return null;
      return {
        name: b.title,
        homeDecimal,
        drawDecimal: priceFor("Draw"),
        awayDecimal,
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .slice(0, 6);

  if (books.length === 0) return null;

  const drawPrices = books.map((b) => b.drawDecimal).filter((d): d is number => !!d);
  const { homeWin, draw, awayWin } = deVig(
    median(books.map((b) => b.homeDecimal)),
    DRAW_SPORTS.has(sport) && drawPrices.length > 0 ? median(drawPrices) : null,
    median(books.map((b) => b.awayDecimal)),
  );

  const kickoff = new Date(event.commence_time).getTime();
  const isLive = kickoff <= Date.now();
  const bestHome = Math.max(...books.map((b) => b.homeDecimal));

  const pills = [
    event.sport_title,
    isLive ? "In play" : "Upcoming",
    `Best ${bestHome.toFixed(2)} on ${home}`,
    `${books.length} books priced`,
  ];

  return {
    id: event.id,
    league: event.sport_title,
    utcDate: event.commence_time,
    status: isLive ? "IN_PLAY" : "TIMED",
    home,
    away,
    homeCrest: null,
    awayCrest: null,
    homeScore: null,
    awayScore: null,
    pills,
    homeWin,
    draw,
    awayWin,
    books,
  };
}

async function fetchKey(key: string, apiKey: string): Promise<ApiEvent[]> {
  const url = new URL(`${BASE}/${key}/odds/`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "uk,eu,us");
  url.searchParams.set("markets", "h2h");
  url.searchParams.set("oddsFormat", "decimal");
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("the-odds-api league request failed", key, res.status);
    return [];
  }
  const json = await res.json();
  return Array.isArray(json) ? (json as ApiEvent[]) : [];
}

/** Catch-all upcoming feed, used to top up sports with no in-season league key. */
async function fetchUpcoming(apiKey: string): Promise<ApiEvent[]> {
  const url = new URL(`${BASE}/upcoming/odds/`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "uk,eu,us");
  url.searchParams.set("markets", "h2h");
  url.searchParams.set("oddsFormat", "decimal");
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? (json as ApiEvent[]) : [];
}

const GROUP_PREFIX: Record<SportId, string> = {
  football: "soccer_",
  basketball: "basketball_",
  tennis: "tennis_",
  "american-football": "americanfootball_",
  "ice-hockey": "icehockey_",
  cricket: "cricket_",
  combat: "mma_",
};

/** Live fixtures + real bookmaker prices for one sport tab. */
export async function fetchSportMatches(sport: SportId): Promise<MatchesPayload> {
  const apiKey = process.env["THE_ODDS_API_KEY"];
  if (!apiKey) {
    console.error("THE_ODDS_API_KEY is not configured");
    return { source: "mock", liveCount: 0, fixtures: [] };
  }

  const keys = SPORT_KEYS[sport];
  const results = await Promise.all(keys.map((k) => fetchKey(k, apiKey)));
  let events = results.flat();

  if (events.length === 0) {
    const prefix = GROUP_PREFIX[sport];
    const boxing = sport === "combat" ? "boxing_" : prefix;
    events = (await fetchUpcoming(apiKey)).filter(
      (e) => e.sport_key.startsWith(prefix) || e.sport_key.startsWith(boxing),
    );
  }

  const fixtures = events
    .sort((a, b) => {
      const at = new Date(a.commence_time).getTime();
      const bt = new Date(b.commence_time).getTime();
      if (at !== bt) return at - bt;
      return a.id.localeCompare(b.id);
    })
    .slice(0, 24)
    .map((e) => mapEvent(e, sport))
    .filter((f): f is LiveFixture => f !== null);

  return {
    source: fixtures.length > 0 ? "live" : "mock",
    liveCount: fixtures.filter((f) => f.status === "IN_PLAY").length,
    fixtures,
  };
}
