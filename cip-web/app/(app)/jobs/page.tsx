'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, Zap, X } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import JobCard from '@/components/ui/JobCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import { useAppStore } from '@/store';
import type { Job } from '@/types';

const ROLES     = ['All Roles', 'SWE Intern', 'Backend Intern', 'Frontend Dev', 'Data Analyst', 'SDE-1', 'Systems Engineer'];
const LOCATIONS = ['All Locations', 'Bangalore', 'Hyderabad', 'Delhi', 'Pune', 'Remote'];
const TYPES     = ['All Types', 'Internship', 'Full-time', 'Part-time'];

const unwrapPayload = <T,>(response: { data: T } | { data: { data: T } }) =>
  'data' in (response.data as Record<string, unknown>)
    ? (response.data as { data: T }).data
    : (response.data as T);

const normalizeJobs = (payload: { content?: Array<{
  id: number;
  company: string;
  role: string;
  location?: string;
  employmentType?: string;
  minimumReadinessScore?: number;
  salaryRange?: string;
  requiredSkills?: string[];
  sourceUrl?: string;
}> } | Array<{
  id: number;
  company: string;
  role: string;
  location?: string;
  employmentType?: string;
  minimumReadinessScore?: number;
  salaryRange?: string;
  requiredSkills?: string[];
  sourceUrl?: string;
}>): Job[] => {
  const items = Array.isArray(payload) ? payload : payload.content ?? [];
  return items.map((item) => ({
    id: item.id,
    company: item.company,
    role: item.role,
    location: item.location ?? 'Unknown',
    type: item.employmentType === 'PART_TIME' ? 'Part-time' : item.employmentType === 'INTERNSHIP' ? 'Internship' : 'Full-time',
    match: 100,
    minScore: item.minimumReadinessScore ?? 0,
    salary: item.salaryRange,
    skills: item.requiredSkills ?? [],
    url: item.sourceUrl ?? '#',
    isRecommended: false,
  }));
};

