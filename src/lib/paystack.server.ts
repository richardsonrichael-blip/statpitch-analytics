type VerifyResult = {
  ok: boolean;
  status: "success" | "failed" | "not_found" | "claimed" | "unconfigured";
  message: string;
};

/**
 * Verifies a Paystack transaction reference server-side and, when the payment
 * succeeded, flips the caller's profile to Pro.
 */
export async function verifyAndUnlockPro(reference: string, userId: string): Promise<VerifyResult> {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret) {
    return {
      ok: false,
      status: "unconfigured",
      message: "Payment verification is not configured yet. Please try again later.",
    };
  }

  let payload: {
    status?: boolean;
    message?: string;
    data?: { status?: string; amount?: number; currency?: string; paid_at?: string | null };
  };

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    payload = (await res.json()) as typeof payload;
  } catch (error) {
    console.error("[paystack] verify request failed", error);
    return { ok: false, status: "not_found", message: "Could not reach the payment provider." };
  }

  if (!payload?.status || !payload.data) {
    return {
      ok: false,
      status: "not_found",
      message: "We couldn't find that payment reference. Double-check it and try again.",
    };
  }

  const tx = payload.data;
  if (tx.status !== "success") {
    return {
      ok: false,
      status: "failed",
      message: `That payment is not complete (status: ${tx.status ?? "unknown"}).`,
    };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("user_id")
    .eq("reference", reference)
    .maybeSingle();

  if (existing && existing.user_id !== userId) {
    return {
      ok: false,
      status: "claimed",
      message: "This payment reference is already linked to another account.",
    };
  }

  const { error: paymentError } = await supabaseAdmin.from("payments").upsert(
    {
      user_id: userId,
      reference,
      amount: typeof tx.amount === "number" ? tx.amount / 100 : null,
      currency: tx.currency ?? null,
      status: "success",
      paid_at: tx.paid_at ?? new Date().toISOString(),
    },
    { onConflict: "reference" },
  );
  if (paymentError) {
    console.error("[paystack] payment record failed", paymentError);
    return { ok: false, status: "failed", message: "Could not record the payment. Try again." };
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ is_pro: true, pro_since: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) {
    console.error("[paystack] pro unlock failed", profileError);
    return { ok: false, status: "failed", message: "Could not unlock Pro. Try again." };
  }

  return { ok: true, status: "success", message: "Payment verified — Pro access unlocked." };
}
