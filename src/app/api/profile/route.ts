"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient} from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function GET(req: Request) {
  // 1) If called by extension: Authorization: Bearer <extToken>
  const bearer = getBearerToken(req);
  let userId: string | null = null;

  if (bearer) {
    try {
      const payload = jwt.verify(
        bearer,
        process.env.EXTENSION_JWT_SECRET!
      ) as { sub?: string; scope?: string };

      if (payload.scope !== "extension" || !payload.sub) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = payload.sub;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } else {
    // 2) If called by web app: Supabase session cookie
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  // 3) Fetch profile from Supabase using service role
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email,full_name,avatar_url,updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally: if no profile row exists, return minimal info
  if (!data) {
    return NextResponse.json({});
  }

  return NextResponse.json(data);
}
