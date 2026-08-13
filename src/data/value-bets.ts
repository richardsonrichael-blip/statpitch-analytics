export type LeagueGroup =
  | "Premier League"
  | "UEFA Champions League"
  | "La Liga"
  | "Serie A"
  | "Bundesliga"
  | "African Leagues / CAF";

export type StatMarket = "Over 2.5 Goals" | "BTTS" | "Corner Markets" | "Card Markets";

export type ValueSpot = {
  match: string;
  leagueGroup: LeagueGroup;
  market: string;
  statMarket?: StatMarket;
  model: number;
  implied: number;
  confidence: "High" | "Medium" | "Low";
};

export const LEAGUE_FILTERS: { id: LeagueGroup; label: string }[] = [
  { id: "Premier League", label: "Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "UEFA Champions League", label: "UEFA Champions League 🇪🇺" },
  { id: "La Liga", label: "La Liga 🇪🇸" },
  { id: "Serie A", label: "Serie A 🇮🇹" },
  { id: "Bundesliga", label: "Bundesliga 🇩🇪" },
  { id: "African Leagues / CAF", label: "African Leagues / CAF 🌍" },
];

export const STAT_FILTERS: StatMarket[] = [
  "Over 2.5 Goals",
  "BTTS",
  "Corner Markets",
  "Card Markets",
];

export const valueSpots: ValueSpot[] = [
  {
    match: "Arsenal vs Brighton",
    leagueGroup: "Premier League",
    market: "Over 2.5 Goals",
    statMarket: "Over 2.5 Goals",
    model: 74,
    implied: 58,
    confidence: "High",
  },
  {
    match: "Aston Villa vs Everton",
    leagueGroup: "Premier League",
    market: "Over 9.5 Corners",
    statMarket: "Corner Markets",
    model: 66,
    implied: 54,
    confidence: "Medium",
  },
  {
    match: "Newcastle vs Wolves",
    leagueGroup: "Premier League",
    market: "Over 4.5 Cards",
    statMarket: "Card Markets",
    model: 61,
    implied: 45,
    confidence: "High",
  },
  {
    match: "Inter vs Bayern",
    leagueGroup: "UEFA Champions League",
    market: "Both Teams To Score",
    statMarket: "BTTS",
    model: 72,
    implied: 55,
    confidence: "High",
  },
  {
    match: "PSG vs Porto",
    leagueGroup: "UEFA Champions League",
    market: "Home Win",
    model: 58,
    implied: 50,
    confidence: "Medium",
  },
  {
    match: "Betis vs Real Madrid",
    leagueGroup: "La Liga",
    market: "Away -1 AH",
    model: 47,
    implied: 42,
    confidence: "Low",
  },
  {
    match: "Girona vs Sevilla",
    leagueGroup: "La Liga",
    market: "Both Teams To Score",
    statMarket: "BTTS",
    model: 69,
    implied: 52,
    confidence: "High",
  },
  {
    match: "Atalanta vs Bologna",
    leagueGroup: "Serie A",
    market: "Over 2.5 Goals",
    statMarket: "Over 2.5 Goals",
    model: 70,
    implied: 61,
    confidence: "Medium",
  },
  {
    match: "Lazio vs Roma",
    leagueGroup: "Serie A",
    market: "Over 5.5 Cards",
    statMarket: "Card Markets",
    model: 64,
    implied: 44,
    confidence: "High",
  },
  {
    match: "Leverkusen vs Stuttgart",
    leagueGroup: "Bundesliga",
    market: "Both Teams To Score",
    statMarket: "BTTS",
    model: 66,
    implied: 55,
    confidence: "Medium",
  },
  {
    match: "Dortmund vs Union Berlin",
    leagueGroup: "Bundesliga",
    market: "Over 10.5 Corners",
    statMarket: "Corner Markets",
    model: 68,
    implied: 50,
    confidence: "High",
  },
  {
    match: "Al Ahly vs Zamalek",
    leagueGroup: "African Leagues / CAF",
    market: "Under 2.5 Goals",
    model: 63,
    implied: 55,
    confidence: "Medium",
  },
  {
    match: "Mamelodi Sundowns vs Esperance",
    leagueGroup: "African Leagues / CAF",
    market: "Home Win",
    model: 61,
    implied: 44,
    confidence: "High",
  },
  {
    match: "Simba SC vs TP Mazembe",
    leagueGroup: "African Leagues / CAF",
    market: "Over 2.5 Goals",
    statMarket: "Over 2.5 Goals",
    model: 58,
    implied: 49,
    confidence: "Medium",
  },
];

export function edgeOf(v: ValueSpot) {
  return Math.round((v.model - v.implied) * 10) / 10;
}

/** High Value Alert: model probability at least 15 points above the implied price. */
export function isHighValue(v: ValueSpot) {
  return edgeOf(v) >= 15;
}
