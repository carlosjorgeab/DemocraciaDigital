export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Towers */}
      <rect x="21" y="8" width="2" height="32" fill="#002776" />
      <rect x="25" y="8" width="2" height="32" fill="#002776" />
      
      {/* Main Building Block */}
      <rect x="6" y="28" width="36" height="4" rx="1" fill="#002776" />
      
      {/* Left Dome (Senate - Bowl Down) */}
      <path d="M 11 28 Q 15.5 14 20 28 Z" fill="#009C3B" />
      
      {/* Right Dome (Chamber - Bowl Up) */}
      <path d="M 28 18 Q 32.5 32 37 18 Z" fill="#FFDF00" />
      
      {/* Digital / Tech Accents */}
      <circle cx="22" cy="4" r="1.5" fill="#009C3B" />
      <circle cx="26" cy="4" r="1.5" fill="#FFDF00" />
      <path d="M 6 30 L 2 30" stroke="#009C3B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 42 30 L 46 30" stroke="#FFDF00" strokeWidth="2" strokeLinecap="round" />
      <path d="M 24 40 L 24 44" stroke="#002776" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="46" r="1.5" fill="#002776" />
    </svg>
  );
}
