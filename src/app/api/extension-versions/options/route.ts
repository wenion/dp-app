import { NextResponse } from "next/server";
import { adminContext, apiError } from "@/lib/extension-versions/server";

export async function GET() {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const [{ data: mutation_configs, error: e1 }, { data: blacklist_rules, error: e2 }] = await Promise.all([
    ctx.db.from("mutation_configs").select("id, platform, selectors, created_at").order("created_at", { ascending: false }),
    ctx.db.from("site_blacklist").select("id, domain, match_type, path, reason").order("domain"),
  ]);
  if (e1 || e2) return apiError((e1 ?? e2)!);
  return NextResponse.json({ mutation_configs, blacklist_rules });
}
