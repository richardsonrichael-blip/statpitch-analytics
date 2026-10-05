import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { confirm: string }) => {
    if (String(data?.confirm ?? "").trim().toUpperCase() !== "DELETE") {
      throw new Error('Type DELETE to confirm.');
    }
    return { confirm: "DELETE" };
  })
  .handler(async ({ context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: payErr } = await supabaseAdmin.from("payments").delete().eq("user_id", userId);
    if (payErr) throw new Error("Could not remove payment records. Please try again.");
    const { error: profErr } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profErr) throw new Error("Could not remove your profile. Please try again.");
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) throw new Error("Could not delete your account. Please try again.");
    return { ok: true };
  });
