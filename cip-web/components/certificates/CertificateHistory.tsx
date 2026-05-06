'use client';
// components/certificates/CertificateHistory.tsx
// Embeddable widget for showing recent certificates in any page (e.g. profile, dashboard)

import React, { useEffect, useState } from 'react';
import { getUserCertificates, getScoreColor, CertificateSummary } from '@/lib/api/certificates';
import { ChevronRight } from 'lucide-react';

interface CertificateHistoryProps {
  userId: number;
  maxItems?: number;
  onViewAll?: () => void;
  onSelectCertificate?: (id: number) => void;
}

export default function CertificateHistory({
  userId,
  maxItems = 5,
  onViewAll,
  onSelectCertificate,
}: CertificateHistoryProps) {
  const [certs, setCerts] = useState<CertificateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserCertificates(userId, 0, maxItems)
      .then((d) => { setCerts(d.certificates); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, maxItems]);

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

  if (loading) return (
    <div className="space-y-2">
      {[1, 2].map(i => <div key={i} className="rounded-xl h-14 animate-pulse bg-slate-100" />)}
    </div>
  );

  if (certs.length === 0) return (
    <div className="text-center py-6 text-sm font-medium text-slate-500">
      No certificates verified yet
    </div>
  );

  return (
    <div>
      <div className="space-y-2">
        {certs.map((cert) => {
          const sts = getStatusStyle(cert.authenticityStatus ?? '');
          return (
            <div
              key={cert.id}
              onClick={() => onSelectCertificate?.(cert.id)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer transition-all card-hover-glow bg-white hover:bg-slate-50"
            >
              {/* Mini score */}
              {cert.authenticityScore != null ? (
                <span className="text-sm font-bold font-mono w-9 text-center" style={{ color: getScoreColor(cert.authenticityScore) }}>
                  {cert.authenticityScore}
                </span>
              ) : (
                <span className="text-sm w-9 text-center text-slate-400">—</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-800">{cert.fileName}</p>
              </div>
              {cert.authenticityStatus && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: sts.bg, color: sts.color }}>
                  {cert.authenticityStatus}
                </span>
              )}
              {!cert.authenticityStatus && (
                <span className="text-xs font-medium text-slate-500">{cert.status}</span>
              )}
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          );
        })}
      </div>
      {total > maxItems && onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-3 w-full text-xs font-bold text-blue-600 hover:underline"
        >
          View all {total} certificates →
        </button>
      )}
    </div>
  );
}
