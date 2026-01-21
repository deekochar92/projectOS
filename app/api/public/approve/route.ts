import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body?.token as string | undefined;
  const action = body?.action as "approved" | "rejected" | undefined;

  if (!token || !action) {
    return NextResponse.json({ message: "Missing data." }, { status: 400 });
  }

  if (action !== "approved" && action !== "rejected") {
    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: changeRequest, error } = await supabase
    .from("change_requests")
    .select("id, status, project_id")
    .eq("client_token", token)
    .single();

  if (error || !changeRequest) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  if (changeRequest.status !== "pending") {
    return NextResponse.json(
      { message: "Change request already finalized." },
      { status: 409 }
    );
  }

  const clientIp = request.headers.get("x-forwarded-for") || null;
  const clientUserAgent = request.headers.get("user-agent") || null;

  const { error: approvalError } = await supabase.from("approvals").insert({
    change_request_id: changeRequest.id,
    action,
    client_ip: clientIp,
    client_user_agent: clientUserAgent
  });

  if (approvalError) {
    return NextResponse.json(
      { message: approvalError.message },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("change_requests")
    .update({ status: action })
    .eq("id", changeRequest.id);

  if (updateError) {
    return NextResponse.json(
      { message: updateError.message },
      { status: 500 }
    );
  }

  const auditAction = action === "approved" ? "client_approved" : "client_rejected";

  await supabase.from("audit_logs").insert({
    project_id: changeRequest.project_id,
    entity_type: "change_request",
    entity_id: changeRequest.id,
    action: auditAction,
    meta: { action }
  });

  return NextResponse.json({ status: action });
}
