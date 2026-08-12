import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Paystack webhook listener. Paystack signs the raw body with HMAC SHA512 using
 * the account secret key and sends it in `x-paystack-signature`.
 * On `charge.success` the paying account is marked as a Pro subscriber.
 */
export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) {
          console.error("[paystack-webhook] PAYSTACK_SECRET_KEY is not configured");
          return new Response("Not configured", { status: 503 });
        }

        const raw = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(raw).digest("hex");
        const got = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (got.length !== exp.length || !timingSafeEqual(got, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          data?: {
            reference?: string;
            amount?: number;
            currency?: string;
            paid_at?: string | null;
            status?: string;
            customer?: { email?: string };
          };
        };
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (event.event !== "charge.success" || event.data?.status !== "success") {
          return new Response("ignored");
        }

        const email = event.data.customer?.email?.trim().toLowerCase();
        const reference = event.data.reference;
        if (!email || !reference) return new Response("ignored");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .ilike("email", email)
          .maybeSingle();

        if (!profile) {
          console.error("[paystack-webhook] no account for payer email");
          return new Response("no matching account", { status: 202 });
        }

        const { error: paymentError } = await supabaseAdmin.from("payments").upsert(
          {
            user_id: profile.id,
            reference,
            amount: typeof event.data.amount === "number" ? event.data.amount / 100 : null,
            currency: event.data.currency ?? null,
            status: "success",
            paid_at: event.data.paid_at ?? new Date().toISOString(),
          },
          { onConflict: "reference" },
        );
        if (paymentError) console.error("[paystack-webhook] payment upsert failed", paymentError);

        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ is_pro: true, pro_since: new Date().toISOString() })
          .eq("id", profile.id);
        if (profileError) {
          console.error("[paystack-webhook] pro unlock failed", profileError);
          return new Response("update failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
