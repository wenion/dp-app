import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getAdminUserId } from "@/utils/supabase/getAdminUserId";
import { createAdminClient } from "@/utils/supabase/admin";

import ProfilesTable from "./profiles-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 1000;

export default async function ProfilesPage() {
  // 1. Verify admin access
  const result = await getAdminUserId();

  if (result instanceof NextResponse) {
    redirect("/");
  }

  const supabase = await createAdminClient();

  // 2. Fetch profiles
  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select("id, email, role");

  if (profilesError) {
    throw new Error(
      `Failed to fetch profiles: ${profilesError.message}`,
    );
  }

  // 3. Fetch all sessions
  const sessions = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "id, user_id, name, event_count, started_at",
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(
        `Failed to fetch sessions: ${error.message}`,
      );
    }

    sessions.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  // 4. Fetch all used extension link codes
  const linkCodes = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("extension_link_codes")
      .select("code, user_id, used_at")
      .not("used_at", "is", null)
      .order("used_at", { ascending: false })
      .order("code", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(
        `Failed to fetch link codes: ${error.message}`,
      );
    }

    linkCodes.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  // 7. Group sessions by user
  const sessionsByUser = new Map<
    string,
    typeof sessions
  >();

  for (const session of sessions) {
    const list =
      sessionsByUser.get(session.user_id) ?? [];

    list.push(session);

    sessionsByUser.set(session.user_id, list);
  }

  // 8. Get latest used_at for each user
  const usedAtByUser = new Map<string, string>();

  for (const code of linkCodes) {
    if (
      code.used_at &&
      !usedAtByUser.has(code.user_id)
    ) {
      usedAtByUser.set(
        code.user_id,
        code.used_at,
      );
    }
  }

  // 9. Build profile rows
  const rows = (profiles ?? []).map((profile) => {
    const userSessions =
      sessionsByUser.get(profile.id) ?? [];

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role ?? "undefined",
      usedAt: usedAtByUser.get(profile.id) ?? null,
      sessions: userSessions,
    };
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-white px-6 py-6 md:px-16">
      {/* Fixed Page Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-xl font-semibold text-sky-700">
          Profiles
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View user profiles, roles, sessions, and trace counts.
        </p>
      </div>

      {/* Scrollable Table */}
      <ProfilesTable profiles={rows} />
    </div>
  );
}