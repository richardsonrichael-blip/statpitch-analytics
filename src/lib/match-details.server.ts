import type { MatchDetails } from "@/lib/match-details.types";

const BASE = "https://v3.football.api-sports.io";
const CACHE_MS = 15 * 60 * 1000;
const cache = new Map<number, { at: number; data: MatchDetails }>();

async function call<T>(key: string, path: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: { "x-apisports-key": key } });
    if (!res.ok) return null;
    const json = (await res.json()) as { errors: unknown; response: T[] };
    const e = json.errors;
    if (e && !Array.isArray(e) && Object.keys(e as object).length) return null;
    return json.response;
  } catch {
    return null;
  }
}

type Fx = {
  fixture: { id: number; date: string };
  league: { id: number; season: number };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals: { home: number | null; away: number | null };
  events?: { time: { elapsed: number; extra: number | null }; team: { id: number }; player: { name: string | null }; assist: { name: string | null }; type: string; detail: string }[];
  statistics?: { team: { id: number }; statistics: { type: string; value: number | string | null }[] }[];
};

const STAT_TYPES = ["Ball Possession", "Shots on Goal", "Total Shots", "Fouls", "Total passes", "Corner Kicks", "Yellow Cards"];
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number.parseFloat(v) || 0 : 0);

/** Full detail for one API-Football fixture: 4 requests, cached 15 minutes. */
export async function fetchMatchDetails(fixtureId: number): Promise<MatchDetails | null> {
  const hit = cache.get(fixtureId);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const key = process.env["API_FOOTBALL_KEY"];
  if (!key) return null;

  const fx = (await call<Fx>(key, `/fixtures?id=${fixtureId}`))?.[0];
  if (!fx) return hit?.data ?? null;
  const homeId = fx.teams.home.id;

  const [odds, h2h, standings] = await Promise.all([
    call<{ bookmakers: { name: string; bets: { name: string; values: { value: string; odd: string }[] }[] }[] }>(key, `/odds?fixture=${fixtureId}`),
    call<Fx>(key, `/fixtures/headtohead?h2h=${homeId}-${fx.teams.away.id}&last=6`),
    call<{ league: { standings: { rank: number; team: { id: number; name: string; logo: string }; points: number; goalsDiff: number; form: string | null; status: string; all: { played: number } }[][] } }>(
      key,
      `/standings?league=${fx.league.id}&season=${fx.league.season}`,
    ),
  ]);

  const statOf = (teamId: number) => fx.statistics?.find((s) => s.team.id === teamId)?.statistics ?? [];
  const hs = statOf(homeId);
  const as = statOf(fx.teams.away.id);
  const stats = STAT_TYPES.flatMap((t) => {
    const h = hs.find((s) => s.type === t)?.value;
    const a = as.find((s) => s.type === t)?.value;
    if (h == null && a == null) return [];
    return [{ label: t === "Shots on Goal" ? "Shots on Target" : t === "Ball Possession" ? "Possession %" : t, home: num(h), away: num(a) }];
  });

  const markets: MatchDetails["markets"] = [];
  for (const b of odds?.[0]?.bookmakers ?? []) {
    const bet = b.bets.find((x) => x.name === "Match Winner");
    if (!bet) continue;
    const pick = (v: string) => Number(bet.values.find((x) => x.value === v)?.odd) || null;
    markets.push({ bookmaker: b.name, home: pick("Home"), draw: pick("Draw"), away: pick("Away") });
    if (markets.length >= 8) break;
  }

  const table = standings?.[0]?.league.standings?.[0] ?? [];
  const data: MatchDetails = {
    homeTeamId: homeId,
    events: (fx.events ?? []).map((e) => ({
      minute: e.time.elapsed + (e.time.extra ? e.time.extra / 100 : 0),
      label: `${e.time.elapsed}${e.time.extra ? `+${e.time.extra}` : ""}'`,
      side: e.team.id === homeId ? "home" : "away",
      type: e.type === "Goal" ? "goal" : e.type === "Card" ? "card" : e.type === "subst" ? "sub" : "other",
      detail: e.detail,
      player: e.player.name ?? "",
      assist: e.assist.name,
    })),
    stats,
    markets,
    h2h: (h2h ?? []).map((m) => ({
      date: m.fixture.date,
      home: m.teams.home.name,
      away: m.teams.away.name,
      homeGoals: m.goals.home,
      awayGoals: m.goals.away,
    })),
    standings: table.slice(0, 20).map((r) => ({
      rank: r.rank,
      team: r.team.name,
      logo: r.team.logo,
      played: r.all.played,
      goalDiff: r.goalsDiff,
      points: r.points,
      shift: r.status,
      highlight: r.team.id === homeId || r.team.id === fx.teams.away.id,
    })),
  };
  cache.set(fixtureId, { at: Date.now(), data });
  return data;
}
