import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Missing token." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("change_requests")
    .select(
      "id, reason, delta_cents, delay_days, status, project:projects(name, client_name)"
    )
    .eq("client_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const project =
    data.project && Array.isArray(data.project) ? data.project[0] : data.project;

  return NextResponse.json({
    id: data.id,
    reason: data.reason,
    delta_cents: data.delta_cents,
    delay_days: data.delay_days,
    status: data.status,
    project_name: project?.name,
    client_name: project?.client_name
  });
}
