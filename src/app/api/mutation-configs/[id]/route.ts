import { NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";
import { getAdminUserId } from "@/utils/supabase/getAdminUserId";

/**
 * Delete Mutation Config
 */
export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const userId = await getAdminUserId();

  if (userId instanceof NextResponse) {
    return userId;
  }

  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid config id" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mutation_configs")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Mutation config not found" },
      { status: 404 },
    );
  }

  return new Response(null, {
    status: 204,
  });
}
