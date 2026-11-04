
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createAdminClient } from "@/utils/supabase/admin";

import type {
  MutationConfigs,
} from "@/types/mutation-config";

export const dynamic = "force-dynamic";

type SiteRule = {
  domain: string;
  match_type: "domain" | "hostname" | "path_prefix";
  path: string | null;
  reason: string | null;
};

type VersionSnapshot = {
  mutation_configs: {
    source_id?: number;
    platform: string;
    selectors: MutationConfigs[string]["selectors"];
  }[];
  site_blacklist: (SiteRule & {
    source_id?: number;
  })[];
};

function authorizedUserId(
  request: Request,
): string | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const secret = process.env.EXTENSION_JWT_SECRET;

  if (!secret) {
    throw new Error(
      "EXTENSION_JWT_SECRET not configured",
    );
  }

  try {
    const token = header.slice("Bearer ".length);

    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      payload.scope !== "extension" ||
      typeof payload.sub !== "string" ||
      !payload.sub
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // 1. Authenticate
  let userId: string | null;

  try {
    userId = authorizedUserId(request);
  } catch (error) {
    console.error(
      "Extension authentication error:",
      error,
    );

    return NextResponse.json(
      { error: "Server authentication unavailable" },
      { status: 500 },
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or missing extension token" },
      { status: 401 },
    );
  }

  // 2. Parse request body
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const body = payload as Record<string, unknown>;

  const extensionVersion = body.extensionVersion;
  const configVersion = body.configVersion;

  // Use provided client ID or generate a new one
  const clientId =
    typeof body.clientId === "string" &&
    body.clientId.trim() &&
    body.clientId.length <= 36
      ? body.clientId
      : crypto.randomUUID();

  // Store null when no remote config is in use
  const currentConfigVersion =
    typeof configVersion === "string"
      ? configVersion
      : null;

  const db = await createAdminClient();

  // 3. Register or update extension client
  const { error: clientError } = await db
    .from("user_extension_clients")
    .upsert(
      {
        user_id: userId,
        client_id: clientId,
        extension_version: extensionVersion,
        config_version: currentConfigVersion,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id, client_id",
      },
    );

  if (clientError) {
    console.error(
      "Failed to upsert extension client:",
      clientError,
    );

    return NextResponse.json(
      { error: "Failed to register extension client" },
      { status: 500 },
    );
  }

  // 4. Find published snapshot for extension version
  const { data: versionRow, error: versionError } =
    await db
      .from("extension_versions")
      .select("version, config_snapshot")
      .eq("version", extensionVersion)
      .eq("status", "published")
      .maybeSingle();

  if (versionError) {
    console.error(
      "Failed to fetch extension version:",
      versionError,
    );

    return NextResponse.json(
      { error: "Failed to fetch extension version" },
      { status: 500 },
    );
  }

  // 5. No published snapshot
  if (!versionRow) {
    return NextResponse.json(
      {
        clientId,
        extensionVersion,
        configVersion: null,
        configFound: false,
        mutationConfigs: {},
        siteBlacklist: [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  // 6. Parse published snapshot
  const snapshot = versionRow.config_snapshot as
    | VersionSnapshot
    | null;

  if (
    !snapshot ||
    !Array.isArray(snapshot.mutation_configs) ||
    !Array.isArray(snapshot.site_blacklist)
  ) {
    return NextResponse.json(
      { error: "Invalid published version snapshot" },
      { status: 500 },
    );
  }

  const mutationConfigs: MutationConfigs = {};

  for (const config of snapshot.mutation_configs) {
    if (
      !config ||
      typeof config.platform !== "string" ||
      !config.selectors ||
      ["__proto__", "constructor", "prototype"].includes(
        config.platform,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid mutation config snapshot" },
        { status: 500 },
      );
    }

    mutationConfigs[config.platform] = {
      selectors: config.selectors,
    };
  }

  const siteBlacklist: SiteRule[] =
    snapshot.site_blacklist.map((rule) => ({
      domain: rule.domain,
      match_type: rule.match_type,
      path: rule.path,
      reason: rule.reason,
    }));

  // 7. Return published config
  return NextResponse.json(
    {
      clientId,
      extensionVersion,
      configVersion: versionRow.version,
      configFound: true,
      mutationConfigs,
      siteBlacklist,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