export default function JobsPage() {
  const user = useAppStore(s => s.user);
  const score = useAppStore(s => s.score);
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('All Roles');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter]       = useState('All Types');
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [minMatch, setMinMatch]           = useState(0);

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const response = await jobsApi.list();
        return normalizeJobs(unwrapPayload(response) as { content?: Array<{
          id: number;
          company: string;
          role: string;
          location?: string;
          employmentType?: string;
          minimumReadinessScore?: number;
          salaryRange?: string;
          requiredSkills?: string[];
          sourceUrl?: string;
        }> });
      }
      catch (error) { 
        console.error('Failed to fetch jobs:', error);
        return []; 
      }
    },
  });

  const { data: recommendedJobs } = useQuery({
    queryKey: ['jobs-recommended', score?.readiness, user?.skills],
    enabled: Boolean(score?.readiness),
    queryFn: async () => {
      try {
        const response = await jobsApi.recommended({ readiness: score?.readiness, skills: user?.skills });
        const payload = unwrapPayload(response) as Array<{
          job: {
            id: number;
            company: string;
            role: string;
            location?: string;
            employmentType?: string;
            minimumReadinessScore?: number;
            salaryRange?: string;
            requiredSkills?: string[];
            sourceUrl?: string;
          };
          matchPercentage: number;
        }>;

        return payload.map((item) => ({
          id: item.job.id,
          company: item.job.company,
          role: item.job.role,
          location: item.job.location ?? 'Unknown',
          type: item.job.employmentType === 'PART_TIME' ? 'Part-time' : item.job.employmentType === 'INTERNSHIP' ? 'Internship' : 'Full-time',
          match: item.matchPercentage,
          minScore: item.job.minimumReadinessScore ?? 0,
          salary: item.job.salaryRange,
          skills: item.job.requiredSkills ?? [],
          url: item.job.sourceUrl ?? '#',
          isRecommended: true,
        } satisfies Job));
      } catch (error) {
        console.error('Failed to fetch recommended jobs:', error);
        return [] as Job[];
      }
    },
  });

  const recommendedMap = new Map((recommendedJobs ?? []).map((job) => [job.id, job]));
  const allJobs = (jobs ?? []).map((job) => recommendedMap.get(job.id) ?? job);

  const filtered = allJobs.filter(j => {
    if (onlyRecommended && !j.isRecommended) return false;
    if (roleFilter     !== 'All Roles'      && !j.role.toLowerCase().includes(roleFilter.toLowerCase().replace('all roles',''))) return false;
    if (locationFilter !== 'All Locations'  && j.location !== locationFilter) return false;
    if (typeFilter     !== 'All Types'      && j.type !== typeFilter) return false;
    if (minMatch > 0   && j.match < minMatch) return false;
    if (search && !j.company.toLowerCase().includes(search.toLowerCase()) &&
        !j.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });



  const clearFilters = () => {
    setSearch(''); setRoleFilter('All Roles'); setLocationFilter('All Locations');
    setTypeFilter('All Types'); setMinMatch(0); setOnlyRecommended(false);
  };
  const hasFilters = search || roleFilter !== 'All Roles' || locationFilter !== 'All Locations' ||
                     typeFilter !== 'All Types' || minMatch > 0 || onlyRecommended;

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      {/* Header + Score mini */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-syne font-black text-white uppercase tracking-widest">
            Hiring Signal & Matches
          </h2>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mt-1">
            {filtered.length} opportunities matched • Optimized for your career score
          </p>
        </div>
        {score && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border flex-shrink-0 backdrop-blur-[20px] transition-all hover:border-sky/40" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 4px 15px -5px rgba(0,0,0,0.3)' }}>
            <ScoreCircle score={score.readiness} size={52} strokeWidth={6} showLevel={false} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Your Score</p>
              <p className="text-sm font-bold text-white">{score.level}</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative rounded-2xl p-4 border backdrop-blur-[20px] space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Search + recommended toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies or roles…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all text-white placeholder-slate-500"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>
          <button onClick={() => setOnlyRecommended(!onlyRecommended)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-shrink-0 shadow-sm"
            style={onlyRecommended
              ? { background:'rgba(56,189,248,0.1)', borderColor:'rgba(56,189,248,0.3)', color:'#38BDF8' }
              : { background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.1)', color:'#94A3B8' }}>
            <Zap size={15} className={onlyRecommended ? "text-sky" : "text-slate-500"} /> Only Recommended
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {ROLES.map(r => <option key={r} value={r} style={{ background: '#0F172A', color: '#F8FAFC' }}>{r}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {LOCATIONS.map(l => <option key={l} value={l} style={{ background: '#0F172A', color: '#F8FAFC' }}>{l}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            {TYPES.map(t => <option key={t} value={t} style={{ background: '#0F172A', color: '#F8FAFC' }}>{t}</option>)}
          </select>
          <select value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm font-bold border appearance-none transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
            <option value={0} style={{ background: '#0F172A', color: '#F8FAFC' }}>Any Match</option>
            <option value={60} style={{ background: '#0F172A', color: '#F8FAFC' }}>60%+ Match</option>
            <option value={75} style={{ background: '#0F172A', color: '#F8FAFC' }}>75%+ Match</option>
            <option value={85} style={{ background: '#0F172A', color: '#F8FAFC' }}>85%+ Match</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Matched',  value: filtered.length,                           color: '#38BDF8' },
          { label: 'Recommended',    value: filtered.filter(j=>j.isRecommended).length, color: '#4ADE80' },
          { label: 'High Match 80%+',value: filtered.filter(j=>j.match>=80).length,    color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl p-4 border backdrop-blur-[20px] text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)]"
            style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-3xl font-black font-syne" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-black mt-1 text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border backdrop-blur-[20px]" style={{ background: 'rgba(8,12,20,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <Filter size={32} className="mx-auto mb-3 text-sky" />
          <p className="font-syne font-black text-white text-lg">No jobs match your filters</p>
          <p className="text-sm mt-1 font-medium text-slate-400">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(job => (
            <div key={job.id} className="relative">
              <JobCard job={job} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
