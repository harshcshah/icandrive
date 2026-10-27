import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { SchoolService } from '../../services/schoolService';
import { BookingService } from '../../services/bookingService';
import { AnalyticsService } from '../../services/analyticsService';
import { ReviewService } from '../../services/reviewService';
import { AuthService } from '../../services/authService';
import { School, Booking, Review, Profile } from '../../types';
import { BookingStatusBadge, VerifiedBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { InstructorAvatar } from '../../components/illustrations/InstructorAvatar';
import { useToast } from '../../components/common/Toast';
import {
  ShieldCheck,
  Building2,
  CalendarCheck,
  TrendingUp,
  Percent,
  RotateCcw,
  Flag,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Menu,
  X,
  Plus,
  Star,
  MapPin,
  Calendar,
  Clock,
  Car,
  Filter,
  Check,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  type AdminTab =
    | 'analytics'
    | 'approvals'
    | 'bookings'
    | 'refunds'
    | 'commission'
    | 'reviews'
    | 'users';

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [schoolSearch, setSchoolSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Commission Edit Modal
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(15);

  // New School Modal
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolArea, setNewSchoolArea] = useState<any>('Alkapuri');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('+91 98250 11223');
  const [newSchoolRto, setNewSchoolRto] = useState('GJ-06-RTO-MDS-2026-');

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const allSchools = await SchoolService.getAllSchoolsForAdmin();
      setSchools(allSchools);

      const allBookings = await BookingService.getAllBookings();
      setBookings(allBookings);

      const allReviews = await ReviewService.getAllReviewsForAdmin();
      setReviews(allReviews);

      const allProfiles = await AuthService.getAllProfiles();
      setProfiles(allProfiles);

      const an = await AnalyticsService.getAdminAnalytics();
      setAnalytics(an);
    } catch (e) {
      console.error(e);
      showToast('Could not load admin operational data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle Approve / Reject School
  const handleApproveSchool = async (school: School) => {
    try {
      await SchoolService.updateSchool(school.id, { status: 'approved', verified: true });
      showToast(`Approved ${school.name} and verified RTO credentials`, 'success');
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to approve school', 'error');
    }
  };

  const handleRejectSchool = async (school: School) => {
    try {
      await SchoolService.updateSchool(school.id, { status: 'rejected', is_active: false });
      showToast(`Rejected partner application for ${school.name}`, 'info');
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to update school status', 'error');
    }
  };

  // Handle Process Refund
  const handleProcessRefund = async (booking: Booking) => {
    try {
      await BookingService.processRefundStatus(booking.id);
      showToast(`Refund of ₹${booking.refund_amount_inr} processed successfully via UPI`, 'success');
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to process refund', 'error');
    }
  };

  // Handle Commission Update
  const handleSaveCommission = async () => {
    if (!editingSchool) return;
    try {
      await SchoolService.updateSchool(editingSchool.id, {
        commission_rate: Number(newCommissionRate),
      });
      showToast(`Commission rate for ${editingSchool.name} set to ${newCommissionRate}%`, 'success');
      setEditingSchool(null);
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to save commission rate', 'error');
    }
  };

  // Handle Flag Review
  const handleFlagReview = async (reviewId: string) => {
    try {
      await ReviewService.flagReview(reviewId, 'Flagged by Platform Admin for audit');
      showToast('Review flagged for content audit', 'info');
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to flag review', 'error');
    }
  };

  // Add new school partner
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    try {
      await SchoolService.addSchool({
        name: newSchoolName.trim(),
        slug: newSchoolName.toLowerCase().replace(/\s+/g, '-'),
        area: newSchoolArea,
        address: newSchoolAddress || `${newSchoolArea}, Vadodara`,
        phone: newSchoolPhone,
        email: 'contact@school.in',
        rto_license_no: newSchoolRto.trim().toUpperCase(),
        verified: true,
        status: 'approved',
        rating: 4.8,
        review_count: 12,
        commission_rate: 15,
        photos: [], // Vector illustrations used throughout app
        description: 'Certified driving academy in Vadodara offering structured driver education.',
        facilities: ['Dual-Control Cars', 'Female Instructors', 'Doorstep Pickup'],
        is_active: true,
      });

      showToast(`Partner school ${newSchoolName} successfully onboarded`, 'success');
      setShowAddSchoolModal(false);
      setNewSchoolName('');
      await fetchAdminData();
    } catch (err) {
      showToast('Failed to add school partner', 'error');
    }
  };

  const pendingRefunds = useMemo(
    () => bookings.filter((b) => b.refund_status === 'pending'),
    [bookings]
  );

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const q = schoolSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q);
    });
  }, [schools, schoolSearch]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        bookingSearch === '' ||
        b.booking_code.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.learner_name && b.learner_name.toLowerCase().includes(bookingSearch.toLowerCase())) ||
        (b.learner_phone && b.learner_phone.includes(bookingSearch));
      const matchStatus =
        bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch =
        userSearch === '' ||
        p.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        p.phone.includes(userSearch);
      const matchRole = userRoleFilter === 'all' || p.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [profiles, userSearch, userRoleFilter]);

  const navItems = [
    { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
    {
      id: 'approvals',
      label: 'School Approvals',
      icon: Building2,
      badge: schools.filter((s) => s.status === 'pending_approval').length,
    },
    { id: 'bookings', label: 'All Bookings', icon: CalendarCheck, badge: bookings.length },
    { id: 'refunds', label: 'Refunds Queue', icon: RotateCcw, badge: pendingRefunds.length },
    { id: 'commission', label: 'Commission Settings', icon: Percent },
    { id: 'reviews', label: 'Review Moderation', icon: Flag },
    { id: 'users', label: 'Manage Users', icon: Users, badge: profiles.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Mobile Top Sub-Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
              Marketplace Operations
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Vadodara Central Admin</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 md:min-h-[calc(100vh-64px)] z-20`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 hidden md:block">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Marketplace Admin</span>
          </div>
          <div className="font-black text-slate-900 dark:text-white text-base mt-1 tracking-tight">
            Vadodara Central Operations
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            8 Partner Schools • 15% Platform Take
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected
                        ? 'bg-white text-blue-600'
                        : item.id === 'refunds'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

      {/* Main Panel Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl overflow-x-hidden space-y-6">
        {/* Loading Indicator */}
        {loading && !analytics && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading marketplace state...</p>
          </div>
        )}

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Vadodara Marketplace Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real-time marketplace health, gross merchandise value, UPI payouts, and partner ratings.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('totalPlatformGmv')}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  ₹{analytics.totalGmv.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  100% via UPI Gateway
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('totalCommissionEarned')}
                </div>
                <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  ₹{analytics.totalCommission.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Avg 15% marketplace take</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Cancellation Rate
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
                  {analytics.cancellationRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Low friction & refunds</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('averageRatingBaroda')}
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{analytics.avgRating}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">High learner satisfaction</div>
              </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Daily Booking Volume Trend (Vadodara)
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Last 7 Days</span>
              </div>

              <div className="flex items-end gap-2 sm:gap-4 h-48 pt-6">
                {analytics.bookingsPerDay.map((item: any) => {
                  const barHeight = Math.max(30, item.bookings * 22);
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                        {item.bookings}
                      </div>
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 rounded-xl transition-all shadow-xs"
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Schools Table / Mobile Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Top Driving Schools by Demand
                </h3>
                <span className="text-xs text-slate-500">{analytics.topSchools.length} academies</span>
              </div>

              {/* Mobile Cards (< md) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.topSchools.map((s: any, idx: number) => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500">{s.area}, Vadodara</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{s.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Bookings
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                          {s.bookingsCount}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Revenue
                        </div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          ₹{s.revenue}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Take</div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                          {s.commissionRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Rank & Academy</th>
                      <th className="p-4">Area</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Gross Revenue</th>
                      <th className="p-4">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.topSchools.map((s: any, idx: number) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{s.area}</td>
                        <td className="p-4 font-bold text-amber-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {s.rating}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {s.bookingsCount}
                        </td>
                        <td className="p-4 font-black text-blue-600 dark:text-blue-400">
                          ₹{s.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                          {s.commissionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOL APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Driving School Partners ({schools.length})
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  RTO licence validation, verification badges, and partner academy onboarding.
                </p>
              </div>

              <button
                onClick={() => setShowAddSchoolModal(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard School Partner</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="Search academy by name or Vadodara area..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {school.name}
                      </h3>
                      {school.verified && <VerifiedBadge size="sm" />}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {school.area}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      RTO Licence: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{school.rto_license_no}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Contact: {school.phone} • {school.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0">
                    <button
                      onClick={() => {
                        setEditingSchool(school);
                        setNewCommissionRate(school.commission_rate);
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer active:scale-95 transition"
                    >
                      Commission: {school.commission_rate}%
                    </button>

                    {school.status === 'pending_approval' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveSchool(school)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
                        >
                          Approve Partner
                        </button>
                        <button
                          onClick={() => handleRejectSchool(school)}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 cursor-pointer active:scale-95 transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Verified & Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ALL PLATFORM BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                All Marketplace Bookings ({bookings.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Complete audit trail of driving lessons across Vadodara driving schools.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by booking code, learner name, or phone..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'confirmed', 'pending_payment', 'completed', 'cancelled_by_learner'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer capitalize ${
                        bookingStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'All Status' : st.replace(/_/g, ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Mobile Cards (< md) */}
            <div className="md:hidden space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  No bookings found matching filter criteria.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                        {b.booking_code}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {b.learner_name || 'Learner'}
                      </div>
                      <div className="text-xs text-slate-500">{b.learner_phone}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
                      <div className="text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(b.starts_at).toLocaleDateString()} •{' '}
                        {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        ₹{b.amount_inr}
                      </div>
                    </div>

                    {b.pickup_from_home && (
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span>Doorstep Pickup Requested</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Booking Code</th>
                      <th className="p-4">Learner</th>
                      <th className="p-4">Scheduled Slot</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Pickup</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {b.booking_code}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{b.learner_name || 'Learner'}</div>
                          <div className="text-[11px] text-slate-500">{b.learner_phone}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                          {new Date(b.starts_at).toLocaleDateString()} •{' '}
                          {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 font-black text-slate-900 dark:text-white">
                          ₹{b.amount_inr}
                        </td>
                        <td className="p-4">
                          <BookingStatusBadge status={b.status} />
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {b.pickup_from_home ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">Doorstep Yes</span>
                          ) : (
                            'Academy'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REFUNDS QUEUE */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('refundsQueue')} ({pendingRefunds.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Cancelled lesson sessions requiring UPI settlement back to the student.
              </p>
            </div>

            {pendingRefunds.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  All refunds are fully settled
                </h3>
                <p className="text-xs text-slate-500">No pending student refunds in the marketplace queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRefunds.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {b.booking_code}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Learner: {b.learner_name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Refund Due: <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">₹{b.refund_amount_inr}</strong> • Policy: {b.cancellation_reason || 'Cancelled'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleProcessRefund(b)}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t('processRefund')} (UPI)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COMMISSION SETTINGS */}
        {activeTab === 'commission' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('commissionSettings')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Default marketplace commission is 15%. You can customize rates per driving academy partner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {school.name}
                    </h3>
                    <div className="text-xs text-slate-500">{school.area}, Vadodara</div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingSchool(school);
                      setNewCommissionRate(school.commission_rate);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer active:scale-95 transition"
                  >
                    {school.commission_rate}% Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Review Moderation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Monitor student feedback and flag fraudulent or abusive reviews.
              </p>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 transition ${
                    rev.is_flagged
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {rev.learner_name}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>

                    {!rev.is_flagged ? (
                      <button
                        onClick={() => handleFlagReview(rev.id)}
                        className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer active:scale-95 transition"
                      >
                        Flag Review
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50">
                        Flagged for Audit
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registered Platform Users ({profiles.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Students, partner school administrators, and central platform operators.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by full name or phone number..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'learner', 'school_admin', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer capitalize ${
                      userRoleFilter === r
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r === 'all' ? 'All Roles' : r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Cards (< md) */}
            <div className="md:hidden space-y-3">
              {filteredProfiles.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <InstructorAvatar name={p.full_name} size="sm" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.full_name}
                        </div>
                        <div className="text-xs text-slate-500">{p.phone}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {p.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>Language: <span className="uppercase font-bold text-slate-700 dark:text-slate-300">{p.language_pref}</span></div>
                    <div>LLR: <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{p.learner_license_no || '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Learner License No.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <InstructorAvatar name={p.full_name} size="sm" />
                          <span className="font-bold text-slate-900 dark:text-white">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{p.phone}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {p.role}
                        </span>
                      </td>
                      <td className="p-4 uppercase font-bold text-slate-700 dark:text-slate-300">{p.language_pref}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {p.learner_license_no || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Commission Modal */}
      {editingSchool && (
        <Modal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          title={`Edit Commission for ${editingSchool.name}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Platform Commission Percentage (%)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={newCommissionRate}
                onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Currently {editingSchool.commission_rate}%. Deducted automatically upon booking confirmation.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setEditingSchool(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCommission}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer active:scale-95 transition"
              >
                Update Rate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add School Modal */}
      {showAddSchoolModal && (
        <Modal
          isOpen={showAddSchoolModal}
          onClose={() => setShowAddSchoolModal(false)}
          title="Onboard Driving School"
        >
          <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                School Name
              </label>
              <input
                type="text"
                required
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="e.g. Sayaji Motor Academy"
                className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Vadodara Area
              </label>
              <select
                value={newSchoolArea}
                onChange={(e) => setNewSchoolArea(e.target.value)}
                className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {['Alkapuri', 'Manjalpur', 'Gotri', 'Karelibaug', 'Makarpura', 'Waghodia Road', 'Akota', 'Fatehgunj'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                RTO Licence Number
              </label>
              <input
                type="text"
                required
                value={newSchoolRto}
                onChange={(e) => setNewSchoolRto(e.target.value)}
                className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-bold"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer active:scale-95 transition"
              >
                Approve & Add Partner
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
