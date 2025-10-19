"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import { DriftEvent } from "@/packages/openledger-core/types";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export function ComplianceScore() {
  const [score, setScore] = useState(0);
  const [driftEvents, setDriftEvents] = useState<DriftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const driftData = await fetchWithFallback(
        "/api/drift",
        await fetchWithFallback(MOCK_PATHS.DRIFT, [])
      );

      // Ensure driftData is an array
      const driftArray = Array.isArray(driftData) ? driftData : [];
      setDriftEvents(driftArray);

      // Calculate compliance score
      const openDrift = driftArray.filter(
        (d: DriftEvent) => d.status === "open"
      );
      const highSeverity = openDrift.filter(
        (d: DriftEvent) => d.severity === "high"
      ).length;
      const mediumSeverity = openDrift.filter(
        (d: DriftEvent) => d.severity === "medium"
      ).length;
      const lowSeverity = openDrift.filter(
        (d: DriftEvent) => d.severity === "low"
      ).length;

      // Score calculation: 100 - (high * 20 + medium * 10 + low * 5)
      const calculatedScore = Math.max(
        0,
        100 - (highSeverity * 20 + mediumSeverity * 10 + lowSeverity * 5)
      );
      setScore(calculatedScore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load compliance data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-900/20 border-green-700";
    if (score >= 70) return "bg-yellow-900/20 border-yellow-700";
    if (score >= 50) return "bg-orange-900/20 border-orange-700";
    return "bg-red-900/20 border-red-700";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-6 w-6 text-green-400" />;
    if (score >= 70)
      return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    return <AlertTriangle className="h-6 w-6 text-red-400" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/2"></div>
          <div className="h-16 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
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
            onClick={loadComplianceData}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const openDrift = driftEvents.filter((d) => d.status === "open");
  const highSeverity = openDrift.filter((d) => d.severity === "high").length;
  const mediumSeverity = openDrift.filter(
    (d) => d.severity === "medium"
  ).length;
  const lowSeverity = openDrift.filter((d) => d.severity === "low").length;

  return (
    <Card
      className={`p-6 bg-slate-900/50 border-slate-700 ${getScoreBgColor(
        score
      )}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Compliance Score</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadComplianceData}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          {getScoreIcon(score)}
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-2xl text-slate-400">/100</span>
        </div>
        <p className={`text-lg font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Open Drift Events</span>
          <Badge
            variant="outline"
            className={
              openDrift.length > 0
                ? "border-red-600 text-red-300"
                : "border-green-600 text-green-300"
            }
          >
            {openDrift.length}
          </Badge>
        </div>

        {openDrift.length > 0 && (
          <div className="space-y-2 pl-4">
            {highSeverity > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-300">High Severity</span>
                <Badge
                  variant="outline"
                  className="border-red-600 text-red-300"
                >
                  {highSeverity}
                </Badge>
              </div>
            )}
            {mediumSeverity > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">Medium Severity</span>
                <Badge
                  variant="outline"
                  className="border-yellow-600 text-yellow-300"
                >
                  {mediumSeverity}
                </Badge>
              </div>
            )}
            {lowSeverity > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-300">Low Severity</span>
                <Badge
                  variant="outline"
                  className="border-orange-600 text-orange-300"
                >
                  {lowSeverity}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Score based on open drift events: High (-20), Medium (-10), Low (-5)
        </p>
      </div>
    </Card>
  );
}
