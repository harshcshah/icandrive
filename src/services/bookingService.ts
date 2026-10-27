/**
 * Booking, Slot Generation, Hold Timers, and Payment Service
 *
 * NOTE FOR SUPABASE & RAZORPAY MIGRATION:
 * 1. Slot booking exclusion constraint:
 *    CREATE EXTENSION btree_gist;
 *    ALTER TABLE bookings ADD CONSTRAINT no_overlapping_instructor
 *    EXCLUDE USING gist (instructor_id WITH =, tsrange(starts_at, ends_at) WITH &&)
 *    WHERE (status IN ('pending_payment', 'confirmed'));
 * 2. Razorpay payment integration:
 *    const order = await razorpay.orders.create({ amount: amountInr * 100, currency: 'INR' });
 */
import { Storage } from './storage';
import {
  Booking,
  Payment,
  TimeSlot,
  School,
  Instructor,
  Vehicle,
  Package,
  AvailabilityRule,
  TimeOff,
  NotificationItem,
} from '../types';

export const BookingService = {
  /**
   * Release any held slots where 10-minute hold countdown has expired
   */
  async releaseExpiredHolds(): Promise<number> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const now = new Date().getTime();
    let releasedCount = 0;

    const updated = bookings.map((b) => {
      if (b.status === 'pending_payment' && b.hold_expires_at) {
        const holdTime = new Date(b.hold_expires_at).getTime();
        if (holdTime < now) {
          releasedCount++;
          return {
            ...b,
            status: 'cancelled_by_learner' as const,
            cancellation_reason: '10-minute payment hold expired',
            cancelled_at: new Date().toISOString(),
          };
        }
      }
      return b;
    });

    if (releasedCount > 0) {
      Storage.set(Storage.KEYS.BOOKINGS, updated);
    }
    return releasedCount;
  },

  /**
   * Generate available slots for a school and package on a given date (YYYY-MM-DD).
   * Enforces exclusion: instructor or vehicle cannot have overlapping bookings.
   */
  async getSlotsForDate(schoolId: string, packageId: string, dateStr: string): Promise<TimeSlot[]> {
    await this.releaseExpiredHolds();

    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []);
    const selectedPackage = packages.find((p) => p.id === packageId);
    if (!selectedPackage) return [];

    const instructors = Storage.get<Instructor[]>(Storage.KEYS.INSTRUCTORS, []).filter(
      (i) => i.school_id === schoolId && i.is_active
    );
    const vehicles = Storage.get<Vehicle[]>(Storage.KEYS.VEHICLES, []).filter(
      (v) => v.school_id === schoolId && v.is_active && v.vehicle_type === selectedPackage.vehicle_type
    );

    if (instructors.length === 0 || vehicles.length === 0) return [];

    const rules = Storage.get<AvailabilityRule[]>(Storage.KEYS.AVAILABILITY, []);
    const timeOffList = Storage.get<TimeOff[]>(Storage.KEYS.TIMEOFF, []);
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);

    // Target date day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Create date with local timezone consideration
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const weekday = targetDate.getDay();

    const activeBookings = bookings.filter(
      (b) =>
        b.school_id === schoolId &&
        b.status !== 'cancelled_by_learner' &&
        b.status !== 'cancelled_by_school' &&
        b.starts_at.startsWith(dateStr)
    );

    const activeTimeOff = timeOffList.filter(
      (t) => t.school_id === schoolId && t.date === dateStr
    );

    const generatedSlots: TimeSlot[] = [];
    const slotDuration = selectedPackage.duration_minutes || 45;

    // Iterate over available instructors
    for (const inst of instructors) {
      const instRules = rules.filter(
        (r) => r.school_id === schoolId && r.instructor_id === inst.id && r.weekday === weekday
      );

      for (const rule of instRules) {
        const [startH, startM] = rule.start_time.split(':').map(Number);
        const [endH, endM] = rule.end_time.split(':').map(Number);

        const ruleStartMinutes = startH * 60 + startM;
        const ruleEndMinutes = endH * 60 + endM;

        for (
          let curMin = ruleStartMinutes;
          curMin + slotDuration <= ruleEndMinutes;
          curMin += slotDuration + 15 // 15 min buffer between lessons
        ) {
          const sH = Math.floor(curMin / 60);
          const sM = curMin % 60;
          const eMin = curMin + slotDuration;
          const eH = Math.floor(eMin / 60);
          const eM = eMin % 60;

          const pad = (n: number) => String(n).padStart(2, '0');
          const startIso = `${dateStr}T${pad(sH)}:${pad(sM)}:00+05:30`;
          const endIso = `${dateStr}T${pad(eH)}:${pad(eM)}:00+05:30`;

          // Format display time
          const format12H = (h: number, m: number) => {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hh = h % 12 === 0 ? 12 : h % 12;
            return `${hh}:${pad(m)} ${ampm}`;
          };
          const display_time = `${format12H(sH, sM)} - ${format12H(eH, eM)}`;

          // Check time-off conflicts for instructor
          const instTimeOff = activeTimeOff.find((t) => t.instructor_id === inst.id);
          let isTimeOffBlocked = false;
          if (instTimeOff) {
            if (!instTimeOff.start_time && !instTimeOff.end_time) {
              isTimeOffBlocked = true;
            } else if (instTimeOff.start_time && instTimeOff.end_time) {
              const [toSh, toSm] = instTimeOff.start_time.split(':').map(Number);
              const [toEh, toEm] = instTimeOff.end_time.split(':').map(Number);
              const toStart = toSh * 60 + toSm;
              const toEnd = toEh * 60 + toEm;
              if (curMin < toEnd && eMin > toStart) {
                isTimeOffBlocked = true;
              }
            }
          }

          // Check overlapping booking for this instructor
          const instBookingCollision = activeBookings.some((b) => {
            if (b.instructor_id !== inst.id) return false;
            const bStart = new Date(b.starts_at).getTime();
            const bEnd = new Date(b.ends_at).getTime();
            const slotStart = new Date(startIso).getTime();
            const slotEnd = new Date(endIso).getTime();
            return slotStart < bEnd && slotEnd > bStart;
          });

          // Check if any matching vehicle is available
          const freeVehicle = vehicles.find((v) => {
            const vehCollision = activeBookings.some((b) => {
              if (b.vehicle_id !== v.id) return false;
              const bStart = new Date(b.starts_at).getTime();
              const bEnd = new Date(b.ends_at).getTime();
              const slotStart = new Date(startIso).getTime();
              const slotEnd = new Date(endIso).getTime();
              return slotStart < bEnd && slotEnd > bStart;
            });
            return !vehCollision;
          });

          const isAvailable = !isTimeOffBlocked && !instBookingCollision && !!freeVehicle;
          let conflictReason: string | undefined = undefined;
          if (isTimeOffBlocked) conflictReason = 'Instructor on Leave';
          else if (instBookingCollision) conflictReason = 'Slot Booked';
          else if (!freeVehicle) conflictReason = 'Vehicle Occupied';

          // Prevent exact duplicate slots in output
          const alreadyExists = generatedSlots.some(
            (s) => s.starts_at === startIso && s.instructor_id === inst.id
          );
          if (!alreadyExists) {
            generatedSlots.push({
              starts_at: startIso,
              ends_at: endIso,
              display_time,
              available: isAvailable,
              instructor_id: inst.id,
              instructor_name: inst.name,
              vehicle_id: freeVehicle ? freeVehicle.id : vehicles[0].id,
              vehicle_name: freeVehicle ? freeVehicle.name : vehicles[0].name,
              conflict_reason: conflictReason,
            });
          }
        }
      }
    }

    // Sort chronologically by starts_at
    return generatedSlots.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
  },

  /**
   * Create a booking hold (pending_payment) with 10-minute hold window
   */
  async createHoldBooking(params: {
    schoolId: string;
    instructorId: string;
    vehicleId: string;
    packageId: string;
    learnerId: string;
    learnerName: string;
    learnerPhone: string;
    startsAt: string;
    endsAt: string;
    pickupFromHome: boolean;
    pickupAddress?: string;
  }): Promise<Booking> {
    await this.releaseExpiredHolds();

    const packages = Storage.get<Package[]>(Storage.KEYS.PACKAGES, []);
    const pkg = packages.find((p) => p.id === params.packageId);
    if (!pkg) throw new Error('Package not found');

    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);

    // Re-verify no overlap right before hold
    const collision = bookings.find((b) => {
      if (
        b.status === 'cancelled_by_learner' ||
        b.status === 'cancelled_by_school'
      )
        return false;
      const bStart = new Date(b.starts_at).getTime();
      const bEnd = new Date(b.ends_at).getTime();
      const slotStart = new Date(params.startsAt).getTime();
      const slotEnd = new Date(params.endsAt).getTime();
      const overlaps = slotStart < bEnd && slotEnd > bStart;
      return overlaps && (b.instructor_id === params.instructorId || b.vehicle_id === params.vehicleId);
    });

    if (collision) {
      throw new Error('This time slot was just booked by another student. Please select another slot.');
    }

    // Hold expires in 10 minutes
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const codeNumber = Math.floor(1000 + Math.random() * 9000);

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      booking_code: `ICD-2026-${codeNumber}`,
      school_id: params.schoolId,
      instructor_id: params.instructorId,
      vehicle_id: params.vehicleId,
      package_id: params.packageId,
      learner_id: params.learnerId,
      learner_name: params.learnerName,
      learner_phone: params.learnerPhone,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
      status: 'pending_payment',
      hold_expires_at: holdExpiresAt,
      amount_inr: Math.round(pkg.price_inr / pkg.lesson_count),
      pickup_from_home: params.pickupFromHome,
      pickup_address: params.pickupAddress,
      created_at: new Date().toISOString(),
    };

    bookings.push(newBooking);
    Storage.set(Storage.KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  /**
   * Confirm booking payment via UPI
   * In future: Razorpay Webhook updates this status
   */
  async confirmBookingPayment(
    bookingId: string,
    upiId: string,
    simulateFailure = false
  ): Promise<{ success: boolean; booking: Booking; payment?: Payment; error?: string }> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    const booking = bookings[idx];

    // If hold expired
    if (booking.hold_expires_at && new Date(booking.hold_expires_at).getTime() < Date.now()) {
      booking.status = 'cancelled_by_learner';
      booking.cancellation_reason = 'Payment hold expired';
      bookings[idx] = booking;
      Storage.set(Storage.KEYS.BOOKINGS, bookings);
      return { success: false, booking, error: 'Payment hold expired. Please select the slot again.' };
    }

    if (simulateFailure) {
      // Record failed payment
      const payments = Storage.get<Payment[]>(Storage.KEYS.PAYMENTS, []);
      const failedPayment: Payment = {
        id: `pay_${Date.now()}`,
        booking_id: bookingId,
        amount: booking.amount_inr,
        commission_amount: 0,
        school_payout: 0,
        payment_method: 'upi',
        upi_id: upiId,
        transaction_ref: `FAIL-${Date.now().toString().slice(-6)}`,
        status: 'failed',
        created_at: new Date().toISOString(),
      };
      payments.push(failedPayment);
      Storage.set(Storage.KEYS.PAYMENTS, payments);
      return { success: false, booking, payment: failedPayment, error: 'UPI payment declined by issuing bank.' };
    }

    // Determine school commission rate
    const schools = Storage.get<School[]>(Storage.KEYS.SCHOOLS, []);
    const school = schools.find((s) => s.id === booking.school_id);
    const commRate = school?.commission_rate ?? 15;
    const commissionAmount = Math.round((booking.amount_inr * commRate) / 100);
    const schoolPayout = booking.amount_inr - commissionAmount;

    // Successful payment
    const payments = Storage.get<Payment[]>(Storage.KEYS.PAYMENTS, []);
    const successPayment: Payment = {
      id: `pay_${Date.now()}`,
      booking_id: bookingId,
      amount: booking.amount_inr,
      commission_amount: commissionAmount,
      school_payout: schoolPayout,
      payment_method: 'upi',
      upi_id: upiId,
      transaction_ref: `UPI-BRD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'success',
      created_at: new Date().toISOString(),
    };
    payments.push(successPayment);
    Storage.set(Storage.KEYS.PAYMENTS, payments);

    booking.status = 'confirmed';
    booking.hold_expires_at = undefined;
    bookings[idx] = booking;
    Storage.set(Storage.KEYS.BOOKINGS, bookings);

    // Create notifications for learner and school admin
    const notifications = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    notifications.unshift({
      id: `notif_${Date.now()}_1`,
      user_id: booking.learner_id,
      title: 'Booking Confirmed!',
      message: `Your lesson is confirmed with ${school?.name || 'driving school'} for ${new Date(booking.starts_at).toLocaleDateString()}. Booking ID: ${booking.booking_code}.`,
      type: 'booking',
      read: false,
      created_at: new Date().toISOString(),
    });
    Storage.set(Storage.KEYS.NOTIFICATIONS, notifications);

    return { success: true, booking, payment: successPayment };
  },

  /**
   * Reschedule booking to a new time slot
   */
  async rescheduleBooking(bookingId: string, newStartsAt: string, newEndsAt: string): Promise<Booking> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    const booking = bookings[idx];

    // Check collision for new slot
    const collision = bookings.find((b) => {
      if (b.id === bookingId) return false;
      if (b.status === 'cancelled_by_learner' || b.status === 'cancelled_by_school') return false;
      const bStart = new Date(b.starts_at).getTime();
      const bEnd = new Date(b.ends_at).getTime();
      const slotStart = new Date(newStartsAt).getTime();
      const slotEnd = new Date(newEndsAt).getTime();
      return (
        slotStart < bEnd &&
        slotEnd > bStart &&
        (b.instructor_id === booking.instructor_id || b.vehicle_id === booking.vehicle_id)
      );
    });

    if (collision) {
      throw new Error('The chosen slot is no longer available. Please pick another.');
    }

    booking.starts_at = newStartsAt;
    booking.ends_at = newEndsAt;
    bookings[idx] = booking;
    Storage.set(Storage.KEYS.BOOKINGS, bookings);

    // Notification
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: `notif_${Date.now()}`,
      user_id: booking.learner_id,
      title: 'Lesson Rescheduled',
      message: `Your booking ${booking.booking_code} was moved to ${new Date(newStartsAt).toLocaleString()}.`,
      type: 'reminder',
      read: false,
      created_at: new Date().toISOString(),
    });
    Storage.set(Storage.KEYS.NOTIFICATIONS, notifs);

    return booking;
  },

  /**
   * Cancel booking with strict Vadodara refund policy:
   * - If cancelled_by_school: 100% full refund
   * - If cancelled_by_learner:
   *     - >= 6 hours before start: 100% free refund
   *     - < 6 hours before start: 50% cancellation fee deducted, 50% refund
   */
  async cancelBooking(
    bookingId: string,
    cancelledBy: 'learner' | 'school',
    reason = ''
  ): Promise<{
    booking: Booking;
    cancellationFee: number;
    refundAmount: number;
    fullRefund: boolean;
  }> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    const booking = bookings[idx];
    const now = Date.now();
    const startTime = new Date(booking.starts_at).getTime();
    const hoursRemaining = (startTime - now) / (1000 * 60 * 60);

    let cancellationFee = 0;
    let refundAmount = booking.amount_inr;
    let fullRefund = true;

    if (cancelledBy === 'school') {
      // 100% full refund if school cancels
      fullRefund = true;
      cancellationFee = 0;
      refundAmount = booking.amount_inr;
      booking.status = 'cancelled_by_school';
    } else {
      // Learner cancellation policy
      booking.status = 'cancelled_by_learner';
      if (hoursRemaining < 6) {
        // Less than 6 hours -> 50% fee
        fullRefund = false;
        cancellationFee = Math.round(booking.amount_inr * 0.5);
        refundAmount = booking.amount_inr - cancellationFee;
      } else {
        fullRefund = true;
        cancellationFee = 0;
        refundAmount = booking.amount_inr;
      }
    }

    booking.cancellation_reason = reason;
    booking.cancelled_at = new Date().toISOString();
    booking.cancellation_fee_inr = cancellationFee;
    booking.refund_amount_inr = refundAmount;
    booking.refund_status = refundAmount > 0 ? 'pending' : 'not_applicable';

    bookings[idx] = booking;
    Storage.set(Storage.KEYS.BOOKINGS, bookings);

    // Update payment record
    const payments = Storage.get<Payment[]>(Storage.KEYS.PAYMENTS, []);
    const payment = payments.find((p) => p.booking_id === bookingId && p.status === 'success');
    if (payment) {
      payment.status = 'refunded';
      Storage.set(Storage.KEYS.PAYMENTS, payments);
    }

    // Add refund notification
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: `notif_${Date.now()}`,
      user_id: booking.learner_id,
      title: cancelledBy === 'school' ? 'Booking Cancelled by School (Full Refund)' : 'Lesson Cancelled',
      message:
        cancelledBy === 'school'
          ? `The school had to cancel ${booking.booking_code}. A full refund of ₹${refundAmount} has been credited to your UPI.`
          : `Booking ${booking.booking_code} cancelled. Refund of ₹${refundAmount} initiated ${fullRefund ? '(Free cancellation)' : '(50% late cancellation fee)'}.`,
      type: 'payment',
      read: false,
      created_at: new Date().toISOString(),
    });
    Storage.set(Storage.KEYS.NOTIFICATIONS, notifs);

    return { booking, cancellationFee, refundAmount, fullRefund };
  },

  /**
   * Mark lesson status (completed or no_show) by driving school
   */
  async markLessonStatus(bookingId: string, status: 'completed' | 'no_show'): Promise<Booking> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');

    bookings[idx].status = status;
    Storage.set(Storage.KEYS.BOOKINGS, bookings);
    return bookings[idx];
  },

  async getLearnerBookings(learnerId: string): Promise<Booking[]> {
    await this.releaseExpiredHolds();
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    return bookings
      .filter((b) => b.learner_id === learnerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getSchoolBookings(schoolId: string): Promise<Booking[]> {
    await this.releaseExpiredHolds();
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    return bookings
      .filter((b) => b.school_id === schoolId)
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  },

  async getAllBookings(): Promise<Booking[]> {
    await this.releaseExpiredHolds();
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    return bookings.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async processRefundStatus(bookingId: string): Promise<Booking> {
    const bookings = Storage.get<Booking[]>(Storage.KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error('Booking not found');
    bookings[idx].refund_status = 'processed';
    Storage.set(Storage.KEYS.BOOKINGS, bookings);
    return bookings[idx];
  },
};
