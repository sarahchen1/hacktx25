#!/usr/bin/env tsx
import { runParsingAgent } from "./parsingAgent";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const repoUrl = process.argv[2];
  if (!repoUrl) {
    console.error("Usage: tsx infra/agents/runParsing.ts <repoUrl>");
    process.exit(1);
  }

  console.log("🔍 Running Parsing Agent...");
  const evidence = await runParsingAgent({ repoUrl });

  const outDir = path.join(process.cwd(), ".out");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "evidence.json"),
    JSON.stringify(evidence, null, 2)
  );

  console.log("✅ Evidence written to .out/evidence.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
