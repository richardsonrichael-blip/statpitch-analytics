import { BadgeCheck, Lock, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useProAccess } from "@/hooks/useProAccess";
import { openPaystackCheckout } from "@/lib/utils";

const perks = [
  "AI score & scoreline predictions",
  "Deep H2H, xG, corner & card models",
  "Full value-bet table + daily edges",
  "VIP Telegram signals access",
];

/** Conversion rail: membership tiers, proof numbers and the upgrade action. */
export function ProRail({ onSeeAll }: { onSeeAll: () => void }) {
  const { user, isPro } = useProAccess();

  return (
    <section className="rounded-2xl border border-neon/30 bg-surface p-6 card-shadow">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-2xl text-neon">GO PRO TODAY</h3>
        {isPro ? (
          <span className="stat-pill">
            <BadgeCheck className="size-3.5" /> Active
          </span>
        ) : (
          <span className="stat-pill">Instant access</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neon/20 bg-background p-4 transition hover:border-neon/60">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Weekly</p>
          <p className="text-2xl font-extrabold tabular-nums">$5</p>
          <p className="text-[10px] text-neon">GH₵ 75 · 7 days</p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-neon p-4 text-primary-foreground">
          <div className="absolute -right-4 -top-1 rotate-45 bg-background/20 px-4 py-0.5 text-[8px] font-bold">
            BEST
          </div>
          <p className="text-[10px] font-bold uppercase opacity-70">Monthly</p>
          <p className="text-2xl font-extrabold tabular-nums">$15</p>
          <p className="text-[10px] font-bold">GH₵ 220 · save 25%</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <Lock className="size-3 shrink-0 text-neon" /> {p}
          </li>
        ))}
      </ul>

      {isPro ? (
        <Link
          to="/dashboard"
          className="mt-5 block rounded-xl border border-neon/40 bg-neon/10 py-3 text-center text-xs font-bold uppercase tracking-wider text-neon"
        >
          Manage membership
        </Link>
      ) : user ? (
        <button
          onClick={openPaystackCheckout}
          className="mt-5 w-full rounded-xl bg-neon py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
        >
          Unlock Pro now
        </button>
      ) : (
        <Link
          to="/auth"
          search={{ redirect: "/dashboard" }}
          className="mt-5 block w-full rounded-xl bg-neon py-3 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
        >
          Unlock Pro now
        </Link>
      )}

      <button
        onClick={onSeeAll}
        className="mt-2 w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        Compare free vs Pro
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <TrendingUp className="size-3.5 text-neon" /> 10,000+ members
        </p>
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-neon" /> Secure Paystack
        </p>
      </div>
    </section>
  );
}
