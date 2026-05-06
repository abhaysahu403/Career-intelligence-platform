'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import {
  CheckCircle2, XCircle, Lightbulb, ArrowLeft,
  Clock, RotateCcw, Trophy
} from 'lucide-react';
import { interviewApi } from '@/lib/api';

export default function InterviewResultPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: result } = useQuery({
    queryKey: ['interview-result', id],
    queryFn: async () => {
      try { return (await interviewApi.getResult(id)).data; }
      catch (error) { 
        console.error('Failed to fetch interview result:', error);
        return null; 
      }
    },
  });

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading interview results...</p>
        </div>
      </div>
    );
  }

  const r = result as {
    role: string;
    date: string;
    duration: number;
    scores: {
      technical: number;
      communication: number;
      confidence: number;
      overall: number;
    };
    mistakes: Array<{ question: string; feedback: string }>;
    suggestions: string[];
  };

  const radarData = [
    { subject: 'Technical',      score: r.scores.technical     },
    { subject: 'Communication',  score: r.scores.communication },
    { subject: 'Confidence',     score: r.scores.confidence    },
  ];

  const getColor = (s: number) => s >= 75 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444';
  const getBg    = (s: number) => s >= 75 ? 'rgba(34,197,94,0.1)' : s >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <div className="space-y-6 pb-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.push('/interview')}
          className="p-2 rounded-xl border backdrop-blur-[20px] transition-all hover:border-sky/40 text-slate-400 hover:text-white"
          style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-syne font-black text-white">
            Interview Results
          </h2>
          <p className="text-sm font-medium text-slate-400">
            {r.role} • {new Date(r.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} •{' '}
            <Clock size={11} className="inline" /> {r.duration} min
          </p>
        </div>
        <button onClick={() => router.push('/interview')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border backdrop-blur-[20px] transition-all hover:border-sky/40 text-white"
          style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <RotateCcw size={13} /> Retake
        </button>
      </div>

      {/* Overall score hero */}
      <div className="rounded-[32px] p-8 border text-center relative overflow-hidden backdrop-blur-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
        style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-20 bg-[radial-gradient(circle,#38BDF8,transparent_70%)] translate-x-1/3 -translate-y-1/3" />
        <Trophy size={32} className="mx-auto mb-3 text-amber-400" />
        <p className="text-sm mb-2 font-black text-slate-500 uppercase tracking-widest">Overall Score</p>
        <p className="text-7xl font-bold text-sky drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" style={{ fontFamily: 'JetBrains Mono,monospace' }}>
          {r.scores.overall}
        </p>
        <p className="text-sm mt-4 font-bold text-slate-300">
          {r.scores.overall >= 75 ? '🎉 Excellent performance!' : r.scores.overall >= 50 ? '👍 Good effort, keep improving' : '📚 More practice recommended'}
        </p>
      </div>

      {/* Score breakdown + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score cards */}
        <div className="space-y-3">
          <h3 className="font-syne font-black text-white">Score Breakdown</h3>
          {[
            { label: 'Technical',     score: r.scores.technical,     desc: 'Problem solving, DSA, CS concepts' },
            { label: 'Communication', score: r.scores.communication, desc: 'Clarity, structure, articulation' },
            { label: 'Confidence',    score: r.scores.confidence,    desc: 'Tone, pace, eye contact' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl p-4 border backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs font-medium text-slate-400">{item.desc}</p>
                </div>
                <span className="text-xl font-bold tabular-nums px-3 py-1 rounded-xl"
                  style={{ fontFamily:'JetBrains Mono,monospace', background: getBg(item.score).replace('0.1', '0.15'), color: getColor(item.score) }}>
                  {item.score}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${item.score}%`, background: getColor(item.score), boxShadow: `0 0 10px ${getColor(item.score)}` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Radar */}
        <div className="rounded-2xl p-5 border backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="font-syne font-black mb-1 text-white">Performance Radar</h3>
          <p className="text-xs mb-4 font-medium text-slate-400">Visual breakdown of your interview dimensions</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ background:'rgba(8,12,20,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff' }}
              />
              <Radar name="Score" dataKey="score" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.2} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistakes */}
      {r.mistakes.length > 0 && (
        <div className="rounded-2xl p-5 border backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="font-syne font-black mb-4 flex items-center gap-2 text-white">
            <XCircle size={16} className="text-red-400" /> Areas to Improve
          </h3>
          <div className="space-y-3">
            {r.mistakes.map((m: { question: string; feedback: string }, i: number) => (
              <div key={i} className="rounded-xl p-4 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
                <p className="text-sm font-bold mb-1 text-red-400">
                  Q: {m.question}
                </p>
                <p className="text-xs font-medium text-slate-300">{m.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="rounded-2xl p-5 border backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h3 className="font-syne font-black mb-4 flex items-center gap-2 text-white">
          <Lightbulb size={16} className="text-amber-400" /> Suggestions for Next Session
        </h3>
        <div className="space-y-2">
          {r.suggestions.map((s: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.1)' }}>
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
              <p className="text-sm font-medium text-slate-300">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => router.push('/interview')}
          className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff' }}>
          Practice Again
        </button>
        <button onClick={() => router.push('/roadmap')}
          className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border backdrop-blur-[20px] transition-all hover:border-sky/40 hover:-translate-y-1 text-white"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
          View Roadmap
        </button>
      </div>
    </div>
  );
}
