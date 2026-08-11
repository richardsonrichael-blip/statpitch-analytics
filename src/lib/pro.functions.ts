import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("email, full_name, is_pro, pro_since")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) {
      console.error("[pro] profile read failed", error);
    }

    return {
      isPro: Boolean(data?.is_pro),
      proSince: data?.pro_since ?? null,
      email: data?.email ?? null,
      fullName: data?.full_name ?? null,
    };
  });

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reference: string }) => {
    const reference = String(data?.reference ?? "").trim();
    if (reference.length < 4 || reference.length > 120) {
      throw new Error("Enter a valid payment reference.");
    }
    return { reference };
  })
  .handler(async ({ data, context }) => {
    const { verifyAndUnlockPro } = await import("./paystack.server");
    return verifyAndUnlockPro(data.reference, context.userId);
  });
