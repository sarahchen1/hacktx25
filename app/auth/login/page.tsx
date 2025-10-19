import { LoginForm } from "@/components/login-form";
import Galaxy from "@/components/Galaxy";
import { Shield } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #1a0b3d 0%, #2d1b69 25%, #1e1a2e 50%, #16213e 75%, #0f1419 100%)',
        }}
      />
      
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy
          density={0.6}
          hueShift={280} // Deep purple/blue cosmic colors
          starSpeed={0.15} // Much slower movement
          glowIntensity={0.6} // Softer star glow
          twinkleIntensity={0.4} // Gentle twinkling
          rotationSpeed={0.02} // Very slow rotation
          mouseInteraction={true}
          mouseRepulsion={true}
          repulsionStrength={0.8} // Gentler repulsion
          transparent={true} // Transparent over cosmic background
          saturation={0.3} // Add some color saturation
        />
      </div>

      {/* Cosmic overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-slate-900/40 z-10"></div>

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <header className="border-b border-purple-400/30 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-300" />
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
