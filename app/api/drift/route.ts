import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/supabase/schema";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { DriftEvent } from "@/packages/openledger-core/types";
import { loadAgentData, convertAgentAuditToDriftEvents } from "@/lib/agent-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    // Try to load real agent data first
    const agentData = loadAgentData();
    if (agentData.audit) {
      console.log("Using real agent drift data from audit");
      let driftEvents = convertAgentAuditToDriftEvents(agentData.audit);

      // Filter by status or severity if provided
      if (status) {
        driftEvents = driftEvents.filter((d) => d.status === status);
      }
      if (severity) {
        driftEvents = driftEvents.filter((d) => d.severity === severity);
      }

      return NextResponse.json(createApiResponse(driftEvents));
    }

    const supabase = await createClient();

    // Try Supabase as fallback
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const driftEvents = await db.getDriftEvents();
        let filteredEvents = driftEvents;

        if (status) {
          filteredEvents = driftEvents.filter(
            (d) => d.reviewed === (status === "resolved")
          );
        }
        if (severity) {
          filteredEvents = filteredEvents.filter(
            (d) => d.severity === severity
          );
        }

        return NextResponse.json(createApiResponse(filteredEvents));
      }
    } catch {
      console.warn("Supabase drift fetch failed, using mock data");
    }

    // Final fallback to mock data
    console.log("Using mock drift data");
    const mockDrift = await fetchMockData<DriftEvent[]>(MOCK_PATHS.DRIFT);

    // Filter mock data if parameters provided
    let filteredDrift = mockDrift;
    if (status) {
      filteredDrift = mockDrift.filter((d) => d.status === status);
    }
    if (severity) {
      filteredDrift = filteredDrift.filter((d) => d.severity === severity);
    }

    return NextResponse.json(createApiResponse(filteredDrift));
  } catch {
    return NextResponse.json(
      createErrorResponse("Failed to fetch drift events"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, driftId } = await request.json();

    if (action === "inject") {
      // Inject new drift for demo purposes
      const newDrift = await fetchMockData<DriftEvent>(MOCK_PATHS.DRIFT_NEW);

      const supabase = await createClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("drift_events")
            .insert({
              ...newDrift,
              id: `drift-${Date.now()}`,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (data && !error) {
            return NextResponse.json(createApiResponse(data));
          }
        }
      } catch {
        console.warn("Supabase drift insert failed");
      }

      return NextResponse.json(createApiResponse(newDrift));
    }

    if (action === "resolve" && driftId) {
      const supabase = await createClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("drift_events")
            .update({
              status: "resolved",
              resolved_at: new Date().toISOString(),
            })
            .eq("id", driftId)
            .select()
            .single();

          if (data && !error) {
            return NextResponse.json(createApiResponse(data));
          }
        }
      } catch {
        console.warn("Supabase drift update failed");
      }

      return NextResponse.json(
        createApiResponse({ id: driftId, status: "resolved" })
      );
    }

    return NextResponse.json(createErrorResponse("Invalid action"), {
      status: 400,
    });
  } catch {
    return NextResponse.json(
      createErrorResponse("Failed to process drift action"),
      { status: 500 }
    );
  }
}
