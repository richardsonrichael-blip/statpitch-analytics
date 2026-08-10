import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/statpitch/AppHeader";
import { matchesQueryOptions } from "@/lib/matches.query";
import { getTeamProfile } from "@/lib/team-directory";

export const Route = createFileRoute("/team/$teamName")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.teamName);
    const title = `${name} Stats & Form — StatPitch Analytics`;
    const description = `${name} form, goals, possession and fixture probabilities from the StatPitch football analytics model.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(matchesQueryOptions),
  component: TeamPage,
});

function Bar({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-neon" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function TeamPage() {
  const { teamName } = Route.useParams();
  const { data } = useSuspenseQuery(matchesQueryOptions);
  const [query, setQuery] = useState("");
  const profile = getTeamProfile(data.fixtures, teamName);

  return (
    <div className="min-h-screen">
      <AppHeader liveCount={data.liveCount} query={query} onQueryChange={setQuery} fixtures={data.fixtures} />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {!profile ? (
          <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
            No stats found for “{decodeURIComponent(teamName)}”.
          </p>
        ) : (
          <>
            <section className="rounded-3xl border border-border bg-surface p-5 card-shadow sm:p-7">
              <div className="flex items-center gap-3">
                {profile.crest ? (
                  <img src={profile.crest} alt={`${profile.name} crest`} className="size-12 object-contain" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">{profile.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {profile.leagues.join(" · ") || "Football"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Played", value: profile.played },
                  { label: "Wins", value: profile.wins },
                  { label: "Draws", value: profile.draws },
                  { label: "Losses", value: profile.losses },
                  { label: "Goals For", value: profile.goalsFor },
                  { label: "Goals Against", value: profile.goalsAgainst },
                  { label: "Fixtures", value: profile.matches.length },
                  {
                    label: "Win %",
                    value: profile.played ? Math.round((profile.wins / profile.played) * 100) : 0,
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-background p-3">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-neon">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {profile.stats && (
              <section className="space-y-5 rounded-3xl border border-border bg-surface p-5 card-shadow sm:p-7">
                <div className="flex items-center gap-1.5">
                  {profile.stats.form.map((r, i) => (
                    <span
                      key={i}
                      className={`grid size-6 place-items-center rounded-md text-[11px] font-bold ${
                        r === "W"
                          ? "bg-neon/15 text-neon"
                          : r === "D"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <Bar label="Goals Scored" value={profile.stats.goalsScored} max={60} />
                <Bar label="Possession" value={profile.stats.possession} max={100} suffix="%" />
                <Bar label="Clean Sheets" value={profile.stats.cleanSheets} max={20} />
                <Bar label="Avg Corners" value={profile.stats.avgCorners} max={10} />
              </section>
            )}

            <section className="rounded-3xl border border-border bg-surface p-5 card-shadow sm:p-7">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fixtures</h3>
              <ul className="mt-4 space-y-3">
                {profile.matches.length === 0 && (
                  <li className="text-sm text-muted-foreground">No fixtures in the current window.</li>
                )}
                {profile.matches.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background p-3 text-sm"
                  >
                    <span className="font-semibold">
                      {m.home} vs {m.away}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.league}</span>
                    <span className="ml-auto font-bold tabular-nums text-neon">
                      {m.homeScore !== null && m.awayScore !== null
                        ? `${m.homeScore} - ${m.awayScore}`
                        : new Date(m.utcDate).toLocaleString(undefined, {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
