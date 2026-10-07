import { Check, Phone, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { openPaystackCheckout } from "@/lib/utils";
import { useProAccess } from "@/hooks/useProAccess";

const free = ["Match fixtures & trend cards", "League standings & team search", "Basic H2H comparison", "Basic win probabilities"];

const tiers = [
  {
    id: "weekly",
    name: "Weekly Pass",
    price: "$5",
    local: "GH₵ 75",
    period: "/7 days",
    perks: ["7 days of AI predictions", "Match probability insights", "Detailed statistical comparisons"],
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
      "Advanced match analytics",
      "Corner & card stat models",
      "AI win probability models",
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
          <DialogTitle className="text-xl">Unlock Pro Analytics</DialogTitle>
          <DialogDescription>
            Unlock AI win probabilities, expected goals insights and detailed team comparisons with Pro.
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

        <a href="tel:0202165004" className="flex items-center justify-center gap-2 text-sm font-bold text-neon hover:underline">
          <Phone className="size-4" /> Need help paying? Call / WhatsApp 0202165004
        </a>
        <p className="text-center text-[11px] text-muted-foreground">
          Pro access activates after payment verification. By subscribing
          you agree to our{" "}
          <Link to="/terms" className="text-neon hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-neon hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
