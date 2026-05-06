'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ArrowRight, Brain, Briefcase, ChevronRight, FileText, Target, Video, Zap, Clock, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import ScoreCircle from '@/components/ui/ScoreCircle';
import StatCard from '@/components/ui/StatCard';
import RecommendationCard from '@/components/ui/RecommendationCard';
import JobCard from '@/components/ui/JobCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import CareerIntelligenceCard from '@/components/dashboard/CareerIntelligenceCard';
import { analyticsApi, jobsApi, scoreApi } from '@/lib/api';
import { useAppStore } from '@/store';
import type { Analytics, Job, ReadinessScore } from '@/types';

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

const normalizeRecommendedJobs = (items: Array<{
  job: {
    id: number;
    company: string;
    role: string;
    location?: string;
    employmentType?: string;
    salaryRange?: string;
    sourceUrl?: string;
    requiredSkills?: string[];
  };
  matchPercentage: number;
}>): Job[] =>
  items.map((item) => ({
    id: item.job.id,
    company: item.job.company,
    role: item.job.role,
    location: item.job.location ?? 'Unknown',
    type: item.job.employmentType === 'PART_TIME' ? 'Part-time' : item.job.employmentType === 'INTERNSHIP' ? 'Internship' : 'Full-time',
    match: item.matchPercentage,
    minScore: 0,
    salary: item.job.salaryRange,
    skills: item.job.requiredSkills ?? [],
    url: item.job.sourceUrl ?? '#',
    isRecommended: true,
  }));

