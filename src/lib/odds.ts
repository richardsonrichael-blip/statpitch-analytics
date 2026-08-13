export type OddsFormat = "decimal" | "fractional" | "american";

export const ODDS_FORMATS: { id: OddsFormat; label: string; example: string }[] = [
  { id: "decimal", label: "Decimal", example: "1.85" },
  { id: "fractional", label: "Fractional", example: "5/6" },
  { id: "american", label: "American", example: "-118" },
];

/** Fair decimal odds implied by a model/market probability (%) plus bookmaker margin. */
export function decimalFromProbability(probability: number, margin = 0.05) {
  const p = Math.min(Math.max(probability, 1), 99) / 100;
  return Math.round((1 / (p * (1 + margin))) * 100) / 100;
}

export function probabilityFromDecimal(decimal: number) {
  return Math.round((100 / decimal) * 10) / 10;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function toFractional(decimal: number) {
  const value = decimal - 1;
  let best = { num: 1, den: 1, diff: Infinity };
  for (let den = 1; den <= 20; den++) {
    const num = Math.round(value * den);
    if (num < 1) continue;
    const diff = Math.abs(num / den - value);
    if (diff < best.diff) best = { num, den, diff };
  }
  const d = gcd(best.num, best.den);
  return `${best.num / d}/${best.den / d}`;
}

export function toAmerican(decimal: number) {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
  return `${Math.round(-100 / (decimal - 1))}`;
}

export function formatOdds(decimal: number, format: OddsFormat) {
  if (format === "fractional") return toFractional(decimal);
  if (format === "american") return toAmerican(decimal);
  return decimal.toFixed(2);
}

export type Bookmaker = {
  id: string;
  name: string;
  /** Affiliate/referral landing page. */
  ref: string;
  /** Relative price quality — higher means better prices for the punter. */
  edge: number;
};

export const BOOKMAKERS: Bookmaker[] = [
  { id: "1xbet", name: "1xBet", ref: "https://1xbet.com/?ref=statpitch", edge: 1.035 },
  { id: "sportybet", name: "SportyBet", ref: "https://sportybet.com/?ref=statpitch", edge: 1.02 },
  { id: "betway", name: "Betway", ref: "https://betway.com/?ref=statpitch", edge: 1.0 },
  { id: "stake", name: "Stake", ref: "https://stake.com/?c=statpitch", edge: 1.028 },
];

export type BookmakerPrice = { bookmaker: Bookmaker; decimal: number };

/** Deterministic per-bookmaker prices around the fair line, so SSR and client agree. */
export function bookmakerPrices(probability: number, seed: string): BookmakerPrice[] {
  const base = decimalFromProbability(probability);
  return BOOKMAKERS.map((bookmaker, i) => {
    let hash = 0;
    const key = `${seed}-${bookmaker.id}`;
    for (let c = 0; c < key.length; c++) hash = (hash * 31 + key.charCodeAt(c)) % 997;
    const jitter = ((hash % 9) - 4) / 200; // ±2%
    const decimal = Math.round(base * bookmaker.edge * (1 + jitter + i * 0.002) * 100) / 100;
    return { bookmaker, decimal: Math.max(1.02, decimal) };
  });
}

export function bestPrice(prices: BookmakerPrice[]) {
  return prices.reduce((best, p) => (p.decimal > best.decimal ? p : best), prices[0]!);
}

export function betLink(bookmaker: Bookmaker, selection: string) {
  const url = new URL(bookmaker.ref);
  url.searchParams.set("bet", selection);
  return url.toString();
}

export const TELEGRAM_VIP_URL = "https://t.me/statpitchvip";
