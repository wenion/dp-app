"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Plus, Search, ShieldBan, Trash2, XCircle } from "lucide-react";

type MatchType = "domain" | "hostname" | "path_prefix";

type SiteBlacklistRecord = {
  id: number;
  domain: string;
  match_type: MatchType;
  path: string | null;
  reason: string | null;
  created_at: string;
};

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  domain: "Domain + subdomains",
  hostname: "Exact hostname",
  path_prefix: "Path prefix",
};

function parseBlacklistUrl(
  input: string,
  matchType: MatchType,
) {
  try {
    const value = input.trim();

    const url = new URL(
      value.includes("://") ? value : `https://${value}`,
    );

    const hostname = url.hostname.toLowerCase();

    const domain =
      matchType === "domain"
        ? hostname.split(".").slice(-2).join(".")
        : hostname;

    return {
      domain,
      path:
        matchType === "path_prefix" && url.pathname !== "/"
          ? url.pathname
          : null,
    };
  } catch {
    return null;
  }
}

export default function SiteBlacklistPage() {
  const [data, setData] = useState<SiteBlacklistRecord[]>([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("domain");
  const [path, setPath] = useState("");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/site-blacklist", {
        cache: "no-store",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Failed to fetch site blacklist.");
      }
      const records: SiteBlacklistRecord[] = await response.json();
      setData(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((item) =>
      [
        item.domain,
        item.match_type,
        MATCH_TYPE_LABELS[item.match_type],
        item.path ?? "",
        item.reason ?? "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [data, search]);

  // Live examples follow the same hostname / path-boundary rules as the extension.
  const rulePreview = useMemo(() => {
    const host = domain.trim().toLowerCase();
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ||
        host.split(".").some((label) => label.startsWith("-") || label.endsWith("-"))) {
      return null;
    }

    const prefix = path.trim().replace(/\/+$/, "");
    if (matchType === "path_prefix" &&
        (!prefix.startsWith("/") || prefix === "/" || prefix.startsWith("//") ||
         prefix.includes("?") || prefix.includes("#"))) {
      return null;
    }

    if (matchType === "domain") {
      return {
        explanation: `Blocks ${host} and every subdomain, at any path.`,
        blocked: [`https://${host}/`, `https://mail.${host}/inbox`],
        allowed: [`https://not-${host}/`],
      };
    }
    if (matchType === "hostname") {
      return {
        explanation: `Blocks only the exact hostname ${host}, at any path.`,
        blocked: [`https://${host}/`, `https://${host}/account`],
        allowed: [`https://sub.${host}/account`],
      };
    }
    return {
      explanation: `Blocks ${prefix} and nested routes on ${host} only.`,
      blocked: [`https://${host}${prefix}`, `https://${host}${prefix}/settings`],
      allowed: [`https://${host}${prefix}-other`, `https://sub.${host}${prefix}`],
    };
  }, [domain, matchType, path]);

  const resetForm = () => {
    setDomain("");
    setMatchType("domain");
    setPath("");
    setReason("");
    setShowForm(false);
  };

  const handleDomainChange = (value: string) => {
    const parsed = parseBlacklistUrl(value, matchType);

    if (parsed) {
      setDomain(parsed.domain);
      setPath(parsed.path ?? "");
    } else {
      setDomain(value);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!domain.trim() || (matchType === "path_prefix" && !path.trim()) || saving) {
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      const response = await fetch("/api/site-blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          match_type: matchType,
          path: matchType === "path_prefix" ? path.trim() : null,
          reason: reason.trim() || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Failed to add blacklist rule.");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SiteBlacklistRecord) => {
    if (deletingId !== null) return;

    const label = `${item.domain}${item.path ?? ""} (${MATCH_TYPE_LABELS[item.match_type]})`;
    if (!window.confirm(`Remove ${label} from the blacklist?`)) return;

    setDeletingId(item.id);
    setError(undefined);
    try {
      const response = await fetch(`/api/site-blacklist/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Failed to remove blacklist rule.");
      }
      setData((previous) => previous.filter((record) => record.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-16">
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-sky-700">Site Blacklist</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage sites that are always excluded from recording.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((previous) => !previous)}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800"
            >
              <Plus size={16} />
              Add Site
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div>
                <label htmlFor="blacklist-match-type" className="mb-2 block text-sm font-medium text-gray-700">
                  Match Type
                </label>
                <select
                  id="blacklist-match-type"
                  value={matchType}
                  onChange={(event) => {
                    setMatchType(event.target.value as MatchType);
                    setPath("");
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-500"
                >
                  <option value="domain">Domain + all subdomains</option>
                  <option value="hostname">Exact hostname only</option>
                  <option value="path_prefix">Specific path + nested routes</option>
                </select>
              </div>

              <div>
                <label htmlFor="blacklist-domain" className="mb-2 block text-sm font-medium text-gray-700">
                  Domain / Hostname
                </label>
                <input
                  id="blacklist-domain"
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  placeholder="Paste a URL or enter a domain"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {matchType === "domain"
                    ? "Blocks this domain and all subdomains."
                    : matchType === "hostname"
                      ? "Blocks only this exact hostname, not its subdomains."
                      : "The path will be matched on this exact hostname only."}
                </p>
              </div>

              {matchType === "path_prefix" && (
                <div>
                  <label htmlFor="blacklist-path" className="mb-2 block text-sm font-medium text-gray-700">
                    Path Prefix
                  </label>
                  <input
                    id="blacklist-path"
                    value={path}
                    onChange={(event) => setPath(event.target.value)}
                    placeholder="e.g. /account"
                    required
                    pattern="/.*"
                    title="Path must begin with /"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    For example, /account also blocks /account/settings.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="blacklist-reason" className="mb-2 block text-sm font-medium text-gray-700">
                  Reason (optional)
                </label>
                <input
                  id="blacklist-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Banking website"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-500"
                />
              </div>

              {/* Live rule preview: updates as the admin edits the rule. */}
              <div
                aria-live="polite"
                className="rounded-lg border border-sky-100 bg-white p-4"
              >
                <h3 className="text-sm font-semibold text-sky-800">
                  Rule Preview
                </h3>
                {rulePreview ? (
                  <div className="mt-2 space-y-3">
                    <p className="text-xs text-gray-600">
                      {rulePreview.explanation}
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="min-w-0 space-y-2">
                        <p className="text-xs font-medium text-green-700">
                          Will be blocked
                        </p>
                        {rulePreview.blocked.map((url) => (
                          <div key={url} className="flex items-start gap-2">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
                            <code className="min-w-0 break-all text-xs text-gray-700">{url}</code>
                          </div>
                        ))}
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Will not be blocked by this rule
                        </p>
                        {rulePreview.allowed.map((url) => (
                          <div key={url} className="flex items-start gap-2">
                            <XCircle size={15} className="mt-0.5 shrink-0 text-gray-400" />
                            <code className="min-w-0 break-all text-xs text-gray-700">{url}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Examples show only this rule; other blacklist rules may also apply.
                      Query parameters do not affect matching.
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    {matchType === "path_prefix"
                      ? "Enter a valid hostname and path prefix (for example /account) to preview matching URLs."
                      : "Enter a valid domain or hostname to preview matching URLs."}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !rulePreview}
                  className="cursor-pointer rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Rule"}
                </button>
              </div>
            </form>
          )}

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search domains, match types, paths, reasons..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-sky-500"
            />
          </div>

          {loading && <p className="text-sm text-gray-500">Loading blacklist...</p>}

          {!loading && !error && data.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
              No blocked sites found.
            </div>
          )}

          {!loading && data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Domain</th>
                    <th className="px-5 py-4">Match Type</th>
                    <th className="px-5 py-4">Path</th>
                    <th className="px-5 py-4">Reason</th>
                    <th className="px-5 py-4">Added</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ShieldBan size={17} className="shrink-0 text-red-500" />
                          <span className="font-medium text-sky-800">{item.domain}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                          {MATCH_TYPE_LABELS[item.match_type]}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-600">{item.path ?? "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{item.reason || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={deletingId !== null}
                          onClick={() => handleDelete(item)}
                          title="Remove from blacklist"
                          aria-label={`Remove ${item.domain}${item.path ?? ""}`}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-500">No matching rules.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
