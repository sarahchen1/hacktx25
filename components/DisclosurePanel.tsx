"use client";

import { useState } from "react";
import { useUICopy } from "@/lib/hooks/useUICopy";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { FileText, HelpCircle, Clock, Shield } from "lucide-react";

interface DisclosurePanelProps {
  gate: string;
}

export function DisclosurePanel({ gate }: DisclosurePanelProps) {
  const { uiCopy, loading, error } = useUICopy(gate);
  const [showEvidence, setShowEvidence] = useState(false);

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (error || !uiCopy) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="text-center text-slate-400">
          <p>Unable to load disclosure information</p>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      </Card>
    );
  }

  const getPurposeIcon = (purpose: string) => {
    const icons = {
      budgeting: "📊",
      account_management: "👤",
      analytics: "📈",
      recommendations: "💡",
      security: "🔒",
      compliance: "📋",
    };
    return icons[purpose as keyof typeof icons] || "⚙️";
  };

  const getRetentionColor = (retention: string) => {
    const months = parseInt(retention.replace(/\D/g, ""));
    if (months <= 6) return "bg-green-900/30 text-green-300 border-green-700";
    if (months <= 24)
      return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
    return "bg-red-900/30 text-red-300 border-red-700";
  };

  return (
    <>
      <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">{getPurposeIcon(uiCopy.purpose)}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {uiCopy.headline}
            </h3>
            <p className="text-slate-300 leading-relaxed">{uiCopy.body}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            <FileText className="h-3 w-3 mr-1" />
            {uiCopy.purpose.replace("_", " ")}
          </Badge>
          <Badge
            variant="outline"
            className={`${getRetentionColor(uiCopy.retention)} border`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Retained {uiCopy.retention}
          </Badge>
          <Badge
            variant="outline"
            className="border-indigo-600 text-indigo-300"
          >
            <Shield className="h-3 w-3 mr-1" />
            User Controlled
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            {uiCopy.evidenceRef.length} evidence source
            {uiCopy.evidenceRef.length !== 1 ? "s" : ""}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEvidence(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Why?
          </Button>
        </div>
      </Card>

      <EvidenceDrawer
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        gate={gate}
        evidenceRefs={uiCopy.evidenceRef}
      />
    </>
  );
}
