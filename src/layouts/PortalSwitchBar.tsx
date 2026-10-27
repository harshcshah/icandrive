import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Info,
  ChevronRight,
  CheckCircle2,
  Users,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export const PortalSwitchBar: React.FC = () => {
  const { user, switchUser, allDemoProfiles } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Determine current active portal based on current pathname and user role
  const isSchoolPortal = location.pathname.startsWith('/school');
  const isAdminPortal = location.pathname.startsWith('/admin');
  const isLearnerPortal = !isSchoolPortal && !isAdminPortal;

  const currentPortalId: 'learner' | 'school' | 'admin' = isSchoolPortal
    ? 'school'
    : isAdminPortal
    ? 'admin'
    : 'learner';

  const handlePortalSwitch = async (portal: 'learner' | 'school' | 'admin') => {
    if (portal === 'learner') {
      if (user?.role !== 'learner') {
        const learnerProfile = allDemoProfiles.find((p) => p.role === 'learner') || {
          id: 'user_learner_pooja',
        };
        await switchUser(learnerProfile.id);
      }
      navigate('/');
      showToast('Switched to Learner View (Vadodara Marketplace)', 'info');
    } else if (portal === 'school') {
      if (user?.role !== 'school_admin') {
        const schoolProfile = allDemoProfiles.find((p) => p.role === 'school_admin') || {
          id: 'user_school_sayaji',
        };
        await switchUser(schoolProfile.id);
      }
      navigate('/school');
      showToast('Switched to Driving School Partner Hub (Sayaji Motor Academy)', 'success');
    } else if (portal === 'admin') {
      if (user?.role !== 'admin') {
        const adminProfile = allDemoProfiles.find((p) => p.role === 'admin') || {
          id: 'user_admin_harsh',
        };
        await switchUser(adminProfile.id);
      }
      navigate('/admin');
      showToast('Switched to Super Admin Console (Central Platform Operations)', 'info');
    }
  };

  return (
    <>
      {/* Top Bifurcated Portal Switcher Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-3 sm:px-4 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left Portal Selector Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
              Portal View:
            </span>

            {/* 1. Learner Portal Tab */}
            <button
              onClick={() => handlePortalSwitch('learner')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                currentPortalId === 'learner'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-300" />
              <span>Learner View</span>
              {currentPortalId === 'learner' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
              )}
            </button>

            {/* 2. School Owner Tab */}
            <button
              onClick={() => handlePortalSwitch('school')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                currentPortalId === 'school'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span>School Owner</span>
              <span className="text-[10px] opacity-80 hidden md:inline">(Sayaji Motor)</span>
              {currentPortalId === 'school' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden sm:inline-block" />
              )}
            </button>

            {/* 3. Platform Admin Tab */}
            <button
              onClick={() => handlePortalSwitch('admin')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                currentPortalId === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              <span>Super Admin</span>
              {currentPortalId === 'admin' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block" />
              )}
            </button>
          </div>

          {/* Right Action & Architecture Guide */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Architecture Guide Button */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
              title="Learn how the 3 platform views connect"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Role Guide</span>
            </button>

            {/* Persona Switcher Quick Button */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
              <span className="truncate max-w-[90px] sm:max-w-[130px]">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Architecture & Multi-Role Guide Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="icandrive Multi-Role Platform Architecture"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            <strong>icandrive</strong> is architected with complete role-based segregation across three core portals:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>1. Learner Marketplace Portal (`/`)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For Vadodara students. Search certified driving schools across 8 areas, compare lesson packages, select slots with real collision prevention, lock slots with a 10-minute hold timer, pay via simulated UPI, and manage cancellations/rescheduling.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                <Building2 className="w-4 h-4" />
                <span>2. Driving School Partner Hub (`/school`)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For driving school owners (e.g., Sayaji Motor Academy). View today's lesson itinerary, start/complete lessons, configure fleet vehicles (manual, automatic, two-wheeler), manage instructors, block vacation time, and view net earnings after 15% platform commission.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Super Admin Central Operations (`/admin`)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For platform operators. Monitor GMV analytics, onboard new academies, audit RTO licenses, process student UPI refunds, calibrate school commission percentages, and moderate reviews.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              All data services in <code>/src/services</code> return typed promises, ready for 1-step migration to Supabase PostgreSQL and Razorpay webhooks.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowInfoModal(false)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>

      {/* Demo Persona Switcher Modal */}
      <Modal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        title="Switch Demo Persona"
      >
        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-xs text-slate-500 mb-2">
            Select an account to test permissions, bookings, and operations:
          </p>

          <div className="space-y-2">
            {allDemoProfiles.map((p) => {
              const isSelected = user?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={async () => {
                    await switchUser(p.id);
                    setShowPersonaModal(false);
                    if (p.role === 'school_admin') {
                      navigate('/school');
                    } else if (p.role === 'admin') {
                      navigate('/admin');
                    } else {
                      navigate('/');
                    }
                    showToast(`Switched account to ${p.full_name}`, 'success');
                  }}
                  className={`w-full min-h-[48px] p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${
                        p.role === 'admin'
                          ? 'bg-indigo-600 text-white'
                          : p.role === 'school_admin'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {p.full_name[0]}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">{p.full_name}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {p.role.replace('_', ' ')} • {p.phone}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};
