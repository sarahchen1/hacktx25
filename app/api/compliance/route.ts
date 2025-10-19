import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { loadAgentData } from "@/lib/agent-data";

export async function GET() {
  try {
    // Try to load real agent data first
    const agentData = loadAgentData();
    if (agentData.audit) {
      console.log("Using real agent compliance data");
      
      const complianceData = {
        score: agentData.audit.compliance_score,
        framework_breakdown: agentData.audit.framework_breakdown,
        recommended_fixes: agentData.audit.recommended_fixes,
        last_updated: new Date().toISOString(),
      };

      return NextResponse.json(createApiResponse(complianceData));
    }

    const supabase = await createClient();

    // Try Supabase as fallback
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Get user's projects and their latest scans
        const { data: projects } = await supabase
          .schema("app")
          .from("projects")
          .select("id")
          .eq("owner_id", user.id);

        if (projects && projects.length > 0) {
          const projectIds = projects.map((p) => p.id);

          // Get latest scan for each project
          const { data: scans } = await supabase
            .schema("app")
            .from("scans")
            .select("audit")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })
            .limit(1);

          if (scans && scans.length > 0 && scans[0].audit) {
            const auditData = scans[0].audit;
            const complianceData = {
              score: auditData.compliance_score || 0,
              framework_breakdown: auditData.framework_breakdown || [],
              recommended_fixes: auditData.recommended_fixes || [],
              last_updated: new Date().toISOString(),
            };

            return NextResponse.json(createApiResponse(complianceData));
          }
        }
      }
    } catch (error) {
      console.warn("Supabase compliance fetch failed, using mock data:", error);
    }

    // Final fallback to mock data
    console.log("Using mock compliance data");
    const mockCompliance = {
      score: 75,
      framework_breakdown: [
        {
          framework: "GDPR",
          score: 80,
          passed: ["Data minimization", "Purpose limitation"],
          failed: [
            {
              id: "GDPR.A7",
              title: "Consent mechanisms",
              why: "No explicit consent mechanisms implemented",
              evidence_refs: [],
            },
          ],
        },
      ],
      recommended_fixes: [
        {
          title: "Implement consent mechanisms",
          change: "Add consent checkboxes to data collection forms",
          impact: "high",
        },
      ],
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(createApiResponse(mockCompliance));
  } catch {
    return NextResponse.json(
      createErrorResponse("Failed to fetch compliance data"),
      { status: 500 }
    );
  }
}
