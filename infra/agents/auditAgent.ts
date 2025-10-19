import { generateJSON } from "../ai/gemini";
import { selectKbSections, readText } from "../kb/loadKb";
import { AuditSchema } from "./schemas";

export async function runAuditAgent({ 
  evidence, 
  previousEvidence 
}: { 
  evidence: any;
  previousEvidence?: any;
}) {
  const system = readText("prompts/audit.system.md");
  const kb = selectKbSections({
    file: "compliance_frameworks.yaml",
    keywords: ["gdpr", "ccpa", "glba", "score", "policy", "drift", "violation"],
  });
  
  // Extract current policy from evidence if found
  const currentPolicy = evidence?.artifacts?.find((artifact: any) => 
    /(privacy|policy|terms|legal)/i.test(artifact.path) || 
    /privacy-policy\.txt$/i.test(artifact.path) ||
    /\.(md|txt)$/i.test(artifact.path)
  );

  // If we found a policy artifact with content, use that content
  if (currentPolicy && currentPolicy.content) {
    currentPolicy.actualContent = currentPolicy.content;
  }

  const user = [
    "You are an advanced compliance audit agent that evaluates codebases against GDPR/CCPA/GLBA standards.",
    "",
    "**CORE TASKS:**",
    "1. **Policy Analysis**: Analyze the current policy (if found) and score it against compliance frameworks",
    "2. **Drift Detection**: Compare current evidence with previous evidence to detect changes and violations",
    "3. **Policy Generation**: Create a new, compliant policy based on current evidence and requirements",
    "4. **Compliance Scoring**: Provide detailed compliance scores and framework breakdowns",
    "",
    "**POLICY PROCESSING:**",
    currentPolicy ? `Current policy found at: ${currentPolicy.path}` : "No current policy found in repository",
    currentPolicy ? `Current policy content: ${currentPolicy.actualContent || currentPolicy.summary || "See full content in evidence"}` : "",
    "",
    "**DRIFT DETECTION:**",
    previousEvidence ? "Compare current evidence with previous evidence to detect:" : "This is the first scan - no previous evidence to compare",
    "- New endpoints or data collection points",
    "- Removed functionality",
    "- Changes in data flows or PII handling",
    "- Security risks or policy violations",
    "- Compliance gaps or improvements",
    "",
    "**OUTPUT REQUIREMENTS:**",
    "- Score the current policy (0-100) against each framework",
    "- Generate drift events with severity levels (low/medium/high)",
    "- Create a new policy that addresses all compliance gaps",
    "- Provide specific recommended actions for each drift event",
    "- Include user toggles for consent management",
    "",
    `KB:\n${kb}`,
    `CURRENT EVIDENCE:\n${JSON.stringify(evidence).slice(0, 120000)}`,
    previousEvidence ? `PREVIOUS EVIDENCE:\n${JSON.stringify(previousEvidence).slice(0, 60000)}` : "",
  ].join("\n\n");

  try {
    return await generateJSON({
      system,
      user,
      schemaHint: AuditSchema,
    });
  } catch (error) {
    console.error("Audit agent failed:", error);
    return {
      compliance_score: 0,
      framework_breakdown: [],
      recommended_fixes: [],
      current_policy: {
        file_path: "",
        content: "",
        last_modified: "",
        compliance_score: 0
      },
      new_policy: {
        content: "Error generating policy",
        changes_summary: "Error occurred during policy generation",
        compliance_score: 0,
        requires_approval: true
      },
      drift_events: [],
      user_toggles: [],
    };
  }
}
