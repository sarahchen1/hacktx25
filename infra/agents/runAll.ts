import { runParsingAgent } from "./parsingAgent";
import { runAuditAgent } from "./auditAgent";
import { runAnswerAgent } from "./answerAgent";
import { runReceiptAgent } from "./receiptAgent";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Usage: tsx infra/agents/runAll.ts <repoUrl>");

  const evidence = await runParsingAgent({ repoUrl });
  const audit = await runAuditAgent({ evidence });
  const qa = await runAnswerAgent({
    question: "How do you use my data?",
    policyMarkdown: audit.policy_markdown || "",
    evidence,
  });

  // receipt demo comparing last run
  const outDir = path.join(process.cwd(), ".out");
  fs.mkdirSync(outDir, { recursive: true });
  const prevPath = path.join(outDir, "evidence.json");
  const prev = fs.existsSync(prevPath)
    ? JSON.parse(fs.readFileSync(prevPath, "utf8"))
    : {};
  const receipt = await runReceiptAgent({
    previousEvidence: prev,
    latestEvidence: evidence,
  });

  fs.writeFileSync(prevPath, JSON.stringify(evidence, null, 2));
  fs.writeFileSync(
    path.join(outDir, "audit.json"),
    JSON.stringify(audit, null, 2)
  );
  fs.writeFileSync(path.join(outDir, "qa.json"), JSON.stringify(qa, null, 2));
  fs.writeFileSync(
    path.join(outDir, "receipt.json"),
    JSON.stringify(receipt, null, 2)
  );
  console.log("DONE: wrote .out/{evidence,audit,qa,receipt}.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
