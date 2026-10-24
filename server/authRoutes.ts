import { Router, Request, Response, NextFunction } from 'express';
import { db, UserRole } from './store';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  generateSecureToken,
  hashToken,
  generateNumericOtp,
  checkLoginLockout,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
  sendEmailNotification,
  sendSmsNotification,
  getRecentSimulatedNotifications,
} from './auth';

export const authRouter = Router();

// ==========================================
// Authentication Middlewares
// ==========================================

export function extractSessionToken(req: Request): string | null {
  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies['medimate_session']) {
    return req.cookies['medimate_session'];
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 3. Check custom header
  const tokenHeader = req.headers['x-medimate-token'];
  if (typeof tokenHeader === 'string' && tokenHeader.length > 0) {
    return tokenHeader.trim();
  }

  return null;
}

export function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to access this feature.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const tokenH = hashToken(token);
  const session = db.findSessionByToken(tokenH);

  if (!session) {
    res.status(401).json({
      error: 'Session expired or invalid. Please sign in again.',
      code: 'SESSION_INVALID',
    });
    return;
  }

  const user = db.getUserById(session.userId);
  if (!user) {
    db.deleteSession(session.id);
    res.status(401).json({
      error: 'User account not found. Please sign in again.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  // Check if account is currently locked
  if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
    res.status(403).json({
      error: 'Account is temporarily locked for security. Please try again later or reset your password.',
      code: 'ACCOUNT_LOCKED',
    });
    return;
  }

  // Touch session activity
  db.touchSession(session.id);

  req.user = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    sessionId: session.id,
  };
  req.sessionToken = token;

  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);
  if (!token) {
    return next();
  }

  const tokenH = hashToken(token);
  const session = db.findSessionByToken(tokenH);
  if (session) {
    const user = db.getUserById(session.userId);
    if (user && (!user.lockUntil || new Date(user.lockUntil).getTime() <= Date.now())) {
      db.touchSession(session.id);
      req.user = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        sessionId: session.id,
      };
      req.sessionToken = token;
    }
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.recordAuthAuditLog({
        userId: req.user.id,
        email: req.user.email,
        action: 'unauthorized_access',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MediMate API Client',
        status: 'blocked',
        metadata: { attemptedRole: allowedRoles, currentRole: req.user.role, path: req.path },
      });

      res.status(403).json({
        error: `Access denied. Authorized roles: ${allowedRoles.join(' or ')}.`,
        code: 'FORBIDDEN_ROLE',
      });
      return;
    }

    next();
  };
}

// ==========================================
// Authentication Routes
// ==========================================

/**
 * 1. POST /api/auth/register
 * Responsive registration with comprehensive frontend & backend validation
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      age,
      password,
      confirmPassword,
      consentTerms,
      consentPrivacy,
    } = req.body;

    // 1. Mandatory field checks
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({ error: 'Full Name must be at least 2 characters long' });
      return;
    }

    if (!email || !validateEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address (e.g., patient@example.com)' });
      return;
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      res.status(400).json({ error: 'Please enter a valid mobile number with country code (e.g., +91 98480 12345)' });
      return;
    }

    // 2. Password strength & confirmation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      res.status(400).json({
        error: passwordCheck.errors[0] || 'Password does not meet security requirements',
        details: passwordCheck.errors,
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Password and Confirm Password do not match' });
      return;
    }

    // 3. Duplicate Account Prevention
    const existing = db.getUserByEmail(email);
    if (existing) {
      db.recordAuthAuditLog({
        userId: existing.id,
        email,
        action: 'register',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MediMate Web Client',
        status: 'failure',
        metadata: { reason: 'duplicate_email_attempt' },
      });

      res.status(409).json({
        error: 'An account with this email address already exists. Please sign in or use Forgot Password.',
        code: 'DUPLICATE_EMAIL',
      });
      return;
    }

    // 4. Secure Password Hashing (bcrypt, 12 rounds)
    const passwordHash = await hashPassword(password);

    // 5. Create user in database (strictly 'patient' role)
    const newUser = db.createUser({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth || (age ? `${new Date().getFullYear() - Number(age)}-01-01` : undefined),
      passwordHash,
      role: 'patient',
      isEmailVerified: false,
      isPhoneVerified: false,
      consents: {
        terms: Boolean(consentTerms),
        privacyPolicy: Boolean(consentPrivacy),
        aiHealthProcessing: true,
        timestamp: new Date().toISOString(),
      },
    });

    // 6. Generate Single-Use Email Verification Token & OTP
    const rawEmailToken = generateSecureToken();
    const tokenHash = hashToken(rawEmailToken);
    const emailOtp = generateNumericOtp(6);
    const emailExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    db.createVerificationToken({
      userId: newUser.id,
      tokenHash,
      otpCode: emailOtp,
      type: 'email_verify',
      expiresAt: emailExpiresAt,
      usedAt: null,
    });

    // 7. Generate Phone Verification OTP (10 min expiry)
    const phoneOtp = generateNumericOtp(6);
    const phoneExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.createVerificationToken({
      userId: newUser.id,
      tokenHash: hashToken(phoneOtp),
      otpCode: phoneOtp,
      type: 'phone_verify',
      expiresAt: phoneExpiresAt,
      usedAt: null,
    });

    // 8. Dispatch Email & SMS Notifications
    const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationLink = `${appBaseUrl}/?verify_email=${rawEmailToken}&email=${encodeURIComponent(newUser.email)}`;

    await sendEmailNotification({
      to: newUser.email,
      subject: 'Verify your MediMate AI Account',
      content: `Hello ${newUser.fullName},\n\nWelcome to MediMate AI! Please verify your email using the verification code: ${emailOtp}\nOr click the verification link: ${verificationLink}`,
      otp: emailOtp,
      link: verificationLink,
    });

    await sendSmsNotification({
      to: newUser.phoneNumber,
      message: `Your MediMate AI mobile verification OTP is ${phoneOtp}. Valid for 10 minutes. Do not share with anyone.`,
      otp: phoneOtp,
    });

    // 9. Record Audit Log
    db.recordAuthAuditLog({
      userId: newUser.id,
      email: newUser.email,
      action: 'register',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'MediMate Web Client',
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! A verification OTP and secure link have been sent to your email and mobile number.',
      userId: newUser.id,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      requiresEmailVerification: true,
      devNotice: process.env.NODE_ENV !== 'production' ? 'Check /api/auth/dev-notifications or dev console for the simulated OTP' : undefined,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during account registration' });
  }
});

/**
 * 2. POST /api/auth/verify-email
 * Verifies email via token or 6-digit OTP
 */
