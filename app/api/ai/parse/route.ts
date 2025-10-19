import { NextRequest, NextResponse } from "next/server";
import { parseCodebase } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { repo_url, commit_hash } = await request.json();

    if (!repo_url || typeof repo_url !== "string") {
      return NextResponse.json(
        createErrorResponse("Invalid parsing request: repo_url is required"),
        { status: 400 }
      );
    }

    const result = await parseCodebase(repo_url, commit_hash);

    return NextResponse.json(createApiResponse(result));
  } catch (error) {
    console.error("Codebase parsing failed:", error);
    return NextResponse.json(createErrorResponse("Failed to parse codebase"), {
      status: 500,
    });
  }
}
