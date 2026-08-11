import { Lock, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { openPaystackCheckout } from "@/lib/utils";
import { useProAccess } from "@/hooks/useProAccess";

const perks = [
  "Value bet edges, ROI projections and confidence tiers",
  "xG breakdowns, BTTS depth and Over/Under 2.5 probabilities",
  "Interactive H2H radar and deep team metric comparisons",
  "Corner and card stat models with live probability updates",
];

export function ProUpsellModal({
  open,
  onOpenChange,
  feature,
  signedIn,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  feature?: string;
  signedIn: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-neon/30 bg-popover">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-neon" /> Unlock {feature ?? "Pro analytics"}
          </DialogTitle>
          <DialogDescription>
            Pro turns StatPitch into a full model desk — here's what opens up instantly.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 rounded-2xl border border-border bg-surface p-4 text-sm">
          {perks.map((p) => (
            <li key={p} className="flex gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-neon" /> {p}
            </li>
          ))}
        </ul>

        <p className="text-3xl font-bold">
          $19<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>

        {signedIn ? (
          <button
            onClick={openPaystackCheckout}
            className="w-full rounded-xl bg-neon py-3 text-sm font-bold text-primary-foreground transition hover:bg-neon/90"
          >
            Get Pro Access
          </button>
        ) : (
          <Link
            to="/auth"
            search={{ redirect: "/dashboard" }}
            onClick={() => onOpenChange(false)}
            className="block w-full rounded-xl bg-neon py-3 text-center text-sm font-bold text-primary-foreground transition hover:bg-neon/90"
          >
            Sign in to get Pro Access
          </Link>
        )}
        <p className="text-center text-[11px] text-muted-foreground">
          Paid securely with Paystack. Pro unlocks on your account after verification.
        </p>
      </DialogContent>
    </Dialog>
  );
}

/** Blurs its children behind a locked overlay until the user has Pro. */
export function ProLock({
  feature,
  cta = "Upgrade to Pro to Unlock",
  children,
}: {
  feature: string;
  cta?: string;
  children: ReactNode;
}) {
  const { isPro, user, loading } = useProAccess();
  const [open, setOpen] = useState(false);

  if (isPro) return <>{children}</>;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl">
        <div aria-hidden className="pointer-events-none select-none blur-[7px] saturate-50">
          {children}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[2px]"
          aria-label={`${cta} ${feature}`}
        >
          <span className="mx-4 max-w-sm rounded-2xl border border-neon/40 bg-surface/95 px-5 py-5 text-center card-shadow">
            <span className="mx-auto grid size-10 place-items-center rounded-xl bg-neon/12 text-neon glow-ring">
              <Lock className="size-5" />
            </span>
            <span className="mt-3 block text-sm font-bold">{feature}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {loading ? "Checking your plan…" : "Pro members only"}
            </span>
            <span className="mt-4 block rounded-xl bg-neon px-4 py-2.5 text-xs font-bold text-primary-foreground">
              {cta} {feature}
            </span>
          </span>
        </button>
      </div>
      <ProUpsellModal open={open} onOpenChange={setOpen} feature={feature} signedIn={Boolean(user)} />
    </>
  );
}
