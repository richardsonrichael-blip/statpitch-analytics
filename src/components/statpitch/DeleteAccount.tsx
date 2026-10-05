import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";

export function DeleteAccount() {
  const del = useServerFn(deleteMyAccount);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      await del({ data: { confirm: text } });
      try {
        localStorage.removeItem("isProSubscriber");
        localStorage.removeItem("statpitch:upgrade-pending");
      } catch {
        /* ignore */
      }
      await supabase.auth.signOut();
      queryClient.clear();
      navigate({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-destructive/40 bg-surface p-6 card-shadow">
      <h2 className="text-lg font-bold">Delete account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently delete your account, profile, Pro status and payment records stored with us, as described in our
        Privacy Policy. This cannot be undone and any remaining Pro time is forfeited. Paystack keeps its own
        transaction records as required by law.
      </p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-destructive px-4 py-2.5 text-sm font-bold text-destructive"
        >
          <Trash2 className="size-4" /> Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground">
            Type <span className="text-foreground">DELETE</span> to confirm
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            aria-label="Type DELETE to confirm"
          />
          <div className="flex gap-2">
            <button
              disabled={busy || text.trim().toUpperCase() !== "DELETE"}
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Permanently delete
            </button>
            <button
              onClick={() => { setOpen(false); setText(""); setError(null); }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        </div>
      )}
    </section>
  );
}
