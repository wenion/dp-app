"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw as RefreshIcon } from "lucide-react";

type ConnectState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "connecting" }
  | { status: "connected"; at: number }
  | { status: "error"; message: string };

function isChromiumWithRuntimeAPI(): boolean {
  // chrome.runtime exists on Chrome/Chromium, but not on most other browsers
  // and not in some privacy-restricted contexts.
  return typeof window !== "undefined" && !!(window as any).chrome?.runtime?.sendMessage;
}

export default function IntegrationsClient({
  extId,
  from,
}: {
  extId: string;
  from: string | null
}) {
  const router = useRouter();
  const [state, setState] = useState<ConnectState>({ status: "idle" });

  const canMessageExtension = isChromiumWithRuntimeAPI();

  async function connectExtension() {
    if (!canMessageExtension) {
      setState({
        status: "error",
        message:
          "Make sure the Chrome extension is installed and enabled, then refresh this page.",
      });
      return;
    }
    if (!extId) {
      setState({
        status: "error",
        message:
          "Missing extension ID.",
      });
      return;
    }

    setState({ status: "connecting" });

    // 1) mint a one-time code (server verifies user via Supabase cookie)
    const r = await fetch("/api/extension/issue-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!r.ok) {
      const data = await r.json().catch(() => null);
      setState({
        status: "error",
        message: data?.error ?? "Issue-code failed",
      });
      return;
    }

    const { code } = (await r.json()) as { code: string };
    if (!code) {
      setState({
        status: "error",
        message: "Invalid response from issue-code API",
      });
      return;
    }

    try {
      (window as any).chrome.runtime.sendMessage(extId, { type: "AUTH_CODE", code });
      setState({ status: "connected", at: Date.now() });
    } catch (e: any) {
      setState({
        status: "error",
        message: e.message || String(e),
      });
    }

    setTimeout(() => router.replace("/"), 5000);
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <div className="m-auto max-w-3xl">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Extension Sign-In</h1>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-500">Extension ID</div>
              <div className="mt-1 font-mono text-xs text-neutral-800 break-all max-w-[240px]">
                {extId || "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-center gap-4 h-36">
                <div className="font-medium">Web Page</div>
                <div className="flex flex-col items-center justify-center max-w-36">
                  <button
                    onClick={connectExtension}
                    disabled={state.status === "connecting" || state.status === "checking" || state.status === "connected"}
                    className="rounded-xl bg-sky-300 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                    title="Click to connect the extension"
                  >
                    <RefreshIcon
                      className={state.status === "connecting" ? "h-8 w-8 animate-spin" : "h-8 w-8"}
                    />
                  </button>
                </div>
                <div className="font-medium">Chrome Extension</div>
              </div>

              <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                <div className="font-medium">Status</div>
                <div className="mt-1">
                  {state.status === "idle" && "Not connected yet."}
                  {state.status === "checking" && "Checking if the extension is installed…"}
                  {state.status === "connecting" && "Requesting a one-time code and sending it to the extension…"}
                  {state.status === "connected" && (
                    <div className="flex flex-col">
                      <span className="flex text-green-500">
                        <b className="text-2xl">Successfully connected </b>
                      </span>
                      <span className="flex items-center justify-center mt-2 text-lg">
                        Redirecting
                        <span className="text-2xl ml-1 flex">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse delay-200">.</span>
                          <span className="animate-pulse delay-400">.</span>
                        </span>
                      </span>
                    </div>
                  )}
                  {state.status === "error" && (
                    <span className="text-red-700">{state.message}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-neutral-500 leading-relaxed">
                Notes:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Uses a one-time code. No password required.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
