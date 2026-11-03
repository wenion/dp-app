"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, RefreshCcw, Trash2 } from "lucide-react";
import type { VersionRecord } from "@/lib/extension-versions/types";

export default function ExtensionVersionsPage() {
  const router = useRouter();
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/extension-versions", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not load versions");
      setVersions(json);
    } catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function remove(version: VersionRecord) {
    if (!confirm(`Delete draft ${version.version}?`)) return;
    setBusyId(version.id); setError(null);
    try {
      const res = await fetch(`/api/extension-versions/${version.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not delete draft");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setBusyId(null); }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-16">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-sky-700">Extension Versions</h2>
              <p className="mt-1 text-sm text-gray-500">Manage versioned snapshots of mutation configs and site blacklist rules.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void load()} aria-label="Refresh versions" className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><RefreshCcw size={17}/></button>
              <button type="button" onClick={() => router.push("/admin/extension-versions/new")} className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"><Plus size={16}/>New Version</button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-gray-500">Loading versions...</p>}
          {!loading && versions.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">No extension versions yet.</div>}
          {!loading && versions.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-4">Version</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Mutation Configs</th><th className="px-5 py-4 text-right">Blacklist Rules</th><th className="px-5 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {versions.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4"><button className="cursor-pointer text-left" onClick={() => router.push(`/admin/extension-versions/${v.id}`)}><span className="font-semibold text-sky-800">{v.version}</span><p className="mt-1 max-w-[260px] truncate text-xs text-gray-400">{v.description ?? "No description"}</p></button></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${v.status === "draft" ? "bg-amber-50 text-amber-700" : v.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{v.status}</span></td>
                      <td className="px-5 py-4 text-right tabular-nums">{v.config_snapshot?.mutation_configs?.length ?? 0}</td>
                      <td className="px-5 py-4 text-right tabular-nums">{v.config_snapshot?.site_blacklist?.length ?? 0}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">{new Date(v.created_at).toLocaleString()}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" aria-label={`View ${v.version}`} onClick={() => router.push(`/admin/extension-versions/${v.id}`)} className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-sky-700"><ChevronRight size={16}/></button>{v.status === "draft" && <button type="button" disabled={busyId !== null} aria-label={`Delete ${v.version}`} onClick={() => void remove(v)} className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-red-600 disabled:opacity-50"><Trash2 size={16}/></button>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
