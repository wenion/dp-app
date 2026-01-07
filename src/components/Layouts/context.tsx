"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";


type ContextType = {
  session: Session | null;
  loading: boolean;

  signInWithGoogle: ({
    provider,
    next
  } : {
    provider: Provider;
    next: string
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
};

const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return context;
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!error) {
        setSession(session);
      }

      setLoading(false);
    }

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  // Actions
  const signInWithGoogle = async ({
    provider = "google",
    next,
  }: {
    provider: Provider;
    next: string;
  }) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    return { error: error ?? null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
    }
    setLoading(false);
    return { error: error ?? null };
  };

  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!error)
      setSession(session);
  };

  const value = useMemo<ContextType>(
    () => ({
      // Auth
      session,
      loading,
      signInWithGoogle,
      signOut,
      refreshSession,
    }),
    [session, loading]
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
