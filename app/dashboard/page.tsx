"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ComplianceScore } from "@/components/ComplianceScore";
import { RepositoryScanner } from "@/components/RepositoryScanner";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; sub?: string } | null>(null);
  const [hasProjects, setHasProjects] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);
  const [driftCount, setDriftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      
      if (error || !data?.claims) {
        window.location.href = "/auth/login";
        return;
      }

      setUser(data.claims);

      // Check if user has any projects/scans
      const { data: userProjects } = await supabase
        .schema("app")
        .from("projects")
        .select("id")
        .eq("owner_id", data.claims.sub);

      setHasProjects(!!(userProjects && userProjects.length > 0));

      // Fetch compliance score
      try {
        const response = await fetch("/api/compliance");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.score) {
            setComplianceScore(data.data.score);
          }
        }
      } catch (error) {
        console.error("Failed to fetch compliance score:", error);
      }

      // Fetch drift count
      try {
        const response = await fetch("/api/drift");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const openDrifts = data.data.filter((drift: { status: string }) => drift.status === "open");
            setDriftCount(openDrifts.length);
          }
        }
      } catch (error) {
        console.error("Failed to fetch drift count:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <p className="text-white text-lg">Loading dashboard...</p>
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
                  OpenLedger Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
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
                {user?.email || "Authenticated"}
              </Badge>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to OpenLedger
          </h1>
          <p className="text-slate-300">
            Monitor data usage compliance, drift detection, and audit trails for
            your fintech application
          </p>
        </div>

        {/* Repository Scanner */}
        <div className="mb-8">
          <RepositoryScanner />
        </div>

        {!hasProjects && (
          <Card className="p-8 bg-blue-900/20 border-blue-400/30 text-center mb-8">
            <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Repository Scanned Yet
            </h3>
            <p className="text-slate-300">
              Enter a repository URL above and click &quot;Scan&quot; to get started with
              compliance monitoring.
            </p>
          </Card>
        )}

        {/* Overview Cards */}
        {hasProjects && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-slate-900/50 border-blue-400/20">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{complianceScore}</p>
                  <p className="text-sm text-slate-400">Compliance Score</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-blue-400/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{driftCount}</p>
                  <p className="text-sm text-slate-400">Open Drift Events</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Dashboard Grid */}
        {hasProjects && (
          <>
            <div className="mb-8">
              <ComplianceScore />
            </div>

            {/* Drift Detection Summary */}
            <div className="mb-8">
              <Card className="p-6 bg-slate-900/50 border-blue-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-amber-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{driftCount}</p>
                      <p className="text-sm text-slate-400">Open Drift Events</p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/manage-policy">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      View & Resolve Drifts
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Quick Actions */}
        {hasProjects && (
          <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Compliance Report
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Run Drift Detection
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
