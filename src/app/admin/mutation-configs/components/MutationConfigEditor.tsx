
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  ScanSearch,
  Trash2,
} from "lucide-react";

import type { MutationConfig } from "@/types/mutation-config";

type Selectors = MutationConfig["selectors"];

type MutationConfigRecord = {
  id: number;
  platform: string;
  selectors: Selectors;
  created_at: string;
};

type Props = {
  configId?: string;
};

const EMPTY_SELECTORS = (): Selectors => ({
  human: [],
  ai: [],
  messageId: [],
  eventId: [],
});

const SELECTOR_GROUPS = [
  { key: "human", label: "Human" },
  { key: "ai", label: "AI" },
  { key: "messageId", label: "Message ID" },
  { key: "eventId", label: "Event ID" },
] as const;

type SelectorKey = keyof Selectors;

export default function MutationConfigEditor({
  configId,
}: Props) {
  const router = useRouter();
  const isEdit = configId !== undefined;

  const [platform, setPlatform] = useState("chatgpt");
  const [selectors, setSelectors] = useState<Selectors>(
    EMPTY_SELECTORS,
  );
  const [domInput, setDomInput] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  // Load existing config
  const fetchConfig = useCallback(async (
    signal?: AbortSignal,
  ) => {
    if (!configId) return;

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/mutation-configs", {
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mutation configs.");
      }

      const configs: MutationConfigRecord[] =
        await response.json();

      const config = configs.find(
        item => String(item.id) === configId,
      );

      if (!config) {
        throw new Error("Mutation config not found.");
      }

      if (signal?.aborted) return;

      setPlatform(config.platform);
      setSelectors({
        human: [...config.selectors.human],
        ai: [...config.selectors.ai],
        messageId: [...config.selectors.messageId],
        eventId: [...config.selectors.eventId],
      });
    } catch (err) {
      if (signal?.aborted) return;

      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [configId]);

  useEffect(() => {
    if (!isEdit) return;

    const controller = new AbortController();
    fetchConfig(controller.signal);

    return () => controller.abort();
  }, [fetchConfig, isEdit]);

  // Add selector
  const addSelector = (key: SelectorKey) => {
    setSelectors(prev => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  // Update selector
  const updateSelector = (
    key: SelectorKey,
    index: number,
    value: string,
  ) => {
    setSelectors(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  // Remove selector
  const removeSelector = (
    key: SelectorKey,
    index: number,
  ) => {
    setSelectors(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  // Save as a new record
  const handleSave = async () => {
    if (saving || loading || error) return;

    setSaving(true);
    setError(undefined);
    setSuccess(undefined);

    const normalizedSelectors = {
      human: selectors.human.map(s => s.trim()).filter(Boolean),
      ai: selectors.ai.map(s => s.trim()).filter(Boolean),
      messageId: selectors.messageId.map(s => s.trim()).filter(Boolean),
      eventId: selectors.eventId.map(s => s.trim()).filter(Boolean),
    };

    try {
      const response = await fetch("/api/mutation-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: platform.trim(),
          selectors: normalizedSelectors,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.error ?? "Failed to save mutation config.",
        );
      }

      setSuccess("Mutation config saved successfully.");
      router.push("/admin/mutation-configs");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/mutation-configs");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h2 className="text-xl font-semibold text-sky-700">
              {isEdit ? "Edit Mutation Config" : "New Mutation Config"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {isEdit
                ? `Editing config #${configId} · Saving creates a new version`
                : "Create a new DOM mutation configuration"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading config...
        </div>
      ) : (
        <>
          {/* Two-column editor */}
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">

            {/* Left: Selectors */}
            <div className="flex min-h-0 flex-col border-r border-gray-200">
              <div className="shrink-0 border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-sky-800">
                  Selectors
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Edit CSS selectors for each message type.
                </p>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                {/* Platform */}
                <div>
                  <label
                    htmlFor="platform"
                    className="mb-2 block text-xs font-medium text-gray-600"
                  >
                    Platform
                  </label>

                  <input
                    id="platform"
                    type="text"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    placeholder="chatgpt"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-sky-500"
                  />
                </div>

                {/* Selector Groups */}
                {SELECTOR_GROUPS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                        {label}
                      </h4>

                      <button
                        type="button"
                        onClick={() => addSelector(key)}
                        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectors[key].map((selector, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={selector}
                            onChange={e =>
                              updateSelector(
                                key,
                                index,
                                e.target.value,
                              )
                            }
                            placeholder="CSS selector..."
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-700 outline-none transition-colors focus:border-sky-500"
                          />

                          <button
                            type="button"
                            onClick={() => removeSelector(key, index)}
                            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Remove selector"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}

                      {selectors[key].length === 0 && (
                        <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                          No selectors
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !!error}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Config"}
                </button>
              </div>
            </div>

            {/* Right: DOM Editor */}
            <div className="flex min-h-[400px] flex-col">
              <div className="shrink-0 border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-sky-800">
                  DOM / XML Input
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Paste HTML or XML for future AI analysis.
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-6">
                <textarea
                  value={domInput}
                  onChange={e => setDomInput(e.target.value)}
                  placeholder={`Paste HTML / XML here...

<div data-message-role="user">
  <p>Hello</p>
</div>`}
                  spellCheck={false}
                  className="min-h-[300px] w-full flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-700 outline-none transition-colors focus:border-sky-500"
                />
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400">
                  AI recognition coming soon
                </p>

                <button
                  type="button"
                  disabled
                  title="AI recognition is not implemented yet"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 opacity-60"
                >
                  <ScanSearch size={16} />
                  Recognize
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
