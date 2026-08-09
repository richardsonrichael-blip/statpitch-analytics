export type Fixture = {
  id: string;
  league: string;
  kickoff: string;
  home: string;
  away: string;
  pills: string[];
  homeWin: number;
  draw: number;
  awayWin: number;
};

export const matchOfTheDay = {
  league: "Premier League",
  kickoff: "Today · 20:00",
  home: "Arsenal",
  away: "Manchester City",
  minute: 62,
  score: "1 - 1",
  probabilities: { home: 38, draw: 27, away: 35 },
  h2h: { home: 42, draw: 21, away: 37, played: 24 },
  overUnder: { over: 68, under: 32, avgGoals: 3.1, bttsPct: 74 },
};

export const fixtures: Fixture[] = [
  {
    id: "f1",
    league: "Premier League",
    kickoff: "Sat · 15:00",
    home: "Arsenal",
    away: "Brighton",
    pills: ["Arsenal: 80% Win Rate Home", "Over 2.5 Goals in last 5 games", "BTTS 4/5"],
    homeWin: 64,
    draw: 21,
    awayWin: 15,
  },
  {
    id: "f2",
    league: "La Liga",
    kickoff: "Sat · 17:30",
    home: "Real Betis",
    away: "Real Madrid",
    pills: ["Madrid unbeaten in 9", "Under 2.5 in 3 of last 5", "Betis 1.2 xG/home"],
    homeWin: 18,
    draw: 24,
    awayWin: 58,
  },
  {
    id: "f3",
    league: "Serie A",
    kickoff: "Sun · 14:00",
    home: "Atalanta",
    away: "Bologna",
    pills: ["Atalanta 2.4 goals/game", "Over 2.5 hit 78%", "6.3 avg corners"],
    homeWin: 52,
    draw: 25,
    awayWin: 23,
  },
  {
    id: "f4",
    league: "Bundesliga",
    kickoff: "Sun · 16:30",
    home: "Leverkusen",
    away: "Stuttgart",
    pills: ["Leverkusen 5 clean sheets/6", "Stuttgart score 1.9 away", "Over 3.5 alert"],
    homeWin: 57,
    draw: 22,
    awayWin: 21,
  },
  {
    id: "f5",
    league: "Ligue 1",
    kickoff: "Sun · 20:45",
    home: "Marseille",
    away: "Lyon",
    pills: ["Derby: 5 straight BTTS", "Marseille 71% home unbeaten", "Cards avg 5.1"],
    homeWin: 46,
    draw: 28,
    awayWin: 26,
  },
  {
    id: "f6",
    league: "Eredivisie",
    kickoff: "Mon · 19:00",
    home: "PSV",
    away: "Feyenoord",
    pills: ["PSV 3.0 goals/game home", "Over 2.5 in 9 of 10", "Feyenoord 1.6 xGA"],
    homeWin: 55,
    draw: 20,
    awayWin: 25,
  },
];

export type TeamStats = {
  name: string;
  form: string[];
  goalsScored: number;
  possession: number;
  cleanSheets: number;
  avgCorners: number;
};

export const teams: Record<string, TeamStats> = {
  Arsenal: {
    name: "Arsenal",
    form: ["W", "W", "D", "W", "L"],
    goalsScored: 42,
    possession: 58,
    cleanSheets: 9,
    avgCorners: 6.4,
  },
  "Manchester City": {
    name: "Manchester City",
    form: ["W", "W", "W", "D", "W"],
    goalsScored: 49,
    possession: 64,
    cleanSheets: 7,
    avgCorners: 7.1,
  },
  Liverpool: {
    name: "Liverpool",
    form: ["W", "L", "W", "W", "D"],
    goalsScored: 45,
    possession: 56,
    cleanSheets: 8,
    avgCorners: 6.9,
  },
  "Real Madrid": {
    name: "Real Madrid",
    form: ["W", "W", "W", "W", "D"],
    goalsScored: 47,
    possession: 55,
    cleanSheets: 11,
    avgCorners: 5.8,
  },
  Atalanta: {
    name: "Atalanta",
    form: ["W", "D", "W", "L", "W"],
    goalsScored: 44,
    possession: 52,
    cleanSheets: 6,
    avgCorners: 6.3,
  },
};

export type ValueBet = {
  match: string;
  league: string;
  market: string;
  model: number;
  implied: number;
  edge: number;
  confidence: "High" | "Medium" | "Low";
};

export const valueBets: ValueBet[] = [
  {
    match: "Arsenal vs Brighton",
    league: "PL",
    market: "Over 2.5 Goals",
    model: 71,
    implied: 58,
    edge: 13,
    confidence: "High",
  },
  {
    match: "Atalanta vs Bologna",
    league: "Serie A",
    market: "Home Win",
    model: 52,
    implied: 44,
    edge: 8,
    confidence: "Medium",
  },
  {
    match: "Leverkusen vs Stuttgart",
    league: "BL",
    market: "BTTS",
    model: 66,
    implied: 55,
    edge: 11,
    confidence: "High",
  },
  {
    match: "Marseille vs Lyon",
    league: "L1",
    market: "Over 9.5 Corners",
    model: 63,
    implied: 54,
    edge: 9,
    confidence: "Medium",
  },
  {
    match: "Betis vs Real Madrid",
    league: "La Liga",
    market: "Away -1 AH",
    model: 47,
    implied: 42,
    edge: 5,
    confidence: "Low",
  },
];
