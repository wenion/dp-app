"use server";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from "@/utils/supabase/admin";

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

/** Remove undefined fields so Supabase insert is clean */
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}

export async function POST(req: Request) {
  /* ------------------------ Content-Type guard ------------------------ */
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 415 }
    )
  }

  /* ------------------------ Payload size guard ------------------------ */
  const rawBody = await req.text()
  if (rawBody.length > 200_000) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    )
  }

  let payload : any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  if (!Array.isArray(payload)) {
    return NextResponse.json({ error: 'Expected an array of traces' }, { status: 400 });
  }

  if (payload.length === 0) {
    return NextResponse.json({ ids: [] });
  }

  /* ----------------------------- Auth -------------------------------- */
  // 1) If called by extension: Authorization: Bearer <extToken>
  const bearer = getBearerToken(req);
  let userId: string | null = null;

  if (bearer) {
    try {
      const payload = jwt.verify(
        bearer,
        process.env.EXTENSION_JWT_SECRET!
      ) as {
        sub?: string;
        scope?: string
      };

      if (payload.scope !== "extension" || !payload.sub) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = payload.sub;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } else {
    // 2) If called by web app: Supabase session cookie
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  /* ------------------------- Transform traces -------------------------- */
  const traces = payload.map((p: any, index: number) =>
    compact({
      source: p.source ?? "unknown",
      session_id: p.sessionId ?? null,
      user_id: userId,

      // event metadata
      event_type: p.eventType ?? null,
      event_id: p.eventId ?? null,
      timestamp: p.timestamp ?? p.timeStamp ?? null,

      // DOM / UI context
      url: p.url ?? null,
      tag: p.tag ?? null,
      element_type: p.elementType ?? null,
      name: p.name ?? null,
      placeholder: p.placeholder ?? null,
      text_content: p.textContent ?? null,
      x_path: p.xpath ?? p.xPath ?? null,
      container_id: p.containerId ?? null,

      // geometry
      client_x: p.clientX ?? null,
      client_y: p.clientY ?? null,
      width: p.width ?? null,
      height: p.height ?? null,

      // value / state
      value_name: p.valueName ?? null,
      origin_value: p.originValue ?? null,
      value_type: p.valueType ?? null,
      value_index: p.valueIndex ?? null,
      value_label: p.label ?? null,
      direction: p.direction ?? null,

      // keyboard
      code: p.code ?? null,
      key: p.key ?? null,

      // message & state
      label: p.label ?? null,
      message: p.message ?? null,
      event_value: p.eventValue ?? null,
      event_state: p.eventState ?? null,
      start_position: p.startPosition ?? null,
      end_position: p.endPosition ?? null,

      // attribution
      author: p.author ?? null,
    })
  );

  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("raw_traces")
    .insert(traces)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Supabase does NOT guarantee order → fix it
  const ids = traces.map((_, i) => data?.[i]?.id).filter(Boolean);

  return NextResponse.json({ ids });
}
