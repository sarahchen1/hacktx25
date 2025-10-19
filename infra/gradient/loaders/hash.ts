// Hash utilities for manifest management

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface FileInfo {
  path: string;
  sha256: string;
  size: number;
  last_modified: string;
}

export interface Manifest {
  kb_version: string;
  created_at: string;
  last_updated: string;
  files: FileInfo[];
  evidence_periods: Array<{
    id: string;
    start: string;
    end: string | null;
    manifest_hash: string;
    status: "active" | "closed";
  }>;
}

export class ManifestManager {
  private kbPath: string;
  private manifestPath: string;

  constructor(kbPath: string) {
    this.kbPath = kbPath;
    this.manifestPath = path.join(kbPath, "_manifest.yaml");
  }

  async generateManifest(): Promise<Manifest> {
    const files = await this.scanFiles();
    const now = new Date().toISOString();

    return {
      kb_version: "1.0.0",
      created_at: now,
      last_updated: now,
      files,
      evidence_periods: [
        {
          id: `PERIOD.${now.split("T")[0].replace(/-/g, ".")}`,
          start: now,
          end: null,
          manifest_hash: "TBD", // Will be calculated after manifest is written
          status: "active",
        },
      ],
    };
  }

  private async scanFiles(): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const filePaths = [
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

    for (const filePath of filePaths) {
      const fullPath = path.join(this.kbPath, filePath);
      try {
        const stats = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath, "utf-8");
        const sha256 = this.calculateSHA256(content);

        files.push({
          path: filePath,
          sha256,
          size: stats.size,
          last_modified: stats.mtime.toISOString(),
        });
      } catch (error) {
        console.warn(`Could not read file ${filePath}:`, error);
      }
    }

    return files;
  }

  private calculateSHA256(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  async writeManifest(manifest: Manifest): Promise<string> {
    const yaml = require("js-yaml");
    const content = yaml.dump(manifest, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    // Calculate hash of the manifest content
    const manifestHash = this.calculateSHA256(content);

    // Update the manifest hash in the evidence period
    if (manifest.evidence_periods.length > 0) {
      manifest.evidence_periods[0].manifest_hash = manifestHash;
    }

    // Write the updated manifest
    const updatedContent = yaml.dump(manifest, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await fs.writeFile(this.manifestPath, updatedContent, "utf-8");
    return manifestHash;
  }

  async readManifest(): Promise<Manifest | null> {
    try {
      const content = await fs.readFile(this.manifestPath, "utf-8");
      const yaml = require("js-yaml");
      return yaml.load(content) as Manifest;
    } catch (error) {
      console.warn("Could not read manifest:", error);
      return null;
    }
  }

  async hasChanges(): Promise<boolean> {
    const currentManifest = await this.readManifest();
    if (!currentManifest) return true;

    const newFiles = await this.scanFiles();

    // Check if file count changed
    if (newFiles.length !== currentManifest.files.length) {
      return true;
    }

    // Check if any file hashes changed
    for (const newFile of newFiles) {
      const oldFile = currentManifest.files.find(
        (f) => f.path === newFile.path
      );
      if (!oldFile || oldFile.sha256 !== newFile.sha256) {
        return true;
      }
    }

    return false;
  }

  async getCurrentHash(): Promise<string> {
    const manifest = await this.readManifest();
    if (!manifest || manifest.evidence_periods.length === 0) {
      return "no-manifest";
    }
    return manifest.evidence_periods[0].manifest_hash;
  }

  async createNewEvidencePeriod(): Promise<string> {
    const now = new Date().toISOString();
    const periodId = `PERIOD.${now.split("T")[0].replace(/-/g, ".")}`;

    const manifest = await this.readManifest();
    if (manifest) {
      // Close current period
      if (manifest.evidence_periods.length > 0) {
        manifest.evidence_periods[0].end = now;
        manifest.evidence_periods[0].status = "closed";
      }

      // Add new period
      manifest.evidence_periods.unshift({
        id: periodId,
        start: now,
        end: null,
        manifest_hash: "TBD",
        status: "active",
      });

      manifest.last_updated = now;
      await this.writeManifest(manifest);
    }

    return periodId;
  }

  // Utility methods for drift detection
  async getFileHash(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.kbPath, filePath);
      const content = await fs.readFile(fullPath, "utf-8");
      return this.calculateSHA256(content);
    } catch (error) {
      return null;
    }
  }

  async compareWithPrevious(): Promise<{
    changed: string[];
    added: string[];
    removed: string[];
  }> {
    const currentManifest = await this.readManifest();
    if (!currentManifest) {
      return { changed: [], added: [], removed: [] };
    }

    const newFiles = await this.scanFiles();
    const oldFiles = currentManifest.files;

    const changed: string[] = [];
    const added: string[] = [];
    const removed: string[] = [];

    // Find changed and added files
    for (const newFile of newFiles) {
      const oldFile = oldFiles.find((f) => f.path === newFile.path);
      if (!oldFile) {
        added.push(newFile.path);
      } else if (oldFile.sha256 !== newFile.sha256) {
        changed.push(newFile.path);
      }
    }

    // Find removed files
    for (const oldFile of oldFiles) {
      const newFile = newFiles.find((f) => f.path === oldFile.path);
      if (!newFile) {
        removed.push(oldFile.path);
      }
    }

    return { changed, added, removed };
  }
}
