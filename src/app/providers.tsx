"use client";

import { ContextProvider } from "@/components/Layouts/page/page-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>{children}</ContextProvider>
  );
}
