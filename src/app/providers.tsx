"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ContextProvider } from "@/components/Layouts/context";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ContextProvider>{children}</ContextProvider>
    </SessionProvider>
  );
}
