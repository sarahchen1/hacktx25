"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "@/packages/openledger-core/types";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export function ReceiptsTimeline() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      const receiptsData = await fetchWithFallback(
        "/api/receipt",
        await fetchWithFallback(MOCK_PATHS.RECEIPT_LATEST, [])
      );

      // If single receipt, wrap in array
      const receiptsArray: any[] = Array.isArray(receiptsData)
        ? receiptsData
        : [receiptsData];
      // Filter out invalid receipts (null, undefined, or missing required fields)
      const validReceipts = receiptsArray.filter(
        (r) => r && typeof r === "object" && "id" in r && "timestamp" in r
      ) as Receipt[];
      setReceipts(validReceipts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (receipt: Receipt) => {
    const dataStr = JSON.stringify(receipt, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `consent-receipt-${receipt.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getChoiceIcon = (choice: boolean) => {
    return choice ? (
      <CheckCircle className="h-5 w-5 text-green-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  };

  const getChoiceColor = (choice: boolean) => {
    return choice
      ? "bg-green-900/30 text-green-300 border-green-700"
      : "bg-red-900/30 text-red-300 border-red-700";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={loadReceipts}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Consent Timeline</h2>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadReceipts}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No consent receipts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt, index) => {
            const { date, time } = formatTimestamp(receipt.timestamp);

            return (
              <div
                key={receipt.id}
                className="relative p-4 bg-slate-800/50 rounded-lg border border-slate-600/50"
              >
                {/* Timeline connector */}
                {index < receipts.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-slate-600"></div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getChoiceIcon(receipt.choice)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">
                        {receipt.gate
                          ? receipt.gate.replace("_", " ")
                          : "Unknown"}{" "}
                        Consent
                      </h3>
                      <Badge
                        variant="outline"
                        className={getChoiceColor(receipt.choice)}
                      >
                        {receipt.choice ? "Granted" : "Revoked"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-300">
                          {date} at {time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Commit:</span>
                        <span className="text-slate-300 font-mono text-xs">
                          {receipt.commit.substring(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Evidence Hash:</span>
                        <span className="text-slate-300 font-mono text-xs">
                          {receipt.evidence_hash.substring(0, 12)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Receipt ID:</span>
                        <span className="text-slate-300 font-mono text-xs">
                          {receipt.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(receipt)}
                      className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/20 hover:text-indigo-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
