import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface HoldTimerProps {
  expiresAt: string; // ISO string
  onExpired: () => void;
}

export const HoldTimer: React.FC<HoldTimerProps> = ({ expiresAt, onExpired }) => {
  const { t } = useI18n();
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeftSec(0);
        clearInterval(interval);
        onExpired();
      } else {
        setTimeLeftSec(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // Total hold is 10 minutes = 600s
  const totalHoldSec = 600;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftSec / totalHoldSec) * 100));
  const isUrgent = timeLeftSec < 120; // less than 2 minutes

  const strokeDashoffset = 100 - progressPercent;

  return (
    <div
      className={`rounded-2xl p-4 border flex items-center justify-between gap-3 transition-colors ${
        isUrgent
          ? 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
          : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Animated SVG Ring */}
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-1000 ${
                isUrgent ? 'text-red-500' : 'text-orange-500'
              }`}
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
          </span>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">
            {t('bookingHoldActive')}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {t('holdExpiresIn')}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div
          className={`font-mono text-xl sm:text-2xl font-black ${
            isUrgent ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-blue-700 dark:text-blue-300'
          }`}
        >
          {pad(minutes)}:{pad(seconds)}
        </div>
        <div className="text-[10px] text-slate-500">Auto-releases if unpaid</div>
      </div>
    </div>
  );
};
