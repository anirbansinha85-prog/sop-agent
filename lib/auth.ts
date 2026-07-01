import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

// Hook: tells the app whether someone is logged in, and updates live on login/logout.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

// The three raw SDK calls — this is all "authentication" really is:
export const signIn  = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signUp  = (email: string, password: string) => supabase.auth.signUp({ email, password });
export const signOut = () => supabase.auth.signOut();
