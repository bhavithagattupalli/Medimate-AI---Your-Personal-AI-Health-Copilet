import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthTab } from '../types';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail as apiVerifyEmail,
  verifyPhone as apiVerifyPhone,
  resendVerificationCode,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from '../services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthTab;
  pendingVerificationEmail: string | null;
  openAuthModal: (tab?: AuthTab, prefillEmail?: string) => void;
  closeAuthModal: () => void;
  setPendingVerificationEmail: (email: string | null) => void;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, otpOrToken: string, isOtp?: boolean) => Promise<void>;
  verifyPhone: (email: string, otp: string) => Promise<void>;
  resendCode: (email: string, type?: 'email' | 'phone') => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>('signin');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (tab: AuthTab = 'signin', prefillEmail?: string) => {
    setAuthModalTab(tab);
    if (prefillEmail) {
      setPendingVerificationEmail(prefillEmail);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: LoginPayload) => {
    const res = await loginUser(data);
    setUser(res.user);
    closeAuthModal();
  };

  const register = async (data: RegisterPayload): Promise<RegisterResponse> => {
    const res = await registerUser(data);
    setPendingVerificationEmail(data.email);
    setAuthModalTab('verify');
    return res;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const verifyEmail = async (email: string, otpOrToken: string, isOtp = true) => {
    if (isOtp) {
      await apiVerifyEmail({ email, otp: otpOrToken });
    } else {
      await apiVerifyEmail({ email, token: otpOrToken });
    }
    // Refresh user context if logged in
    await refreshUser();
  };

  const verifyPhone = async (email: string, otp: string) => {
    await apiVerifyPhone({ email, otp });
    await refreshUser();
  };

  const resendCode = async (email: string, type: 'email' | 'phone' = 'email') => {
    await resendVerificationCode(email, type);
  };

  const forgotPassword = async (email: string) => {
    await apiForgotPassword(email);
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    await apiResetPassword(payload);
    // After reset, close modal or route to signin
    setAuthModalTab('signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authModalTab,
        pendingVerificationEmail,
        openAuthModal,
        closeAuthModal,
        setPendingVerificationEmail,
        login,
        register,
        logout,
        verifyEmail,
        verifyPhone,
        resendCode,
        forgotPassword,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
