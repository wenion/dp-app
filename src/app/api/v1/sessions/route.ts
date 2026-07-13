"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from "@/utils/supabase/admin";

import type { Session, SessionRow } from "@/types/session";

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function getUserId(req: Request): Promise<string | NextResponse> {
  const bearer = getBearerToken(req);

  if (bearer) {
    try {
      const payload = jwt.verify(
        bearer,
        process.env.EXTENSION_JWT_SECRET!
      ) as { sub?: string; scope?: string };

      if (payload.scope !== "extension" || !payload.sub) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return payload.sub;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user.id;
}

function toSession(row: SessionRow): Session {
  return {
    // ref: row.id,

    clientId: row.client_id,

    name: row.name ?? undefined,

    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,

    eventCount: row.event_count,

    captureState: row.capture_state,

    uploadStatus: row.upload_status,

    urls: row.urls ?? [],
  };
}

export async function POST(req: Request) {
  const userId = await getUserId(req);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const session: Session = await req.json();

  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("sessions")
    .upsert({
      client_id: session.clientId,
      user_id: userId,
      name: session.name ?? null,
      started_at: session.startedAt,
      ended_at: session.endedAt ?? null,
      event_count: session.eventCount ?? 0,
      capture_state: session.captureState,
      upload_status: session.uploadStatus,
      urls: session.urls ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(toSession(data));
}


/**
 * List Sessions
 */
export async function GET(req: Request) {
  const userId = await getUserId(req);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const admin = createAdminClient();

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");

  let query = admin
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", {
      ascending: false,
    });

  if (limitParam !== null) {
    const limit = Math.min(
      Math.max(parseInt(limitParam, 10) || 0, 1),
      20,
    );

    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    (data as SessionRow[]).map(toSession),
  );
}
