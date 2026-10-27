import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookingService } from '../../services/bookingService';
import { SchoolService } from '../../services/schoolService';
import { Booking, School, Package, Instructor, Vehicle } from '../../types';
import { HoldTimer } from '../../components/learner/HoldTimer';
import { InstructorAvatar } from '../../components/illustrations/InstructorAvatar';
import { useI18n } from '../../hooks/useI18n';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Calendar,
  Clock,
  Car,
  ChevronLeft,
  AlertTriangle,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [upiId, setUpiId] = useState<string>('learner@okhdfcbank');
  const [processing, setProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const allBookings = await BookingService.getAllBookings();
        const found = allBookings.find((b) => b.id === bookingId);
        if (found) {
          setBooking(found);
          const bundle = await SchoolService.getSchoolById(found.school_id);
          if (bundle) {
            setSchool(bundle.school);
            setPkg(bundle.packages.find((p) => p.id === found.package_id) || bundle.packages[0]);
            setInstructor(
              bundle.instructors.find((i) => i.id === found.instructor_id) || bundle.instructors[0]
            );
            setVehicle(
              bundle.vehicles.find((v) => v.id === found.vehicle_id) || bundle.vehicles[0]
            );
          }
        }
      } catch (e) {
        console.error('Error fetching booking details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!booking || !school || !pkg) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Booking Not Found</h2>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs min-h-[44px]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handlePay = async (simulateFailure = false) => {
    if (isHoldExpired) {
      setPaymentError('Your 10-minute hold has expired. Please select the slot again.');
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setPaymentError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
      return;
    }

    setPaymentError('');
    setProcessing(true);

    try {
      const res = await BookingService.confirmBookingPayment(booking.id, upiId, simulateFailure);

      if (res.success) {
        navigate(`/booking-success/${booking.id}`);
      } else {
        setPaymentError(res.error || 'Payment failed. Please retry before your hold expires.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  const handleHoldExpired = () => {
    setIsHoldExpired(true);
    setPaymentError('Your 10-minute slot hold has expired. The slot has been released.');
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Back Link */}
        <Link
          to={`/school-detail/${school.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Slot or Package</span>
        </Link>

        {/* 10-minute hold countdown timer */}
        {booking.hold_expires_at && !isHoldExpired ? (
          <HoldTimer expiresAt={booking.hold_expires_at} onExpired={handleHoldExpired} />
        ) : isHoldExpired ? (
          <div className="p-4 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>Slot hold has expired.</span>
            <Link
              to={`/school-detail/${school.id}`}
              className="font-bold underline text-red-800 dark:text-red-200 p-2 min-h-[44px] flex items-center"
            >
              Pick Again
            </Link>
          </div>
        ) : null}

        {/* Order Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {t('orderSummary')}
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {school.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>{school.area}, Vadodara</span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {booking.booking_code}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Course Package:</span>
              <span className="font-bold text-slate-900 dark:text-white">{pkg.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">First Lesson:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {new Date(booking.starts_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                •{' '}
                {new Date(booking.starts_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {instructor && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('instructorAssigned')}:</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <InstructorAvatar name={instructor.name} gender={instructor.gender} size="sm" showVerified={false} />
                  <span>{instructor.name}</span>
                </div>
              </div>
            )}

            {vehicle && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('vehicleAssigned')}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{vehicle.name}</span>
              </div>
            )}

            {booking.pickup_from_home && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  Doorstep Pickup Confirmed
                </div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5">{booking.pickup_address}</div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>{t('basePackagePrice')} ({pkg.lesson_count} lessons)</span>
              <span>₹{pkg.price_inr}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>{t('pickupConvenienceFee')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('freePickup')}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
              <span>{t('taxesGst')}</span>
              <span>₹0 (Included)</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
              <span>{t('totalPayable')}</span>
              <span className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-black">
                ₹{pkg.price_inr}
              </span>
            </div>
          </div>
        </div>

        {/* UPI Payment Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('payWithUPI')}
              </h2>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Instant UPI verification via Google Pay / PhonePe / Paytm / BHIM
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('enterUpiId')}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@okhdfcbank"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
            />
          </div>

          {/* Quick UPI Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
            {['pooja@okhdfcbank', 'rahul@okaxis', 'aarav@oksbi'].map((handle) => (
              <button
                key={handle}
                type="button"
                onClick={() => setUpiId(handle)}
                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer min-h-[36px] flex items-center"
              >
                {handle}
              </button>
            ))}
          </div>

          {paymentError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{t('paymentFailedTitle')}</span>
              </div>
              <p>{paymentError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handlePay(false)}
              disabled={processing || isHoldExpired}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 min-h-[48px]"
            >
              <Lock className="w-4 h-4" />
              <span>
                {processing ? t('loading') : t('simulateSuccess', { amount: pkg.price_inr })}
              </span>
            </button>

            <button
              onClick={() => handlePay(true)}
              disabled={processing || isHoldExpired}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer min-h-[44px]"
            >
              {t('simulateFailure')}
            </button>
          </div>
        </div>

        {/* Cancellation policy guarantee */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-4 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 leading-relaxed space-y-1">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cancellation Policy</span>
          </div>
          <p>{t('cancellationPolicyNote')}</p>
        </div>
      </div>
    </div>
  );
};
