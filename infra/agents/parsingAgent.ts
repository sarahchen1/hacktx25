import { generateJSON } from "../ai/gemini";
import { selectKbSections, readText } from "../kb/loadKb";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { EvidenceSchema } from "./schemas";

export async function runParsingAgent({
  repoUrl,
  branch = "main",
}: {
  repoUrl: string;
  branch?: string;
}) {
  // Use OS temp directory instead of .work/
  const tempDir = os.tmpdir();
  const work = path.join(tempDir, `openledger-scan-${Date.now()}`);

  try {
    fs.mkdirSync(work, { recursive: true });

    try {
      execSync(`git clone --depth=1 -b ${branch} ${repoUrl} ${work}`, {
        stdio: "ignore",
        timeout: 60000, // 1 minute timeout for clone
      });
    } catch (error) {
      console.warn("Git clone failed:", error);
      // Clean up temp directory
      try {
        fs.rmSync(work, { recursive: true, force: true });
      } catch {}
      return { repo_url: repoUrl, artifacts: [] };
    }

    // Sample static analysis: gather code+api snippets
    let files: string[] = [];
    try {
      const fdOutput = execSync(
        `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.java" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.env" \\) | head -400`,
        { cwd: work }
      );
      files = fdOutput
        .toString()
        .trim()
        .split("\n")
        .filter((f) => f.length > 0);
    } catch (error) {
      console.warn("File discovery failed, using basic glob");
      files = [];
    }

    const snippets: string[] = [];
    const priorityFiles: string[] = [];
    const otherFiles: string[] = [];

    // Separate priority files (API routes, configs, etc.)
    for (const f of files) {
      const isApiRoute = /\/(api|routes?|handlers?|controllers?)\//i.test(f);
      const isConfigOrEnv = /\.(env|config|json|ya?ml)$/i.test(f);
      const isLibOrUtil = /\/(lib|utils?|services?|helpers?)\//i.test(f);

      if (isApiRoute || isConfigOrEnv || isLibOrUtil) {
        priorityFiles.push(f);
      } else {
        otherFiles.push(f);
      }
    }

    // Process priority files first
    for (const f of [...priorityFiles, ...otherFiles]) {
      try {
        const p = path.join(work, f);
        const txt = fs.readFileSync(p, "utf8").slice(0, 4000);

        // Expanded detection patterns for data collection
        const hasDataCollection =
          // PII and tracking
          /(email|cookie|localStorage|sessionStorage|ga4|mixpanel|segment|ip|address|ssn|dob|phone|geoloc|consent|privacy|analytics|tracking)/i.test(
            txt
          ) ||
          // API and database operations
          /(fetch|axios|request|query|mutation|POST|PUT|PATCH|DELETE|INSERT|UPDATE|SELECT)/i.test(
            txt
          ) ||
          // Financial/account data
          /(account|transaction|purchase|payment|balance|transfer|customer|user)/i.test(
            txt
          ) ||
          // Common data patterns
          /(password|token|auth|session|profile|personal|sensitive|confidential)/i.test(
            txt
          ) ||
          // API route indicators
          /NextRequest|NextResponse|Route|GET|POST|api\//i.test(txt);

        if (hasDataCollection) {
          snippets.push(`FILE: ${f}\n${txt}`);
        }

        if (snippets.join("\n\n").length > 180000) break;
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    const rules = selectKbSections({
      file: "rules.yaml",
      keywords: ["pii", "tracking", "storage", "consent", "analytics"],
    });
    const system = readText("prompts/parsing.system.md");
    const user = [
      "You will extract structured *evidence* of data collection.",
      "Return JSON matching the Evidence schema.",
      `Repo: ${repoUrl}`,
      `Rules:\n${rules}`,
      `Snippets:\n${snippets.join("\n\n")}`,
    ].join("\n\n");

    try {
      const out = await generateJSON({
        system,
        user,
        schemaHint: EvidenceSchema,
      });
      out.repo_url = repoUrl;
      return out;
    } catch (error) {
      console.error("Parsing agent failed:", error);
      return { repo_url: repoUrl, artifacts: [] };
    }
  } finally {
    // Always clean up the temporary directory
    try {
      console.log(`Cleaning up temp directory: ${work}`);
      fs.rmSync(work, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("Failed to cleanup temp directory:", cleanupError);
    }
  }
}
