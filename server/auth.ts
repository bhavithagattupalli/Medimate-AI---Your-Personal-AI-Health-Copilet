import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to carry authenticated user
export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  role: 'patient' | 'doctor' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}

// Password Policy Requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number (0-9)');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('Password must include at least one special character (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compatible regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Allows international E.164 formats, including India +91 standard formats (10-15 digits)
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?[1-9]\d{9,14}$/.test(cleaned);
}

// Password Hashing with bcrypt (12 rounds)
export async function hashPassword(plainText: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(plainText, saltRounds);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (err) {
    return false;
  }
}

// Cryptographic token helpers
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateNumericOtp(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

// In-Memory Rate Limiting for Login & Sensitive Endpoints
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();
const generalRateLimits = new Map<string, { count: number; resetTime: number }>();

const MAX_LOGIN_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes window

export function checkLoginLockout(key: string): { isLocked: boolean; remainingMinutes?: number } {
  const record = loginRateLimits.get(key.toLowerCase());
  if (!record || !record.lockedUntil) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { isLocked: true, remainingMinutes };
  }

  // Lock has expired
  loginRateLimits.delete(key.toLowerCase());
  return { isLocked: false };
}

export function recordFailedLoginAttempt(key: string): { locked: boolean; attemptsRemaining: number } {
  const now = Date.now();
  const lowerKey = key.toLowerCase();
  let record = loginRateLimits.get(lowerKey);

  if (!record || now - record.firstAttempt > WINDOW_DURATION_MS) {
    record = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    record.attempts += 1;
    record.lastAttempt = now;
  }

  if (record.attempts >= MAX_LOGIN_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginRateLimits.set(lowerKey, record);
    return { locked: true, attemptsRemaining: 0 };
  }

  loginRateLimits.set(lowerKey, record);
  return { locked: false, attemptsRemaining: MAX_LOGIN_FAILED_ATTEMPTS - record.attempts };
}

export function clearFailedLoginAttempts(key: string): void {
  loginRateLimits.delete(key.toLowerCase());
}

// General Endpoint Rate Limiter Middleware
export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = generalRateLimits.get(key);
    if (!record || now > record.resetTime) {
      generalRateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Simulated / Configurable Email & SMS Delivery
export interface DispatchedNotification {
  id: string;
  recipient: string;
  channel: 'email' | 'sms';
  subject: string;
  content: string;
  otp?: string;
  link?: string;
  timestamp: string;
}

const recentNotifications: DispatchedNotification[] = [];

export async function sendEmailNotification(params: {
  to: string;
  subject: string;
  content: string;
  otp?: string;
  link?: string;
}): Promise<boolean> {
  const notification: DispatchedNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: params.to,
    channel: 'email',
    subject: params.subject,
    content: params.content,
    otp: params.otp,
    link: params.link,
    timestamp: new Date().toISOString(),
  };

  // Push to recent notification queue for dev inspection
  recentNotifications.unshift(notification);
  if (recentNotifications.length > 50) recentNotifications.pop();

  console.log(`[MediMate Auth Email] To: ${params.to} | Subject: ${params.subject}`);
  if (params.otp) console.log(`[MediMate Auth OTP] Verification Code: ${params.otp}`);
  if (params.link) console.log(`[MediMate Auth Link] Verification URL: ${params.link}`);

  return true;
}

export async function sendSmsNotification(params: {
  to: string;
  message: string;
  otp?: string;
}): Promise<boolean> {
  const notification: DispatchedNotification = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: params.to,
    channel: 'sms',
    subject: 'MediMate AI Mobile Security OTP',
    content: params.message,
    otp: params.otp,
    timestamp: new Date().toISOString(),
  };

  recentNotifications.unshift(notification);
  if (recentNotifications.length > 50) recentNotifications.pop();

  console.log(`[MediMate Auth SMS] To: ${params.to} | Message: ${params.message}`);
  return true;
}

export function getRecentSimulatedNotifications(recipient?: string): DispatchedNotification[] {
  if (recipient) {
    return recentNotifications.filter((n) => n.recipient.toLowerCase() === recipient.toLowerCase());
  }
  return [...recentNotifications];
}
