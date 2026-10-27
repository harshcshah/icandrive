import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { BookingService } from '../../services/bookingService';
import { SchoolService } from '../../services/schoolService';
import { AnalyticsService } from '../../services/analyticsService';
import { ReviewService } from '../../services/reviewService';
import {
  Booking,
  School,
  Instructor,
  Vehicle,
  Package,
  AvailabilityRule,
  TimeOff,
  Review,
} from '../../types';
import { BookingStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { VehicleIllustration } from '../../components/illustrations/VehicleIllustration';
import { InstructorAvatar } from '../../components/illustrations/InstructorAvatar';
import { useToast } from '../../components/common/Toast';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Clock,
  Car,
  Users,
  PackageCheck,
  TrendingUp,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  Building2,
  DollarSign,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const SchoolDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const schoolId = user?.school_id || 'school_1_sayaji';

  type DashboardTab =
    | 'today'
    | 'calendar'
    | 'bookings'
    | 'availability'
    | 'instructors'
    | 'vehicles'
    | 'packages'
    | 'earnings'
    | 'reviews'
    | 'profile';

  const [activeTab, setActiveTab] = useState<DashboardTab>('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [school, setSchool] = useState<School | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [timeOffList, setTimeOffList] = useState<TimeOff[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add Item Modals
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstGender, setNewInstGender] = useState<'male' | 'female'>('male');
  const [newInstPhone, setNewInstPhone] = useState('');
  const [newInstExp, setNewInstExp] = useState(5);

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehName, setNewVehName] = useState('');
  const [newVehType, setNewVehType] = useState<any>('car_manual');
  const [newVehReg, setNewVehReg] = useState('GJ-06-');

  const [showAddTimeOffModal, setShowAddTimeOffModal] = useState(false);
  const [newTimeOffDate, setNewTimeOffDate] = useState('');
  const [newTimeOffReason, setNewTimeOffReason] = useState('Personal leave / holiday');
  const [newTimeOffInstId, setNewTimeOffInstId] = useState('');

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      const bundle = await SchoolService.getSchoolById(schoolId);
      if (bundle) {
        setSchool(bundle.school);
        setInstructors(bundle.instructors);
        setVehicles(bundle.vehicles);
        setPackages(bundle.packages);
        setReviews(bundle.reviews);
      }
      const schoolBookings = await BookingService.getSchoolBookings(schoolId);
      setBookings(schoolBookings);

      const rules = await SchoolService.getAvailability(schoolId);
      setAvailability(rules);

      const timeOffs = await SchoolService.getTimeOff(schoolId);
      setTimeOffList(timeOffs);

      const an = await AnalyticsService.getSchoolAnalytics(schoolId);
      setAnalytics(an);
    } catch (e) {
      console.error('Error fetching school dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLessons = bookings.filter((b) => b.starts_at.startsWith(todayStr));

  const handleUpdateStatus = async (bookingId: string, status: 'completed' | 'no_show') => {
    try {
      await BookingService.markLessonStatus(bookingId, status);
      showToast(`Lesson marked as ${status === 'completed' ? 'Completed' : 'No-Show'}`, 'success');
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelBySchool = async (bookingId: string) => {
    const confirm = window.confirm(
      'Are you sure you want to cancel this booking? The learner will receive a 100% FULL REFUND automatically.'
    );
    if (!confirm) return;

    try {
      await BookingService.cancelBooking(
        bookingId,
        'school',
        'Cancelled by Academy due to schedule conflict'
      );
      showToast('Booking cancelled. Full refund issued to learner.', 'info');
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await ReviewService.replyToReview(reviewId, replyText.trim());
      setReplyingReviewId(null);
      setReplyText('');
      showToast('Response posted to student review', 'success');
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;
    await SchoolService.addInstructor({
      school_id: schoolId,
      name: newInstName.trim(),
      gender: newInstGender,
      phone: newInstPhone || '+91 98240 00000',
      experience_years: Number(newInstExp) || 3,
      rating: 4.9,
      photo_url: '',
      languages: ['Gujarati', 'Hindi'],
      is_active: true,
    });
    setShowAddInstructorModal(false);
    setNewInstName('');
    showToast('Instructor added successfully', 'success');
    await refreshAllData();
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehName.trim()) return;
    await SchoolService.addVehicle({
      school_id: schoolId,
      name: newVehName.trim(),
      vehicle_type: newVehType,
      reg_no: newVehReg.trim().toUpperCase(),
      model_year: 2024,
      is_dual_control: newVehType !== 'two_wheeler',
      photo_url: '',
      is_active: true,
    });
    setShowAddVehicleModal(false);
    setNewVehName('');
    showToast('Vehicle added to fleet', 'success');
    await refreshAllData();
  };

  const handleCreateTimeOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeOffDate) return;
    await SchoolService.addTimeOff({
      school_id: schoolId,
      instructor_id: newTimeOffInstId || instructors[0]?.id,
      date: newTimeOffDate,
      reason: newTimeOffReason,
    });
    setShowAddTimeOffModal(false);
    showToast('Time off blocked on schedule', 'success');
    await refreshAllData();
  };

  const navItems = [
    { id: 'today', label: "Today's Lessons", icon: Clock, badge: todayLessons.length },
    { id: 'calendar', label: 'Week Calendar', icon: CalendarDays },
    { id: 'bookings', label: 'All Bookings', icon: CalendarCheck, badge: bookings.length },
    { id: 'availability', label: 'Timetable & Time Off', icon: LayoutDashboard },
    { id: 'instructors', label: 'Instructors', icon: Users, badge: instructors.length },
    { id: 'vehicles', label: 'Vehicles', icon: Car, badge: vehicles.length },
    { id: 'packages', label: 'Packages', icon: PackageCheck },
    { id: 'earnings', label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, badge: reviews.length },
    { id: 'profile', label: 'RTO Profile', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
            {school?.name || 'School Portal'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 md:min-h-[calc(100vh-64px)] z-20`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 hidden md:block">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Building2 className="w-4 h-4" />
            <span>School Partner Portal</span>
          </div>
          <div className="font-black text-slate-900 dark:text-white text-base truncate mt-1">
            {school?.name}
          </div>
          <div className="text-xs text-slate-500">
            {school?.area}, Vadodara • Commission: {school?.commission_rate}%
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as DashboardTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected
                        ? 'bg-white text-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl overflow-x-hidden space-y-6">
        {/* TAB 1: TODAY'S LESSONS */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                Today's Driving Lessons
              </h1>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Quick Stat Cards with Soft Tint */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                  Scheduled Today
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {todayLessons.length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                  Completed
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {todayLessons.filter((b) => b.status === 'completed').length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                  Confirmed
                </div>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {todayLessons.filter((b) => b.status === 'confirmed').length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                  No-Show
                </div>
                <div className="text-2xl font-black text-rose-500 mt-1">
                  {todayLessons.filter((b) => b.status === 'no_show').length}
                </div>
              </div>
            </div>

            {/* Today List */}
            {todayLessons.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  No lessons scheduled for today
                </h3>
                <p className="text-xs text-slate-500">
                  Upcoming bookings for this week appear in the Week Calendar tab.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayLessons.map((b) => {
                  const inst = instructors.find((i) => i.id === b.instructor_id);
                  const veh = vehicles.find((v) => v.id === b.vehicle_id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {new Date(b.starts_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(b.ends_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <BookingStatusBadge status={b.status} />
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                          Learner: {b.learner_name || 'Learner'} • +91 {b.learner_phone}
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                          <span>Instructor: {inst?.name}</span>
                          <span>Vehicle: {veh?.name}</span>
                          {b.pickup_from_home && (
                            <span className="text-emerald-600 font-bold">
                              Pickup: {b.pickup_address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons with 44px min-height */}
                      {b.status === 'confirmed' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer min-h-[44px]"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'no_show')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer min-h-[44px]"
                          >
                            Mark No-Show
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEEK CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Weekly Timetable & Schedule
            </h1>
            <p className="text-xs text-slate-500">
              Overview of all instructor slots and vehicle dispatches across the week.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
                const dayBookings = bookings.filter((b) => {
                  const d = new Date(b.starts_at).getDay();
                  return d === idx && b.status !== 'cancelled_by_learner' && b.status !== 'cancelled_by_school';
                });

                return (
                  <div
                    key={dayName}
                    className="bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-[160px] flex flex-col"
                  >
                    <div className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                      <span>{dayName}</span>
                      <span className="text-[10px] text-blue-600 font-black">
                        {dayBookings.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 flex-1">
                      {dayBookings.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic">No bookings</div>
                      ) : (
                        dayBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[10px] border border-blue-200 dark:border-blue-900/60"
                          >
                            <div className="font-bold text-blue-700 dark:text-blue-300">
                              {new Date(b.starts_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="truncate text-slate-700 dark:text-slate-300 font-medium">
                              {b.learner_name || 'Learner'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ALL BOOKINGS (Responsive Table / Mobile Cards) */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              All Academy Bookings ({bookings.length})
            </h1>

            {/* Desktop Table */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Learner</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-blue-600">{b.booking_code}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {b.learner_name || 'Learner'}
                        </div>
                        <div className="text-[11px] text-slate-500">+91 {b.learner_phone}</div>
                      </td>
                      <td className="p-4">
                        {new Date(b.starts_at).toLocaleDateString()} •{' '}
                        {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-black">₹{b.amount_inr}</td>
                      <td className="p-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="p-4 text-right">
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBySchool(b.id)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer min-h-[44px]"
                          >
                            Cancel (Full Refund)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">{b.booking_code}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {b.learner_name} (+91 {b.learner_phone})
                  </div>
                  <div className="text-slate-500">
                    {new Date(b.starts_at).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-black text-sm">₹{b.amount_inr}</span>
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBySchool(b.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-bold min-h-[44px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INSTRUCTORS (With Monogram Avatars) */}
        {activeTab === 'instructors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Instructors ({instructors.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Certified patient male and female driving instructors.
                </p>
              </div>

              <button
                onClick={() => setShowAddInstructorModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Instructor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4"
                >
                  <InstructorAvatar name={inst.name} gender={inst.gender} size="lg" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {inst.name}
                      </h3>
                      <span className="text-xs font-bold text-amber-500">★ {inst.rating}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {inst.experience_years} years exp • {inst.gender === 'female' ? 'Female' : 'Male'}
                    </div>
                    <div className="text-xs text-slate-500">Phone: {inst.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VEHICLES (With Illustrated Cards) */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Vehicle Fleet ({vehicles.length})
                </h1>
                <p className="text-xs text-slate-500">
                  Dual-pedal manual cars, automatic cars, and two-wheelers.
                </p>
              </div>

              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4"
                >
                  <div className="w-24 shrink-0">
                    <VehicleIllustration
                      type={veh.vehicle_type}
                      name={veh.name}
                      size="sm"
                      isDualControl={veh.is_dual_control}
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {veh.name}
                    </h3>
                    <div className="text-xs font-mono font-bold text-blue-600">
                      {veh.reg_no}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {veh.is_dual_control ? 'Dual-Control Certified' : 'Safety Guard'} • {veh.model_year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EARNINGS & PAYOUTS */}
        {activeTab === 'earnings' && analytics && (
          <div className="space-y-6">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Revenue & Payouts
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('grossEarnings')}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  ₹{analytics.grossEarnings.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Commission ({analytics.commissionRate}%)</div>
                <div className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">
                  ₹{analytics.commissionDeducted.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('netPayout')}</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  ₹{analytics.netPayout.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('pendingPayout')}</div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  ₹{analytics.pendingPayout.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Weekly Delivery Activity Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Deliveries Activity
              </h3>
              <div className="flex items-end gap-3 h-44 pt-6">
                {analytics.weeklyDeliveries.map((item: any) => {
                  const barHeight = Math.max(20, item.count * 18);
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-[11px] font-bold text-blue-600">{item.count}</div>
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Student Reviews ({reviews.length})
            </h1>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.learner_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-amber-500 font-bold text-xs">★ {rev.rating}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">"{rev.comment}"</p>

                  {rev.school_reply ? (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-l-3 border-blue-600 text-xs">
                      <span className="font-bold text-blue-600">Your Response: </span>
                      <span className="text-slate-700 dark:text-slate-300">{rev.school_reply}</span>
                    </div>
                  ) : replyingReviewId === rev.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a polite response to the student..."
                        className="w-full p-3 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 min-h-[44px]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3.5 py-2 text-xs font-bold min-h-[44px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs min-h-[44px]"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingReviewId(rev.id);
                        setReplyText('');
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer min-h-[44px] flex items-center"
                    >
                      Reply to this review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AVAILABILITY & TIMETABLE */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Instructor Timetable & Time Off
                </h1>
                <p className="text-xs text-slate-500">
                  Block instructor leave or holidays to prevent double-booking.
                </p>
              </div>

              <button
                onClick={() => setShowAddTimeOffModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Block Time Off</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Blocked Dates / Leave ({timeOffList.length})
              </h3>
              {timeOffList.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No time-off blocked.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {timeOffList.map((tOff) => {
                    const inst = instructors.find((i) => i.id === tOff.instructor_id);
                    return (
                      <div key={tOff.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {new Date(tOff.date).toLocaleDateString()}
                          </span>{' '}
                          • <span className="text-slate-700 dark:text-slate-300 font-semibold">{inst?.name}</span> ({tOff.reason})
                        </div>
                        <button
                          onClick={() => SchoolService.deleteTimeOff(tOff.id).then(refreshAllData)}
                          className="text-red-500 hover:text-red-700 font-bold cursor-pointer min-h-[44px] flex items-center"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Course Packages
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      {pkg.vehicle_type}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{pkg.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      ₹{pkg.price_inr}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {pkg.lesson_count} lessons
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: RTO PROFILE */}
        {activeTab === 'profile' && school && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              RTO Licensing & Academy Profile
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <span className="text-slate-500 font-bold uppercase">RTO License Number</span>
                <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  {school.rto_license_no}
                </div>
                <div className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified by Vadodara RTO Authority
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <span className="text-slate-500 font-bold uppercase">Academy Address</span>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {school.address}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                RTO Motor Driving School Certificate (Form 11)
              </div>
              <p className="text-xs text-slate-500">
                Uploaded and validated by Vadodara Regional Transport Office.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Add Instructor Modal */}
      {showAddInstructorModal && (
        <Modal
          isOpen={showAddInstructorModal}
          onClose={() => setShowAddInstructorModal(false)}
          title="Add Certified Instructor"
        >
          <form onSubmit={handleCreateInstructor} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                required
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={newInstGender}
                onChange={(e) => setNewInstGender(e.target.value as any)}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              >
                <option value="male">Male Instructor</option>
                <option value="female">Female Instructor</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                value={newInstExp}
                onChange={(e) => setNewInstExp(Number(e.target.value))}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddInstructorModal(false)}
                className="px-4 py-2.5 rounded-xl border min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold min-h-[44px]"
              >
                Save Instructor
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <Modal
          isOpen={showAddVehicleModal}
          onClose={() => setShowAddVehicleModal(false)}
          title="Add Vehicle to Fleet"
        >
          <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Name / Model
              </label>
              <input
                type="text"
                required
                value={newVehName}
                onChange={(e) => setNewVehName(e.target.value)}
                placeholder="e.g. Maruti Dzire Dual-Control"
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Type
              </label>
              <select
                value={newVehType}
                onChange={(e) => setNewVehType(e.target.value)}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              >
                <option value="car_manual">Car (Manual Dual-Control)</option>
                <option value="car_automatic">Car (Automatic AMT/CVT)</option>
                <option value="two_wheeler">Two-Wheeler (Scooter)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                RTO Registration Number
              </label>
              <input
                type="text"
                required
                value={newVehReg}
                onChange={(e) => setNewVehReg(e.target.value)}
                placeholder="GJ-06-XX-XXXX"
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 uppercase min-h-[44px]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="px-4 py-2.5 rounded-xl border min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold min-h-[44px]"
              >
                Add Vehicle
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Time Off Modal */}
      {showAddTimeOffModal && (
        <Modal
          isOpen={showAddTimeOffModal}
          onClose={() => setShowAddTimeOffModal(false)}
          title="Block Time Off / Holiday"
        >
          <form onSubmit={handleCreateTimeOff} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Instructor
              </label>
              <select
                value={newTimeOffInstId}
                onChange={(e) => setNewTimeOffInstId(e.target.value)}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              >
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={newTimeOffDate}
                onChange={(e) => setNewTimeOffDate(e.target.value)}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={newTimeOffReason}
                onChange={(e) => setNewTimeOffReason(e.target.value)}
                placeholder="e.g. Festival holiday, RTO maintenance"
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 min-h-[44px]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTimeOffModal(false)}
                className="px-4 py-2.5 rounded-xl border min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold min-h-[44px]"
              >
                Block Date
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
