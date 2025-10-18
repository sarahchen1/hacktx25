"use client";

import { useState } from "react";
import { useGates } from "@/lib/hooks/useGates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, Shield } from "lucide-react";

interface GatePanelProps {
  onDownloadReceipt?: () => void;
}

export function GatePanel({ onDownloadReceipt }: GatePanelProps) {
  const { gates, timestamps, loading, error, updateGate } = useGates();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (gateName: string, currentValue: boolean) => {
    setUpdating(gateName);
    try {
      await updateGate(gateName, !currentValue);
    } finally {
      setUpdating(null);
    }
  };

  const getGateInfo = (gateName: string) => {
    const info = {
      txn_category: {
        label: "Transaction Categories",
        description: "Budgeting & Analytics",
        icon: "📊",
      },
      acct_profile: {
        label: "Account Profile",
        description: "User Management",
        icon: "👤",
      },
    };
    return (
      info[gateName as keyof typeof info] || {
        label: gateName,
        description: "",
        icon: "⚙️",
      }
    );
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">
          Data Usage Controls
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(gates).map(([gateName, value]) => {
          const info = getGateInfo(gateName);
          const isUpdating = updating === gateName;
          const lastUpdated = timestamps[gateName];

          return (
            <div
              key={gateName}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h3 className="font-medium text-white">{info.label}</h3>
                  <p className="text-sm text-slate-400">{info.description}</p>
                  {lastUpdated && (
                    <p className="text-xs text-slate-500 mt-1">
                      Updated: {new Date(lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={value ? "default" : "secondary"}
                  className={`${
                    value
                      ? "bg-green-900/30 text-green-300 border-green-700"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  {value ? "Enabled" : "Disabled"}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(gateName, value)}
                  disabled={isUpdating}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : value ? (
                    "Disable"
                  ) : (
                    "Enable"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Settings className="h-4 w-4" />
            <span>Consent Management</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadReceipt}
            className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/20 hover:text-indigo-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </Card>
  );
}
