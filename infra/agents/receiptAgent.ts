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
    "Compare previous vs latest evidence.",
    "Summarize diffs, flag drift, return updated=true if ledger should append.",
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
      drift_flags: ["processing_error"],
    };
  }
}
