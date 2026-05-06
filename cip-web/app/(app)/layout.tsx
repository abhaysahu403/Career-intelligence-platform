'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppStore } from '@/store';
import { authApi } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Topbar  from '@/components/layout/Topbar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router          = useRouter();
  const pathname        = usePathname();
  const { isAuthenticated, user, setUser, sidebarOpen } = useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = Cookies.get('cip_token');
      
      // If no token, redirect to login
      if (!token) {
        setChecking(false);
        router.push('/auth/login');
        return;
      }

      // If token exists but user not in store, validate with backend
      if (token && !user) {
        try {
          const response = await authApi.me();
          const userData = response.data?.data ?? response.data;
          setUser(userData);
          setChecking(false);
        } catch (error) {
          // Token invalid, clear and redirect
          Cookies.remove('cip_token');
          setUser(null);
          setChecking(false);
          router.push('/auth/login');
        }
      } else {
        setChecking(false);
      }
    };

    validateSession();
  }, [router, user, setUser]);

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [checking, isAuthenticated, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080C14' }}>
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#38BDF8' }} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Validating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-slate-300 relative overflow-hidden" style={{ background: '#080C14' }}>
      <Sidebar />

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden relative",
          sidebarOpen ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        {/* Animated Deep Space Background */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[150px]" style={{ background: 'radial-gradient(circle, #38BDF822, transparent)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[150px]" style={{ background: 'radial-gradient(circle, #818CF811, transparent)' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #4ADE8005, transparent)' }} />
        </div>
        <Topbar />
        <main key={pathname} className="flex-1 p-4 md:p-6 lg:p-10 pt-24 md:pt-28 lg:pt-32 max-w-[1600px] w-full mx-auto page-enter overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
