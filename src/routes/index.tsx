import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/statpitch/AppHeader";
import { HeroMatch } from "@/components/statpitch/HeroMatch";
import { FixturesTab } from "@/components/statpitch/FixturesTab";
import { H2HTab } from "@/components/statpitch/H2HTab";
import { ValueBetsTab } from "@/components/statpitch/ValueBetsTab";
import { PricingModal } from "@/components/statpitch/PricingModal";
import { TelegramBanner } from "@/components/statpitch/TelegramBanner";
import { BetBuilder } from "@/components/statpitch/BetBuilder";
import { ProRail } from "@/components/statpitch/ProRail";
import { LiveRail } from "@/components/statpitch/LiveRail";
import { matchesQuery, matchesQueryOptions } from "@/lib/matches.query";
import { SPORTS, type SportId } from "@/data/sports";
import { liveValueSpots } from "@/data/value-bets";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StatPitch Analytics — Football Stats, H2H & Value Bets" },
      {
        name: "description",
        content:
          "Live football probabilities, head-to-head comparisons, Over/Under 2.5 trends and model-edge value bets in one dark analytics dashboard.",
      },
      { property: "og:title", content: "StatPitch Analytics — Football Stats & Value Bets" },
      {
        property: "og:description",
        content: "Live match probabilities, H2H comparison tools and statistical value spots for football fans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(matchesQueryOptions),
  component: Index,
  errorComponent: ({ error }) => (
    <p role="alert" className="p-8 text-sm text-destructive">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-8 text-sm text-muted-foreground">No matches found.</p>,
});

const tabs = [
  "Fixtures & Trends",
  "H2H Comparison",
  "Value Bets / Analytics",
  "AI Bet Builder",
] as const;

function Index() {
  const { data: football } = useSuspenseQuery(matchesQueryOptions);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Fixtures & Trends");
  const [sport, setSport] = useState<SportId>("football");
  const [pricingOpen, setPricingOpen] = useState(false);

  const sportQuery = useQuery(matchesQuery(sport));
  const data = sport === "football" ? football : sportQuery.data;
  const sportFixtures = data?.fixtures ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sportFixtures;
    return sportFixtures.filter((f) =>
      [f.home, f.away, f.league].some((v) => v.toLowerCase().includes(q)),
    );
  }, [query, sportFixtures]);

  const spots = useMemo(() => liveValueSpots(sportFixtures), [sportFixtures]);
  const loading = sport !== "football" && sportQuery.isPending;

  return (
    <div className="min-h-screen">
      <AppHeader
        liveCount={data?.liveCount ?? 0}
        query={query}
        onQueryChange={setQuery}
        fixtures={football.fixtures}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
        <TelegramBanner onGoPro={() => setPricingOpen(true)} />

        <nav
          aria-label="Choose a sport"
          className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5"
        >
          {SPORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSport(s.id)}


              aria-pressed={sport === s.id}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                sport === s.id
                  ? "bg-neon text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span aria-hidden>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <HeroMatch fixture={sportFixtures[0]} />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <ProRail onSeeAll={() => setPricingOpen(true)} />
            <LiveRail fixtures={sportFixtures} />
          </div>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-surface p-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                tab === t
                  ? "bg-neon text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
            Loading live odds…
          </p>
        ) : (
          <>
            {tab === "Fixtures & Trends" && <FixturesTab fixtures={filtered} />}
            {tab === "H2H Comparison" && <H2HTab />}
            {tab === "Value Bets / Analytics" && (
              <ValueBetsTab key={sport} fixtures={sportFixtures} />
            )}
            {tab === "AI Bet Builder" && <BetBuilder spots={spots} />}
          </>
        )}
      </main>


      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        StatPitch Analytics ·{" "}
        {data?.source === "live"
          ? "Live fixtures and odds from The Odds API."
          : "Live odds feed unavailable right now."}
      </footer>

      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  );
}
