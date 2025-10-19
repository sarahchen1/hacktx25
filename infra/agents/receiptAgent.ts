import { generateJSON } from "../ai/gemini";
import { readText } from "../kb/loadKb";
import { ReceiptSchema } from "./schemas";

export async function runReceiptAgent({
  previousEvidence,
  latestEvidence,
}: {
  previousEvidence: any;
  latestEvidence: any;
}) {
  const system = readText("prompts/receipt.system.md");
  const user = [
    "Compare previous vs latest evidence artifacts.",
    "For EACH change, create a drift_event with:",
    "  - severity (low/medium/high)",
    "  - type (new_endpoint/removed_endpoint/new_pii/changed_data_flow/security_risk)",
    "  - file and endpoint",
    "  - description of what changed",
    "  - policy_update_required boolean",
    "Track artifact indices: new_artifacts, removed_artifacts, modified_artifacts",
    "Return updated=true if any significant drift detected.",
    `PREV:\n${JSON.stringify(previousEvidence).slice(0, 90000)}`,
    `LATEST:\n${JSON.stringify(latestEvidence).slice(0, 90000)}`,
    `Return JSON: ${ReceiptSchema}`,
  ].join("\n\n");

  try {
    return await generateJSON({
      system,
      user,
      schemaHint: ReceiptSchema,
    });
  } catch (error) {
    console.error("Receipt agent failed:", error);
    return {
      updated: false,
      diff_summary: "Error processing receipt",
      drift_events: [],
      new_artifacts: [],
      removed_artifacts: [],
      modified_artifacts: [],
    };
  }
}
