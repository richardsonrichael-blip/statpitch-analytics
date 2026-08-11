import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getProStatus } from "@/lib/pro.functions";

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

export function useProAccess() {
  const { user, loading } = useAuthSession();
  const fetchStatus = useServerFn(getProStatus);

  const query = useQuery({
    queryKey: ["pro-status", user?.id ?? "anon"],
    queryFn: () => fetchStatus(),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  return {
    user,
    isPro: Boolean(query.data?.isPro),
    proSince: query.data?.proSince ?? null,
    loading: loading || (Boolean(user) && query.isLoading),
  };
}
