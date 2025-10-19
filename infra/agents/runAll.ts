import { runParsingAgent } from "./parsingAgent";
import { runAuditAgent } from "./auditAgent";
import { runAnswerAgent } from "./answerAgent";
import { runReceiptAgent } from "./receiptAgent";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const repoUrl = process.argv[2];
  if (!repoUrl) throw new Error("Usage: tsx infra/agents/runAll.ts <repoUrl>");

  console.log("🚀 Starting OpenLedger agent pipeline...");
  console.log(`📦 Repository: ${repoUrl}`);

  // Ensure output directory exists
  const outDir = path.join(process.cwd(), ".out");
  fs.mkdirSync(outDir, { recursive: true });

  try {
    // Step 1: Parse repository
    console.log("\n1️⃣ Parsing repository...");
    const evidence = await runParsingAgent({ repoUrl });
    console.log(`✅ Found ${evidence.artifacts?.length || 0} artifacts`);

    // Step 2: Audit compliance
    console.log("\n2️⃣ Auditing compliance...");
    const audit = await runAuditAgent({ evidence });
    console.log(`✅ Compliance score: ${audit.compliance_score || 0}/100`);

    // Step 3: Generate Q&A
    console.log("\n3️⃣ Generating sample Q&A...");
    const qa = await runAnswerAgent({
      question: "How do you use my data?",
      policyMarkdown: audit.policy_markdown || "",
      evidence,
    });
    console.log(`✅ Answer generated`);

    // Step 4: Detect drift
    console.log("\n4️⃣ Detecting drift...");
    const prevPath = path.join(outDir, "evidence.json");
    const prev = fs.existsSync(prevPath)
      ? JSON.parse(fs.readFileSync(prevPath, "utf8"))
      : {};
    const receipt = await runReceiptAgent({
      previousEvidence: prev,
      latestEvidence: evidence,
    });
    console.log(`✅ Drift detected: ${receipt.updated ? "Yes" : "No"}`);

    // Step 5: Write results
    console.log("\n5️⃣ Writing results to .out/...");
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

    console.log("\n✨ DONE: wrote .out/{evidence,audit,qa,receipt}.json");
  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);

    // Write error state to output
    const errorState = {
      error: true,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(outDir, "error.json"),
      JSON.stringify(errorState, null, 2)
    );

    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
