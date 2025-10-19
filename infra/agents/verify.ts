#!/usr/bin/env tsx
// Verification script to ensure the Gemini pipeline is locked and ready

import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

async function verify() {
  console.log("🔒 Verifying Gemini pipeline lock...\n");

  const checks = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // 1. Check environment
  console.log("1️⃣ Checking environment...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("   ❌ GEMINI_API_KEY not set in environment");
    checks.failed++;
  } else {
    console.log("   ✅ GEMINI_API_KEY present");
    checks.passed++;
  }

  // 2. Check KB structure
  console.log("\n2️⃣ Checking KB structure...");
  const kbFiles = [
    "infra/kb/files/rules.yaml",
    "infra/kb/files/compliance_frameworks.yaml",
    "infra/kb/files/privacy_policies.yaml",
    "infra/kb/files/schema.json",
    "infra/kb/files/prompts/parsing.system.md",
    "infra/kb/files/prompts/audit.system.md",
    "infra/kb/files/prompts/answer.system.md",
    "infra/kb/files/prompts/receipt.system.md",
  ];

  for (const file of kbFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
      checks.passed++;
    } else {
      console.log(`   ❌ Missing: ${file}`);
      checks.failed++;
    }
  }

  // 3. Check no legacy gradient references
  console.log("\n3️⃣ Checking for legacy gradient references...");
  if (fs.existsSync("infra/gradient")) {
    console.log("   ❌ infra/gradient/ still exists");
    checks.failed++;
  } else {
    console.log("   ✅ infra/gradient/ removed");
    checks.passed++;
  }

  // 4. Check agents exist
  console.log("\n4️⃣ Checking agent files...");
  const agentFiles = [
    "infra/agents/parsingAgent.ts",
    "infra/agents/auditAgent.ts",
    "infra/agents/answerAgent.ts",
    "infra/agents/receiptAgent.ts",
    "infra/agents/runAll.ts",
    "infra/agents/schemas.ts",
  ];

  for (const file of agentFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
      checks.passed++;
    } else {
      console.log(`   ❌ Missing: ${file}`);
      checks.failed++;
    }
  }

  // 5. Check AI client
  console.log("\n5️⃣ Checking AI client...");
  if (fs.existsSync("infra/ai/gemini.ts")) {
    console.log("   ✅ infra/ai/gemini.ts");
    checks.passed++;
  } else {
    console.log("   ❌ Missing: infra/ai/gemini.ts");
    checks.failed++;
  }

  // 6. Check KB loader
  console.log("\n6️⃣ Checking KB loader...");
  if (fs.existsSync("infra/kb/loadKb.ts")) {
    console.log("   ✅ infra/kb/loadKb.ts");
    checks.passed++;
  } else {
    console.log("   ❌ Missing: infra/kb/loadKb.ts");
    checks.failed++;
  }

  // 7. Check output directory
  console.log("\n7️⃣ Checking output directory...");
  const outDir = ".out";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`   ⚠️  Created ${outDir}/ directory`);
    checks.warnings++;
  } else {
    console.log(`   ✅ ${outDir}/ exists`);
    checks.passed++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Verification Summary:");
  console.log(`   ✅ Passed: ${checks.passed}`);
  console.log(`   ❌ Failed: ${checks.failed}`);
  console.log(`   ⚠️  Warnings: ${checks.warnings}`);
  console.log("=".repeat(50));

  if (checks.failed > 0) {
    console.log("\n❌ Verification FAILED - please fix issues above");
    process.exit(1);
  } else if (checks.warnings > 0) {
    console.log("\n⚠️  Verification PASSED with warnings");
  } else {
    console.log("\n✅ Verification PASSED - pipeline is locked and ready!");
  }
}

verify();
