import { NextRequest, NextResponse } from "next/server";
import { auditCompliance, auditComplianceWithPolicy } from "@/lib/gradient";
import { createApiResponse, createErrorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const {
      evidence,
      classification,
      copy,
      compliance_frameworks,
      generate_policy,
    } = await request.json();

    if (!evidence) {
      return NextResponse.json(
        createErrorResponse("Invalid audit request: evidence is required"),
        { status: 400 }
      );
    }

    // Use new orchestrated agent if policy generation is requested
    if (generate_policy) {
      const result = await auditComplianceWithPolicy(
        evidence,
        compliance_frameworks || ["GDPR", "CCPA", "GLBA"]
      );
      return NextResponse.json(createApiResponse(result.result));
    }

    // Fallback to legacy audit for backward compatibility
    if (!classification || !copy) {
      return NextResponse.json(
        createErrorResponse(
          "Invalid audit request: classification and copy are required for legacy audit"
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
