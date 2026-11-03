
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import type {
  MutationConfig,
} from "@/types/mutation-config";

type MutationConfigRecord = {
  id: number;
  platform: string;
  selectors: MutationConfig["selectors"];
  created_at: string;
};

const SELECTOR_GROUPS = [
  { key: "human", label: "Human" },
  { key: "ai", label: "AI" },
  { key: "messageId", label: "Message ID" },
  { key: "eventId", label: "Event ID" },
] as const;

export default function MutationConfigsPage() {
  const router = useRouter();
  const [data, setData] = useState<MutationConfigRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    new Set(),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/mutation-configs");

      if (!response.ok) {
        throw new Error("Failed to fetch mutation configs.");
      }

      const configs: MutationConfigRecord[] =
        await response.json();

      setData(configs);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleAdd = () => {
    router.push("/admin/mutation-configs/new");
  };

  const handleEdit = (config: MutationConfigRecord) => {
    router.push(
      `/admin/mutation-configs/${config.id}/edit`,
    );
  };

  const handleDelete = async (
    config: MutationConfigRecord,
  ) => {
    const confirmed = window.confirm(
      `Delete mutation config #${config.id} (${config.platform})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/mutation-configs/${config.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete mutation config.");
      }

      setExpandedIds((previous) => {
        const next = new Set(previous);
        next.delete(config.id);
        return next;
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unknown error",
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-16">
        <section className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-sky-700">
                Mutation Configs
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage DOM selectors for AI platforms.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800"
            >
              <Plus size={16} />
              Add Config
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-sm text-gray-500">
              Loading configs...
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Empty */}
          {!loading && !error && data.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
              No mutation configs found.
            </div>
          )}

          {/* Config List */}
          {!loading && !error && (
            <div className="space-y-3">
              {data.map((config) => {
                const expanded = expandedIds.has(config.id);

                return (
                  <div
                    key={config.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-sky-500/50 hover:shadow-md"
                  >
                    {/* Collapsible Header */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggleExpanded(config.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                      >
                        {expanded ? (
                          <ChevronDown
                            size={18}
                            className="shrink-0 text-gray-400"
                          />
                        ) : (
                          <ChevronRight
                            size={18}
                            className="shrink-0 text-gray-400"
                          />
                        )}

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold capitalize text-sky-800">
                            {config.platform}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            ID: {config.id}
                            {" · "}
                            {new Date(
                              config.created_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </button>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(config)}
                          title="Edit config"
                          aria-label={`Edit config ${config.id}`}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(config)}
                          title="Delete config"
                          aria-label={`Delete config ${config.id}`}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expanded && (
                      <div className="border-t border-gray-100 px-5 py-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          {SELECTOR_GROUPS.map(({ key, label }) => (
                            <div key={key} className="min-w-0">
                              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                                {label}
                              </p>

                              <div className="space-y-2">
                                {(config.selectors[key] ?? []).map(
                                  (selector, index) => (
                                    <div
                                      key={index}
                                      className="overflow-x-auto rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700"
                                    >
                                      <code className="whitespace-nowrap font-mono">
                                        {selector}
                                      </code>
                                    </div>
                                  ),
                                )}

                                {!config.selectors[key]?.length && (
                                  <p className="text-xs italic text-gray-400">
                                    No selectors
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
