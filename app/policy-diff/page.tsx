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
  Download,
  Calendar,
  User,
  Settings,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function CurrentPolicyPage() {
  const [user, setUser] = useState<{ email?: string; sub?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [policyMarkdown, setPolicyMarkdown] = useState<string | null>(null);
  const [hasScannedRepo, setHasScannedRepo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.claims);

      // Check if user has any projects/scans with policy
      try {
        const { data: projects } = await supabase
          .schema("app")
          .from("projects")
          .select("id")
          .eq("owner_id", data.claims.sub);

        if (projects && projects.length > 0) {
          setHasScannedRepo(true);
          const projectIds = projects.map((p) => p.id);

          // Get latest audit with policy
          const { data: audits } = await supabase
            .schema("app")
            .from("audit_logs")
            .select("output, created_at")
            .in("project_id", projectIds)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

          if (audits && audits.length > 0 && audits[0].output) {
            const output = audits[0].output as any;
            setPolicyMarkdown(output.policy_markdown || null);
            setLastUpdated(audits[0].created_at);
          }
        }
      } catch (error) {
        console.error("Failed to fetch policy data:", error);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Generate current policy from scanned data if available
  const currentPolicy = policyMarkdown
    ? {
        id: "policy-current",
        title: "Generated Privacy Policy",
        version: "1.0",
        lastUpdated: lastUpdated || new Date().toISOString(),
        approvedBy: user.email || "system",
        status: "active",
        fileSize: `${Math.round(policyMarkdown.length / 1024)} KB`,
        pages: Math.ceil(policyMarkdown.split("\n").length / 50),
        content: policyMarkdown,
      }
    : null;

  const handleViewPolicy = () => {
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
                  Current Policy
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
              <Link href="/policy-diff">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Policy Diff
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
          <h1 className="text-3xl font-bold text-white mb-2">Current Policy</h1>
          <p className="text-slate-300">
            View and manage your currently active privacy policy
          </p>
        </div>

        {/* Policy Info Card or Empty State */}
        {currentPolicy ? (
          <Card className="p-6 bg-slate-900/50 border-blue-400/20 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {currentPolicy.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Version {currentPolicy.version}</span>
                  <span>•</span>
                  <span>{currentPolicy.fileSize}</span>
                  <span>•</span>
                  <span>{currentPolicy.pages} pages</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-300/30 text-green-200"
              >
                Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Last Updated
                </h3>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(currentPolicy.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Approved By
                </h3>
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4" />
                  <span>{currentPolicy.approvedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleViewPolicy}
                className="bg-amber-600 hover:bg-amber-700 text-slate-900"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Policy
              </Button>
              <Button
                variant="outline"
                className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="border-blue-300/30 text-blue-200 hover:bg-blue-300/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Version
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 bg-slate-900/50 border-blue-400/20 text-center mb-8">
            <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            {!hasScannedRepo ? (
              <>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No Privacy Policy Yet
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  You haven't scanned any repository yet. Scan a repository on
                  the dashboard to automatically generate a privacy policy based
                  on your code.
                </p>
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Policy Generation in Progress
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Your repository scan is processing. A privacy policy will be
                  generated automatically once the scan completes. This usually
                  takes a few minutes.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-blue-300/30 text-blue-200 hover:bg-blue-300/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </>
            )}
          </Card>
        )}

        {/* Policy Preview */}
        {currentPolicy && (
          <Card className="p-6 bg-slate-900/50 border-blue-400/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Policy Preview
            </h3>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="space-y-4 text-slate-300">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    1. Information We Collect
                  </h4>
                  <p className="text-sm">
                    We collect information you provide directly to us, such as
                    when you create an account, make a transaction, or contact
                    us for support. This may include your name, email address,
                    phone number, and financial information.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    2. How We Use Your Information
                  </h4>
                  <p className="text-sm">
                    We use the information we collect to provide, maintain, and
                    improve our services, process transactions, communicate with
                    you, and ensure the security of our platform.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    3. Data Sharing
                  </h4>
                  <p className="text-sm">
                    We may share your information with third-party service
                    providers who assist us in operating our platform, as well
                    as with law enforcement when required by law.
                  </p>
                </div>
                <div className="text-center text-slate-500 text-sm">
                  ... [Full policy continues for {currentPolicy.pages} pages]
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Policy History */}
        {currentPolicy && (
          <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Policy History
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <span className="text-white font-medium">
                    Privacy Policy v2.0
                  </span>
                  <span className="text-slate-400 text-sm ml-2">(Current)</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Jan 10, 2024</span>
                  <Badge
                    variant="outline"
                    className="border-green-300/30 text-green-200"
                  >
                    Active
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <span className="text-white font-medium">
                    Privacy Policy v1.9
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Dec 15, 2023</span>
                  <Badge
                    variant="outline"
                    className="border-slate-500/30 text-slate-400"
                  >
                    Archived
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <span className="text-white font-medium">
                    Privacy Policy v1.8
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Nov 20, 2023</span>
                  <Badge
                    variant="outline"
                    className="border-slate-500/30 text-slate-400"
                  >
                    Archived
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Policy Viewer Modal */}
      {currentPolicy && (
        <PolicyViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          policy={currentPolicy}
          onRename={handleRename}
        />
      )}
    </div>
  );
}
