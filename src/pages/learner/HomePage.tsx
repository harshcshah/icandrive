import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { SchoolService, SchoolFilterOptions } from '../../services/schoolService';
import { SchoolCard } from '../../components/learner/SchoolCard';
import { ScrollableChips, ChipItem } from '../../components/common/ScrollableChips';
import { OnboardingModal } from '../../components/common/OnboardingModal';
import { School, VadodaraArea, VehicleType } from '../../types';
import {
  Search,
  MapPin,
  Car,
  Bike,
  ShieldCheck,
  Clock,
  CreditCard,
  Star,
  Sparkles,
  ArrowRight,
  Award,
  HelpCircle,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VADODARA_AREAS: (VadodaraArea | 'All')[] = [
  'All',
  'Alkapuri',
  'Manjalpur',
  'Gotri',
  'Karelibaug',
  'Makarpura',
  'Waghodia Road',
  'Akota',
  'Fatehgunj',
];

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<VadodaraArea | 'All'>('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | 'All'>('All');
  const [femaleInstructorOnly, setFemaleInstructorOnly] = useState<boolean>(false);
  const [automaticOnly, setAutomaticOnly] = useState<boolean>(false);
  const [weekendSlotsOnly, setWeekendSlotsOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'priceAsc' | 'priceDesc'>('rating');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Check if first-time user
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('icd_onboarding_done');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Greeting based on current local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 17) return t('greetingAfternoon');
    return t('greetingEvening');
  }, [t]);

  useEffect(() => {
    let active = true;
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const filters: SchoolFilterOptions = {
          searchQuery,
          area: selectedArea,
          vehicleType: selectedVehicleType,
          femaleInstructorOnly,
          automaticOnly,
          weekendSlotsOnly,
          minRating,
          sortBy,
        };
        const list = await SchoolService.getSchools(filters);
        if (active) setSchools(list);
      } catch (e) {
        console.error('Error fetching schools', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSchools();
    return () => {
      active = false;
    };
  }, [
    searchQuery,
    selectedArea,
    selectedVehicleType,
    femaleInstructorOnly,
    automaticOnly,
    weekendSlotsOnly,
    minRating,
    sortBy,
  ]);

  // Vehicle Chip Options with short labels
  const vehicleChips: ChipItem<VehicleType | 'All'>[] = [
    { id: 'All', label: 'All Vehicles' },
    { id: 'car_manual', label: 'Car (Manual)', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'car_automatic', label: 'Automatic', icon: <Car className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'two_wheeler', label: 'Scooter', icon: <Bike className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  // Area Chip Options with short labels
  const areaChips: ChipItem<VadodaraArea | 'All'>[] = VADODARA_AREAS.map((a) => ({
    id: a,
    label: a === 'All' ? 'All Vadodara' : a === 'Waghodia Road' ? 'Waghodia' : a,
  }));

  // Popular schools carousel subset (rating >= 4.8)
  const popularSchools = useMemo(() => {
    return schools.filter((s) => s.rating >= 4.8).slice(0, 4);
  }, [schools]);

  return (
    <div className="min-h-screen pb-28 md:pb-16 bg-slate-50 dark:bg-slate-950">
      {/* Onboarding walkthrough for first-timers */}
      {showOnboarding && (
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      )}

      {/* Hero: Compact, single rounded-bottom section */}
      <section className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 text-white pt-6 pb-8 px-4 rounded-b-[2.5rem] shadow-md shadow-blue-900/10 transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Greeting & Vadodara Label */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                  {greeting}, {user ? user.full_name.split(' ')[0] : 'Learner'} 👋
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold tracking-wide uppercase text-white">
                  Vadodara (Baroda)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Learn to drive at your own pace.
              </h1>
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white transition cursor-pointer min-h-[44px]"
              title="How icandrive works"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>How it works</span>
            </button>
          </div>

          {/* Search Card - Compact and high-clarity */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 shadow-xl border border-white/20 text-slate-800 dark:text-slate-100 space-y-3">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by driving school or area (e.g. Alkapuri, Gotri)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vehicle Mode Single-Line Scrollable Chips */}
            <ScrollableChips
              items={vehicleChips}
              selectedId={selectedVehicleType}
              onSelect={(id) => setSelectedVehicleType(id)}
              size="sm"
            />

            {/* Area Single-Line Scrollable Chips */}
            <ScrollableChips
              items={areaChips}
              selectedId={selectedArea}
              onSelect={(id) => setSelectedArea(id)}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-8">
        {/* Quick Filter & Sort Row */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Female Instructor Toggle */}
            <button
              onClick={() => setFemaleInstructorOnly(!femaleInstructorOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border min-h-[44px] flex items-center gap-1 ${
                femaleInstructorOnly
                  ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-300'
              }`}
            >
              👩 Female
            </button>

            {/* Automatic Transmission */}
            <button
              onClick={() => setAutomaticOnly(!automaticOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border min-h-[44px] flex items-center gap-1 ${
                automaticOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              ⚙️ Auto
            </button>

            {/* Weekend Slots */}
            <button
              onClick={() => setWeekendSlotsOnly(!weekendSlotsOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border min-h-[44px] flex items-center gap-1 ${
                weekendSlotsOnly
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'
              }`}
            >
              📅 Weekend
            </button>

            {/* Rating 4.5+ */}
            <button
              onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border flex items-center gap-1 min-h-[44px] ${
                minRating === 4.5
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.5+</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
              {t('sortBy')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer min-h-[44px]"
            >
              <option value="rating">{t('sortRating')}</option>
              <option value="popular">{t('sortPopular')}</option>
              <option value="priceAsc">{t('sortPriceAsc')}</option>
              <option value="priceDesc">{t('sortPriceDesc')}</option>
            </select>
          </div>
        </div>

        {/* Section 1: Popular Near You Carousel (When All is active and no active search query) */}
        {!searchQuery && selectedArea === 'All' && popularSchools.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Popular Near You in Baroda</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Highest rated driving academies with certified dual-control vehicles
                </p>
              </div>
            </div>

            <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
              {popularSchools.map((school) => {
                const minPrice = Math.round(
                  school.area === 'Makarpura' ? 350 : school.area === 'Alkapuri' ? 395 : 370
                );
                return (
                  <div
                    key={`popular_${school.id}`}
                    className="w-[280px] sm:w-[320px] shrink-0 snap-start flex"
                  >
                    <SchoolCard
                      school={school}
                      minPrice={minPrice}
                      hasFemaleInstructor={true}
                      hasAutomatic={school.facilities.includes('Automatic Cars') || school.facilities.includes('Automatic AMT')}
                      hasTwoWheeler={school.facilities.includes('Two-Wheelers')}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: All Driving Schools Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {selectedArea === 'All'
                  ? 'All Verified Driving Schools'
                  : `Driving Schools in ${selectedArea}`}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {schools.length} verified partner academies available
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : schools.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Car className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No driving schools match your filters
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Try resetting your filters or selecting "All Vadodara" to see schools across the city.
              </p>
              <button
                onClick={() => {
                  setSelectedArea('All');
                  setSelectedVehicleType('All');
                  setFemaleInstructorOnly(false);
                  setAutomaticOnly(false);
                  setWeekendSlotsOnly(false);
                  setMinRating(0);
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer min-h-[44px]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schools.map((school) => {
                const minPrice = Math.round(
                  school.area === 'Makarpura' ? 350 : school.area === 'Alkapuri' ? 395 : 370
                );
                return (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    minPrice={minPrice}
                    hasFemaleInstructor={true}
                    hasAutomatic={
                      school.facilities.includes('Automatic Cars') ||
                      school.facilities.includes('Automatic AMT')
                    }
                    hasTwoWheeler={school.facilities.includes('Two-Wheelers')}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Section 3: Trust Row */}
        <section className="bg-blue-50/70 dark:bg-blue-950/25 rounded-3xl p-5 sm:p-6 border border-blue-100 dark:border-blue-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('trustRow1')}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Government RTO licensed instructors & dual-pedal vehicles.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('trustRow2')}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Real-time slot locking guarantees your instructor is dedicated to you.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('trustRow3')}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Instant UPI payments & 100% full refund if cancelled by academy.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 3-Step How It Works */}
        <section className="space-y-4">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Three simple steps to obtain your driving licence with zero stress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('howItWorksStep1Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorksStep1Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('howItWorksStep2Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorksStep2Desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('howItWorksStep3Title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('howItWorksStep3Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Progress Teaser */}
        <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Vadodara RTO Curriculum</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t('progressTeaserTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('progressTeaserSub')}
            </p>
          </div>

          <Link
            to="/school-detail/school_1_sayaji"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 shrink-0 active:scale-95 min-h-[44px]"
          >
            <span>Start Learning Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
};
