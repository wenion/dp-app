"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("extension_link_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Invalid code" }, { status: 400 });
  }

  if (data.used_at) {
    return NextResponse.json({ error: "Code already used" }, { status: 400 });
  }

  const now = new Date();
  if (now > new Date(data.expires_at)) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  await admin
    .from("extension_link_codes")
    .update({ used_at: now.toISOString() })
    .eq("code", code);

  // token will not be saved in DB
  const extToken = jwt.sign(
    { sub: data.user_id, scope: "extension" },
    process.env.EXTENSION_JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token: extToken });
}
