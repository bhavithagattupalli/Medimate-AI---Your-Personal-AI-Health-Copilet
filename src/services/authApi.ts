import { AuthUser } from '../types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  age?: number;
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  consentPrivacy: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  phoneNumber: string;
  requiresEmailVerification: boolean;
  devNotice?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token?: string;
}

export interface ResetPasswordPayload {
  email: string;
  token?: string;
  otp?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Helper to extract clean error message
async function parseError(response: Response, defaultMsg: string): Promise<string> {
  try {
    const data = await response.json();
    return data.error || defaultMsg;
  } catch {
    return defaultMsg;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Account registration failed');
    throw new Error(msg);
  }

  return res.json();
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || 'Authentication failed');
    (err as any).code = data.code;
    (err as any).email = data.email;
    (err as any).remainingMinutes = data.remainingMinutes;
    (err as any).requiresEmailVerification = data.requiresEmailVerification;
    throw err;
  }

  return res.json();
}

export async function logoutUser(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Sign out failed');
    throw new Error(msg);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function verifyEmail(payload: { email: string; token?: string; otp?: string }): Promise<{ message: string }> {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Email verification failed');
    throw new Error(msg);
  }

  return res.json();
}

export async function verifyPhone(payload: { email: string; otp: string }): Promise<{ message: string }> {
  const res = await fetch('/api/auth/verify-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Mobile verification failed');
    throw new Error(msg);
  }

  return res.json();
}

export async function resendVerificationCode(email: string, type: 'email' | 'phone' = 'email'): Promise<{ message: string }> {
  const res = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type }),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Failed to resend code');
    throw new Error(msg);
  }

  return res.json();
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Failed to process password reset request');
    throw new Error(msg);
  }

  return res.json();
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Password reset failed');
    throw new Error(msg);
  }

  return res.json();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await parseError(res, 'Failed to change password');
    throw new Error(msg);
  }

  return res.json();
}

export async function getDevNotifications(): Promise<any[]> {
  try {
    const res = await fetch('/api/auth/dev-notifications');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
