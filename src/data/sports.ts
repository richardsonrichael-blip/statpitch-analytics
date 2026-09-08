import type { LiveFixture } from "./mock-live";
import { seededRatio } from "./mock-live";
import { valueSpots, type ValueSpot } from "./value-bets";

export type SportId =
  | "football"
  | "basketball"
  | "tennis"
  | "american-football"
  | "ice-hockey"
  | "cricket"
  | "combat";

export type Sport = {
  id: SportId;
  label: string;
  emoji: string;
  /** Two-way sports have no draw market. */
  hasDraw: boolean;
  leagues: string[];
  markets: string[];
};

export const SPORTS: Sport[] = [
  {
    id: "football",
    label: "Football",
    emoji: "⚽",
    hasDraw: true,
    leagues: [
      "Premier League",
      "UEFA Champions League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "African Leagues / CAF",
    ],
    markets: ["Over 2.5 Goals", "BTTS", "Corner Markets", "Card Markets"],
  },
  {
    id: "basketball",
    label: "Basketball",
    emoji: "🏀",
    hasDraw: false,
    leagues: ["NBA", "EuroLeague", "NCAA", "BAL (Africa)"],
    markets: ["Total Points", "Handicap", "Player Points", "3-Pointers"],
  },
  {
    id: "tennis",
    label: "Tennis",
    emoji: "🎾",
    hasDraw: false,
    leagues: ["ATP Tour", "WTA Tour", "Grand Slam"],
    markets: ["Match Winner", "Total Games", "Set Betting", "Tie-Break"],
  },
  {
    id: "american-football",
    label: "American Football",
    emoji: "🏈",
    hasDraw: false,
    leagues: ["NFL", "NCAA Football"],
    markets: ["Spread", "Total Points", "Anytime TD", "1st Half"],
  },
  {
    id: "ice-hockey",
    label: "Ice Hockey",
    emoji: "🏒",
    hasDraw: false,
    leagues: ["NHL", "KHL", "SHL"],
    markets: ["Puck Line", "Over 5.5 Goals", "Both Teams To Score", "Period Betting"],
  },
  {
    id: "cricket",
    label: "Cricket",
    emoji: "🏏",
    hasDraw: false,
    leagues: ["IPL", "T20 Internationals", "The Hundred"],
    markets: ["Match Winner", "Total Runs", "Top Batter", "Wickets"],
  },
  {
    id: "combat",
    label: "MMA & Boxing",
    emoji: "🥊",
    hasDraw: false,
    leagues: ["UFC", "Boxing"],
    markets: ["Fight Winner", "Method of Victory", "Round Betting", "Over 2.5 Rounds"],
  },
];

