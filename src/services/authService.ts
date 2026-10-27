/**
 * Authentication & User Profile Service (Mock with LocalStorage persistence)
 *
 * NOTE FOR SUPABASE MIGRATION:
 * Replace with:
 *   const { data, error } = await supabase.auth.signInWithOtp({ phone });
 *   const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
 */
import { Storage } from './storage';
import { Profile, UserRole, LanguageCode } from '../types';

export const AuthService = {
  async getCurrentUser(): Promise<Profile> {
    const profiles = Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);
    const currentId = Storage.get<string>(Storage.KEYS.CURRENT_USER_ID, 'user_learner_pooja');
    const user = profiles.find((p) => p.id === currentId);
    if (!user) {
      // Fallback to first profile
      return profiles[0];
    }
    return user;
  },

  async loginWithPhoneOtp(phone: string, otp: string): Promise<Profile> {
    // In demo mode: accept OTP "123456"
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Please enter demo OTP 123456');
    }

    const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
    const profiles = Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);
    let user = profiles.find((p) => p.phone.replace(/\D/g, '').endsWith(cleanedPhone));

    if (!user) {
      // Auto-register new learner profile if phone doesn't exist
      user = {
        id: `user_learner_${Date.now()}`,
        phone: cleanedPhone,
        full_name: `Learner ${cleanedPhone.slice(-4)}`,
        role: 'learner',
        language_pref: 'en',
        created_at: new Date().toISOString(),
      };
      profiles.push(user);
      Storage.set(Storage.KEYS.PROFILES, profiles);
    }

    Storage.set(Storage.KEYS.CURRENT_USER_ID, user.id);
    return user;
  },

  async switchUser(userId: string): Promise<Profile> {
    const profiles = Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);
    const target = profiles.find((p) => p.id === userId);
    if (!target) {
      throw new Error('User not found');
    }
    Storage.set(Storage.KEYS.CURRENT_USER_ID, target.id);
    return target;
  },

  async getAllProfiles(): Promise<Profile[]> {
    return Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const profiles = Storage.get<Profile[]>(Storage.KEYS.PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('User profile not found');

    const updated = { ...profiles[idx], ...updates };
    profiles[idx] = updated;
    Storage.set(Storage.KEYS.PROFILES, profiles);
    return updated;
  },

  async logout(): Promise<void> {
    // Revert to demo learner
    Storage.set(Storage.KEYS.CURRENT_USER_ID, 'user_learner_pooja');
  },
};
