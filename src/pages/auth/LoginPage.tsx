import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import {
  Phone,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithOtp, switchUser, allDemoProfiles } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [otp, setOtp] = useState<string>('123456');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await loginWithOtp(phoneNumber, otp);
      if (user.role === 'school_admin') {
        navigate('/school');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (userId: string) => {
    setLoading(true);
    try {
      const u = await switchUser(userId);
      if (u.role === 'school_admin') {
        navigate('/school');
      } else if (u.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v6" />
              <path d="M12 15v6" />
              <path d="M3 12h6" />
              <path d="M15 12h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('loginTitle')}
          </h1>
          <p className="text-xs text-slate-500">{t('loginSubtitle')}</p>
        </div>

        {/* Step 1: Phone */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{t('sendOtp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('enterOtp')}
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold underline"
                >
                  Change Number
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold tracking-widest text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mt-1.5 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-lg">
                💡 {t('otpHint')}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{loading ? t('loading') : t('verifyAndLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Personas */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Or Click a Demo Account to Instant-Login
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPersona('user_learner_pooja')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 text-left flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Pooja Patel (Learner)
                </div>
                <div className="text-[11px] text-slate-500">
                  Gotri, Vadodara • 7 lessons completed
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-blue-600" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('user_school_sayaji')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 text-left flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Sayaji Motor Driving School
                </div>
                <div className="text-[11px] text-slate-500">
                  School Admin Portal • Alkapuri, Vadodara
                </div>
              </div>
              <Building2 className="w-4 h-4 text-purple-600" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('user_admin_harsh')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 text-left flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Harsh Shah (Super Admin)
                </div>
                <div className="text-[11px] text-slate-500">
                  Full Platform Approvals & Revenue Control
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
