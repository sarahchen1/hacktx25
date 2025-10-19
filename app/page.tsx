import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Eye,
  Code,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  Building2,
} from "lucide-react";
import GradientText from "@/components/GradientText";

export default async function HomePage() {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  // If logged in, redirect to dashboard
  if (!error && data?.claims) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic background overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/30 z-10"></div>

      {/* Content */}
      <div className="relative z-20">
        {/* Navigation */}
        <nav className="border-b border-blue-400/20 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-300" />
                <span className="text-xl font-bold text-white">OpenLedger</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-amber-300/30 text-amber-100 hover:bg-amber-300/10 backdrop-blur-sm"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Make Fintech Apps{" "}
                <GradientText
                  colors={[
                    "#fbbf24",
                    "#fda047",
                    "#ffff00",
                    "#fda047",
                    "#fbbf24",
                  ]}
                  animationSpeed={3}
                  showBorder={false}
                  className="inline-block"
                >
                  Automatically Truthful
                </GradientText>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                OpenLedger uses AI agents to automatically match code evidence
                with privacy disclosures and enforce user consent in real-time.
                No more privacy theater.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 font-semibold"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Code className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Code Evidence
                </h3>
                <p className="text-slate-300">
                  Automatically scans your codebase and generates evidence of
                  data usage patterns
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Eye className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Transparency
                </h3>
                <p className="text-slate-300">
                  Multi-agent AI system classifies data usage and generates
                  plain-language disclosures
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Zap className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Real-time Control
                </h3>
                <p className="text-slate-300">
                  Users can toggle data usage on/off instantly with signed
                  consent receipts
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                How OpenLedger Works
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                A complete transparency pipeline from code to consent
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Code Scan
                </h3>
                <p className="text-slate-400 text-sm">
                  Static analysis extracts API calls, data fields, and usage
                  patterns
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  AI Classification
                </h3>
                <p className="text-slate-400 text-sm">
                  Gradient AI agents classify data usage and generate
                  disclosures
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drift Detection
                </h3>
                <p className="text-slate-400 text-sm">
                  Continuous monitoring detects when code changes without policy
                  updates
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">4</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Live Enforcement
                </h3>
                <p className="text-slate-400 text-sm">
                  Runtime gates enforce user consent with signed audit receipts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Built for the Future of{" "}
                  <GradientText
                    colors={["#fbbf24", "#fde047", "#fbbf24"]}
                    animationSpeed={8}
                    className="inline-block"
                  >
                    Fintech Compliance
                  </GradientText>
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  OpenLedger solves the fundamental problem of privacy theater
                  in fintech. Instead of manually written privacy policies that
                  may not match reality, we provide automated, evidence-backed
                  transparency.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Automated compliance monitoring
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Real-time user consent control
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Signed audit receipts for regulators
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      AI-powered drift detection
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Users
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Clear, evidence-backed explanations of how your data is
                    used, with instant control over that usage.
                  </p>
                </Card>

                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Fintech Teams
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Automated compliance without hiring legal teams.
                    Evidence-backed policies that actually match your code.
                  </p>
                </Card>

                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Auditors
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Signed receipts and code evidence provide verifiable proof
                    that disclosed practices match implementation.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to See Transparency in Action?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Experience how OpenLedger makes fintech apps automatically
              truthful about data usage
            </p>
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-slate-900 px-8 py-3"
              >
                <Star className="mr-2 h-5 w-5" />
                Get Started with OpenLedger
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-blue-400/20 py-8 px-4 sm:px-6 lg:px-8 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-amber-400" />
              <span className="text-lg font-semibold text-white">
                OpenLedger
              </span>
            </div>
            <p className="text-slate-400">
              Making fintech transparency automatic, evidence-backed, and
              user-controlled.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
