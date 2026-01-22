"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  /* -------------------- auth -------------------- */

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { data, error } = await supabase
    .from("traces")
    .select("event_type", { count: "estimated" })
    .order("created_at", { ascending: false })
    .eq("user_id", user.id)
    .not("event_type", "is", null);

  // temparary
  const uniqueEventTypes = [
    ...new Set(
      (data ?? [])
        .map(d => d.event_type)
        .filter(Boolean)
    ),
  ];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const eventTypes = uniqueEventTypes;

  return NextResponse.json({ data: eventTypes });
}
