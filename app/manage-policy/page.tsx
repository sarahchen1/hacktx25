"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { PolicyViewer } from "@/components/PolicyViewer";
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Download,
  Eye,
} from "lucide-react";

export default function ManagePolicyPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<{
    id: string;
    title: string;
    version: string;
    lastUpdated: string;
    approvedBy: string;
    status: string;
    content: string;
  } | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.claims);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Mock data for pending policies - in a real app this would come from the database
  const pendingPolicies = [
    {
      id: "policy-001",
      title: "Updated Privacy Policy v2.1",
      version: "2.1",
      generatedAt: "2024-01-15T10:30:00Z",
      approvedBy: "admin@company.com",
      status: "pending",
      content: "Sample policy content for Updated Privacy Policy v2.1...",
      changes: [
        "Added new data collection for transaction categorization",
        "Updated data retention period to 7 years",
        "Added third-party sharing with fraud detection services"
      ],
      driftEvents: ["drift-001", "drift-002"]
    },
    {
      id: "policy-002", 
      title: "Data Usage Policy v1.3",
      version: "1.3",
      generatedAt: "2024-01-14T14:20:00Z",
      approvedBy: "admin@company.com",
      status: "pending",
      content: "Sample policy content for Data Usage Policy v1.3...",
      changes: [
        "Modified consent mechanism for biometric data",
        "Updated data processing purposes"
      ],
      driftEvents: ["drift-003"]
    }
  ];

  const handlePreview = (policy: {
    id: string;
    title: string;
    version: string;
    lastUpdated: string;
    approvedBy: string;
    status: string;
    content: string;
  }) => {
    setSelectedPolicy(policy);
    setIsViewerOpen(true);
  };

  const handleRename = (newTitle: string) => {
    // In a real app, this would update the policy title in the database
    console.log("Renaming policy to:", newTitle);
  };

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
              <Link href="/manage-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Manage Policy
                </Button>
              </Link>
              <Link href="/current-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Current Policy
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
                {user.email || "Authenticated"}
              </Badge>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Policy
          </h1>
          <p className="text-slate-300">
            Review and approve newly generated privacy policies that address code changes and drift events
          </p>
        </div>

        {/* Pending Policies */}
        <div className="space-y-6">
          {pendingPolicies.map((policy) => (
            <Card key={policy.id} className="p-6 bg-slate-900/50 border-blue-400/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {policy.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Generated: {new Date(policy.generatedAt).toLocaleDateString()}</span>
                    <Badge
                      variant="outline"
                      className="border-yellow-300/30 text-yellow-200"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Approval
                    </Badge>
                    <span>{policy.driftEvents.length} drift event(s)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(policy)}
                    className="border-blue-300/30 text-blue-200 hover:bg-blue-300/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Policy Changes */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3">Key Changes</h4>
                <ul className="space-y-2">
                  {policy.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Drift Events */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3">Related Drift Events</h4>
                <div className="flex flex-wrap gap-2">
                  {policy.driftEvents.map((driftId) => (
                    <Badge
                      key={driftId}
                      variant="outline"
                      className="border-red-300/30 text-red-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {driftId}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  className="border-red-300/30 text-red-200 hover:bg-red-300/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Deploy
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {pendingPolicies.length === 0 && (
          <Card className="p-12 bg-slate-900/50 border-blue-400/20 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Pending Policies
            </h3>
            <p className="text-slate-400">
              All policies are up to date. New policies will appear here when code changes are detected.
            </p>
          </Card>
        )}
      </main>

      {/* Policy Viewer Modal */}
      {selectedPolicy && (
        <PolicyViewer
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedPolicy(null);
          }}
          policy={selectedPolicy}
          onRename={handleRename}
        />
      )}
    </div>
  );
}
