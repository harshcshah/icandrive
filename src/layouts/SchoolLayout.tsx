import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { useDarkMode } from '../hooks/useDarkMode';
import { LanguageCode } from '../types';
import { PortalSwitchBar } from './PortalSwitchBar';
import { BottomNav } from '../components/common/BottomNav';
import {
  Building2,
  CalendarCheck,
  Clock,
  Car,
  TrendingUp,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const SchoolLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { language, setLanguage } = useI18n();
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Portal Switcher */}
      <PortalSwitchBar />

      {/* Driving School Partner Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-200/80 dark:border-emerald-950 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo & School Partner Branding */}
          <Link to="/school" className="flex items-center gap-2.5 group shrink-0 min-h-[44px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  icandrive
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Partner Hub
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold hidden sm:flex -mt-0.5">
                <span>Sayaji Motor Academy • Alkapuri</span>
                <span className="text-emerald-600">✓ Verified</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links for School Owners */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
            <Link
              to="/school"
              className="px-3 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 min-h-[44px] flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Today's Sessions</span>
            </Link>

            <Link
              to="/school"
              className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white min-h-[44px] flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Bookings Audit</span>
            </Link>

            <Link
              to="/school"
              className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white min-h-[44px] flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Fleet & Instructors</span>
            </Link>

            <Link
              to="/school"
              className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white min-h-[44px] flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Earnings & Payouts</span>
            </Link>
          </nav>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RTO Licenced</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-xs font-bold">
              {(['en', 'hi', 'gu'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1.5 rounded-lg transition cursor-pointer min-h-[36px] flex items-center justify-center ${
                    language === lang
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Gujarati'}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'ગુ'}
                </button>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* School Partner Monogram Avatar */}
            {user ? (
              <div
                className="flex items-center gap-1.5 p-1 rounded-full border border-emerald-300 dark:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[44px]"
                title={user.full_name}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {user.full_name[0]}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs min-h-[44px] flex items-center"
              >
                Partner Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Nav for School Partner */}
      <BottomNav />
    </div>
  );
};
