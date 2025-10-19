// Local Parsing Agent
// Takes a repo path, loads KB, runs detectors regex/AST, outputs Evidence[] with rule_id

import { promises as fs } from "fs";
import path from "path";
import { KBLoader } from "../loaders/kb";
import { ManifestManager } from "../loaders/hash";

export interface ParsingConfig {
  includePatterns: string[];
  excludePatterns: string[];
  extractEvidence: boolean;
  analyzeDataFlows: boolean;
  detectPII: boolean;
}

export interface ParsingResult {
  evidence: Evidence[];
  data_flows: DataFlow[];
  pii_fields: string[];
  endpoints: string[];
  db_operations: DatabaseOperation[];
  scan_metadata: ScanMetadata;
}

export interface Evidence {
  id: string;
  rule_id: string;
  file: string;
  line_start: number;
  line_end: number;
  snippet: string;
  pii_tags: string[];
  data_sinks: string[];
  confidence: number;
}

export interface DataFlow {
  source: string;
  destination: string;
  data_type: string;
  purpose: string;
  fields: string[];
}

export interface DatabaseOperation {
  table: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  fields: string[];
  conditions?: string[];
}

export interface ScanMetadata {
  repo_url: string;
  commit_hash: string;
  scan_timestamp: string;
  files_scanned: number;
}

export class LocalParsingAgent {
  private kb: any;
  private kbLoader: KBLoader;
  private manifestManager: ManifestManager;

  constructor(kbPath: string) {
    this.kbLoader = new KBLoader(kbPath);
    this.manifestManager = new ManifestManager(kbPath);
  }

  async initialize(): Promise<void> {
    this.kb = await this.kbLoader.load();
  }

  async parseCodebase(
    repoPath: string,
    config: ParsingConfig,
    metadata: { repo_url: string; commit_hash?: string }
  ): Promise<ParsingResult> {
    const evidence: Evidence[] = [];
    const dataFlows: DataFlow[] = [];
    const piiFields = new Set<string>();
    const endpoints = new Set<string>();
    const dbOperations: DatabaseOperation[] = [];

    // Get all files matching patterns
    const files = await this.getFiles(
      repoPath,
      config.includePatterns,
      config.excludePatterns
    );

    for (const filePath of files) {
      const content = await fs.readFile(filePath, "utf-8");
      const fileEvidence = await this.analyzeFile(filePath, content);
      evidence.push(...fileEvidence);

      // Extract additional metadata
      this.extractEndpoints(content, endpoints);
      this.extractDatabaseOperations(content, dbOperations);
      this.extractPIIFields(content, piiFields);
    }

    // Build data flows from evidence
    if (config.analyzeDataFlows) {
      const flows = this.buildDataFlows(evidence);
      dataFlows.push(...flows);
    }

    return {
      evidence,
      data_flows: dataFlows,
      pii_fields: Array.from(piiFields),
      endpoints: Array.from(endpoints),
      db_operations: dbOperations,
      scan_metadata: {
        repo_url: metadata.repo_url,
        commit_hash: metadata.commit_hash || "unknown",
        scan_timestamp: new Date().toISOString(),
        files_scanned: files.length,
      },
    };
  }

  private async getFiles(
    repoPath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<string[]> {
    const files: string[] = [];

    async function walkDir(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (
            !excludePatterns.some((pattern) =>
              fullPath.includes(pattern.replace("**/", ""))
            )
          ) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if file matches include patterns
          const matchesInclude = includePatterns.some((pattern) => {
            const regex = new RegExp(
              pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")
            );
            return regex.test(fullPath);
          });

          const matchesExclude = excludePatterns.some((pattern) => {
            const regex = new RegExp(
              pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")
            );
            return regex.test(fullPath);
          });

          if (matchesInclude && !matchesExclude) {
            files.push(fullPath);
          }
        }
      }
    }

