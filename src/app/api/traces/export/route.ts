"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/* -------------------- constants -------------------- */

const ALLOWED_SORT_COLUMNS = new Set([
  "id",
  "created_at",
  "url",
  "page_type",
  "author",
  "message",
  "cursor_position",
  "end_position",
  "event_type",
  "event_value",
  "tag_name",
  "element_text",
  "x_path",
  "container_id",
  "event_state",
  "event_id",
  "event_time",
]);

const MAX_EXPORT_ROWS = 100_000;   // absolute safety cap
const PAGE_SIZE = 1000;
const MIN_SEARCH_LENGTH = 2;

/* -------------------- GET -------------------- */

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  /* -------------------- auth -------------------- */

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* -------------------- params -------------------- */

  const params = request.nextUrl.searchParams;

  const sortByRaw = params.get("sortBy") || "created_at";
  const sortBy = ALLOWED_SORT_COLUMNS.has(sortByRaw)
    ? sortByRaw
    : "created_at";

  const sortDesc = params.get("sortDesc") === "true";

  const globalFilterRaw = (params.get("globalFilter") || "").trim();

  const fromDate = params.get("from"); // ISO string
  const toDate = params.get("to");     // ISO string

  const limitRaw = Number(params.get("limit"));

  const limit =
    Number.isFinite(limitRaw) &&
    limitRaw > 0 &&
    limitRaw <= MAX_EXPORT_ROWS
      ? limitRaw
      : MAX_EXPORT_ROWS;

  /* -------------------- base query -------------------- */
  let allRows: any[] = [];
  let offset = 0;

  while (allRows.length < limit) {
    const to = Math.min(offset + PAGE_SIZE - 1, limit - 1);

    let pageQuery = supabase
      .from("traces")
      .select(`
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
      `)
      .eq("user_id", user.id)
      .order(sortBy, { ascending: !sortDesc, nullsFirst: false })
      .order("id", { ascending: false })
      .range(offset, to);

    // Date range
    if (fromDate) pageQuery = pageQuery.gte("created_at", fromDate);
    if (toDate) pageQuery = pageQuery.lte("created_at", toDate);

    if (globalFilterRaw.length >= MIN_SEARCH_LENGTH) {
      const search = globalFilterRaw.replace(/[%_]/g, "\\$&");

      pageQuery = pageQuery.or(
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
        ].join(",")
      );
    }

    const { data, error } = await pageQuery;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      break; // no more rows
    }

    allRows.push(...data);

    if (data.length < PAGE_SIZE) {
      break; // last page
    }

    offset += PAGE_SIZE;
  }

  const timeZone = request.headers.get("x-timezone") || "UTC";

  const formatLocal = (value: string | null) => {
    if (!value) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toLocaleString("sv-SE", {
        timeZone,
    }).replace(" ", "T");
  };

  const localizedData = allRows.map(row => ({
    ...row,
    created_at: formatLocal(row.created_at),
    event_time: formatLocal(row.event_time),
  }));

  return NextResponse.json({
    data: localizedData,
    meta: {
      requestedLimit: limitRaw ?? null,
      appliedLimit: limit,
      returned: localizedData.length,
      truncated: localizedData.length === limit,
      sortBy,
      sortDesc,
      from: fromDate ?? null,
      to: toDate ?? null,
      globalFilter: globalFilterRaw,
      timeZone,
    },
  });
}
