"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ContextProvider } from "@/components/Layouts/context";
import { StatusMessenger } from "@/components/Layouts/sessionManagement";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <StatusMessenger />
      <ContextProvider>{children}</ContextProvider>
    </SessionProvider>
  );
}
