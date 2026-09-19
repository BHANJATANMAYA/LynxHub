import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  simulatedVerificationUrl: string | null;
  setSimulatedVerificationUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<{ simulatedVerificationUrl?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedVerificationUrl, setSimulatedVerificationUrl] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get<{ user: User }>('/api/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User }>('/api/auth/login', { email, password });
    if (!res.success) {
      throw new Error(res.error?.message || 'Login failed');
    }
    setUser(res.data.user);
  };

  const signup = async (email: string, password: string, username: string) => {
    const res = await api.post<{ user: User; simulatedVerificationUrl?: string }>('/api/auth/signup', {
      email,
      password,
      username,
    });
    if (!res.success) {
      throw new Error(res.error?.message || 'Signup failed');
    }
    setUser(res.data.user);
    if (res.data.simulatedVerificationUrl) {
      setSimulatedVerificationUrl(res.data.simulatedVerificationUrl);
    }
    return { simulatedVerificationUrl: res.data.simulatedVerificationUrl };
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
      setSimulatedVerificationUrl(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<{ user: User }>('/api/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        simulatedVerificationUrl,
        setSimulatedVerificationUrl,
        login,
        signup,
        logout,
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
