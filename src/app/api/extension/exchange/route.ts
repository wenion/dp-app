"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

  const accessToken = jwt.sign(
    {
      sub: data.user_id,
      scope: "extension",
    },
    process.env.EXTENSION_JWT_SECRET!,
    {
      expiresIn: "7d",
      // issuer: "trace-extension",
      // audience: "trace-extension",
    }
  );

  const refreshToken = crypto.randomBytes(48).toString("base64url");

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  const { error: refreshError } = await admin
    .from("extension_refresh_tokens")
    .insert({
      token_hash: tokenHash,
      user_id: data.user_id,
      expires_at: refreshExpiresAt.toISOString(),
    });

  if (refreshError) {
    return NextResponse.json(
      { error: "Failed to create refresh token" },
      { status: 500 }
    );
  }

  const { error: updateError } = await admin
    .from("extension_link_codes")
    .update({ used_at: now.toISOString() })
    .eq("code", code);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to consume code" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    token: accessToken,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
}
