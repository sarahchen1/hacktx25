import { NextRequest, NextResponse } from "next/server";
import { processReceiptsAndDrift } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { time_range } = await request.json();

    // time_range is optional - if not provided, process all recent data
    const result = await processReceiptsAndDrift(time_range);

    return NextResponse.json(createApiResponse(result));
  } catch (error) {
    console.error("Receipt processing failed:", error);
    return NextResponse.json(
      createErrorResponse("Failed to process receipts and drift"),
      { status: 500 }
    );
  }
}

// GET endpoint to trigger manual receipt processing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const timeRange = start && end ? { start, end } : undefined;
    const result = await processReceiptsAndDrift(timeRange);

    return NextResponse.json(createApiResponse(result));
  } catch (error) {
    console.error("Manual receipt processing failed:", error);
    return NextResponse.json(
      createErrorResponse("Failed to process receipts manually"),
      { status: 500 }
    );
  }
}
