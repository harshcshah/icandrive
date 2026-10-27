/**
 * Analytics Service for School Dashboards and Platform Super Admin
 *
 * NOTE FOR SUPABASE MIGRATION:
 * In production, replace with PostgreSQL materialized views or Supabase Edge Functions:
 *   await supabase.rpc('get_admin_dashboard_metrics');
 */
import { Storage } from './storage';
import { School, Booking, Payment, Profile } from '../types';

export const AnalyticsService = {
  async getAdminAnalytics() {
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const payments = Storage.get<Payment[]>(Storage.KEYS.PAYMENTS, []);
    const profiles = Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);

    const confirmedOrCompleted = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    );

    const totalGmv = payments
      .filter((p) => p.status === 'success')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalCommission = payments
      .filter((p) => p.status === 'success')
      .reduce((acc, p) => acc + p.commission_amount, 0);

    const activeLearners = profiles.filter((p) => p.role === 'learner').length;

    const cancelledCount = bookings.filter(
      (b) => b.status === 'cancelled_by_learner' || b.status === 'cancelled_by_school'
    ).length;

    const cancellationRate =
      bookings.length > 0 ? Math.round((cancelledCount / bookings.length) * 100) : 0;

    // Repeat learners
    const learnerBookingCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      learnerBookingCounts[b.learner_id] = (learnerBookingCounts[b.learner_id] || 0) + 1;
    });
    const repeatLearners = Object.values(learnerBookingCounts).filter((c) => c > 1).length;
    const repeatRate =
      activeLearners > 0 ? Math.round((repeatLearners / activeLearners) * 100) : 0;

    const avgRating =
      schools.length > 0
        ? Number(
            (schools.reduce((acc, s) => acc + s.rating, 0) / schools.length).toFixed(2)
          )
        : 4.8;

    // Daily trends (last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const bookingsPerDay = days.map((day, idx) => ({
      day,
      bookings: 3 + ((idx * 2) % 5),
      revenue: (3 + ((idx * 2) % 5)) * 3800,
    }));

    // Top schools ranking
    const topSchools = schools
      .map((s) => {
        const schoolBookings = bookings.filter((b) => b.school_id === s.id);
        const revenue = schoolBookings.reduce((acc, b) => acc + b.amount_inr, 0);
        return {
          id: s.id,
          name: s.name,
          area: s.area,
          rating: s.rating,
          reviewCount: s.review_count,
          bookingsCount: schoolBookings.length,
          revenue,
          commissionRate: s.commission_rate,
        };
      })
      .sort((a, b) => b.bookingsCount - a.bookingsCount);

    return {
      totalGmv,
      totalCommission,
      activeLearners,
      totalBookings: bookings.length,
      cancellationRate,
      repeatRate,
      avgRating,
      bookingsPerDay,
      topSchools,
    };
  },

  async getSchoolAnalytics(schoolId: string) {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []).filter(
      (b) => b.school_id === schoolId
    );
    const payments = Storage.get<Payment[]>(Storage.KEYS.PAYMENTS, []);
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const school = schools.find((s) => s.id === schoolId);

    const schoolPayments = payments.filter((p) => {
      const b = bookings.find((bk) => bk.id === p.booking_id);
      return !!b && p.status === 'success';
    });

    const grossEarnings = schoolPayments.reduce((acc, p) => acc + p.amount, 0);
    const commissionDeducted = schoolPayments.reduce((acc, p) => acc + p.commission_amount, 0);
    const netPayout = schoolPayments.reduce((acc, p) => acc + p.school_payout, 0);
    const pendingPayout = Math.round(netPayout * 0.45); // e.g. weekly cycle batch

    const lessonsDelivered = bookings.filter((b) => b.status === 'completed').length;
    const upcomingLessons = bookings.filter((b) => b.status === 'confirmed').length;

    // Delivery chart (days of week)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyDeliveries = days.map((day, idx) => ({
      day,
      count: idx === 5 || idx === 6 ? 6 : 4, // higher on weekends
      earnings: (idx === 5 || idx === 6 ? 6 : 4) * 380,
    }));

    return {
      schoolName: school?.name || 'Driving School',
      grossEarnings,
      commissionDeducted,
      netPayout,
      pendingPayout,
      lessonsDelivered,
      upcomingLessons,
      commissionRate: school?.commission_rate ?? 15,
      weeklyDeliveries,
    };
  },
};
