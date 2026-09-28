'use client';
// components/certificates/AuthenticityScore.tsx

import React from 'react';
import { getScoreColor } from '@/lib/api/certificates';

interface AuthenticityScoreProps {
  score: number;
  status: string;
  confidenceLevel: string;
  size?: 'sm' | 'md' | 'lg';
}

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'genuine': return { bg: 'rgba(16,185,129,0.1)', color: '#047857' };
    case 'likely genuine': return { bg: 'rgba(132,204,22,0.1)', color: '#4D7C0F' };
    case 'suspicious': return { bg: 'rgba(245,158,11,0.1)', color: '#B45309' };
    case 'likely fake': return { bg: 'rgba(249,115,22,0.1)', color: '#C2410C' };
    case 'fake': return { bg: 'rgba(239,68,68,0.1)', color: '#B91C1C' };
    default: return { bg: '#F1F5F9', color: '#64748B' };
  }
};

export default function AuthenticityScore({
  score,
  status,
  confidenceLevel,
  size = 'md',
}: AuthenticityScoreProps) {
  const color = getScoreColor(score);
  const sts = getStatusStyle(status);
  const radius = size === 'lg' ? 54 : size === 'sm' ? 30 : 42;
  const viewBoxSize = (radius + 12) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const containerSize = size === 'lg' ? 'w-40 h-40' : size === 'sm' ? 'w-20 h-20' : 'w-28 h-28';
  const scoreSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${containerSize}`}>
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
          />
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${scoreSize} font-black leading-none font-mono`} style={{ color }}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-xs font-medium text-slate-500">/ 100</span>
          )}
        </div>
      </div>
      {size !== 'sm' && (
        <div className="text-center">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: sts.bg, color: sts.color }}>
            {status}
          </span>
          <p className="text-xs mt-1 font-medium text-slate-500">{confidenceLevel} confidence</p>
        </div>
      )}
    </div>
  );
}
