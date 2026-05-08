"use client";

import { CheckCircle2, Loader2, AlertCircle, FileText, Brain, Sparkles } from "lucide-react";

interface ParsingStatusProps {
  status: 'idle' | 'uploading' | 'parsing' | 'generating_embeddings' | 'complete' | 'error';
  progress: number;
  message: string;
  data?: {
    skills: string[];
    experience: any[];
    projects: any[];
    education: any[];
    score: number;
  };
  error?: string;
}

export default function ParsingStatus({
  status,
  progress,
  message,
  data,
  error
}: ParsingStatusProps) {
  const steps = [
    { key: 'uploading', label: 'Uploading', icon: FileText },
    { key: 'parsing', label: 'AI Parsing (RAG)', icon: Brain },
    { key: 'generating_embeddings', label: 'Generating Embeddings', icon: Sparkles },
    { key: 'complete', label: 'Ready', icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (status === 'idle') return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Resume Processing
        </h3>
        {status === 'error' ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : status === 'complete' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Progress Bar */}
      {status !== 'error' && status !== 'complete' && (
        <div className="mb-4">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {message}
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStepIndex || status === 'complete';
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex && status !== 'complete';

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isComplete
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : isCurrent
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`font-medium ${
                  isComplete
                    ? 'text-green-700 dark:text-green-300'
                    : isCurrent
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Success Summary */}
      {status === 'complete' && data && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
          <p className="font-semibold text-green-700 dark:text-green-300">
            ✅ Resume Parsed Successfully!
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Skills:</span> {data.skills?.length || 0}
            </div>
            <div className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Experience:</span> {data.experience?.length || 0}
            </div>
            <div className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Projects:</span> {data.projects?.length || 0}
            </div>
            <div className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Score:</span> {data.score || 0}/100
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
