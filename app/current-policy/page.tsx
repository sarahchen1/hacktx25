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
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Mock data for current policy - in a real app this would come from the database
  const currentPolicy = {
    id: "policy-current",
    title: "Privacy Policy v2.0",
    version: "2.0",
    lastUpdated: "2024-01-10T09:15:00Z",
    approvedBy: "admin@company.com",
    status: "active",
    fileSize: "2.3 MB",
    pages: 12,
    content: "Sample policy content for Privacy Policy v2.0..."
  };

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
              <Link href="/manage-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Manage Policy
                </Button>
              </Link>
              <Link href="/current-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Current Policy
                </Button>
              </Link>
              <Link href="/client-demo-authenticated">
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
            Current Policy
          </h1>
          <p className="text-slate-300">
            View and manage your currently active privacy policy
          </p>
        </div>

        {/* Policy Info Card */}
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
              <h3 className="text-lg font-medium text-white mb-2">Last Updated</h3>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4" />
                <span>{new Date(currentPolicy.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Approved By</h3>
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

        {/* Policy Preview */}
        <Card className="p-6 bg-slate-900/50 border-blue-400/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Policy Preview
          </h3>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="space-y-4 text-slate-300">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">1. Information We Collect</h4>
                <p className="text-sm">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a transaction, or contact us for support. This may include your name, email address, 
                  phone number, and financial information.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">2. How We Use Your Information</h4>
                <p className="text-sm">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, communicate with you, and ensure the security of our platform.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">3. Data Sharing</h4>
                <p className="text-sm">
                  We may share your information with third-party service providers who assist us in 
                  operating our platform, as well as with law enforcement when required by law.
                </p>
              </div>
              <div className="text-center text-slate-500 text-sm">
                ... [Full policy continues for {currentPolicy.pages} pages]
              </div>
            </div>
          </div>
        </Card>

        {/* Policy History */}
        <Card className="mt-8 p-6 bg-slate-900/50 border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Policy History
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div>
                <span className="text-white font-medium">Privacy Policy v2.0</span>
                <span className="text-slate-400 text-sm ml-2">(Current)</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Jan 10, 2024</span>
                <Badge variant="outline" className="border-green-300/30 text-green-200">
                  Active
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div>
                <span className="text-white font-medium">Privacy Policy v1.9</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Dec 15, 2023</span>
                <Badge variant="outline" className="border-slate-500/30 text-slate-400">
                  Archived
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div>
                <span className="text-white font-medium">Privacy Policy v1.8</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Nov 20, 2023</span>
                <Badge variant="outline" className="border-slate-500/30 text-slate-400">
                  Archived
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Policy Viewer Modal */}
      <PolicyViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        policy={currentPolicy}
        onRename={handleRename}
      />
    </div>
  );
}
