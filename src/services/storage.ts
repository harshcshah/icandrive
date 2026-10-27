/**
 * Local Storage persistent repository with seed initialization.
 * All access in /src/services passes through here, allowing seamless swap
 * to Supabase client / PostgreSQL queries in future.
 */
import {
  SEED_PROFILES,
  SEED_SCHOOLS,
  SEED_INSTRUCTORS,
  SEED_VEHICLES,
  SEED_PACKAGES,
  SEED_AVAILABILITY_RULES,
  SEED_TIME_OFF,
  SEED_BOOKINGS,
  SEED_PAYMENTS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import {
  Profile,
  School,
  Instructor,
  Vehicle,
  Package,
  AvailabilityRule,
  TimeOff,
  Booking,
  Payment,
  Review,
  NotificationItem,
} from '../types';

const STORAGE_KEYS = {
  PROFILES: 'icd_profiles_v1',
  SCHOOLS: 'icd_schools_v1',
  INSTRUCTORS: 'icd_instructors_v1',
  VEHICLES: 'icd_vehicles_v1',
  PACKAGES: 'icd_packages_v1',
  AVAILABILITY: 'icd_availability_v1',
  TIMEOFF: 'icd_timeoff_v1',
  BOOKINGS: 'icd_bookings_v1',
  PAYMENTS: 'icd_payments_v1',
  REVIEWS: 'icd_reviews_v1',
  NOTIFICATIONS: 'icd_notifications_v1',
  CURRENT_USER_ID: 'icd_current_user_id_v1',
  DEFAULT_COMMISSION: 'icd_default_commission_v1',
};

export const Storage = {
  init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(SEED_SCHOOLS));
      localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(SEED_INSTRUCTORS));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(SEED_VEHICLES));
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(SEED_PACKAGES));
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(SEED_AVAILABILITY_RULES));
      localStorage.setItem(STORAGE_KEYS.TIMEOFF, JSON.stringify(SEED_TIME_OFF));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_learner_pooja');
      localStorage.setItem(STORAGE_KEYS.DEFAULT_COMMISSION, '15');
    }
  },

  get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  },

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
    this.init();
  },

  KEYS: STORAGE_KEYS,
};

// Auto-run init
Storage.init();
