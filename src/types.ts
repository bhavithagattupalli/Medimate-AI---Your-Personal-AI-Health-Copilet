export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'self-care';

export interface CopilotTriageResponse {
  summary: string;
  urgency: UrgencyLevel;
  suggested_specialty: string;
  reasons_for_specialty?: string;
  explanation: string;
  follow_up_questions?: string[];
  next_steps: string[];
  warning_signs: string[];
  show_nearby_care: boolean;
  suggested_facility_type?: 'hospital' | 'clinic' | 'doctor' | 'pharmacy';
  emergency_hotline?: string;
  disclaimer: string;
}

export interface DoctorSummary {
  reported_symptoms: string[];
  duration_and_severity: string;
  associated_symptoms: string[];
  user_medical_context: string;
  questions_for_doctor: string[];
  missing_information: string[];
  generated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  triage?: CopilotTriageResponse;
  reportContext?: string;
  error?: boolean;
}

export interface ReportTestItem {
  name: string;
  result: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'high' | 'low' | 'critical' | 'inconclusive';
  what_it_measures: string;
  clinical_significance: string;
}

export interface ReportAnalysisResult {
  laboratory_name?: string;
  report_date?: string;
  patient_info_redacted?: boolean;
  tests: ReportTestItem[];
  summary: string;
  overall_urgency: 'routine' | 'consult_doctor' | 'urgent';
  suggested_specialist: string;
  questions_for_doctor: string[];
  disclaimer: string;
  fileName?: string;
}

export interface Facility {
  id: string;
  name: string;
  category: 'hospital' | 'clinic' | 'pharmacy' | 'doctors';
  address: string;
  phone: string | null;
  emergency: boolean;
  opening_hours: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
  source: string;
  verified: boolean;
  directionsUrl: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  qualifications: string;
  hospitalAffiliation: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availableDays: string[];
  timeSlots: string[];
  imageUrl: string;
  languages: string[];
  bio: string;
}

export interface Appointment {
  id: string;
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

export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
  language: AppLanguage;
  hasVoice: boolean;
  triageUrgency?: UrgencyLevel;
}

export interface VoiceRecord {
  id: string;
  conversationId?: string;
  transcript: string;
  timestamp: string;
  durationSeconds: number;
  language: AppLanguage;
  hasAudioStorage: boolean;
  audioDataUri?: string;
  status: 'transcribed' | 'processed' | 'failed';
}

export interface WellnessRecommendation {
  id: string;
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
  title: string;
  type: 'medication' | 'hydration' | 'vitals' | 'activity' | 'appointment';
  time: string;
  daysOfWeek: string[];
  dosageOrDetail?: string;
  active: boolean;
  completedToday: boolean;
  lastCompletedDate?: string;
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
  languagePreference: AppLanguage;
  consentAiAnalysis: boolean;
  consentVoiceStorage: boolean;
  consentAbhaSharing: boolean;
  consentNotifications: boolean;
}

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export type AuthTab = 'signin' | 'register' | 'verify' | 'forgot_password' | 'reset_password';

export type AppLanguage = 'en' | 'te' | 'hi' | 'ta' | 'kn';

export type AppTab =
  | 'dashboard'
  | 'copilot'
  | 'chat_history'
  | 'voice'
  | 'wellness'
  | 'notifications'
  | 'risk_flags'
  | 'records'
  | 'abha'
  | 'appointments'
  | 'emergency'
  | 'settings'
  | 'report'
  | 'nearby'
  | 'doctors'
  | 'doctor_portal'
  | 'consultation';

export type DoctorVerificationStatus =
  | 'draft'
  | 'submitted'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface DoctorRegistration {
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

export interface ConsultationSession {
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

export interface HealthTimelineMilestone {
  id: string;
  date: string;
  title: string;
  category: 'lab_test' | 'consultation' | 'prescription' | 'vitals_trend';
  facilityOrDoctor: string;
  keyMetric?: { name: string; value: string; unit: string; trend: 'improving' | 'stable' | 'needs_attention' };
  notes: string;
}

export interface FoodPlanItem {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  title: string;
  description: string;
  caloriesApprox: number;
  glycemicIndex: 'low' | 'moderate' | 'high';
  dietType: 'veg' | 'non-veg' | 'eggetarian';
  nutritionalHighlight: string;
  allergens: string[];
}

export interface FitnessRoutineItem {
  id: string;
  title: string;
  equipment: 'no_equipment' | 'yoga_mat' | 'resistance_bands' | 'dumbbells_gym';
  durationMinutes: number;
  targetArea: string;
  intensity: 'gentle' | 'moderate' | 'vigorous';
  description: string;
  safeForConditions: string[];
}

export interface PreventionScreeningItem {
  id: string;
  name: string;
  targetGroup: string;
  frequency: string;
  purpose: string;
  lastDoneDate?: string;
  nextDueDate: string;
  status: 'due' | 'completed' | 'scheduled' | 'optional';
}

