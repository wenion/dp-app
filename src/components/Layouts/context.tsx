
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Provider } from "@supabase/supabase-js";

type AppSession = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
  };
};

type Profile = {
  id: string;
  role: string;
};

type ContextType = {
  session: AppSession | null;
  profile: Profile | null;
  loading: boolean;

  signInWithGoogle: ({
    provider,
    next,
  }: {
    provider: Provider;
    next: string;
  }) => Promise<{ error: Error | null }>;

  signOut: () => Promise<{ error: Error | null }>;

  refreshSession: () => Promise<void>;
};

type SessionResponse = {
  session: AppSession | null;
  profile: Profile | null;
};

const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "useAppContext must be used within a ContextProvider",
    );
  }

  return context;
}

export function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] =
    useState<AppSession | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  // Fetch authenticated user and profile from Next.js.
  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch session: ${response.status}`,
        );
      }

      const data: SessionResponse =
        await response.json();

      setSession(data.session);
      setProfile(data.profile);
    } catch (error) {
      console.error(
        "Failed to refresh session:",
        error,
      );

      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state.
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  // Start Google OAuth through the server.
  const signInWithGoogle = useCallback(
    async ({
      provider,
      next,
    }: {
      provider: Provider;
      next: string;
    }): Promise<{ error: Error | null }> => {
      if (provider !== "google") {
        return {
          error: new Error("Unsupported OAuth provider"),
        };
      }

      const params = new URLSearchParams({
        next,
      });

      window.location.assign(
        `/api/auth/sign-in?${params.toString()}`,
      );

      return { error: null };
    },
    [],
  );

  // Sign out through the server.
  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Failed to sign out"),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<ContextType>(
    () => ({
      session,
      profile,
      loading,
      signInWithGoogle,
      signOut,
      refreshSession,
    }),
    [
      session,
      profile,
      loading,
      signInWithGoogle,
      signOut,
      refreshSession,
    ],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
