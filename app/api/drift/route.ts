import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, TABLES } from "@/lib/supabase/schema";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { DriftEvent } from "@/packages/openledger-core/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const supabase = await createClient();

    // Try Supabase first
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
    } catch (error) {
      console.warn("Supabase drift fetch failed, using mock data:", error);
    }

    // Fallback to mock data
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
  } catch (error) {
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
      } catch (error) {
        console.warn("Supabase drift insert failed:", error);
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
      } catch (error) {
        console.warn("Supabase drift update failed:", error);
      }

      return NextResponse.json(
        createApiResponse({ id: driftId, status: "resolved" })
      );
    }

    return NextResponse.json(createErrorResponse("Invalid action"), {
      status: 400,
    });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Failed to process drift action"),
      { status: 500 }
    );
  }
}
