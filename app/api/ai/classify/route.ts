import { NextRequest, NextResponse } from "next/server";
import { classifyDataUsage } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, fields, code_snippet } = await request.json();

    if (!endpoint || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        createErrorResponse(
          "Invalid classification request: endpoint and fields are required"
        ),
        { status: 400 }
      );
    }

    const result = await classifyDataUsage(endpoint, fields, code_snippet);

    return NextResponse.json(createApiResponse(result.result));
  } catch (error) {
    console.error("Classification failed:", error);
    return NextResponse.json(
      createErrorResponse("Failed to classify data usage"),
      { status: 500 }
    );
  }
}
