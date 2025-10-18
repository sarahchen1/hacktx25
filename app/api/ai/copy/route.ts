import { NextRequest, NextResponse } from "next/server";
import { generateCopy } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { purpose, fields, retention, controls } = await request.json();

    if (!purpose || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        createErrorResponse(
          "Invalid copy generation request: purpose and fields are required"
        ),
        { status: 400 }
      );
    }

    const result = await generateCopy(
      purpose,
      fields,
      retention || "12m",
      controls || []
    );

    return NextResponse.json(createApiResponse(result.result));
  } catch (error) {
    console.error("Copy generation failed:", error);
    return NextResponse.json(createErrorResponse("Failed to generate copy"), {
      status: 500,
    });
  }
}
