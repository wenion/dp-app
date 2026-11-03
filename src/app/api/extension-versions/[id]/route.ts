import { NextResponse } from "next/server";
import { adminContext, apiError, buildSnapshot, parseId, parseInput } from "@/lib/extension-versions/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const { data, error } = await ctx.db.from("extension_versions")
    .select("id, version, description, status, config_snapshot, created_at, published_at")
    .eq("id", id).maybeSingle();
  if (error) return apiError(error);
  if (!data) return NextResponse.json({ error: "Version not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, context: RouteContext) {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  try {
    const input = parseInput(await req.json(), false);
    const snapshot = await buildSnapshot(ctx.db, input.mutationIds, input.blacklistIds);
    const { data, error } = await ctx.db.from("extension_versions")
      .update({ description: input.description, config_snapshot: snapshot })
      .eq("id", id).eq("status", "draft")
      .select("id").maybeSingle();
    if (error) return apiError(error);
    if (!data) return NextResponse.json({ error: "Draft not found or already published" }, { status: 409 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const { data, error } = await ctx.db.from("extension_versions")
    .delete().eq("id", id).eq("status", "draft")
    .select("id").maybeSingle();
  if (error) return apiError(error);
  if (!data) return NextResponse.json({ error: "Draft not found or already published" }, { status: 409 });
  return NextResponse.json({ success: true });
}
