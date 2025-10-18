import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        createErrorResponse("Invalid answer request: question is required"),
        { status: 400 }
      );
    }

    const result = await answerQuestion(question, context || {});

    return NextResponse.json(createApiResponse(result.result));
  } catch (error) {
    console.error("Answer generation failed:", error);
    return NextResponse.json(createErrorResponse("Failed to generate answer"), {
      status: 500,
    });
  }
}
