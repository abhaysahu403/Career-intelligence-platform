"use client";

import { Sparkles, Info } from "lucide-react";
import { useState } from "react";

interface PersonalizedBadgeProps {
  isPersonalized: boolean;
  resumeReference?: string;
  className?: string;
}

export default function PersonalizedBadge({
  isPersonalized,
  resumeReference,
  className = ""
}: PersonalizedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isPersonalized) return null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-semibold shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Personalized</span>
        <Info className="w-3 h-3 opacity-75" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 w-64">
          <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Tailored to Your Resume</p>
                <p className="text-slate-300 dark:text-slate-400">
                  This question is based on your specific experience and projects.
                </p>
                {resumeReference && (
                  <p className="mt-2 text-blue-300 dark:text-blue-400 font-medium">
                    References: {resumeReference}
                  </p>
                )}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-t border-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
}
