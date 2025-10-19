"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DriftEvent } from "@/packages/openledger-core/types";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import {
  AlertTriangle,
  FileText,
  Calendar,
  RefreshCw,
  CheckCircle,
  Plus,
  ExternalLink,
} from "lucide-react";

export function DriftList() {
  const [driftEvents, setDriftEvents] = useState<DriftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDriftEvents();
  }, []);

  const loadDriftEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const driftData = await fetchWithFallback(
        "/api/drift",
        await fetchWithFallback(MOCK_PATHS.DRIFT, [])
      );

      setDriftEvents(driftData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load drift events"
      );
    } finally {
      setLoading(false);
    }
  };

  const injectNewDrift = async () => {
    try {
      const response = await fetch("/api/drift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inject" }),
      });

      if (response.ok) {
        await loadDriftEvents();
      }
    } catch (err) {
      console.error("Failed to inject drift:", err);
    }
  };


  const getSeverityColor = (severity: string) => {
    const colors = {
      high: "bg-red-900/30 text-red-300 border-red-700",
      medium: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
      low: "bg-blue-900/30 text-blue-300 border-blue-700",
    };
    return (
      colors[severity as keyof typeof colors] ||
      "bg-slate-700 text-slate-300 border-slate-600"
    );
  };

  const getStatusColor = (status: string) => {
    return status === "resolved"
      ? "bg-green-900/30 text-green-300 border-green-700"
      : "bg-orange-900/30 text-orange-300 border-orange-700";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
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
            onClick={loadDriftEvents}
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
  const resolvedDrift = driftEvents.filter((d) => d.status === "resolved");

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Drift Detection</h2>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {openDrift.length} open, {resolvedDrift.length} resolved
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={injectNewDrift}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Inject Drift
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDriftEvents}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {driftEvents.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No drift events detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {driftEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={getSeverityColor(event.severity)}
                  >
                    {event.severity.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(event.status)}
                  >
                    {event.status}
                  </Badge>
                </div>
                {event.status === "open" && (
                  <Link href="/manage-policy">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-300 hover:bg-green-900/20 hover:text-green-200"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  </Link>
                )}
              </div>

              <h3 className="text-white font-medium mb-2">
                {event.description}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">
                    {event.file}:{event.line}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Endpoint:</span>
                  <span className="text-slate-300 font-mono">
                    {event.endpoint}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Field:</span>
                  <span className="text-slate-300">{event.field}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
