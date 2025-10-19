import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Settings, ArrowRight, Github } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold text-white">OpenLedger</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button
                  variant="outline"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Demo
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to OpenLedger
          </h1>
          <p className="text-xl text-slate-300">
            You're successfully authenticated and ready to explore fintech
            transparency
          </p>
        </div>

        {/* User Info Card */}
        <Card className="p-6 bg-slate-900/50 border-blue-400/20 backdrop-blur-sm mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user.email || "Authenticated User"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Github className="h-4 w-4 text-slate-400" />
                <Badge
                  variant="outline"
                  className="border-amber-300/30 text-amber-200"
                >
                  GitHub Authenticated
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Your account is linked to GitHub and ready to use OpenLedger
            features.
          </p>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-900/50 border-blue-400/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Try the Demo</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Experience how OpenLedger makes fintech apps automatically
              truthful about data usage.
            </p>
            <Link href="/demo">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-slate-900">
                Launch Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-blue-400/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-8 w-8 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">
                Admin Dashboard
              </h3>
            </div>
            <p className="text-slate-400 mb-4">
              Access the compliance dashboard for fintech teams and audit tools.
            </p>
            <Link href="/admin">
              <Button
                variant="outline"
                className="w-full border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                View Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* User Details (Collapsible) */}
        <details className="mt-8">
          <summary className="cursor-pointer text-slate-300 hover:text-white mb-4">
            <span className="text-sm font-medium">
              View Authentication Details
            </span>
          </summary>
          <Card className="p-4 bg-slate-900/30 border-slate-700">
            <pre className="text-xs font-mono text-slate-300 overflow-auto max-h-40">
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        </details>
      </div>
    </div>
  );
}
