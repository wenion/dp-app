
import { NextResponse } from "next/server";

import { getAdminUserId } from "@/utils/supabase/getAdminUserId";
import { createAdminClient } from "@/utils/supabase/admin";

function normalizeDomain(input: string): string | null {
  const value = input.trim().toLowerCase();

  if (!value) return null;

  try {
    const url = new URL(
      value.includes("://")
        ? value
        : `https://${value}`,
    );

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    const domain = url.hostname.replace(/\.$/, "");

    if (
      !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)
    ) {
      return null;
    }

    if (
      domain.split(".").some(
        (label) =>
          label.startsWith("-") ||
          label.endsWith("-"),
      )
    ) {
      return null;
    }

    return domain;
  } catch {
    return null;
  }
}

export async function GET() {
  const adminUserId = await getAdminUserId();

  if (adminUserId instanceof NextResponse) {
    return adminUserId;
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("site_blacklist")
    .select(
      "id, domain, match_type, path, reason, created_at",
    )
    .order("domain", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}


type MatchType =
  | "domain"
  | "hostname"
  | "path_prefix";

export async function POST(req: Request) {
  const adminUserId = await getAdminUserId();

  if (adminUserId instanceof NextResponse) {
    return adminUserId;
  }

  let body: {
    domain?: unknown;
    match_type?: unknown;
    path?: unknown;
    reason?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Validate domain
  if (typeof body.domain !== "string") {
    return NextResponse.json(
      { error: "Invalid domain" },
      { status: 400 },
    );
  }

  const domain = normalizeDomain(body.domain);

  if (!domain) {
    return NextResponse.json(
      { error: "Invalid domain" },
      { status: 400 },
    );
  }

  // Validate match type
  const allowedTypes: MatchType[] = [
    "domain",
    "hostname",
    "path_prefix",
  ];

  const matchType = body.match_type ?? "domain";

  if (
    typeof matchType !== "string" ||
    !allowedTypes.includes(matchType as MatchType)
  ) {
    return NextResponse.json(
      { error: "Invalid match type" },
      { status: 400 },
    );
  }

  // Validate path
  let path: string | null = null;

  if (matchType === "path_prefix") {
    if (
      typeof body.path !== "string" ||
      !body.path.startsWith("/") ||
      body.path === "/" ||
      body.path.startsWith("//") ||
      body.path.includes("?") ||
      body.path.includes("#")
    ) {
      return NextResponse.json(
        { error: "Invalid path prefix" },
        { status: 400 },
      );
    }

    path = body.path;
  } else if (
    body.path !== undefined &&
    body.path !== null &&
    body.path !== ""
  ) {
    return NextResponse.json(
      {
        error:
          "Path must be null for domain and hostname rules",
      },
      { status: 400 },
    );
  }

  // Validate reason
  if (
    body.reason !== undefined &&
    body.reason !== null &&
    typeof body.reason !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid reason" },
      { status: 400 },
    );
  }

  const reason =
    typeof body.reason === "string"
      ? body.reason.trim() || null
      : null;

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("site_blacklist")
    .insert({
      domain,
      match_type: matchType,
      path,
      reason,
      created_by: adminUserId,
    })
    .select(
      "id, domain, match_type, path, reason, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Blacklist rule already exists"
            : error.message,
      },
      {
        status: error.code === "23505" ? 409 : 500,
      },
    );
  }

  return NextResponse.json(data, {
    status: 201,
  });
}

