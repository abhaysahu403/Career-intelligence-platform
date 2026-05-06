'use client';
import { MapPin, Clock, ExternalLink, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Job } from '@/types';

interface Props {
  job: Job;
}

export default function JobCard({ job }: Props) {
  const matchColor = job.match >= 80 ? '#4ADE80' : job.match >= 60 ? '#F59E0B' : '#EF4444';
  const matchBg    = job.match >= 80 ? 'rgba(74,222,128,0.15)' : job.match >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';

  // Split skills into matched (first 3-4 from job) vs missing (rest)
  const matchedSkills = job.matchedSkills ?? job.skills.slice(0, Math.ceil(job.skills.length * (job.match / 100)));
  const missingSkills = job.missingSkills ?? job.skills.filter(s => !matchedSkills.includes(s));

  return (
    <div className="relative rounded-2xl p-5 border backdrop-blur-[20px] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-2"
      style={{ 
        background: 'rgba(8,12,20,0.7)',
        borderColor: job.isRecommended ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.06)',
        boxShadow: job.isRecommended 
          ? '0 8px 30px -10px rgba(56,189,248,0.3), inset 0 0 30px rgba(56,189,248,0.1)' 
          : '0 4px 15px -5px rgba(0,0,0,0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
        e.currentTarget.style.boxShadow = '0 12px 40px -10px rgba(56,189,248,0.4), inset 0 0 40px rgba(56,189,248,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = job.isRecommended ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = job.isRecommended 
          ? '0 8px 30px -10px rgba(56,189,248,0.3), inset 0 0 30px rgba(56,189,248,0.1)' 
          : '0 4px 15px -5px rgba(0,0,0,0.3)';
      }}
    >
      {/* Top shimmer line */}
      {job.isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)', boxShadow: '0 0 15px #38BDF8' }} />
      )}

      {job.isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl overflow-hidden opacity-70">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent animate-shimmer" />
        </div>
      )}

      {job.isRecommended && (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full self-start"
          style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>
          <Zap size={11} />Recommended
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-black shadow-lg"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #4ADE80)', color:'#fff' }}>
          {job.company.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-wider text-white truncate">{job.role}</p>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mt-0.5">{job.company}</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl flex-shrink-0"
          style={{ background: matchBg, color: matchColor, border: `1px solid ${matchColor}30` }}>
          {job.match}% match
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-600" />{job.location}</span>
        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">{job.type}</span>
        {job.salary && <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-600"/>{job.salary}</span>}
      </div>

      {/* Why This Job Matches — Intelligence Layer */}
      {job.isRecommended && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(56,189,248,0.03)', border: '1px solid rgba(56,189,248,0.1)' }}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8]">Strategic Alignment</p>
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.slice(0, 4).map(s => (
                <span key={s} className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <CheckCircle2 size={10} />{s}
                </span>
              ))}
            </div>
          )}
          {missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 3).map(s => (
                <span key={s} className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={10} />GAP: {s}
                </span>
              ))}
            </div>
          )}
          {job.matchReason && (
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">" {job.matchReason} "</p>
          )}
          {missingSkills.length > 0 && job.match < 95 && (
            <div className="rounded-xl px-3 py-2 mt-2 bg-sky/5 border border-sky/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-sky leading-tight">
                Potential: Match to {Math.min(95, job.match + missingSkills.length * 8)}% by learning {missingSkills[0]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Skills chips for non-recommended */}
      {!job.isRecommended && (
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl text-slate-500" 
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <a href={job.url} target="_blank" rel="noreferrer"
          className="flex-1 flex justify-center items-center gap-2 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest text-white hover:bg-white/5 hover:border-sky/40"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          View Logistics <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
