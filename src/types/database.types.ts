/**
 * icandrive - PostgreSQL & Supabase Database Type Definitions
 *
 * Designed to provide full type safety and auto-completion when scaled by Codex, Kiro AI,
 * or when generating Supabase client types via `supabase gen types typescript`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          full_name: string;
          role: 'learner' | 'school_admin' | 'admin';
          language_pref: 'en' | 'hi' | 'gu';
          learner_license_no: string | null;
          school_id: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          full_name: string;
          role?: 'learner' | 'school_admin' | 'admin';
          language_pref?: 'en' | 'hi' | 'gu';
          learner_license_no?: string | null;
          school_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          full_name?: string;
          role?: 'learner' | 'school_admin' | 'admin';
          language_pref?: 'en' | 'hi' | 'gu';
          learner_license_no?: string | null;
          school_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          area: string;
          address: string;
          phone: string;
          email: string;
          rto_license_no: string;
          verified: boolean;
          status: 'approved' | 'pending_approval' | 'rejected';
          rating: number;
          review_count: number;
          commission_rate: number;
          photos: string[];
          description: string;
          facilities: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          area: string;
          address: string;
          phone: string;
          email: string;
          rto_license_no: string;
          verified?: boolean;
          status?: 'approved' | 'pending_approval' | 'rejected';
          rating?: number;
          review_count?: number;
          commission_rate?: number;
          photos?: string[];
          description?: string;
          facilities?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          area?: string;
          address?: string;
          phone?: string;
          email?: string;
          rto_license_no?: string;
          verified?: boolean;
          status?: 'approved' | 'pending_approval' | 'rejected';
          rating?: number;
          review_count?: number;
          commission_rate?: number;
          photos?: string[];
          description?: string;
          facilities?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      instructors: {
        Row: {
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
          bio: string | null;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          gender: 'male' | 'female';
          phone: string;
          experience_years?: number;
          rating?: number;
          photo_url?: string;
          languages?: string[];
          is_active?: boolean;
          bio?: string | null;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          gender?: 'male' | 'female';
          phone?: string;
          experience_years?: number;
          rating?: number;
          photo_url?: string;
          languages?: string[];
          is_active?: boolean;
          bio?: string | null;
        };
      };
      vehicles: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          vehicle_type: 'car_manual' | 'car_automatic' | 'two_wheeler';
          reg_no: string;
          model_year: number;
          is_dual_control: boolean;
          photo_url: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          vehicle_type: 'car_manual' | 'car_automatic' | 'two_wheeler';
          reg_no: string;
          model_year?: number;
          is_dual_control?: boolean;
          photo_url?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          vehicle_type?: 'car_manual' | 'car_automatic' | 'two_wheeler';
          reg_no?: string;
          model_year?: number;
          is_dual_control?: boolean;
          photo_url?: string;
          is_active?: boolean;
        };
      };
      packages: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          vehicle_type: 'car_manual' | 'car_automatic' | 'two_wheeler';
          lesson_count: number;
          duration_minutes: number;
          price_inr: number;
          description: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          vehicle_type: 'car_manual' | 'car_automatic' | 'two_wheeler';
          lesson_count?: number;
          duration_minutes?: number;
          price_inr: number;
          description?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          vehicle_type?: 'car_manual' | 'car_automatic' | 'two_wheeler';
          lesson_count?: number;
          duration_minutes?: number;
          price_inr?: number;
          description?: string;
          is_active?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          learner_id: string;
          learner_name: string;
          learner_phone: string;
          school_id: string;
          instructor_id: string;
          vehicle_id: string;
          package_id: string;
          starts_at: string;
          ends_at: string;
          status:
            | 'pending_payment'
            | 'confirmed'
            | 'completed'
            | 'cancelled_by_learner'
            | 'cancelled_by_school'
            | 'no_show';
          hold_expires_at: string;
          amount_inr: number;
          pickup_from_home: boolean;
          pickup_address: string | null;
          cancellation_reason: string | null;
          refund_amount_inr: number | null;
          refund_status: 'none' | 'pending' | 'processed' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          learner_id: string;
          learner_name: string;
          learner_phone: string;
          school_id: string;
          instructor_id: string;
          vehicle_id: string;
          package_id: string;
          starts_at: string;
          ends_at: string;
          status?:
            | 'pending_payment'
            | 'confirmed'
            | 'completed'
            | 'cancelled_by_learner'
            | 'cancelled_by_school'
            | 'no_show';
          hold_expires_at: string;
          amount_inr: number;
          pickup_from_home?: boolean;
          pickup_address?: string | null;
          cancellation_reason?: string | null;
          refund_amount_inr?: number | null;
          refund_status?: 'none' | 'pending' | 'processed' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          learner_id?: string;
          learner_name?: string;
          learner_phone?: string;
          school_id?: string;
          instructor_id?: string;
          vehicle_id?: string;
          package_id?: string;
          starts_at?: string;
          ends_at?: string;
          status?:
            | 'pending_payment'
            | 'confirmed'
            | 'completed'
            | 'cancelled_by_learner'
            | 'cancelled_by_school'
            | 'no_show';
          hold_expires_at?: string;
          amount_inr?: number;
          pickup_from_home?: boolean;
          pickup_address?: string | null;
          cancellation_reason?: string | null;
          refund_amount_inr?: number | null;
          refund_status?: 'none' | 'pending' | 'processed' | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'success' | 'failed' | 'refunded';
          payment_method: string;
          upi_transaction_id: string | null;
          commission_amount: number;
          school_payout_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          payment_method?: string;
          upi_transaction_id?: string | null;
          commission_amount: number;
          school_payout_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          payment_method?: string;
          upi_transaction_id?: string | null;
          commission_amount?: number;
          school_payout_amount?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          school_id: string;
          learner_id: string;
          learner_name: string;
          rating: number;
          comment: string;
          is_flagged: boolean;
          flag_reason: string | null;
          school_reply: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          school_id: string;
          learner_id: string;
          learner_name: string;
          rating: number;
          comment: string;
          is_flagged?: boolean;
          flag_reason?: string | null;
          school_reply?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          school_id?: string;
          learner_id?: string;
          learner_name?: string;
          rating?: number;
          comment?: string;
          is_flagged?: boolean;
          flag_reason?: string | null;
          school_reply?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
