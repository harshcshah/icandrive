import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, AlertTriangle, XCircle, Check } from 'lucide-react';
import { BookingStatus } from '../../types';
import { useI18n } from '../../hooks/useI18n';

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-blue-600' : 'w-3.5 h-3.5 text-blue-600'} />
      <span>{t('verifiedSchool')}</span>
    </span>
  );
};

export const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const { t } = useI18n();

  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('statusConfirmed')}</span>
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Check className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('statusCompleted')}</span>
        </span>
      );
    case 'pending_payment':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>{t('statusPending')}</span>
        </span>
      );
    case 'cancelled_by_learner':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('statusCancelledLearner')}</span>
        </span>
      );
    case 'cancelled_by_school':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span>{t('statusCancelledSchool')}</span>
        </span>
      );
    case 'no_show':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{t('statusNoShow')}</span>
        </span>
      );
    default:
      return null;
  }
};
