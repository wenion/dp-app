"use server";

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_members')
    .select('id:order_index, name, title, role, bio, image')
    .order('order_index', { ascending: true })
    .limit(6)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