authRouter.post('/verify-email', (req: Request, res: Response): void => {
  const { email, token, otp } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email address is required for verification' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  if (user.isEmailVerified) {
    res.status(400).json({
      error: 'This account email is already verified. Single-use verification codes cannot be reused.',
      code: 'ALREADY_VERIFIED',
    });
    return;
  }

  let tokenRecord;
  if (token) {
    const th = hashToken(token);
    tokenRecord = db.findVerificationToken(th, 'email_verify');
  } else if (otp) {
    tokenRecord = db.findVerificationOtp(user.id, otp.trim(), 'email_verify');
  }

  if (!tokenRecord || tokenRecord.userId !== user.id) {
    res.status(400).json({
      error: 'Invalid or expired email verification code. Please request a new code.',
      code: 'INVALID_VERIFICATION_TOKEN',
    });
    return;
  }

  // Mark token consumed and user verified
  db.consumeToken(tokenRecord.id);
  db.updateUser(user.id, { isEmailVerified: true });

  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: 'verify_email',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'MediMate Web Client',
    status: 'success',
  });

  res.json({
    success: true,
    message: 'Email address verified successfully. You may now sign in to your MediMate AI account.',
  });
});

/**
 * 3. POST /api/auth/verify-phone
 * Verifies mobile number via 6-digit OTP
 */
authRouter.post('/verify-phone', (req: Request, res: Response): void => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and mobile OTP code are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  const tokenRecord = db.findVerificationOtp(user.id, otp.trim(), 'phone_verify');
  if (!tokenRecord) {
    res.status(400).json({ error: 'Invalid or expired phone verification code', code: 'INVALID_OTP' });
    return;
  }

  db.consumeToken(tokenRecord.id);
  db.updateUser(user.id, { isPhoneVerified: true });

  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: 'verify_phone',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'MediMate Web Client',
    status: 'success',
  });

  res.json({
    success: true,
    message: 'Mobile number verified successfully.',
  });
});

/**
 * 4. POST /api/auth/resend-verification
 * Resends email or SMS verification codes
 */
authRouter.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  const { email, type = 'email' } = req.body;

  if (!email || !validateEmail(email)) {
    res.status(400).json({ error: 'Valid email address is required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // Generic response to prevent enumeration
    res.json({ success: true, message: 'If an unverified account exists, a new verification code has been dispatched.' });
    return;
  }

  if (type === 'email' && user.isEmailVerified) {
    res.json({ success: true, message: 'Account email is already verified. You can sign in.' });
    return;
  }

  // Invalidate previous tokens
  db.invalidateUserTokens(user.id, type === 'email' ? 'email_verify' : 'phone_verify');

  if (type === 'email') {
    const rawToken = generateSecureToken();
    const otp = generateNumericOtp(6);
    db.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      otpCode: otp,
      type: 'email_verify',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
    });

    const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appBaseUrl}/?verify_email=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await sendEmailNotification({
      to: user.email,
      subject: 'New Verification Code - MediMate AI',
      content: `Your new verification code is: ${otp}\nOr click: ${link}`,
      otp,
      link,
    });
  } else {
    const otp = generateNumericOtp(6);
    db.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(otp),
      otpCode: otp,
      type: 'phone_verify',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      usedAt: null,
    });

    await sendSmsNotification({
      to: user.phoneNumber,
      message: `Your new MediMate AI mobile verification OTP is ${otp}. Valid for 10 minutes.`,
      otp,
    });
  }

  res.json({
    success: true,
    message: 'If an unverified account exists, a new verification code has been dispatched.',
  });
});

