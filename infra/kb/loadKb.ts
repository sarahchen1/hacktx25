import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const KB_DIR = path.resolve(process.cwd(), "infra/kb/files");

export function readText(rel: string) {
  return fs.readFileSync(path.join(KB_DIR, rel), "utf8");
}
export function readYaml(rel: string) {
  return YAML.parse(readText(rel));
}

// naive retrieval: pick top-N sections containing any keyword
export function selectKbSections({
  file,
  keywords,
  maxChars = 12000,
}: {
  file: string;
  keywords: string[];
  maxChars?: number;
}) {
  const text = readText(file);
  const lines = text.split(/\r?\n/);
  const hitScores = lines.map((ln, i) => ({
    i,
    ln,
    score: keywords.reduce(
      (s, k) => s + (ln.toLowerCase().includes(k.toLowerCase()) ? 1 : 0),
      0
    ),
  }));
  const selected = hitScores
    .filter((h) => h.score > 0)
    .map((h) => h.ln)
    .join("\n");
  return (selected || text).slice(0, maxChars);
}
