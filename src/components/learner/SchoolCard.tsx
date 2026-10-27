import React from 'react';
import { Link } from 'react-router-dom';
import { School } from '../../types';
import { VerifiedBadge } from '../common/Badge';
import { SchoolCoverIllustration } from '../illustrations/SchoolCoverIllustration';
import { Star, MapPin, Car, Bike, UserCheck, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface SchoolCardProps {
  school: School;
  minPrice?: number;
  hasFemaleInstructor?: boolean;
  hasAutomatic?: boolean;
  hasTwoWheeler?: boolean;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  minPrice = 350,
  hasFemaleInstructor = true,
  hasAutomatic = true,
  hasTwoWheeler = true,
}) => {
  const { t } = useI18n();

  return (
    <Link
      to={`/school-detail/${school.id}`}
      className="group block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      {/* Top Cover - Stylized Illustrated Scenery */}
      <div className="relative w-full overflow-hidden">
        <SchoolCoverIllustration area={school.area} name={school.name} size="md" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {school.verified && <VerifiedBadge size="sm" />}
        </div>

        {/* Rating Floating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-xs font-bold text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-slate-700/60">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{school.rating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 font-normal">({school.review_count})</span>
        </div>

        {/* Bottom overlay text on illustration */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white">
          <div className="truncate pr-2">
            <h3 className="font-extrabold text-base sm:text-lg text-white drop-shadow-xs truncate">
              {school.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-200 drop-shadow-xs">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-400" />
              <span className="truncate">{school.area}, Vadodara</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
        {/* Features Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-700 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
            <Car className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Dual-Control</span>
          </span>

          {hasAutomatic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
              <span>Automatic</span>
            </span>
          )}

          {hasFemaleInstructor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-[11px] font-semibold border border-pink-100 dark:border-pink-900/40">
              <UserCheck className="w-3 h-3 text-pink-600" />
              <span>Female Trainer</span>
            </span>
          )}

          {hasTwoWheeler && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
              <Bike className="w-3 h-3 text-slate-500" />
              <span>Scooter</span>
            </span>
          )}
        </div>

        {/* Price & Action row */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between min-h-[44px]">
          <div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Starting from</div>
            <div className="text-base sm:text-lg font-extrabold text-blue-700 dark:text-blue-400">
              ₹{minPrice}{' '}
              <span className="text-xs font-normal text-slate-600 dark:text-slate-400">/ lesson</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Book Slot</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};
