import { NextResponse } from "next/server";
import { adminContext, apiError, parseId } from "@/lib/extension-versions/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  // Single conditional UPDATE: publishes the already saved snapshot without rereading sources.
  const { data, error } = await ctx.db.from("extension_versions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id).eq("status", "draft")
    .select("id, status, published_at").maybeSingle();
  if (error) return apiError(error);
  if (!data) return NextResponse.json({ error: "Draft not found or already published" }, { status: 409 });
  return NextResponse.json(data);
}
