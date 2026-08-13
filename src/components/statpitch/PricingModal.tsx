import { Check, Send, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { openPaystackCheckout } from "@/lib/utils";
import { useProAccess } from "@/hooks/useProAccess";
import { TELEGRAM_VIP_URL } from "@/lib/odds";

const free = ["Match fixtures & trend cards", "League standings & team search", "Basic H2H comparison", "3 value spots per day"];

const tiers = [
  {
    id: "weekly",
    name: "Weekly Pass",
    price: "$5",
    local: "GH₵ 75",
    period: "/7 days",
    perks: ["7 days of AI predictions", "Daily value bets", "Live odds & best-price alerts"],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Pro",
    price: "$15",
    local: "GH₵ 220",
    period: "/month",
    perks: [
      "Full H2H insights & xG metrics",
      "Telegram VIP access",
      "Corner & card stat models",
      "AI Bet Builder slips",
    ],
    popular: true,
  },
];

export function PricingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, isPro } = useProAccess();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade your edge</DialogTitle>
          <DialogDescription>
            Instant activation with Paystack or card — Pro unlocks AI predictions, VIP signals and stat models.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Free</p>
            <p className="mt-2 text-3xl font-bold">$0</p>
            <ul className="mt-4 space-y-2 text-sm">
              {free.map((f) => (
                <li key={f} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0" /> {f}
                </li>
              ))}
              <li className="flex gap-2 text-muted-foreground/70">
                <X className="mt-0.5 size-4 shrink-0" /> AI predictions
              </li>
            </ul>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-5 w-full rounded-xl border border-input py-2.5 text-sm font-semibold"
            >
              Keep free plan
            </button>
          </div>

          {tiers.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl border bg-surface p-5 ${
                t.popular ? "border-neon/40 glow-ring" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    t.popular ? "text-neon" : "text-muted-foreground"
                  }`}
                >
                  {t.name}
                </p>
                {t.popular && <span className="stat-pill">Best value</span>}
              </div>
              <p className="mt-2 text-3xl font-bold">
                {t.price}
                <span className="text-sm font-normal text-muted-foreground">{t.period}</span>
              </p>
              <p className="text-xs text-muted-foreground">or {t.local}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-neon" /> {p}
                  </li>
                ))}
              </ul>

              {isPro ? (
                <p className="mt-5 w-full rounded-xl border border-neon/40 bg-neon/12 py-2.5 text-center text-sm font-bold text-neon">
                  Pro is active
                </p>
              ) : user ? (
                <button
                  onClick={openPaystackCheckout}
                  className={`mt-5 w-full rounded-xl py-2.5 text-sm font-bold transition ${
                    t.popular
                      ? "bg-neon text-primary-foreground hover:bg-neon/90"
                      : "border border-neon/40 text-neon hover:bg-neon/10"
                  }`}
                >
                  Pay with Paystack
                </button>
              ) : (
                <Link
                  to="/auth"
                  search={{ redirect: "/dashboard" }}
                  onClick={() => onOpenChange(false)}
                  className={`mt-5 block w-full rounded-xl py-2.5 text-center text-sm font-bold transition ${
                    t.popular
                      ? "bg-neon text-primary-foreground hover:bg-neon/90"
                      : "border border-neon/40 text-neon hover:bg-neon/10"
                  }`}
                >
                  Sign in to subscribe
                </Link>
              )}
            </div>
          ))}
        </div>

        <a
          href={TELEGRAM_VIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-neon/30 bg-surface py-2.5 text-sm font-bold text-neon transition hover:bg-neon/10"
        >
          <Send className="size-4" /> Join 10,000+ bettors in our VIP Telegram group
        </a>
        <p className="text-center text-[11px] text-muted-foreground">
          Instant activation after payment. 18+ · Bet responsibly.
        </p>
      </DialogContent>
    </Dialog>
  );
}
