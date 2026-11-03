"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, LockKeyhole, Save, Search } from "lucide-react";
import type { BlacklistOption, MutationOption, VersionRecord } from "@/lib/extension-versions/types";

type Options = { mutation_configs: MutationOption[]; blacklist_rules: BlacklistOption[] };
async function readJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function VersionEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({ mutation_configs: [], blacklist_rules: [] });
  const [detail, setDetail] = useState<VersionRecord | null>(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [configIds, setConfigIds] = useState<number[]>([]);
  const [blacklistIds, setBlacklistIds] = useState<number[]>([]);
  const [configQuery, setConfigQuery] = useState("");
  const [blacklistQuery, setBlacklistQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(id);
  const locked = editing && detail?.status !== "draft";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [opt, existing] = await Promise.all([
        fetch("/api/extension-versions/options", { cache: "no-store" }).then(readJson) as Promise<Options>,
        id ? fetch(`/api/extension-versions/${id}`, { cache: "no-store" }).then(readJson) as Promise<VersionRecord> : Promise.resolve(null),
      ]);
      setOptions(opt);
      if (existing) {
        setDetail(existing);
        setVersion(existing.version);
        setDescription(existing.description ?? "");
        setConfigIds(existing.config_snapshot.mutation_configs.map(c => c.source_id));
        setBlacklistIds(existing.config_snapshot.site_blacklist.map(r => r.source_id));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const missingSources = useMemo(() => Boolean(detail && !locked && (
    detail.config_snapshot.mutation_configs.some(x => !options.mutation_configs.some(o => o.id === x.source_id)) ||
    detail.config_snapshot.site_blacklist.some(x => !options.blacklist_rules.some(o => o.id === x.source_id))
  )), [detail, options, locked]);

  function toggleConfig(item: MutationOption) {
    setConfigIds(prev => {
      if (prev.includes(item.id)) return prev.filter(x => x !== item.id);
      const samePlatformIds = options.mutation_configs.filter(x => x.platform === item.platform).map(x => x.id);
      return [...prev.filter(x => !samePlatformIds.includes(x)), item.id];
    });
  }

  function toggleBlacklist(id: number) {
    setBlacklistIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      const payload = { ...(!editing ? { version } : {}), description, mutation_config_ids: configIds, blacklist_rule_ids: blacklistIds };
      const result = await readJson(await fetch(editing ? `/api/extension-versions/${id}` : "/api/extension-versions", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      if (!editing) router.push(`/admin/extension-versions/${result.id}`);
      else await load();
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setBusy(false); }
  }

  async function publish() {
    if (!id || !window.confirm(`Publish ${version}? The saved snapshot will become read-only.`)) return;
    setBusy(true); setError(null);
    try {
      await readJson(await fetch(`/api/extension-versions/${id}/publish`, { method: "POST" }));
      await load(); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-16">
        <section className="max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Back to versions" onClick={() => router.push("/admin/extension-versions")} className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><ArrowLeft size={17}/></button>
              <div><h2 className="text-xl font-semibold text-sky-700">{editing ? `Extension ${version || id}` : "New Extension Version"}</h2><p className="mt-1 text-sm text-gray-500">{locked ? "Saved historical snapshot · read only" : "Select configurations to copy into this version"}</p></div>
            </div>
            <div className="flex gap-2">
              {!locked && !loading && <button type="button" disabled={busy || missingSources || !/^\d+\.\d+\.\d+$/.test(version)} onClick={() => void save()} className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50"><Save size={16}/>{busy ? "Saving..." : "Save Draft"}</button>}
              {editing && detail?.status === "draft" && <button type="button" disabled={busy || missingSources} onClick={() => void publish()} className="flex cursor-pointer items-center gap-2 rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"><LockKeyhole size={16}/>Publish Saved Draft</button>}
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {missingSources && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Some selected source records were removed. Reselect available ones before saving this draft. The saved JSON snapshot is still preserved.</p>}
          {loading ? <p className="text-sm text-gray-500">Loading...</p> : <>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700">Version<input value={version} disabled={editing} onChange={e => setVersion(e.target.value)} placeholder="5.6.3" className="block w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" /></label>
              <div className="space-y-2 text-sm font-medium text-gray-700">Status<div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 capitalize">{detail?.status ?? "draft"}</div></div>
            </div>
            <label className="block space-y-2 text-sm font-medium text-gray-700">Description<textarea rows={2} disabled={locked} value={description} onChange={e => setDescription(e.target.value)} className="block w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" /></label>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-sky-800">Mutation Configs</h3><span className="text-xs text-gray-500">{locked ? detail?.config_snapshot.mutation_configs.length : configIds.length} selected</span></div><div className="relative mt-3"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={configQuery} onChange={e => setConfigQuery(e.target.value)} placeholder="Search platform" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm" /></div></div>
                <div className="max-h-[400px] space-y-2 overflow-y-auto p-3">
                  {locked ? detail?.config_snapshot.mutation_configs.filter(c => c.platform.toLowerCase().includes(configQuery.toLowerCase())).map(c => <div key={c.source_id} className="rounded-lg bg-gray-50 p-3"><div className="flex items-center justify-between"><span className="font-medium capitalize text-sky-800">{c.platform}</span><Link href={`/admin/mutation-configs/${c.source_id}/edit`} className="flex items-center gap-1 text-xs text-sky-700">Source #{c.source_id}<ExternalLink size={13}/></Link></div><pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-all text-xs text-gray-600">{JSON.stringify(c.selectors, null, 2)}</pre></div>) : options.mutation_configs.filter(c => `${c.platform} ${c.id}`.toLowerCase().includes(configQuery.toLowerCase())).map(c => <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-sky-50"><input type="checkbox" checked={configIds.includes(c.id)} onChange={() => toggleConfig(c)} className="accent-sky-700"/><div><p className="text-sm font-medium capitalize text-gray-800">{c.platform}</p><p className="text-xs text-gray-400">Source Config #{c.id}</p></div></label>)}
                </div>
                {!locked && <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">Selecting a config replaces other selections for the same platform.</p>}
              </div>
              <div className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-sky-800">Site Blacklist</h3><span className="text-xs text-gray-500">{locked ? detail?.config_snapshot.site_blacklist.length : blacklistIds.length} selected</span></div><div className="relative mt-3"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={blacklistQuery} onChange={e => setBlacklistQuery(e.target.value)} placeholder="Search domain or path" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm" /></div></div>
                <div className="max-h-[400px] space-y-2 overflow-y-auto p-3">
                  {locked ? detail?.config_snapshot.site_blacklist.filter(r => `${r.domain}${r.path ?? ""}`.toLowerCase().includes(blacklistQuery.toLowerCase())).map(r => <div key={r.source_id} className="rounded-lg bg-gray-50 p-3"><div className="flex items-center justify-between gap-2"><span className="break-all text-sm font-medium text-gray-800">{r.domain}{r.path ?? ""}</span><Link href="/admin/site-blacklist" title={`Open site blacklist; original rule #${r.source_id}`} className="flex shrink-0 items-center gap-1 text-xs text-sky-700">Source #{r.source_id}<ExternalLink size={13}/></Link></div><p className="mt-1 text-xs text-gray-500">{r.match_type} · {r.reason ?? "No reason"}</p></div>) : options.blacklist_rules.filter(r => `${r.domain}${r.path ?? ""} ${r.id}`.toLowerCase().includes(blacklistQuery.toLowerCase())).map(r => <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-sky-50"><input type="checkbox" checked={blacklistIds.includes(r.id)} onChange={() => toggleBlacklist(r.id)} className="accent-sky-700"/><div><p className="break-all text-sm font-medium text-gray-800">{r.domain}{r.path ?? ""}</p><p className="text-xs text-gray-400">{r.match_type} · Source #{r.id}</p></div></label>)}
                </div>
              </div>
            </div>
            {detail && <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><h3 className="font-semibold text-sky-800">Saved JSON Snapshot</h3><p className="mt-1 text-xs text-gray-500">This is what was saved in the database, not a live query of the sources.</p><pre className="mt-3 max-h-[400px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3 text-xs text-gray-700">{JSON.stringify(detail.config_snapshot, null, 2)}</pre></div>}
          </>}
        </section>
      </main>
    </div>
  );
}
