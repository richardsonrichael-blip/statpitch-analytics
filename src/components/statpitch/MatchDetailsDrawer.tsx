import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { MessageSquare, Share2, Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { LiveFixture } from "@/data/mock-live";
import { TeamCrest } from "@/components/statpitch/TeamCrest";
import { isLiveFixture } from "@/components/statpitch/LiveRail";
import { hasMatchProbabilities } from "@/lib/match-probabilities";
import { getMatchDetails } from "@/lib/match-details.functions";
import { momentumBuckets, type MatchDetails } from "@/lib/match-details.types";
import { useAuthSession } from "@/hooks/useProAccess";
import { supabase } from "@/integrations/supabase/client";
import { MatchExplanation } from "@/components/statpitch/MatchExplanation";
import { chatDisplayName } from "@/lib/chat-display-name";

const TABS = ["Overview", "AI Analysis", "Stats", "Box Score", "Odds", "Predictions & Tips", "H2H", "Standings", "Live Tracker", "Chat"] as const;
type Tab = (typeof TABS)[number];
const FAV_KEY = "statpitch:favorite-teams";

function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"));
    } catch {
      setFavs([]);
    }
  }, []);
  const toggle = (team: string) => {
    const next = favs.includes(team) ? favs.filter((t) => t !== team) : [...favs, team];
    setFavs(next);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };
  return { favs, toggle };
}

