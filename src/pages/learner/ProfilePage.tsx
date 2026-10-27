import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { useDarkMode } from '../../hooks/useDarkMode';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { OnboardingModal } from '../../components/common/OnboardingModal';
import { useToast } from '../../components/common/Toast';
import { LanguageCode } from '../../types';
import {
  User,
  Phone,
  FileText,
  Globe,
  Moon,
  Sun,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut,
  Save,
  HelpCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { isDark, toggle } = useDarkMode();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [llrNumber, setLlrNumber] = useState<string>(user?.learner_license_no || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone);
      setLlrNumber(user.learner_license_no || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        learner_license_no: llrNumber,
      });
      setSavedSuccess(true);
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const completedLessons = 7;
  const totalLessons = 10;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const syllabusItems = [
    { title: 'Cockpit Drill & Clutch Friction Point', status: 'done' },
    { title: 'Gear Shifting & Baroda City Traffic', status: 'done' },
    { title: 'Akota Roundabouts & U-Turns', status: 'done' },
    { title: 'Slope / Flyover Gradient Hill Start', status: 'in_progress' },
    { title: 'Reverse Parallel & 8-Track Parking', status: 'upcoming' },
    { title: 'Darbar Hall RTO Mock Test Run', status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-16 bg-slate-50 dark:bg-slate-950">
      {showOnboarding && (
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 select-none">
              {user ? user.full_name[0] : 'U'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <div className="flex-1 truncate">
            <h1 className="text-xl font-black text-slate-900 dark:text-white truncate">
              {user?.full_name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">+91 {user?.phone}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wider">
                {user?.role === 'school_admin'
                  ? 'Driving School Partner'
                  : user?.role === 'admin'
                  ? 'Platform Super Admin'
                  : 'Verified Learner'}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Journey Progress Tracker (Learner only) */}
        {user?.role === 'learner' && (
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white rounded-3xl p-6 shadow-xl border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="font-black text-base text-white">
                    {t('learningProgress')}
                  </h2>
                  <div className="text-xs text-blue-100 font-medium">
                    {t('completedLessonsBadge', { completed: completedLessons, total: totalLessons })}
                  </div>
                </div>
              </div>

              <span className="text-2xl font-black text-amber-300">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="pt-2 border-t border-white/15 space-y-2 text-xs">
              <div className="font-bold text-blue-200 uppercase tracking-wider text-[10px]">
                Syllabus Milestones (Vadodara RTO Standard)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {syllabusItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xs ${
                      item.status === 'done'
                        ? 'bg-white/15 text-white'
                        : item.status === 'in_progress'
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                        : 'bg-white/5 text-blue-200 opacity-60'
                    }`}
                  >
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : item.status === 'in_progress' ? (
                      <Clock className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Edit Form */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
        >
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t('learnerProfile')}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled
                  value={phone}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs sm:text-sm font-semibold text-slate-500 cursor-not-allowed min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('learnerLicenseNumber')}
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={llrNumber}
                  onChange={(e) => setLlrNumber(e.target.value)}
                  placeholder={t('addLlrPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Your Learner's Licence Number verifies your driving eligibility on lesson day.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition active:scale-95 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t('loading') : t('saveProfile')}</span>
            </button>
          </div>
        </form>

        {/* App Settings & Onboarding trigger */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            App Settings & Preferences
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Language Switch */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t('preferredLanguage')}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['en', 'hi', 'gu'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer min-h-[36px] ${
                      language === lang
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Theme Appearance
                </span>
              </div>
              <button
                onClick={toggle}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
              >
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>

            {/* Replay Onboarding */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    How icandrive Works
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Revisit the 3-step guide for booking driving lessons
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
              >
                View Guide
              </button>
            </div>

            {/* PWA Install */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Offline App Installation
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Install icandrive on home screen for 1-tap bookings
                  </div>
                </div>
              </div>
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
