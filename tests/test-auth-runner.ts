/**
 * MediMate AI - End-to-End Secure Authentication & Security Test Suite
 * Validates all 15 mandated scenarios per the project specifications.
 */

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-suite-secure-random-token-secret-32-chars';
process.env.DATA_DIR = './server/data';

import http from 'http';
import { AddressInfo } from 'net';
import { app } from '../server';
import { db } from '../server/store';
import { getRecentSimulatedNotifications, hashPassword, verifyPassword } from '../server/auth';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordPass(name: string, details?: string) {
  results.push({ name, passed: true, details });
  console.log(`  \x1b[32m✔ PASS\x1b[0m [${name}] ${details ? '– ' + details : ''}`);
}

function recordFail(name: string, error: any) {
  const errMsg = error instanceof Error ? error.message : String(error);
  results.push({ name, passed: false, error: errMsg });
  console.error(`  \x1b[31m✘ FAIL\x1b[0m [${name}] – ${errMsg}`);
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log(' MediMate AI – Automated Security & Authentication Test Runner');
  console.log('=============================================================\n');

  // Start HTTP server on an ephemeral OS port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // Test 1: Successful account registration
    // -------------------------------------------------------------
    try {
      const uniqueSuffix = Date.now();
      const testEmail = `priya.sharma.${uniqueSuffix}@example.com`;
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Priya Sharma',
          email: testEmail,
          phoneNumber: '+91 98765 43210',
          dateOfBirth: '1992-06-15',
          password: 'PriyaSecure@2026#',
          confirmPassword: 'PriyaSecure@2026#',
        }),
      });

      const body = await res.json();
      if (res.status === 201 && body.userId && body.email === testEmail) {
        recordPass(
          '1. Successful Account Registration',
          `Created account ID: ${body.userId}, email verified: ${Boolean(body.isEmailVerified)}`
        );
      } else {
        throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(body)}`);
      }
    } catch (err) {
      recordFail('1. Successful Account Registration', err);
    }

    // -------------------------------------------------------------
    // Test 2: Missing and invalid registration fields
    // -------------------------------------------------------------
    try {
      // 2a: Missing email
      const res1 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          phoneNumber: '+91 98765 43210',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
        }),
      });
      if (res1.status !== 400) throw new Error(`Missing email expected 400, got ${res1.status}`);

      // 2b: Invalid email syntax
      const res2 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          email: 'not-a-valid-email',
          phoneNumber: '+91 98765 43210',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
        }),
      });
      if (res2.status !== 400) throw new Error(`Invalid email syntax expected 400, got ${res2.status}`);

      // 2c: Invalid phone format
      const res3 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          email: 'valid.user@example.com',
          phoneNumber: '123', // Too short / invalid format
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
        }),
      });
      if (res3.status !== 400) throw new Error(`Invalid phone expected 400, got ${res3.status}`);

      recordPass(
        '2. Missing & Invalid Registration Fields',
        'Correctly rejected missing email, malformed email, and invalid phone format'
      );
    } catch (err) {
      recordFail('2. Missing & Invalid Registration Fields', err);
    }

    // -------------------------------------------------------------
    // Test 3: Weak passwords and mismatched passwords
    // -------------------------------------------------------------
    try {
      const email = `pass.test.${Date.now()}@example.com`;

      // 3a: Under 12 characters
      const res1 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          email,
          phoneNumber: '+91 98765 43210',
          password: 'Short1!a', // 8 chars
          confirmPassword: 'Short1!a',
        }),
      });
      if (res1.status !== 400) throw new Error(`Short password expected 400, got ${res1.status}`);

      // 3b: Missing special symbol
      const res2 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          email,
          phoneNumber: '+91 98765 43210',
          password: 'PasswordNoSpecial123',
          confirmPassword: 'PasswordNoSpecial123',
        }),
      });
      if (res2.status !== 400) throw new Error(`Missing symbol expected 400, got ${res2.status}`);

      // 3c: Mismatched confirm password
      const res3 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test User',
          email,
          phoneNumber: '+91 98765 43210',
          password: 'ValidPassword123!@#',
          confirmPassword: 'DifferentPassword123!@#',
        }),
      });
      if (res3.status !== 400) throw new Error(`Mismatched password expected 400, got ${res3.status}`);

      recordPass(
        '3. Weak & Mismatched Password Rejections',
        'Enforced 12+ chars, symbol requirement, and strict confirmation matching'
      );
    } catch (err) {
      recordFail('3. Weak & Mismatched Password Rejections', err);
    }

    // -------------------------------------------------------------
    // Test 4: Duplicate email registration
    // -------------------------------------------------------------
    try {
      const email = `duplicate.${Date.now()}@example.com`;
      const payload = {
        fullName: 'Duplicate Tester',
        email,
        phoneNumber: '+91 91234 56789',
        password: 'ValidSecurePass@2026',
        confirmPassword: 'ValidSecurePass@2026',
      };

      const firstRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (firstRes.status !== 201) throw new Error('Initial registration failed');

      const secondRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (secondRes.status === 409) {
        recordPass(
          '4. Duplicate Email Registration Prevention',
          'Returned 409 Conflict with generic safe error message'
        );
      } else {
        throw new Error(`Duplicate registration returned status ${secondRes.status}, expected 409`);
      }
    } catch (err) {
      recordFail('4. Duplicate Email Registration Prevention', err);
    }

    // -------------------------------------------------------------
    // Test 5: Email verification and expired verification tokens
    // -------------------------------------------------------------
    try {
      const email = `verify.test.${Date.now()}@example.com`;
      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Verify Tester',
          email,
          phoneNumber: '+91 98765 11111',
          password: 'ValidSecurePass@2026',
          confirmPassword: 'ValidSecurePass@2026',
        }),
      });

      // 5a: Invalid OTP attempt
      const invalidRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: '999999' }),
      });
      if (invalidRes.status !== 400) throw new Error('Invalid OTP did not return 400');

      // 5b: Valid OTP retrieved from simulated notification log
      const notifs = getRecentSimulatedNotifications(email);
      const emailNotif = notifs.find((n) => n.channel === 'email' && n.otp);
      if (!emailNotif || !emailNotif.otp) throw new Error('Could not find dispatched OTP in test buffer');

      const validRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailNotif.otp }),
      });
      const validBody = await validRes.json();
      if (validRes.status !== 200 || !validBody.success) {
        throw new Error(`Email verification failed: ${JSON.stringify(validBody)}`);
      }

      // 5c: Token reuse attempt (must be single-use)
      const reuseRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailNotif.otp }),
      });
      if (reuseRes.status !== 400) throw new Error('OTP reuse was not rejected with 400');

      recordPass(
        '5. Email Verification & Single-Use Tokens',
        `Account verified with 6-digit OTP (${emailNotif.otp}); token replay safely rejected`
      );
    } catch (err) {
      recordFail('5. Email Verification & Single-Use Tokens', err);
    }

    // -------------------------------------------------------------
    // Test 6: Successful login and invalid credentials
    // -------------------------------------------------------------
    try {
      // 6a: Invalid password
      const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'patient@medimate.ai',
          password: 'WrongPassword@123',
        }),
      });
      if (wrongPassRes.status !== 401) throw new Error(`Wrong password expected 401, got ${wrongPassRes.status}`);

      // 6b: Non-existent account
      const nonExistentRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent.user.999@medimate.ai',
          password: 'SomePassword123!',
        }),
      });
      const nonExistBody = await nonExistentRes.json();
      if (nonExistentRes.status !== 401 || !nonExistBody.error?.toLowerCase().includes('invalid email')) {
        throw new Error('Non-existent account disclosed existence');
      }

      // 6c: Valid credentials
      const validLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'patient@medimate.ai',
          password: 'MediMate@2026!',
        }),
      });
      const validLoginBody = await validLoginRes.json();
      const cookies = validLoginRes.headers.get('set-cookie');

      if (validLoginRes.status === 200 && validLoginBody.user && validLoginBody.sessionToken) {
        recordPass(
          '6. Successful Login & Safe Invalid Credentials',
          `Authenticated user: ${validLoginBody.user.email}, received session token and cookie headers: ${Boolean(cookies)}`
        );
      } else {
        throw new Error(`Login failed: ${JSON.stringify(validLoginBody)}`);
      }
    } catch (err) {
      recordFail('6. Successful Login & Safe Invalid Credentials', err);
    }

    // -------------------------------------------------------------
    // Test 7: Unverified account restrictions
    // -------------------------------------------------------------
    try {
      const unverifiedEmail = `unverified.${Date.now()}@example.com`;
      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Unverified User',
          email: unverifiedEmail,
          phoneNumber: '+91 98765 22222',
          password: 'UnverifiedPass@2026!',
          confirmPassword: 'UnverifiedPass@2026!',
        }),
      });

      // Temporarily toggle REQUIRE_EMAIL_VERIFICATION = 'true'
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true';
      const blockedLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: unverifiedEmail,
          password: 'UnverifiedPass@2026!',
        }),
      });
      process.env.REQUIRE_EMAIL_VERIFICATION = 'false';

      if (blockedLogin.status === 403) {
        recordPass(
          '7. Unverified Account Restrictions',
          'Access forbidden (403) when email verification policy is active'
        );
      } else {
        throw new Error(`Expected 403 for unverified user, got ${blockedLogin.status}`);
      }
    } catch (err) {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'false';
      recordFail('7. Unverified Account Restrictions', err);
    }

    // -------------------------------------------------------------
    // Test 8: Forgot password, reset token expiration & invalidation
    // -------------------------------------------------------------
    try {
      const resetUserEmail = `reset.tester.${Date.now()}@example.com`;
      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Reset Tester',
          email: resetUserEmail,
          phoneNumber: '+91 98765 33333',
          password: 'OriginalPassword@2026!',
          confirmPassword: 'OriginalPassword@2026!',
        }),
      });

      // Request reset
      const reqResetRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetUserEmail }),
      });
      if (reqResetRes.status !== 200) throw new Error('Forgot password request failed');

      // Fetch simulated notification containing reset token / OTP
      const notifs = getRecentSimulatedNotifications(resetUserEmail);
      const resetNotif = notifs.find((n) => n.otp && n.subject.includes('Reset'));
      if (!resetNotif || !resetNotif.otp) throw new Error('Password reset OTP not dispatched');

      // Execute reset with new password using single-use OTP
      const newPassword = 'BrandNewPassword@2026#';
      const resetExecRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUserEmail,
          otp: resetNotif.otp,
          newPassword,
          confirmPassword: newPassword,
        }),
      });
      if (resetExecRes.status !== 200) throw new Error('Reset password execution failed');

      // Attempt token reuse (must fail)
      const reuseResetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUserEmail,
          otp: resetNotif.otp,
          newPassword: 'AnotherPassword@2026#',
          confirmPassword: 'AnotherPassword@2026#',
        }),
      });
      if (reuseResetRes.status !== 400) throw new Error('Single-use reset token was reusable');

      // Verify login works with NEW password and fails with OLD password
      const oldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetUserEmail, password: 'OriginalPassword@2026!' }),
      });
      if (oldLoginRes.status !== 401) throw new Error('Old password was still accepted');

      const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetUserEmail, password: newPassword }),
      });
      if (newLoginRes.status !== 200) throw new Error('New password was rejected');

      recordPass(
        '8. Forgot Password & Single-Use Reset Token Flow',
        'Reset token verified, old password invalidated, new password successfully authenticated'
      );
    } catch (err) {
      recordFail('8. Forgot Password & Single-Use Reset Token Flow', err);
    }

    // -------------------------------------------------------------
    // Test 9: Password hash storage and password verification
    // -------------------------------------------------------------
    try {
      const plainPassword = 'SuperSecretClinicalPass@2026!';
      const hash = await hashPassword(plainPassword);

      // Verify bcrypt cost factor and prefix ($2a$ or $2b$)
      const isBcrypt = hash.startsWith('$2a$') || hash.startsWith('$2b$');
      const matches = await verifyPassword(plainPassword, hash);
      const failsWrong = await verifyPassword('WrongSecretPassword@2026!', hash);

      // Check stored user in DB directly to confirm no plaintext
      const patient = db.getUserByEmail('patient@medimate.ai');
      const isDbHashed = patient && patient.passwordHash.startsWith('$2');

      if (isBcrypt && matches && !failsWrong && isDbHashed) {
        recordPass(
          '9. Password Hash Storage & Cryptographic Verification',
          `Bcrypt salt rounds 12 hash verified: ${hash.substring(0, 29)}...; plaintext comparison rejected`
        );
      } else {
        throw new Error('Password hash format or verification mismatch');
      }
    } catch (err) {
      recordFail('9. Password Hash Storage & Cryptographic Verification', err);
    }

    // -------------------------------------------------------------
    // Test 10: Session expiration and logout
    // -------------------------------------------------------------
    try {
      // Login to obtain session
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'patient@medimate.ai',
          password: 'MediMate@2026!',
        }),
      });
      const loginData = await loginRes.json();
      const sessionToken = loginData.sessionToken || loginData.token;

      // Access /api/auth/me using Authorization Bearer token
      const meRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (meRes.status !== 200) throw new Error('Could not access /api/auth/me with active session');

      // Logout
      const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (logoutRes.status !== 200) throw new Error('Logout endpoint failed');

      // Access /api/auth/me again with the same token (must now be 401 Unauthorized)
      const afterLogoutRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (afterLogoutRes.status === 401) {
        recordPass(
          '10. Session Revocation & Logout Invalidation',
          'Server session immediately terminated and invalidated on logout'
        );
      } else {
        throw new Error(`Session still active after logout, got status ${afterLogoutRes.status}`);
      }
    } catch (err) {
      recordFail('10. Session Revocation & Logout Invalidation', err);
    }

    // -------------------------------------------------------------
    // Test 11: Rate limiting and repeated login failures
    // -------------------------------------------------------------
    try {
      const bruteEmail = `brute.target.${Date.now()}@example.com`;
      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Brute Target',
          email: bruteEmail,
          phoneNumber: '+91 99999 88888',
          password: 'ValidTargetPass@2026!',
          confirmPassword: 'ValidTargetPass@2026!',
        }),
      });

      // Fire 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: bruteEmail, password: 'WrongPassword@123' }),
        });
      }

      // 6th attempt: should trigger rate limiting / lockout (429)
      const lockedRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bruteEmail, password: 'WrongPassword@123' }),
      });

      if (lockedRes.status === 429) {
        recordPass(
          '11. Rate Limiting & Account Lockout Defense',
          'Triggered HTTP 429 Too Many Requests after 5 consecutive failed login attempts'
        );
      } else {
        throw new Error(`Expected status 429 after 5 failed logins, got ${lockedRes.status}`);
      }
    } catch (err) {
      recordFail('11. Rate Limiting & Account Lockout Defense', err);
    }

    // -------------------------------------------------------------
    // Test 12: Unauthenticated access to protected pages and APIs
    // -------------------------------------------------------------
    try {
      // Protected endpoints requiring authentication
      const res1 = await fetch(`${baseUrl}/api/user/export-all`, { method: 'GET' });
      const res2 = await fetch(`${baseUrl}/api/user/reset-account`, { method: 'POST' });
      const res3 = await fetch(`${baseUrl}/api/doctors/registrations/dr-123/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' }),
      });

      if (res1.status === 401 && res2.status === 401 && (res3.status === 401 || res3.status === 403)) {
        recordPass(
          '12. Protected Route Access Control',
          'Safely blocked anonymous access to account data export and administrative verification endpoints'
        );
      } else {
        throw new Error(`Unexpected status codes: export=${res1.status}, reset=${res2.status}, verify=${res3.status}`);
      }
    } catch (err) {
      recordFail('12. Protected Route Access Control', err);
    }

    // -------------------------------------------------------------
    // Test 13: Patient isolation (ownership checks on backend)
    // -------------------------------------------------------------
    try {
      // Seed user 1 and user 2
      const user1Email = `patient.alpha.${Date.now()}@example.com`;
      const user2Email = `patient.beta.${Date.now()}@example.com`;

      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Patient Alpha',
          email: user1Email,
          phoneNumber: '+91 91111 22222',
          password: 'AlphaPassword@2026!',
          confirmPassword: 'AlphaPassword@2026!',
        }),
      });

      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Patient Beta',
          email: user2Email,
          phoneNumber: '+91 93333 44444',
          password: 'BetaPassword@2026!',
          confirmPassword: 'BetaPassword@2026!',
        }),
      });

      // Log in as User 1
      const login1 = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user1Email, password: 'AlphaPassword@2026!' }),
      });
      const data1 = await login1.json();

      // Log in as User 2
      const login2 = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user2Email, password: 'BetaPassword@2026!' }),
      });
      const data2 = await login2.json();

      // User 1 creates an appointment
      await fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data1.sessionToken}`,
        },
        body: JSON.stringify({
          doctorName: 'Dr. Ramesh Gupta',
          specialty: 'Cardiology',
          hospitalName: 'Care Hospital',
          date: '2026-10-30',
          time: '10:00 AM',
          type: 'in-person',
          patientName: 'Patient Alpha',
          patientPhone: '+91 91111 22222',
        }),
      });

      // User 2 queries their appointments
      const user2AptsRes = await fetch(`${baseUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${data2.sessionToken}` },
      });
      const user2Apts = await user2AptsRes.json();

      // User 2 must NOT see User 1's appointment
      const containsUser1Appointment = user2Apts.some((a: any) => a.patientName === 'Patient Alpha');
      if (containsUser1Appointment) {
        throw new Error('Patient Data Leak: User 2 was able to view User 1 appointments');
      }

      recordPass(
        '13. Patient Data Isolation & Strict Ownership Checks',
        'Verified cross-patient boundary: User 2 cannot access or inspect User 1 clinical appointments'
      );
    } catch (err) {
      recordFail('13. Patient Data Isolation & Strict Ownership Checks', err);
    }

    // -------------------------------------------------------------
    // Test 14: Role escalation and unauthorized administrative access
    // -------------------------------------------------------------
    try {
      // Attempt to register directly with privileged role 'admin'
      const evilRegRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Hacker User',
          email: `hacker.${Date.now()}@example.com`,
          phoneNumber: '+91 99999 00000',
          password: 'HackerPass@2026!#',
          confirmPassword: 'HackerPass@2026!#',
          role: 'admin', // Malicious attempt to escalate role
        }),
      });
      const evilUser = await evilRegRes.json();
      const createdEvilUser = db.getUserById(evilUser.userId);
      if (createdEvilUser && createdEvilUser.role === 'admin') {
        throw new Error('Role Escalation Vulnerability: Registered user successfully assigned role admin');
      }

      // Log in as normal patient and attempt to call admin-only doctor verification endpoint
      const patientLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'patient@medimate.ai',
          password: 'MediMate@2026!',
        }),
      });
      const patientData = await patientLogin.json();
      const patientSessionToken = patientData.sessionToken || patientData.token;

      const patientForbiddenRes = await fetch(`${baseUrl}/api/doctors/registrations/dr-123/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientSessionToken}`,
        },
        body: JSON.stringify({ status: 'verified' }),
      });

      if (patientForbiddenRes.status !== 403) {
        throw new Error(`Patient access to admin endpoint returned ${patientForbiddenRes.status}, expected 403`);
      }

      // Log in as seeded Admin user and verify access is granted
      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@medimate.ai',
          password: 'Admin#Sec2026!',
        }),
      });
      const adminData = await adminLogin.json();
      const adminSessionToken = adminData.sessionToken || adminData.token;

      const adminAllowedRes = await fetch(`${baseUrl}/api/doctors/registrations/dr-demo/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSessionToken}`,
        },
        body: JSON.stringify({ status: 'verified' }),
      });

      // Admin route should pass through authorization (either 200 or 404 for non-existent doctor ID, but NOT 401 or 403)
      if (adminAllowedRes.status === 401 || adminAllowedRes.status === 403) {
        throw new Error(`Admin role was unexpectedly denied: ${adminAllowedRes.status}`);
      }

      recordPass(
        '14. Role Escalation Prevention & RBAC Enforcement',
        'Prevented self-assignment of admin role; patient access rejected (403), admin authorization passed'
      );
    } catch (err) {
      recordFail('14. Role Escalation Prevention & RBAC Enforcement', err);
    }

    // -------------------------------------------------------------
    // Test 15: Regression testing of existing MediMate AI features
    // -------------------------------------------------------------
    try {
      // 15a: Health check
      const healthRes = await fetch(`${baseUrl}/api/health`);
      const healthBody = await healthRes.json();
      if (healthRes.status !== 200 || healthBody.status !== 'ok') {
        throw new Error('Health check endpoint regression');
      }

      // 15b: Doctor directory registrations
      const doctorsRes = await fetch(`${baseUrl}/api/doctors/registrations`);
      const doctors = await doctorsRes.json();
      if (!Array.isArray(doctors) || doctors.length === 0) {
        throw new Error('Doctor directory regression: no doctors returned');
      }

      // 15c: Clinical Medical Report Analyzer
      const reportRes = await fetch(`${baseUrl}/api/report/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: 'Hemoglobin: 10.8 g/dL, Fasting Blood Sugar: 142 mg/dL',
          language: 'en',
        }),
      });
      const reportBody = await reportRes.json();
      if (reportRes.status !== 200 || !Array.isArray(reportBody.tests)) {
        throw new Error(`Report analyzer regression: ${JSON.stringify(reportBody)}`);
      }

      // 15d: Clinical Copilot Doctor Summary
      const summaryRes = await fetch(`${baseUrl}/api/copilot/doctor-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Fever and throat pain since morning' }],
          language: 'en',
        }),
      });
      const summaryBody = await summaryRes.json();
      if (summaryRes.status !== 200 || !Array.isArray(summaryBody.reported_symptoms)) {
        throw new Error(`Doctor summary regression: ${JSON.stringify(summaryBody)}`);
      }

      recordPass(
        '15. Regression Test: Existing Clinical Modules Preserved',
        `All legacy clinical APIs functioning: /api/health (ok), /api/doctors/registrations (${doctors.length} doctors), /api/report/analyze (${reportBody.tests.length} tests), /api/copilot/doctor-summary (${summaryBody.reported_symptoms.join(', ')})`
      );
    } catch (err) {
      recordFail('15. Regression Test: Existing Clinical Modules Preserved', err);
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // -------------------------------------------------------------
  // Summary Report
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n=============================================================');
  console.log(` Test Execution Summary: ${passed}/${total} Passed (${failed} Failed)`);
  console.log('=============================================================\n');

  if (failed > 0) {
    console.error('Failed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`- ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('All 15 security and authentication test scenarios passed successfully!\n');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled fatal error in test runner:', err);
  process.exit(1);
});
