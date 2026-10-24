import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DATA_DIR = path.resolve(__dirname, 'data');
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : DEFAULT_DATA_DIR);
const DB_FILE = path.join(DATA_DIR, 'medmit-database.json');

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockUntil?: string | null;
  consents: {
    terms: boolean;
    privacyPolicy: boolean;
    aiHealthProcessing: boolean;
    timestamp: string;
  };
}

export interface AuthVerificationTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  otpCode: string;
  type: 'email_verify' | 'phone_verify' | 'password_reset';
  expiresAt: string;
  usedAt?: string | null;
  createdAt: string;
}

export interface SessionRecord {
  id: string; // session ID
  userId: string;
  tokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
  rememberMe: boolean;
}

export interface AuthAuditLogRecord {
  id: string;
  userId?: string | null;
  email: string;
  action:
    | 'register'
    | 'verify_email'
    | 'verify_phone'
    | 'login_success'
    | 'login_failed'
    | 'password_reset_request'
    | 'password_reset_success'
    | 'password_change'
    | 'logout'
    | 'account_locked'
    | 'unauthorized_access';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failure' | 'blocked';
  metadata?: Record<string, any>;
}

export interface ConversationRecord {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
  language: 'en' | 'te';
  hasVoice: boolean;
  triageUrgency?: 'emergency' | 'urgent' | 'routine' | 'self-care';
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  userId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  triage?: any;
  reportContext?: string;
  isVoice?: boolean;
}

export interface VoiceRecord {
  id: string;
  userId?: string;
  conversationId?: string;
  transcript: string;
  timestamp: string;
  durationSeconds: number;
  language: 'en' | 'te';
  hasAudioStorage: boolean;
  audioDataUri?: string; // Stored only if consented
  status: 'transcribed' | 'processed' | 'failed';
}

export interface WellnessRecommendation {
  id: string;
  userId?: string;
  category: 'activity' | 'sleep' | 'hydration' | 'nutrition' | 'stress' | 'preventive' | 'medication';
  title: string;
  description: string;
  rationale: string;
  status: 'active' | 'completed' | 'dismissed' | 'saved';
  priority: 'high' | 'medium' | 'low';
  frequency: 'daily' | 'weekly' | 'custom';
  targetValue?: string;
  currentValue?: string;
  createdAt: string;
}

export interface WellnessPreferences {
  hydrationGoalMl: number;
  sleepGoalHours: number;
  dailyStepsGoal: number;
  focusAreas: string[];
  reminderFrequency: 'hourly' | 'twice_daily' | 'daily' | 'off';
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  title: string;
  message: string;
  category: 'wellness' | 'reminder' | 'risk' | 'system';
  severity: 'info' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export interface RiskFlagRecord {
  id: string;
  userId?: string;
  title: string;
  severity: 'critical' | 'moderate' | 'low';
  category: 'vital' | 'symptom' | 'lab_report' | 'lifestyle';
  description: string;
  ruleTriggered: string;
  evidenceText: string;
  status: 'new' | 'acknowledged' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  notes: { timestamp: string; note: string; author: string }[];
  actionRequired: string;
}

export interface ReminderRecord {
  id: string;
  userId?: string;
  title: string;
  type: 'medication' | 'hydration' | 'vitals' | 'activity' | 'appointment';
  time: string;
  daysOfWeek: string[];
  dosageOrDetail?: string;
  active: boolean;
  completedToday: boolean;
  lastCompletedDate?: string;
}

export interface AppointmentRecord {
  id: string;
  userId?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  type: 'in-clinic' | 'video';
  reason: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AbhaProfile {
  isLinked: boolean;
  mode: 'mock_sandbox';
  abhaNumber?: string;
  abhaAddress?: string;
  name?: string;
  gender?: string;
  dob?: string;
  mobile?: string;
  linkedFacility?: string;
  linkedDate?: string;
  activeConsentArtifacts: number;
}

export interface AbhaAuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'SUCCESS' | 'MOCK_VERIFIED' | 'REVOKED';
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  languagePreference: 'en' | 'te' | 'hi' | 'ta' | 'kn';
  consentAiAnalysis: boolean;
  consentVoiceStorage: boolean;
  consentAbhaSharing: boolean;
  consentNotifications: boolean;
}

export type DoctorVerificationStatus =
  | 'draft'
  | 'submitted'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface DoctorRegistrationRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  medicalCouncilNumber: string;
  stateMedicalCouncil: string;
  registrationYear: number;
  qualifications: string;
  primarySpecialty: string;
  subSpecialties: string[];
  experienceYears: number;
  currentHospitalOrClinic: string;
  consultationFee: number;
  isRetired: boolean;
  teleconsultationAdvisoryOnly?: boolean;
  verificationStatus: DoctorVerificationStatus;
  nmcVerificationVerified: boolean;
  documentName?: string;
  submittedAt: string;
  verifiedAt?: string;
  auditNotes: string[];
}

export interface ConsultationSessionRecord {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  scheduledTime: string;
  status: 'waiting' | 'in_progress' | 'completed';
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  clinicalNotes: string;
  prescriptionSummary?: string;
  followUpDate?: string;
  vitalsDiscussed?: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
  };
}

export interface AbhaHealthRecord {
  id: string;
  careContextReference: string;
  hiType: 'OPConsultation' | 'DiagnosticReport' | 'Prescription' | 'DischargeSummary';
  documentName: string;
  facilityName: string;
  date: string;
  doctorName: string;
  department: string;
  status: 'available' | 'retrieved';
  downloadUrl?: string;
  summary: string;
  keyFindings: string[];
}

export interface DatabaseSchema {
  version: number;
  users: UserRecord[];
  verificationTokens: AuthVerificationTokenRecord[];
  sessions: SessionRecord[];
  authAuditLogs: AuthAuditLogRecord[];
  userProfile: UserProfile;
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  voiceRecords: VoiceRecord[];
  wellnessRecommendations: WellnessRecommendation[];
  wellnessPreferences: WellnessPreferences;
  notifications: NotificationRecord[];
  riskFlags: RiskFlagRecord[];
  reminders: ReminderRecord[];
  appointments: AppointmentRecord[];
  abhaProfile: AbhaProfile;
  abhaAuditLogs: AbhaAuditLog[];
  doctorRegistrations: DoctorRegistrationRecord[];
  consultationSessions: ConsultationSessionRecord[];
  abhaHealthRecords: AbhaHealthRecord[];
}

