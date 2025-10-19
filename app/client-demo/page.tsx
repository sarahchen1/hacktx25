"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { Shield, HelpCircle, Settings, FileText, ToggleLeft } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default function DemoPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  
  // Privacy category toggles state
  const [privacyToggles, setPrivacyToggles] = useState({
    transactionData: true,
    accountData: true,
    analyticsData: true,
    recommendationsData: true,
    deviceLocationData: false,
    biometricData: false,
    metadata: false
  });

  // Sample privacy policy content
  const policyContent = `# Privacy Policy

## Data Collection
We collect the following types of information:
- Account information (name, email, phone number)
- Transaction data (amounts, merchants, categories)
- Usage data (app interactions, feature usage)
- Device information (IP address, browser type)
- Location data (if you enable location services)

## How We Use Your Data
We use your information for the following purposes:
- Provide and maintain our services
- Process transactions and payments
- Personalize your experience
- Communicate with you
- Improve our services
- Comply with legal obligations

## Your Rights
You have the following rights regarding your personal information:
- Right to access your personal data
- Right to rectify inaccurate data
- Right to erasure ('right to be forgotten')
- Right to restrict processing
- Right to data portability
- Right to object to processing
- Rights related to automated decision making

## Data Security
We implement the following security measures:
- End-to-end encryption for sensitive data
- Regular security audits and penetration testing
- Employee training on data protection
- Incident response procedures
- Regular backups and disaster recovery`;

  // Handle privacy toggle changes
  const handleToggleChange = (category: keyof typeof privacyToggles) => {
    setPrivacyToggles(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle OAuth redirect and get user info
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("User authenticated:", session.user.email);
        setUser(session.user);
      }
    };

    handleAuthRedirect();
  }, []);

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
                  OpenLedger Demo
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
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
                >
                  Manage Policy
                </Button>
              </Link>
              <Link href="/client-demo">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10 bg-amber-300/10"
                >
                  Client Demo
                </Button>
              </Link>
              <Badge
                variant="outline"
                className="border-amber-300/30 text-amber-200"
              >
                <Settings className="h-3 w-3 mr-1" />
                {user?.email || "Demo User"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              {user && <LogoutButton />}
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <Card className="relative w-full max-w-md bg-slate-900 border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Demo Help
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  This demo shows how OpenLedger makes fintech apps
                  automatically truthful about data usage.
                </p>
                <p>
                  <strong>Try these interactions:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Toggle data usage permissions and watch the interface change
                  </li>
                  <li>Click &quot;Why?&quot; buttons to see actual code evidence</li>
                  <li>Download consent receipts to see audit trails</li>
                  <li>Explore the different data usage categories</li>
                </ul>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Live Transparency Demo
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            See how OpenLedger automatically matches code evidence with privacy
            disclosures and enforces user consent in real-time.
          </p>
        </div>

        {/* Two Column Layout - Policy and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Policy Text */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Current Privacy Policy
              </h2>
              <p className="text-slate-400 text-sm">
                Review our current privacy policy and data handling practices
              </p>
            </div>

            <Card className="p-6 bg-slate-900/50 border-blue-400/20 max-h-96 overflow-y-auto">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {policyContent}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Privacy Category Toggles */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <ToggleLeft className="h-5 w-5 text-amber-400" />
                Privacy Category Controls
              </h2>
              <p className="text-slate-400 text-sm">
                Choose which data categories you want to allow for collection
              </p>
            </div>

            <Card className="p-6 bg-slate-900/50 border-blue-400/20">
              <div className="space-y-4">
                {/* Transaction Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Transaction Data</h3>
                    <p className="text-xs text-slate-400">Amounts, merchants, categories, dates</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.transactionData}
                    onCheckedChange={() => handleToggleChange('transactionData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Account Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Account Data</h3>
                    <p className="text-xs text-slate-400">Name, email, phone, address</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.accountData}
                    onCheckedChange={() => handleToggleChange('accountData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Analytics Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Analytics Data</h3>
                    <p className="text-xs text-slate-400">Spending patterns, trends, usage stats</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.analyticsData}
                    onCheckedChange={() => handleToggleChange('analyticsData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Recommendations Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Recommendations Data</h3>
                    <p className="text-xs text-slate-400">Merchant suggestions, category insights</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.recommendationsData}
                    onCheckedChange={() => handleToggleChange('recommendationsData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Device & Location Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Device & Location Data</h3>
                    <p className="text-xs text-slate-400">IP address, browser type, location</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.deviceLocationData}
                    onCheckedChange={() => handleToggleChange('deviceLocationData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Biometric Data */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Biometric Data</h3>
                    <p className="text-xs text-slate-400">Fingerprint, face recognition data</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.biometricData}
                    onCheckedChange={() => handleToggleChange('biometricData')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-medium text-white">Metadata</h3>
                    <p className="text-xs text-slate-400">Timestamps, system logs, debug info</p>
                  </div>
                  <Checkbox
                    checked={privacyToggles.metadata}
                    onCheckedChange={() => handleToggleChange('metadata')}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
