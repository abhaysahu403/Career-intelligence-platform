export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)' }}>
      
      {/* Animated Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Sky Blue Orb */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #38BDF8, transparent 70%)', animationDuration: '8s' }} />
        
        {/* Mint Green Orb */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #4ADE80, transparent 70%)', animationDuration: '10s', animationDelay: '1s' }} />
        
        {/* Center Purple Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)', animationDuration: '12s', animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)', 
            backgroundSize: '50px 50px' 
          }} />
      </div>
      
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
