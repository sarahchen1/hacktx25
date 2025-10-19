import { Suspense } from "react";
import fs from "node:fs";
import path from "node:path";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditData {
  compliance_score?: number;
  framework_breakdown?: Array<{
    framework: string;
    score: number;
    failed?: Array<{ id: string; title: string; why: string }>;
  }>;
  policy_markdown?: string;
  timestamp?: string;
}

interface ReceiptData {
  updated?: boolean;
  diff_summary?: string;
  drift_flags?: string[];
  timestamp?: string;
}

interface ErrorData {
  error: boolean;
  message: string;
  timestamp: string;
}

async function getOutputs() {
  const outDir = path.join(process.cwd(), ".out");

  try {
    const auditPath = path.join(outDir, "audit.json");
    const receiptPath = path.join(outDir, "receipt.json");
    const errorPath = path.join(outDir, "error.json");
    const evidencePath = path.join(outDir, "evidence.json");

    let audit: AuditData | null = null;
    let receipt: ReceiptData | null = null;
    let error: ErrorData | null = null;
    let hasEvidence = false;
    let lastRun: string | null = null;

    // Check for error state
    if (fs.existsSync(errorPath)) {
      error = JSON.parse(fs.readFileSync(errorPath, "utf8"));
    }

    // Load audit data
    if (fs.existsSync(auditPath)) {
      audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
      const stats = fs.statSync(auditPath);
      lastRun = stats.mtime.toISOString();
    }

    // Load receipt data
    if (fs.existsSync(receiptPath)) {
      receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    }

    // Check if evidence exists
    hasEvidence = fs.existsSync(evidencePath);

    return { audit, receipt, error, hasEvidence, lastRun };
  } catch (err) {
    return {
      audit: null,
      receipt: null,
      error: {
        error: true,
        message: `Failed to load outputs: ${err}`,
        timestamp: new Date().toISOString(),
      },
      hasEvidence: false,
      lastRun: null,
    };
  }
}

async function OpenLedgerDashboard() {
  const { audit, receipt, error, hasEvidence, lastRun } = await getOutputs();

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">OpenLedger Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Privacy compliance scanning powered by Gemini AI
        </p>
        {lastRun && (
          <p className="text-sm text-muted-foreground mt-2">
            Last successful run: {new Date(lastRun).toLocaleString()}
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(error.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Run Scan Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scan Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/run-scan" method="POST" className="flex gap-4">
            <input
              type="text"
              name="repo"
              placeholder="https://github.com/org/repo"
              className="flex-1 px-4 py-2 border rounded"
              required
            />
            <Button type="submit">Run Scan</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Enter a GitHub repository URL to scan for privacy compliance
          </p>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      {audit && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold mb-4">
              {audit.compliance_score || 0}/100
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {audit.framework_breakdown?.map((framework) => (
                <div key={framework.framework} className="border p-4 rounded">
                  <div className="font-semibold">{framework.framework}</div>
                  <div className="text-2xl">{framework.score}/100</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Findings */}
      {audit?.framework_breakdown && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top 5 Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audit.framework_breakdown
                .flatMap((fb) => fb.failed || [])
                .slice(0, 5)
                .map((finding, idx) => (
                  <div key={idx} className="border-l-4 border-destructive pl-4">
                    <div className="font-semibold">{finding.id}</div>
                    <div className="text-sm">{finding.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {finding.why}
                    </div>
                  </div>
                ))}
              {(!audit.framework_breakdown ||
                audit.framework_breakdown.flatMap((fb) => fb.failed || [])
                  .length === 0) && (
                <p className="text-muted-foreground">
                  No compliance issues found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Preview */}
      {audit?.policy_markdown && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generated Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm">
                {audit.policy_markdown}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drift Summary */}
      {receipt && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Drift Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Status: </span>
                <span
                  className={
                    receipt.updated ? "text-orange-600" : "text-green-600"
                  }
                >
                  {receipt.updated ? "Changes Detected" : "No Changes"}
                </span>
              </div>
              {receipt.diff_summary && (
                <div>
                  <span className="font-semibold">Summary: </span>
                  {receipt.diff_summary}
                </div>
              )}
              {receipt.drift_flags && receipt.drift_flags.length > 0 && (
                <div>
                  <span className="font-semibold">Flags: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {receipt.drift_flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Links */}
      <Card>
        <CardHeader>
          <CardTitle>Download Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {hasEvidence && (
              <a
                href="/api/download/evidence"
                download="evidence.json"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Download evidence.json
              </a>
            )}
            {audit && (
              <a
                href="/api/download/audit"
                download="audit.json"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Download audit.json
              </a>
            )}
            {receipt && (
              <a
                href="/api/download/receipt"
                download="receipt.json"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Download receipt.json
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OpenLedgerPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <OpenLedgerDashboard />
    </Suspense>
  );
}
