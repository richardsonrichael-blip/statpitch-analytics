import { useState } from "react";
import { teams } from "@/data/football";
import { ProLock } from "@/components/statpitch/ProLock";

const freeMetrics = [
  { key: "goalsScored", label: "Goals Scored", max: 60, suffix: "" },
  { key: "possession", label: "Possession", max: 100, suffix: "%" },
] as const;

const proMetrics = [
  { key: "cleanSheets", label: "Clean Sheets", max: 20, suffix: "" },
  { key: "avgCorners", label: "Avg Corners", max: 10, suffix: "" },
] as const;

type Metric = { key: "goalsScored" | "possession" | "cleanSheets" | "avgCorners"; label: string; max: number; suffix: string };
type Team = (typeof teams)[string];

function TeamSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-neon/50"
    >
      {Object.keys(teams).map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

function MetricRow({ metric, a, b }: { metric: Metric; a: Team; b: Team }) {
  const av = a[metric.key] as number;
  const bv = b[metric.key] as number;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold tabular-nums">
          {av}
          {metric.suffix}
        </span>
        <span className="uppercase tracking-widest text-muted-foreground">{metric.label}</span>
        <span className="font-bold tabular-nums">
          {bv}
          {metric.suffix}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-neon" style={{ width: `${(av / metric.max) * 100}%` }} />
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-neon-dim" style={{ width: `${(bv / metric.max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export function H2HTab() {
  const [left, setLeft] = useState("Arsenal");
  const [right, setRight] = useState("Manchester City");
  const a = teams[left]!;
  const b = teams[right]!;

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 card-shadow sm:p-7">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <TeamSelect value={left} onChange={setLeft} />
        <span className="text-center text-xs font-bold uppercase tracking-widest text-neon">vs</span>
        <TeamSelect value={right} onChange={setRight} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[a, b].map((t) => (
          <div key={t.name} className="flex items-center gap-1.5">
            {t.form.map((r, i) => (
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
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {freeMetrics.map((m) => (
          <MetricRow key={m.key} metric={m} a={a} b={b} />
        ))}
      </div>

      <div className="mt-6">
        <ProLock feature="Corner & card stat models" cta="Unlock">
          <div className="space-y-5 rounded-2xl border border-border bg-background p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Deep comparison
            </p>
            {proMetrics.map((m) => (
              <MetricRow key={m.key} metric={m} a={a} b={b} />
            ))}
            <MetricRow
              metric={{ key: "avgCorners", label: "Corner model edge", max: 10, suffix: "" }}
              a={a}
              b={b}
            />
          </div>
        </ProLock>
      </div>
    </div>
  );
}
