import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getProStatus } from "@/lib/pro.functions";
import {
  consumePaymentSuccessParam,
  readLocalPro,
  readUpgradePending,
  setUpgradePending,
} from "@/lib/local-pro";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: (session?.user ?? null) as User | null, loading };
}

export function useLocalPro() {
  const [state, setState] = useState({ localPro: false, pending: false });

  useEffect(() => {
    consumePaymentSuccessParam();
    const sync = () => setState({ localPro: readLocalPro(), pending: readUpgradePending() });
    sync();
    window.addEventListener("statpitch:pro-change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("statpitch:pro-change", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return state;
}

export function useProAccess() {
  const { user, loading } = useAuthSession();
  const fetchStatus = useServerFn(getProStatus);
  const { localPro, pending } = useLocalPro();

  const query = useQuery({
    queryKey: ["pro-status", user?.id ?? "anon"],
    queryFn: () => fetchStatus(),
    enabled: Boolean(user),
    staleTime: 30_000,
    // While a checkout is in flight, poll so the webhook's Pro activation
    // unlocks the UI without a page refresh.
    refetchInterval: (q) => (pending && !q.state.data?.isPro ? 4_000 : false),
    refetchOnWindowFocus: true,
  });

  const confirmedPro = Boolean(query.data?.isPro);

  // Stop polling once the account is confirmed Pro on the server.
  useEffect(() => {
    if (confirmedPro && pending) setUpgradePending(false);
  }, [confirmedPro, pending]);

  return {
    user,
    isPro: confirmedPro || localPro,
    confirmedPro,
    proSince: query.data?.proSince ?? null,
    loading: loading || (Boolean(user) && query.isLoading),
  };
}
