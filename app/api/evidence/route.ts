import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, TABLES } from "@/lib/supabase/schema";
import {
  fetchMockData,
  MOCK_PATHS,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api";
import { Evidence } from "@/packages/openledger-core/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gate = searchParams.get("gate");
    const file = searchParams.get("file");

    const supabase = createClient();

    // Try Supabase first
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const scans = await db.getEvidence();
        let filteredScans = scans;

        if (gate) {
          filteredScans = scans.filter(
            (s) =>
              s.evidence &&
              s.evidence.some(
                (e: any) =>
                  e.fields &&
                  e.fields.some((field: string) => field.includes(gate))
              )
          );
        }
        if (file) {
          filteredScans = filteredScans.filter(
            (s) =>
              s.evidence &&
              s.evidence.some((e: any) => e.file && e.file.includes(file))
          );
        }

        return NextResponse.json(createApiResponse(filteredScans));
      }
    } catch (error) {
      console.warn("Supabase evidence fetch failed, using mock data:", error);
    }

    // Fallback to mock data
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
  } catch (error) {
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

    const supabase = createClient();

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
    } catch (error) {
      console.warn("Supabase evidence insert failed:", error);
    }

    // Return the data even if Supabase failed
    return NextResponse.json(createApiResponse(evidence));
  } catch (error) {
    return NextResponse.json(createErrorResponse("Failed to save evidence"), {
      status: 500,
    });
  }
}
