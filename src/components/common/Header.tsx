import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { useDarkMode } from '../../hooks/useDarkMode';
import { LanguageCode } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Compass,
  CalendarCheck,
  Building2,
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  User,
  LayoutDashboard,
  Percent,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();

  const isSchoolAdmin = user?.role === 'school_admin';
  const isAdmin = user?.role === 'admin';
  const isLearner = !isSchoolAdmin && !isAdmin;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo - Compact and clean */}
        <Link to="/" className="flex items-center gap-2 group shrink-0 min-h-[44px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
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
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
            icandrive
          </span>
        </Link>

        {/* Desktop Role-Based Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-bold">
          {/* Learner Only Links */}
          {isLearner && (
            <>
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl transition min-h-[44px] flex items-center ${
                  location.pathname === '/'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('navHome')}
              </Link>
              <Link
                to="/bookings"
                className={`px-3.5 py-2 rounded-xl transition min-h-[44px] flex items-center ${
                  location.pathname === '/bookings'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('navBookings')}
              </Link>
            </>
          )}

          {/* School Admin Links */}
          {isSchoolAdmin && (
            <>
              <Link
                to="/school"
                className={`px-3.5 py-2 rounded-xl transition min-h-[44px] flex items-center ${
                  location.pathname === '/school'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Today's Lessons
              </Link>
              <Link
                to="/school"
                className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition min-h-[44px] flex items-center"
              >
                Schedule & Earnings
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl transition min-h-[44px] flex items-center ${
                  location.pathname === '/admin'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Analytics & Schools
              </Link>
              <Link
                to="/admin"
                className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition min-h-[44px] flex items-center"
              >
                Commission & Refunds
              </Link>
            </>
          )}
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install */}
          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          {/* Compact Language Menu */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-xs font-bold">
            {(['en', 'hi', 'gu'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1.5 rounded-lg transition cursor-pointer min-h-[36px] flex items-center justify-center ${
                  language === lang
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
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

          {/* Notifications (Learner only) */}
          {isLearner && (
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
            </Link>
          )}

          {/* User profile / login button */}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                {user.full_name[0]}
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs min-h-[44px] flex items-center"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
