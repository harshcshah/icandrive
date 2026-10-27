import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, UserRole } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  loginWithOtp: (phone: string, otp: string) => Promise<Profile>;
  switchUser: (userId: string) => Promise<Profile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  allDemoProfiles: Profile[];
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDemoProfiles, setAllDemoProfiles] = useState<Profile[]>([]);

  const refreshUser = useCallback(async () => {
    try {
      const current = await AuthService.getCurrentUser();
      setUser(current);
      const all = await AuthService.getAllProfiles();
      setAllDemoProfiles(all);
    } catch (e) {
      console.error('Error refreshing auth user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const loggedIn = await AuthService.loginWithPhoneOtp(phone, otp);
      setUser(loggedIn);
      await refreshUser();
      return loggedIn;
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    setLoading(true);
    try {
      const switched = await AuthService.switchUser(userId);
      setUser(switched);
      await refreshUser();
      return switched;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    await refreshUser();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    const updated = await AuthService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithOtp,
        switchUser,
        logout,
        updateProfile,
        allDemoProfiles,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
