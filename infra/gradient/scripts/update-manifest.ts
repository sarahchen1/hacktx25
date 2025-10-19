#!/usr/bin/env tsx
// Update Manifest Script
// Updates _manifest.yaml with current file hashes

import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import { createHash } from "crypto";

async function updateManifest(): Promise<void> {
  const kbPath = path.join(__dirname, "../kb");
  const manifestPath = path.join(kbPath, "_manifest.yaml");

  console.log("📝 Updating manifest...");

  try {
    // Read current manifest
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = yaml.load(manifestContent) as any;

    // Files to hash
    const files = [
      "rules.yaml",
      "compliance_frameworks.yaml",
      "privacy_policies.yaml",
      "schema.json",
      "prompts/parsing.system.md",
      "prompts/audit.system.md",
      "prompts/answer.system.md",
      "prompts/receipt.system.md",
      "prompts/classifier.system.md",
      "prompts/copywriter.system.md",
    ];

    // Update file hashes
    for (const file of files) {
      const filePath = path.join(kbPath, file);

      try {
        const content = await fs.readFile(filePath, "utf-8");
        const hash = createHash("sha256").update(content).digest("hex");
        const stats = await fs.stat(filePath);

        // Find file entry in manifest
        const fileEntry = manifest.files.find((f: any) => f.path === file);
        if (fileEntry) {
          fileEntry.sha256 = hash;
          fileEntry.size = stats.size;
          fileEntry.last_modified = stats.mtime.toISOString();
          console.log(`✅ Updated ${file}: ${hash.substring(0, 8)}...`);
        } else {
          console.log(`⚠️  File not found in manifest: ${file}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not update ${file}: ${error.message}`);
      }
    }

    // Update manifest timestamp
    manifest.last_updated = new Date().toISOString();

    // Write updated manifest
    const updatedContent = yaml.dump(manifest, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await fs.writeFile(manifestPath, updatedContent);

    console.log("✅ Manifest updated successfully");
  } catch (error) {
    console.error("❌ Failed to update manifest:", error);
    process.exit(1);
  }
}

// Run update if called directly
if (require.main === module) {
  updateManifest().catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  });
}
