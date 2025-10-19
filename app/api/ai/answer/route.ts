import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, answerPrivacyQuestion } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { question, context, user_id, use_rag } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        createErrorResponse("Invalid answer request: question is required"),
        { status: 400 }
      );
    }

    // Use new hosted agent with RAG if requested
    if (use_rag) {
      const result = await answerPrivacyQuestion(question, user_id);
      return NextResponse.json(createApiResponse(result.result));
    }

    // Fallback to legacy answer agent for backward compatibility
    const result = await answerQuestion(question, context || {});
    return NextResponse.json(createApiResponse(result.result));
  } catch (error) {
    console.error("Answer generation failed:", error);
    return NextResponse.json(createErrorResponse("Failed to generate answer"), {
      status: 500,
    });
  }
}
