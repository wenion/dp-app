import { NextResponse } from "next/server";

import {
  createClient as createServerClient,
} from "@/utils/supabase/server";

import {
  createAdminClient,
} from "@/utils/supabase/admin";

export async function getAdminUserId():
  Promise<string | NextResponse> {

  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 },
    );
  }

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  return user.id;
}
