'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to setup page for V3 interview system
    router.push('/interview/setup');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000814] via-[#01030F] to-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to interview setup...</p>
      </div>
    </div>
  );
}