/**
 * 5. POST /api/auth/login
 * Secure authentication with rate limiting, lockout safeguard, and HttpOnly cookies
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Both Email Address and Password are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Rate Limiter / Account Lockout
    const lockout = checkLoginLockout(cleanEmail);
    if (lockout.isLocked) {
      db.recordAuthAuditLog({
        userId: null,
        email: cleanEmail,
        action: 'account_locked',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MediMate Web Client',
        status: 'blocked',
        metadata: { remainingMinutes: lockout.remainingMinutes },
      });

      res.status(429).json({
        error: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockout.remainingMinutes} minutes or reset your password.`,
        code: 'ACCOUNT_LOCKED',
        remainingMinutes: lockout.remainingMinutes,
      });
      return;
    }

    // 2. Lookup User
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      const attempt = recordFailedLoginAttempt(cleanEmail);
      db.recordAuthAuditLog({
        userId: null,
        email: cleanEmail,
        action: 'login_failed',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MediMate Web Client',
        status: 'failure',
      });

      res.status(401).json({
        error: 'Invalid email address or password. Please verify your credentials.',
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: attempt.attemptsRemaining,
      });
      return;
    }

    // 3. Verify Password Hash with bcrypt
    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      const attempt = recordFailedLoginAttempt(cleanEmail);
      db.recordFailedLogin(user.id, attempt.locked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null);

      db.recordAuthAuditLog({
        userId: user.id,
        email: cleanEmail,
        action: 'login_failed',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MediMate Web Client',
        status: 'failure',
      });

      if (attempt.locked) {
        res.status(429).json({
          error: 'Too many consecutive failed login attempts. For your security, this account is temporarily locked for 15 minutes.',
          code: 'ACCOUNT_LOCKED',
        });
        return;
      }

      res.status(401).json({
        error: 'Invalid email address or password. Please verify your credentials.',
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: attempt.attemptsRemaining,
      });
      return;
    }

    // 4. Enforce Email Verification Policy
    // Configurable via REQUIRE_EMAIL_VERIFICATION (default true for healthcare privacy)
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false';
    if (requireEmailVerification && !user.isEmailVerified) {
      res.status(403).json({
        error: 'Email verification is required before logging into MediMate AI. Please verify your email with the OTP sent to your inbox.',
        code: 'EMAIL_UNVERIFIED',
        email: user.email,
        requiresEmailVerification: true,
      });
      return;
    }

    // 5. Success: Clear failed attempts
    clearFailedLoginAttempts(cleanEmail);
    db.resetFailedLogin(user.id);

    // 6. Generate Secure Session Token
    const rawSessionToken = generateSecureToken();
    const sessionTokenHash = hashToken(rawSessionToken);

    // Expiration: 30 days if rememberMe, otherwise 24 hours
    const sessionTtlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionTtlMs).toISOString();

    const session = db.createSession({
      userId: user.id,
      tokenHash: sessionTokenHash,
      userAgent: req.headers['user-agent'] || 'MediMate Client',
      ipAddress: req.ip || '127.0.0.1',
      expiresAt,
      rememberMe: Boolean(rememberMe),
    });

    // 7. Set Secure HttpOnly Cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('medimate_session', rawSessionToken, {
      httpOnly: true,
      secure: isProd, // HTTPS in production
      sameSite: 'lax',
      maxAge: sessionTtlMs,
      path: '/',
    });

    // 8. Record Audit Log
    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: 'login_success',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'MediMate Web Client',
      status: 'success',
      metadata: { sessionId: session.id, rememberMe: Boolean(rememberMe) },
    });

    res.json({
      success: true,
      message: 'Sign in successful. Welcome to MediMate AI.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      token: rawSessionToken, // Also provided in response payload for API/Mobile integration
      sessionToken: rawSessionToken,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during sign in' });
  }
});

/**
 * 6. POST /api/auth/logout
 * Secure session invalidation and cookie clearance
 */
authRouter.post('/logout', authenticateUser, (req: Request, res: Response): void => {
  if (req.user && req.user.sessionId) {
    db.deleteSession(req.user.sessionId);

    db.recordAuthAuditLog({
      userId: req.user.id,
      email: req.user.email,
      action: 'logout',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'MediMate Web Client',
      status: 'success',
    });
  }

  res.clearCookie('medimate_session', { path: '/' });
  res.json({ success: true, message: 'You have been successfully signed out.' });
});

