import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import type { Session } from "@/types/session";


type SessionContextValue = {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
};

export const SessionContext =
  createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession must be used within SessionProvider"
    );
  }

  return context;
}

export function useSelectedSession() {
  const { sessions } = useSession();

  const searchParams = useSearchParams();

  const clientId = searchParams.get("clientId");

  return useMemo(() => {
    if (!clientId) {
      return null;
    }

    return (
      sessions.find(
        (s) => s.clientId === clientId
      ) ?? null
    );
  }, [sessions, clientId]);
}