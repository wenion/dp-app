
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        session: null,
        profile: null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Failed to fetch profile:",
      profileError,
    );

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      session: {
        user: {
          id: user.id,
          email: user.email ?? null,
          name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
          avatar_url:
            user.user_metadata?.avatar_url ??
            user.user_metadata?.picture ??
            null,
        },
      },
      profile,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
