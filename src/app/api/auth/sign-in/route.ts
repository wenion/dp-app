
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function safeNext(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const next = safeNext(
    request.nextUrl.searchParams.get("next"),
  );

  const origin = process.env.APP_ORIGIN!;

  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", next);

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
      },
    });

  if (error || !data.url) {
    return NextResponse.json(
      { error: "Failed to start Google sign-in" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.url);
}
