import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingService } from '../../services/bookingService';
import { SchoolService } from '../../services/schoolService';
import { Booking, School } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Share2,
  CalendarPlus,
  Check,
} from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t } = useI18n();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const bookings = await BookingService.getAllBookings();
        const found = bookings.find((b) => b.id === bookingId);
        if (found) {
          setBooking(found);
          const bundle = await SchoolService.getSchoolById(found.school_id);
          if (bundle) setSchool(bundle.school);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Handle Add to Calendar (.ics format download)
  const handleAddToCalendar = () => {
    if (!booking) return;

    const startDate = new Date(booking.starts_at)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(booking.ends_at)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:Driving Lesson with ${school?.name || 'Driving School'}`,
      `DESCRIPTION:icandrive booking: ${booking.booking_code}. Certified dual-control lesson in Vadodara.`,
      `LOCATION:${booking.pickup_from_home ? booking.pickup_address : school?.address || 'Vadodara'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${booking.booking_code}-driving-lesson.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Share
  const handleShare = async () => {
    if (!booking) return;
    const shareText = `I just booked my driving lesson with ${school?.name || 'driving academy'} on icandrive! Booking: ${booking.booking_code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'icandrive Booking',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Animated Checkmark Circle */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 text-white text-[10px] items-center justify-center font-bold">
              ✓
            </span>
          </span>
        </div>

        {/* Confirmation Titles */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('bookingSuccessTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t('bookingSuccessSubtitle')}
          </p>
        </div>

        {/* Booking Code Card */}
        {booking && (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {t('bookingId')}
              </span>
              <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                {booking.booking_code}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {school && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">School:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{school.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(booking.starts_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(booking.starts_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {booking.pickup_from_home && (
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Pickup Address:</span>
                  <span className="font-bold text-right text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                    {booking.pickup_address}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar and Share Action Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAddToCalendar}
            className="py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
          >
            <CalendarPlus className="w-4 h-4 text-blue-600" />
            <span>Add to Calendar</span>
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-orange-500" />
                <span>Share Details</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-2 pt-1">
          <Link
            to="/bookings"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 min-h-[48px]"
          >
            <span>{t('viewInMyBookings')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center transition min-h-[44px]"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};
