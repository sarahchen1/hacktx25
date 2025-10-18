// Stub implementation for policy generation
// In a real implementation, this would generate privacy policies from rules and evidence

import { Rule, Evidence, UICopy } from "../types";

export interface PolicyGenerationResult {
  ui_copy: UICopy[];
  compliance_score: number;
  missing_rules: string[];
  recommendations: string[];
}

export function generatePolicyFromRules(
  rules: Rule[],
  evidence: Evidence[]
): PolicyGenerationResult {
  const ui_copy: UICopy[] = [];
  const missing_rules: string[] = [];

  // Match evidence against rules
  for (const ev of evidence) {
    const matchingRule = rules.find(
      (rule) =>
        rule.match.endpoint === ev.endpoint &&
        rule.match.fields.every((field) => ev.fields.includes(field))
    );

    if (matchingRule) {
      ui_copy.push({
        gate: matchingRule.gate,
        headline: generateHeadline(matchingRule.purpose),
        body: generateBody(matchingRule),
        evidenceRef: [`${ev.file}:${ev.line}`],
        purpose: matchingRule.purpose,
        retention: matchingRule.retention,
      });
    } else {
      missing_rules.push(`${ev.endpoint} with fields: ${ev.fields.join(", ")}`);
    }
  }

  const compliance_score = Math.max(0, 100 - missing_rules.length * 10);

  return {
    ui_copy,
    compliance_score,
    missing_rules,
    recommendations: generateRecommendations(missing_rules),
  };
}

function generateHeadline(purpose: string): string {
  const headlines: Record<string, string> = {
    budgeting: "We use your transaction categories for budgeting insights",
    account_management:
      "We store your profile information for account management",
    analytics: "We analyze your spending patterns for insights",
    recommendations:
      "We use your transaction history for personalized recommendations",
  };

  return headlines[purpose] || `We use your data for ${purpose}`;
}

function generateBody(rule: Rule): string {
  return `This data helps us provide ${rule.purpose} services. We retain this information for ${rule.retention} and you can control its use through the toggle above.`;
}

function generateRecommendations(missing_rules: string[]): string[] {
  if (missing_rules.length === 0) {
    return ["All data usage is properly documented and controlled"];
  }

  return [
    "Add rules for undocumented data usage patterns",
    "Review evidence.json for missing compliance coverage",
    "Consider implementing additional user consent gates",
  ];
}
