"use client";

import { TrendingUp, Brain, Target } from "lucide-react";

interface ScoreBreakdownProps {
  score: number;           // Combined score
  llmScore?: number;       // LLM evaluation score
  semanticScore?: number;  // Semantic similarity score
  showDetails?: boolean;   // Show detailed breakdown
}

export default function ScoreBreakdown({
  score,
  llmScore,
  semanticScore,
  showDetails = true
}: ScoreBreakdownProps) {
  // If no breakdown available, show simple score
  if (!llmScore && !semanticScore) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {score}/100
        </div>
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600 dark:text-green-400";
    if (s >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBarColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Combined Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Overall Score
          </span>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>

      {showDetails && (llmScore !== undefined || semanticScore !== undefined) && (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          {/* LLM Score */}
          {llmScore !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    AI Evaluation
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (60% weight)
                  </span>
                </div>
                <span className={`font-bold ${getScoreColor(llmScore)}`}>
                  {llmScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(llmScore)}`}
                  style={{ width: `${llmScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Semantic Score */}
          {semanticScore !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Semantic Similarity
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (40% weight)
                  </span>
                </div>
                <span className={`font-bold ${getScoreColor(semanticScore)}`}>
                  {semanticScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(semanticScore)}`}
                  style={{ width: `${semanticScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Formula Explanation */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Hybrid Scoring:</span> Final = (AI × 0.6) + (Semantic × 0.4)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
