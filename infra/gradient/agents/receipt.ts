// Local Receipt Agent
// Detects manifest/code hash changes and rolls the period

import { ManifestManager } from "../loaders/hash";

export interface Receipt {
  id: string;
  gate: string;
  choice: boolean;
  commit: string;
  timestamp: string;
  evidence_hash: string;
  user_id?: string;
  signature?: string;
}

export interface DriftEvent {
  id: string;
  severity: "low" | "medium" | "high";
  endpoint: string;
  field: string;
  file: string;
  line: number;
  timestamp: string;
  status: "open" | "resolved";
  description: string;
}

export interface ReceiptResult {
  receipts: Receipt[];
  drift_events: DriftEvent[];
  evidence_updates: any[];
  ledger_hash: string;
  timestamp: string;
}

export class LocalReceiptAgent {
  private manifestManager: ManifestManager;
  private currentPeriod: string | null = null;

  constructor(kbPath: string) {
    this.manifestManager = new ManifestManager(kbPath);
  }

  async initialize(): Promise<void> {
    // Initialize with current manifest
    const manifest = await this.manifestManager.readManifest();
    if (manifest && manifest.evidence_periods.length > 0) {
      this.currentPeriod = manifest.evidence_periods[0].id;
    }
  }

  async processReceiptsAndDrift(timeRange?: {
    start: string;
    end: string;
  }): Promise<ReceiptResult> {
    const now = new Date().toISOString();

    // Check for manifest changes (drift detection)
    const hasChanges = await this.manifestManager.hasChanges();
    let driftEvents: DriftEvent[] = [];
    let evidenceUpdates: any[] = [];

    if (hasChanges) {
      // Create new evidence period
      const newPeriod = await this.manifestManager.createNewEvidencePeriod();

      // Generate drift events
      driftEvents = await this.generateDriftEvents();

      // Update evidence ledger
      evidenceUpdates = await this.updateEvidenceLedger();

      this.currentPeriod = newPeriod;
    }

    // Process consent receipts (mock data for now)
    const receipts = await this.processConsentReceipts(timeRange);

    // Calculate ledger hash
    const ledgerHash = await this.calculateLedgerHash(
      receipts,
      driftEvents,
      evidenceUpdates
    );

    return {
      receipts,
      drift_events: driftEvents,
      evidence_updates: evidenceUpdates,
      ledger_hash: ledgerHash,
      timestamp: now,
    };
  }

  private async generateDriftEvents(): Promise<DriftEvent[]> {
    const driftEvents: DriftEvent[] = [];
    const now = new Date().toISOString();

    // Compare with previous manifest
    const changes = await this.manifestManager.compareWithPrevious();

    for (const changedFile of changes.changed) {
      if (changedFile.includes("rules.yaml")) {
        driftEvents.push({
          id: `DRIFT.RULES.${Date.now()}`,
          severity: "high",
          endpoint: "N/A",
          field: "rules",
          file: changedFile,
          line: 0,
          timestamp: now,
          status: "open",
          description:
            "Rules configuration has changed - compliance review required",
        });
      }

      if (changedFile.includes("compliance_frameworks.yaml")) {
        driftEvents.push({
          id: `DRIFT.COMPLIANCE.${Date.now()}`,
          severity: "critical",
          endpoint: "N/A",
          field: "compliance",
          file: changedFile,
          line: 0,
          timestamp: now,
          status: "open",
          description:
            "Compliance framework has been updated - policy review required",
        });
      }

      if (changedFile.includes("privacy_policies.yaml")) {
        driftEvents.push({
          id: `DRIFT.POLICY.${Date.now()}`,
          severity: "medium",
          endpoint: "N/A",
          field: "policy",
          file: changedFile,
          line: 0,
          timestamp: now,
          status: "open",
          description: "Privacy policy template has been updated",
        });
      }
    }

    for (const addedFile of changes.added) {
      driftEvents.push({
        id: `DRIFT.ADDED.${Date.now()}`,
        severity: "medium",
        endpoint: "N/A",
        field: "new_file",
        file: addedFile,
        line: 0,
        timestamp: now,
        status: "open",
        description: `New file added: ${addedFile}`,
      });
    }

    for (const removedFile of changes.removed) {
      driftEvents.push({
        id: `DRIFT.REMOVED.${Date.now()}`,
        severity: "high",
        endpoint: "N/A",
        field: "removed_file",
        file: removedFile,
        line: 0,
        timestamp: now,
        status: "open",
        description: `File removed: ${removedFile}`,
      });
    }

    return driftEvents;
  }

