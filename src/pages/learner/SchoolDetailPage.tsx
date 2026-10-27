import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SchoolService } from '../../services/schoolService';
import { BookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { School, Instructor, Vehicle, Package, Review, TimeSlot } from '../../types';
import { VerifiedBadge } from '../../components/common/Badge';
import { SlotPicker } from '../../components/learner/SlotPicker';
import { SchoolCoverIllustration } from '../../components/illustrations/SchoolCoverIllustration';
import { VehicleIllustration } from '../../components/illustrations/VehicleIllustration';
import { InstructorAvatar } from '../../components/illustrations/InstructorAvatar';
import {
  MapPin,
  Star,
  Check,
  Calendar,
  Clock,
  Home,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Car,
  Bike,
  ShieldCheck,
} from 'lucide-react';

export const SchoolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [data, setData] = useState<{
    school: School;
    instructors: Instructor[];
    vehicles: Vehicle[];
    packages: Package[];
    reviews: Review[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [pickupFromHome, setPickupFromHome] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'packages' | 'instructors' | 'vehicles' | 'reviews'>('packages');
  const [submittingHold, setSubmittingHold] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const fetchBundle = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await SchoolService.getSchoolById(id);
        if (res) {
          setData(res);
          if (res.packages.length > 0) {
            setSelectedPackageId(res.packages[0].id);
          }
        }
      } catch (e) {
        console.error('Error fetching school', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-10 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Driving School Not Found</h2>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs min-h-[44px]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const { school, instructors, vehicles, packages, reviews } = data;
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const handleInitiateHold = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select a lesson slot from Step 2 to continue.');
      return;
    }
    if (pickupFromHome && !pickupAddress.trim()) {
      setErrorMsg('Please enter your pickup society / flat address in Vadodara.');
      return;
    }

    setErrorMsg('');
    setSubmittingHold(true);

    try {
      const learnerId = user?.id || 'user_learner_pooja';
      const learnerName = user?.full_name || 'Demo Learner';
      const learnerPhone = user?.phone || '9876543210';

      const booking = await BookingService.createHoldBooking({
        schoolId: school.id,
        instructorId: selectedSlot.instructor_id,
        vehicleId: selectedSlot.vehicle_id,
        packageId: selectedPackage.id,
        learnerId,
        learnerName,
        learnerPhone,
        startsAt: selectedSlot.starts_at,
        endsAt: selectedSlot.ends_at,
        pickupFromHome,
        pickupAddress: pickupFromHome ? pickupAddress : undefined,
      });

      navigate(`/checkout/${booking.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to hold slot. It may have just been booked.');
    } finally {
      setSubmittingHold(false);
    }
  };

  return (
    <div className="min-h-screen pb-36 sm:pb-32 bg-slate-50 dark:bg-slate-950">
      {/* Hero Header with Vector Road Cover Illustration */}
      <div className="relative w-full overflow-hidden">
        <SchoolCoverIllustration area={school.area} name={school.name} size="lg" />

        {/* Back Link */}
        <Link
          to="/"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-bold transition min-h-[44px] select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Schools</span>
        </Link>

        {/* Hero Title overlay */}
        <div className="absolute bottom-5 left-4 right-4 max-w-4xl mx-auto text-white space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {school.verified && <VerifiedBadge size="md" />}
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white">
              RTO License: {school.rto_license_no}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            {school.name}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-200 flex-wrap">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>{school.area}, Vadodara</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{school.rating.toFixed(1)}</span>
              <span className="font-normal text-slate-300">({school.review_count} reviews)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Navigation Tabs (Single line with scroll snap) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('packages')}
            className={`shrink-0 snap-start flex-1 py-2.5 px-3.5 rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'packages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`shrink-0 snap-start flex-1 py-2.5 px-3.5 rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'instructors'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Instructors ({instructors.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`shrink-0 snap-start flex-1 py-2.5 px-3.5 rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'vehicles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`shrink-0 snap-start flex-1 py-2.5 px-3.5 rounded-xl transition cursor-pointer min-h-[44px] flex items-center justify-center ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Packages & Slot Selection (Main Booking Flow) */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* School Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('aboutSchool')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {school.description}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                {school.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Step 1: Select Package */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 1: Choose Course Package
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const perLessonPrice = Math.round(pkg.price_inr / pkg.lesson_count);

                  return (
                    <button
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setSelectedSlot(null);
                      }}
                      className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[140px] ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {pkg.vehicle_type === 'car_manual'
                              ? 'Car Manual'
                              : pkg.vehicle_type === 'car_automatic'
                              ? 'Automatic'
                              : 'Scooter'}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                          {pkg.name}
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {pkg.description}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                        <div>
                          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            ₹{pkg.price_inr}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            ₹{perLessonPrice} / 45m lesson
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {pkg.lesson_count} Lessons
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Slot Picker */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 2: Pick Lesson 1 Date & Time Slot
              </h3>

              <SlotPicker
                schoolId={school.id}
                packageId={selectedPackage.id}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setErrorMsg('');
                }}
              />
            </div>

            {/* Doorstep Pickup Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('pickupFromHomeToggle')}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Instructor will arrive at your address with the dual-control vehicle (Free in Vadodara)
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={pickupFromHome}
                    onChange={(e) => setPickupFromHome(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600" />
                </label>
              </div>

              {pickupFromHome && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('pickupAddressLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder={t('pickupAddressPlaceholder')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Instructors (Initials Avatars) */}
        {activeTab === 'instructors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {instructors.map((inst) => (
              <div
                key={inst.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4"
              >
                <InstructorAvatar name={inst.name} gender={inst.gender} size="lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {inst.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{inst.rating.toFixed(1)}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {inst.experience_years} years exp • {inst.gender === 'female' ? 'Female Instructor' : 'Male Instructor'}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Languages: {inst.languages.join(', ')}
                  </div>

                  {inst.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1 leading-relaxed">
                      {inst.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Vehicles (Vector Illustrations) */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <VehicleIllustration
                  type={veh.vehicle_type}
                  name={veh.name}
                  isDualControl={veh.is_dual_control}
                  size="md"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {veh.name}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {veh.reg_no}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Model {veh.model_year}
                    </span>
                    <span>•</span>
                    <span>{veh.is_dual_control ? 'Dual-Control Dual-Brake' : 'Safety Side-Guard'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Student Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <InstructorAvatar name={rev.learner_name} size="sm" showVerified={false} />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.learner_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.school_reply && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border-l-3 border-blue-600 text-xs space-y-1">
                    <div className="font-bold text-blue-700 dark:text-blue-400">
                      {school.name} Response:
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{rev.school_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for booking (Positioned cleanly at bottom without obscuring nav) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="truncate">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Course Fee</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ₹{selectedPackage.price_inr}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold truncate max-w-[170px] sm:max-w-xs">
              {selectedSlot ? selectedSlot.display_time : 'Pick a time slot'}
            </div>
          </div>

          <button
            onClick={handleInitiateHold}
            disabled={submittingHold}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95 min-h-[48px]"
          >
            <span>{submittingHold ? 'Holding Slot...' : 'Book & Hold Slot (10 Mins)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
