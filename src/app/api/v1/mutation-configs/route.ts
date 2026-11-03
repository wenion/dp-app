import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

import type {
  MutationConfig,
  MutationConfigs,
} from "@/types/mutation-config";

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice(7);
}

async function authenticate(req: Request): Promise<NextResponse | null> {
  const bearer = getBearerToken(req);

  if (bearer) {
    try {
      const payload = jwt.verify(
        bearer,
        process.env.EXTENSION_JWT_SECRET!,
        { algorithms: ["HS256"] },
      ) as { sub?: string; scope?: string };

      if (payload.scope !== "extension" || !payload.sub) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }

      return null;
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

  return null;
}

function isMutationConfig(
  value: unknown,
): value is MutationConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const selectors = (value as Record<string, unknown>).selectors;

  if (
    !selectors ||
    typeof selectors !== "object" ||
    Array.isArray(selectors)
  ) {
    return false;
  }

  const s = selectors as Record<string, unknown>;

  return ["human", "ai", "messageId", "eventId"].every(
    key =>
      Array.isArray(s[key]) &&
      s[key].every(
        (item: unknown) => typeof item === "string",
      ),
  );
}

/**
 * Synchronize Mutation Configs for Chrome Extension
 */
export async function POST(req: Request) {
  // 1. Authenticate
  const authError = await authenticate(req);

  if (authError) {
    return authError;
  }

  // 2. Parse local configs
  let localConfigs: MutationConfigs;

  try {
    const body = await req.json();
    localConfigs = body.localConfigs;

    if (
      !localConfigs ||
      typeof localConfigs !== "object" ||
      Array.isArray(localConfigs) ||
      !Object.values(localConfigs).every(isMutationConfig)
    ) {
      return NextResponse.json(
        { error: "Invalid localConfigs" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // 3. Fetch remote configs
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mutation_configs")
    .select("id, platform, selectors")
    .order("id", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to fetch mutation configs:", error);

    return NextResponse.json(
      { error: "Failed to fetch mutation configs" },
      { status: 500 },
    );
  }

  // 4. Keep latest config for each platform
  const remoteConfigs: MutationConfigs = {};

  for (const row of data ?? []) {
    if (
      Object.prototype.hasOwnProperty.call(
        remoteConfigs,
        row.platform,
      )
    ) {
      continue;
    }

    const config = {
      selectors: row.selectors,
    };

    if (!isMutationConfig(config)) {
      console.error("Invalid remote mutation config:", row.id);
      continue;
    }

    Object.defineProperty(remoteConfigs, row.platform, {
      value: config,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  // 5. Merge configs (remote takes precedence)
  const configs: MutationConfigs = {
    ...localConfigs,
    ...remoteConfigs,
  };

  return NextResponse.json(configs);
}
