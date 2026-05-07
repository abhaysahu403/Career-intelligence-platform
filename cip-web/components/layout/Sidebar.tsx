'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, User, LineChart, Video, Briefcase,
  Map, Users, Zap, ChevronLeft, LogOut, Settings, ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const studentNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/profile',   icon: User,            label: 'Profile'    },
  { href: '/interview', icon: Video,           label: 'Interview'  },
  { href: '/dashboard/certificates', icon: ShieldCheck, label: 'Certificates' },
  { href: '/jobs',      icon: Briefcase,       label: 'Jobs'       },
  { href: '/analytics', icon: LineChart,       label: 'Progress'   },
  { href: '/roadmap',   icon: Map,             label: 'Roadmap'    },
];

const navItems = studentNav;

export default function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { user, sidebarOpen, setSidebarOpen, setUser, score } = useAppStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    Cookies.remove('cip_token');
    setUser(null);
    toast.success('Logged out');
    router.push('/auth/login');
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 border-r',
        'sidebar-transition',
        sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full md:translate-x-0 md:w-[72px]'
      )}
      style={{
        background: 'rgba(8,12,20,0.85)',
        backdropFilter: 'blur(30px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: '64px' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', boxShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
          <Zap size={18} className="text-white fill-white" />
        </div>
        {sidebarOpen && (
          <span className="text-lg font-syne font-black whitespace-nowrap overflow-hidden text-white uppercase tracking-tighter">
            CAREER IQ
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto p-1 rounded-lg transition-all hover:bg-slate-800"
          style={{ color: '#94A3B8' }}
        >
          <ChevronLeft size={16} className={cn('transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Score mini-badge */}
      {sidebarOpen && score && (
        <div className="mx-4 mt-5 p-4 rounded-2xl border relative overflow-hidden group transition-all"
          style={{ background: 'rgba(56,189,248,0.03)', borderColor: 'rgba(56,189,248,0.1)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-sky/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <p className="text-[9px] uppercase tracking-widest mb-2 font-black text-slate-500">Readiness Score</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-sky" style={{ textShadow: '0 0 10px rgba(56,189,248,0.3)' }}>{score.readiness}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest text-sky"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                {score.level}
              </span>
            </div>
            <div className="mt-3 h-1 rounded-full overflow-hidden bg-white/5">
              <div className="h-full rounded-full progress-animate"
                style={{ width: `${score.readiness}%`, background: 'linear-gradient(90deg, #38BDF8, #0EA5E9)', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative',
                active
                  ? 'text-white font-black uppercase tracking-widest text-[11px]'
                  : 'hover:bg-white/5 hover:translate-x-1 hover:text-white'
              )}
              style={active ? {
                background: 'rgba(56,189,248,0.1)',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(56,189,248,0.05)',
              } : { color: '#64748B' }}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
              )}
              <item.icon size={18} className="flex-shrink-0 transition-all duration-300 group-hover:text-sky" style={active ? { color: '#38BDF8' } : {}} />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  style={{ background: 'rgba(15,23,42,0.9)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/5 group"
          style={{ color: '#64748B' }}>
          <Settings size={18} className="flex-shrink-0 group-hover:text-sky" />
          {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Settings</span>}
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-red-500/10 group"
          style={{ color: '#64748B' }}>
          <LogOut size={18} className="flex-shrink-0 group-hover:text-red-400" />
          {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest group-hover:text-red-400 transition-colors">Logout</span>}
        </button>

        {/* User info */}
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff', boxShadow: '0 0 15px rgba(56,189,248,0.3)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black uppercase tracking-tight truncate text-white">{user.name}</p>
              <p className="text-[9px] font-black uppercase tracking-widest truncate text-slate-500">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
