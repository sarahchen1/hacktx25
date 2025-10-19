"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Edit3,
} from "lucide-react";

interface PolicyViewerProps {
  isOpen: boolean;
  onClose: () => void;
  policy: {
    id: string;
    title: string;
    version: string;
    lastUpdated: string;
    approvedBy: string;
    status: string;
    content: string;
  };
  onRename?: (newTitle: string) => void;
}

export function PolicyViewer({ isOpen, onClose, policy, onRename }: PolicyViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(policy.title);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleRename = () => {
    if (onRename && editTitle !== policy.title) {
      onRename(editTitle);
    }
    setIsEditing(false);
  };

  const handleDownload = () => {
    // In a real app, this would download the actual PDF
    const element = document.createElement('a');
    const file = new Blob([policy.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${policy.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4">
        <Card className="h-full bg-slate-900/95 border-blue-400/20 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-amber-400" />
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-600"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleRename}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditTitle(policy.title);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">{policy.title}</h2>
                    {onRename && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                  <span>Version {policy.version}</span>
                  <span>•</span>
                  <span>{new Date(policy.lastUpdated).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{policy.approvedBy}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-green-300/30 text-green-200"
              >
                {policy.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-red-300/30 text-red-200 hover:bg-red-300/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-300 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-slate-400">
              Page 1 of 1
            </div>
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto p-6">
            <div 
              className="bg-white text-black p-8 mx-auto shadow-2xl"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                width: '210mm',
                minHeight: '297mm'
              }}
            >
              {/* Sample Policy Content */}
              <div className="space-y-6">
                <div className="text-center border-b pb-4">
                  <h1 className="text-3xl font-bold mb-2">{policy.title}</h1>
                  <p className="text-lg text-gray-600">Version {policy.version}</p>
                  <p className="text-sm text-gray-500">
                    Last Updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <section>
                    <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
                    <p className="text-sm leading-relaxed">
                      We collect information you provide directly to us, such as when you create an account, 
                      make a transaction, or contact us for support. This may include:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
                      <li>Personal information (name, email address, phone number)</li>
                      <li>Financial information (account numbers, transaction history)</li>
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage information (how you interact with our services)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p className="text-sm leading-relaxed">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and manage your account</li>
                      <li>Communicate with you about our services</li>
                      <li>Ensure the security of our platform</li>
                      <li>Comply with legal and regulatory requirements</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
                    <p className="text-sm leading-relaxed">
                      We may share your information with:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
                      <li>Third-party service providers who assist us in operating our platform</li>
                      <li>Law enforcement when required by law or to protect our rights</li>
                      <li>Other parties with your explicit consent</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
                    <p className="text-sm leading-relaxed">
                      We implement appropriate technical and organizational measures to protect your 
                      personal information against unauthorized access, alteration, disclosure, or destruction. 
                      However, no method of transmission over the internet is 100% secure.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
                    <p className="text-sm leading-relaxed">
                      You have the right to:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate information</li>
                      <li>Delete your personal information</li>
                      <li>Object to processing of your information</li>
                      <li>Data portability</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
                    <p className="text-sm leading-relaxed">
                      If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <div className="text-sm mt-2 ml-4">
                      <p>Email: privacy@openledger.com</p>
                      <p>Phone: 1-800-OPENLEDGER</p>
                      <p>Address: 123 Financial District, New York, NY 10004</p>
                    </div>
                  </section>
                </div>

                <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                  <p>This policy was generated automatically by OpenLedger on {new Date().toLocaleDateString()}</p>
                  <p>Policy ID: {policy.id}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
