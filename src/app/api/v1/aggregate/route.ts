"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Trace } from "@/types/trace";
import {
  aggregateMutationEvents,
} from "./aggregate";
import { transformation } from "./transformation";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  /* -------------------- auth -------------------- */

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // rolling in aggregation_runs table
  // user_id version parameters needed
  // get the end_raw_trace_id from latest aggregation run for this user
  // execute - generateaggregated data
  // create new aggregation run record

  const { searchParams } = request.nextUrl;
  const version = searchParams.get('version') || 'v1';

  let { data: lastRun, error: runError } = await supabase
    .from("aggregation_runs")
    .select("end_raw_trace_id")
    .eq("user_id", user.id)
    .eq("version", version)
    .eq("status", "success")
    .order("end_raw_trace_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (runError) {
    return NextResponse.json({ error: runError.message }, { status: 500 });
  }

  const lastEndId = lastRun?.end_raw_trace_id ?? 0;

  const { data: maxRow, error: maxError } = await supabase
    .from("raw_traces")
    .select("id")
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return NextResponse.json({ error: maxError.message }, { status: 500 });
  }

  const maxRawId = maxRow?.id ?? 0;

  if (maxRawId <= lastEndId) {
    return NextResponse.json({ status: 204 });
  }

  const { data: run, error: insertError } = await supabase
    .from("aggregation_runs")
    .insert({
      user_id: user.id,
      version,
      status: "running",
      start_raw_trace_id: lastEndId + 1,
      // end_raw_trace_id: maxRawId
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // fetch last three raw traces before lastEndId for context
  const LAST_TRACES_SIZE = 3;

  const { data: lastTraces, error: contextError } = await supabase
    .from("raw_traces")
    .select("*")
    .eq("user_id", user.id)
    .lte("id", lastEndId)
    .order("timestamp", { ascending: false })
    .order("id", { ascending: false })
    .limit(LAST_TRACES_SIZE);

  if (contextError) {
    return NextResponse.json({ error: contextError.message }, { status: 500 });
  }

  const { data: newTraces, error: rawError } = await supabase
    .from("raw_traces")
    .select("*")
    .eq("user_id", user.id)
    .gt("id", lastEndId)
    .lte("id", maxRawId)
    .order("timestamp", { ascending: true })
    .order("id", { ascending: true })

  if (rawError) {
    await supabase
      .from("aggregation_runs")
      .update({ status: "failed", error: rawError.message })
      .eq("id", run.id);

    return NextResponse.json({ error: rawError.message }, { status: 500 });
  }

  const aggregatedTraces = aggregateMutationEvents(newTraces, lastTraces);
  if (newTraces.length > 0) {
    // insert aggregated traces
    const execute = async (data: Trace) => {
      return await supabase
      .from("traces")
      .insert(data);
    };
    const { inserted, errors } = await transformation(aggregatedTraces, version, execute);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.map(e => e && e.message).join(", ") }, { status: 500 });
    }

    // upate aggregation run with end_raw_trace_id
    const { error } = await supabase
      .from("aggregation_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        count: newTraces.length,
        end_raw_trace_id: newTraces[newTraces.length - 1]?.id || lastEndId,
      })
      .eq("id", run.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  else if (newTraces.length === 0) {
    await supabase
      .from("aggregation_runs")
      .delete()
      .eq("id", run.id);
  }

  return NextResponse.json({ status: "success",  count: aggregatedTraces.length });
}
