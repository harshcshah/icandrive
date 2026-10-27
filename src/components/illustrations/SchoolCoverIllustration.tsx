import React from 'react';
import { VadodaraArea } from '../../types';

interface SchoolCoverIllustrationProps {
  area: VadodaraArea;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SchoolCoverIllustration: React.FC<SchoolCoverIllustrationProps> = ({
  area,
  name,
  className = '',
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-28',
    md: 'h-44 sm:h-48',
    lg: 'h-64 sm:h-72',
  }[size];

  // Theme configuration per Vadodara locality
  const getTheme = (loc: VadodaraArea) => {
    switch (loc) {
      case 'Alkapuri':
        return {
          bg: 'from-blue-700 via-blue-800 to-indigo-900',
          accent: '#60A5FA',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'Central Baroda Hub',
        };
      case 'Manjalpur':
        return {
          bg: 'from-teal-700 via-emerald-800 to-slate-900',
          accent: '#34D399',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'South Ring Road',
        };
      case 'Gotri':
        return {
          bg: 'from-sky-700 via-blue-800 to-slate-900',
          accent: '#38BDF8',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'Sevasi Canal Route',
        };
      case 'Karelibaug':
        return {
          bg: 'from-indigo-800 via-purple-900 to-slate-950',
          accent: '#A78BFA',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'Heritage City Track',
        };
      case 'Makarpura':
        return {
          bg: 'from-slate-800 via-slate-900 to-blue-950',
          accent: '#94A3B8',
          roadStroke: 'rgba(255, 255, 255, 0.25)',
          tag: 'GIDC Highway Corridor',
        };
      case 'Waghodia Road':
        return {
          bg: 'from-amber-700 via-orange-800 to-slate-900',
          accent: '#FBBF24',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'Campus & Expressway',
        };
      case 'Akota':
        return {
          bg: 'from-blue-800 via-indigo-900 to-slate-950',
          accent: '#818CF8',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'Stadium Circuit Track',
        };
      case 'Fatehgunj':
      default:
        return {
          bg: 'from-cyan-800 via-blue-900 to-slate-950',
          accent: '#22D3EE',
          roadStroke: 'rgba(255, 255, 255, 0.2)',
          tag: 'MSU University Circle',
        };
    }
  };

  const theme = getTheme(area);

  return (
    <div
      className={`relative w-full ${heightClasses} overflow-hidden bg-gradient-to-tr ${theme.bg} ${className}`}
    >
      {/* Background road network lines & architectural geometric overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* Soft grid lines */}
        <line x1="0" y1="50" x2="400" y2="50" stroke={theme.roadStroke} strokeWidth="1" />
        <line x1="0" y1="100" x2="400" y2="100" stroke={theme.roadStroke} strokeWidth="1" />
        <line x1="0" y1="150" x2="400" y2="150" stroke={theme.roadStroke} strokeWidth="1" />
        <line x1="100" y1="0" x2="100" y2="200" stroke={theme.roadStroke} strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="200" stroke={theme.roadStroke} strokeWidth="1" />
        <line x1="300" y1="0" x2="300" y2="200" stroke={theme.roadStroke} strokeWidth="1" />

        {/* Driving curve and turn indicator */}
        <path
          d="M -20 180 C 120 180, 160 80, 260 80 C 340 80, 380 40, 420 30"
          stroke="white"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* 8-Track Mock Outline */}
        <circle cx="330" cy="140" r="32" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />
        <circle cx="330" cy="80" r="32" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />
      </svg>

      {/* Decorative Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

      {/* Foreground Driving Emblem */}
      <div className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
        <svg
          className="w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v6" />
          <path d="M12 15v6" />
          <path d="M3 12h6" />
          <path d="M15 12h6" />
        </svg>
      </div>

      {/* Soft Bottom Shadow Vignette */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />

      {/* Sub-label inside illustration */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/15">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{theme.tag}</span>
      </div>
    </div>
  );
};
