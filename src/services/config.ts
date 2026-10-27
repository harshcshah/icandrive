/**
 * icandrive - Core Application Configuration
 *
 * Designed for seamless scaling by Codex, Kiro AI, or developers.
 * Flip USE_MOCK_STORAGE to false when connecting to a real Supabase/PostgreSQL backend.
 */

export const APP_CONFIG = {
  /**
   * Data Source Flag:
   * - true: Uses LocalStorage persistence with seeded Vadodara driving schools data.
   * - false: Swaps data layer to real Supabase client SDK and remote PostgreSQL.
   */
  USE_MOCK_STORAGE: true,

  /**
   * Supabase & Remote Backend Credentials
   * Configured via environment variables (.env)
   */
  SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder',

  /**
   * Payment Gateway (Razorpay / Cashfree UPI)
   */
  RAZORPAY_KEY_ID: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_icandrive_demo',

  /**
   * Marketplace Business Rules (Vadodara Region)
   */
  CITY: 'Vadodara',
  STATE: 'Gujarat',
  RTO_CODE: 'GJ-06',
  DEFAULT_COMMISSION_PERCENT: 15, // 15% marketplace commission
  PAYMENT_HOLD_MINUTES: 10, // Slot lock countdown before auto-release
  CANCELLATION_FREE_WINDOW_HOURS: 6, // 100% refund if cancelled > 6 hrs before lesson
  LATE_CANCELLATION_REFUND_PERCENT: 50, // 50% refund if cancelled < 6 hrs before lesson
  LESSON_DEFAULT_DURATION_MINUTES: 45, // Standard lesson slot duration
};

export type AppConfig = typeof APP_CONFIG;
