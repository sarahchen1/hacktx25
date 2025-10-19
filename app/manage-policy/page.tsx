"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { PolicyViewer } from "@/components/PolicyViewer";
import { db } from "@/lib/supabase/schema";
import {
  Shield,
  Settings,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";

interface Policy {
  id: string;
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
  approvedBy?: string;
  complianceScore: number;
  requiresApproval?: boolean;
  changesSummary?: string;
  filePath?: string;
}

export default function ManagePolicyPage() {
  const [user, setUser] = useState<{ email?: string; sub?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Policy | null>(null);
  const [driftEvents, setDriftEvents] = useState<Array<{
    id: string;
    severity: string;
    type: string;
    description: string;
    file: string;
    recommended_action?: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.claims);

      try {
        // Get user's projects
        const { data: projects } = await supabase
          .schema("app")
          .from("projects")
          .select("id")
          .eq("owner_id", data.claims.sub);

        if (projects && projects.length > 0) {
          const projectId = projects[0].id;

          // Fetch current policy from Supabase
          try {
            const currentPolicyDoc = await db.getCurrentPolicy(projectId);
            if (currentPolicyDoc) {
              setCurrentPolicy({
                id: currentPolicyDoc.id,
                title: currentPolicyDoc.title,
                content: currentPolicyDoc.content,
                version: "1.0",
                lastUpdated: currentPolicyDoc.updated_at,
                complianceScore: currentPolicyDoc.compliance_score || 0,
                filePath: currentPolicyDoc.file_path,
              });
            }
          } catch (error) {
            console.warn("Failed to fetch current policy from database:", error);
          }

          // Fetch new policy from Supabase
          try {
            const newPolicyDoc = await db.getNewPolicy(projectId);
            if (newPolicyDoc) {
              setNewPolicy({
                id: newPolicyDoc.id,
                title: newPolicyDoc.title,
                content: newPolicyDoc.content,
                version: "2.0",
                lastUpdated: newPolicyDoc.updated_at,
                complianceScore: newPolicyDoc.compliance_score || 0,
                requiresApproval: newPolicyDoc.requires_approval,
                changesSummary: newPolicyDoc.changes_summary,
              });
            }
          } catch (error) {
            console.warn("Failed to fetch new policy from database:", error);
          }

          // Fetch drift events from agent data
          try {
            const response = await fetch("/api/agent-data");
            if (response.ok) {
              const agentData = await response.json();
              if (agentData.success && agentData.data?.audit?.drift_events) {
                setDriftEvents(agentData.data.audit.drift_events);
              }
            }
          } catch (error) {
            console.error("Failed to load drift events:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load policy data:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewerOpen(true);
  };

  const handleApprovePolicy = async () => {
    if (!newPolicy || !user) return;
    
    try {
      // Get user's project ID
      const supabase = createClient();
      const { data: projects } = await supabase
        .schema("app")
        .from("projects")
        .select("id")
        .eq("owner_id", user.sub);

      if (projects && projects.length > 0) {
        const projectId = projects[0].id;
        
        // Approve the new policy (make it current)
        await db.approveNewPolicy(projectId, newPolicy.id);
        
        // Refresh the data
        const currentPolicyDoc = await db.getCurrentPolicy(projectId);
        if (currentPolicyDoc) {
          setCurrentPolicy({
            id: currentPolicyDoc.id,
            title: currentPolicyDoc.title,
            content: currentPolicyDoc.content,
            version: "1.0",
            lastUpdated: currentPolicyDoc.updated_at,
            complianceScore: currentPolicyDoc.compliance_score || 0,
            filePath: currentPolicyDoc.file_path,
          });
        }
        
        // Clear the new policy since it's now current
        setNewPolicy(null);
        
        alert("Policy approved and activated!");
      }
    } catch (error) {
      console.error("Failed to approve policy:", error);
      alert("Failed to approve policy. Please try again.");
    }
  };

  const handleRejectPolicy = async () => {
    if (!newPolicy) return;
    
    try {
      // Reject the new policy
      await db.rejectNewPolicy(newPolicy.id);
      
      // Clear the new policy from state
      setNewPolicy(null);
      
      alert("Policy rejected!");
    } catch (error) {
      console.error("Failed to reject policy:", error);
      alert("Failed to reject policy. Please try again.");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-900/30 text-red-300 border-red-700";
      case "medium":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
      case "low":
        return "bg-blue-900/30 text-blue-300 border-blue-700";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-semibold text-white">
                  Manage Policy
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/manage-codebase">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Manage Codebase
                </Button>
              </Link>
              <Link href="/manage-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Manage Policy
                </Button>
              </Link>
              <Link href="/client-demo">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Client Demo
                </Button>
              </Link>
              <Badge
                variant="outline"
                className="border-amber-300/30 text-amber-200"
              >
                <Settings className="h-3 w-3 mr-1" />
                {user?.email || "Policy Manager"}
              </Badge>
              {user && <LogoutButton />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Policy Management
          </h1>
          <p className="text-slate-300">
            Review and manage your privacy policies. Compare current and new policies, and approve changes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Policy Section */}
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-400" />
                Current Policy
              </h2>
              {currentPolicy && (
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-300"
                >
                  Active
                </Badge>
              )}
            </div>

            {currentPolicy ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Compliance Score</span>
                  <Badge
                    variant="outline"
                    className={
                      currentPolicy.complianceScore >= 80
                        ? "border-green-600 text-green-300"
                        : currentPolicy.complianceScore >= 60
                        ? "border-yellow-600 text-yellow-300"
                        : "border-red-600 text-red-300"
                    }
                  >
                    {currentPolicy.complianceScore}/100
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Last Updated</span>
                  <span className="text-slate-400">
                    {new Date(currentPolicy.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                <Button
                  onClick={() => handleViewPolicy(currentPolicy)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Current Policy
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No current policy found</p>
                <p className="text-sm">Run a codebase scan to detect policies</p>
              </div>
            )}
          </Card>

          {/* New Policy Section */}
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                New Policy
              </h2>
              {newPolicy?.requiresApproval && (
                <Badge
                  variant="outline"
                  className="border-yellow-600 text-yellow-300"
                >
                  Pending Approval
                </Badge>
              )}
            </div>

            {newPolicy ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Compliance Score</span>
                  <Badge
                    variant="outline"
                    className={
                      newPolicy.complianceScore >= 80
                        ? "border-green-600 text-green-300"
                        : newPolicy.complianceScore >= 60
                        ? "border-yellow-600 text-yellow-300"
                        : "border-red-600 text-red-300"
                    }
                  >
                    {newPolicy.complianceScore}/100
                  </Badge>
                </div>

                {newPolicy.changesSummary && (
                  <div>
                    <span className="text-slate-300 text-sm">Changes Summary:</span>
                    <p className="text-slate-400 text-sm mt-1">
                      {newPolicy.changesSummary}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewPolicy(newPolicy)}
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-300 hover:bg-blue-900/20"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleApprovePolicy}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleRejectPolicy}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-300 hover:bg-red-900/20"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new policy pending</p>
                <p className="text-sm">New policies appear here after codebase scans</p>
              </div>
            )}
          </Card>
        </div>

        {/* Drift Events Section */}
        {driftEvents.length > 0 && (
          <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Drift Events ({driftEvents.length})
            </h2>
            <div className="space-y-3">
              {driftEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={getSeverityColor(event.severity)}
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-white font-medium">
                        {event.description}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-slate-300">{event.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">File:</span>
                      <span className="text-slate-300 font-mono text-xs">
                        {event.file}
                      </span>
                    </div>
                    {event.recommended_action && (
                      <div className="col-span-2">
                        <span className="text-slate-400">Recommended Action:</span>
                        <p className="text-slate-300 text-sm mt-1">
                          {event.recommended_action}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Policy Viewer Modal */}
      {isViewerOpen && selectedPolicy && (
        <PolicyViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          policy={selectedPolicy}
          onRename={(newTitle) => {
            // Handle rename logic here
            console.log("Renaming policy to:", newTitle);
          }}
        />
      )}
    </div>
  );
}