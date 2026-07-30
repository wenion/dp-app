"use server";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  const { refreshToken } = await req.json().catch(() => ({}));

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Missing refresh token" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const { data, error } = await admin
    .from("extension_refresh_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }

  if (data.revoked_at) {
    return NextResponse.json(
      { error: "Refresh token revoked" },
      { status: 401 }
    );
  }

  const now = new Date();

  if (now > new Date(data.expires_at)) {
    return NextResponse.json(
      { error: "Refresh token expired" },
      { status: 401 }
    );
  }

  //
  // Rotation
  //
  const newRefreshToken = crypto
    .randomBytes(48)
    .toString("base64url");

  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const refreshExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  //
  // revoke old token
  //
  const { error: revokeError } = await admin
    .from("extension_refresh_tokens")
    .update({
      revoked_at: now.toISOString(),
    })
    .eq("id", data.id)
    .is("revoked_at", null);

  if (revokeError) {
    return NextResponse.json(
      { error: "Failed to revoke refresh token" },
      { status: 500 }
    );
  }

  //
  // create new refresh token
  //

  const { error: insertError } = await admin
    .from("extension_refresh_tokens")
    .insert({
      user_id: data.user_id,
      token_hash: newTokenHash,
      expires_at: refreshExpiresAt.toISOString(),
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create refresh token" },
      { status: 500 }
    );
  }

  //
  // issue new access token
  //

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

  return NextResponse.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
}
