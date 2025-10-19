"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function RepositoryScanner() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setStatus("error");
      setMessage("Please enter a repository URL");
      return;
    }

    // Validate GitHub/GitLab URL format
    const githubRegex =
      /^https:\/\/(github|gitlab)\.com\/[\w-]+\/[\w.-]+(\.git)?$/i;
    if (!githubRegex.test(repoUrl.trim())) {
      setStatus("error");
      setMessage("Please enter a valid GitHub or GitLab repository URL");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/run-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage(
          "Scan started successfully! Results will appear below shortly."
        );
        // Collapse the scanner after successful scan
        setTimeout(() => {
          setIsCollapsed(true);
          window.location.reload();
        }, 3000);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Failed to start scan. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while starting the scan.");
      console.error("Scan error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/30 border-blue-400/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Scan Repository
            </h3>
            <p className="text-sm text-slate-400">
              Analyze a GitHub or GitLab repository for compliance
            </p>
          </div>
        </div>
        {isCollapsed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Scan Another
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>

          {status !== "idle" && (
            <div
              className={`flex items-start gap-2 p-3 rounded-md ${
                status === "success"
                  ? "bg-green-900/30 border border-green-700/50"
                  : "bg-red-900/30 border border-red-700/50"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  status === "success" ? "text-green-200" : "text-red-200"
                }`}
              >
                {message}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">What gets scanned:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-300/80">
                <li>Data collection patterns (PII, tracking, analytics)</li>
                <li>Compliance with GDPR, CCPA, and GLBA</li>
                <li>Privacy policy generation</li>
                <li>Drift detection from previous scans</li>
              </ul>
            </div>
          </div>
        </form>
      )}
    </Card>
  );
}