  private async updateEvidenceLedger(): Promise<any[]> {
    // In a real implementation, this would update the evidence ledger
    // with new evidence from the latest scan
    return [
      {
        id: `EVIDENCE.UPDATE.${Date.now()}`,
        type: "ledger_update",
        timestamp: new Date().toISOString(),
        description: "Evidence ledger updated with latest scan results",
      },
    ];
  }

  private async processConsentReceipts(timeRange?: {
    start: string;
    end: string;
  }): Promise<Receipt[]> {
    // Mock consent receipts - in a real implementation, this would
    // query the database for actual consent records
    const receipts: Receipt[] = [
      {
        id: `RECEIPT.${Date.now()}.001`,
        gate: "txn_category",
        choice: true,
        commit: "abc123def456",
        timestamp: new Date().toISOString(),
        evidence_hash: await this.manifestManager.getCurrentHash(),
        user_id: "user_123",
        signature: "signature_abc123",
      },
      {
        id: `RECEIPT.${Date.now()}.002`,
        gate: "acct_profile",
        choice: false,
        commit: "abc123def456",
        timestamp: new Date().toISOString(),
        evidence_hash: await this.manifestManager.getCurrentHash(),
        user_id: "user_456",
        signature: "signature_def456",
      },
    ];

    // Filter by time range if provided
    if (timeRange) {
      return receipts.filter((receipt) => {
        const receiptTime = new Date(receipt.timestamp);
        const startTime = new Date(timeRange.start);
        const endTime = new Date(timeRange.end);
        return receiptTime >= startTime && receiptTime <= endTime;
      });
    }

    return receipts;
  }

  private async calculateLedgerHash(
    receipts: Receipt[],
    driftEvents: DriftEvent[],
    evidenceUpdates: any[]
  ): Promise<string> {
    const crypto = require("crypto");

    // Create a hash of all the data
    const data = {
      receipts: receipts.map((r) => ({
        id: r.id,
        gate: r.gate,
        choice: r.choice,
        timestamp: r.timestamp,
      })),
      drift_events: driftEvents.map((d) => ({
        id: d.id,
        severity: d.severity,
        status: d.status,
      })),
      evidence_updates: evidenceUpdates.map((e) => ({
        id: e.id,
        type: e.type,
        timestamp: e.timestamp,
      })),
      period: this.currentPeriod,
    };

    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  // Utility methods for drift detection
  async detectCodeChanges(repoPath: string): Promise<DriftEvent[]> {
    const driftEvents: DriftEvent[] = [];
    const now = new Date().toISOString();

    // In a real implementation, this would:
    // 1. Compare current code with previous scan
    // 2. Identify new endpoints, data fields, or processing logic
    // 3. Generate drift events for significant changes

    // Mock implementation
    const mockChanges = [
      {
        file: "src/api/transactions.js",
        line: 15,
        change: "Added new field 'location_data' to transaction processing",
        severity: "medium" as const,
      },
      {
        file: "src/storage/user.js",
        line: 8,
        change: "Added biometric data storage",
        severity: "high" as const,
      },
    ];

    for (const change of mockChanges) {
      driftEvents.push({
        id: `DRIFT.CODE.${Date.now()}.${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        severity: change.severity,
        endpoint: "N/A",
        field: "code_change",
        file: change.file,
        line: change.line,
        timestamp: now,
        status: "open",
        description: change.change,
      });
    }

    return driftEvents;
  }

  async getCurrentPeriod(): Promise<string | null> {
    return this.currentPeriod;
  }

  async getPeriodHistory(): Promise<
    Array<{ id: string; start: string; end: string | null; status: string }>
  > {
    const manifest = await this.manifestManager.readManifest();
    if (!manifest) return [];

    return manifest.evidence_periods.map((period: any) => ({
      id: period.id,
      start: period.start,
      end: period.end,
      status: period.status,
    }));
  }

  async closeCurrentPeriod(): Promise<void> {
    if (!this.currentPeriod) return;

    const manifest = await this.manifestManager.readManifest();
    if (!manifest) return;

    const now = new Date().toISOString();
    const currentPeriodIndex = manifest.evidence_periods.findIndex(
      (p: any) => p.id === this.currentPeriod
    );

    if (currentPeriodIndex >= 0) {
      manifest.evidence_periods[currentPeriodIndex].end = now;
      manifest.evidence_periods[currentPeriodIndex].status = "closed";
      manifest.last_updated = now;

      await this.manifestManager.writeManifest(manifest);
      this.currentPeriod = null;
    }
  }
}
