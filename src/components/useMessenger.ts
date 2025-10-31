"use client";

import { useEffect, useCallback } from "react";
import { MESSENGER_CONFIG } from "@/config/messenger";

export function useMessenger() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== MESSENGER_CONFIG.TARGET_ORIGIN) return;
      if (e.source !== window) return;

      const data = e.data as { source?: string; type?: string; payload?: unknown } | null;
      if (data?.source !== MESSENGER_CONFIG.EXT_TAG) return;

    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Function you can call anywhere
  const sendMessage = useCallback((type: string, payload: unknown) => {
    const TARGET_ORIGIN = MESSENGER_CONFIG.TARGET_ORIGIN;
    console.log("Sending message to", TARGET_ORIGIN, { type, payload });
    window.postMessage({ source: MESSENGER_CONFIG.PAGE_TAG, type, payload }, TARGET_ORIGIN);
  }, []);

  return { sendMessage };
}
