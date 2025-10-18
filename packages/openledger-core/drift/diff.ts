// Stub implementation for drift detection
// In a real implementation, this would compare current evidence against previous scans

import { Evidence, DriftEvent } from "../types";

export interface DriftDetectionResult {
  new_drift: DriftEvent[];
  resolved_drift: string[];
  summary: {
    total_drift: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
  };
}

export function detectDrift(
  currentEvidence: Evidence[],
  previousEvidence: Evidence[],
  existingDrift: DriftEvent[]
): DriftDetectionResult {
  const new_drift: DriftEvent[] = [];
  const resolved_drift: string[] = [];

  // Mock implementation - in reality this would:
  // 1. Compare current vs previous evidence
  // 2. Check for new fields/endpoints not covered by rules
  // 3. Detect changes in data usage patterns
  // 4. Identify resolved drift events

  // Mock some drift events for demo
  const mockDrift: DriftEvent[] = [
    {
      id: "drift-001",
      severity: "medium",
      endpoint: "GET /api/new-feature",
      field: "user_preferences",
      file: "app/api/new-feature/route.ts",
      line: 12,
      timestamp: new Date().toISOString(),
      status: "open",
      description: "New endpoint detected with undocumented data usage",
    },
    {
      id: "drift-002",
      severity: "low",
      endpoint: "POST /api/transactions",
      field: "metadata",
      file: "app/api/transactions/route.ts",
      line: 28,
      timestamp: new Date().toISOString(),
      status: "open",
      description: "Additional field added to existing endpoint",
    },
  ];

  const summary = {
    total_drift: mockDrift.length,
    high_severity: mockDrift.filter((d) => d.severity === "high").length,
    medium_severity: mockDrift.filter((d) => d.severity === "medium").length,
    low_severity: mockDrift.filter((d) => d.severity === "low").length,
  };

  return {
    new_drift: mockDrift,
    resolved_drift,
    summary,
  };
}

export function generateDriftReport(driftEvents: DriftEvent[]): string {
  const highSeverity = driftEvents.filter((d) => d.severity === "high");
  const mediumSeverity = driftEvents.filter((d) => d.severity === "medium");
  const lowSeverity = driftEvents.filter((d) => d.severity === "low");

  return `
# Drift Detection Report

## Summary
- Total drift events: ${driftEvents.length}
- High severity: ${highSeverity.length}
- Medium severity: ${mediumSeverity.length}
- Low severity: ${lowSeverity.length}

## High Severity Issues
${highSeverity
  .map((d) => `- ${d.description} (${d.file}:${d.line})`)
  .join("\n")}

## Medium Severity Issues
${mediumSeverity
  .map((d) => `- ${d.description} (${d.file}:${d.line})`)
  .join("\n")}

## Low Severity Issues
${lowSeverity.map((d) => `- ${d.description} (${d.file}:${d.line})`).join("\n")}
  `.trim();
}
