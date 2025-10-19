import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { Evidence } from "@/packages/openledger-core/types";
import { loadAgentData, convertAgentEvidenceToComponent } from "@/lib/agent-data";

interface AgentEvidenceItem {
  id?: string;
  path?: string;
  file?: string;
  method?: string;
  type?: string;
  line?: number;
  timestamp?: string;
  pii?: string[];
  data_flows?: Array<{
    purpose?: string;
    from?: string;
  }>;
  summary?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gate = searchParams.get("gate");
    const file = searchParams.get("file");

    // Try to load real agent data first
    const agentData = loadAgentData();
    if (agentData.evidence) {
      console.log("Using real agent evidence data");
      let evidence = convertAgentEvidenceToComponent(agentData.evidence);

      // Filter by gate or file if provided
      if (gate) {
        evidence = evidence.filter((e) =>
          e.fields.some((field) => field.includes(gate))
        );
      }
      if (file) {
        evidence = evidence.filter((e) => e.file.includes(file));
      }

      return NextResponse.json(createApiResponse(evidence));
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
            .select("evidence")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })
            .limit(1);

          if (scans && scans.length > 0 && scans[0].evidence) {
            // Extract evidence array from the scan
            let rawEvidence = scans[0].evidence.artifacts || scans[0].evidence;

            // Ensure it's an array
            if (!Array.isArray(rawEvidence)) {
              rawEvidence = [];
            }

            // Map agent output format to component expected format
            let evidence = rawEvidence.map((item: AgentEvidenceItem, index: number) => {
              // Extract data types from various sources
              let dataTypes: string[] = [];

              // Check PII array
              if (item.pii && item.pii.length > 0) {
                dataTypes = [...item.pii];
              }

              // Check data_flows for purpose/types
              if (item.data_flows && item.data_flows.length > 0) {
                item.data_flows.forEach((flow) => {
                  if (flow.purpose) {
                    // Extract key terms from purpose
                    const purposeTerms = flow.purpose.toLowerCase();
                    if (purposeTerms.includes("account"))
                      dataTypes.push("account_data");
                    if (purposeTerms.includes("transaction"))
                      dataTypes.push("transaction_data");
                    if (purposeTerms.includes("purchase"))
                      dataTypes.push("financial_data");
                    if (purposeTerms.includes("balance"))
                      dataTypes.push("balance_info");
                    if (
                      purposeTerms.includes("user") ||
                      purposeTerms.includes("customer")
                    )
                      dataTypes.push("user_data");
                  }
                  if (flow.from && flow.from.includes("API")) {
                    dataTypes.push("external_api_data");
                  }
                });
              }

              // If still empty, infer from path/summary
              if (dataTypes.length === 0) {
                const pathLower = (item.path || "").toLowerCase();
                const summaryLower = (item.summary || "").toLowerCase();
                const combined = pathLower + " " + summaryLower;

                if (combined.includes("account"))
                  dataTypes.push("account_data");
                if (
                  combined.includes("transaction") ||
                  combined.includes("purchase")
                )
                  dataTypes.push("transaction_data");
                if (combined.includes("user") || combined.includes("customer"))
                  dataTypes.push("user_data");
                if (item.type === "api") dataTypes.push("api_endpoint");
              }

              // Remove duplicates
              dataTypes = [...new Set(dataTypes)];

              return {
                id: item.id || `evidence-${index}`,
                file: item.path || item.file || "unknown",
                endpoint: item.path || item.endpoint || "",
                method: item.method || (item.type === "api" ? "GET" : "N/A"),
                fields: dataTypes.length > 0 ? dataTypes : ["data_collection"],
                line: item.line || 0,
                timestamp: item.timestamp || new Date().toISOString(),
              };
            });

            // Filter by gate or file if provided
            if (gate) {
              evidence = evidence.filter(
                (e) =>
                  e.fields &&
                  e.fields.some((field: string) => field.includes(gate))
              );
            }
            if (file) {
              evidence = evidence.filter(
                (e) => e.file && e.file.includes(file)
              );
            }

            return NextResponse.json(createApiResponse(evidence));
          }
        }
      }
    } catch {
      console.warn("Supabase evidence fetch failed, using mock data");
    }

    // Final fallback to mock data
    console.log("Using mock evidence data");
    const mockEvidence = await fetchMockData<Evidence[]>(MOCK_PATHS.EVIDENCE);

    // Filter mock data if parameters provided
    let filteredEvidence = mockEvidence;
    if (gate) {
      filteredEvidence = mockEvidence.filter((e) =>
        e.fields.some((field) => field.includes(gate))
      );
    }
    if (file) {
      filteredEvidence = filteredEvidence.filter((e) => e.file.includes(file));
    }

    return NextResponse.json(createApiResponse(filteredEvidence));
  } catch {
    return NextResponse.json(createErrorResponse("Failed to fetch evidence"), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const evidence: Evidence = await request.json();

    if (!evidence.file || !evidence.endpoint || !evidence.fields) {
      return NextResponse.json(createErrorResponse("Invalid evidence data"), {
        status: 400,
      });
    }

    const supabase = await createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("evidence")
          .insert({
            ...evidence,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (data && !error) {
          return NextResponse.json(createApiResponse(data));
        }
      }
    } catch {
      console.warn("Supabase evidence insert failed");
    }

    // Return the data even if Supabase failed
    return NextResponse.json(createApiResponse(evidence));
  } catch {
    return NextResponse.json(createErrorResponse("Failed to save evidence"), {
      status: 500,
    });
  }
}
