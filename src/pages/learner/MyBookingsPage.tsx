import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { BookingService } from '../../services/bookingService';
import { SchoolService } from '../../services/schoolService';
import { Booking, School, TimeSlot } from '../../types';
import { BookingStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SlotPicker } from '../../components/learner/SlotPicker';
import { ReviewModal } from '../../components/learner/ReviewModal';
import { useToast } from '../../components/common/Toast';
import {
  Calendar,
  Clock,
  MapPin,
  RotateCcw,
  XCircle,
  Star,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schoolsMap, setSchoolsMap] = useState<Record<string, School>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Reschedule Modal State
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleNewSlot, setRescheduleNewSlot] = useState<TimeSlot | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string>('');
  const [rescheduling, setRescheduling] = useState<boolean>(false);

  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await BookingService.getLearnerBookings(user.id);
      setBookings(list);

      const allSchools = await SchoolService.getSchools();
      const sMap: Record<string, School> = {};
      allSchools.forEach((s) => {
        sMap[s.id] = s;
      });
      setSchoolsMap(sMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const now = Date.now();

  const upcomingBookings = bookings.filter((b) => {
    const isConfirmedOrPending = b.status === 'confirmed' || b.status === 'pending_payment';
    const isFuture = new Date(b.starts_at).getTime() >= now;
    return isConfirmedOrPending && isFuture;
  });

  const pastBookings = bookings.filter((b) => {
    const isPastStatus =
      b.status === 'completed' ||
      b.status === 'cancelled_by_learner' ||
      b.status === 'cancelled_by_school' ||
      b.status === 'no_show';
    const isPastDate = new Date(b.starts_at).getTime() < now;
    return isPastStatus || isPastDate;
  });

  // Handle Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleBooking || !rescheduleNewSlot) return;
    setRescheduling(true);
    setRescheduleError('');

    try {
      await BookingService.rescheduleBooking(
        rescheduleBooking.id,
        rescheduleNewSlot.starts_at,
        rescheduleNewSlot.ends_at
      );
      setRescheduleBooking(null);
      setRescheduleNewSlot(null);
      showToast('Driving lesson successfully rescheduled!', 'success');
      await fetchBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'Unable to reschedule slot.');
    } finally {
      setRescheduling(false);
    }
  };

  // Handle Cancel
  const handleConfirmCancellation = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);

    try {
      const res = await BookingService.cancelBooking(
        cancelModalBooking.id,
        'learner',
        cancelReason
      );
      setCancelModalBooking(null);
      setCancelReason('');
      showToast(`Lesson cancelled. Refund: ₹${res.refundAmount}`, 'info');
      await fetchBookings();
    } catch (err: any) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen pb-28 md:pb-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('myBookingsTitle')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Manage your upcoming driving sessions and past practice history
            </p>
          </div>
        </div>

        {/* Single-line Tabs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('upcomingTab')} ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('pastTab')} ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : displayedList.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('noBookingsFound')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Ready to learn? Explore verified driving academies across Vadodara.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 min-h-[44px]"
            >
              <span>{t('browseSchools')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedList.map((booking) => {
              const school = schoolsMap[booking.school_id];
              const lessonDate = new Date(booking.starts_at);
              const isPast = lessonDate.getTime() < now;
              const isUpcoming = !isPast && booking.status === 'confirmed';

              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                        {booking.booking_code}
                      </span>
                      <h3 className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                        {school ? school.name : 'Vadodara Driving School'}
                      </h3>
                      {school && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>{school.area}, Vadodara</span>
                        </div>
                      )}
                    </div>

                    <BookingStatusBadge status={booking.status} />
                  </div>

                  {/* Lesson Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">
                          {lessonDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        -{' '}
                        {new Date(booking.ends_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        (45 Mins)
                      </span>
                    </div>

                    {booking.pickup_from_home && (
                      <div className="col-span-full pt-1 text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                          Pickup Confirmed
                        </span>
                        <span className="truncate">{booking.pickup_address}</span>
                      </div>
                    )}

                    {booking.cancellation_fee_inr !== undefined && booking.cancellation_fee_inr > 0 && (
                      <div className="col-span-full text-xs text-slate-500">
                        Cancellation fee: ₹{booking.cancellation_fee_inr} • Refunded: ₹{booking.refund_amount_inr}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{booking.amount_inr}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reschedule */}
                      {isUpcoming && (
                        <button
                          onClick={() => {
                            setRescheduleBooking(booking);
                            setRescheduleNewSlot(null);
                            setRescheduleError('');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition min-h-[44px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('rescheduleLesson')}</span>
                        </button>
                      )}

                      {/* Cancel */}
                      {isUpcoming && (
                        <button
                          onClick={() => {
                            setCancelModalBooking(booking);
                            setCancelReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 cursor-pointer transition min-h-[44px]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('cancelLesson')}</span>
                        </button>
                      )}

                      {/* Rate Completed */}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-black text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition min-h-[44px]"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{t('rateAndReview')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <Modal
          isOpen={!!rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          title={t('rescheduleTitle')}
          subtitle={`Booking: ${rescheduleBooking.booking_code}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('rescheduleNotice')}
            </p>

            <SlotPicker
              schoolId={rescheduleBooking.school_id}
              packageId={rescheduleBooking.package_id}
              selectedSlot={rescheduleNewSlot}
              onSelectSlot={(slot) => {
                setRescheduleNewSlot(slot);
                setRescheduleError('');
              }}
            />

            {rescheduleError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setRescheduleBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold min-h-[44px]"
              >
                {t('cancel')}
              </button>
              <button
                disabled={!rescheduleNewSlot || rescheduling}
                onClick={handleConfirmReschedule}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-black text-white shadow-md cursor-pointer min-h-[44px]"
              >
                {rescheduling ? t('loading') : t('confirmReschedule')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={!!cancelModalBooking}
          onClose={() => setCancelModalBooking(null)}
          title={t('cancelTitle')}
          subtitle={`Booking: ${cancelModalBooking.booking_code}`}
        >
          <div className="space-y-4 text-xs">
            {(() => {
              const startMs = new Date(cancelModalBooking.starts_at).getTime();
              const diffHours = (startMs - Date.now()) / (1000 * 60 * 60);
              const isFree = diffHours >= 6;
              const fee = Math.round(cancelModalBooking.amount_inr * 0.5);
              const refund = cancelModalBooking.amount_inr - fee;

              return (
                <div
                  className={`p-4 rounded-2xl border ${
                    isFree
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">
                    {isFree ? '100% Free Cancellation' : 'Late Cancellation Policy (< 6 Hours)'}
                  </div>
                  <p className="leading-relaxed">
                    {isFree
                      ? t('freeCancellationEligible')
                      : t('lateCancellationNotice', { fee, refund })}
                  </p>
                </div>
              );
            })()}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('reasonForCancellation')}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling unwell"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold min-h-[44px]"
              >
                {t('keepBookingButton')}
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={cancelling}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white shadow-md cursor-pointer min-h-[44px]"
              >
                {cancelling ? t('loading') : t('cancelConfirmButton')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          onSubmitted={() => {
            showToast('Thank you for rating your lesson!', 'success');
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
