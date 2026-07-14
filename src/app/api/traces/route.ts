"use server";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from "@/utils/supabase/admin";

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

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const admin = createAdminClient();

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

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
    .from('traces')
    .select("*", {
      count: 'exact'
    })
    .eq("user_id", userId)

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  query = query
    .order("event_time", { ascending: false, nullsFirst: false,})
    .range(from, to)

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
      items: data,
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
      },
    });
}

// export async function GET(request: NextRequest) {
//   const supabase = await createClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   /* -------------------------- Query params ----------------------------- */

//   const searchParams = request.nextUrl.searchParams

//   const pageIndexRaw = Number(searchParams.get('pageIndex'))
//   const pageSizeRaw = Number(searchParams.get('pageSize'))

//   const pageIndex = Number.isFinite(pageIndexRaw) && pageIndexRaw >= 0
//     ? pageIndexRaw
//     : 0

//   const pageSize = Number.isFinite(pageSizeRaw)
//     ? Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE)
//     : DEFAULT_PAGE_SIZE

//   const sortByRaw = searchParams.get('sortBy') || 'created_at'
//   const sortBy = ALLOWED_SORT_COLUMNS.has(sortByRaw) ? sortByRaw : 'created_at'

//   const sortDesc = searchParams.get('sortDesc') === 'true'

//   const globalFilterRaw = (searchParams.get('globalFilter') || '').trim()
//   const eventTypeFilter = searchParams.get('eventTypeFilter') || null

//   // Calculate range
//   const from = pageIndex * pageSize
//   const to = from + pageSize - 1

//   let query = supabase
//     .from('traces')
//     .select(
//       `
//       id,
//       created_at,
//       event_type,
//       event_value,
//       url,
//       page_type,
//       author,
//       message,
//       cursor_position,
//       end_position,
//       tag_name,
//       element_text,
//       x_path,
//       offset_x,
//       offset_y,
//       width,
//       height,
//       container_id,
//       event_state,
//       event_id,
//       event_time
//       `,
//       { count: 'exact' }
//     )
//     .eq("user_id", user.id)

//   if (eventTypeFilter) {
//     query = query.eq("event_type", eventTypeFilter);
//   }

//   query = query
//     .order(sortBy, { ascending: !sortDesc, nullsFirst: false,})
//     // .order('id', { ascending: false })
//     .range(from, to)

//   // Apply global search
//   if (globalFilterRaw.length >= MIN_SEARCH_LENGTH) {
//     const search = globalFilterRaw.replace(/[%_]/g, '\\$&')
//     query = query.or(
//       [
//         `event_type.ilike.%${search}%`,
//         `event_value.ilike.%${search}%`,
//         `url.ilike.%${search}%`,
//         `page_type.ilike.%${search}%`,
//         `author.ilike.%${search}%`,
//         `message.ilike.%${search}%`,
//         `tag_name.ilike.%${search}%`,
//         `element_text.ilike.%${search}%`,
//         `x_path.ilike.%${search}%`,
//         `container_id.ilike.%${search}%`,
//         `event_state.ilike.%${search}%`,
//         `event_id.ilike.%${search}%`,
//       ].join(',')
//     )
//   }

//   const { data, error, count } = await query

//   if (error) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     )
//   }

//   return NextResponse.json({
//     data,
//     count,
//     pageIndex,
//     pageSize,
//     sortBy,
//     sortDesc,
//     globalFilter: globalFilterRaw,
//   })
// }
