import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, PolicyDocument } from "@/lib/supabase/schema";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    // Get user's projects
    const { data: projects } = await supabase
      .schema("app")
      .from("projects")
      .select("id")
      .eq("owner_id", user.id);

    if (!projects || projects.length === 0) {
      return NextResponse.json(createApiResponse({ current: null, new: null }));
    }

    const projectId = projects[0].id;
    const currentPolicy = await db.getCurrentPolicy(projectId);
    const newPolicy = await db.getNewPolicy(projectId);

    return NextResponse.json(createApiResponse({
      current: currentPolicy,
      new: newPolicy
    }));
  } catch (error) {
    console.error("Failed to fetch policies:", error);
    return NextResponse.json(createErrorResponse("Failed to fetch policies"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { type, title, content, file_path, compliance_score, changes_summary, requires_approval } = body;

    if (!type || !title || !content) {
      return NextResponse.json(createErrorResponse("Missing required fields"), { status: 400 });
    }

    // Get user's projects
    const { data: projects } = await supabase
      .schema("app")
      .from("projects")
      .select("id")
      .eq("owner_id", user.id);

    if (!projects || projects.length === 0) {
      return NextResponse.json(createErrorResponse("No project found"), { status: 404 });
    }

    const projectId = projects[0].id;
    const status = type === "current" ? "active" : "pending";

    const policyDoc: Omit<PolicyDocument, "id" | "created_at" | "updated_at"> = {
      project_id: projectId,
      type: type as "current" | "new",
      title,
      content,
      file_path,
      compliance_score,
      changes_summary,
      requires_approval: requires_approval || false,
      status: status as "active" | "pending" | "rejected"
    };

    const result = await db.upsertPolicyDocument(policyDoc);
    return NextResponse.json(createApiResponse(result));
  } catch (error) {
    console.error("Failed to save policy:", error);
    return NextResponse.json(createErrorResponse("Failed to save policy"), { status: 500 });
  }
}