// Seed default initial state with realistic clinical demo data
function getInitialDatabaseState(): DatabaseSchema {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    version: 3,
    users: [
      {
        id: 'usr-seed-patient-001',
        fullName: 'K. S. Sharma',
        email: 'patient@medimate.ai',
        phoneNumber: '+91 98480 12345',
        dateOfBirth: '1978-05-14',
        passwordHash: '$2b$12$7QtOUWYaqWS0DS7ILWMgLuBSzo9QXfTLNgbJuqF1fdxgbvoWUHaq.', // MediMate@2026!
        role: 'patient',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 3600000 * 240).toISOString(),
        },
      },
      {
        id: 'usr-seed-doctor-001',
        fullName: 'Dr. Ramesh Gupta, MD, DM',
        email: 'dr.ramesh.gupta@carehospital.in',
        phoneNumber: '+91 98490 23456',
        passwordHash: '$2b$12$xa6MRNjyhVhAPjHzw/0sueZO2eryfML/ciChwuSqOa2T/z7srilWe', // Doctor@Care2026!
        role: 'doctor',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 3600000 * 480).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 3600000 * 480).toISOString(),
        },
      },
      {
        id: 'usr-seed-admin-001',
        fullName: 'System Security Administrator',
        email: 'admin@medimate.ai',
        phoneNumber: '+91 99999 88888',
        passwordHash: '$2b$12$A9bH5hSueYD8grzMBnDVHuxjIy7eCKAUySU0oATvM6ylHvSpS4ykW', // Admin#Sec2026!
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 3600000 * 720).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 3600000 * 720).toISOString(),
        },
      },
    ],
    verificationTokens: [],
    sessions: [],
    authAuditLogs: [
      {
        id: 'log-seed-1',
        userId: 'usr-seed-patient-001',
        email: 'patient@medimate.ai',
        action: 'register',
        ipAddress: '127.0.0.1',
        userAgent: 'MediMate Web Client',
        timestamp: new Date(Date.now() - 3600000 * 240).toISOString(),
        status: 'success',
      },
      {
        id: 'log-seed-2',
        userId: 'usr-seed-patient-001',
        email: 'patient@medimate.ai',
        action: 'verify_email',
        ipAddress: '127.0.0.1',
        userAgent: 'MediMate Web Client',
        timestamp: new Date(Date.now() - 3600000 * 239).toISOString(),
        status: 'success',
      },
    ],
    userProfile: {
      name: 'K. S. Sharma',
      age: 48,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 98480 12345',
      emergencyContactName: 'Lakshmi Sharma (Spouse)',
      emergencyContactPhone: '+91 98480 67890',
      languagePreference: 'en',
      consentAiAnalysis: true,
      consentVoiceStorage: true,
      consentAbhaSharing: true,
      consentNotifications: true,
    },
    conversations: [
      {
        id: 'conv-init-1',
        title: 'Mild fever & throat discomfort triage',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        messageCount: 4,
        lastMessagePreview: 'Hydrate well with warm fluids and monitor temperature if it exceeds 101°F.',
        language: 'en',
        hasVoice: true,
        triageUrgency: 'routine',
      },
      {
        id: 'conv-init-2',
        title: 'రక్తపోటు మరియు అలసటపై సలహా (BP & Fatigue Advice)',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
        messageCount: 3,
        lastMessagePreview: 'జనరల్ ఫిజీషియన్ ని సంప్రదించి బీపీని క్రమం తప్పకుండా నమోదు చేయండి.',
        language: 'te',
        hasVoice: false,
        triageUrgency: 'routine',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-init-1',
        role: 'user',
        content: 'I have had a scratchy throat and low fever (99.8°F) since yesterday morning.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        isVoice: true,
      },
      {
        id: 'msg-2',
        conversationId: 'conv-init-1',
        role: 'assistant',
        content:
          'Thank you for sharing your symptoms. Based on your description of a scratchy throat and low fever (99.8°F), this presents typical viral upper respiratory signs. A General Physician can examine your pharynx and verify whether symptom relief measures are sufficient.',
        timestamp: new Date(Date.now() - 3600000 * 24 + 2000).toISOString(),
        triage: {
          summary: 'Reported onset of scratchy throat and mild fever (99.8°F) for ~24 hours.',
          urgency: 'routine',
          suggested_specialty: 'General Physician',
          reasons_for_specialty:
            'A General Physician can safely differentiate between common viral pharyngitis and bacterial strep throat, recommending appropriate gargles or antipyretics.',
          explanation:
            'Most low-grade fevers with throat discomfort are self-limiting viral episodes, but require clinical evaluation if temperature spikes or breathing is affected.',
          next_steps: [
            'Warm saline gargles 3-4 times a day',
            'Adequate hydration (2.5 - 3 liters warm water)',
            'Monitor body temperature using an oral digital thermometer twice daily',
          ],
          warning_signs: [
            'Difficulty swallowing saliva or opening mouth (trismus)',
            'Stridor or difficulty breathing',
            'Persistent high fever above 102°F exceeding 3 days',
          ],
          show_nearby_care: true,
          suggested_facility_type: 'clinic',
          disclaimer:
            'MediMate AI provides triage guidance and health education. It does not replace clinical diagnosis. In emergencies, call 112.',
        },
      },
    ],
    voiceRecords: [
      {
        id: 'voice-rec-1',
        conversationId: 'conv-init-1',
        transcript: 'I have had a scratchy throat and low fever since yesterday morning.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        durationSeconds: 6,
        language: 'en',
        hasAudioStorage: true,
        status: 'processed',
      },
    ],
    wellnessRecommendations: [
      {
        id: 'rec-1',
        category: 'hydration',
        title: 'Maintain 2.8 Liters Daily Hydration',
        description: 'Drink a glass of water every 90 minutes to maintain optimal cellular hydration and renal function.',
        rationale: 'Active metabolic processes and climate conditions require steady fluid intake to prevent fatigue.',
        status: 'active',
        priority: 'high',
        frequency: 'daily',
        targetValue: '2800 ml',
        currentValue: '1800 ml',
        createdAt: now.toISOString(),
      },
      {
        id: 'rec-2',
        category: 'activity',
        title: '30-Minute Brisk Evening Walk',
        description: 'Moderate cardiovascular exercise improves insulin sensitivity and cardiovascular endurance.',
        rationale: 'Supports glycemic control and reduces arterial stiffness.',
        status: 'active',
        priority: 'medium',
        frequency: 'daily',
        targetValue: '6,000 steps',
        currentValue: '4,200 steps',
        createdAt: now.toISOString(),
      },
      {
        id: 'rec-3',
        category: 'sleep',
        title: 'Sleep Hygiene: Consistent 10:30 PM Wind-down',
        description: 'Limit blue light exposure 45 minutes before bed and target 7-8 hours of uninterrupted restorative sleep.',
        rationale: 'Deep slow-wave sleep regulates cortisol and circadian hormone rhythms.',
        status: 'saved',
        priority: 'medium',
        frequency: 'daily',
        targetValue: '7.5 hrs',
        currentValue: '6.5 hrs',
        createdAt: now.toISOString(),
      },
      {
        id: 'rec-4',
        category: 'preventive',
        title: 'Quarterly Fasting Blood Glucose & HbA1c Check',
        description: 'Schedule routine preventive metabolic blood panel to track long-term glycemic trends.',
        rationale: 'Recommended every 3-6 months for adults over 45 with family history of metabolic risk.',
        status: 'active',
        priority: 'high',
        frequency: 'custom',
        targetValue: 'HbA1c < 6.5%',
        createdAt: now.toISOString(),
      },
    ],
    wellnessPreferences: {
      hydrationGoalMl: 2800,
      sleepGoalHours: 7.5,
      dailyStepsGoal: 6000,
      focusAreas: ['Cardiovascular Health', 'Blood Sugar Balance', 'Stress Resilience'],
      reminderFrequency: 'twice_daily',
    },
    notifications: [
      {
        id: 'notif-1',
        title: 'Hydration Target Reminder',
        message: 'You have logged 1,800 ml so far. Have a glass of water to reach your 2,800 ml daily goal.',
        category: 'wellness',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        read: false,
        actionTab: 'wellness',
      },
      {
        id: 'notif-2',
        title: 'Upcoming Clinical Appointment',
        message: 'Dr. Rajeshwar Rao (General Physician) tomorrow at 10:30 AM at Care Community Clinic.',
        category: 'reminder',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        read: false,
        actionTab: 'appointments',
      },
      {
        id: 'notif-3',
        title: 'ABDM Synthetic Sandbox Connected',
        message: 'Demonstration ABHA ID 91-4458-2910-3819 linked in Mock Mode with consent artifact #ABDM-MOCK-982.',
        category: 'system',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        read: true,
        actionTab: 'abha',
      },
    ],
    riskFlags: [
      {
        id: 'rf-1',
        title: 'Elevated Systolic Blood Pressure Trend',
        severity: 'moderate',
        category: 'vital',
        description: 'Recent logs indicate resting systolic blood pressure between 138-142 mmHg over two consecutive checks.',
        ruleTriggered: 'Systolic BP >= 135 mmHg on repeated measurements (Stage 1 Hypertension Range)',
        evidenceText: 'Patient noted readings of 138/88 mmHg and 142/90 mmHg during evening routine checks.',
        status: 'under_review',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        notes: [
          {
            timestamp: new Date(Date.now() - 3600000 * 40).toISOString(),
            note: 'Flagged for follow-up during next clinical visit with Dr. Rajeshwar Rao.',
            author: 'System Safety Monitor',
          },
        ],
        actionRequired: 'Record morning and evening readings for 5 days in a log to present to your physician.',
      },
      {
        id: 'rf-2',
        title: 'Borderline Fasting Blood Glucose (112 mg/dL)',
        severity: 'low',
        category: 'lab_report',
        description: 'Analyzed lab report indicates impaired fasting glucose above normative threshold of 99 mg/dL.',
        ruleTriggered: 'Fasting Blood Glucose 100-125 mg/dL (Impaired Fasting Glucose / Pre-diabetes range)',
        evidenceText: 'Extracted from Lab Panel dated Oct 2026: Glucose Fasting = 112 mg/dL (Reference: 70-99 mg/dL).',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        notes: [
          {
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            note: 'Dietary modifications planned: reduced refined carbohydrates and consistent evening walk.',
            author: 'User Sharma',
          },
        ],
        actionRequired: 'Repeat HbA1c test in 90 days and consult an Endocrinologist or Diabetologist.',
      },
    ],
    reminders: [
      {
        id: 'rem-1',
        title: 'Morning Blood Pressure Check',
        type: 'vitals',
        time: '08:00 AM',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dosageOrDetail: 'Rest seated for 5 minutes prior to cuff inflation',
        active: true,
        completedToday: true,
        lastCompletedDate: todayStr,
      },
      {
        id: 'rem-2',
        title: 'Metformin Hydrochloride (500mg)',
        type: 'medication',
        time: '08:30 AM',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dosageOrDetail: '1 tablet post-breakfast with water',
        active: true,
        completedToday: true,
        lastCompletedDate: todayStr,
      },
      {
        id: 'rem-3',
        title: 'Afternoon Hydration Boost (500ml)',
        type: 'hydration',
        time: '02:30 PM',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dosageOrDetail: 'Room temperature water with lemon slice',
        active: true,
        completedToday: false,
      },
      {
        id: 'rem-4',
        title: 'Evening Brisk Walk (30 mins)',
        type: 'activity',
        time: '06:30 PM',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dosageOrDetail: 'Maintain steady pace at community park',
        active: true,
        completedToday: false,
      },
    ],
    appointments: [
      {
        id: 'apt-demo-1',
        doctorId: 'doc-2',
        doctorName: 'Dr. Rajeshwar Rao, MD',
        specialty: 'General Physician',
        patientName: 'K. S. Sharma',
        patientPhone: '+91 98480 12345',
        date: '2026-10-25',
        timeSlot: '10:30 AM',
        type: 'in-clinic',
        reason: 'Routine quarterly glycemic check & blood pressure review',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ],
    abhaProfile: {
      isLinked: true,
      mode: 'mock_sandbox',
      abhaNumber: '91-4458-2910-3819',
      abhaAddress: 'kssharma@abdm',
      name: 'K. S. Sharma',
      gender: 'Male',
      dob: '1978-06-14',
      mobile: '+91 98480 12345',
      linkedFacility: 'Care Community Hospital (HIP/HIU #HIP-TEL-0042)',
      linkedDate: new Date(Date.now() - 3600000 * 120).toISOString(),
      activeConsentArtifacts: 2,
    },
    abhaAuditLogs: [
      {
        id: 'log-1',
        action: 'MOCK_ABHA_LINKED',
        details: 'Simulated OTP verification completed via ABDM Sandbox Gateway emulator.',
        timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
        status: 'MOCK_VERIFIED',
      },
      {
        id: 'log-2',
        action: 'CONSENT_ARTIFACT_GRANTED',
        details: 'Purpose: Care Context Linking for OPD Consultation (#HIP-TEL-0042). HiTypes: DiagnosticReport, Prescription.',
        timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
        status: 'SUCCESS',
      },
    ],
    doctorRegistrations: [
      {
        id: 'doc-reg-1',
        fullName: 'Dr. Ramesh Gupta, MD, DM',
        email: 'dr.ramesh.gupta@carehospital.in',
        phone: '+91 98490 23456',
        medicalCouncilNumber: 'TS-MC-2004-4821',
        stateMedicalCouncil: 'Telangana State Medical Council',
        registrationYear: 2004,
        qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)',
        primarySpecialty: 'Cardiology',
        subSpecialties: ['Preventive Cardiology', 'Heart Failure Management'],
        experienceYears: 20,
        currentHospitalOrClinic: 'Apollo Health City, Jubilee Hills, Hyderabad',
        consultationFee: 500,
        isRetired: false,
        teleconsultationAdvisoryOnly: false,
        verificationStatus: 'verified',
        nmcVerificationVerified: true,
        documentName: 'medical_license_tsmc_2004.pdf',
        submittedAt: new Date(Date.now() - 3600000 * 480).toISOString(),
        verifiedAt: new Date(Date.now() - 3600000 * 400).toISOString(),
        auditNotes: [
          'Registration submitted with TSMC certificate copy.',
          'NMC National Medical Register API verified successfully. Practitioner in good standing.',
          'Credential audit passed by Chief Medical Registrar.',
        ],
      },
      {
        id: 'doc-reg-2',
        fullName: 'Dr. Meenakshi Sundaram, MD, FRCP',
        email: 'dr.meenakshi.sundaram@retiree-telecare.org',
        phone: '+91 98480 34567',
        medicalCouncilNumber: 'TN-MC-1988-1209',
        stateMedicalCouncil: 'Tamil Nadu Medical Council',
        registrationYear: 1988,
        qualifications: 'MBBS, MD (Internal Medicine), FRCP (London)',
        primarySpecialty: 'Internal Medicine',
        subSpecialties: ['Geriatric Medicine', 'Chronic Disease Optimization'],
        experienceYears: 36,
        currentHospitalOrClinic: 'Former Professor & Head of Medicine, MMC (Retired Practice)',
        consultationFee: 400,
        isRetired: true,
        teleconsultationAdvisoryOnly: true,
        verificationStatus: 'verified',
        nmcVerificationVerified: true,
        documentName: 'superannuation_and_nmc_license.pdf',
        submittedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
        verifiedAt: new Date(Date.now() - 3600000 * 200).toISOString(),
        auditNotes: [
          'Retired Senior Clinician registered for Secondary Review & Teleconsultation Advisory.',
          'NMC Medical Register lifetime status verified active with Emeritus standing.',
          'Teleconsultation advisory credentials authenticated.',
        ],
      },
      {
        id: 'doc-reg-3',
        fullName: 'Dr. Priya Varma, MS',
        email: 'priya.varma@entclinic.in',
        phone: '+91 98480 56789',
        medicalCouncilNumber: 'KA-MC-2015-9923',
        stateMedicalCouncil: 'Karnataka Medical Council',
        registrationYear: 2015,
        qualifications: 'MBBS, MS (ENT / Otorhinolaryngology)',
        primarySpecialty: 'ENT Specialist',
        subSpecialties: ['Allergy & Sinusitis', 'Otology'],
        experienceYears: 9,
        currentHospitalOrClinic: 'Varma ENT & Allergy Care Centre, Bengaluru',
        consultationFee: 450,
        isRetired: false,
        teleconsultationAdvisoryOnly: false,
        verificationStatus: 'pending_verification',
        nmcVerificationVerified: false,
        documentName: 'kmc_reg_certificate_2015.pdf',
        submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        auditNotes: [
          'Application submitted for credential verification.',
          'Awaiting automated State Medical Council registry batch sync.',
        ],
      },
    ],
    consultationSessions: [
      {
        id: 'consult-demo-1',
        appointmentId: 'apt-demo-1',
        doctorId: 'doc-2',
        doctorName: 'Dr. Rajeshwar Rao, MD',
        doctorSpecialty: 'General Physician',
        patientName: 'K. S. Sharma',
        scheduledTime: 'Today, 10:30 AM',
        status: 'waiting',
        durationSeconds: 0,
        clinicalNotes: 'Follow-up consultation to evaluate recent fasting glucose and lipid profile parameters.',
        prescriptionSummary: 'Continue Metformin 500mg OD with evening meal. Maintain low-glycemic dietary discipline.',
        followUpDate: 'In 3 months with repeat HbA1c',
        vitalsDiscussed: {
          bp: '124/82 mmHg',
          pulse: '74 bpm',
          temperature: '98.4°F',
          weight: '72 kg',
        },
      },
    ],
    abhaHealthRecords: [
      {
        id: 'abha-rec-1',
        careContextReference: 'HIP-TEL-0042/OPD/2026/0921',
        hiType: 'DiagnosticReport',
        documentName: 'Comprehensive Metabolic & Lipid Profile',
        facilityName: 'Care Community Hospital & Diagnostics',
        date: '2026-10-18',
        doctorName: 'Dr. Rajeshwar Rao, MD',
        department: 'Biochemistry & Pathology',
        status: 'available',
        summary: 'Fasting Plasma Glucose 106 mg/dL (mildly elevated), HbA1c 6.2% (pre-diabetic range), Total Cholesterol 188 mg/dL (desirable).',
        keyFindings: [
          'Fasting Glucose: 106 mg/dL [Reference: 70-99 mg/dL] - Borderline High',
          'HbA1c: 6.2% [Reference: < 5.7%] - Good glycemic control',
          'Serum Creatinine: 0.9 mg/dL [Reference: 0.7-1.3 mg/dL] - Normal renal function',
        ],
      },
      {
        id: 'abha-rec-2',
        careContextReference: 'HIP-TEL-0042/OPD/2026/0615',
        hiType: 'OPConsultation',
        documentName: 'Quarterly Hypertensive & Wellness Review',
        facilityName: 'Care Community Hospital',
        date: '2026-06-15',
        doctorName: 'Dr. Rajeshwar Rao, MD',
        department: 'General Internal Medicine',
        status: 'available',
        summary: 'Blood pressure well controlled on lifestyle modifications and low-dose Telmisartan. Advised 45 min daily brisk walking.',
        keyFindings: [
          'Sitting BP: 122/80 mmHg',
          'Resting Heart Rate: 72 bpm',
          'ECG: Normal sinus rhythm without ischemic changes',
        ],
      },
      {
        id: 'abha-rec-3',
        careContextReference: 'APOLLO-HYD/LAB/2026/0302',
        hiType: 'Prescription',
        documentName: 'E-Prescription & Chronic Care Management Plan',
        facilityName: 'Apollo Health City Pharmacy & OPD',
        date: '2026-03-02',
        doctorName: 'Dr. Ramesh Gupta, MD, DM',
        department: 'Cardiology Clinic',
        status: 'available',
        summary: 'Telmisartan 40mg once daily in morning. Vitamin D3 60k IU weekly for 8 weeks.',
        keyFindings: [
          'Medication 1: Tab Telmisartan 40 mg PO OD (Mornings)',
          'Medication 2: Cholecalciferol 60,000 IU Cap Weekly',
          'Dietary Advice: DASH diet protocol with sodium restriction < 2g/day',
        ],
      },
      {
        id: 'abha-rec-4',
        careContextReference: 'FORTIS-BLR/DISCHARGE/2025/1120',
        hiType: 'DischargeSummary',
        documentName: 'Elective Preventive Health Check & Stress Echo Summary',
        facilityName: 'Fortis Hospital & Heart Centre',
        date: '2025-11-20',
        doctorName: 'Dr. Ananya Rao, MD',
        department: 'Cardiovascular Diagnostics',
        status: 'available',
        summary: 'Negative for inducible myocardial ischemia at 92% maximum predicted heart rate. Left ventricular ejection fraction 62%.',
        keyFindings: [
          'Stress Echocardiogram: Negative for exercise-induced ischemia',
          'Ejection Fraction: 62% (Normal LV systolic function)',
          'Exercise Tolerance: 10.4 METs achieved on Bruce protocol',
        ],
      },
    ],
  };
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadFromDisk();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk(): DatabaseSchema {
    const initial = getInitialDatabaseState();
    try {
      let sourceFile = DB_FILE;
      if (!fs.existsSync(sourceFile)) {
        const fallbackSeed = path.join(DEFAULT_DATA_DIR, 'medmit-database.json');
        if (fs.existsSync(fallbackSeed)) {
          sourceFile = fallbackSeed;
        }
      }
      if (fs.existsSync(sourceFile)) {
        const raw = fs.readFileSync(sourceFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.version || parsed.conversations)) {
          const merged: DatabaseSchema = {
            ...initial,
            ...parsed,
            version: 3,
            users: parsed.users && parsed.users.length > 0 ? parsed.users : initial.users,
            verificationTokens: parsed.verificationTokens || [],
            sessions: parsed.sessions || [],
            authAuditLogs: parsed.authAuditLogs && parsed.authAuditLogs.length > 0 ? parsed.authAuditLogs : initial.authAuditLogs,
            userProfile: { ...initial.userProfile, ...(parsed.userProfile || {}) },
            doctorRegistrations: parsed.doctorRegistrations && parsed.doctorRegistrations.length > 0
              ? parsed.doctorRegistrations
              : initial.doctorRegistrations,
            consultationSessions: parsed.consultationSessions && parsed.consultationSessions.length > 0
              ? parsed.consultationSessions
              : initial.consultationSessions,
            abhaHealthRecords: parsed.abhaHealthRecords && parsed.abhaHealthRecords.length > 0
              ? parsed.abhaHealthRecords
              : initial.abhaHealthRecords,
          };

          // Migrate any records missing userId to default patient
          merged.conversations.forEach((c) => {
            if (!c.userId) c.userId = 'usr-seed-patient-001';
          });
          merged.appointments.forEach((a) => {
            if (!a.userId) a.userId = 'usr-seed-patient-001';
          });
          merged.riskFlags.forEach((r) => {
            if (!r.userId) r.userId = 'usr-seed-patient-001';
          });
          merged.wellnessRecommendations.forEach((w) => {
            if (!w.userId) w.userId = 'usr-seed-patient-001';
          });
          merged.reminders.forEach((rm) => {
            if (!rm.userId) rm.userId = 'usr-seed-patient-001';
          });
          merged.notifications.forEach((n) => {
            if (!n.userId) n.userId = 'usr-seed-patient-001';
          });

          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database, initializing fresh store:', err);
    }

    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave: DatabaseSchema = this.data) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  // ==========================================
  // --- User & Authentication Management ---
  // ==========================================

  getUsers(): UserRecord[] {
    return this.data.users || [];
  }

  getUserById(id: string): UserRecord | undefined {
    return (this.data.users || []).find((u) => u.id === id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    if (!email) return undefined;
    const lower = email.toLowerCase().trim();
    return (this.data.users || []).find((u) => u.email.toLowerCase().trim() === lower);
  }

  createUser(userData: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts' | 'lockUntil'>): UserRecord {
    if (!this.data.users) this.data.users = [];
    const newUser: UserRecord = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      lockUntil: null,
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return user;
  }

  recordFailedLogin(id: string, lockUntil?: string | null): void {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return;
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (lockUntil !== undefined) {
      user.lockUntil = lockUntil;
    }
    user.updatedAt = new Date().toISOString();
    this.saveToDisk();
  }

  resetFailedLogin(id: string): void {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    this.saveToDisk();
  }

  // --- Verification & Reset Tokens ---

  createVerificationToken(record: Omit<AuthVerificationTokenRecord, 'id' | 'createdAt'>): AuthVerificationTokenRecord {
    if (!this.data.verificationTokens) this.data.verificationTokens = [];
    const newToken: AuthVerificationTokenRecord = {
      ...record,
      id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.verificationTokens.push(newToken);
    this.saveToDisk();
    return newToken;
  }

  findVerificationToken(tokenHash: string, type: 'email_verify' | 'phone_verify' | 'password_reset'): AuthVerificationTokenRecord | undefined {
    const now = new Date().toISOString();
    return (this.data.verificationTokens || []).find(
      (t) => t.tokenHash === tokenHash && t.type === type && !t.usedAt && t.expiresAt > now
    );
  }

  findVerificationOtp(userId: string, otpCode: string, type: 'email_verify' | 'phone_verify' | 'password_reset'): AuthVerificationTokenRecord | undefined {
    const now = new Date().toISOString();
    return (this.data.verificationTokens || []).find(
      (t) => t.userId === userId && t.otpCode === otpCode && t.type === type && !t.usedAt && t.expiresAt > now
    );
  }

  consumeToken(id: string): void {
    const token = (this.data.verificationTokens || []).find((t) => t.id === id);
    if (token) {
      token.usedAt = new Date().toISOString();
      this.saveToDisk();
    }
  }

  invalidateUserTokens(userId: string, type?: 'email_verify' | 'phone_verify' | 'password_reset'): void {
    const now = new Date().toISOString();
    (this.data.verificationTokens || []).forEach((t) => {
      if (t.userId === userId && (!type || t.type === type) && !t.usedAt) {
        t.usedAt = now;
      }
    });
    this.saveToDisk();
  }

  // --- Sessions Management ---

  createSession(record: Omit<SessionRecord, 'id' | 'createdAt' | 'lastActiveAt'>): SessionRecord {
    if (!this.data.sessions) this.data.sessions = [];
    const newSession: SessionRecord = {
      ...record,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.data.sessions.push(newSession);
    this.saveToDisk();
    return newSession;
  }

  findSessionByToken(tokenHash: string): SessionRecord | undefined {
    const now = new Date().toISOString();
    return (this.data.sessions || []).find(
      (s) => s.tokenHash === tokenHash && s.expiresAt > now
    );
  }

  touchSession(sessionId: string): void {
    const session = (this.data.sessions || []).find((s) => s.id === sessionId);
    if (session) {
      session.lastActiveAt = new Date().toISOString();
      this.saveToDisk();
    }
  }

  deleteSession(sessionId: string): void {
    this.data.sessions = (this.data.sessions || []).filter((s) => s.id !== sessionId);
    this.saveToDisk();
  }

  deleteAllUserSessions(userId: string): void {
    this.data.sessions = (this.data.sessions || []).filter((s) => s.userId !== userId);
    this.saveToDisk();
  }

  cleanExpiredSessions(): void {
    const now = new Date().toISOString();
    const prevLen = (this.data.sessions || []).length;
    this.data.sessions = (this.data.sessions || []).filter((s) => s.expiresAt > now);
    if (this.data.sessions.length !== prevLen) {
      this.saveToDisk();
    }
  }

  // --- Audit Logs ---

  recordAuthAuditLog(log: Omit<AuthAuditLogRecord, 'id' | 'timestamp'>): AuthAuditLogRecord {
    if (!this.data.authAuditLogs) this.data.authAuditLogs = [];
    const record: AuthAuditLogRecord = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.authAuditLogs.unshift(record);
    if (this.data.authAuditLogs.length > 500) {
      this.data.authAuditLogs.pop();
    }
    this.saveToDisk();
    return record;
  }

  getAuthAuditLogs(userId?: string): AuthAuditLogRecord[] {
    if (!userId) return this.data.authAuditLogs || [];
    return (this.data.authAuditLogs || []).filter((l) => l.userId === userId);
  }

  // --- Conversations & Messages ---
  getConversations(userId?: string, query?: string): ConversationRecord[] {
    let list = [...this.data.conversations];
    if (userId) {
      list = list.filter((c) => !c.userId || c.userId === userId);
    }
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.lastMessagePreview.toLowerCase().includes(q));
    }
    return list;
  }

  getConversation(id: string, userId?: string): { conversation: ConversationRecord; messages: MessageRecord[] } | null {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return null;
    if (userId && conv.userId && conv.userId !== userId) return null; // Ownership check

    const msgs = this.data.messages
      .filter((m) => m.conversationId === id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { conversation: conv, messages: msgs };
  }

  createConversation(title: string, language: 'en' | 'te' = 'en', userId?: string): ConversationRecord {
    const newConv: ConversationRecord = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || 'usr-seed-patient-001',
      title: title || 'New Health Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      lastMessagePreview: '',
      language,
      hasVoice: false,
    };
    this.data.conversations.unshift(newConv);
    this.saveToDisk();
    return newConv;
  }

  addMessageToConversation(
    conversationId: string,
    message: Omit<MessageRecord, 'id' | 'conversationId' | 'timestamp'>
  ): MessageRecord {
    let conv = this.data.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = this.createConversation('Health Consultation', 'en');
      conversationId = conv.id;
    }

    const newMsg: MessageRecord = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      triage: message.triage,
      reportContext: message.reportContext,
      isVoice: message.isVoice,
    };

    this.data.messages.push(newMsg);
    conv.updatedAt = newMsg.timestamp;
    conv.messageCount += 1;
    conv.lastMessagePreview = message.content.slice(0, 100);
    if (message.isVoice) conv.hasVoice = true;
    if (message.triage?.urgency) conv.triageUrgency = message.triage.urgency;

    this.saveToDisk();
    return newMsg;
  }

  updateConversation(id: string, updates: Partial<ConversationRecord>): ConversationRecord | null {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return null;
    Object.assign(conv, updates, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return conv;
  }

  deleteConversation(id: string): boolean {
    const prevLen = this.data.conversations.length;
    this.data.conversations = this.data.conversations.filter((c) => c.id !== id);
    this.data.messages = this.data.messages.filter((m) => m.conversationId !== id);
    if (this.data.conversations.length !== prevLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Voice Records ---
  getVoiceRecords(userId?: string): VoiceRecord[] {
    let list = [...this.data.voiceRecords];
    if (userId) {
      list = list.filter((v) => !v.userId || v.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  saveVoiceRecord(record: Omit<VoiceRecord, 'id' | 'timestamp'>, userId?: string): VoiceRecord {
    const newRecord: VoiceRecord = {
      id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || record.userId || 'usr-seed-patient-001',
      ...record,
      timestamp: new Date().toISOString(),
    };
    this.data.voiceRecords.unshift(newRecord);
    this.saveToDisk();
    return newRecord;
  }

  deleteVoiceRecord(id: string): boolean {
    const prevLen = this.data.voiceRecords.length;
    this.data.voiceRecords = this.data.voiceRecords.filter((v) => v.id !== id);
    if (this.data.voiceRecords.length !== prevLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Wellness Recommendations & Preferences ---
  getWellnessData(userId?: string): { recommendations: WellnessRecommendation[]; preferences: WellnessPreferences } {
    let recs = this.data.wellnessRecommendations;
    if (userId) {
      recs = recs.filter((w) => !w.userId || w.userId === userId);
    }
    return {
      recommendations: recs,
      preferences: this.data.wellnessPreferences,
    };
  }

  updateRecommendationStatus(id: string, status: WellnessRecommendation['status']): WellnessRecommendation | null {
    const item = this.data.wellnessRecommendations.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    this.saveToDisk();
    return item;
  }

  addRecommendation(rec: Omit<WellnessRecommendation, 'id' | 'createdAt'>, userId?: string): WellnessRecommendation {
    const newRec: WellnessRecommendation = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || rec.userId || 'usr-seed-patient-001',
      ...rec,
      createdAt: new Date().toISOString(),
    };
    this.data.wellnessRecommendations.unshift(newRec);
    this.saveToDisk();
    return newRec;
  }

  updateWellnessPreferences(prefs: Partial<WellnessPreferences>): WellnessPreferences {
    Object.assign(this.data.wellnessPreferences, prefs);
    this.saveToDisk();
    return this.data.wellnessPreferences;
  }

  // --- Notifications ---
  getNotifications(userId?: string): { notifications: NotificationRecord[]; unreadCount: number } {
    let list = [...this.data.notifications];
    if (userId) {
      list = list.filter((n) => !n.userId || n.userId === userId);
    }
    const sorted = list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const unreadCount = sorted.filter((n) => !n.read).length;
    return { notifications: sorted, unreadCount };
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(): void {
    this.data.notifications.forEach((n) => (n.read = true));
    this.saveToDisk();
  }

  deleteNotification(id: string): boolean {
    const prev = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter((n) => n.id !== id);
    if (this.data.notifications.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  clearReadNotifications(): void {
    this.data.notifications = this.data.notifications.filter((n) => !n.read);
    this.saveToDisk();
  }

  addNotification(notif: Omit<NotificationRecord, 'id' | 'timestamp' | 'read'>, userId?: string): NotificationRecord {
    const newNotif: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || notif.userId || 'usr-seed-patient-001',
      ...notif,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.data.notifications.unshift(newNotif);
    this.saveToDisk();
    return newNotif;
  }

  // --- Risk Flags ---
  getRiskFlags(userId?: string): RiskFlagRecord[] {
    let list = [...this.data.riskFlags];
    if (userId) {
      list = list.filter((r) => !r.userId || r.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  addRiskFlag(flag: Omit<RiskFlagRecord, 'id' | 'createdAt' | 'updatedAt' | 'notes'> & { initialNote?: string }, userId?: string): RiskFlagRecord {
    const now = new Date().toISOString();
    const newFlag: RiskFlagRecord = {
      id: `rf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || flag.userId || 'usr-seed-patient-001',
      title: flag.title,
      severity: flag.severity,
      category: flag.category,
      description: flag.description,
      ruleTriggered: flag.ruleTriggered,
      evidenceText: flag.evidenceText,
      status: flag.status || 'new',
      createdAt: now,
      updatedAt: now,
      actionRequired: flag.actionRequired,
      notes: flag.initialNote ? [{ timestamp: now, note: flag.initialNote, author: 'System' }] : [],
    };
    this.data.riskFlags.unshift(newFlag);
    this.saveToDisk();
    return newFlag;
  }

  updateRiskFlag(
    id: string,
    updates: Partial<Pick<RiskFlagRecord, 'status' | 'actionRequired'>>,
    newNote?: string,
    author: string = 'User'
  ): RiskFlagRecord | null {
    const flag = this.data.riskFlags.find((f) => f.id === id);
    if (!flag) return null;
    if (updates.status) flag.status = updates.status;
    if (updates.actionRequired) flag.actionRequired = updates.actionRequired;
    flag.updatedAt = new Date().toISOString();
    if (newNote) {
      flag.notes.push({
        timestamp: flag.updatedAt,
        note: newNote,
        author,
      });
    }
    this.saveToDisk();
    return flag;
  }

  deleteRiskFlag(id: string): boolean {
    const prev = this.data.riskFlags.length;
    this.data.riskFlags = this.data.riskFlags.filter((f) => f.id !== id);
    if (this.data.riskFlags.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Reminders & Appointments ---
  getReminders(userId?: string): ReminderRecord[] {
    let list = this.data.reminders;
    if (userId) {
      list = list.filter((r) => !r.userId || r.userId === userId);
    }
    return list;
  }

  addReminder(rem: Omit<ReminderRecord, 'id' | 'completedToday'>, userId?: string): ReminderRecord {
    const newRem: ReminderRecord = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || rem.userId || 'usr-seed-patient-001',
      ...rem,
      completedToday: false,
    };
    this.data.reminders.push(newRem);
    this.saveToDisk();
    return newRem;
  }

  updateReminder(id: string, updates: Partial<ReminderRecord>): ReminderRecord | null {
    const rem = this.data.reminders.find((r) => r.id === id);
    if (!rem) return null;
    Object.assign(rem, updates);
    this.saveToDisk();
    return rem;
  }

  deleteReminder(id: string): boolean {
    const prev = this.data.reminders.length;
    this.data.reminders = this.data.reminders.filter((r) => r.id !== id);
    if (this.data.reminders.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  getAppointments(userId?: string): AppointmentRecord[] {
    let list = [...this.data.appointments];
    if (userId) {
      list = list.filter((a) => !a.userId || a.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addAppointment(apt: Omit<AppointmentRecord, 'id' | 'createdAt'>, userId?: string): AppointmentRecord {
    const newApt: AppointmentRecord = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || apt.userId || 'usr-seed-patient-001',
      ...apt,
      createdAt: new Date().toISOString(),
    };
    this.data.appointments.unshift(newApt);
    this.saveToDisk();
    return newApt;
  }

  cancelAppointment(id: string): boolean {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = 'cancelled';
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- ABHA Integration ---
  getAbhaStatus(): { profile: AbhaProfile; auditLogs: AbhaAuditLog[] } {
    return {
      profile: this.data.abhaProfile,
      auditLogs: [...this.data.abhaAuditLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    };
  }

  linkAbhaProfile(payload: { abhaNumber: string; abhaAddress: string; name: string }): AbhaProfile {
    this.data.abhaProfile = {
      isLinked: true,
      mode: 'mock_sandbox',
      abhaNumber: payload.abhaNumber,
      abhaAddress: payload.abhaAddress,
      name: payload.name || this.data.userProfile.name,
      gender: this.data.userProfile.gender,
      dob: '1978-06-14',
      mobile: this.data.userProfile.phone,
      linkedFacility: 'Care Community Hospital (HIP/HIU #HIP-TEL-0042)',
      linkedDate: new Date().toISOString(),
      activeConsentArtifacts: 1,
    };

    this.data.abhaAuditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'MOCK_ABHA_LINKED',
      details: `ABHA ${payload.abhaNumber} linked successfully in Mock Sandbox mode.`,
      timestamp: new Date().toISOString(),
      status: 'MOCK_VERIFIED',
    });

    this.saveToDisk();
    return this.data.abhaProfile;
  }

  unlinkAbhaProfile(): AbhaProfile {
    this.data.abhaProfile = {
      isLinked: false,
      mode: 'mock_sandbox',
      activeConsentArtifacts: 0,
    };

    this.data.abhaAuditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'ABHA_UNLINKED',
      details: 'User revoked ABHA linking and consent artifacts.',
      timestamp: new Date().toISOString(),
      status: 'REVOKED',
    });

    this.saveToDisk();
    return this.data.abhaProfile;
  }

  // --- Doctor Registration & Professional Verification ---
  getDoctorRegistrations(): DoctorRegistrationRecord[] {
    return this.data.doctorRegistrations || [];
  }

  getDoctorRegistration(id: string): DoctorRegistrationRecord | null {
    return (this.data.doctorRegistrations || []).find((d) => d.id === id) || null;
  }

  registerDoctor(doc: Omit<DoctorRegistrationRecord, 'id' | 'submittedAt' | 'verificationStatus' | 'nmcVerificationVerified' | 'auditNotes'> & { isRetired?: boolean; teleconsultationAdvisoryOnly?: boolean }): DoctorRegistrationRecord {
    const isRetired = Boolean(doc.isRetired);
    const newDoc: DoctorRegistrationRecord = {
      id: `doc-reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...doc,
      isRetired,
      teleconsultationAdvisoryOnly: isRetired ? true : Boolean(doc.teleconsultationAdvisoryOnly),
      verificationStatus: 'submitted',
      nmcVerificationVerified: false,
      submittedAt: new Date().toISOString(),
      auditNotes: [
        `Application submitted by practitioner on ${new Date().toLocaleDateString()}.`,
        `Queued for State Medical Council and NMC Register verification check.`,
      ],
    };
    if (!this.data.doctorRegistrations) this.data.doctorRegistrations = [];
    this.data.doctorRegistrations.unshift(newDoc);
    this.saveToDisk();
    return newDoc;
  }

  updateDoctorRegistration(id: string, updates: Partial<DoctorRegistrationRecord>): DoctorRegistrationRecord | null {
    const doc = (this.data.doctorRegistrations || []).find((d) => d.id === id);
    if (!doc) return null;
    Object.assign(doc, updates);
    this.saveToDisk();
    return doc;
  }

  // --- Real-Time Online Consultations ---
  getConsultationSessions(): ConsultationSessionRecord[] {
    return this.data.consultationSessions || [];
  }

  getConsultationSession(id: string): ConsultationSessionRecord | null {
    return (this.data.consultationSessions || []).find((c) => c.id === id) || null;
  }

  createOrGetConsultationSession(appointmentId: string): ConsultationSessionRecord {
    if (!this.data.consultationSessions) this.data.consultationSessions = [];
    let session = this.data.consultationSessions.find((s) => s.appointmentId === appointmentId);
    if (!session) {
      const apt = this.data.appointments.find((a) => a.id === appointmentId);
      session = {
        id: `consult-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        appointmentId,
        doctorId: apt?.doctorId || 'doc-2',
        doctorName: apt?.doctorName || 'Dr. Rajeshwar Rao, MD',
        doctorSpecialty: apt?.specialty || 'General Physician',
        patientName: apt?.patientName || this.data.userProfile.name,
        scheduledTime: apt ? `${apt.date} at ${apt.timeSlot}` : 'Now',
        status: 'waiting',
        durationSeconds: 0,
        clinicalNotes: '',
        followUpDate: 'In 2 weeks',
        vitalsDiscussed: {
          bp: '120/80 mmHg',
          pulse: '72 bpm',
          temperature: '98.6°F',
        },
      };
      this.data.consultationSessions.unshift(session);
      this.saveToDisk();
    }
    return session;
  }

  updateConsultationSession(id: string, updates: Partial<ConsultationSessionRecord>): ConsultationSessionRecord | null {
    const session = (this.data.consultationSessions || []).find((s) => s.id === id);
    if (!session) return null;
    Object.assign(session, updates);
    this.saveToDisk();
    return session;
  }

  // --- ABHA Health Records & Discovery ---
  getAbhaHealthRecords(): AbhaHealthRecord[] {
    return this.data.abhaHealthRecords || [];
  }

  retrieveAbhaHealthRecord(id: string): AbhaHealthRecord | null {
    const record = (this.data.abhaHealthRecords || []).find((r) => r.id === id);
    if (!record) return null;
    record.status = 'retrieved';
    this.saveToDisk();
    return record;
  }

  // --- User Profile, Consents & Data Export ---
  getUserProfile(): UserProfile {
    return this.data.userProfile;
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    Object.assign(this.data.userProfile, updates);
    this.saveToDisk();
    return this.data.userProfile;
  }

  exportAllUserData(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  resetAllData(): void {
    this.data = getInitialDatabaseState();
    this.saveToDisk();
  }
}

export const db = new DatabaseStore();
