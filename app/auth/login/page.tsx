import { LoginForm } from "@/components/login-form";
import Galaxy from "@/components/Galaxy";
import { Shield } from "lucide-react";

export default function Page() {
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
        {/* Header */}
        <header className="border-b border-blue-400/20 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-300" />
                <span className="text-xl font-bold text-white">OpenLedger</span>
              </div>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
