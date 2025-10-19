import { generateJSON } from "../ai/gemini";
import { selectKbSections, readText } from "../kb/loadKb";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { EvidenceSchema } from "./schemas";

export async function runParsingAgent({
  repoUrl,
  branch = "main",
}: {
  repoUrl: string;
  branch?: string;
}) {
  const work = path.join(process.cwd(), ".work/repos", `${Date.now()}`);
  fs.mkdirSync(work, { recursive: true });

  try {
    execSync(`git clone --depth=1 -b ${branch} ${repoUrl} ${work}`, {
      stdio: "ignore",
    });
  } catch (error) {
    console.warn("Git clone failed, returning empty evidence set");
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
  for (const f of files) {
    try {
      const p = path.join(work, f);
      const txt = fs.readFileSync(p, "utf8").slice(0, 4000);
      if (
        /(email|cookie|localStorage|sessionStorage|ga4|mixpanel|segment|ip|address|ssn|dob|phone|geoloc|consent|privacy|analytics|tracking)/i.test(
          txt
        )
      ) {
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
}
