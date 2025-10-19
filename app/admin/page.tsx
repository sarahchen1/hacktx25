"use client";

import Link from "next/link";
import { ComplianceScore } from "@/components/ComplianceScore";
import { EvidenceTable } from "@/components/EvidenceTable";
import { DriftList } from "@/components/DriftList";
import { ReceiptsTimeline } from "@/components/ReceiptsTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  Clock,
  Settings,
  Download,
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-semibold text-white">
                  Compliance Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="border-amber-300/30 text-amber-200"
              >
                <Settings className="h-3 w-3 mr-1" />
                Admin View
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Compliance Dashboard
          </h1>
          <p className="text-slate-300">
            Monitor data usage compliance, drift detection, and audit trails
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-slate-900/50 border-blue-400/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">85</p>
                <p className="text-sm text-slate-400">Compliance Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-blue-400/20">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-slate-400">Evidence Entries</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-blue-400/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-sm text-slate-400">Open Drift Events</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-blue-400/20">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">47</p>
                <p className="text-sm text-slate-400">Consent Receipts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance Score */}
          <div>
            <ComplianceScore />
          </div>

          {/* Evidence Table */}
          <div>
            <EvidenceTable />
          </div>
        </div>

        {/* Drift Detection */}
        <div className="mb-8">
          <DriftList />
        </div>

        {/* Receipts Timeline */}
        <div>
          <ReceiptsTimeline />
        </div>

        {/* Admin Actions */}
        <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Audit Trail
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
