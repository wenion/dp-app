"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Session, AuthChangeEvent, User } from "@supabase/supabase-js";

import { useIsMobile } from "@/hooks/use-mobile";
import { useMessenger } from "@/components/useMessenger";
import { PopupToExtensionEvent } from "@/config/eventTypes";
import { createClient } from "@/utils/supabase/client";


type PageState = "expanded" | "collapsed";
type ContextType = {
  state: PageState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;

  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  // Auth actions
  signOut: () => Promise<void>;
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

export function ContextProvider({
  children,
  defaultOpen = true,
  onAuthChange,                // optional tap-in for analytics/logging
  initialSession = null,       // optional SSR hydration
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAuthChange?: (event: AuthChangeEvent, session: Session | null) => void;
  initialSession?: Session | null;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();

  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialSession);
  const [error, setError] = useState<string | null>(null);

  // For deduping messages
  const lastUserIdRef = useRef<string | null>(initialSession?.user?.id ?? null);

  const { sendMessage } = useMessenger();

  // 1) Initial session (preload or fetch)
  useEffect(() => {
    let mounted = true;

    async function init() {
      // If caller provided an initial session, trust it and avoid flicker
      if (initialSession) {
        onAuthChange?.("INITIAL_SESSION", initialSession);
        setLoading(false);

        const uid = initialSession.user?.id ?? null;
        if (uid && lastUserIdRef.current !== uid) {
          lastUserIdRef.current = uid;
          sendMessage(PopupToExtensionEvent.USER_LOGIN, initialSession);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) setError(error.message);
        const s = data.session ?? null;

        setSession(s);
        onAuthChange?.("INITIAL_SESSION", s);

        const uid = s?.user?.id ?? null;
        if (uid !== lastUserIdRef.current) {
          lastUserIdRef.current = uid;
          sendMessage(
            uid ? PopupToExtensionEvent.USER_LOGIN : PopupToExtensionEvent.USER_LOGOUT,
            s
          );
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to get session");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [initialSession, onAuthChange, sendMessage]);

  // 2) Subscribe to auth changes
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      onAuthChange?.(event, s);

      const uid = s?.user?.id ?? null;
      if (uid !== lastUserIdRef.current) {
        lastUserIdRef.current = uid;
        sendMessage(
          uid ? PopupToExtensionEvent.USER_LOGIN : PopupToExtensionEvent.USER_LOGOUT,
          s
        );
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [onAuthChange, sendMessage]);

  // Actions
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  }, []);

  const refreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) setError(error.message);
    setSession(data.session ?? null);
  }, []);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  const value = useMemo<ContextType>(
    () => ({
      // UI
      state: isOpen ? "expanded" : "collapsed",
      isOpen,
      setIsOpen,
      toggleSidebar,
      isMobile,
      // Auth
      session,
      user: session?.user ?? null,
      loading,
      error,
      // Actions
      signOut,
      refreshSession,
    }),
    [isOpen, isMobile, session, loading, error, signOut, refreshSession, toggleSidebar]
  );

  return (
    <Context.Provider
      value={value}
    >
      {children}
    </Context.Provider>
  );
}