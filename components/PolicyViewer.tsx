"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
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
    approvedBy?: string;
    status: string;
    content: string;
  };
  onRename?: (newTitle: string) => void;
}

export function PolicyViewer({ isOpen, onClose, policy, onRename }: PolicyViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(policy.title);

  if (!isOpen) return null;

  const handleRename = () => {
    if (onRename && editTitle !== policy.title) {
      onRename(editTitle);
    }
    setIsEditing(false);
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
        <Card className="h-full bg-slate-900/95 border-blue-400/20 backdrop-blur-sm flex flex-col overflow-hidden">
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
                  {policy.approvedBy && (
                    <>
                      <span>•</span>
                      <span>{policy.approvedBy}</span>
                    </>
                  )}
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
              <FileText className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-300">Policy Document</span>
            </div>
            
            <div className="text-sm text-slate-400">
              {policy.status === 'active' ? 'Current Policy' : 'Pending Approval'}
            </div>
          </div>

          {/* Policy Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto min-h-full">
              {/* Policy Header */}
              <div className="border-b border-slate-600 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{policy.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Version {policy.version}</span>
                  <span>•</span>
                  <span>Last Updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                  {policy.approvedBy && (
                    <>
                      <span>•</span>
                      <span>Approved by: {policy.approvedBy}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Policy Content */}
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-slate-200 leading-relaxed whitespace-pre-wrap"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                >
                  {policy.content}
                </div>
              </div>

              {/* Policy Footer */}
              <div className="border-t border-slate-600 pt-4 mt-6 text-xs text-slate-400">
                <p>Policy ID: {policy.id}</p>
                <p>Generated by OpenLedger on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
