import React from 'react';
import { VehicleType } from '../../types';
import { Shield, Sparkles } from 'lucide-react';

interface VehicleIllustrationProps {
  type: VehicleType;
  name: string;
  isDualControl?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VehicleIllustration: React.FC<VehicleIllustrationProps> = ({
  type,
  name,
  isDualControl = true,
  className = '',
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-24',
    md: 'h-36 sm:h-40',
    lg: 'h-48 sm:h-56',
  }[size];

  if (type === 'two_wheeler') {
    return (
      <div
        className={`relative w-full ${heightClasses} rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/20 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center p-4 ${className}`}
      >
        {/* Decorative road lines */}
        <div className="absolute bottom-3 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
        <div className="absolute bottom-3 left-1/3 w-8 h-1 bg-amber-400 dark:bg-amber-500 rounded-full" />

        {/* Scooter Vector Illustration */}
        <svg
          className="w-3/4 max-w-[200px] h-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 160 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rear Wheel */}
          <circle cx="36" cy="88" r="18" fill="#1E293B" />
          <circle cx="36" cy="88" r="12" fill="#E2E8F0" />
          <circle cx="36" cy="88" r="5" fill="#475569" />

          {/* Front Wheel */}
          <circle cx="124" cy="88" r="18" fill="#1E293B" />
          <circle cx="124" cy="88" r="12" fill="#E2E8F0" />
          <circle cx="124" cy="88" r="5" fill="#475569" />

          {/* Main Body Chassis */}
          <path
            d="M36 88 L60 88 L72 68 L104 68 L114 48 L124 88"
            stroke="#EA580C"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Front Apron & Headlamp */}
          <path
            d="M102 70 L118 36 L112 30"
            stroke="#C2410C"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="112" cy="30" r="5" fill="#FEF08A" />

          {/* Handlebars */}
          <path d="M108 26 L124 24" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

          {/* Seat & Rear Body */}
          <path
            d="M44 60 C44 52, 60 52, 82 54 L80 68 L44 68 Z"
            fill="#334155"
            rx="4"
          />
          <rect x="74" y="66" width="22" height="18" rx="4" fill="#EA580C" />
          
          {/* Safety Guard Pill */}
          <rect x="26" y="80" width="20" height="4" rx="2" fill="#94A3B8" />
        </svg>

        {/* Safety Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[10px] font-bold text-amber-800 dark:text-amber-300 shadow-xs border border-amber-200 dark:border-amber-800">
          <span>Safety Guard</span>
        </div>
      </div>
    );
  }

  if (type === 'car_automatic') {
    return (
      <div
        className={`relative w-full ${heightClasses} rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-600/15 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-slate-900 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-center p-4 ${className}`}
      >
        {/* Road line */}
        <div className="absolute bottom-3 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
        <div className="absolute bottom-3 left-1/4 w-12 h-1 bg-cyan-400 dark:bg-cyan-500 rounded-full" />

        {/* Automatic Hatchback / Sedan Vector */}
        <svg
          className="w-4/5 max-w-[220px] h-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 180 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wheels */}
          <circle cx="42" cy="82" r="17" fill="#0F172A" />
          <circle cx="42" cy="82" r="10" fill="#E2E8F0" />
          <circle cx="42" cy="82" r="4" fill="#0284C7" />

          <circle cx="138" cy="82" r="17" fill="#0F172A" />
          <circle cx="138" cy="82" r="10" fill="#E2E8F0" />
          <circle cx="138" cy="82" r="4" fill="#0284C7" />

          {/* Car Body */}
          <path
            d="M18 80 L30 80 M54 80 L126 80 M150 80 L166 78 C168 74, 166 66, 154 64 L142 62 L120 40 L62 40 L44 56 L24 64 C18 67, 16 75, 18 80 Z"
            fill="#0284C7"
          />

          {/* Roof & Windows */}
          <path
            d="M66 43 L116 43 L136 60 L60 60 Z"
            fill="#E0F2FE"
          />
          <line x1="94" y1="43" x2="94" y2="60" stroke="#0369A1" strokeWidth="3" />

          {/* Headlamp & Taillamp */}
          <path d="M162 68 L166 74" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
          <path d="M18 68 L18 74" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          
          {/* Door line */}
          <path d="M96 61 L96 79 M60 61 L60 79" stroke="#0369A1" strokeWidth="1.5" />
          <rect x="100" y="65" width="8" height="2.5" rx="1" fill="#0F172A" />
        </svg>

        {/* Dual Control & Auto Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-[10px] font-bold text-cyan-800 dark:text-cyan-300 shadow-xs border border-cyan-200 dark:border-cyan-800">
            Automatic AMT
          </span>
          {isDualControl && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
              Dual-Brake
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Manual Hatchback
  return (
    <div
      className={`relative w-full ${heightClasses} rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-blue-800/15 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center p-4 ${className}`}
    >
      {/* Road line */}
      <div className="absolute bottom-3 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
      <div className="absolute bottom-3 left-1/3 w-10 h-1 bg-blue-500 rounded-full" />

      {/* Manual Hatchback Vector */}
      <svg
        className="w-4/5 max-w-[220px] h-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        viewBox="0 0 180 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Wheels */}
        <circle cx="44" cy="80" r="16" fill="#0F172A" />
        <circle cx="44" cy="80" r="10" fill="#E2E8F0" />
        <circle cx="44" cy="80" r="4" fill="#1D4ED8" />

        <circle cx="136" cy="80" r="16" fill="#0F172A" />
        <circle cx="136" cy="80" r="10" fill="#E2E8F0" />
        <circle cx="136" cy="80" r="4" fill="#1D4ED8" />

        {/* Car Body (Hatchback profile) */}
        <path
          d="M20 78 L32 78 M56 78 L124 78 M148 78 L162 76 C165 72, 163 65, 150 63 L138 61 L112 38 L58 38 L32 54 L20 62 C16 65, 16 74, 20 78 Z"
          fill="#1D4ED8"
        />

        {/* Windows */}
        <path
          d="M62 41 L108 41 L132 59 L54 59 Z"
          fill="#DBEAFE"
        />
        <line x1="88" y1="41" x2="88" y2="59" stroke="#1E40AF" strokeWidth="3" />

        {/* Dual Control Instructor L Sign on top */}
        <rect x="78" y="24" width="24" height="14" rx="2" fill="#DC2626" />
        <text x="86" y="35" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
          L
        </text>

        {/* Headlamp */}
        <path d="M158 66 L162 72" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 66 L20 72" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-[10px] font-bold text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-800">
          Car (Manual)
        </span>
        {isDualControl && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
            Dual-Pedal Certified
          </span>
        )}
      </div>
    </div>
  );
};
