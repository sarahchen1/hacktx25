import { NextResponse } from "next/server";
import { createApiResponse, createErrorResponse } from "@/lib/api";
import { loadAgentData } from "@/lib/agent-data";

export async function GET() {
  try {
    const agentData = loadAgentData();
    
    if (!agentData.evidence && !agentData.audit) {
      return NextResponse.json(
        createErrorResponse("No agent data found. Run a codebase scan first."),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(agentData));
  } catch (error) {
    console.error("Failed to load agent data:", error);
    return NextResponse.json(
      createErrorResponse("Failed to load agent data"),
      { status: 500 }
    );
  }
}
