"use server";

import { NextResponse } from "next/server";
import crypto from "crypto";

import { createClient as createServerClient} from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 60_000).toISOString();

  // service role insert
  const admin = createAdminClient();

  const { error } = await admin
    .from("extension_link_codes")
    .insert({
      code,
      user_id: user.id,
      expires_at: expiresAt,
    });

  if (error) {
    console.error("Insert extension_link_codes failed", error);
    return NextResponse.json(
      { error: "Failed to create link code" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ code, expires_at: expiresAt });
  res.headers.set("Cache-Control", "no-store"); // IMPORTANT for one-time codes
  return res;
}
