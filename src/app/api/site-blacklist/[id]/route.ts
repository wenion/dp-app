
import { NextResponse } from "next/server";

import { getAdminUserId } from "@/utils/supabase/getAdminUserId";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE(
  _req: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const adminUserId = await getAdminUserId();

  if (adminUserId instanceof NextResponse) {
    return adminUserId;
  }

  const { id } = await context.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid ID" },
      { status: 400 },
    );
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("site_blacklist")
    .delete()
    .eq("id", Number(id))
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
      { error: "Domain not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
