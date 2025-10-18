"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Evidence } from "@/packages/openledger-core/types";
import { fetchWithFallback, MOCK_PATHS } from "@/lib/api";
import { X, FileText, Code, ExternalLink, Calendar } from "lucide-react";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gate: string;
  evidenceRefs: string[];
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  gate,
  evidenceRefs,
}: EvidenceDrawerProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadEvidence();
    }
  }, [isOpen, gate]);

  const loadEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const evidenceData = await fetchWithFallback(
        `/api/evidence?gate=${encodeURIComponent(gate)}`,
        await fetchWithFallback(MOCK_PATHS.EVIDENCE, [])
      );

      // Filter evidence based on the provided references
      const filteredEvidence = evidenceData.filter((e: Evidence) =>
        evidenceRefs.some(
          (ref) => ref.includes(e.file) && ref.includes(e.line.toString())
        )
      );

      setEvidence(filteredEvidence);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="bg-slate-900 border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">
                Code Evidence
              </h2>
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                {evidenceRefs.length} source
                {evidenceRefs.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={loadEvidence}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && evidence.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No evidence found for this gate</p>
              </div>
            )}

            {!loading && !error && evidence.length > 0 && (
              <div className="space-y-6">
                {evidence.map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="bg-slate-800/50 p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <span className="font-mono text-sm text-white">
                            {item.file}
                          </span>
                          <span className="text-slate-400">:</span>
                          <span className="text-indigo-400 font-semibold">
                            {item.line}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={getMethodColor(item.method)}
                        >
                          {item.method}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-mono">{item.endpoint}</span>
                        <Calendar className="h-4 w-4 ml-4" />
                        <span>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Data Fields Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.fields.map((field, fieldIndex) => (
                          <Badge
                            key={fieldIndex}
                            variant="secondary"
                            className="bg-indigo-900/30 text-indigo-300 border-indigo-700"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                This evidence shows exactly how your data is used in our
                codebase
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
