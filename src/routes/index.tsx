import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/statpitch/AppHeader";
import { HeroMatch } from "@/components/statpitch/HeroMatch";
import { FixturesTab } from "@/components/statpitch/FixturesTab";
import { H2HTab } from "@/components/statpitch/H2HTab";
import { ValueBetsTab } from "@/components/statpitch/ValueBetsTab";
import { PricingModal } from "@/components/statpitch/PricingModal";
import { getMatches } from "@/lib/matches.functions";

const matchesQueryOptions = queryOptions({
  queryKey: ["matches"],
  queryFn: () => getMatches(),
  staleTime: 60_000,
});

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

const tabs = ["Fixtures & Trends", "H2H Comparison", "Value Bets / Analytics"] as const;

function Index() {
  const { data } = useSuspenseQuery(matchesQueryOptions);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Fixtures & Trends");
  const [pricingOpen, setPricingOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.fixtures;
    return data.fixtures.filter((f) =>
      [f.home, f.away, f.league].some((v) => v.toLowerCase().includes(q)),
    );
  }, [query, data.fixtures]);

  return (
    <div className="min-h-screen">
      <AppHeader
        liveCount={data.liveCount}
        query={query}
        onQueryChange={setQuery}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
        <HeroMatch />

        <nav className="flex gap-1.5 overflow-x-auto rounded-full border border-border bg-surface p-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === t
                  ? "bg-neon text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === "Fixtures & Trends" && <FixturesTab fixtures={filtered} />}
        {tab === "H2H Comparison" && <H2HTab />}
        {tab === "Value Bets / Analytics" && <ValueBetsTab />}
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        StatPitch Analytics ·{" "}
        {data.source === "live"
          ? "Live data from Football-Data.org."
          : "Showing sample data — live feed unavailable."}
      </footer>

      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  );
}