/**
 * 7. GET /api/auth/me
 * Retrieves current authenticated user context
 */
authRouter.get('/me', authenticateUser, (req: Request, res: Response): void => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

/**
 * 8. POST /api/auth/forgot-password
 * Generic response to prevent account disclosure
 */
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // Generic security confirmation response
  const genericResponse = {
    success: true,
    message: 'If an account exists with that email address, password recovery instructions and a secure reset code have been dispatched.',
  };

  if (!email || !validateEmail(email)) {
    res.json(genericResponse);
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.json(genericResponse);
    return;
  }

  // Invalidate any previous reset tokens for this user
  db.invalidateUserTokens(user.id, 'password_reset');

  // Generate single-use reset token and 6-digit OTP
  const rawResetToken = generateSecureToken();
  const resetOtp = generateNumericOtp(6);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.createVerificationToken({
    userId: user.id,
    tokenHash: hashToken(rawResetToken),
    otpCode: resetOtp,
    type: 'password_reset',
    expiresAt,
    usedAt: null,
  });

  const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetLink = `${appBaseUrl}/?reset_token=${rawResetToken}&email=${encodeURIComponent(user.email)}`;

  await sendEmailNotification({
    to: user.email,
    subject: 'MediMate AI - Password Reset Request',
    content: `Hello ${user.fullName},\n\nA password reset was requested for your MediMate AI account.\n\nYour reset OTP code is: ${resetOtp}\nOr click the reset link: ${resetLink}\n\nThis code expires in 1 hour. If you did not request this, please ignore this email.`,
    otp: resetOtp,
    link: resetLink,
  });

  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: 'password_reset_request',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'MediMate Web Client',
    status: 'success',
  });

  res.json(genericResponse);
});

/**
 * 9. POST /api/auth/reset-password
 * Completes password reset, enforces policy, invalidates tokens, and invalidates all active sessions
 */
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, otp, newPassword, confirmPassword } = req.body;

    if (!email || (!token && !otp)) {
      res.status(400).json({ error: 'Email and valid reset token or OTP code are required' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired password reset request', code: 'INVALID_RESET_REQUEST' });
      return;
    }

    // Verify token or OTP
    let tokenRecord;
    if (token) {
      tokenRecord = db.findVerificationToken(hashToken(token), 'password_reset');
    } else if (otp) {
      tokenRecord = db.findVerificationOtp(user.id, otp.trim(), 'password_reset');
    }

    if (!tokenRecord || tokenRecord.userId !== user.id) {
      res.status(400).json({
        error: 'Invalid or expired password reset code. Please submit a new request.',
        code: 'INVALID_RESET_TOKEN',
      });
      return;
    }

    // Password policy check
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      res.status(400).json({
        error: passwordCheck.errors[0] || 'Password does not meet security requirements',
        details: passwordCheck.errors,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New Password and Confirm Password do not match' });
      return;
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    db.updateUser(user.id, { passwordHash: newHash });

    // Consume reset token
    db.consumeToken(tokenRecord.id);

    // CRITICAL SECURITY REQUIREMENT: Invalidate all existing sessions on password reset
    db.deleteAllUserSessions(user.id);

    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: 'password_reset_success',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'MediMate Web Client',
      status: 'success',
    });

    res.clearCookie('medimate_session', { path: '/' });

    res.json({
      success: true,
      message: 'Password has been reset successfully. All existing sessions have been terminated. Please sign in with your new credentials.',
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * 10. POST /api/auth/change-password
 * Authenticated password change
 */
authRouter.post('/change-password', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = db.getUserById(req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentMatches = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentMatches) {
      res.status(400).json({ error: 'Current password does not match records' });
      return;
    }

    const check = validatePassword(newPassword);
    if (!check.isValid) {
      res.status(400).json({ error: check.errors[0], details: check.errors });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New password and confirm password do not match' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    db.updateUser(user.id, { passwordHash: newHash });

    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: 'password_change',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'MediMate Web Client',
      status: 'success',
    });

    res.json({ success: true, message: 'Password successfully updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * 11. GET /api/auth/audit-logs
 * Security audit trail (Admin or Self)
 */
authRouter.get('/audit-logs', authenticateUser, (req: Request, res: Response): void => {
  if (req.user!.role === 'admin') {
    res.json(db.getAuthAuditLogs());
  } else {
    res.json(db.getAuthAuditLogs(req.user!.id));
  }
});

/**
 * 12. GET /api/auth/dev-notifications
 * Development test helper: inspect simulated OTPs and links
 */
authRouter.get('/dev-notifications', (_req: Request, res: Response): void => {
  res.json(getRecentSimulatedNotifications());
});
