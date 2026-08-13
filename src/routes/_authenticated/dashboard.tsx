import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BadgeCheck, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProAccess } from "@/hooks/useProAccess";
import { verifyPaystackPayment } from "@/lib/pro.functions";
import { openPaystackCheckout } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => {
    const title = "My Account & Pro Access — StatPitch Analytics";
    const description =
      "Manage your StatPitch Analytics account, confirm your Paystack payment and activate Pro football analytics.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  validateSearch: (search: Record<string, unknown>): { reference?: string } => {
    const reference =
      typeof search["reference"] === "string"
        ? search["reference"]
        : typeof search["trxref"] === "string"
          ? search["trxref"]
          : undefined;
    return reference ? { reference } : {};
  },
  component: AccountPage,
});

function AccountPage() {
  const { reference } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isPro, proSince, loading } = useProAccess();
  const verify = useServerFn(verifyPaystackPayment);

  const [input, setInput] = useState(reference ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const autoRan = useRef(false);

  async function runVerify(ref: string) {
    if (!ref.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await verify({ data: { reference: ref.trim() } });
      setResult({ ok: res.ok, message: res.message });
      if (res.ok) await queryClient.invalidateQueries({ queryKey: ["pro-status"] });
    } catch {
      setResult({ ok: false, message: "Verification failed. Please try again." });
    }
    setBusy(false);
  }

  useEffect(() => {
    if (autoRan.current || !reference || isPro) return;
    autoRan.current = true;
    void runVerify(reference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, isPro]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to dashboard
      </Link>

      <section className="rounded-3xl border border-border bg-surface p-6 card-shadow">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
        <h1 className="mt-1 text-2xl font-bold">{user?.email ?? "Your account"}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {loading ? (
            <span className="stat-pill">Checking plan…</span>
          ) : isPro ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/12 px-3 py-1.5 text-xs font-bold text-neon">
              <BadgeCheck className="size-4" /> Pro active
              {proSince ? ` · since ${new Date(proSince).toLocaleDateString()}` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
              <Lock className="size-4" /> Free plan
            </span>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              queryClient.clear();
              navigate({ to: "/" });
            }}
            className="ml-auto rounded-xl border border-input px-3.5 py-2 text-xs font-semibold transition hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </section>

      {!isPro && (
        <section className="space-y-4 rounded-3xl border border-neon/30 bg-surface p-6 card-shadow glow-ring">
          <div>
            <h2 className="text-lg font-bold">Unlock Pro access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay with Paystack, then paste the payment reference from your receipt below. We verify it with
              Paystack and activate Pro on this account.
            </p>
          </div>

          <button
            onClick={openPaystackCheckout}
            className="w-full rounded-xl bg-neon py-3 text-sm font-bold text-primary-foreground transition hover:bg-neon/90"
          >
            Pay with Paystack — $19/mo
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Payment reference (e.g. T123456789)"
              className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-neon/60"
            />
            <button
              onClick={() => runVerify(input)}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-4 py-2.5 text-sm font-bold text-neon disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Verify payment
            </button>
          </div>

          {result && (
            <p className={`text-xs font-semibold ${result.ok ? "text-neon" : "text-destructive"}`}>
              {result.message}
            </p>
          )}
        </section>
      )}

      {isPro && (
        <section className="rounded-3xl border border-border bg-surface p-6 card-shadow">
          <h2 className="text-lg font-bold">Everything is unlocked</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI predictions, the full value bets table, corner and card models and deep H2H comparisons are live
            on your dashboard.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-neon px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Open the dashboard
          </Link>
        </section>
      )}
    </div>
  );
}
