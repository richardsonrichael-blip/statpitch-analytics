import { valueBets } from "@/data/football";
import { openPaystackCheckout } from "@/lib/utils";

export function ValueBetsTab() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-bold">Value spots by model edge</h3>
          <p className="text-xs text-muted-foreground">Model probability vs market implied probability</p>
        </div>
        <button
          onClick={openPaystackCheckout}
          className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon"
        >
          Unlock AI predictions
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Match</th>
              <th className="px-3 py-3 font-semibold">Market</th>
              <th className="px-3 py-3 font-semibold">Model</th>
              <th className="px-3 py-3 font-semibold">Implied</th>
              <th className="px-3 py-3 font-semibold">Edge</th>
              <th className="px-5 py-3 font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {valueBets.map((v) => (
              <tr key={v.match + v.market} className="border-t border-border/70">
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{v.match}</p>
                  <p className="text-[11px] text-muted-foreground">{v.league}</p>
                </td>
                <td className="px-3 py-3.5 text-muted-foreground">{v.market}</td>
                <td className="px-3 py-3.5 font-bold tabular-nums">{v.model}%</td>
                <td className="px-3 py-3.5 tabular-nums text-muted-foreground">{v.implied}%</td>
                <td className="px-3 py-3.5 font-bold text-neon tabular-nums">+{v.edge}%</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      v.confidence === "High"
                        ? "bg-neon/15 text-neon"
                        : v.confidence === "Medium"
                          ? "bg-warn/15 text-warn"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {v.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