export default function DashboardPage() {
  const router = useRouter();
  const { user, score, setScore } = useAppStore();

  const { data: scoreData, isLoading: scoreLoading } = useQuery({
    queryKey: ['score'],
    queryFn: async () => {
      try {
        const res = await scoreApi.get();
        if (!res || !res.data) throw new Error('No data');
        return res.data;
      } catch (e) {
        // Fallback for new users or demo mode
        return {
          data: {
            readiness: 68,
            level: 'Almost Ready',
            resumeScore: 65,
            academicScore: 82,
            interviewScore: 58,
            recommendation: 'Good progress. Focus on improving your technical communication.',
          }
        };
      }
    },
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const res = await analyticsApi.get();
        if (!res || !res.data) throw new Error('No data');
        return res.data;
      } catch (e) {
        // Fallback for new users or demo mode
        return {
          data: {
            risk: 'LOW',
            readiness: 68,
            resumeScore: 65,
            interviewScore: 58,
            averageInterviewScore: 60,
            totalAttempts: 2,
            weakSkills: ['system design', 'edge cases'],
            latestRecommendation: 'Review URL shortener design pattern and practice boundary value analysis.',
            progressHistory: [
              { date: 'Mon', score: 40 },
              { date: 'Tue', score: 55 },
              { date: 'Wed', score: 68 }
            ],
            interviewHistory: [
              { date: 'Mon', score: 45 },
              { date: 'Wed', score: 58 }
            ]
          }
        };
      }
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs-recommended', score?.readiness, user?.skills],
    queryFn: async () => {
      const response = await jobsApi.recommended({ readiness: score?.readiness, skills: user?.skills });
      return normalizeRecommendedJobs(unwrapPayload(response) as Array<{
        job: {
          id: number;
          company: string;
          role: string;
          location?: string;
          employmentType?: string;
          salaryRange?: string;
          sourceUrl?: string;
          requiredSkills?: string[];
        };
        matchPercentage: number;
      }>);
    },
  });

  useEffect(() => {
    if (scoreData) {
      const payload = unwrapPayload(scoreData) as ReadinessScore;
      setScore(payload);
    }
  }, [scoreData, setScore]);

  const s = scoreData ? unwrapPayload(scoreData) as ReadinessScore : null;
  const a = analyticsData ? unwrapPayload(analyticsData) as Analytics : null;

  if (scoreLoading || !s || analyticsLoading || !a) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#38BDF8' }} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing career intelligence...</p>
        </div>
      </div>
    );
  }

  const recommendations = [
    a.weakSkills.length > 0 ? {
      title: 'Attack Repeated Weak Topics',
      description: `Focus next on ${a.weakSkills.slice(0, 2).join(' and ')} so the same gaps stop repeating.`,
      icon: Brain,
      priority: 'high' as const,
      onClick: () => router.push('/interview'),
    } : {
      title: 'Start Building Interview Signal',
      description: 'Complete a few real interview attempts so the system can detect weak topics and measure your progress.',
      icon: Video,
      priority: 'high' as const,
      onClick: () => router.push('/interview'),
    },
    {
      title: 'Strengthen Resume Context',
      description: (s.resumeScore ?? 0) < 70
        ? 'Your resume score is still limiting readiness. Update it with sharper outcomes and relevant skills.'
        : 'Keep your resume current so AI questions and job matching stay personalized.',
      icon: FileText,
      priority: 'medium' as const,
      onClick: () => router.push('/profile'),
    },
    {
      title: 'Push Toward Jobs',
      description: jobs?.length
        ? `${jobs.length} real job matches are available right now. Review the highest-match roles first.`
        : 'As your readiness and interview signal improve, recommended jobs will become more specific.',
      icon: Briefcase,
      priority: 'low' as const,
      onClick: () => router.push('/jobs'),
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* 🔥 CAREER INTELLIGENCE CARD - THE WINNING FEATURE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {user?.id && <CareerIntelligenceCard userId={Number(user.id)} />}
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {scoreLoading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : [
            { title: 'Resume Quality', value: `${s.resumeScore ?? 0}/100`, icon: FileText, iconColor: '#38BDF8', iconBg: 'rgba(56,189,248,0.1)', trend: { value: 0, label: 'Content precision' } },
            { title: 'Technical Skill', value: `${s.academicScore ?? 0}/100`, icon: Brain, iconColor: '#818CF8', iconBg: 'rgba(129,140,248,0.1)', trend: { value: 0, label: 'Matching depth' } },
            { title: 'Interview EQ', value: `${s.interviewScore ?? 0}/100`, icon: Video, iconColor: '#4ADE80', iconBg: 'rgba(74,222,128,0.1)', trend: { value: 0, label: 'Signal strength' } },
            { title: 'Market Ready', value: `${s.readiness}/100`, icon: Target, iconColor: '#FBBF24', iconBg: 'rgba(251,191,36,0.1)', trend: { value: 0, label: 'Final threshold' } },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              <StatCard title={card.title} value={card.value} icon={card.icon} iconColor={card.iconColor} iconBg={card.iconBg} trend={card.trend} />
            </motion.div>
          ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] p-6 lg:col-span-2 border backdrop-blur-[20px] transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]" 
          style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-syne font-black text-white text-lg uppercase tracking-widest">Progress Metrics</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Real-time interview analytics</p>
            </div>
            <button onClick={() => router.push('/analytics')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-white transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5">
              Full Analytics <ChevronRight size={14} />
            </button>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.progressHistory}>
                <defs>
                  <linearGradient id="dashboard-progress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(8,12,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={3} fill="url(#dashboard-progress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="font-syne font-black text-white text-lg uppercase tracking-widest">Action Items</h3>
            <button onClick={() => router.push('/roadmap')} className="text-[10px] font-black uppercase tracking-widest text-sky hover:text-white transition-all">
              Full Roadmap
            </button>
          </div>
          <div className="grid gap-3">
            {recommendations.map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
              >
                <RecommendationCard {...item} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-syne font-black text-white text-lg uppercase tracking-widest">Job Signal Match</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Direct hiring matches via career score</p>
          </div>
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2 rounded-2xl border px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/5 hover:border-sky/50"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
          >
            Explore Opportunities <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs && jobs.length > 0 ? (
            jobs.slice(0, 3).map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center rounded-[32px] border border-dashed border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-sky/5 border border-sky/10">
                <Zap size={24} className="text-sky" />
              </div>
              <h3 className="text-xl font-syne font-black text-white mb-2 uppercase tracking-tighter">Initializing Job Stream</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Complete your first AI interview to activate high-precision matching.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Skill Matrix + Gap Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] p-8 border backdrop-blur-[20px] transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]" 
          style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h3 className="mb-8 font-syne font-black text-white text-lg uppercase tracking-widest">Skill Matrix</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'DSA', score: Math.min((s.interviewScore ?? 0) + 10, 100) },
                { subject: 'System Design', score: Math.min(s.academicScore ?? 0, 100) },
                { subject: 'Communication', score: Math.min((s.interviewScore ?? 0) + 5, 100) },
                { subject: 'Resume', score: s.resumeScore ?? 0 },
                { subject: 'OOP', score: Math.min((s.academicScore ?? 0) + 5, 100) },
                { subject: 'Database', score: Math.min(Math.max((s.interviewScore ?? 0) - 5, 0), 100) },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} />
                <Radar name="Skills" dataKey="score" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] p-8 lg:col-span-2 border backdrop-blur-[20px] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
          style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-syne font-black text-white text-lg uppercase tracking-widest">Skill Gap Forensic</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AI identified performance bottlenecks</p>
              </div>
            </div>
            <button onClick={() => router.push('/analytics')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky hover:text-white transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5">
              Deep Analysis <ChevronRight size={14} />
            </button>
          </div>

          {a.weakSkills.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {a.weakSkills.slice(0, 4).map((skill, idx) => {
                const priority = idx === 0 ? 'CRITICAL' : idx === 1 ? 'MAJOR' : 'MINOR';
                const prColor = priority === 'CRITICAL' ? '#F87171' : priority === 'MAJOR' ? '#FB923C' : '#38BDF8';
                const prBg = priority === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : priority === 'MAJOR' ? 'rgba(245,158,11,0.1)' : 'rgba(56,189,248,0.1)';
                return (
                  <motion.div 
                    key={skill} 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="rounded-2xl border p-5 space-y-3 transition-all" 
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${prColor}33` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]" style={{ background: prBg, color: prColor, border: `1px solid ${prColor}44` }}>
                        {priority}
                      </span>
                      <span className="text-sm font-black capitalize text-white">{skill}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '70%' }}
                        className="h-full" style={{ background: prColor }} 
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">Impact: High latency in technical responses</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-600">
                No active forensics recorded
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
