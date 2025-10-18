import crypto from "crypto";

export interface ReceiptData {
  gate: string;
  choice: boolean;
  commit: string;
  timestamp: string;
  evidence_hash: string;
  user_id?: string;
}

export function signReceipt(data: ReceiptData): string {
  // Create a deterministic hash of the receipt data
  const payload = JSON.stringify({
    gate: data.gate,
    choice: data.choice,
    commit: data.commit,
    timestamp: data.timestamp,
    evidence_hash: data.evidence_hash,
    user_id: data.user_id || "anonymous",
  });

  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function verifyReceipt(data: ReceiptData, signature: string): boolean {
  const expectedSignature = signReceipt(data);
  return expectedSignature === signature;
}

export function generateCommitHash(): string {
  // Generate a mock commit hash for demo purposes
  return crypto.randomBytes(8).toString("hex");
}

export function generateEvidenceHash(evidence: any[]): string {
  // Create hash of all evidence for integrity checking
  const evidenceString = JSON.stringify(
    evidence.sort((a, b) =>
      `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`)
    )
  );

  return crypto.createHash("sha256").update(evidenceString).digest("hex");
}
