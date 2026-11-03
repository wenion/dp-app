import "server-only";

import { NextResponse } from "next/server";
import { getAdminUserId } from "@/utils/supabase/getAdminUserId";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ConfigSnapshot, MutationOption, BlacklistOption } from "./types";

export async function adminContext() {
  const userId = await getAdminUserId();
  if (userId instanceof NextResponse) return { response: userId } as const;
  const db = await createAdminClient();
  return { db, userId } as const;
}

export function apiError(error: { message: string; code?: string }, fallback = 500) {
  const status = error.code === "23505" ? 409 : error.code === "23503" ? 409 : fallback;
  return NextResponse.json({ error: error.message }, { status });
}

export function parseId(raw: string) {
  const id = Number(raw);
  return /^\d+$/.test(raw) && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parseInput(value: unknown, creating: boolean) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JSON object");
  const v = value as Record<string, unknown>;
  if (creating && (typeof v.version !== "string" || !/^\d+\.\d+\.\d+$/.test(v.version))) {
    throw new Error("Version must use major.minor.patch, e.g. 5.6.3");
  }
  if (v.description != null && typeof v.description !== "string") throw new Error("Invalid description");
  for (const name of ["mutation_config_ids", "blacklist_rule_ids"] as const) {
    if (!Array.isArray(v[name]) || !v[name].every(x => Number.isSafeInteger(x) && x > 0)) {
      throw new Error(`${name} must be an array of positive integer IDs`);
    }
    if (new Set(v[name]).size !== v[name].length) throw new Error(`Duplicate IDs in ${name}`);
  }
  return {
    version: creating ? v.version as string : undefined,
    description: (v.description as string | null | undefined) ?? null,
    mutationIds: v.mutation_config_ids as number[],
    blacklistIds: v.blacklist_rule_ids as number[],
  };
}

// Fetch originals on the server; never trust selector or domain content from the browser.
// A single JSONB column is written in one INSERT/UPDATE after these reads.
export async function buildSnapshot(
  db: Awaited<ReturnType<typeof createAdminClient>>,
  mutationIds: number[],
  blacklistIds: number[],
): Promise<ConfigSnapshot> {
  const [{ data: configs, error: cError }, { data: rules, error: bError }] = await Promise.all([
    mutationIds.length
      ? db.from("mutation_configs").select("id, platform, selectors").in("id", mutationIds)
      : Promise.resolve({ data: [] as MutationOption[], error: null }),
    blacklistIds.length
      ? db.from("site_blacklist").select("id, domain, match_type, path, reason").in("id", blacklistIds)
      : Promise.resolve({ data: [] as BlacklistOption[], error: null }),
  ]);
  if (cError) throw new Error(cError.message);
  if (bError) throw new Error(bError.message);
  if ((configs?.length ?? 0) !== mutationIds.length) throw new Error("A selected Mutation Config no longer exists");
  if ((rules?.length ?? 0) !== blacklistIds.length) throw new Error("A selected Blacklist Rule no longer exists");

  const configById = new Map((configs ?? []).map(x => [x.id, x]));
  const ruleById = new Map((rules ?? []).map(x => [x.id, x]));
  const platforms = mutationIds.map(id => configById.get(id)!.platform);
  if (new Set(platforms).size !== platforms.length) throw new Error("Only one Mutation Config per platform is allowed");
  return {
    mutation_configs: mutationIds.map(id => {
      const x = configById.get(id)!;
      return { source_id: x.id, platform: x.platform, selectors: x.selectors as Record<string, unknown> };
    }),
    site_blacklist: blacklistIds.map(id => {
      const x = ruleById.get(id)!;
      return { source_id: x.id, domain: x.domain, match_type: x.match_type as BlacklistOption["match_type"], path: x.path, reason: x.reason };
    }),
  };
}
