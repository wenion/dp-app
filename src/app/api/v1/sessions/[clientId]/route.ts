"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

import type { Session, SessionRow } from "@/types/session";

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice(7);
}

async function getUserId(
  req: Request,
): Promise<string | NextResponse> {
  const bearer = getBearerToken(req);

  if (bearer) {
    try {
      const payload = jwt.verify(
        bearer,
        process.env.EXTENSION_JWT_SECRET!,
      ) as {
        sub?: string;
        scope?: string;
      };

      if (
        payload.scope !== "extension" ||
        !payload.sub
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }

      return payload.sub;
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      );
    }
  }

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

/**
 * Get one session
 */
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      clientId: string;
    }>;
  },
) {
  const userId = await getUserId(req);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const { clientId } = await params;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    toSession(data),
  );
}

/**
 * Update session
 */
export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      clientId: string;
    }>;
  },
) {
  const userId = await getUserId(req);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const { clientId } = await params;

  const body: Partial<Session> = await req.json();

  const update: Record<string, unknown> = {};

  if (body.name !== undefined) {
    update.name = body.name;
  }

  if (body.startedAt !== undefined) {
    update.started_at = body.startedAt;
  }

  if (body.endedAt !== undefined) {
    update.ended_at = body.endedAt;
  }

  if (body.eventCount !== undefined) {
    update.event_count = body.eventCount;
  }

  if (body.captureState !== undefined) {
    update.capture_state = body.captureState;
  }

  if (body.uploadStatus !== undefined) {
    update.upload_status = body.uploadStatus;
  }

  if (body.urls !== undefined) {
    update.urls = body.urls;
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("sessions")
    .update(update)
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .select()
    .single();

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
    toSession(data as SessionRow),
  );
}