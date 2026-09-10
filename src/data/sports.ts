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
