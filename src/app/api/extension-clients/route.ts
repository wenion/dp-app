import { NextResponse } from "next/server";

import { getAdminUserId } from "@/utils/supabase/getAdminUserId";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await getAdminUserId();

  if (adminId instanceof NextResponse) {
    return adminId;
  }

  const db = await createAdminClient();

  const rows = [];
  const pageSize = 500;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db
      .from("user_extension_clients")
      .select(`
        id,
        user_id,
        client_id,
        extension_version,
        config_version,
        last_seen_at,
        created_at
      `)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(
        "Failed to fetch extension clients:",
        error,
      );

      return NextResponse.json(
        { error: "Failed to fetch extension clients" },
        { status: 500 },
      );
    }

    rows.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  // Fetch profiles
  const emailMap = new Map<string, string>();

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db
      .from("profiles")
      .select("id, email")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(
        "Failed to fetch profiles:",
        error,
      );

      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 },
      );
    }

    for (const profile of data ?? []) {
      if (profile.email) {
        emailMap.set(profile.id, profile.email);
      }
    }

    if (!data || data.length < pageSize) {
      break;
    }
  }

  // Merge emails into extension clients
  const clients = rows.map((row) => ({
    ...row,
    email: emailMap.get(row.user_id) ?? null,
  }));

  return NextResponse.json(clients, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}