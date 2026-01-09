"use server";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_SORT_COLUMNS = new Set([
  'id',
  'created_at',
  'url',
  'page_type',
  'author',
  'message',
  'cursor_position',
  'end_position',
  'event_type',
  'event_value',
  'tag_name',
  'element_text',
  'x_path',
  'container_id',
  'event_state',
  'event_id',
  'event_time',
])

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const MIN_SEARCH_LENGTH = 2

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  /* -------------------------- Query params ----------------------------- */

  const searchParams = request.nextUrl.searchParams

  const pageIndexRaw = Number(searchParams.get('pageIndex'))
  const pageSizeRaw = Number(searchParams.get('pageSize'))

  const pageIndex = Number.isFinite(pageIndexRaw) && pageIndexRaw >= 0
    ? pageIndexRaw
    : 0

  const pageSize = Number.isFinite(pageSizeRaw)
    ? Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE

  const sortByRaw = searchParams.get('sortBy') || 'created_at'
  const sortBy = ALLOWED_SORT_COLUMNS.has(sortByRaw) ? sortByRaw : 'created_at'

  const sortDesc = searchParams.get('sortDesc') === 'true'

  const globalFilterRaw = (searchParams.get('globalFilter') || '').trim()

  // Calculate range
  const from = pageIndex * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('traces')
    .select(
      `
      id,
      created_at,
      event_type,
      event_value,
      url,
      page_type,
      author,
      message,
      cursor_position,
      end_position,
      tag_name,
      element_text,
      x_path,
      offset_x,
      offset_y,
      width,
      height,
      container_id,
      event_state,
      event_id,
      event_time
      `,
      { count: 'exact' }
    )
    .eq("user_id", user.id)
    .order(sortBy, { ascending: !sortDesc, nullsFirst: false,})
    .order('id', { ascending: false })
    .range(from, to)

  // Apply global search
  if (globalFilterRaw.length >= MIN_SEARCH_LENGTH) {
    const search = globalFilterRaw.replace(/[%_]/g, '\\$&')
    query = query.or(
      [
        `event_type.ilike.%${search}%`,
        `event_value.ilike.%${search}%`,
        `url.ilike.%${search}%`,
        `page_type.ilike.%${search}%`,
        `author.ilike.%${search}%`,
        `message.ilike.%${search}%`,
        `tag_name.ilike.%${search}%`,
        `element_text.ilike.%${search}%`,
        `x_path.ilike.%${search}%`,
        `container_id.ilike.%${search}%`,
        `event_state.ilike.%${search}%`,
        `event_id.ilike.%${search}%`,
      ].join(',')
    )
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data,
    count,
    pageIndex,
    pageSize,
    sortBy,
    sortDesc,
    globalFilter: globalFilterRaw,
  })
}

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

  let body: any
  try {
    body = JSON.parse(rawBody)
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
  const {
    event_type,
    url,
    page_type,
    author,
    message,
    cursor_position,
    end_position,
    event_value,
    tag_name,
    element_text,
    offset_x,
    offset_y,
    width,
    height,
    x_path,
    container_id,
    event_state,
    event_id,
    event_time,
  } = body

  const insertData = compact({
    event_type,
    url,
    page_type,
    author,
    message,
    cursor_position,
    end_position,
    event_value,
    tag_name,
    element_text,
    offset_x,
    offset_y,
    width,
    height,
    x_path,
    container_id,
    event_state,
    event_id,
    event_time,
    user_id: userId,
  })

  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("traces")
    .insert(insertData)
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
