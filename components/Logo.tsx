export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-2xl bg-slate-950 p-1.5 shadow-md border border-amber-400/40 shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDF00" />
            <stop offset="100%" stopColor="#D4A300" />
          </linearGradient>
          <linearGradient id="logoTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#00875A" />
          </linearGradient>
          <linearGradient id="logoShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Outer Shield Emblem */}
        <path 
          d="M 24 2 L 42 8 V 22 C 42 33 24 44 24 44 C 24 44 6 33 6 22 V 8 L 24 2 Z" 
          fill="url(#logoShield)" 
          stroke="url(#logoGold)" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />

        {/* Central Twin Parliamentary Towers */}
        <rect x="21.5" y="10" width="2" height="20" rx="1" fill="#FFFFFF" />
        <rect x="24.5" y="10" width="2" height="20" rx="1" fill="#FFFFFF" />
        
        {/* Connecting Skybridge */}
        <rect x="21.5" y="18" width="5" height="2" fill="url(#logoGold)" />

        {/* Senate Dome (Bowl Down - Left) */}
        <path d="M 11 28 Q 15 16 19 28 Z" fill="url(#logoTeal)" stroke="#FFFFFF" strokeWidth="0.75" />

        {/* Chamber Bowl (Bowl Up - Right) */}
        <path d="M 29 20 Q 33 32 37 20 Z" fill="url(#logoGold)" stroke="#FFFFFF" strokeWidth="0.75" />

        {/* Digital Tech Base & Circuit Lines */}
        <path d="M 10 32 L 38 32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="37" r="2.5" fill="#00E5FF" />
        <line x1="24" y1="32" x2="24" y2="34.5" stroke="#00E5FF" strokeWidth="1.5" />
        <line x1="16" y1="32" x2="16" y2="36" stroke="url(#logoGold)" strokeWidth="1" />
        <circle cx="16" cy="37" r="1.5" fill="url(#logoGold)" />
        <line x1="32" y1="32" x2="32" y2="36" stroke="url(#logoTeal)" strokeWidth="1" />
        <circle cx="32" cy="37" r="1.5" fill="url(#logoTeal)" />
      </svg>
    </div>
  );
}

