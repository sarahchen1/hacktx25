import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGates, setGate } from "@/lib/gates";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";

export async function GET() {
  try {
    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const gates = await getGates();
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

    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await setGate(gateName, value);
        const updatedGates = await getGates();
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

    // Fallback to in-memory store
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
