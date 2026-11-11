import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Square, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useProAccess";
import type { LiveFixture } from "@/data/mock-live";

export function MatchExplanation({ fixture }: { fixture: LiveFixture }) {
  const { session, loading: authLoading } = useAuthSession();
  const [text, setText] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [snapshot, setSnapshot] = useState<{ source: string; updatedAt: string | null } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const article = useRef<HTMLElement | null>(null);
  const viewedSections = useRef(new Set<string>());
  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    if (!article.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const section = entry.target.getAttribute("data-analysis-section");
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5 || !section || viewedSections.current.has(section)) continue;
        viewedSections.current.add(section);
        window.__lovableEvents?.track?.("project.ai_explanation_section_viewed", { section });
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.5 });
    article.current.querySelectorAll("[data-analysis-section]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [text]);

  const generate = async () => {
    if (!session || running) return;
    const abort = new AbortController();
    controller.current = abort;
    setRunning(true); setStopped(false); setError(""); setText(""); setReasoning(""); setSnapshot(null);
    viewedSections.current.clear();
    let answer = "";
    let completed = false;
    try {
      const response = await fetch("/api/public/match-explanation", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ matchId: fixture.id }), signal: abort.signal,
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message ?? "Match analysis is unavailable. Please try again later.");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("The analysis stream was unavailable.");
      const decoder = new TextDecoder();
      let buffer = "";
      const receive = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "text") { answer += event.text; setText(answer); }
        if (event.type === "reasoning") setReasoning((s) => s + event.text);
        if (event.type === "snapshot") setSnapshot(event);
        if (event.type === "done") completed = true;
        if (event.type === "error") throw new Error(event.message);
      };
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) receive(line);
        if (done) { receive(buffer); break; }
      }
      if (!answer.trim()) throw new Error("No explanation was returned for this match.");
      if (completed && !abort.signal.aborted) {
        window.__lovableEvents?.track?.("project.ai_explanation_generated");
      }
    } catch (e) {
      if (abort.signal.aborted) setStopped(true);
      else { setError(e instanceof Error ? e.message : "Match analysis is unavailable."); abort.abort(); }
    } finally { setRunning(false); controller.current = null; }
  };

  return <section className="min-w-0 space-y-4" aria-label="AI match analysis">
    <div className="flex items-center gap-2 text-neon"><Sparkles className="size-5" /><h3 className="font-display text-2xl">Match Talking Points</h3></div>
    {!session ? <Button asChild disabled={authLoading}><Link to="/auth" search={{ redirect: "/" }}>Sign in for AI Analysis</Link></Button> :
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} disabled={running}>{text ? <RefreshCw className="size-4" /> : <Sparkles className="size-4" />}{text ? "Refresh analysis" : "Explain this match"}</Button>
        {running && <Button variant="outline" onClick={() => controller.current?.abort()}><Square className="size-4" />Stop</Button>}
      </div>}
    {snapshot && <p className="text-xs text-muted-foreground">{snapshot.source}{snapshot.updatedAt ? ` · Score snapshot: ${new Date(snapshot.updatedAt).toLocaleString()}` : " · Update time unavailable"}</p>}
    {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</p>}
    {running && <p role="status" className="text-sm text-neon animate-pulse motion-reduce:animate-none">{text ? "Writing analysis…" : reasoning ? "Reviewing match evidence…" : "Preparing match analysis…"}</p>}
    {reasoning && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Analysis notes</summary><p className="mt-2 whitespace-pre-wrap break-words">{reasoning}</p></details>}
    {text && <article ref={article} aria-label="Match explanation" className="whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">{text.split(/(\n\s*\n)/).map((part, index) => {
      const sections: Record<string, string> = {
        "match snapshot": "match_snapshot",
        "what the numbers suggest": "numbers",
        "trends & talking points": "talking_points",
        "limits of this analysis": "limits",
      };
      const section = sections[part.trim().toLowerCase()];
      return <span key={index} data-analysis-section={section}>{part}</span>;
    })}</article>}
    {stopped && <p className="text-xs text-muted-foreground">Analysis stopped. Any partial explanation is shown above.</p>}
    <p className="border-t border-border pt-3 text-xs text-muted-foreground">AI interpretation, not a guaranteed outcome. Missing statistics are not estimated; score snapshots may be delayed.</p>
  </section>;
}