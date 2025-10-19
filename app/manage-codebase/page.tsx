"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import {
  Shield,
  Code,
  Settings,
  GitBranch,
  FileCode,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface UserToggle {
  id: string;
  name: string;
  category: string;
  description: string;
  implementation: {
    file: string;
    language: string;
    diff: string;
    instructions: string;
  };
  affected_endpoints: string[];
  policy_impact: string;
}

export default function ManageCodebasePage() {
  const [user, setUser] = useState<{ email?: string; sub?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [userToggles, setUserToggles] = useState<UserToggle[]>([]);
  const [hasScannedRepo, setHasScannedRepo] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.claims);

      // Fetch user toggles from latest audit
      try {
        const { data: projects } = await supabase
          .schema("app")
          .from("projects")
          .select("id")
          .eq("owner_id", data.claims.sub);

        if (projects && projects.length > 0) {
          setHasScannedRepo(true);
          const projectIds = projects.map((p) => p.id);

          const { data: audits } = await supabase
            .schema("app")
            .from("audit_logs")
            .select("output")
            .in("project_id", projectIds)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

          if (audits && audits.length > 0 && audits[0].output) {
            const output = audits[0].output as { user_toggles?: UserToggle[] };
            setUserToggles(output.user_toggles || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch toggles:", error);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCopyDiff = (toggleId: string, diff: string) => {
    navigator.clipboard.writeText(diff);
    setCopiedId(toggleId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

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
                  Manage Codebase
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
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Manage Codebase
                </Button>
              </Link>
              <Link href="/manage-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
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
            Privacy Toggle Implementation
          </h1>
          <p className="text-slate-300">
            Integrate user privacy controls into your codebase with ready-to-use
            code
          </p>
        </div>

        {!hasScannedRepo ? (
          <Card className="p-12 bg-slate-900/50 border-blue-400/20 text-center">
            <GitBranch className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">
              No Repository Scanned
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Scan a repository on the dashboard to generate privacy toggle
              implementations
            </p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Dashboard
              </Button>
            </Link>
          </Card>
        ) : userToggles.length === 0 ? (
          <Card className="p-12 bg-slate-900/50 border-blue-400/20 text-center">
            <Code className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">
              No Toggles Generated Yet
            </h3>
            <p className="text-slate-400">
              The AI is still analyzing your codebase. Check back in a few
              moments.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {userToggles.map((toggle) => (
              <Card
                key={toggle.id}
                className="p-6 bg-slate-900/50 border-blue-400/20"
              >
                {/* Toggle Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {toggle.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-blue-300/30 text-blue-200"
                      >
                        {toggle.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {toggle.description}
                    </p>
                  </div>
                </div>

                {/* Implementation Code */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-white">
                        {toggle.implementation.file}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-300 text-xs"
                      >
                        {toggle.implementation.language}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyDiff(toggle.id, toggle.implementation.diff)
                      }
                      className="border-blue-300/30 text-blue-200 hover:bg-blue-300/10"
                    >
                      {copiedId === toggle.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Diff
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                    <code className="text-sm text-slate-300 font-mono">
                      {toggle.implementation.diff}
                    </code>
                  </pre>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Integration Instructions
                  </h4>
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <p className="text-sm text-blue-200 whitespace-pre-line">
                      {toggle.implementation.instructions}
                    </p>
                  </div>
                </div>

                {/* Affected Endpoints */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Affected Endpoints
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {toggle.affected_endpoints.map((endpoint, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-indigo-300/30 text-indigo-200 font-mono text-xs"
                      >
                        {endpoint}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Policy Impact */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">
                    Privacy Policy Impact
                  </h4>
                  <p className="text-sm text-slate-400">
                    {toggle.policy_impact}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