function statusLabel(f: LiveFixture) {
  if (f.statusShort === "HT") return "Half-time";
  if (isLiveFixture(f)) return typeof f.minute === "number" ? `Live · ${f.minute}${f.minuteExtra ? `+${f.minuteExtra}` : ""}'` : "Live";
  if (f.status === "FINISHED") return "Full-time";
  return new Date(f.utcDate).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function DualBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-bold tabular-nums">{home}</span>
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{away}</span>
      </div>
      <div className="flex h-2 gap-1">
        <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-neon transition-all duration-500" style={{ width: `${(home / total) * 100}%` }} />
        </div>
        <div className="flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-neon-dim transition-all duration-500" style={{ width: `${(away / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function Timeline({ d, f, filter }: { d: MatchDetails; f: LiveFixture; filter?: boolean }) {
  const events = filter ? d.events.filter((e) => e.type !== "other") : d.events;
  if (!events.length) return <Empty>No goals, cards or substitutions recorded yet.</Empty>;
  const icon = { goal: "⚽", card: "🟨", sub: "🔁", other: "•" } as const;
  return (
    <ol className="relative space-y-3 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-border">
      {events.map((e, i) => (
        <li key={i} className={`relative flex ${e.side === "home" ? "justify-start pr-[52%] text-right" : "justify-end pl-[52%]"}`}>
          <div className="w-full rounded-xl bg-background/60 p-2.5 text-xs">
            <p className="font-bold">
              <span className="text-neon">{e.label}</span> {e.detail.includes("Red") ? "🟥" : icon[e.type]} {e.player}
            </p>
            <p className="text-muted-foreground">
              {e.detail}
              {e.assist ? ` · ${e.type === "sub" ? "off" : "assist"}: ${e.assist}` : ""} · {e.side === "home" ? f.home : f.away}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Probabilities({ f }: { f: LiveFixture }) {
  if (!hasMatchProbabilities(f)) return <Empty>Win probabilities aren't available for this match yet.</Empty>;
  return (
    <div className="space-y-3">
      {[
        [f.home, f.homeWin],
        ["Draw", f.draw],
        [f.away, f.awayWin],
      ].map(([name, p]) => (
        <div key={name as string}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold">{name}</span>
            <span className="font-bold tabular-nums text-neon">{p}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-neon transition-all duration-500" style={{ width: `${p}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OddsTable({ d, f }: { d: MatchDetails | null; f: LiveFixture }) {
  const rows = d?.markets.length
    ? d.markets
    : (f.books ?? []).map((b) => ({ bookmaker: b.name, home: b.homeDecimal, draw: b.drawDecimal, away: b.awayDecimal }));
  if (!rows.length) return <Empty>No market odds published for this match yet.</Empty>;
  const cell = (v: number | null) => (v ? v.toFixed(2) : "—");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr><th className="py-2 text-left">Bookmaker</th><th>1</th><th>X</th><th>2</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.bookmaker}>
              <td className="py-2 font-semibold">{r.bookmaker}</td>
              <td className="text-center tabular-nums">{cell(r.home)}</td>
              <td className="text-center tabular-nums">{cell(r.draw)}</td>
              <td className="text-center tabular-nums">{cell(r.away)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-muted-foreground">Implied probability % = (1 ÷ odds) × 100.</p>
    </div>
  );
}

function Tracker({ d, f }: { d: MatchDetails; f: LiveFixture }) {
  const buckets = momentumBuckets(d.events);
  const max = Math.max(1, ...buckets.map(Math.abs));
  return (
    <div className="rounded-2xl border border-border bg-[linear-gradient(90deg,transparent_49.5%,var(--border)_49.5%,var(--border)_50.5%,transparent_50.5%)] bg-background/60 p-4">
      <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>{f.home}</span><span>Momentum</span><span>{f.away}</span>
      </div>
      <div className="flex h-40 items-stretch gap-2">
        {buckets.map((b, i) => (
          <div key={i} className="flex flex-1 flex-col">
            <div className="flex flex-1 items-end">
              {b > 0 && <div className="w-full rounded-t bg-neon transition-all duration-500" style={{ height: `${(b / max) * 100}%` }} />}
            </div>
            <div className="h-px bg-border" />
            <div className="flex flex-1 items-start">
              {b < 0 && <div className="w-full rounded-b bg-neon-dim transition-all duration-500" style={{ height: `${(-b / max) * 100}%` }} />}
            </div>
            <span className="mt-1 text-center text-[9px] text-muted-foreground">{i * 15}-{i * 15 + 15}'</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Built from goals, cards and attacking events. Up = {f.home}, down = {f.away}.</p>
    </div>
  );
}

type Comment = { id: string; display_name: string; body: string; created_at: string };

function Chat({ matchId }: { matchId: string }) {
  const { user } = useAuthSession();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { data: comments = [] } = useQuery({
    queryKey: ["match-comments", matchId],
    queryFn: async () => {
      const { data } = await supabase
        .from("match_comments")
        .select("id, display_name, body, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as Comment[];
    },
    refetchInterval: 10_000,
  });

  const send = async () => {
    const body = text.trim().slice(0, 500);
    if (!body || !user) return;
    setSending(true);
    const name = chatDisplayName(user.user_metadata?.["full_name"]);
    await supabase.from("match_comments").insert({ match_id: matchId, body, display_name: name });
    setText("");
    setSending(false);
    qc.invalidateQueries({ queryKey: ["match-comments", matchId] });
  };

  return (
    <div className="space-y-3">
      {user ? (
        <div className="flex gap-2">
          <input
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something about the match…"
            className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-neon/50"
          />
          <Button onClick={send} disabled={sending || !text.trim()}>Send</Button>
        </div>
      ) : (
        <Link to="/auth" search={{ redirect: "/" }} className="block rounded-xl border border-neon/40 bg-neon/10 p-3 text-center text-sm font-semibold text-neon">
          Sign in to join the match chat
        </Link>
      )}
      {comments.length === 0 ? (
        <Empty>No comments yet — start the conversation.</Empty>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-background/60 p-3 text-sm">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{chatDisplayName(c.display_name)}</span> ·{" "}
                {new Date(c.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="mt-0.5 break-words">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchDetailsDrawer({ fixture, onClose }: { fixture: LiveFixture | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const { favs, toggle } = useFavorites();
  const fetchDetails = useServerFn(getMatchDetails);
  const matchId = fixture?.id ?? "";
  const { data: details, isLoading } = useQuery({
    queryKey: ["match-details", matchId],
    queryFn: () => fetchDetails({ data: { matchId } }),
    enabled: matchId.startsWith("af-"),
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => setTab("Overview"), [matchId]);

  const share = async () => {
    if (!fixture) return;
    const text = `${fixture.home} vs ${fixture.away} on StatPitch Analytics`;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      /* cancelled */
    }
  };

  const f = fixture;
  const d = details ?? null;
  const needsDetails = !["Odds", "Predictions & Tips", "Chat"].includes(tab);

  const body = (): ReactNode => {
    if (!f) return null;
    if (tab === "AI Analysis") return <MatchExplanation key={f.id} fixture={f} />;
    if (tab === "Chat") return <Chat matchId={f.id} />;
    if (tab === "Odds") return <OddsTable d={d} f={f} />;
    if (tab === "Predictions & Tips")
      return (
        <div className="space-y-4">
          <Probabilities f={f} />
          {hasMatchProbabilities(f) && (
            <p className="rounded-xl bg-neon/10 p-3 text-sm">
              💡 Tip: {f.homeWin >= f.awayWin ? f.home : f.away} is the model favourite at {Math.max(f.homeWin, f.awayWin)}%.
              {f.draw >= 30 ? " A draw is also unusually likely." : ""}
            </p>
          )}
        </div>
      );
    if (needsDetails && isLoading) return <Empty>Loading match data…</Empty>;
    if (!d && tab === "Overview") return <div className="space-y-5"><Probabilities f={f} /><Empty>Goals, cards and substitutions appear here for live-feed football matches.</Empty></div>;
    if (!d) return <Empty>Detailed data is only available for live-feed football matches.</Empty>;
    if (tab === "Overview") return <div className="space-y-5"><Probabilities f={f} /><Timeline d={d} f={f} filter /></div>;
    if (tab === "Box Score") return <Timeline d={d} f={f} />;
    if (tab === "Stats") return d.stats.length ? <div className="space-y-4">{d.stats.map((s) => <DualBar key={s.label} {...s} />)}</div> : <Empty>Match stats appear once the game kicks off.</Empty>;
    if (tab === "Live Tracker") return d.events.length ? <Tracker d={d} f={f} /> : <Empty>Momentum appears once match events are recorded.</Empty>;
    if (tab === "H2H")
      return d.h2h.length ? (
        <ul className="divide-y divide-border text-sm">
          {d.h2h.map((m, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5">
              <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{new Date(m.date).toLocaleDateString()}</span>
              <span className="min-w-0 flex-1 truncate text-right">{m.home}</span>
              <span className="shrink-0 rounded bg-muted px-2 font-bold tabular-nums">{m.homeGoals ?? "-"} - {m.awayGoals ?? "-"}</span>
              <span className="min-w-0 flex-1 truncate">{m.away}</span>
            </li>
          ))}
        </ul>
      ) : <Empty>No previous meetings found.</Empty>;
    // Standings
    return d.standings.length ? (
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr><th className="py-2 text-left">#</th><th className="text-left">Team</th><th>P</th><th>GD</th><th>Pts</th></tr>
        </thead>
        <tbody>
          {d.standings.map((r) => (
            <tr key={r.team} className={r.highlight ? "bg-neon/10 font-bold text-neon" : ""}>
              <td className="py-1.5 pl-1">
                {r.rank}
                <span className="ml-1 text-[9px]">{r.shift === "up" ? "▲" : r.shift === "down" ? "▼" : ""}</span>
              </td>
              <td className="flex items-center gap-1.5 py-1.5"><TeamCrest src={r.logo} name={r.team} className="size-4" /><span className="truncate">{r.team}</span></td>
              <td className="text-center tabular-nums">{r.played}</td>
              <td className="text-center tabular-nums">{r.goalDiff}</td>
              <td className="text-center tabular-nums">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : <Empty>No league table for this competition.</Empty>;
  };

  return (
    <Sheet open={Boolean(f)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden border-border bg-surface p-0 sm:max-w-xl [&>button]:hidden">
        {f && (
          <>
            <header className="pitch-hero border-b border-border p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <SheetDescription className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{f.league}</SheetDescription>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" aria-label="Share" onClick={share}><Share2 className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Feedback" asChild>
                    <a href={`https://wa.me/233202165004?text=${encodeURIComponent(`Feedback on ${f.home} vs ${f.away}: `)}`} target="_blank" rel="noopener noreferrer"><MessageSquare className="size-4" /></a>
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Close" onClick={onClose}><X className="size-4" /></Button>
                </div>
              </div>
              <p className={`mt-1 text-center text-xs font-bold uppercase tracking-widest ${isLiveFixture(f) ? "text-success" : "text-neon"}`}>{statusLabel(f)}</p>
              <SheetTitle className="sr-only">{f.home} vs {f.away}</SheetTitle>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                {([["home", f.home, f.homeCrest], ["away", f.away, f.awayCrest]] as const).map(([side, name, crest]) => {
                  const team = (
                    <div key={side} className={`flex min-w-0 flex-col items-center gap-1.5 text-center ${side === "away" ? "order-3" : ""}`}>
                      <TeamCrest src={crest} name={name} className="size-12" />
                      <div className="flex items-center gap-1">
                        <span className="break-words text-sm font-bold [overflow-wrap:anywhere]">{name}</span>
                        <button aria-label={favs.includes(name) ? `Remove ${name} from favourites` : `Save ${name} to favourites`} onClick={() => toggle(name)} className="shrink-0 transition hover:scale-110">
                          <Star className={`size-4 ${favs.includes(name) ? "fill-neon text-neon" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                    </div>
                  );
                  return team;
                })}
                <span className="order-2 font-display text-4xl tabular-nums">
                  {f.homeScore !== null && f.awayScore !== null ? `${f.homeScore} - ${f.awayScore}` : "VS"}
                </span>
              </div>
            </header>
            <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-background/60 px-2 [scrollbar-width:none]">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    if (t === "AI Analysis" && tab !== "AI Analysis") {
                      window.__lovableEvents?.track?.("project.ai_analysis_opened");
                    }
                  }}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${tab === t ? "border-neon text-neon" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </nav>
            <div key={tab} className="flex-1 overflow-y-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:p-5">
              {body()}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
