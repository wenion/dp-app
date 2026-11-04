
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  Monitor,
  RefreshCw,
  Search,
} from "lucide-react";

type ExtensionClient = {
  id: number;
  user_id: string;
  email: string | null;
  client_id: string;
  extension_version: string;
  config_version: string | null;
  last_seen_at: string;
  created_at: string;
};

type SortKey =
  | "id"
  | "extension_version"
  | "config_version"
  | "last_seen_at"
  | "created_at";

type SortDirection = "asc" | "desc";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function shortId(value: string): string {
  return value.length > 16
    ? `${value.slice(0, 8)}...${value.slice(-4)}`
    : value;
}

export default function ExtensionClientsPage() {
  const [clients, setClients] = useState<ExtensionClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(
    "last_seen_at",
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const fetchClients = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(
        "/api/extension-clients",
        {
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load clients (${response.status})`,
        );
      }

      return (await response.json()) as ExtensionClient[];
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchClients(controller.signal);

        if (!controller.signal.aborted) {
          setClients(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load extension clients",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [fetchClients]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to refresh extension clients",
      );
    } finally {
      setRefreshing(false);
    }
  }, [fetchClients]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  }

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients
      .filter((client) => {
        if (!query) return true;

        return [
          client.email ?? "",
          client.user_id,
          client.client_id,
          client.extension_version,
          client.config_version ?? "",
        ].some((value) =>
          value.toLowerCase().includes(query),
        );
      })
      .sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (sortKey === "id") {
          const result = Number(aValue) - Number(bValue);
          return sortDirection === "asc"
            ? result
            : -result;
        }

        const result = String(aValue ?? "").localeCompare(
          String(bValue ?? ""),
          undefined,
          { numeric: true },
        );

        return sortDirection === "asc"
          ? result
          : -result;
      });
  }, [clients, search, sortKey, sortDirection]);

  const uniqueUsers = useMemo(
    () => new Set(clients.map((client) => client.user_id)).size,
    [clients],
  );

  const mismatchedClients = useMemo(
    () =>
      clients.filter(
        (client) =>
          client.config_version !== null &&
          client.extension_version !== client.config_version,
      ).length,
    [clients],
  );

  function SortHeader({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) {
    return (
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="inline-flex items-center gap-1 hover:text-sky-600"
      >
        {label}
        <ArrowDownUp className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-sky-600" />
            <h1 className="text-2xl font-semibold">
              Extension Clients
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor registered Chrome Extension installations
            and their reported versions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Registered Clients
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {clients.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Unique Users
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {uniqueUsers}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Version Mismatches
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {mismatchedClients}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search user, client or version..."
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500"
            />
          </div>

          <span className="text-sm text-gray-500">
            {filteredClients.length} clients
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 border-b bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <SortHeader label="ID" column="id" />
                </th>
                <th className="px-4 py-3 font-medium">
                  User Email
                </th>
                <th className="px-4 py-3 font-medium">
                  Client ID
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortHeader
                    label="Extension Version"
                    column="extension_version"
                  />
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortHeader
                    label="Config Version"
                    column="config_version"
                  />
                </th>
                <th className="px-4 py-3 font-medium">
                  Status
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortHeader
                    label="Last Seen"
                    column="last_seen_at"
                  />
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortHeader
                    label="Created"
                    column="created_at"
                  />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredClients.map((client) => {
                const status =
                  client.config_version === null
                    ? "Not reported"
                    : client.extension_version ===
                        client.config_version
                      ? "Matched"
                      : "Different";

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {client.id}
                    </td>

                    <td
                      className="px-4 py-3 text-sm"
                      title={client.user_id}
                    >
                      {client.email ?? "Unknown"}
                    </td>

                    <td
                      className="px-4 py-3 font-mono text-xs"
                      title={client.client_id}
                    >
                      {shortId(client.client_id)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                        {client.extension_version}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {client.config_version ? (
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {client.config_version}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          status === "Matched"
                            ? "bg-green-50 text-green-700"
                            : status === "Different"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(client.last_seen_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filteredClients.length === 0 && (
            <div className="p-12 text-center text-sm text-gray-500">
              No extension clients found.
            </div>
          )}

          {loading && (
            <div className="p-12 text-center text-sm text-gray-500">
              Loading extension clients...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
