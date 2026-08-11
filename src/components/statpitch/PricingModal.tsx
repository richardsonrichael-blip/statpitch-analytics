import { Check, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { openPaystackCheckout } from "@/lib/utils";
import { useProAccess } from "@/hooks/useProAccess";

const free = ["Fixtures & trend cards", "Basic H2H comparison", "Over/Under 2.5 stats", "3 value spots per day"];
const pro = [
  "AI match predictions",
  "Corner & card stat models",
  "Full value bet table + edge alerts",
  "Unlimited H2H comparisons",
  "Live probability updates",
];

export function PricingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, isPro } = useProAccess();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade your edge</DialogTitle>
          <DialogDescription>Pro unlocks AI predictions plus corner and card stat models.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="rounded-2xl border border-neon/40 bg-surface p-5 glow-ring">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-neon">Pro</p>
              <span className="stat-pill">Most popular</span>
            </div>
            <p className="mt-2 text-3xl font-bold">
              $19<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {pro.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-neon" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={openPaystackCheckout}
              className="mt-5 w-full rounded-xl bg-neon py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-neon/90"
            >
              Go Pro
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
