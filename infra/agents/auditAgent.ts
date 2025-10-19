import { generateJSON } from "../ai/gemini";
import { selectKbSections, readText } from "../kb/loadKb";
import { AuditSchema } from "./schemas";

export async function runAuditAgent({ evidence }: { evidence: any }) {
  const system = readText("prompts/audit.system.md");
  const kb = selectKbSections({
    file: "compliance_frameworks.yaml",
    keywords: ["gdpr", "ccpa", "glba", "score", "policy"],
  });
  const user = [
    "Evaluate evidence against GDPR/CCPA/GLBA.",
    "Compute a 0-100 compliance_score with per-framework breakdown.",
    "Return policy_markdown drafted from evidence.",
    "Return recommended_fixes with estimated impact.",
    `KB:\n${kb}`,
    `EVIDENCE:\n${JSON.stringify(evidence).slice(0, 180000)}`,
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
      policy_markdown: "Error generating policy",
    };
  }
}