export function sportById(id: SportId) {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

type Pairing = { league: string; home: string; away: string; pills: string[] };

const PAIRINGS: Record<Exclude<SportId, "football">, Pairing[]> = {
  basketball: [
    { league: "NBA", home: "Boston Celtics", away: "Milwaukee Bucks", pills: ["Pace 101.4", "O/U 226.5", "ATS 6-4"] },
    { league: "NBA", home: "Denver Nuggets", away: "Phoenix Suns", pills: ["Off Rtg 121", "O/U 231.5", "Home 14-3"] },
    { league: "NBA", home: "LA Lakers", away: "Golden State Warriors", pills: ["Pace 99.8", "O/U 229.5", "3PT 39%"] },
    { league: "EuroLeague", home: "Real Madrid", away: "Olympiacos", pills: ["Def Rtg 104", "O/U 163.5", "Form W4"] },
    { league: "NCAA", home: "Duke", away: "Kansas", pills: ["Pace 71.2", "O/U 148.5", "ATS 7-3"] },
    { league: "BAL (Africa)", home: "Al Ahly", away: "Petro de Luanda", pills: ["Reb +7.5", "O/U 156.5", "Form W3"] },
  ],
  tennis: [
    { league: "ATP Tour", home: "Carlos Alcaraz", away: "Daniil Medvedev", pills: ["1st serve 71%", "Hard court", "H2H 4-2"] },
    { league: "ATP Tour", home: "Jannik Sinner", away: "Alexander Zverev", pills: ["Break pts 42%", "O/U 22.5 games", "H2H 3-3"] },
    { league: "WTA Tour", home: "Iga Swiatek", away: "Aryna Sabalenka", pills: ["Return 48%", "O/U 21.5 games", "H2H 6-4"] },
    { league: "Grand Slam", home: "Novak Djokovic", away: "Taylor Fritz", pills: ["5-set record 38-11", "Hard court", "H2H 9-0"] },
  ],
  "american-football": [
    { league: "NFL", home: "Kansas City Chiefs", away: "Buffalo Bills", pills: ["Spread -2.5", "O/U 47.5", "ATS 7-4"] },
    { league: "NFL", home: "San Francisco 49ers", away: "Dallas Cowboys", pills: ["Yds/g 382", "O/U 45.5", "Home 6-2"] },
    { league: "NFL", home: "Baltimore Ravens", away: "Miami Dolphins", pills: ["Rush 158 y/g", "O/U 49.5", "ATS 8-3"] },
    { league: "NCAA Football", home: "Georgia", away: "Alabama", pills: ["Spread -3.5", "O/U 52.5", "Form W5"] },
  ],
  "ice-hockey": [
    { league: "NHL", home: "Colorado Avalanche", away: "Vegas Golden Knights", pills: ["PP 26%", "O/U 6.5", "Form W4"] },
    { league: "NHL", home: "Boston Bruins", away: "Toronto Maple Leafs", pills: ["SV% .921", "O/U 5.5", "H2H 3-2"] },
    { league: "KHL", home: "SKA St Petersburg", away: "CSKA Moscow", pills: ["Shots 34/g", "O/U 5.5", "Home 12-4"] },
    { league: "SHL", home: "Frölunda", away: "Färjestad", pills: ["PK 84%", "O/U 5.5", "Form W3"] },
  ],
  cricket: [
    { league: "IPL", home: "Mumbai Indians", away: "Chennai Super Kings", pills: ["RPO 8.9", "O/U 168.5", "H2H 6-4"] },
    { league: "IPL", home: "Gujarat Titans", away: "Rajasthan Royals", pills: ["Powerplay 52", "O/U 172.5", "Form W3"] },
    { league: "T20 Internationals", home: "India", away: "Australia", pills: ["RPO 9.2", "O/U 176.5", "H2H 5-3"] },
    { league: "The Hundred", home: "Oval Invincibles", away: "Trent Rockets", pills: ["Econ 7.4", "O/U 152.5", "Form W2"] },
  ],
  combat: [
    { league: "UFC", home: "Islam Makhachev", away: "Arman Tsarukyan", pills: ["TD acc 62%", "O/U 3.5 rds", "Sub threat"] },
    { league: "UFC", home: "Alex Pereira", away: "Jiri Prochazka", pills: ["KO power 74%", "O/U 2.5 rds", "Str/min 5.1"] },
    { league: "Boxing", home: "Terence Crawford", away: "Errol Spence Jr", pills: ["KO 68%", "O/U 9.5 rds", "Reach +2\""] },
    { league: "Boxing", home: "Anthony Joshua", away: "Deontay Wilder", pills: ["KO 87%", "O/U 6.5 rds", "Form W3"] },
  ],
};

/** Deterministic mock fixtures for the non-football sports. */
export function buildSportFixtures(sport: SportId, now = Date.now()): LiveFixture[] {
  if (sport === "football") return [];
  const pairs = PAIRINGS[sport];
  return pairs.map((p, i) => {
    const seed = `${sport}-${p.home}-${p.away}`;
    const homeWin = 38 + Math.round(seededRatio(seed) * 26);
    const isLive = i === 0;
    return {
      id: seed,
      league: p.league,
      utcDate: new Date(now + (i - 1) * 5 * 60 * 60 * 1000).toISOString(),
      status: isLive ? "IN_PLAY" : "TIMED",
      home: p.home,
      away: p.away,
      homeCrest: null,
      awayCrest: null,
      homeScore: isLive ? Math.round(seededRatio(`${seed}-hs`) * 60) : null,
      awayScore: isLive ? Math.round(seededRatio(`${seed}-as`) * 60) : null,
      pills: p.pills,
      homeWin,
      draw: 0,
      awayWin: 100 - homeWin,
    } satisfies LiveFixture;
  });
}

/** Model-edge value spots per sport, reusing the football table for football. */
export function sportValueSpots(sport: SportId): ValueSpot[] {
  if (sport === "football") return valueSpots;
  const s = sportById(sport)!;
  return PAIRINGS[sport].flatMap((p, i) => {
    const base = `${p.home} vs ${p.away}`;
    return s.markets.slice(0, 3).map((market, j) => {
      const seed = `${sport}-${base}-${market}`;
      const model = 52 + Math.round(seededRatio(seed) * 26);
      const implied = model - (6 + Math.round(seededRatio(`${seed}-imp`) * 14));
      return {
        match: base,
        leagueGroup: p.league,
        market,
        statMarket: market,
        model,
        implied,
        confidence: model - implied >= 15 ? "High" : (i + j) % 2 === 0 ? "Medium" : "Low",
      } satisfies ValueSpot;
    });
  });
}
