"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from "@/utils/supabase/admin";

import type { Session, SessionRow } from "@/types/session";


const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 5000;
const MAX_PAGE_SIZE = 10000;

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
    .upsert(
      {
        client_id: session.clientId,
        user_id: userId,
        name: session.name ?? null,
        started_at: session.startedAt,
        ended_at: session.endedAt ?? null,
        event_count: session.eventCount ?? 0,
        capture_state: session.captureState,
        upload_status: session.uploadStatus,
        urls: session.urls ?? [],
      },
      {
        onConflict: "client_id",
      },
    )
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
  const statusParam = searchParams.get("status");
  const rangeParam = searchParams.get("range");
  const queryParam = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = Math.max(
    Number(pageParam) || DEFAULT_PAGE,
    1,
  );

  const pageSize = Math.min(
    Math.max(Number(pageSizeParam) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("sessions")
    .select("*", {
      count: "exact",
    })
    .eq("user_id", userId);

  if (
    statusParam === "uploaded" ||
    statusParam === "failed"
  ) {
    query = query.eq(
      "upload_status",
      statusParam
    );
  }

  if (rangeParam && rangeParam !== "all") {
    const now = Date.now();

    switch (rangeParam) {
      case "today": {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        query = query.gte(
          "started_at",
          start.getTime(),
        );
        break;
      }

      case "7d":
        query = query.gte(
          "started_at",
          now - 7 * 24 * 60 * 60 * 1000,
        );
        break;

      case "30d":
        query = query.gte(
          "started_at",
          now - 30 * 24 * 60 * 60 * 1000,
        );
        break;
    }
  }

  if (queryParam?.trim()) {
    query = query.ilike(
      "name",
      `%${queryParam.trim()}%`
    );
  }

  query = query
    .order("started_at", {
      ascending: false,
    })
    .range(from, to);


  const { data, error, count, } = await query;

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

  if (limitParam) {
    return NextResponse.json(
      (data as SessionRow[]).map(toSession),
    );
  }
  return NextResponse.json({
    items: (data as SessionRow[]).map(toSession),
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
    },
  });
}
