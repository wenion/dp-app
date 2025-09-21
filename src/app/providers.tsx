"use client";

import { PageProvider } from "@/components/Layouts/page/page-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PageProvider>{children}</PageProvider>
  );
}