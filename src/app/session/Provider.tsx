import { useMemo, useState } from "react";

import type { Session } from "@/types/session";

import { SessionContext } from "./Context";


export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedSession, setSelectedSession] =
    useState<Session | null>(null);

  const value = useMemo(
    () => ({
      selectedSession,
      setSelectedSession,
    }),
    [selectedSession,]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