    await walkDir(repoPath);
    return files;
  }

  private async analyzeFile(
    filePath: string,
    content: string
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];
    const lines = content.split("\n");

    // Get detectors from KB
    const detectors = this.kb.rules.detectors || [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      for (const detector of detectors) {
        const matches = this.runDetector(detector, line);

        for (const match of matches) {
          const piiTags = this.identifyPIITags(line, detector.pii_tags || []);
          const dataSinks = this.identifyDataSinks(line, detector);
          const ruleId = this.mapToRule(detector, match);

          evidence.push({
            id: `EVIDENCE.${detector.id}.${lineNumber}`,
            rule_id: ruleId,
            file: filePath,
            line_start: lineNumber,
            line_end: lineNumber,
            snippet: line.trim(),
            pii_tags: piiTags,
            data_sinks: dataSinks,
            confidence: this.calculateConfidence(detector, match, piiTags),
          });
        }
      }
    }

    return evidence;
  }

  private runDetector(detector: any, line: string): any[] {
    if (detector.type === "regex") {
      const regex = new RegExp(detector.pattern, "g");
      const matches = [];
      let match;

      while ((match = regex.exec(line)) !== null) {
        const result: any = {};
        for (let i = 0; i < detector.captures.length; i++) {
          result[detector.captures[i]] = match[i + 1];
        }
        matches.push(result);
      }

      return matches;
    }

    return [];
  }

  private identifyPIITags(line: string, detectorPiiTags: string[]): string[] {
    const piiTags: string[] = [];

    for (const pii of this.kb.rules.taxonomies?.pii || []) {
      for (const pattern of pii.patterns) {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          piiTags.push(pii.id);
        }
      }
    }

    return piiTags;
  }

  private identifyDataSinks(line: string, detector: any): string[] {
    const sinks: string[] = [];

    // Identify common data sinks
    if (line.includes("localStorage")) {
      sinks.push("localStorage");
    }
    if (line.includes("sessionStorage")) {
      sinks.push("sessionStorage");
    }
    if (line.includes("fetch(") || line.includes("axios.")) {
      const urlMatch = line.match(/['"`]([^'"`]+)['"`]/);
      if (urlMatch) {
        sinks.push(urlMatch[1]);
      }
    }
    if (
      line.includes("INSERT") ||
      line.includes("UPDATE") ||
      line.includes("SELECT")
    ) {
      const tableMatch = line.match(
        /FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i
      );
      if (tableMatch) {
        sinks.push(tableMatch[1] || tableMatch[2] || tableMatch[3]);
      }
    }

    return sinks;
  }

  private mapToRule(detector: any, match: any): string {
    // Find the best matching rule based on detector and match context
    const rules = this.kb.rules.mapping || [];

    for (const rule of rules) {
      if (rule.detectors?.includes(detector.id)) {
        // Additional matching logic based on match content
        if (match.operation && rule.match?.endpoint) {
          return rule.id;
        }
        if (match.table && rule.data_category === "financial_transaction") {
          return rule.id;
        }
      }
    }

    // Default fallback
    return "RULE.UNKNOWN";
  }

  private calculateConfidence(
    detector: any,
    match: any,
    piiTags: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for PII matches
    if (piiTags.length > 0) {
      confidence += 0.3;
    }

    // Increase confidence for specific patterns
    if (
      detector.id === "DETECTOR.LOCALSTORAGE" &&
      match.operation === "setItem"
    ) {
      confidence += 0.2;
    }

    if (detector.id === "DETECTOR.FETCH_REQUEST" && match.url) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private extractEndpoints(content: string, endpoints: Set<string>): void {
    const endpointRegex = /(GET|POST|PUT|DELETE|PATCH)\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = endpointRegex.exec(content)) !== null) {
      endpoints.add(`${match[1]} ${match[2]}`);
    }
  }

  private extractDatabaseOperations(
    content: string,
    dbOperations: DatabaseOperation[]
  ): void {
    const dbRegex =
      /(SELECT|INSERT|UPDATE|DELETE)\s+.*?FROM\s+(\w+)|INSERT\s+INTO\s+(\w+)|UPDATE\s+(\w+)/gi;
    let match;

    while ((match = dbRegex.exec(content)) !== null) {
      const operation = match[1] as "SELECT" | "INSERT" | "UPDATE" | "DELETE";
      const table = match[2] || match[3] || match[4];

      dbOperations.push({
        table,
        operation,
        fields: [], // Would need more sophisticated parsing
        conditions: [],
      });
    }
  }

  private extractPIIFields(content: string, piiFields: Set<string>): void {
    for (const pii of this.kb.rules.taxonomies?.pii || []) {
      for (const pattern of pii.patterns) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          piiFields.add(pii.id);
        }
      }
    }
  }

  private buildDataFlows(evidence: Evidence[]): DataFlow[] {
    const flows: DataFlow[] = [];

    // Simple data flow analysis based on evidence
    for (const ev of evidence) {
      if (ev.data_sinks.length > 0) {
        flows.push({
          source: "user_input",
          destination: ev.data_sinks[0],
          data_type:
            ev.pii_tags.length > 0
              ? "personal_information"
              : "transaction_data",
          purpose: this.getPurposeFromRule(ev.rule_id),
          fields: ev.pii_tags,
        });
      }
    }

    return flows;
  }

  private getPurposeFromRule(ruleId: string): string {
    const rule = this.kb.rules.mapping?.find((r: any) => r.id === ruleId);
    return rule?.purpose || "unknown";
  }
}
