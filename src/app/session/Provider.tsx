import { useState } from "react";

import type { Session } from "@/types/session";

import { SessionContext } from "./Context";


export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        setSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

