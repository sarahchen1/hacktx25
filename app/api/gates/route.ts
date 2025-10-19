import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, TABLES } from "@/lib/supabase/schema";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const gates = await db.getUserGates(user.id);
        return NextResponse.json(createApiResponse(gates));
      }
    } catch (error) {
      console.warn("Supabase auth failed, using mock data:", error);
    }

    // Fallback to mock data
    const mockGates = await fetchMockData(MOCK_PATHS.GATES);
    return NextResponse.json(createApiResponse(mockGates));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to fetch gates"), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gate: gateName, value } = await request.json();

    if (!gateName || typeof value !== "boolean") {
      return NextResponse.json(
        createErrorResponse("Invalid gate name or value"),
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await db.updateGate(
          user.id,
          "00000000-0000-0000-0000-000000000001",
          gateName,
          value
        );
        const updatedGates = await db.getUserGates(user.id);
        return NextResponse.json(
          createApiResponse({
            ...updatedGates,
            ts: new Date().toISOString(),
          })
        );
      }
    } catch (error) {
      console.warn("Supabase auth failed, using in-memory store:", error);
    }

    // Fallback to in-memory store (keep existing logic for offline mode)
    const { getGates, setGate } = await import("@/lib/gates");
    await setGate(gateName, value);
    const updatedGates = await getGates();

    return NextResponse.json(
      createApiResponse({
        ...updatedGates,
        ts: new Date().toISOString(),
      })
    );
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to update gate"), {
      status: 500,
    });
  }
}
