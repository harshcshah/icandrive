/**
 * icandrive - TypeScript Database Schemas & Types
 * Structured to cleanly map to Supabase PostgreSQL tables.
 */

export type UserRole = 'learner' | 'school_admin' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'gu';

export type VehicleType = 'car_manual' | 'car_automatic' | 'two_wheeler';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_learner'
  | 'cancelled_by_school'
  | 'no_show';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type VadodaraArea =
  | 'Alkapuri'
  | 'Manjalpur'
  | 'Gotri'
  | 'Karelibaug'
  | 'Makarpura'
  | 'Waghodia Road'
  | 'Akota'
  | 'Fatehgunj';

export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  role: UserRole;
  language_pref: LanguageCode;
  learner_license_no?: string;
  school_id?: string; // If role === 'school_admin'
  avatar_url?: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  area: VadodaraArea;
  address: string;
  phone: string;
  email: string;
  rto_license_no: string;
  verified: boolean;
  status: 'approved' | 'pending_approval' | 'rejected';
  rating: number;
  review_count: number;
  commission_rate: number; // e.g., 15%
  photos: string[];
  description: string;
  facilities: string[];
  is_active: boolean;
  created_at: string;
}

export interface Instructor {
  id: string;
  school_id: string;
  name: string;
  gender: 'male' | 'female';
  phone: string;
  experience_years: number;
  rating: number;
  photo_url: string;
  languages: string[];
  is_active: boolean;
  bio?: string;
}

export interface Vehicle {
  id: string;
  school_id: string;
  name: string;
  vehicle_type: VehicleType;
  reg_no: string;
  model_year: number;
  is_dual_control: boolean;
  photo_url: string;
  is_active: boolean;
}

export interface Package {
  id: string;
  school_id: string;
  name: string;
  vehicle_type: VehicleType;
  lesson_count: number; // 5, 10, 15
  duration_minutes: number; // typically 45
  price_inr: number;
  description: string;
  is_active: boolean;
}

export interface AvailabilityRule {
  id: string;
  school_id: string;
  instructor_id: string;
  weekday: number; // 0 (Sun) to 6 (Sat)
  start_time: string; // "07:00"
  end_time: string; // "19:00"
  slot_duration_minutes: number; // 45
}

export interface TimeOff {
  id: string;
  school_id: string;
  instructor_id: string;
  date: string; // "YYYY-MM-DD"
  reason?: string;
  start_time?: string; // If partial day, e.g. "09:00"
  end_time?: string; // If partial day, e.g. "12:00"
}

export interface Booking {
  id: string;
  booking_code: string; // e.g. "ICD-2026-8910"
  school_id: string;
  instructor_id: string;
  vehicle_id: string;
  package_id: string;
  learner_id: string;
  learner_name?: string;
  learner_phone?: string;
  starts_at: string; // ISO string
  ends_at: string; // ISO string
  status: BookingStatus;
  hold_expires_at?: string; // ISO string, 10 minutes from creation
  amount_inr: number;
  pickup_from_home: boolean;
  pickup_address?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancellation_fee_inr?: number;
  refund_status?: 'not_applicable' | 'pending' | 'processed';
  refund_amount_inr?: number;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  commission_amount: number; // e.g. 15%
  school_payout: number; // amount - commission_amount
  payment_method: 'upi' | 'card' | 'netbanking';
  upi_id?: string;
  transaction_ref: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  school_id: string;
  instructor_id: string;
  learner_id: string;
  learner_name: string;
  rating: number; // 1 to 5
  comment: string;
  school_reply?: string;
  school_replied_at?: string;
  is_flagged?: boolean;
  flag_reason?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'reminder' | 'system';
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface TimeSlot {
  starts_at: string; // ISO
  ends_at: string; // ISO
  display_time: string; // "08:00 AM - 08:45 AM"
  available: boolean;
  instructor_id: string;
  instructor_name: string;
  vehicle_id: string;
  vehicle_name: string;
  conflict_reason?: string;
}
