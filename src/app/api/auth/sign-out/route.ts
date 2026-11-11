
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  // Only allow requests from this application's origin.
  const origin = request.headers.get("origin");

  if (
    !origin ||
    origin !== process.env.APP_ORIGIN
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
