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
  if (rawBody.length > 50_000) {
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

  /* ------------------------- Field whitelist -------------------------- */
  const trace = {
    // source & identity
    source: payload.source ?? "unknown",
    session_id: payload.sessionId ?? null,
    user_id: userId,

    // event metadata
    event_type: payload.eventType ?? null,
    event_id: payload.eventId ?? null,
    timestamp: payload.timestamp ?? payload.timeStamp ?? null,

    // DOM / UI context
    url: payload.url ?? null,
    tag: payload.tag ?? null,
    element_type: payload.elementType ?? null,
    name: payload.name ?? null,
    placeholder: payload.placeholder ?? null,
    text_content: payload.textContent ?? null,
    x_path: payload.xpath ?? payload.xPath ?? null,
    container_id: payload.containerId ?? null,

    // geometry
    client_x: payload.clientX ?? null,
    client_y: payload.clientY ?? null,
    width: payload.width ?? null,
    height: payload.height ?? null,

    // value / state
    value_name: payload.valueName ?? null,
    origin_value: payload.originValue ?? null,
    value_type: payload.valueType ?? null,
    value_index: payload.valueIndex ?? null,
    value_label: payload.label ?? null,
    direction: payload.direction ?? null,

    // keyboard
    code: payload.code ?? null,
    key: payload.key ?? null,

    // message & state
    label: payload.label ?? null,
    message: payload.message ?? null,
    event_value: payload.eventValue ?? null,
    event_state: payload.eventState ?? null,
    start_position: payload.startPosition ?? null,
    end_position: payload.endPosition ?? null,

    // attribution
    author: payload.author ?? null,
  };

  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("raw_traces")
    .insert(trace)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally: if no profile row exists, return minimal info
  if (!data) {
    return NextResponse.json({});
  }

  return NextResponse.json(data);
}
