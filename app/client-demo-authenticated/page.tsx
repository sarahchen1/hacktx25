import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Settings,
  Eye,
  Code,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  Building2,
} from "lucide-react";
import Galaxy from "@/components/Galaxy";
import GradientText from "@/components/GradientText";

export default async function ClientDemoAuthenticatedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy
          density={0.8}
          hueShift={220} // Deep space blue
          starSpeed={0.3}
          glowIntensity={0.8} // Bright stars
          twinkleIntensity={0.6} // Subtle twinkling
          rotationSpeed={0}
          mouseInteraction={true}
          mouseRepulsion={true}
          repulsionStrength={1.5}
          transparent={false} // Deep space background
        />
      </div>

      {/* Deep space overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/40 z-10"></div>

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
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-amber-300/30 text-amber-100 hover:bg-amber-300/10 backdrop-blur-sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/manage-policy">
                  <Button
                    variant="outline"
                    className="border-amber-300/30 text-amber-100 hover:bg-amber-300/10 backdrop-blur-sm"
                  >
                    Manage Policy
                  </Button>
                </Link>
                <Link href="/current-policy">
                  <Button
                    variant="outline"
                    className="border-amber-300/30 text-amber-100 hover:bg-amber-300/10 backdrop-blur-sm"
                  >
                    Current Policy
                  </Button>
                </Link>
                <Link href="/client-demo-authenticated">
                  <Button
                    variant="outline"
                    className="border-amber-300/30 text-amber-100 hover:bg-amber-300/10 backdrop-blur-sm bg-amber-300/10"
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
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Interactive{" "}
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
                  Client Demo
                </GradientText>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                Experience how OpenLedger makes fintech apps automatically truthful about data usage.
                Toggle consent gates and see instant changes in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/client-demo">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 font-semibold"
                >
                  Launch Interactive Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Code className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Real-time Consent
                </h3>
                <p className="text-slate-300">
                  Toggle data usage permissions and watch the interface change instantly
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Eye className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Code Evidence
                </h3>
                <p className="text-slate-300">
                  Click &quot;Why?&quot; to see actual code that uses your data with line-by-line evidence
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                <Zap className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Instant Feedback
                </h3>
                <p className="text-slate-300">
                  See immediate visual feedback when you change data usage preferences
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Instructions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                How to Use the Demo
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Follow these steps to experience OpenLedger&apos;s transparency features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Launch Demo
                </h3>
                <p className="text-slate-400 text-sm">
                  Click the &quot;Launch Interactive Demo&quot; button to open the demo interface
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Toggle Data Usage
                </h3>
                <p className="text-slate-400 text-sm">
                  Turn off &quot;Transaction Categories&quot; and watch the budget chart disappear
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  View Evidence
                </h3>
                <p className="text-slate-400 text-sm">
                  Click &quot;Why?&quot; buttons to see actual code that uses your data
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-amber-400">4</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Explore Features
                </h3>
                <p className="text-slate-400 text-sm">
                  Try different combinations and see how the interface adapts
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
                    Fintech Transparency
                  </GradientText>
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  This demo shows how OpenLedger solves the fundamental problem of privacy theater
                  in fintech. Instead of manually written privacy policies that may not match reality,
                  we provide automated, evidence-backed transparency.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Real-time consent control
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Code evidence for every data usage
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Instant visual feedback
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-white">
                      Automated compliance monitoring
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Your Clients
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Show clients exactly how their data is used with real-time controls
                    and evidence-backed explanations.
                  </p>
                </Card>

                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Your Team
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Demonstrate compliance capabilities to stakeholders and regulators
                    with verifiable evidence.
                  </p>
                </Card>

                <Card className="p-6 bg-slate-900/30 border-blue-400/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-8 w-8 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">
                      For Compliance
                    </h3>
                  </div>
                  <p className="text-slate-400">
                    Provide signed receipts and code evidence for verifiable proof
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
              Launch the interactive demo to experience how OpenLedger makes fintech apps
              automatically truthful about data usage
            </p>
            <Link href="/client-demo">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-slate-900 px-8 py-3"
              >
                <Star className="mr-2 h-5 w-5" />
                Launch Interactive Demo
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
              Making fintech transparency automatic, evidence-backed, and user-controlled.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
