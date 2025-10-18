import { NextRequest, NextResponse } from "next/server";
import { auditCompliance } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { evidence, classification, copy } = await request.json();

    if (!evidence || !classification || !copy) {
      return NextResponse.json(
        createErrorResponse(
          "Invalid audit request: evidence, classification, and copy are required"
        ),
        { status: 400 }
      );
    }

    const result = await auditCompliance(evidence, classification, copy);

    return NextResponse.json(createApiResponse(result.result));
  } catch (error) {
    console.error("Audit failed:", error);
    return NextResponse.json(
      createErrorResponse("Failed to audit compliance"),
      { status: 500 }
    );
  }
}
