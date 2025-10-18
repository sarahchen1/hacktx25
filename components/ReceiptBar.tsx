"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "@/packages/openledger-core/types";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import {
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function ReceiptBar() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLatestReceipt();
  }, []);

  const loadLatestReceipt = async () => {
    setLoading(true);
    setError(null);

    try {
      const receiptData = await fetchWithFallback(
        "/api/receipt?latest=true",
        await fetchWithFallback(MOCK_PATHS.RECEIPT_LATEST, null)
      );

      setReceipt(receiptData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!receipt) return;

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

  const getStatusIcon = (choice: boolean) => {
    return choice ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-400" />
    );
  };

  const getStatusColor = (choice: boolean) => {
    return choice
      ? "bg-green-900/30 text-green-300 border-green-700"
      : "bg-red-900/30 text-red-300 border-red-700";
  };

  if (loading) {
    return (
      <Card className="p-4 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/6"></div>
          <div className="h-8 bg-slate-700 rounded w-20 ml-auto"></div>
        </div>
      </Card>
    );
  }

  if (error || !receipt) {
    return (
      <Card className="p-4 bg-slate-900/50 border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <span className="text-slate-400">No consent receipt available</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLatestReceipt}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(receipt.choice)}
            <span className="text-white font-medium">
              Latest Consent Receipt
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getStatusColor(receipt.choice)}>
              {receipt.gate.replace("_", " ")}{" "}
              {receipt.choice ? "Enabled" : "Disabled"}
            </Badge>

            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(receipt.timestamp).toLocaleDateString()} at{" "}
                {new Date(receipt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 font-mono">
            {receipt.commit.substring(0, 8)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReceipt}
            className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/20 hover:text-indigo-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}
