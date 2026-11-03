import { NextResponse } from "next/server";
import { adminContext, apiError, buildSnapshot, parseInput } from "@/lib/extension-versions/server";

export async function GET() {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  const { data, error } = await ctx.db
    .from("extension_versions")
    .select("id, version, description, status, config_snapshot, created_at, published_at")
    .order("created_at", { ascending: false });
  if (error) return apiError(error);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const ctx = await adminContext();
  if ("response" in ctx) return ctx.response;
  try {
    const input = parseInput(await req.json(), true);
    const snapshot = await buildSnapshot(ctx.db, input.mutationIds, input.blacklistIds);
    const { data, error } = await ctx.db.from("extension_versions").insert({
      version: input.version,
      description: input.description,
      config_snapshot: snapshot,
      status: "draft",
      created_by: ctx.userId,
    }).select("id").single();
    if (error) return apiError(error);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
