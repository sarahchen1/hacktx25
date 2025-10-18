"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Evidence } from "@/packages/openledger-core/types";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import {
  FileText,
  Code,
  Calendar,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export function EvidenceTable() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const evidenceData = await fetchWithFallback(
        "/api/evidence",
        await fetchWithFallback(MOCK_PATHS.EVIDENCE, [])
      );

      setEvidence(evidenceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-green-900/30 text-green-300 border-green-700",
      POST: "bg-blue-900/30 text-blue-300 border-blue-700",
      PUT: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
      DELETE: "bg-red-900/30 text-red-300 border-red-700",
      PATCH: "bg-purple-900/30 text-purple-300 border-purple-700",
    };
    return (
      colors[method as keyof typeof colors] ||
      "bg-slate-700 text-slate-300 border-slate-600"
    );
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
            {[1, 2, 3, 4, 5].map((i) => (
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
            onClick={loadEvidence}
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
          <Code className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Code Evidence</h2>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {evidence.length} entries
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadEvidence}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {evidence.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No evidence found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  File
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  Endpoint
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  Method
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  Fields
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="font-mono text-sm text-white">
                        {item.file.split("/").pop()}
                      </span>
                      <span className="text-slate-500">:</span>
                      <span className="text-indigo-400 font-semibold">
                        {item.line}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                      <span className="font-mono text-sm text-slate-300">
                        {item.endpoint}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={getMethodColor(item.method)}
                    >
                      {item.method}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.fields.slice(0, 3).map((field, fieldIndex) => (
                        <Badge
                          key={fieldIndex}
                          variant="secondary"
                          className="bg-indigo-900/30 text-indigo-300 border-indigo-700 text-xs"
                        >
                          {field}
                        </Badge>
                      ))}
                      {item.fields.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-700 text-slate-300 text-xs"
                        >
                          +{item.fields.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
