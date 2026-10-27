import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import {
  Compass,
  CalendarDays,
  Bell,
  User,
  Clock,
  CalendarCheck,
  Building2,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  // Hide bottom nav on booking, checkout, and success screens so sticky action bar has full uninterrupted focus
  if (
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/booking-success') ||
    location.pathname.startsWith('/school-detail')
  ) {
    return null;
  }

  const isSchoolAdmin = user?.role === 'school_admin';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* 1. LEARNER NAVIGATION */}
      {!isSchoolAdmin && !isAdmin && (
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Compass className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">{t('navHome')}</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CalendarDays className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">{t('navBookings')}</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bell className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <span className="text-[11px] tracking-tight">{t('navAlerts')}</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">{t('navProfile')}</span>
              </>
            )}
          </NavLink>
        </div>
      )}

      {/* 2. SCHOOL ADMIN NAVIGATION */}
      {isSchoolAdmin && (
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
          <NavLink
            to="/school"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Clock className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">Today</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/school"
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <CalendarCheck className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight">Bookings</span>
          </NavLink>

          <NavLink
            to="/school"
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <CalendarDays className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight">Schedule</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">{t('navProfile')}</span>
              </>
            )}
          </NavLink>
        </div>
      )}

      {/* 3. PLATFORM ADMIN NAVIGATION */}
      {isAdmin && (
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <TrendingUp className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">Analytics</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/admin"
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <Building2 className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight">Schools</span>
          </NavLink>

          <NavLink
            to="/admin"
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <CalendarCheck className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight">Bookings</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] tracking-tight">{t('navProfile')}</span>
              </>
            )}
          </NavLink>
        </div>
      )}
    </nav>
  );
};
