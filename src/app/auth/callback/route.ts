
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  const rawNext = searchParams.get("next") ?? "/";

  // Only allow safe relative paths.
  const next =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.includes("\\")
      ? rawNext
      : "/";

  // Use a trusted application origin.
  const origin = process.env.APP_ORIGIN!;

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = new URL(next, origin);

      const response =
        NextResponse.redirect(redirectUrl);

      response.headers.set(
        "Cache-Control",
        "no-store",
      );

      return response;
    }
  }

  return NextResponse.redirect(
    new URL("/auth/auth-code-error", origin),
  );
}
