"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePageMessenger } from "@/components/usePageMessenger";

export function StatusMessenger() {
  const { status, data: session } = useSession(); // "loading" | "authenticated" | "unauthenticated"
  const { sendMessage } = usePageMessenger();
  const prev = useRef<typeof status | null>(null);

  useEffect(() => {
    if (status === "loading") return; // wait until resolved

    // Only react to *transitions* (avoid double-firing on re-renders)
    if (prev.current !== status) {
      if (status === "authenticated") {
        // You can include user info if helpful
        sendMessage("LOGIN", session);
      } else if (status === "unauthenticated") {
        sendMessage("LOGOUT", session);
      }
      prev.current = status;
    }
  }, [status, session?.user?.name, session?.user?.email, sendMessage]);

  return null;
}