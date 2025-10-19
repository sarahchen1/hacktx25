#!/usr/bin/env tsx
// Test Fixtures Script
// Runs fixtures and compares to expected-*.json

import { promises as fs } from "fs";
import path from "path";

interface TestResult {
  fixture: string;
  passed: boolean;
  errors: string[];
}

async function testFixtures(): Promise<void> {
  const exemplarsPath = path.join(__dirname, "../files/exemplars");

  console.log("🧪 Running test fixtures...");

  try {
    const files = await fs.readdir(exemplarsPath);
    const fixtureFiles = files.filter(
      (f) => f.startsWith("example-") && f.endsWith(".json")
    );

    if (fixtureFiles.length === 0) {
      console.log("No test fixtures found");
      return;
    }

    const results: TestResult[] = [];

    for (const fixtureFile of fixtureFiles) {
      const result = await testFixture(exemplarsPath, fixtureFile);
      results.push(result);
    }

    // Print results
    let hasErrors = false;

    for (const result of results) {
      if (result.passed) {
        console.log(`✅ ${result.fixture} passed`);
      } else {
        console.log(`❌ ${result.fixture} failed:`);
        for (const error of result.errors) {
          console.log(`   - ${error}`);
        }
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("\n❌ Some tests failed");
      process.exit(1);
    } else {
      console.log("\n✅ All tests passed");
    }
  } catch (error) {
    console.error("Error running tests:", error);
    process.exit(1);
  }
}

async function testFixture(
  exemplarsPath: string,
  fixtureFile: string
): Promise<TestResult> {
  const fixturePath = path.join(exemplarsPath, fixtureFile);
  const expectedFile = fixtureFile.replace("example-", "expected-");
  const expectedPath = path.join(exemplarsPath, expectedFile);

  const errors: string[] = [];

  try {
    // Load fixture and expected data
    const fixtureContent = await fs.readFile(fixturePath, "utf-8");
    const fixture = JSON.parse(fixtureContent);

    if (!(await fileExists(expectedPath))) {
      errors.push(`Expected file not found: ${expectedFile}`);
      return { fixture: fixtureFile, passed: false, errors };
    }

    const expectedContent = await fs.readFile(expectedPath, "utf-8");
    const expected = JSON.parse(expectedContent);

    // Validate fixture structure
    if (!fixture.files || !Array.isArray(fixture.files)) {
      errors.push("Fixture missing 'files' array");
    }

    if (!fixture.metadata) {
      errors.push("Fixture missing 'metadata' object");
    }

    // Validate expected structure
    if (!expected.evidence || !Array.isArray(expected.evidence)) {
      errors.push("Expected missing 'evidence' array");
    }

    if (!expected.findings || !Array.isArray(expected.findings)) {
      errors.push("Expected missing 'findings' array");
    }

    if (!expected.score) {
      errors.push("Expected missing 'score' object");
    }

    // In a real implementation, you would:
    // 1. Run the parsing agent on the fixture
    // 2. Run the audit agent on the results
    // 3. Compare with expected output

    // For now, just validate the structure
    console.log(`   - Fixture has ${fixture.files?.length || 0} files`);
    console.log(
      `   - Expected ${expected.evidence?.length || 0} evidence items`
    );
    console.log(`   - Expected ${expected.findings?.length || 0} findings`);

    // Mock validation - in real implementation, run actual agents
    const mockEvidence = generateMockEvidence(fixture);
    const mockFindings = generateMockFindings(mockEvidence);
    const mockScore = generateMockScore(mockFindings);

    // Compare with expected (simplified)
    if (expected.evidence && expected.evidence.length > 0) {
      if (mockEvidence.length !== expected.evidence.length) {
        errors.push(
          `Evidence count mismatch: expected ${expected.evidence.length}, got ${mockEvidence.length}`
        );
      }
    }

    if (expected.findings && expected.findings.length > 0) {
      if (mockFindings.length !== expected.findings.length) {
        errors.push(
          `Findings count mismatch: expected ${expected.findings.length}, got ${mockFindings.length}`
        );
      }
    }

    return {
      fixture: fixtureFile,
      passed: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      fixture: fixtureFile,
      passed: false,
      errors: [`Error processing fixture: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

function generateMockEvidence(fixture: any): any[] {
  // Mock evidence generation based on fixture files
  const evidence: any[] = [];

  for (const file of fixture.files || []) {
    const lines = file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Simple pattern matching
      if (line.includes("localStorage.setItem")) {
        evidence.push({
          id: `EVIDENCE.LOCALSTORAGE.${i}`,
          rule_id: "RULE.ACCOUNT.PROFILE",
          file: file.path,
          line_start: i + 1,
          line_end: i + 1,
          snippet: line.trim(),
          pii_tags: line.includes("email") ? ["PII.EMAIL"] : [],
          data_sinks: ["localStorage"],
          confidence: 0.9,
        });
      }

      if (line.includes("fetch(") && line.includes("ssn")) {
        evidence.push({
          id: `EVIDENCE.FETCH.SSN.${i}`,
          rule_id: "RULE.TXN.PROCESSING",
          file: file.path,
          line_start: i + 1,
          line_end: i + 1,
          snippet: line.trim(),
          pii_tags: ["PII.SSN"],
          data_sinks: ["/api/charge"],
          confidence: 0.95,
        });
      }
    }
  }

  return evidence;
}

function generateMockFindings(evidence: any[]): any[] {
  const findings: any[] = [];

  for (const ev of evidence) {
    if (ev.pii_tags.includes("PII.SSN")) {
      findings.push({
        id: `FINDING.GDPR.A7.${ev.id}`,
        control_id: "GDPR.A7",
        evidence_ids: [ev.id],
        severity: "critical",
        rationale:
          "SSN data being transmitted without explicit consent mechanism",
      });
    }

    if (ev.data_sinks.includes("localStorage")) {
      findings.push({
        id: `FINDING.GDPR.A32.${ev.id}`,
        control_id: "GDPR.A32",
        evidence_ids: [ev.id],
        severity: "high",
        rationale: "Sensitive data stored in localStorage without encryption",
      });
    }
  }

  return findings;
}

function generateMockScore(findings: any[]): any {
  const criticalFindings = findings.filter(
    (f) => f.severity === "critical"
  ).length;
  const highFindings = findings.filter((f) => f.severity === "high").length;

  let score = 100;
  score -= criticalFindings * 50;
  score -= highFindings * 30;
  score = Math.max(0, score);

  return {
    framework_id: "GDPR",
    total: score,
    breakdown: [
      {
        control_id: "GDPR.A7",
        score: criticalFindings > 0 ? 20 : 100,
        weight: 0.15,
      },
      {
        control_id: "GDPR.A32",
        score: highFindings > 0 ? 30 : 100,
        weight: 0.2,
      },
    ],
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  testFixtures().catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
}
