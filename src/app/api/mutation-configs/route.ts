import { NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";
import { getAdminUserId } from "@/utils/supabase/getAdminUserId";

import type {
  MutationConfig,
} from "@/types/mutation-config";

type MutationConfigRow = {
  id: number;
  platform: string;
  selectors: MutationConfig["selectors"];
  created_at: string;
};

function isValidSelectors(
  value: unknown,
): value is MutationConfig["selectors"] {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const selectors = value as Record<string, unknown>;

  return [
    "human",
    "ai",
    "messageId",
    "eventId",
  ].every(key =>
    Array.isArray(selectors[key]) &&
    selectors[key].every(
      (item: unknown) => typeof item === "string"
    )
  );
}

/**
 * List Mutation Configs
 */
export async function GET() {
  const userId = await getAdminUserId();

  if (userId instanceof NextResponse) {
    return userId;
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mutation_configs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .order("id", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    (data ?? []) as MutationConfigRow[],
  );
}

/**
 * Create Mutation Config
 */
export async function POST(req: Request) {
  const userId = await getAdminUserId();

  if (userId instanceof NextResponse) {
    return userId;
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { platform, selectors } = body as {
    platform?: unknown;
    selectors?: unknown;
  };

  if (
    typeof platform !== "string" ||
    !/^[a-z][a-z0-9_-]{0,49}$/.test(platform) ||
    !isValidSelectors(selectors)
  ) {
    return NextResponse.json(
      { error: "Invalid mutation config" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mutation_configs")
    .insert({
      platform,
      selectors,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    data as MutationConfigRow,
    { status: 201 },
  );
}
