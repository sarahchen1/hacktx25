"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GatePanel } from "@/components/GatePanel";
import { BudgetView } from "@/components/BudgetView";
import { DisclosurePanel } from "@/components/DisclosurePanel";
import { ReceiptBar } from "@/components/ReceiptBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Keyboard,
  HelpCircle,
  Zap,
  Eye,
  Code,
} from "lucide-react";

export default function DemoPage() {
  const [activeGate, setActiveGate] = useState<string>("txn_category");
  const [showHelp, setShowHelp] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "d" || event.key === "D") {
        // Toggle categories (demo shortcut)
        console.log("Demo: Toggle categories");
      }
      if (event.key === "r" || event.key === "R") {
        // Download receipt
        console.log("Demo: Download receipt");
      }
      if (event.key === "f" || event.key === "F") {
        // Inject drift
        console.log("Demo: Inject drift");
      }
      if (event.key === "?" || event.key === "/") {
        setShowHelp(!showHelp);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showHelp]);

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gate: activeGate, choice: true }),
      });

      if (response.ok) {
        const receipt = await response.json();
        const dataStr = JSON.stringify(receipt.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `consent-receipt-${receipt.data.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download receipt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-indigo-400" />
                <span className="text-lg font-semibold text-white">
                  OpenLedger Demo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Keyboard className="h-3 w-3 mr-1" />
                Press ? for shortcuts
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <Card className="relative w-full max-w-md bg-slate-900 border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Demo Shortcuts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Toggle Categories</span>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    D
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Download Receipt</span>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    R
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Inject Drift</span>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    F
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Show Help</span>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    ?
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Live Transparency Demo
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            See how OpenLedger automatically matches code evidence with privacy
            disclosures and enforces user consent in real-time.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400" />
                Data Usage Controls
              </h2>
              <p className="text-slate-400 text-sm">
                Toggle data usage on/off and see instant changes
              </p>
            </div>

            <GatePanel onDownloadReceipt={handleDownloadReceipt} />

            <Card className="p-4 bg-slate-900/50 border-slate-700">
              <div className="text-center">
                <h3 className="text-sm font-medium text-white mb-2">
                  Demo Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => console.log("Demo: Toggle categories")}
                  >
                    Toggle Categories (D)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={handleDownloadReceipt}
                  >
                    Download Receipt (R)
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Center Column - Feature Demo */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
                <Eye className="h-5 w-5 text-indigo-400" />
                Live Feature Demo
              </h2>
              <p className="text-slate-400 text-sm">
                Watch features change instantly based on your consent settings
              </p>
            </div>

            <BudgetView />
          </div>

          {/* Right Column - Disclosures */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-400" />
                Evidence-Backed Disclosures
              </h2>
              <p className="text-slate-400 text-sm">
                See exactly how your data is used with code evidence
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={
                    activeGate === "txn_category" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveGate("txn_category")}
                  className={
                    activeGate === "txn_category"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }
                >
                  Transaction Categories
                </Button>
                <Button
                  variant={
                    activeGate === "acct_profile" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveGate("acct_profile")}
                  className={
                    activeGate === "acct_profile"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }
                >
                  Account Profile
                </Button>
              </div>

              <DisclosurePanel gate={activeGate} />
            </div>
          </div>
        </div>

        {/* Receipt Bar */}
        <div className="mt-8">
          <ReceiptBar />
        </div>

        {/* Demo Instructions */}
        <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            How to Use This Demo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-indigo-300 mb-2">
                1. Toggle Data Usage
              </h4>
              <p className="text-sm text-slate-400">
                Use the controls on the left to enable/disable data usage. Watch
                the budget view change instantly.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-indigo-300 mb-2">
                2. View Evidence
              </h4>
              <p className="text-sm text-slate-400">
                Click "Why?" on any disclosure to see the actual code evidence
                that supports the privacy statement.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-indigo-300 mb-2">
                3. Download Receipts
              </h4>
              <p className="text-sm text-slate-400">
                Download signed consent receipts that provide verifiable proof
                of your privacy choices.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-indigo-300 mb-2">
                4. Try Shortcuts
              </h4>
              <p className="text-sm text-slate-400">
                Press D to toggle categories, R to download receipts, F to
                inject drift, and ? for help.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
