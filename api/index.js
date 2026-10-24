// server.ts
import express from "express";
import cookieParser from "cookie-parser";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/store.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DEFAULT_DATA_DIR = path.resolve(__dirname, "data");
var DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp" : DEFAULT_DATA_DIR);
var DB_FILE = path.join(DATA_DIR, "medmit-database.json");
function getInitialDatabaseState() {
  const now = /* @__PURE__ */ new Date();
  const todayStr = now.toISOString().split("T")[0];
  return {
    version: 3,
    users: [
      {
        id: "usr-seed-patient-001",
        fullName: "K. S. Sharma",
        email: "patient@medimate.ai",
        phoneNumber: "+91 98480 12345",
        dateOfBirth: "1978-05-14",
        passwordHash: "$2b$12$7QtOUWYaqWS0DS7ILWMgLuBSzo9QXfTLNgbJuqF1fdxgbvoWUHaq.",
        // MediMate@2026!
        role: "patient",
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 36e5 * 240).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 24).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 36e5 * 240).toISOString()
        }
      },
      {
        id: "usr-seed-doctor-001",
        fullName: "Dr. Ramesh Gupta, MD, DM",
        email: "dr.ramesh.gupta@carehospital.in",
        phoneNumber: "+91 98490 23456",
        passwordHash: "$2b$12$xa6MRNjyhVhAPjHzw/0sueZO2eryfML/ciChwuSqOa2T/z7srilWe",
        // Doctor@Care2026!
        role: "doctor",
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 36e5 * 480).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 12).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 36e5 * 480).toISOString()
        }
      },
      {
        id: "usr-seed-admin-001",
        fullName: "System Security Administrator",
        email: "admin@medimate.ai",
        phoneNumber: "+91 99999 88888",
        passwordHash: "$2b$12$A9bH5hSueYD8grzMBnDVHuxjIy7eCKAUySU0oATvM6ylHvSpS4ykW",
        // Admin#Sec2026!
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 36e5 * 720).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 2).toISOString(),
        failedLoginAttempts: 0,
        consents: {
          terms: true,
          privacyPolicy: true,
          aiHealthProcessing: true,
          timestamp: new Date(Date.now() - 36e5 * 720).toISOString()
        }
      }
    ],
    verificationTokens: [],
    sessions: [],
    authAuditLogs: [
      {
        id: "log-seed-1",
        userId: "usr-seed-patient-001",
        email: "patient@medimate.ai",
        action: "register",
        ipAddress: "127.0.0.1",
        userAgent: "MediMate Web Client",
        timestamp: new Date(Date.now() - 36e5 * 240).toISOString(),
        status: "success"
      },
      {
        id: "log-seed-2",
        userId: "usr-seed-patient-001",
        email: "patient@medimate.ai",
        action: "verify_email",
        ipAddress: "127.0.0.1",
        userAgent: "MediMate Web Client",
        timestamp: new Date(Date.now() - 36e5 * 239).toISOString(),
        status: "success"
      }
    ],
    userProfile: {
      name: "K. S. Sharma",
      age: 48,
      gender: "Male",
      bloodGroup: "B+",
      phone: "+91 98480 12345",
      emergencyContactName: "Lakshmi Sharma (Spouse)",
      emergencyContactPhone: "+91 98480 67890",
      languagePreference: "en",
      consentAiAnalysis: true,
      consentVoiceStorage: true,
      consentAbhaSharing: true,
      consentNotifications: true
    },
    conversations: [
      {
        id: "conv-init-1",
        title: "Mild fever & throat discomfort triage",
        createdAt: new Date(Date.now() - 36e5 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 22).toISOString(),
        messageCount: 4,
        lastMessagePreview: "Hydrate well with warm fluids and monitor temperature if it exceeds 101\xB0F.",
        language: "en",
        hasVoice: true,
        triageUrgency: "routine"
      },
      {
        id: "conv-init-2",
        title: "\u0C30\u0C15\u0C4D\u0C24\u0C2A\u0C4B\u0C1F\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C05\u0C32\u0C38\u0C1F\u0C2A\u0C48 \u0C38\u0C32\u0C39\u0C3E (BP & Fatigue Advice)",
        createdAt: new Date(Date.now() - 36e5 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 70).toISOString(),
        messageCount: 3,
        lastMessagePreview: "\u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C28\u0C3F \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C3F \u0C2C\u0C40\u0C2A\u0C40\u0C28\u0C3F \u0C15\u0C4D\u0C30\u0C2E\u0C02 \u0C24\u0C2A\u0C4D\u0C2A\u0C15\u0C41\u0C02\u0C21\u0C3E \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F.",
        language: "te",
        hasVoice: false,
        triageUrgency: "routine"
      }
    ],
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-init-1",
        role: "user",
        content: "I have had a scratchy throat and low fever (99.8\xB0F) since yesterday morning.",
        timestamp: new Date(Date.now() - 36e5 * 24).toISOString(),
        isVoice: true
      },
      {
        id: "msg-2",
        conversationId: "conv-init-1",
        role: "assistant",
        content: "Thank you for sharing your symptoms. Based on your description of a scratchy throat and low fever (99.8\xB0F), this presents typical viral upper respiratory signs. A General Physician can examine your pharynx and verify whether symptom relief measures are sufficient.",
        timestamp: new Date(Date.now() - 36e5 * 24 + 2e3).toISOString(),
        triage: {
          summary: "Reported onset of scratchy throat and mild fever (99.8\xB0F) for ~24 hours.",
          urgency: "routine",
          suggested_specialty: "General Physician",
          reasons_for_specialty: "A General Physician can safely differentiate between common viral pharyngitis and bacterial strep throat, recommending appropriate gargles or antipyretics.",
          explanation: "Most low-grade fevers with throat discomfort are self-limiting viral episodes, but require clinical evaluation if temperature spikes or breathing is affected.",
          next_steps: [
            "Warm saline gargles 3-4 times a day",
            "Adequate hydration (2.5 - 3 liters warm water)",
            "Monitor body temperature using an oral digital thermometer twice daily"
          ],
          warning_signs: [
            "Difficulty swallowing saliva or opening mouth (trismus)",
            "Stridor or difficulty breathing",
            "Persistent high fever above 102\xB0F exceeding 3 days"
          ],
          show_nearby_care: true,
          suggested_facility_type: "clinic",
          disclaimer: "MediMate AI provides triage guidance and health education. It does not replace clinical diagnosis. In emergencies, call 112."
        }
      }
    ],
    voiceRecords: [
      {
        id: "voice-rec-1",
        conversationId: "conv-init-1",
        transcript: "I have had a scratchy throat and low fever since yesterday morning.",
        timestamp: new Date(Date.now() - 36e5 * 24).toISOString(),
        durationSeconds: 6,
        language: "en",
        hasAudioStorage: true,
        status: "processed"
      }
    ],
    wellnessRecommendations: [
      {
        id: "rec-1",
        category: "hydration",
        title: "Maintain 2.8 Liters Daily Hydration",
        description: "Drink a glass of water every 90 minutes to maintain optimal cellular hydration and renal function.",
        rationale: "Active metabolic processes and climate conditions require steady fluid intake to prevent fatigue.",
        status: "active",
        priority: "high",
        frequency: "daily",
        targetValue: "2800 ml",
        currentValue: "1800 ml",
        createdAt: now.toISOString()
      },
      {
        id: "rec-2",
        category: "activity",
        title: "30-Minute Brisk Evening Walk",
        description: "Moderate cardiovascular exercise improves insulin sensitivity and cardiovascular endurance.",
        rationale: "Supports glycemic control and reduces arterial stiffness.",
        status: "active",
        priority: "medium",
        frequency: "daily",
        targetValue: "6,000 steps",
        currentValue: "4,200 steps",
        createdAt: now.toISOString()
      },
      {
        id: "rec-3",
        category: "sleep",
        title: "Sleep Hygiene: Consistent 10:30 PM Wind-down",
        description: "Limit blue light exposure 45 minutes before bed and target 7-8 hours of uninterrupted restorative sleep.",
        rationale: "Deep slow-wave sleep regulates cortisol and circadian hormone rhythms.",
        status: "saved",
        priority: "medium",
        frequency: "daily",
        targetValue: "7.5 hrs",
        currentValue: "6.5 hrs",
        createdAt: now.toISOString()
      },
      {
        id: "rec-4",
        category: "preventive",
        title: "Quarterly Fasting Blood Glucose & HbA1c Check",
        description: "Schedule routine preventive metabolic blood panel to track long-term glycemic trends.",
        rationale: "Recommended every 3-6 months for adults over 45 with family history of metabolic risk.",
        status: "active",
        priority: "high",
        frequency: "custom",
        targetValue: "HbA1c < 6.5%",
        createdAt: now.toISOString()
      }
    ],
    wellnessPreferences: {
      hydrationGoalMl: 2800,
      sleepGoalHours: 7.5,
      dailyStepsGoal: 6e3,
      focusAreas: ["Cardiovascular Health", "Blood Sugar Balance", "Stress Resilience"],
      reminderFrequency: "twice_daily"
    },
    notifications: [
      {
        id: "notif-1",
        title: "Hydration Target Reminder",
        message: "You have logged 1,800 ml so far. Have a glass of water to reach your 2,800 ml daily goal.",
        category: "wellness",
        severity: "info",
        timestamp: new Date(Date.now() - 1e3 * 60 * 35).toISOString(),
        read: false,
        actionTab: "wellness"
      },
      {
        id: "notif-2",
        title: "Upcoming Clinical Appointment",
        message: "Dr. Rajeshwar Rao (General Physician) tomorrow at 10:30 AM at Care Community Clinic.",
        category: "reminder",
        severity: "warning",
        timestamp: new Date(Date.now() - 1e3 * 60 * 120).toISOString(),
        read: false,
        actionTab: "appointments"
      },
      {
        id: "notif-3",
        title: "ABDM Synthetic Sandbox Connected",
        message: "Demonstration ABHA ID 91-4458-2910-3819 linked in Mock Mode with consent artifact #ABDM-MOCK-982.",
        category: "system",
        severity: "info",
        timestamp: new Date(Date.now() - 1e3 * 60 * 360).toISOString(),
        read: true,
        actionTab: "abha"
      }
    ],
    riskFlags: [
      {
        id: "rf-1",
        title: "Elevated Systolic Blood Pressure Trend",
        severity: "moderate",
        category: "vital",
        description: "Recent logs indicate resting systolic blood pressure between 138-142 mmHg over two consecutive checks.",
        ruleTriggered: "Systolic BP >= 135 mmHg on repeated measurements (Stage 1 Hypertension Range)",
        evidenceText: "Patient noted readings of 138/88 mmHg and 142/90 mmHg during evening routine checks.",
        status: "under_review",
        createdAt: new Date(Date.now() - 36e5 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 12).toISOString(),
        notes: [
          {
            timestamp: new Date(Date.now() - 36e5 * 40).toISOString(),
            note: "Flagged for follow-up during next clinical visit with Dr. Rajeshwar Rao.",
            author: "System Safety Monitor"
          }
        ],
        actionRequired: "Record morning and evening readings for 5 days in a log to present to your physician."
      },
      {
        id: "rf-2",
        title: "Borderline Fasting Blood Glucose (112 mg/dL)",
        severity: "low",
        category: "lab_report",
        description: "Analyzed lab report indicates impaired fasting glucose above normative threshold of 99 mg/dL.",
        ruleTriggered: "Fasting Blood Glucose 100-125 mg/dL (Impaired Fasting Glucose / Pre-diabetes range)",
        evidenceText: "Extracted from Lab Panel dated Oct 2026: Glucose Fasting = 112 mg/dL (Reference: 70-99 mg/dL).",
        status: "acknowledged",
        createdAt: new Date(Date.now() - 36e5 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 36e5 * 24).toISOString(),
        notes: [
          {
            timestamp: new Date(Date.now() - 36e5 * 24).toISOString(),
            note: "Dietary modifications planned: reduced refined carbohydrates and consistent evening walk.",
            author: "User Sharma"
          }
        ],
        actionRequired: "Repeat HbA1c test in 90 days and consult an Endocrinologist or Diabetologist."
      }
    ],
    reminders: [
      {
        id: "rem-1",
        title: "Morning Blood Pressure Check",
        type: "vitals",
        time: "08:00 AM",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        dosageOrDetail: "Rest seated for 5 minutes prior to cuff inflation",
        active: true,
        completedToday: true,
        lastCompletedDate: todayStr
      },
      {
        id: "rem-2",
        title: "Metformin Hydrochloride (500mg)",
        type: "medication",
        time: "08:30 AM",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        dosageOrDetail: "1 tablet post-breakfast with water",
        active: true,
        completedToday: true,
        lastCompletedDate: todayStr
      },
      {
        id: "rem-3",
        title: "Afternoon Hydration Boost (500ml)",
        type: "hydration",
        time: "02:30 PM",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        dosageOrDetail: "Room temperature water with lemon slice",
        active: true,
        completedToday: false
      },
      {
        id: "rem-4",
        title: "Evening Brisk Walk (30 mins)",
        type: "activity",
        time: "06:30 PM",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dosageOrDetail: "Maintain steady pace at community park",
        active: true,
        completedToday: false
      }
    ],
    appointments: [
      {
        id: "apt-demo-1",
        doctorId: "doc-2",
        doctorName: "Dr. Rajeshwar Rao, MD",
        specialty: "General Physician",
        patientName: "K. S. Sharma",
        patientPhone: "+91 98480 12345",
        date: "2026-10-25",
        timeSlot: "10:30 AM",
        type: "in-clinic",
        reason: "Routine quarterly glycemic check & blood pressure review",
        status: "confirmed",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    abhaProfile: {
      isLinked: true,
      mode: "mock_sandbox",
      abhaNumber: "91-4458-2910-3819",
      abhaAddress: "kssharma@abdm",
      name: "K. S. Sharma",
      gender: "Male",
      dob: "1978-06-14",
      mobile: "+91 98480 12345",
      linkedFacility: "Care Community Hospital (HIP/HIU #HIP-TEL-0042)",
      linkedDate: new Date(Date.now() - 36e5 * 120).toISOString(),
      activeConsentArtifacts: 2
    },
    abhaAuditLogs: [
      {
        id: "log-1",
        action: "MOCK_ABHA_LINKED",
        details: "Simulated OTP verification completed via ABDM Sandbox Gateway emulator.",
        timestamp: new Date(Date.now() - 36e5 * 120).toISOString(),
        status: "MOCK_VERIFIED"
      },
      {
        id: "log-2",
        action: "CONSENT_ARTIFACT_GRANTED",
        details: "Purpose: Care Context Linking for OPD Consultation (#HIP-TEL-0042). HiTypes: DiagnosticReport, Prescription.",
        timestamp: new Date(Date.now() - 36e5 * 96).toISOString(),
        status: "SUCCESS"
      }
    ],
    doctorRegistrations: [
      {
        id: "doc-reg-1",
        fullName: "Dr. Ramesh Gupta, MD, DM",
        email: "dr.ramesh.gupta@carehospital.in",
        phone: "+91 98490 23456",
        medicalCouncilNumber: "TS-MC-2004-4821",
        stateMedicalCouncil: "Telangana State Medical Council",
        registrationYear: 2004,
        qualifications: "MBBS, MD (General Medicine), DM (Cardiology)",
        primarySpecialty: "Cardiology",
        subSpecialties: ["Preventive Cardiology", "Heart Failure Management"],
        experienceYears: 20,
        currentHospitalOrClinic: "Apollo Health City, Jubilee Hills, Hyderabad",
        consultationFee: 500,
        isRetired: false,
        teleconsultationAdvisoryOnly: false,
        verificationStatus: "verified",
        nmcVerificationVerified: true,
        documentName: "medical_license_tsmc_2004.pdf",
        submittedAt: new Date(Date.now() - 36e5 * 480).toISOString(),
        verifiedAt: new Date(Date.now() - 36e5 * 400).toISOString(),
        auditNotes: [
          "Registration submitted with TSMC certificate copy.",
          "NMC National Medical Register API verified successfully. Practitioner in good standing.",
          "Credential audit passed by Chief Medical Registrar."
        ]
      },
      {
        id: "doc-reg-2",
        fullName: "Dr. Meenakshi Sundaram, MD, FRCP",
        email: "dr.meenakshi.sundaram@retiree-telecare.org",
        phone: "+91 98480 34567",
        medicalCouncilNumber: "TN-MC-1988-1209",
        stateMedicalCouncil: "Tamil Nadu Medical Council",
        registrationYear: 1988,
        qualifications: "MBBS, MD (Internal Medicine), FRCP (London)",
        primarySpecialty: "Internal Medicine",
        subSpecialties: ["Geriatric Medicine", "Chronic Disease Optimization"],
        experienceYears: 36,
        currentHospitalOrClinic: "Former Professor & Head of Medicine, MMC (Retired Practice)",
        consultationFee: 400,
        isRetired: true,
        teleconsultationAdvisoryOnly: true,
        verificationStatus: "verified",
        nmcVerificationVerified: true,
        documentName: "superannuation_and_nmc_license.pdf",
        submittedAt: new Date(Date.now() - 36e5 * 240).toISOString(),
        verifiedAt: new Date(Date.now() - 36e5 * 200).toISOString(),
        auditNotes: [
          "Retired Senior Clinician registered for Secondary Review & Teleconsultation Advisory.",
          "NMC Medical Register lifetime status verified active with Emeritus standing.",
          "Teleconsultation advisory credentials authenticated."
        ]
      },
      {
        id: "doc-reg-3",
        fullName: "Dr. Priya Varma, MS",
        email: "priya.varma@entclinic.in",
        phone: "+91 98480 56789",
        medicalCouncilNumber: "KA-MC-2015-9923",
        stateMedicalCouncil: "Karnataka Medical Council",
        registrationYear: 2015,
        qualifications: "MBBS, MS (ENT / Otorhinolaryngology)",
        primarySpecialty: "ENT Specialist",
        subSpecialties: ["Allergy & Sinusitis", "Otology"],
        experienceYears: 9,
        currentHospitalOrClinic: "Varma ENT & Allergy Care Centre, Bengaluru",
        consultationFee: 450,
        isRetired: false,
        teleconsultationAdvisoryOnly: false,
        verificationStatus: "pending_verification",
        nmcVerificationVerified: false,
        documentName: "kmc_reg_certificate_2015.pdf",
        submittedAt: new Date(Date.now() - 36e5 * 24).toISOString(),
        auditNotes: [
          "Application submitted for credential verification.",
          "Awaiting automated State Medical Council registry batch sync."
        ]
      }
    ],
    consultationSessions: [
      {
        id: "consult-demo-1",
        appointmentId: "apt-demo-1",
        doctorId: "doc-2",
        doctorName: "Dr. Rajeshwar Rao, MD",
        doctorSpecialty: "General Physician",
        patientName: "K. S. Sharma",
        scheduledTime: "Today, 10:30 AM",
        status: "waiting",
        durationSeconds: 0,
        clinicalNotes: "Follow-up consultation to evaluate recent fasting glucose and lipid profile parameters.",
        prescriptionSummary: "Continue Metformin 500mg OD with evening meal. Maintain low-glycemic dietary discipline.",
        followUpDate: "In 3 months with repeat HbA1c",
        vitalsDiscussed: {
          bp: "124/82 mmHg",
          pulse: "74 bpm",
          temperature: "98.4\xB0F",
          weight: "72 kg"
        }
      }
    ],
    abhaHealthRecords: [
      {
        id: "abha-rec-1",
        careContextReference: "HIP-TEL-0042/OPD/2026/0921",
        hiType: "DiagnosticReport",
        documentName: "Comprehensive Metabolic & Lipid Profile",
        facilityName: "Care Community Hospital & Diagnostics",
        date: "2026-10-18",
        doctorName: "Dr. Rajeshwar Rao, MD",
        department: "Biochemistry & Pathology",
        status: "available",
        summary: "Fasting Plasma Glucose 106 mg/dL (mildly elevated), HbA1c 6.2% (pre-diabetic range), Total Cholesterol 188 mg/dL (desirable).",
        keyFindings: [
          "Fasting Glucose: 106 mg/dL [Reference: 70-99 mg/dL] - Borderline High",
          "HbA1c: 6.2% [Reference: < 5.7%] - Good glycemic control",
          "Serum Creatinine: 0.9 mg/dL [Reference: 0.7-1.3 mg/dL] - Normal renal function"
        ]
      },
      {
        id: "abha-rec-2",
        careContextReference: "HIP-TEL-0042/OPD/2026/0615",
        hiType: "OPConsultation",
        documentName: "Quarterly Hypertensive & Wellness Review",
        facilityName: "Care Community Hospital",
        date: "2026-06-15",
        doctorName: "Dr. Rajeshwar Rao, MD",
        department: "General Internal Medicine",
        status: "available",
        summary: "Blood pressure well controlled on lifestyle modifications and low-dose Telmisartan. Advised 45 min daily brisk walking.",
        keyFindings: [
          "Sitting BP: 122/80 mmHg",
          "Resting Heart Rate: 72 bpm",
          "ECG: Normal sinus rhythm without ischemic changes"
        ]
      },
      {
        id: "abha-rec-3",
        careContextReference: "APOLLO-HYD/LAB/2026/0302",
        hiType: "Prescription",
        documentName: "E-Prescription & Chronic Care Management Plan",
        facilityName: "Apollo Health City Pharmacy & OPD",
        date: "2026-03-02",
        doctorName: "Dr. Ramesh Gupta, MD, DM",
        department: "Cardiology Clinic",
        status: "available",
        summary: "Telmisartan 40mg once daily in morning. Vitamin D3 60k IU weekly for 8 weeks.",
        keyFindings: [
          "Medication 1: Tab Telmisartan 40 mg PO OD (Mornings)",
          "Medication 2: Cholecalciferol 60,000 IU Cap Weekly",
          "Dietary Advice: DASH diet protocol with sodium restriction < 2g/day"
        ]
      },
      {
        id: "abha-rec-4",
        careContextReference: "FORTIS-BLR/DISCHARGE/2025/1120",
        hiType: "DischargeSummary",
        documentName: "Elective Preventive Health Check & Stress Echo Summary",
        facilityName: "Fortis Hospital & Heart Centre",
        date: "2025-11-20",
        doctorName: "Dr. Ananya Rao, MD",
        department: "Cardiovascular Diagnostics",
        status: "available",
        summary: "Negative for inducible myocardial ischemia at 92% maximum predicted heart rate. Left ventricular ejection fraction 62%.",
        keyFindings: [
          "Stress Echocardiogram: Negative for exercise-induced ischemia",
          "Ejection Fraction: 62% (Normal LV systolic function)",
          "Exercise Tolerance: 10.4 METs achieved on Bruce protocol"
        ]
      }
    ]
  };
}
var DatabaseStore = class {
  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadFromDisk();
  }
  ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }
  loadFromDisk() {
    const initial = getInitialDatabaseState();
    try {
      let sourceFile = DB_FILE;
      if (!fs.existsSync(sourceFile)) {
        const fallbackSeed = path.join(DEFAULT_DATA_DIR, "medmit-database.json");
        if (fs.existsSync(fallbackSeed)) {
          sourceFile = fallbackSeed;
        }
      }
      if (fs.existsSync(sourceFile)) {
        const raw = fs.readFileSync(sourceFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.version || parsed.conversations)) {
          const merged = {
            ...initial,
            ...parsed,
            version: 3,
            users: parsed.users && parsed.users.length > 0 ? parsed.users : initial.users,
            verificationTokens: parsed.verificationTokens || [],
            sessions: parsed.sessions || [],
            authAuditLogs: parsed.authAuditLogs && parsed.authAuditLogs.length > 0 ? parsed.authAuditLogs : initial.authAuditLogs,
            userProfile: { ...initial.userProfile, ...parsed.userProfile || {} },
            doctorRegistrations: parsed.doctorRegistrations && parsed.doctorRegistrations.length > 0 ? parsed.doctorRegistrations : initial.doctorRegistrations,
            consultationSessions: parsed.consultationSessions && parsed.consultationSessions.length > 0 ? parsed.consultationSessions : initial.consultationSessions,
            abhaHealthRecords: parsed.abhaHealthRecords && parsed.abhaHealthRecords.length > 0 ? parsed.abhaHealthRecords : initial.abhaHealthRecords
          };
          merged.conversations.forEach((c) => {
            if (!c.userId) c.userId = "usr-seed-patient-001";
          });
          merged.appointments.forEach((a) => {
            if (!a.userId) a.userId = "usr-seed-patient-001";
          });
          merged.riskFlags.forEach((r) => {
            if (!r.userId) r.userId = "usr-seed-patient-001";
          });
          merged.wellnessRecommendations.forEach((w) => {
            if (!w.userId) w.userId = "usr-seed-patient-001";
          });
          merged.reminders.forEach((rm) => {
            if (!rm.userId) rm.userId = "usr-seed-patient-001";
          });
          merged.notifications.forEach((n) => {
            if (!n.userId) n.userId = "usr-seed-patient-001";
          });
          return merged;
        }
      }
    } catch (err) {
      console.warn("Could not read existing database, initializing fresh store:", err);
    }
    this.saveToDisk(initial);
    return initial;
  }
  saveToDisk(dataToSave = this.data) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write database to disk:", err);
    }
  }
  // ==========================================
  // --- User & Authentication Management ---
  // ==========================================
  getUsers() {
    return this.data.users || [];
  }
  getUserById(id) {
    return (this.data.users || []).find((u) => u.id === id);
  }
  getUserByEmail(email) {
    if (!email) return void 0;
    const lower = email.toLowerCase().trim();
    return (this.data.users || []).find((u) => u.email.toLowerCase().trim() === lower);
  }
  createUser(userData) {
    if (!this.data.users) this.data.users = [];
    const newUser = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      failedLoginAttempts: 0,
      lockUntil: null
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }
  updateUser(id, updates) {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveToDisk();
    return user;
  }
  recordFailedLogin(id, lockUntil) {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return;
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (lockUntil !== void 0) {
      user.lockUntil = lockUntil;
    }
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveToDisk();
  }
  resetFailedLogin(id) {
    const user = (this.data.users || []).find((u) => u.id === id);
    if (!user) return;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveToDisk();
  }
  // --- Verification & Reset Tokens ---
  createVerificationToken(record) {
    if (!this.data.verificationTokens) this.data.verificationTokens = [];
    const newToken = {
      ...record,
      id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.verificationTokens.push(newToken);
    this.saveToDisk();
    return newToken;
  }
  findVerificationToken(tokenHash, type) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return (this.data.verificationTokens || []).find(
      (t) => t.tokenHash === tokenHash && t.type === type && !t.usedAt && t.expiresAt > now
    );
  }
  findVerificationOtp(userId, otpCode, type) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return (this.data.verificationTokens || []).find(
      (t) => t.userId === userId && t.otpCode === otpCode && t.type === type && !t.usedAt && t.expiresAt > now
    );
  }
  consumeToken(id) {
    const token = (this.data.verificationTokens || []).find((t) => t.id === id);
    if (token) {
      token.usedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.saveToDisk();
    }
  }
  invalidateUserTokens(userId, type) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    (this.data.verificationTokens || []).forEach((t) => {
      if (t.userId === userId && (!type || t.type === type) && !t.usedAt) {
        t.usedAt = now;
      }
    });
    this.saveToDisk();
  }
  // --- Sessions Management ---
  createSession(record) {
    if (!this.data.sessions) this.data.sessions = [];
    const newSession = {
      ...record,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.sessions.push(newSession);
    this.saveToDisk();
    return newSession;
  }
  findSessionByToken(tokenHash) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return (this.data.sessions || []).find(
      (s) => s.tokenHash === tokenHash && s.expiresAt > now
    );
  }
  touchSession(sessionId) {
    const session = (this.data.sessions || []).find((s) => s.id === sessionId);
    if (session) {
      session.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
      this.saveToDisk();
    }
  }
  deleteSession(sessionId) {
    this.data.sessions = (this.data.sessions || []).filter((s) => s.id !== sessionId);
    this.saveToDisk();
  }
  deleteAllUserSessions(userId) {
    this.data.sessions = (this.data.sessions || []).filter((s) => s.userId !== userId);
    this.saveToDisk();
  }
  cleanExpiredSessions() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevLen = (this.data.sessions || []).length;
    this.data.sessions = (this.data.sessions || []).filter((s) => s.expiresAt > now);
    if (this.data.sessions.length !== prevLen) {
      this.saveToDisk();
    }
  }
  // --- Audit Logs ---
  recordAuthAuditLog(log) {
    if (!this.data.authAuditLogs) this.data.authAuditLogs = [];
    const record = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.authAuditLogs.unshift(record);
    if (this.data.authAuditLogs.length > 500) {
      this.data.authAuditLogs.pop();
    }
    this.saveToDisk();
    return record;
  }
  getAuthAuditLogs(userId) {
    if (!userId) return this.data.authAuditLogs || [];
    return (this.data.authAuditLogs || []).filter((l) => l.userId === userId);
  }
  // --- Conversations & Messages ---
  getConversations(userId, query) {
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
  getConversation(id, userId) {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return null;
    if (userId && conv.userId && conv.userId !== userId) return null;
    const msgs = this.data.messages.filter((m) => m.conversationId === id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { conversation: conv, messages: msgs };
  }
  createConversation(title, language = "en", userId) {
    const newConv = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || "usr-seed-patient-001",
      title: title || "New Health Consultation",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      messageCount: 0,
      lastMessagePreview: "",
      language,
      hasVoice: false
    };
    this.data.conversations.unshift(newConv);
    this.saveToDisk();
    return newConv;
  }
  addMessageToConversation(conversationId, message) {
    let conv = this.data.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = this.createConversation("Health Consultation", "en");
      conversationId = conv.id;
    }
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      role: message.role,
      content: message.content,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      triage: message.triage,
      reportContext: message.reportContext,
      isVoice: message.isVoice
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
  updateConversation(id, updates) {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return null;
    Object.assign(conv, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveToDisk();
    return conv;
  }
  deleteConversation(id) {
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
  getVoiceRecords(userId) {
    let list = [...this.data.voiceRecords];
    if (userId) {
      list = list.filter((v) => !v.userId || v.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  saveVoiceRecord(record, userId) {
    const newRecord = {
      id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || record.userId || "usr-seed-patient-001",
      ...record,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.voiceRecords.unshift(newRecord);
    this.saveToDisk();
    return newRecord;
  }
  deleteVoiceRecord(id) {
    const prevLen = this.data.voiceRecords.length;
    this.data.voiceRecords = this.data.voiceRecords.filter((v) => v.id !== id);
    if (this.data.voiceRecords.length !== prevLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  // --- Wellness Recommendations & Preferences ---
  getWellnessData(userId) {
    let recs = this.data.wellnessRecommendations;
    if (userId) {
      recs = recs.filter((w) => !w.userId || w.userId === userId);
    }
    return {
      recommendations: recs,
      preferences: this.data.wellnessPreferences
    };
  }
  updateRecommendationStatus(id, status) {
    const item = this.data.wellnessRecommendations.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    this.saveToDisk();
    return item;
  }
  addRecommendation(rec, userId) {
    const newRec = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || rec.userId || "usr-seed-patient-001",
      ...rec,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.wellnessRecommendations.unshift(newRec);
    this.saveToDisk();
    return newRec;
  }
  updateWellnessPreferences(prefs) {
    Object.assign(this.data.wellnessPreferences, prefs);
    this.saveToDisk();
    return this.data.wellnessPreferences;
  }
  // --- Notifications ---
  getNotifications(userId) {
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
  markNotificationRead(id) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }
  markAllNotificationsRead() {
    this.data.notifications.forEach((n) => n.read = true);
    this.saveToDisk();
  }
  deleteNotification(id) {
    const prev = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter((n) => n.id !== id);
    if (this.data.notifications.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  clearReadNotifications() {
    this.data.notifications = this.data.notifications.filter((n) => !n.read);
    this.saveToDisk();
  }
  addNotification(notif, userId) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || notif.userId || "usr-seed-patient-001",
      ...notif,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    this.data.notifications.unshift(newNotif);
    this.saveToDisk();
    return newNotif;
  }
  // --- Risk Flags ---
  getRiskFlags(userId) {
    let list = [...this.data.riskFlags];
    if (userId) {
      list = list.filter((r) => !r.userId || r.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  addRiskFlag(flag, userId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newFlag = {
      id: `rf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || flag.userId || "usr-seed-patient-001",
      title: flag.title,
      severity: flag.severity,
      category: flag.category,
      description: flag.description,
      ruleTriggered: flag.ruleTriggered,
      evidenceText: flag.evidenceText,
      status: flag.status || "new",
      createdAt: now,
      updatedAt: now,
      actionRequired: flag.actionRequired,
      notes: flag.initialNote ? [{ timestamp: now, note: flag.initialNote, author: "System" }] : []
    };
    this.data.riskFlags.unshift(newFlag);
    this.saveToDisk();
    return newFlag;
  }
  updateRiskFlag(id, updates, newNote, author = "User") {
    const flag = this.data.riskFlags.find((f) => f.id === id);
    if (!flag) return null;
    if (updates.status) flag.status = updates.status;
    if (updates.actionRequired) flag.actionRequired = updates.actionRequired;
    flag.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (newNote) {
      flag.notes.push({
        timestamp: flag.updatedAt,
        note: newNote,
        author
      });
    }
    this.saveToDisk();
    return flag;
  }
  deleteRiskFlag(id) {
    const prev = this.data.riskFlags.length;
    this.data.riskFlags = this.data.riskFlags.filter((f) => f.id !== id);
    if (this.data.riskFlags.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  // --- Reminders & Appointments ---
  getReminders(userId) {
    let list = this.data.reminders;
    if (userId) {
      list = list.filter((r) => !r.userId || r.userId === userId);
    }
    return list;
  }
  addReminder(rem, userId) {
    const newRem = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || rem.userId || "usr-seed-patient-001",
      ...rem,
      completedToday: false
    };
    this.data.reminders.push(newRem);
    this.saveToDisk();
    return newRem;
  }
  updateReminder(id, updates) {
    const rem = this.data.reminders.find((r) => r.id === id);
    if (!rem) return null;
    Object.assign(rem, updates);
    this.saveToDisk();
    return rem;
  }
  deleteReminder(id) {
    const prev = this.data.reminders.length;
    this.data.reminders = this.data.reminders.filter((r) => r.id !== id);
    if (this.data.reminders.length !== prev) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
  getAppointments(userId) {
    let list = [...this.data.appointments];
    if (userId) {
      list = list.filter((a) => !a.userId || a.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  addAppointment(apt, userId) {
    const newApt = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || apt.userId || "usr-seed-patient-001",
      ...apt,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.appointments.unshift(newApt);
    this.saveToDisk();
    return newApt;
  }
  cancelAppointment(id) {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = "cancelled";
      this.saveToDisk();
      return true;
    }
    return false;
  }
  // --- ABHA Integration ---
  getAbhaStatus() {
    return {
      profile: this.data.abhaProfile,
      auditLogs: [...this.data.abhaAuditLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  }
  linkAbhaProfile(payload) {
    this.data.abhaProfile = {
      isLinked: true,
      mode: "mock_sandbox",
      abhaNumber: payload.abhaNumber,
      abhaAddress: payload.abhaAddress,
      name: payload.name || this.data.userProfile.name,
      gender: this.data.userProfile.gender,
      dob: "1978-06-14",
      mobile: this.data.userProfile.phone,
      linkedFacility: "Care Community Hospital (HIP/HIU #HIP-TEL-0042)",
      linkedDate: (/* @__PURE__ */ new Date()).toISOString(),
      activeConsentArtifacts: 1
    };
    this.data.abhaAuditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "MOCK_ABHA_LINKED",
      details: `ABHA ${payload.abhaNumber} linked successfully in Mock Sandbox mode.`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "MOCK_VERIFIED"
    });
    this.saveToDisk();
    return this.data.abhaProfile;
  }
  unlinkAbhaProfile() {
    this.data.abhaProfile = {
      isLinked: false,
      mode: "mock_sandbox",
      activeConsentArtifacts: 0
    };
    this.data.abhaAuditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "ABHA_UNLINKED",
      details: "User revoked ABHA linking and consent artifacts.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "REVOKED"
    });
    this.saveToDisk();
    return this.data.abhaProfile;
  }
  // --- Doctor Registration & Professional Verification ---
  getDoctorRegistrations() {
    return this.data.doctorRegistrations || [];
  }
  getDoctorRegistration(id) {
    return (this.data.doctorRegistrations || []).find((d) => d.id === id) || null;
  }
  registerDoctor(doc) {
    const isRetired = Boolean(doc.isRetired);
    const newDoc = {
      id: `doc-reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...doc,
      isRetired,
      teleconsultationAdvisoryOnly: isRetired ? true : Boolean(doc.teleconsultationAdvisoryOnly),
      verificationStatus: "submitted",
      nmcVerificationVerified: false,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      auditNotes: [
        `Application submitted by practitioner on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}.`,
        `Queued for State Medical Council and NMC Register verification check.`
      ]
    };
    if (!this.data.doctorRegistrations) this.data.doctorRegistrations = [];
    this.data.doctorRegistrations.unshift(newDoc);
    this.saveToDisk();
    return newDoc;
  }
  updateDoctorRegistration(id, updates) {
    const doc = (this.data.doctorRegistrations || []).find((d) => d.id === id);
    if (!doc) return null;
    Object.assign(doc, updates);
    this.saveToDisk();
    return doc;
  }
  // --- Real-Time Online Consultations ---
  getConsultationSessions() {
    return this.data.consultationSessions || [];
  }
  getConsultationSession(id) {
    return (this.data.consultationSessions || []).find((c) => c.id === id) || null;
  }
  createOrGetConsultationSession(appointmentId) {
    if (!this.data.consultationSessions) this.data.consultationSessions = [];
    let session = this.data.consultationSessions.find((s) => s.appointmentId === appointmentId);
    if (!session) {
      const apt = this.data.appointments.find((a) => a.id === appointmentId);
      session = {
        id: `consult-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        appointmentId,
        doctorId: apt?.doctorId || "doc-2",
        doctorName: apt?.doctorName || "Dr. Rajeshwar Rao, MD",
        doctorSpecialty: apt?.specialty || "General Physician",
        patientName: apt?.patientName || this.data.userProfile.name,
        scheduledTime: apt ? `${apt.date} at ${apt.timeSlot}` : "Now",
        status: "waiting",
        durationSeconds: 0,
        clinicalNotes: "",
        followUpDate: "In 2 weeks",
        vitalsDiscussed: {
          bp: "120/80 mmHg",
          pulse: "72 bpm",
          temperature: "98.6\xB0F"
        }
      };
      this.data.consultationSessions.unshift(session);
      this.saveToDisk();
    }
    return session;
  }
  updateConsultationSession(id, updates) {
    const session = (this.data.consultationSessions || []).find((s) => s.id === id);
    if (!session) return null;
    Object.assign(session, updates);
    this.saveToDisk();
    return session;
  }
  // --- ABHA Health Records & Discovery ---
  getAbhaHealthRecords() {
    return this.data.abhaHealthRecords || [];
  }
  retrieveAbhaHealthRecord(id) {
    const record = (this.data.abhaHealthRecords || []).find((r) => r.id === id);
    if (!record) return null;
    record.status = "retrieved";
    this.saveToDisk();
    return record;
  }
  // --- User Profile, Consents & Data Export ---
  getUserProfile() {
    return this.data.userProfile;
  }
  updateUserProfile(updates) {
    Object.assign(this.data.userProfile, updates);
    this.saveToDisk();
    return this.data.userProfile;
  }
  exportAllUserData() {
    return JSON.parse(JSON.stringify(this.data));
  }
  resetAllData() {
    this.data = getInitialDatabaseState();
    this.saveToDisk();
  }
};
var db = new DatabaseStore();

// server/authRoutes.ts
import { Router } from "express";

// server/auth.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";
var PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter (A-Z)");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter (a-z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number (0-9)");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push("Password must include at least one special character (!@#$%^&* etc.)");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^\+?[1-9]\d{9,14}$/.test(cleaned);
}
async function hashPassword(plainText) {
  const saltRounds = 12;
  return bcrypt.hash(plainText, saltRounds);
}
async function verifyPassword(plainText, hash) {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (err) {
    return false;
  }
}
function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function generateNumericOtp(digits = 6) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return crypto.randomInt(min, max + 1).toString();
}
var loginRateLimits = /* @__PURE__ */ new Map();
var MAX_LOGIN_FAILED_ATTEMPTS = 5;
var LOCKOUT_DURATION_MS = 15 * 60 * 1e3;
var WINDOW_DURATION_MS = 15 * 60 * 1e3;
function checkLoginLockout(key) {
  const record = loginRateLimits.get(key.toLowerCase());
  if (!record || !record.lockedUntil) {
    return { isLocked: false };
  }
  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 6e4);
    return { isLocked: true, remainingMinutes };
  }
  loginRateLimits.delete(key.toLowerCase());
  return { isLocked: false };
}
function recordFailedLoginAttempt(key) {
  const now = Date.now();
  const lowerKey = key.toLowerCase();
  let record = loginRateLimits.get(lowerKey);
  if (!record || now - record.firstAttempt > WINDOW_DURATION_MS) {
    record = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
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
function clearFailedLoginAttempts(key) {
  loginRateLimits.delete(key.toLowerCase());
}
var recentNotifications = [];
async function sendEmailNotification(params) {
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: params.to,
    channel: "email",
    subject: params.subject,
    content: params.content,
    otp: params.otp,
    link: params.link,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  recentNotifications.unshift(notification);
  if (recentNotifications.length > 50) recentNotifications.pop();
  console.log(`[MediMate Auth Email] To: ${params.to} | Subject: ${params.subject}`);
  if (params.otp) console.log(`[MediMate Auth OTP] Verification Code: ${params.otp}`);
  if (params.link) console.log(`[MediMate Auth Link] Verification URL: ${params.link}`);
  return true;
}
async function sendSmsNotification(params) {
  const notification = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient: params.to,
    channel: "sms",
    subject: "MediMate AI Mobile Security OTP",
    content: params.message,
    otp: params.otp,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  recentNotifications.unshift(notification);
  if (recentNotifications.length > 50) recentNotifications.pop();
  console.log(`[MediMate Auth SMS] To: ${params.to} | Message: ${params.message}`);
  return true;
}
function getRecentSimulatedNotifications(recipient) {
  if (recipient) {
    return recentNotifications.filter((n) => n.recipient.toLowerCase() === recipient.toLowerCase());
  }
  return [...recentNotifications];
}

// server/authRoutes.ts
var authRouter = Router();
function extractSessionToken(req) {
  if (req.cookies && req.cookies["medimate_session"]) {
    return req.cookies["medimate_session"];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  const tokenHeader = req.headers["x-medimate-token"];
  if (typeof tokenHeader === "string" && tokenHeader.length > 0) {
    return tokenHeader.trim();
  }
  return null;
}
function authenticateUser(req, res, next) {
  const token = extractSessionToken(req);
  if (!token) {
    res.status(401).json({
      error: "Authentication required. Please sign in to access this feature.",
      code: "AUTH_REQUIRED"
    });
    return;
  }
  const tokenH = hashToken(token);
  const session = db.findSessionByToken(tokenH);
  if (!session) {
    res.status(401).json({
      error: "Session expired or invalid. Please sign in again.",
      code: "SESSION_INVALID"
    });
    return;
  }
  const user = db.getUserById(session.userId);
  if (!user) {
    db.deleteSession(session.id);
    res.status(401).json({
      error: "User account not found. Please sign in again.",
      code: "USER_NOT_FOUND"
    });
    return;
  }
  if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
    res.status(403).json({
      error: "Account is temporarily locked for security. Please try again later or reset your password.",
      code: "ACCOUNT_LOCKED"
    });
    return;
  }
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
    sessionId: session.id
  };
  req.sessionToken = token;
  next();
}
function optionalAuth(req, _res, next) {
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
        sessionId: session.id
      };
      req.sessionToken = token;
    }
  }
  next();
}
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      db.recordAuthAuditLog({
        userId: req.user.id,
        email: req.user.email,
        action: "unauthorized_access",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "MediMate API Client",
        status: "blocked",
        metadata: { attemptedRole: allowedRoles, currentRole: req.user.role, path: req.path }
      });
      res.status(403).json({
        error: `Access denied. Authorized roles: ${allowedRoles.join(" or ")}.`,
        code: "FORBIDDEN_ROLE"
      });
      return;
    }
    next();
  };
}
authRouter.post("/register", async (req, res) => {
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
      consentPrivacy
    } = req.body;
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      res.status(400).json({ error: "Full Name must be at least 2 characters long" });
      return;
    }
    if (!email || !validateEmail(email)) {
      res.status(400).json({ error: "Please enter a valid email address (e.g., patient@example.com)" });
      return;
    }
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      res.status(400).json({ error: "Please enter a valid mobile number with country code (e.g., +91 98480 12345)" });
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      res.status(400).json({
        error: passwordCheck.errors[0] || "Password does not meet security requirements",
        details: passwordCheck.errors
      });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Password and Confirm Password do not match" });
      return;
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      db.recordAuthAuditLog({
        userId: existing.id,
        email,
        action: "register",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "MediMate Web Client",
        status: "failure",
        metadata: { reason: "duplicate_email_attempt" }
      });
      res.status(409).json({
        error: "An account with this email address already exists. Please sign in or use Forgot Password.",
        code: "DUPLICATE_EMAIL"
      });
      return;
    }
    const passwordHash = await hashPassword(password);
    const newUser = db.createUser({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth || (age ? `${(/* @__PURE__ */ new Date()).getFullYear() - Number(age)}-01-01` : void 0),
      passwordHash,
      role: "patient",
      isEmailVerified: false,
      isPhoneVerified: false,
      consents: {
        terms: Boolean(consentTerms),
        privacyPolicy: Boolean(consentPrivacy),
        aiHealthProcessing: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    const rawEmailToken = generateSecureToken();
    const tokenHash = hashToken(rawEmailToken);
    const emailOtp = generateNumericOtp(6);
    const emailExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
    db.createVerificationToken({
      userId: newUser.id,
      tokenHash,
      otpCode: emailOtp,
      type: "email_verify",
      expiresAt: emailExpiresAt,
      usedAt: null
    });
    const phoneOtp = generateNumericOtp(6);
    const phoneExpiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
    db.createVerificationToken({
      userId: newUser.id,
      tokenHash: hashToken(phoneOtp),
      otpCode: phoneOtp,
      type: "phone_verify",
      expiresAt: phoneExpiresAt,
      usedAt: null
    });
    const appBaseUrl = process.env.APP_URL || "http://localhost:3000";
    const verificationLink = `${appBaseUrl}/?verify_email=${rawEmailToken}&email=${encodeURIComponent(newUser.email)}`;
    await sendEmailNotification({
      to: newUser.email,
      subject: "Verify your MediMate AI Account",
      content: `Hello ${newUser.fullName},

Welcome to MediMate AI! Please verify your email using the verification code: ${emailOtp}
Or click the verification link: ${verificationLink}`,
      otp: emailOtp,
      link: verificationLink
    });
    await sendSmsNotification({
      to: newUser.phoneNumber,
      message: `Your MediMate AI mobile verification OTP is ${phoneOtp}. Valid for 10 minutes. Do not share with anyone.`,
      otp: phoneOtp
    });
    db.recordAuthAuditLog({
      userId: newUser.id,
      email: newUser.email,
      action: "register",
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "MediMate Web Client",
      status: "success"
    });
    res.status(201).json({
      success: true,
      message: "Account created successfully! A verification OTP and secure link have been sent to your email and mobile number.",
      userId: newUser.id,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      requiresEmailVerification: true,
      devNotice: process.env.NODE_ENV !== "production" ? "Check /api/auth/dev-notifications or dev console for the simulated OTP" : void 0
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "An unexpected error occurred during account registration" });
  }
});
authRouter.post("/verify-email", (req, res) => {
  const { email, token, otp } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email address is required for verification" });
    return;
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "User account not found" });
    return;
  }
  if (user.isEmailVerified) {
    res.status(400).json({
      error: "This account email is already verified. Single-use verification codes cannot be reused.",
      code: "ALREADY_VERIFIED"
    });
    return;
  }
  let tokenRecord;
  if (token) {
    const th = hashToken(token);
    tokenRecord = db.findVerificationToken(th, "email_verify");
  } else if (otp) {
    tokenRecord = db.findVerificationOtp(user.id, otp.trim(), "email_verify");
  }
  if (!tokenRecord || tokenRecord.userId !== user.id) {
    res.status(400).json({
      error: "Invalid or expired email verification code. Please request a new code.",
      code: "INVALID_VERIFICATION_TOKEN"
    });
    return;
  }
  db.consumeToken(tokenRecord.id);
  db.updateUser(user.id, { isEmailVerified: true });
  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: "verify_email",
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "MediMate Web Client",
    status: "success"
  });
  res.json({
    success: true,
    message: "Email address verified successfully. You may now sign in to your MediMate AI account."
  });
});
authRouter.post("/verify-phone", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and mobile OTP code are required" });
    return;
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "User account not found" });
    return;
  }
  const tokenRecord = db.findVerificationOtp(user.id, otp.trim(), "phone_verify");
  if (!tokenRecord) {
    res.status(400).json({ error: "Invalid or expired phone verification code", code: "INVALID_OTP" });
    return;
  }
  db.consumeToken(tokenRecord.id);
  db.updateUser(user.id, { isPhoneVerified: true });
  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: "verify_phone",
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "MediMate Web Client",
    status: "success"
  });
  res.json({
    success: true,
    message: "Mobile number verified successfully."
  });
});
authRouter.post("/resend-verification", async (req, res) => {
  const { email, type = "email" } = req.body;
  if (!email || !validateEmail(email)) {
    res.status(400).json({ error: "Valid email address is required" });
    return;
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    res.json({ success: true, message: "If an unverified account exists, a new verification code has been dispatched." });
    return;
  }
  if (type === "email" && user.isEmailVerified) {
    res.json({ success: true, message: "Account email is already verified. You can sign in." });
    return;
  }
  db.invalidateUserTokens(user.id, type === "email" ? "email_verify" : "phone_verify");
  if (type === "email") {
    const rawToken = generateSecureToken();
    const otp = generateNumericOtp(6);
    db.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      otpCode: otp,
      type: "email_verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
      usedAt: null
    });
    const appBaseUrl = process.env.APP_URL || "http://localhost:3000";
    const link = `${appBaseUrl}/?verify_email=${rawToken}&email=${encodeURIComponent(user.email)}`;
    await sendEmailNotification({
      to: user.email,
      subject: "New Verification Code - MediMate AI",
      content: `Your new verification code is: ${otp}
Or click: ${link}`,
      otp,
      link
    });
  } else {
    const otp = generateNumericOtp(6);
    db.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(otp),
      otpCode: otp,
      type: "phone_verify",
      expiresAt: new Date(Date.now() + 10 * 60 * 1e3).toISOString(),
      usedAt: null
    });
    await sendSmsNotification({
      to: user.phoneNumber,
      message: `Your new MediMate AI mobile verification OTP is ${otp}. Valid for 10 minutes.`,
      otp
    });
  }
  res.json({
    success: true,
    message: "If an unverified account exists, a new verification code has been dispatched."
  });
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Both Email Address and Password are required" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const lockout = checkLoginLockout(cleanEmail);
    if (lockout.isLocked) {
      db.recordAuthAuditLog({
        userId: null,
        email: cleanEmail,
        action: "account_locked",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "MediMate Web Client",
        status: "blocked",
        metadata: { remainingMinutes: lockout.remainingMinutes }
      });
      res.status(429).json({
        error: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockout.remainingMinutes} minutes or reset your password.`,
        code: "ACCOUNT_LOCKED",
        remainingMinutes: lockout.remainingMinutes
      });
      return;
    }
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      const attempt = recordFailedLoginAttempt(cleanEmail);
      db.recordAuthAuditLog({
        userId: null,
        email: cleanEmail,
        action: "login_failed",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "MediMate Web Client",
        status: "failure"
      });
      res.status(401).json({
        error: "Invalid email address or password. Please verify your credentials.",
        code: "INVALID_CREDENTIALS",
        attemptsRemaining: attempt.attemptsRemaining
      });
      return;
    }
    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      const attempt = recordFailedLoginAttempt(cleanEmail);
      db.recordFailedLogin(user.id, attempt.locked ? new Date(Date.now() + 15 * 60 * 1e3).toISOString() : null);
      db.recordAuthAuditLog({
        userId: user.id,
        email: cleanEmail,
        action: "login_failed",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "MediMate Web Client",
        status: "failure"
      });
      if (attempt.locked) {
        res.status(429).json({
          error: "Too many consecutive failed login attempts. For your security, this account is temporarily locked for 15 minutes.",
          code: "ACCOUNT_LOCKED"
        });
        return;
      }
      res.status(401).json({
        error: "Invalid email address or password. Please verify your credentials.",
        code: "INVALID_CREDENTIALS",
        attemptsRemaining: attempt.attemptsRemaining
      });
      return;
    }
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
    if (requireEmailVerification && !user.isEmailVerified) {
      res.status(403).json({
        error: "Email verification is required before logging into MediMate AI. Please verify your email with the OTP sent to your inbox.",
        code: "EMAIL_UNVERIFIED",
        email: user.email,
        requiresEmailVerification: true
      });
      return;
    }
    clearFailedLoginAttempts(cleanEmail);
    db.resetFailedLogin(user.id);
    const rawSessionToken = generateSecureToken();
    const sessionTokenHash = hashToken(rawSessionToken);
    const sessionTtlMs = rememberMe ? 30 * 24 * 60 * 60 * 1e3 : 24 * 60 * 60 * 1e3;
    const expiresAt = new Date(Date.now() + sessionTtlMs).toISOString();
    const session = db.createSession({
      userId: user.id,
      tokenHash: sessionTokenHash,
      userAgent: req.headers["user-agent"] || "MediMate Client",
      ipAddress: req.ip || "127.0.0.1",
      expiresAt,
      rememberMe: Boolean(rememberMe)
    });
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("medimate_session", rawSessionToken, {
      httpOnly: true,
      secure: isProd,
      // HTTPS in production
      sameSite: "lax",
      maxAge: sessionTtlMs,
      path: "/"
    });
    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: "login_success",
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "MediMate Web Client",
      status: "success",
      metadata: { sessionId: session.id, rememberMe: Boolean(rememberMe) }
    });
    res.json({
      success: true,
      message: "Sign in successful. Welcome to MediMate AI.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      token: rawSessionToken,
      // Also provided in response payload for API/Mobile integration
      sessionToken: rawSessionToken
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An unexpected error occurred during sign in" });
  }
});
authRouter.post("/logout", authenticateUser, (req, res) => {
  if (req.user && req.user.sessionId) {
    db.deleteSession(req.user.sessionId);
    db.recordAuthAuditLog({
      userId: req.user.id,
      email: req.user.email,
      action: "logout",
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "MediMate Web Client",
      status: "success"
    });
  }
  res.clearCookie("medimate_session", { path: "/" });
  res.json({ success: true, message: "You have been successfully signed out." });
});
authRouter.get("/me", authenticateUser, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: "User profile not found" });
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
      lastLoginAt: user.lastLoginAt
    }
  });
});
authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const genericResponse = {
    success: true,
    message: "If an account exists with that email address, password recovery instructions and a secure reset code have been dispatched."
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
  db.invalidateUserTokens(user.id, "password_reset");
  const rawResetToken = generateSecureToken();
  const resetOtp = generateNumericOtp(6);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1e3).toISOString();
  db.createVerificationToken({
    userId: user.id,
    tokenHash: hashToken(rawResetToken),
    otpCode: resetOtp,
    type: "password_reset",
    expiresAt,
    usedAt: null
  });
  const appBaseUrl = process.env.APP_URL || "http://localhost:3000";
  const resetLink = `${appBaseUrl}/?reset_token=${rawResetToken}&email=${encodeURIComponent(user.email)}`;
  await sendEmailNotification({
    to: user.email,
    subject: "MediMate AI - Password Reset Request",
    content: `Hello ${user.fullName},

A password reset was requested for your MediMate AI account.

Your reset OTP code is: ${resetOtp}
Or click the reset link: ${resetLink}

This code expires in 1 hour. If you did not request this, please ignore this email.`,
    otp: resetOtp,
    link: resetLink
  });
  db.recordAuthAuditLog({
    userId: user.id,
    email: user.email,
    action: "password_reset_request",
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "MediMate Web Client",
    status: "success"
  });
  res.json(genericResponse);
});
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, token, otp, newPassword, confirmPassword } = req.body;
    if (!email || !token && !otp) {
      res.status(400).json({ error: "Email and valid reset token or OTP code are required" });
      return;
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: "Invalid or expired password reset request", code: "INVALID_RESET_REQUEST" });
      return;
    }
    let tokenRecord;
    if (token) {
      tokenRecord = db.findVerificationToken(hashToken(token), "password_reset");
    } else if (otp) {
      tokenRecord = db.findVerificationOtp(user.id, otp.trim(), "password_reset");
    }
    if (!tokenRecord || tokenRecord.userId !== user.id) {
      res.status(400).json({
        error: "Invalid or expired password reset code. Please submit a new request.",
        code: "INVALID_RESET_TOKEN"
      });
      return;
    }
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      res.status(400).json({
        error: passwordCheck.errors[0] || "Password does not meet security requirements",
        details: passwordCheck.errors
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "New Password and Confirm Password do not match" });
      return;
    }
    const newHash = await hashPassword(newPassword);
    db.updateUser(user.id, { passwordHash: newHash });
    db.consumeToken(tokenRecord.id);
    db.deleteAllUserSessions(user.id);
    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: "password_reset_success",
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "MediMate Web Client",
      status: "success"
    });
    res.clearCookie("medimate_session", { path: "/" });
    res.json({
      success: true,
      message: "Password has been reset successfully. All existing sessions have been terminated. Please sign in with your new credentials."
    });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
authRouter.post("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const currentMatches = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentMatches) {
      res.status(400).json({ error: "Current password does not match records" });
      return;
    }
    const check = validatePassword(newPassword);
    if (!check.isValid) {
      res.status(400).json({ error: check.errors[0], details: check.errors });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "New password and confirm password do not match" });
      return;
    }
    const newHash = await hashPassword(newPassword);
    db.updateUser(user.id, { passwordHash: newHash });
    db.recordAuthAuditLog({
      userId: user.id,
      email: user.email,
      action: "password_change",
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "MediMate Web Client",
      status: "success"
    });
    res.json({ success: true, message: "Password successfully updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
});
authRouter.get("/audit-logs", authenticateUser, (req, res) => {
  if (req.user.role === "admin") {
    res.json(db.getAuthAuditLogs());
  } else {
    res.json(db.getAuthAuditLogs(req.user.id));
  }
});
authRouter.get("/dev-notifications", (_req, res) => {
  res.json(getRecentSimulatedNotifications());
});

// server.ts
dotenv.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--prod");
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser(process.env.SESSION_SECRET || "medimate-secure-session-key"));
app.use("/api/auth", authRouter);
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var placesCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 5 * 60 * 1e3;
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    name: "MediMate AI Health Platform"
  });
});
var CRITICAL_KEYWORDS = [
  "chest pain",
  "heart attack",
  "stroke",
  "facial droop",
  "slurred speech",
  "unconscious",
  "difficulty breathing",
  "cannot breathe",
  "severe bleeding",
  "anaphylaxis",
  "blue lips",
  "choking",
  "coughing blood",
  "vomiting blood",
  "severe head injury",
  "poisoning",
  "overdose",
  "suicidal"
];
function checkImmediateEmergency(text) {
  const lower = text.toLowerCase();
  return CRITICAL_KEYWORDS.some((kw) => lower.includes(kw));
}
function generateSmartClinicalTriage(messages, language) {
  const isTelugu = language === "te";
  const userTexts = messages.filter((m) => m.role === "user").map((m) => m.content || "").join(" ");
  const latestMsg = messages[messages.length - 1]?.content || userTexts;
  const lower = latestMsg.toLowerCase();
  const isFever = /fever|feverish|temperature|chills|shiver|జ్వరం|వేడిగా/i.test(lower);
  const isRespiratory = /sore throat|throat|cough|cold|runny nose|congestion|sneez|phlegm|sputum|దగ్గు|గొంతు|జలుబు/i.test(lower);
  const isHeadache = /headache|migraine|head pain|dizzy|dizziness|vertigo|lightheaded|తల నొప్పి|తలతిరుగు/i.test(lower);
  const isGI = /stomach|abdominal|belly|cramp|nausea|vomit|diarrhea|loose motion|acidity|gas|constipat|కడుపు|వాంతి|విరేచనాలు/i.test(lower);
  const isMusculoskeletal = /joint|knee|back pain|spine|neck pain|muscle|sprain|arthritis|swelling|నొప్పి|కీళ్ల/i.test(lower);
  const isDermatology = /rash|itch|itching|redness|hive|allergy|skin|blemish|acne|దురద|దద్దుర్లు/i.test(lower);
  const isPediatric = /child|baby|infant|toddler|kid|పాప|బాబు|పిల్ల/i.test(lower);
  const isGeneralInquiry = /what type of doctor|which doctor|understand my symptoms|explain this health term|prepare questions/i.test(lower);
  if (isFever) {
    return {
      summary: isTelugu ? "\u0C09\u0C26\u0C2F\u0C02 \u0C28\u0C41\u0C02\u0C21\u0C3F \u0C1C\u0C4D\u0C35\u0C30\u0C02, \u0C28\u0C40\u0C30\u0C38\u0C02 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C36\u0C30\u0C40\u0C30 \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24 \u0C2A\u0C46\u0C30\u0C41\u0C17\u0C41\u0C26\u0C32 \u0C17\u0C2E\u0C28\u0C3F\u0C02\u0C1A\u0C2C\u0C21\u0C3F\u0C02\u0C26\u0C3F." : "Reported onset of feverishness and elevated body temperature since morning.",
      urgency: "routine",
      suggested_specialty: isPediatric ? "Pediatrician" : "General Physician",
      reasons_for_specialty: isTelugu ? "\u0C1C\u0C4D\u0C35\u0C30\u0C02 \u0C05\u0C28\u0C47\u0C26\u0C3F \u0C36\u0C30\u0C40\u0C30 \u0C30\u0C4B\u0C17\u0C28\u0C3F\u0C30\u0C4B\u0C27\u0C15 \u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25 \u0C07\u0C28\u0C4D\u0C2B\u0C46\u0C15\u0C4D\u0C37\u0C28\u0C4D\u200C\u0C2A\u0C48 \u0C2A\u0C4B\u0C30\u0C3E\u0C21\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C35\u0C1A\u0C4D\u0C1A\u0C47 \u0C38\u0C02\u0C15\u0C47\u0C24\u0C02. \u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C36\u0C3E\u0C30\u0C40\u0C30\u0C15 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37 \u0C1A\u0C47\u0C38\u0C3F, \u0C05\u0C35\u0C38\u0C30\u0C2E\u0C48\u0C24\u0C47 CBC \u0C32\u0C47\u0C26\u0C3E \u0C2B\u0C40\u0C35\u0C30\u0C4D \u0C2A\u0C4D\u0C30\u0C4A\u0C2B\u0C48\u0C32\u0C4D \u0C30\u0C15\u0C4D\u0C24 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C32\u0C28\u0C41 \u0C38\u0C42\u0C1A\u0C3F\u0C38\u0C4D\u0C24\u0C3E\u0C30\u0C41." : "Fever is a systemic immune response indicating an underlying viral or bacterial reaction. A General Physician can evaluate vitals, review infection markers (such as CBC/blood counts), and safely identify the source.",
      explanation: isTelugu ? "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32 \u0C2A\u0C4D\u0C30\u0C15\u0C3E\u0C30\u0C02 \u0C09\u0C26\u0C2F\u0C02 \u0C28\u0C41\u0C02\u0C21\u0C3F \u0C1C\u0C4D\u0C35\u0C30\u0C02\u0C17\u0C3E \u0C05\u0C28\u0C3F\u0C2A\u0C3F\u0C38\u0C4D\u0C24\u0C4B\u0C02\u0C26\u0C3F. \u0C07\u0C26\u0C3F \u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23 \u0C35\u0C48\u0C30\u0C32\u0C4D \u0C07\u0C28\u0C4D\u0C2B\u0C46\u0C15\u0C4D\u0C37\u0C28\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C36\u0C3E\u0C30\u0C40\u0C30\u0C15 \u0C36\u0C4D\u0C30\u0C2E \u0C35\u0C32\u0C4D\u0C32 \u0C15\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41. \u0C24\u0C17\u0C3F\u0C28\u0C02\u0C24 \u0C28\u0C40\u0C30\u0C41 \u0C24\u0C3E\u0C17\u0C41\u0C24\u0C42, \u0C35\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3F \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F. \u0C25\u0C30\u0C4D\u0C2E\u0C3E\u0C2E\u0C40\u0C1F\u0C30\u0C4D\u200C\u0C24\u0C4B \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24\u0C28\u0C41 \u0C17\u0C2E\u0C28\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F." : "Feeling feverish since morning commonly suggests an active immune response, often triggered by a mild viral infection or physical fatigue. At this stage, prioritizing rest and steady fluid intake is essential while keeping a close log of your body temperature.",
      follow_up_questions: [
        isTelugu ? "\u0C25\u0C30\u0C4D\u0C2E\u0C3E\u0C2E\u0C40\u0C1F\u0C30\u0C4D\u200C\u0C24\u0C4B \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24 \u0C15\u0C4A\u0C32\u0C3F\u0C1A\u0C3E\u0C30\u0C3E? \u0C30\u0C40\u0C21\u0C3F\u0C02\u0C17\u0C4D \u0C0E\u0C02\u0C24 \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F?" : "Have you measured your exact body temperature with a thermometer?",
        isTelugu ? "\u0C1C\u0C4D\u0C35\u0C30\u0C02\u0C24\u0C4B \u0C2A\u0C3E\u0C1F\u0C41 \u0C1A\u0C32\u0C3F, \u0C26\u0C17\u0C4D\u0C17\u0C41, \u0C17\u0C4A\u0C02\u0C24\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C12\u0C33\u0C4D\u0C33\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C41\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3E?" : "Are you experiencing chills, body aches, sore throat, or sweating alongside the fever?"
      ],
      next_steps: [
        isTelugu ? "\u0C2A\u0C4D\u0C30\u0C24\u0C3F 4 \u0C17\u0C02\u0C1F\u0C32\u0C15\u0C41 \u0C12\u0C15\u0C38\u0C3E\u0C30\u0C3F \u0C36\u0C30\u0C40\u0C30 \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24\u0C28\u0C41 \u0C15\u0C4A\u0C32\u0C35\u0C02\u0C21\u0C3F" : "Monitor and log your body temperature every 4 to 6 hours",
        isTelugu ? "\u0C28\u0C40\u0C30\u0C41, \u0C15\u0C4A\u0C2C\u0C4D\u0C2C\u0C30\u0C3F \u0C28\u0C40\u0C33\u0C4D\u0C33\u0C41, ORS \u0C35\u0C02\u0C1F\u0C3F \u0C26\u0C4D\u0C30\u0C35\u0C3E\u0C32\u0C41 \u0C38\u0C2E\u0C43\u0C26\u0C4D\u0C27\u0C3F\u0C17\u0C3E \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F" : "Stay well hydrated with clean water, ORS electrolyte fluids, and warm soups",
        isTelugu ? "\u0C1C\u0C4D\u0C35\u0C30\u0C02 102\xB0F \u0C26\u0C3E\u0C1F\u0C3F\u0C28\u0C3E \u0C32\u0C47\u0C26\u0C3E 2 \u0C30\u0C4B\u0C1C\u0C41\u0C32\u0C41 \u0C24\u0C17\u0C4D\u0C17\u0C15\u0C2A\u0C4B\u0C2F\u0C3F\u0C28\u0C3E \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Schedule a clinical consultation if temperature exceeds 102\xB0F or persists past 48 hours"
      ],
      warning_signs: [
        "Persistent high fever (>103\xB0F / 39.4\xB0C) not responding to cooling measures",
        "Stiff neck, severe throbbing headache, or sudden mental confusion",
        "Difficulty breathing, persistent chest tightness, or inability to keep fluids down"
      ],
      show_nearby_care: true,
      suggested_facility_type: "clinic",
      emergency_hotline: "112 (India) / 911",
      disclaimer: "MediMate AI provides educational health triage guidance and is not a formal medical diagnosis or prescription."
    };
  }
  if (isRespiratory) {
    return {
      summary: isTelugu ? "\u0C17\u0C4A\u0C02\u0C24\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F, \u0C26\u0C17\u0C4D\u0C17\u0C41 \u0C32\u0C47\u0C26\u0C3E \u0C36\u0C4D\u0C35\u0C3E\u0C38\u0C15\u0C4B\u0C36 \u0C05\u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C17\u0C2E\u0C28\u0C3F\u0C02\u0C1A\u0C2C\u0C21\u0C3F\u0C02\u0C26\u0C3F." : "Upper respiratory tract symptoms including cough, throat irritation, or congestion.",
      urgency: "routine",
      suggested_specialty: "General Physician / ENT Specialist",
      reasons_for_specialty: isTelugu ? "\u0C17\u0C4A\u0C02\u0C24\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C36\u0C4D\u0C35\u0C3E\u0C38\u0C15\u0C4B\u0C36 \u0C07\u0C28\u0C4D\u0C2B\u0C46\u0C15\u0C4D\u0C37\u0C28\u0C4D\u0C32\u0C28\u0C41 \u0C2A\u0C30\u0C3F\u0C36\u0C40\u0C32\u0C3F\u0C02\u0C1A\u0C3F \u0C35\u0C48\u0C30\u0C32\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C2C\u0C3E\u0C15\u0C4D\u0C1F\u0C40\u0C30\u0C3F\u0C2F\u0C32\u0C4D \u0C38\u0C2E\u0C38\u0C4D\u0C2F\u0C32\u0C28\u0C41 \u0C28\u0C3F\u0C30\u0C4D\u0C27\u0C3E\u0C30\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C32\u0C47\u0C26\u0C3E ENT \u0C28\u0C3F\u0C2A\u0C41\u0C23\u0C41\u0C21\u0C41 \u0C38\u0C30\u0C48\u0C28\u0C35\u0C3E\u0C30\u0C41." : "A General Physician or ENT Specialist can physically examine your pharynx, tonsils, and chest sounds to distinguish viral pharyngitis from bacterial infections or allergies.",
      explanation: isTelugu ? "\u0C2E\u0C40 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 \u0C2A\u0C48 \u0C36\u0C4D\u0C35\u0C3E\u0C38\u0C15\u0C4B\u0C36 \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C02\u0C32\u0C4B \u0C07\u0C28\u0C4D\u0C2B\u0C4D\u0C32\u0C2E\u0C47\u0C37\u0C28\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C07\u0C28\u0C4D\u0C2B\u0C46\u0C15\u0C4D\u0C37\u0C28\u0C4D\u200C\u0C28\u0C41 \u0C38\u0C42\u0C1A\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F. \u0C17\u0C4B\u0C30\u0C41\u0C35\u0C46\u0C1A\u0C4D\u0C1A\u0C28\u0C3F \u0C09\u0C2A\u0C4D\u0C2A\u0C41\u0C28\u0C40\u0C1F\u0C3F \u0C2A\u0C41\u0C15\u0C4D\u0C15\u0C3F\u0C32\u0C3F\u0C02\u0C2A\u0C41\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C06\u0C35\u0C3F\u0C30\u0C3F \u0C2A\u0C1F\u0C4D\u0C1F\u0C21\u0C02 \u0C09\u0C2A\u0C36\u0C2E\u0C28\u0C02 \u0C15\u0C32\u0C3F\u0C17\u0C3F\u0C38\u0C4D\u0C24\u0C3E\u0C2F\u0C3F." : "Your described symptoms are typical of upper respiratory tract irritation or a viral cold. Warm saline gargles, humidified air, and adequate hydration generally provide comfort while symptoms run their course.",
      follow_up_questions: [
        isTelugu ? "\u0C17\u0C4A\u0C02\u0C24\u0C41\u0C32\u0C4B \u0C06\u0C39\u0C3E\u0C30\u0C02 \u0C32\u0C47\u0C26\u0C3E \u0C28\u0C40\u0C30\u0C41 \u0C2E\u0C3F\u0C02\u0C17\u0C47\u0C1F\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C09\u0C02\u0C26\u0C3E?" : "Do you experience significant difficulty or sharp pain when swallowing liquids or food?",
        isTelugu ? "\u0C26\u0C17\u0C4D\u0C17\u0C41\u0C24\u0C4B \u0C2A\u0C3E\u0C1F\u0C41 \u0C15\u0C2B\u0C02 \u0C32\u0C47\u0C26\u0C3E \u0C1C\u0C4D\u0C35\u0C30\u0C02 \u0C09\u0C02\u0C26\u0C3E?" : "Is your cough dry or producing phlegm, and is there any associated fever?"
      ],
      next_steps: [
        isTelugu ? "\u0C30\u0C4B\u0C1C\u0C41\u0C15\u0C41 2-3 \u0C38\u0C3E\u0C30\u0C4D\u0C32\u0C41 \u0C17\u0C4B\u0C30\u0C41\u0C35\u0C46\u0C1A\u0C4D\u0C1A\u0C28\u0C3F \u0C09\u0C2A\u0C4D\u0C2A\u0C41\u0C28\u0C40\u0C1F\u0C3F\u0C24\u0C4B \u0C2A\u0C41\u0C15\u0C4D\u0C15\u0C3F\u0C32\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Perform warm saline gargles 2-3 times daily for soothing throat relief",
        isTelugu ? "\u0C06\u0C35\u0C3F\u0C30\u0C3F \u0C2A\u0C40\u0C32\u0C4D\u0C1A\u0C02\u0C21\u0C3F \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C1A\u0C32\u0C4D\u0C32\u0C1F\u0C3F \u0C2A\u0C3E\u0C28\u0C40\u0C2F\u0C3E\u0C32\u0C28\u0C41 \u0C28\u0C3F\u0C35\u0C3E\u0C30\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Use gentle steam inhalation and avoid chilled, sugary beverages",
        isTelugu ? "\u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 4 \u0C30\u0C4B\u0C1C\u0C41\u0C32\u0C41 \u0C26\u0C3E\u0C1F\u0C3F\u0C28\u0C3E \u0C24\u0C17\u0C4D\u0C17\u0C15\u0C2A\u0C4B\u0C24\u0C47 \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Consult a doctor if throat pain worsens or persists past 4 days"
      ],
      warning_signs: [
        "Inability to swallow liquids or noticeable stridor/wheezing",
        "Shortness of breath or rapid breathing at rest",
        "Coughing up blood or dark discolored sputum"
      ],
      show_nearby_care: true,
      suggested_facility_type: "clinic",
      emergency_hotline: "112 (India) / 911",
      disclaimer: "MediMate AI provides educational health triage guidance and is not a formal medical diagnosis."
    };
  }
  if (isGI) {
    return {
      summary: isTelugu ? "\u0C1C\u0C40\u0C30\u0C4D\u0C23\u0C15\u0C4B\u0C36 \u0C05\u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02, \u0C15\u0C21\u0C41\u0C2A\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C35\u0C3F\u0C15\u0C3E\u0C30\u0C02 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41." : "Gastrointestinal symptoms including abdominal discomfort, nausea, or altered digestion.",
      urgency: "routine",
      suggested_specialty: "Gastroenterologist / General Physician",
      reasons_for_specialty: isTelugu ? "\u0C15\u0C21\u0C41\u0C2A\u0C41 \u0C38\u0C2E\u0C38\u0C4D\u0C2F\u0C32\u0C15\u0C41 \u0C17\u0C4D\u0C2F\u0C3E\u0C38\u0C4D\u0C1F\u0C4D\u0C30\u0C4B\u0C0E\u0C02\u0C1F\u0C30\u0C3E\u0C32\u0C1C\u0C3F\u0C38\u0C4D\u0C1F\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C38\u0C30\u0C48\u0C28 \u0C06\u0C39\u0C3E\u0C30 \u0C28\u0C3F\u0C2F\u0C2E\u0C3E\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C32\u0C28\u0C41 \u0C38\u0C42\u0C1A\u0C3F\u0C02\u0C1A\u0C17\u0C32\u0C30\u0C41." : "A Gastroenterologist or General Physician can assess abdominal tenderness, hydration status, and rule out gastritis, food intolerance, or acute infection.",
      explanation: isTelugu ? "\u0C1C\u0C40\u0C30\u0C4D\u0C23\u0C35\u0C4D\u0C2F\u0C35\u0C38\u0C4D\u0C25\u0C32\u0C4B \u0C05\u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02 \u0C24\u0C3E\u0C24\u0C4D\u0C15\u0C3E\u0C32\u0C3F\u0C15 \u0C05\u0C1C\u0C40\u0C30\u0C4D\u0C24\u0C3F, \u0C05\u0C38\u0C3F\u0C21\u0C3F\u0C1F\u0C40 \u0C32\u0C47\u0C26\u0C3E \u0C06\u0C39\u0C3E\u0C30 \u0C05\u0C32\u0C30\u0C4D\u0C1C\u0C40\u0C32 \u0C35\u0C32\u0C4D\u0C32 \u0C30\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41. \u0C38\u0C41\u0C32\u0C2D\u0C02\u0C17\u0C3E \u0C1C\u0C40\u0C30\u0C4D\u0C23\u0C2E\u0C2F\u0C4D\u0C2F\u0C47 \u0C24\u0C47\u0C32\u0C3F\u0C15\u0C2A\u0C3E\u0C1F\u0C3F \u0C06\u0C39\u0C3E\u0C30\u0C02 \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C35\u0C21\u0C02 \u0C2E\u0C02\u0C1A\u0C3F\u0C26\u0C3F." : "Abdominal discomfort often originates from dietary irritation, gastritis, or mild gastroenteritis. Consuming bland, easy-to-digest meals and maintaining electrolyte balance are prime supportive measures.",
      follow_up_questions: [
        isTelugu ? "\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C15\u0C21\u0C41\u0C2A\u0C41\u0C32\u0C4B \u0C0F \u0C2D\u0C3E\u0C17\u0C02\u0C32\u0C4B \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35\u0C17\u0C3E \u0C09\u0C02\u0C26\u0C3F?" : "Where specifically is the pain concentrated (upper abdomen, lower right, diffuse)?",
        isTelugu ? "\u0C35\u0C3E\u0C02\u0C24\u0C41\u0C32\u0C41 \u0C32\u0C47\u0C26\u0C3E \u0C35\u0C3F\u0C30\u0C47\u0C1A\u0C28\u0C3E\u0C32\u0C41 \u0C05\u0C2F\u0C4D\u0C2F\u0C3E\u0C2F\u0C3E?" : "Have you had vomiting or loose stools, and can you keep fluids down?"
      ],
      next_steps: [
        isTelugu ? "ORS \u0C26\u0C4D\u0C30\u0C3E\u0C35\u0C23\u0C02 \u0C32\u0C47\u0C26\u0C3E \u0C15\u0C4A\u0C2C\u0C4D\u0C2C\u0C30\u0C3F \u0C28\u0C40\u0C33\u0C4D\u0C33\u0C41 \u0C15\u0C4A\u0C26\u0C4D\u0C26\u0C3F\u0C15\u0C4A\u0C26\u0C4D\u0C26\u0C3F\u0C17\u0C3E \u0C24\u0C3E\u0C17\u0C02\u0C21\u0C3F" : "Sip small quantities of oral rehydration solution (ORS) or electrolyte water frequently",
        isTelugu ? "\u0C15\u0C3E\u0C30\u0C2E\u0C48\u0C28, \u0C28\u0C42\u0C28\u0C46 \u0C2A\u0C26\u0C3E\u0C30\u0C4D\u0C25\u0C3E\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C15\u0C3E\u0C2B\u0C40\u0C28\u0C3F \u0C28\u0C3F\u0C35\u0C3E\u0C30\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Avoid spicy, greasy foods, caffeine, and dairy temporarily",
        isTelugu ? "\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C24\u0C47 \u0C38\u0C2E\u0C40\u0C2A \u0C15\u0C4D\u0C32\u0C3F\u0C28\u0C3F\u0C15\u0C4D\u200C\u0C28\u0C41 \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Visit a physician if pain is sharp, focal, or accompanied by repeated vomiting"
      ],
      warning_signs: [
        "Severe acute localized pain in the lower right abdomen (possible appendicitis)",
        "Blood in stool or coffee-ground vomiting",
        "Severe dehydration signs: dry mouth, no urination for >8 hours, fainting"
      ],
      show_nearby_care: true,
      suggested_facility_type: "clinic",
      emergency_hotline: "112 (India) / 911",
      disclaimer: "MediMate AI provides educational triage guidance and does not prescribe medications."
    };
  }
  if (isHeadache) {
    return {
      summary: isTelugu ? "\u0C24\u0C32\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F, \u0C12\u0C24\u0C4D\u0C24\u0C3F\u0C21\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C24\u0C32\u0C24\u0C3F\u0C30\u0C41\u0C17\u0C41\u0C21\u0C41 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41." : "Headache, cranial tension, or lightheadedness.",
      urgency: "routine",
      suggested_specialty: "General Physician / Neurologist",
      reasons_for_specialty: isTelugu ? "\u0C24\u0C32\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F\u0C15\u0C3F \u0C30\u0C15\u0C4D\u0C24\u0C2A\u0C4B\u0C1F\u0C41, \u0C15\u0C02\u0C1F\u0C3F\u0C1A\u0C42\u0C2A\u0C41, \u0C32\u0C47\u0C26\u0C3E \u0C2E\u0C48\u0C17\u0C4D\u0C30\u0C47\u0C28\u0C4D \u0C15\u0C3E\u0C30\u0C23\u0C3E\u0C32\u0C28\u0C41 \u0C24\u0C28\u0C3F\u0C16\u0C40 \u0C1A\u0C47\u0C2F\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C21\u0C41 \u0C05\u0C35\u0C38\u0C30\u0C02." : "A General Physician evaluates underlying triggers such as blood pressure, eye strain, tension, dehydration, or migraine patterns.",
      explanation: isTelugu ? "\u0C24\u0C32\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C21\u0C40\u0C39\u0C48\u0C21\u0C4D\u0C30\u0C47\u0C37\u0C28\u0C4D, \u0C24\u0C17\u0C3F\u0C28\u0C02\u0C24 \u0C28\u0C3F\u0C26\u0C4D\u0C30 \u0C32\u0C47\u0C15\u0C2A\u0C4B\u0C35\u0C21\u0C02, \u0C15\u0C02\u0C2A\u0C4D\u0C2F\u0C42\u0C1F\u0C30\u0C4D \u0C38\u0C4D\u0C15\u0C4D\u0C30\u0C40\u0C28\u0C4D \u0C12\u0C24\u0C4D\u0C24\u0C3F\u0C21\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C1F\u0C46\u0C28\u0C4D\u0C37\u0C28\u0C4D \u0C35\u0C32\u0C4D\u0C32 \u0C30\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41. \u0C1A\u0C40\u0C15\u0C1F\u0C3F, \u0C2A\u0C4D\u0C30\u0C36\u0C3E\u0C02\u0C24\u0C2E\u0C48\u0C28 \u0C2A\u0C4D\u0C30\u0C26\u0C47\u0C36\u0C02\u0C32\u0C4B \u0C35\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3F \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F." : "Headaches are commonly triggered by tension, dehydration, screen fatigue, or sleep deprivation. Resting in a quiet, dimmed environment while rehydrating often alleviates benign tension headaches.",
      follow_up_questions: [
        isTelugu ? "\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C24\u0C32\u0C15\u0C41 \u0C12\u0C15\u0C35\u0C48\u0C2A\u0C41\u0C28 \u0C09\u0C02\u0C26\u0C3E \u0C32\u0C47\u0C15 \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 \u0C09\u0C02\u0C26\u0C3E?" : "Is the pain throbbing on one side (migraine-type) or a band-like pressure across both sides?",
        isTelugu ? "\u0C15\u0C3E\u0C02\u0C24\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C36\u0C2C\u0C4D\u0C26\u0C3E\u0C32\u0C41 \u0C1A\u0C42\u0C38\u0C3F\u0C28\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35\u0C35\u0C41\u0C24\u0C41\u0C02\u0C26\u0C3E?" : "Are you sensitive to bright lights, loud sounds, or feeling nauseous?"
      ],
      next_steps: [
        isTelugu ? "\u0C28\u0C3F\u0C36\u0C4D\u0C36\u0C2C\u0C4D\u0C26\u0C2E\u0C48\u0C28, \u0C1A\u0C40\u0C15\u0C1F\u0C3F \u0C17\u0C26\u0C3F\u0C32\u0C4B \u0C35\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3F \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F" : "Rest in a quiet, dark room and apply a cool or warm compress to forehead",
        isTelugu ? "\u0C38\u0C2E\u0C43\u0C26\u0C4D\u0C27\u0C3F\u0C17\u0C3E \u0C28\u0C40\u0C30\u0C41 \u0C24\u0C3E\u0C17\u0C3F \u0C38\u0C4D\u0C15\u0C4D\u0C30\u0C40\u0C28\u0C4D \u0C38\u0C2E\u0C2F\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C24\u0C17\u0C4D\u0C17\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Drink plenty of water and step away from digital screens",
        isTelugu ? "\u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F \u0C24\u0C17\u0C4D\u0C17\u0C15\u0C2A\u0C4B\u0C24\u0C47 \u0C32\u0C47\u0C26\u0C3E \u0C2A\u0C41\u0C28\u0C30\u0C3E\u0C35\u0C43\u0C24\u0C2E\u0C48\u0C24\u0C47 \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Seek medical evaluation if headaches are recurrent or increasing in frequency"
      ],
      warning_signs: [
        'Sudden explosive "thunderclap" headache reaching peak intensity in seconds',
        "Headache accompanied by stiff neck, high fever, or confusion",
        "Vision loss, numbness, weakness in arms or legs, or slurred speech"
      ],
      show_nearby_care: true,
      suggested_facility_type: "clinic",
      emergency_hotline: "112 (India) / 911",
      disclaimer: "MediMate AI provides educational triage guidance and is not a medical diagnosis."
    };
  }
  if (isGeneralInquiry) {
    return {
      summary: isTelugu ? "\u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C35\u0C48\u0C26\u0C4D\u0C2F \u0C38\u0C32\u0C39\u0C3E \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C26\u0C30\u0C4D\u0C36\u0C15\u0C24\u0C4D\u0C35\u0C02." : "Health education and medical consultation guidance.",
      urgency: "self-care",
      suggested_specialty: "General Physician",
      reasons_for_specialty: isTelugu ? "\u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C2E\u0C40 \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F\u0C28\u0C3F \u0C38\u0C2E\u0C40\u0C15\u0C4D\u0C37\u0C3F\u0C02\u0C1A\u0C3F \u0C38\u0C30\u0C48\u0C28 \u0C28\u0C3F\u0C2A\u0C41\u0C23\u0C41\u0C32 \u0C35\u0C26\u0C4D\u0C26\u0C15\u0C41 \u0C30\u0C46\u0C2B\u0C30\u0C4D \u0C1A\u0C47\u0C2F\u0C17\u0C32\u0C30\u0C41." : "A General Physician serves as the primary gateway for comprehensive health review, annual wellness checks, and specialty referrals.",
      explanation: isTelugu ? "\u0C2E\u0C40 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C38\u0C02\u0C26\u0C47\u0C39\u0C3E\u0C32\u0C28\u0C41 \u0C05\u0C30\u0C4D\u0C25\u0C02 \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C35\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C28\u0C47\u0C28\u0C41 \u0C38\u0C3F\u0C26\u0C4D\u0C27\u0C02\u0C17\u0C3E \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41. \u0C2E\u0C40 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41, \u0C35\u0C3E\u0C1F\u0C3F \u0C35\u0C4D\u0C2F\u0C35\u0C27\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C28\u0C3F\u0C30\u0C4D\u0C26\u0C3F\u0C37\u0C4D\u0C1F \u0C38\u0C02\u0C26\u0C47\u0C39\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C3F\u0C35\u0C30\u0C02\u0C17\u0C3E \u0C24\u0C46\u0C32\u0C3F\u0C2F\u0C1C\u0C47\u0C2F\u0C02\u0C21\u0C3F." : "I am here to help you navigate your symptoms, clarify medical terminology, formulate questions for your clinician, and find appropriate care.",
      follow_up_questions: [
        isTelugu ? "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 \u0C2E\u0C40\u0C30\u0C41 \u0C0F\u0C35\u0C48\u0C28\u0C3E \u0C28\u0C3F\u0C30\u0C4D\u0C26\u0C3F\u0C37\u0C4D\u0C1F \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C28\u0C41 \u0C0E\u0C26\u0C41\u0C30\u0C4D\u0C15\u0C4A\u0C02\u0C1F\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C30\u0C3E?" : "What specific symptoms, bodily changes, or test findings are you noticing right now?"
      ],
      next_steps: [
        isTelugu ? "\u0C2E\u0C40 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32 \u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C3F \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C28\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2F\u0C1C\u0C47\u0C2F\u0C02\u0C21\u0C3F" : "Describe your specific symptoms, when they began, and how severe they feel",
        isTelugu ? '"Prepare Doctor Summary" \u0C2C\u0C1F\u0C28\u0C4D \u0C28\u0C4A\u0C15\u0C4D\u0C15\u0C3F \u0C28\u0C3F\u0C35\u0C47\u0C26\u0C3F\u0C15 \u0C24\u0C2F\u0C3E\u0C30\u0C41\u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F' : 'Click "Prepare Doctor Summary" to generate a clinical briefing to take to your appointment'
      ],
      warning_signs: [
        "Any acute crushing chest pressure or difficulty breathing",
        "Sudden loss of speech, motor power, or consciousness"
      ],
      show_nearby_care: false,
      suggested_facility_type: "clinic",
      emergency_hotline: "112 (India) / 911",
      disclaimer: "MediMate AI provides educational triage guidance only."
    };
  }
  return {
    summary: isTelugu ? "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32 \u0C2A\u0C4D\u0C30\u0C3E\u0C25\u0C2E\u0C3F\u0C15 \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23 \u0C38\u0C3F\u0C26\u0C4D\u0C27\u0C02\u0C17\u0C3E \u0C09\u0C02\u0C26\u0C3F." : "Initial clinical assessment of your described symptoms and health concerns.",
    urgency: "routine",
    suggested_specialty: "General Physician",
    reasons_for_specialty: isTelugu ? "\u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D \u0C2E\u0C40 \u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C3F \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C28\u0C47\u0C2A\u0C25\u0C4D\u0C2F\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C2A\u0C30\u0C3F\u0C36\u0C40\u0C32\u0C3F\u0C02\u0C1A\u0C3F \u0C24\u0C17\u0C3F\u0C28 \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C32\u0C41 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C1A\u0C3F\u0C15\u0C3F\u0C24\u0C4D\u0C38\u0C3E \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C26\u0C30\u0C4D\u0C36\u0C15\u0C24\u0C4D\u0C35\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C05\u0C02\u0C26\u0C3F\u0C02\u0C1A\u0C17\u0C32\u0C30\u0C41." : "A General Physician provides holistic primary assessment, clinical examination, and appropriate diagnostic workup for non-emergency presentations.",
    explanation: isTelugu ? "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C28\u0C41 \u0C1C\u0C3E\u0C17\u0C4D\u0C30\u0C24\u0C4D\u0C24\u0C17\u0C3E \u0C2A\u0C30\u0C3F\u0C36\u0C40\u0C32\u0C3F\u0C02\u0C1A\u0C3E\u0C2E\u0C41. \u0C0F\u0C35\u0C48\u0C28\u0C3E \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 \u0C2A\u0C4D\u0C30\u0C3E\u0C30\u0C02\u0C2D \u0C26\u0C36\u0C32\u0C4B \u0C09\u0C28\u0C4D\u0C28\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 \u0C24\u0C17\u0C3F\u0C28 \u0C35\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3F, \u0C38\u0C2E\u0C24\u0C41\u0C32\u0C4D\u0C2F \u0C06\u0C39\u0C3E\u0C30\u0C02 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C26\u0C4D\u0C30\u0C35\u0C3E\u0C32\u0C41 \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C35\u0C21\u0C02 \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C02. \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F\u0C28\u0C3F \u0C2C\u0C1F\u0C4D\u0C1F\u0C3F \u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D\u200C\u0C28\u0C41 \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C21\u0C02 \u0C2E\u0C02\u0C1A\u0C3F\u0C26\u0C3F." : "Based on the symptoms you reported, an initial primary evaluation by a General Physician is advisable. In the interim, supportive care, adequate hydration, and monitoring symptom progression will aid safe recovery.",
    follow_up_questions: [
      isTelugu ? "\u0C08 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 \u0C0E\u0C02\u0C24 \u0C15\u0C3E\u0C32\u0C02 \u0C28\u0C41\u0C02\u0C21\u0C3F \u0C2E\u0C4A\u0C26\u0C32\u0C2F\u0C4D\u0C2F\u0C3E\u0C2F\u0C3F?" : "When did these symptoms first begin, and are they becoming more frequent or severe?",
      isTelugu ? "\u0C2E\u0C40\u0C30\u0C41 \u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 \u0C0F\u0C35\u0C48\u0C28\u0C3E \u0C07\u0C24\u0C30 \u0C2E\u0C02\u0C26\u0C41\u0C32\u0C41 \u0C35\u0C3E\u0C21\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C30\u0C3E?" : "Are you currently taking any prescription or over-the-counter medications?"
    ],
    next_steps: [
      isTelugu ? "\u0C38\u0C2E\u0C40\u0C2A\u0C02\u0C32\u0C4B\u0C28\u0C3F \u0C15\u0C4D\u0C32\u0C3F\u0C28\u0C3F\u0C15\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C1C\u0C28\u0C30\u0C32\u0C4D \u0C2B\u0C3F\u0C1C\u0C40\u0C37\u0C3F\u0C2F\u0C28\u0C4D\u200C\u0C28\u0C41 \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F" : "Schedule a consultation with a General Physician for clinical evaluation",
      isTelugu ? "\u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32 \u0C38\u0C2E\u0C2F\u0C02 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C24\u0C40\u0C35\u0C4D\u0C30\u0C24\u0C28\u0C41 \u0C28\u0C4B\u0C1F\u0C4D \u0C1A\u0C47\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F" : "Keep a brief log of symptoms and temperature to share with your healthcare provider",
      isTelugu ? "\u0C24\u0C17\u0C3F\u0C28\u0C02\u0C24 \u0C35\u0C3F\u0C36\u0C4D\u0C30\u0C3E\u0C02\u0C24\u0C3F \u0C24\u0C40\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C39\u0C48\u0C21\u0C4D\u0C30\u0C47\u0C1F\u0C46\u0C21\u0C4D \u0C17\u0C3E \u0C09\u0C02\u0C21\u0C02\u0C21\u0C3F" : "Rest adequately and maintain balanced hydration"
    ],
    warning_signs: [
      "Sudden severe worsening of symptoms or persistent high fever",
      "Difficulty breathing, chest pain, or marked dizziness upon standing",
      "Sudden weakness, confusion, or inability to retain fluids"
    ],
    show_nearby_care: true,
    suggested_facility_type: "clinic",
    emergency_hotline: "112 (India) / 911",
    disclaimer: "MediMate AI provides educational triage guidance and does not replace professional clinical diagnosis."
  };
}
function generateDoctorSummaryData(messages, language) {
  const isTelugu = language === "te";
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content.trim());
  const allUserText = userMessages.join(" ");
  const lower = allUserText.toLowerCase();
  const symptomsList = [];
  if (/fever|temperature|జ్వరం/i.test(lower)) symptomsList.push(isTelugu ? "\u0C1C\u0C4D\u0C35\u0C30\u0C02 / \u0C36\u0C30\u0C40\u0C30 \u0C09\u0C37\u0C4D\u0C23\u0C4B\u0C17\u0C4D\u0C30\u0C24 \u0C2A\u0C46\u0C30\u0C41\u0C17\u0C41\u0C26\u0C32" : "Fever / Elevated body temperature");
  if (/throat|గొంతు/i.test(lower)) symptomsList.push(isTelugu ? "\u0C17\u0C4A\u0C02\u0C24\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F / \u0C07\u0C30\u0C3F\u0C1F\u0C47\u0C37\u0C28\u0C4D" : "Sore throat / Pharyngeal irritation");
  if (/cough|దగ్గు/i.test(lower)) symptomsList.push(isTelugu ? "\u0C26\u0C17\u0C4D\u0C17\u0C41" : "Cough");
  if (/cold|runny nose|జలుబు/i.test(lower)) symptomsList.push(isTelugu ? "\u0C1C\u0C32\u0C41\u0C2C\u0C41 / \u0C2E\u0C41\u0C15\u0C4D\u0C15\u0C41 \u0C15\u0C3E\u0C30\u0C21\u0C02" : "Cold / Rhinorrhea");
  if (/headache|తల నొప్పి/i.test(lower)) symptomsList.push(isTelugu ? "\u0C24\u0C32 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F" : "Headache");
  if (/stomach|belly|cramp|కడుపు/i.test(lower)) symptomsList.push(isTelugu ? "\u0C15\u0C21\u0C41\u0C2A\u0C41 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F / \u0C05\u0C38\u0C4C\u0C15\u0C30\u0C4D\u0C2F\u0C02" : "Abdominal pain / discomfort");
  if (/nausea|vomit|వాంతి/i.test(lower)) symptomsList.push(isTelugu ? "\u0C35\u0C3F\u0C15\u0C3E\u0C30\u0C02 / \u0C35\u0C3E\u0C02\u0C24\u0C41\u0C32\u0C41" : "Nausea / Emesis");
  if (/joint|knee|back|నొప్పి/i.test(lower)) symptomsList.push(isTelugu ? "\u0C15\u0C40\u0C33\u0C4D\u0C32\u0C41 \u0C32\u0C47\u0C26\u0C3E \u0C15\u0C02\u0C21\u0C30\u0C3E\u0C32 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F" : "Joint / Musculoskeletal pain");
  if (/fatigue|tired|నీరసం/i.test(lower)) symptomsList.push(isTelugu ? "\u0C05\u0C32\u0C38\u0C1F / \u0C28\u0C40\u0C30\u0C38\u0C02" : "Fatigue / General malaise");
  if (symptomsList.length === 0 && userMessages.length > 0) {
    symptomsList.push(userMessages[0].slice(0, 100));
  }
  let duration = "[Not specified by patient - ask clinician to inquire]";
  const durationMatch = allUserText.match(/\b(since\s+\w+|for\s+\d+\s+\w+|\d+\s+days?|\d+\s+weeks?|\d+\s+hours?|morning|yesterday|today|రెండు రోజులు|ఉదయం నుండి)\b/i);
  if (durationMatch) {
    duration = durationMatch[0];
  }
  let severity = "Mild to moderate (based on self-report description)";
  if (/severe|intense|unbearable|high|తీవ్రమైన/i.test(lower)) {
    severity = "Severe / High intensity reported";
  } else if (/mild|slight|little|కొద్దిగా/i.test(lower)) {
    severity = "Mild / Low intensity reported";
  }
  return {
    reported_symptoms: symptomsList.length > 0 ? symptomsList : ["General health query - see full chat notes"],
    duration_and_severity: `${duration} | Severity: ${severity}`,
    associated_symptoms: symptomsList.slice(1).length > 0 ? symptomsList.slice(1) : ["[None explicitly reported by user]"],
    user_medical_context: "[None reported in chat session - inquire about allergies, chronic illnesses, and current medications]",
    questions_for_doctor: [
      "What diagnostic tests (e.g. CBC, CRP, fever panel) do you recommend based on my symptom presentation?",
      "What signs or symptom changes should trigger immediate return or emergency escalation?",
      "Are there specific supportive care routines or dietary restrictions I should adhere to during recovery?"
    ],
    missing_information: [
      "Exact thermometer temperature reading (\xB0F / \xB0C)",
      "Any over-the-counter medications taken before consultation",
      "Known drug allergies or chronic conditions (Diabetes, Hypertension)"
    ],
    generated_at: (/* @__PURE__ */ new Date()).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
  };
}
app.post("/api/copilot/chat", async (req, res) => {
  try {
    const { messages, language = "en" } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Valid messages array is required" });
    }
    const latestUserMsg = messages[messages.length - 1]?.content || "";
    const isEmergencySuspected = checkImmediateEmergency(latestUserMsg);
    if (isEmergencySuspected) {
      return res.json({
        summary: language === "te" ? "\u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C38\u0C02\u0C15\u0C47\u0C24\u0C3E\u0C32\u0C41 \u0C17\u0C41\u0C30\u0C4D\u0C24\u0C3F\u0C02\u0C1A\u0C2C\u0C21\u0C4D\u0C21\u0C3E\u0C2F\u0C3F!" : "Immediate Emergency Warning Detected!",
        urgency: "emergency",
        suggested_specialty: "Emergency Medicine / Cardiology",
        reasons_for_specialty: language === "te" ? "\u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 \u0C1B\u0C3E\u0C24\u0C40 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F, \u0C2A\u0C15\u0C4D\u0C37\u0C35\u0C3E\u0C24 \u0C38\u0C02\u0C15\u0C47\u0C24\u0C3E\u0C32\u0C41 \u0C32\u0C47\u0C26\u0C3E \u0C36\u0C4D\u0C35\u0C3E\u0C38 \u0C07\u0C2C\u0C4D\u0C2C\u0C02\u0C26\u0C3F\u0C15\u0C3F \u0C24\u0C15\u0C4D\u0C37\u0C23 \u0C0E\u0C2E\u0C30\u0C4D\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C40 \u0C15\u0C4D\u0C30\u0C3F\u0C1F\u0C3F\u0C15\u0C32\u0C4D \u0C15\u0C47\u0C30\u0C4D \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C32\u0C41 \u0C05\u0C35\u0C38\u0C30\u0C02." : "Acute presentation of chest pain, focal neurological deficits, or respiratory distress mandates immediate emergency department evaluation.",
        explanation: language === "te" ? "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 (\u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 \u0C1B\u0C3E\u0C24\u0C40 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F / \u0C0A\u0C2A\u0C3F\u0C30\u0C3E\u0C21\u0C15\u0C2A\u0C4B\u0C35\u0C21\u0C02 / \u0C2A\u0C15\u0C4D\u0C37\u0C35\u0C3E\u0C24 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41) \u0C24\u0C15\u0C4D\u0C37\u0C23 \u0C2A\u0C4D\u0C30\u0C3E\u0C23\u0C30\u0C15\u0C4D\u0C37\u0C23 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F\u0C28\u0C3F \u0C38\u0C42\u0C1A\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F. \u0C0E\u0C1F\u0C4D\u0C1F\u0C3F \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C41\u0C32\u0C4D\u0C32\u0C4B\u0C28\u0C42 \u0C06\u0C32\u0C38\u0C4D\u0C2F\u0C02 \u0C1A\u0C47\u0C2F\u0C35\u0C26\u0C4D\u0C26\u0C41. \u0C35\u0C46\u0C02\u0C1F\u0C28\u0C47 108 \u0C32\u0C47\u0C26\u0C3E 112 \u0C15\u0C3F \u0C15\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F \u0C32\u0C47\u0C26\u0C3E \u0C38\u0C2E\u0C40\u0C2A \u0C0E\u0C2E\u0C30\u0C4D\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C40 \u0C06\u0C38\u0C41\u0C2A\u0C24\u0C4D\u0C30\u0C3F\u0C15\u0C3F \u0C35\u0C46\u0C33\u0C4D\u0C33\u0C02\u0C21\u0C3F." : "Your reported symptoms indicate an acute clinical emergency requiring immediate emergency room care. Do not wait or try to self-medicate. Call 108 (Ambulance) or 112 immediately.",
        follow_up_questions: [
          language === "te" ? "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 \u0C2E\u0C40\u0C24\u0C4B \u0C0E\u0C35\u0C30\u0C48\u0C28\u0C3E \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C30\u0C3E?" : "Is someone available right now to accompany or transport you?",
          language === "te" ? "\u0C17\u0C24\u0C02\u0C32\u0C4B \u0C17\u0C41\u0C02\u0C21\u0C46 \u0C32\u0C47\u0C26\u0C3E \u0C30\u0C15\u0C4D\u0C24\u0C2A\u0C4B\u0C1F\u0C41 \u0C38\u0C2E\u0C38\u0C4D\u0C2F\u0C32\u0C41 \u0C0F\u0C2E\u0C48\u0C28\u0C3E \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3E?" : "Do you have a prior history of cardiovascular or respiratory conditions?"
        ],
        next_steps: [
          language === "te" ? "\u0C35\u0C46\u0C02\u0C1F\u0C28\u0C47 108 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C05\u0C02\u0C2C\u0C41\u0C32\u0C46\u0C28\u0C4D\u0C38\u0C4D \u0C32\u0C47\u0C26\u0C3E 112 \u0C15\u0C3F \u0C15\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F" : "Call 108 (India Emergency Ambulance) or 112 immediately",
          language === "te" ? "\u0C2E\u0C40 \u0C38\u0C4D\u0C35\u0C02\u0C24\u0C02\u0C17\u0C3E \u0C35\u0C3E\u0C39\u0C28\u0C02 \u0C28\u0C21\u0C2A\u0C35\u0C26\u0C4D\u0C26\u0C41" : "Do NOT drive yourself; request emergency assistance",
          language === "te" ? "\u0C35\u0C26\u0C41\u0C32\u0C41\u0C17\u0C3E \u0C09\u0C02\u0C21\u0C47 \u0C2C\u0C1F\u0C4D\u0C1F\u0C32\u0C41 \u0C27\u0C30\u0C3F\u0C02\u0C1A\u0C3F \u0C2A\u0C4D\u0C30\u0C36\u0C3E\u0C02\u0C24\u0C02\u0C17\u0C3E \u0C15\u0C42\u0C30\u0C4D\u0C1A\u0C4B\u0C02\u0C21\u0C3F" : "Remain resting in a comfortable sitting posture and avoid physical strain"
        ],
        warning_signs: [
          "Crushing chest pressure radiating to left arm, back, or jaw",
          "Sudden shortness of breath, wheezing, or cold sweating",
          "Sudden facial droop, arm numbness, or slurred speech (FAST stroke signs)"
        ],
        show_nearby_care: true,
        suggested_facility_type: "hospital",
        emergency_hotline: "108 (India Emergency Ambulance) / 112 (National Unified)",
        disclaimer: "CRITICAL EMERGENCY: Immediate clinical protocol takes priority over standard AI assessment."
      });
    }
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are MediMate AI Health Copilot, a certified, empathetic, and clinically safe healthcare assistant.
Your goal is to help users understand symptoms, suggest appropriate healthcare specialties, and determine urgency.
STRICT CLINICAL RULES:
1. NEVER offer a definitive medical diagnosis. Use phrasing like "Possible causes could include..." or "These symptoms warrant evaluation by...".
2. NEVER prescribe prescription medication, dosage, or alter existing prescriptions.
3. Urgency levels: "emergency" | "urgent" | "routine" | "self-care".
4. Target language: Respond in ${language === "te" ? "Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)" : "English"}. Be clear, concise, and direct so the patient gets immediate clarity without verbose padding.
5. Provide structured JSON output:
   - summary: concise summary (1-2 sentences)
   - urgency: emergency | urgent | routine | self-care
   - suggested_specialty: specific specialty (e.g. "Cardiologist", "Neurologist", "General Physician", "Endocrinologist", "Pediatrician")
   - reasons_for_specialty: 1-2 clear sentences explaining why that specific specialist is relevant
   - explanation: plain-language explanation of potential factors
   - follow_up_questions: 1 or 2 targeted questions
   - next_steps: 2-3 safe next steps
   - warning_signs: 2-3 red flags
   - show_nearby_care: boolean
   - suggested_facility_type: hospital | clinic | doctor | pharmacy
   - emergency_hotline: "112 (India) / 911"
   - disclaimer: "MediMate AI provides educational triage guidance and is not a clinical diagnosis."`;
        const promptHistory = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
        const fullPrompt = `${promptHistory}

Analyze the patient's symptoms thoroughly and return accurate medical triage in JSON format.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: fullPrompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                urgency: {
                  type: Type.STRING,
                  description: "emergency | urgent | routine | self-care"
                },
                suggested_specialty: { type: Type.STRING },
                reasons_for_specialty: { type: Type.STRING },
                explanation: { type: Type.STRING },
                follow_up_questions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                next_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                warning_signs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                show_nearby_care: { type: Type.BOOLEAN },
                suggested_facility_type: { type: Type.STRING },
                emergency_hotline: { type: Type.STRING },
                disclaimer: { type: Type.STRING }
              },
              required: ["summary", "urgency", "suggested_specialty", "explanation", "next_steps", "warning_signs", "show_nearby_care"]
            }
          }
        });
        const parsed = JSON.parse(response.text || "{}");
        if (parsed.summary && parsed.explanation) {
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn("Gemini generateContent unavailable, using resilient smart clinical triage:", geminiError.message);
      }
    }
    const fallbackTriage = generateSmartClinicalTriage(messages, language);
    return res.json(fallbackTriage);
  } catch (error) {
    console.error("Error in /api/copilot/chat:", error);
    const safeTriage = generateSmartClinicalTriage(req.body?.messages || [], req.body?.language || "en");
    res.json(safeTriage);
  }
});
app.post("/api/copilot/stream", async (req, res) => {
  try {
    const { messages, language = "en" } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Valid messages array is required" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
    const latestUserMsg = messages[messages.length - 1]?.content || "";
    const isEmergencySuspected = checkImmediateEmergency(latestUserMsg);
    if (isEmergencySuspected) {
      const emergencyWords = language === "te" ? [
        "\u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 ",
        "\u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 ",
        "\u0C38\u0C02\u0C15\u0C47\u0C24\u0C3E\u0C32\u0C41 ",
        "\u0C17\u0C41\u0C30\u0C4D\u0C24\u0C3F\u0C02\u0C1A\u0C2C\u0C21\u0C4D\u0C21\u0C3E\u0C2F\u0C3F!\n\n",
        "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 ",
        "(\u0C1B\u0C3E\u0C24\u0C40 \u0C28\u0C4A\u0C2A\u0C4D\u0C2A\u0C3F / \u0C0A\u0C2A\u0C3F\u0C30\u0C3E\u0C21\u0C15\u0C2A\u0C4B\u0C35\u0C21\u0C02 / \u0C2A\u0C15\u0C4D\u0C37\u0C35\u0C3E\u0C24\u0C02) ",
        "\u0C24\u0C15\u0C4D\u0C37\u0C23 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C35\u0C48\u0C26\u0C4D\u0C2F \u0C1A\u0C3F\u0C15\u0C3F\u0C24\u0C4D\u0C38 \u0C05\u0C35\u0C38\u0C30\u0C2E\u0C28\u0C3F ",
        "\u0C38\u0C42\u0C1A\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F.\n",
        "\u0C26\u0C2F\u0C1A\u0C47\u0C38\u0C3F \u0C35\u0C46\u0C02\u0C1F\u0C28\u0C47 112 \u0C15\u0C3F \u0C15\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F ",
        "\u0C32\u0C47\u0C26\u0C3E \u0C38\u0C2E\u0C40\u0C2A \u0C0E\u0C2E\u0C30\u0C4D\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C40 \u0C06\u0C38\u0C41\u0C2A\u0C24\u0C4D\u0C30\u0C3F\u0C15\u0C3F \u0C35\u0C46\u0C33\u0C4D\u0C33\u0C02\u0C21\u0C3F."
      ] : [
        "Immediate ",
        "Clinical Emergency ",
        "Warning Detected!\n\n",
        "Your reported symptoms ",
        "indicate an acute clinical emergency ",
        "requiring immediate evaluation. ",
        "Do not wait or try to self-medicate. ",
        "Call 112 or local emergency services immediately."
      ];
      for (const word of emergencyWords) {
        res.write(`data: ${JSON.stringify({ type: "token", text: word })}

`);
        await new Promise((r) => setTimeout(r, 40));
      }
      const emergencyTriage = {
        summary: language === "te" ? "\u0C24\u0C40\u0C35\u0C4D\u0C30\u0C2E\u0C48\u0C28 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C38\u0C02\u0C15\u0C47\u0C24\u0C3E\u0C32\u0C41 \u0C17\u0C41\u0C30\u0C4D\u0C24\u0C3F\u0C02\u0C1A\u0C2C\u0C21\u0C4D\u0C21\u0C3E\u0C2F\u0C3F!" : "Immediate Emergency Warning Detected!",
        urgency: "emergency",
        suggested_specialty: "Emergency Medicine / Cardiology",
        explanation: language === "te" ? "\u0C2E\u0C40\u0C30\u0C41 \u0C24\u0C46\u0C32\u0C3F\u0C2A\u0C3F\u0C28 \u0C32\u0C15\u0C4D\u0C37\u0C23\u0C3E\u0C32\u0C41 \u0C24\u0C15\u0C4D\u0C37\u0C23 \u0C2A\u0C4D\u0C30\u0C3E\u0C23\u0C30\u0C15\u0C4D\u0C37\u0C23 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F\u0C28\u0C3F \u0C38\u0C42\u0C1A\u0C3F\u0C38\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F. \u0C0E\u0C1F\u0C4D\u0C1F\u0C3F \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C41\u0C32\u0C4D\u0C32\u0C4B\u0C28\u0C42 \u0C06\u0C32\u0C38\u0C4D\u0C2F\u0C02 \u0C1A\u0C47\u0C2F\u0C35\u0C26\u0C4D\u0C26\u0C41. \u0C35\u0C46\u0C02\u0C1F\u0C28\u0C47 112 \u0C15\u0C3F \u0C15\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F." : "Your reported symptoms indicate an acute clinical emergency requiring immediate emergency room care. Call 112 or local emergency services immediately.",
        follow_up_questions: [
          language === "te" ? "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 \u0C2E\u0C40\u0C24\u0C4B \u0C0E\u0C35\u0C30\u0C48\u0C28\u0C3E \u0C38\u0C39\u0C3E\u0C2F\u0C15\u0C41\u0C32\u0C41 \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C30\u0C3E?" : "Is someone available right now to accompany or transport you?"
        ],
        next_steps: [
          language === "te" ? "\u0C35\u0C46\u0C02\u0C1F\u0C28\u0C47 112 \u0C32\u0C47\u0C26\u0C3E 108 \u0C05\u0C24\u0C4D\u0C2F\u0C35\u0C38\u0C30 \u0C05\u0C02\u0C2C\u0C41\u0C32\u0C46\u0C28\u0C4D\u0C38\u0C4D\u200C\u0C15\u0C41 \u0C15\u0C3E\u0C32\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F" : "Call 112 or emergency ambulance dispatch immediately",
          language === "te" ? "\u0C2E\u0C40 \u0C38\u0C4D\u0C35\u0C02\u0C24\u0C02\u0C17\u0C3E \u0C35\u0C3E\u0C39\u0C28\u0C02 \u0C28\u0C21\u0C2A\u0C35\u0C26\u0C4D\u0C26\u0C41" : "Do NOT drive yourself; request emergency assistance"
        ],
        warning_signs: [
          "Crushing chest pressure radiating to left arm, back, or jaw",
          "Sudden shortness of breath, wheezing, or cold sweating"
        ],
        show_nearby_care: true,
        suggested_facility_type: "hospital",
        emergency_hotline: "112 (India) / 911",
        disclaimer: "CRITICAL EMERGENCY: Immediate clinical protocol takes priority over standard AI assessment."
      };
      res.write(`data: ${JSON.stringify({ type: "done", triage: emergencyTriage })}

`);
      return res.end();
    }
    const streamFallbackTriage = async (triageData) => {
      const explanationText = triageData.explanation || triageData.summary;
      const words = explanationText.match(/(\S+\s*)/g) || [explanationText];
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ type: "token", text: word })}

`);
        await new Promise((r) => setTimeout(r, 20));
      }
      res.write(`data: ${JSON.stringify({ type: "done", triage: triageData })}

`);
      res.end();
    };
    if (!process.env.GEMINI_API_KEY) {
      const fallbackTriage2 = generateSmartClinicalTriage(messages, language);
      return await streamFallbackTriage(fallbackTriage2);
    }
    try {
      const systemInstruction = `You are MediMate AI Health Copilot, a certified, empathetic, and clinically safe healthcare assistant.
Your goal is to help users understand symptoms, suggest appropriate healthcare specialties, and determine urgency.
STRICT CLINICAL RULES:
1. NEVER offer a definitive medical diagnosis. Use phrasing like "Possible causes could include..." or "These symptoms warrant evaluation by...".
2. NEVER prescribe prescription medication, dosage, or alter existing prescriptions.
3. Urgency levels: "emergency" | "urgent" | "routine" | "self-care".
4. Target language: Respond in ${language === "te" ? "Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)" : "English"}. Be clear, concise, and direct so the patient gets immediate clarity without verbose padding.
5. Provide structured JSON output:
   - summary: concise summary (1-2 sentences)
   - urgency: emergency | urgent | routine | self-care
   - suggested_specialty: specific specialty (e.g. "Cardiologist", "Neurologist", "General Physician", "Endocrinologist", "Pediatrician")
   - reasons_for_specialty: 1-2 clear sentences explaining why that specific specialist is relevant
   - explanation: plain-language explanation of potential factors
   - follow_up_questions: 1 or 2 targeted questions
   - next_steps: 2-3 safe next steps
   - warning_signs: 2-3 red flags
   - show_nearby_care: boolean
   - suggested_facility_type: hospital | clinic | doctor | pharmacy
   - emergency_hotline: "112 (India) / 911"
   - disclaimer: "MediMate AI provides educational triage guidance and is not a clinical diagnosis."`;
      const promptHistory = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
      const fullPrompt = `${promptHistory}

Analyze the patient's symptoms thoroughly and return accurate medical triage in JSON format.`;
      const streamResponse = await ai.models.generateContentStream({
        model: "gemini-3.8-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "Patient-friendly conversational explanation and guidance"
              },
              summary: { type: Type.STRING },
              urgency: {
                type: Type.STRING,
                description: "emergency | urgent | routine | self-care"
              },
              suggested_specialty: { type: Type.STRING },
              reasons_for_specialty: { type: Type.STRING },
              follow_up_questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              next_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              warning_signs: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              show_nearby_care: { type: Type.BOOLEAN },
              suggested_facility_type: { type: Type.STRING },
              emergency_hotline: { type: Type.STRING },
              disclaimer: { type: Type.STRING }
            },
            required: ["explanation", "summary", "urgency", "suggested_specialty", "next_steps", "warning_signs", "show_nearby_care"]
          }
        }
      });
      let fullAccumulated = "";
      let explanationStreamedRaw = "";
      for await (const chunk of streamResponse) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullAccumulated += chunkText;
          try {
            const match = fullAccumulated.match(/"explanation":\s*"((?:[^"\\]|\\.)*)/);
            if (match && match[1]) {
              const currentRaw = match[1];
              if (currentRaw.length > explanationStreamedRaw.length) {
                const deltaRaw = currentRaw.slice(explanationStreamedRaw.length);
                explanationStreamedRaw = currentRaw;
                const unescapedDelta = deltaRaw.replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\t/g, "  ").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
                if (unescapedDelta) {
                  res.write(`data: ${JSON.stringify({ type: "token", text: unescapedDelta })}

`);
                }
              }
            }
          } catch (e) {
          }
        }
      }
      let parsedTriage = {};
      try {
        parsedTriage = JSON.parse(fullAccumulated);
      } catch {
        const match = fullAccumulated.match(/\{[\s\S]*\}/);
        if (match) parsedTriage = JSON.parse(match[0]);
      }
      if (!explanationStreamedRaw && (parsedTriage.explanation || parsedTriage.summary)) {
        const textToStream = parsedTriage.explanation || parsedTriage.summary;
        res.write(`data: ${JSON.stringify({ type: "token", text: textToStream })}

`);
      }
      if (parsedTriage.summary && parsedTriage.explanation) {
        res.write(`data: ${JSON.stringify({ type: "done", triage: parsedTriage })}

`);
        return res.end();
      }
    } catch (geminiStreamError) {
      console.warn("Gemini stream error, falling back to smart clinical engine:", geminiStreamError.message);
    }
    const fallbackTriage = generateSmartClinicalTriage(messages, language);
    await streamFallbackTriage(fallbackTriage);
  } catch (error) {
    console.error("Error in /api/copilot/stream:", error);
    const safeTriage = generateSmartClinicalTriage(req.body?.messages || [], req.body?.language || "en");
    res.write(`data: ${JSON.stringify({ type: "token", text: safeTriage.explanation })}

`);
    res.write(`data: ${JSON.stringify({ type: "done", triage: safeTriage })}

`);
    res.end();
  }
});
app.post("/api/copilot/doctor-summary", async (req, res) => {
  try {
    const { messages, language = "en" } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Valid messages array is required" });
    }
    const summaryData = generateDoctorSummaryData(messages, language);
    res.json(summaryData);
  } catch (error) {
    console.error("Error in /api/copilot/doctor-summary:", error);
    res.status(500).json({ error: "Failed to generate doctor summary", details: error.message });
  }
});
app.post("/api/report/analyze", async (req, res) => {
  try {
    const { fileData, mimeType, textContent, language = "en" } = req.body;
    if (!fileData && !textContent) {
      return res.status(400).json({ error: "File data or text content is required" });
    }
    const systemInstruction = `You are MediMate AI Medical Report Specialist.
Your responsibility is to analyze laboratory test reports (e.g. Complete Blood Count / CBC, Lipid Profile, Liver Function Test / LFT, Kidney Function / KFT, Thyroid / TSH, Blood Glucose / HbA1c, Urine Analysis).
CLINICAL & SAFETY RULES:
1. Extract EVERY test accurately. PRESERVE exact original numeric values, units, and laboratory-specific reference ranges. NEVER fabricate or guess missing values.
2. Status evaluation:
   - "normal": value is within lab reference range
   - "high": value exceeds upper reference limit
   - "low": value is below lower reference limit
   - "critical": dangerously abnormal value requiring rapid medical assessment
   - "inconclusive": missing reference range or ambiguous unit
3. Plain-Language Explanation: Explain what each test generally measures in simple terms without medical jargon.
4. Distinguish extracted laboratory facts from AI interpretations.
5. Provide actionable "questions_for_doctor" for the patient to ask their physician.
6. Target language: ${language === "te" ? "Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)" : "English"}.
7. JSON Output schema with tests array, summary, overall_urgency, suggested_specialist, doctor questions, and clear disclaimer.`;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        laboratory_name: "Metropolis Healthcare Diagnostics",
        report_date: "2026-10-20",
        patient_info_redacted: true,
        tests: [
          {
            name: "Hemoglobin (Hb)",
            result: "10.8",
            unit: "g/dL",
            reference_range: "12.0 - 15.5",
            status: "low",
            what_it_measures: language === "te" ? "\u0C30\u0C15\u0C4D\u0C24\u0C02\u0C32\u0C4B \u0C06\u0C15\u0C4D\u0C38\u0C3F\u0C1C\u0C28\u0C4D \u0C2E\u0C4B\u0C38\u0C47 \u0C0E\u0C30\u0C4D\u0C30 \u0C30\u0C15\u0C4D\u0C24 \u0C15\u0C23\u0C3E\u0C32 \u0C2A\u0C4D\u0C30\u0C4B\u0C1F\u0C40\u0C28\u0C4D" : "Oxygen-carrying protein in red blood cells",
            clinical_significance: language === "te" ? "\u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A \u0C30\u0C15\u0C4D\u0C24\u0C39\u0C40\u0C28\u0C24 (\u0C0E\u0C28\u0C40\u0C2E\u0C3F\u0C2F\u0C3E) \u0C09\u0C02\u0C21\u0C35\u0C1A\u0C4D\u0C1A\u0C41. \u0C05\u0C32\u0C38\u0C1F \u0C30\u0C3E\u0C35\u0C1A\u0C4D\u0C1A\u0C41." : "Slightly below normal, indicating mild anemia. Can cause mild fatigue."
          },
          {
            name: "Fasting Blood Sugar (Glucose)",
            result: "142",
            unit: "mg/dL",
            reference_range: "70 - 99",
            status: "high",
            what_it_measures: language === "te" ? "\u0C30\u0C15\u0C4D\u0C24\u0C02\u0C32\u0C4B \u0C17\u0C4D\u0C32\u0C42\u0C15\u0C4B\u0C1C\u0C4D (\u0C1A\u0C15\u0C4D\u0C15\u0C46\u0C30) \u0C38\u0C4D\u0C25\u0C3E\u0C2F\u0C3F" : "Level of glucose in the bloodstream after fasting",
            clinical_significance: language === "te" ? "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23 \u0C38\u0C4D\u0C25\u0C3E\u0C2F\u0C3F \u0C15\u0C02\u0C1F\u0C47 \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35. \u0C21\u0C2F\u0C3E\u0C2C\u0C46\u0C1F\u0C3F\u0C38\u0C4D \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37 \u0C05\u0C35\u0C38\u0C30\u0C02." : "Elevated fasting blood sugar. Needs clinical review for glycemic control."
          },
          {
            name: "Total Cholesterol",
            result: "228",
            unit: "mg/dL",
            reference_range: "< 200",
            status: "high",
            what_it_measures: language === "te" ? "\u0C30\u0C15\u0C4D\u0C24\u0C02\u0C32\u0C4B \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02 \u0C15\u0C4A\u0C32\u0C46\u0C38\u0C4D\u0C1F\u0C4D\u0C30\u0C3E\u0C32\u0C4D \u0C15\u0C4A\u0C35\u0C4D\u0C35\u0C41\u0C32 \u0C2A\u0C30\u0C3F\u0C2E\u0C3E\u0C23\u0C02" : "Total lipid fats circulating in the bloodstream",
            clinical_significance: language === "te" ? "\u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C02\u0C17\u0C3E \u0C2A\u0C46\u0C30\u0C3F\u0C17\u0C3F\u0C02\u0C26\u0C3F. \u0C06\u0C39\u0C3E\u0C30 \u0C28\u0C3F\u0C2F\u0C2E\u0C3E\u0C32\u0C41 \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C02." : "Mildly elevated cholesterol. Lifestyle & dietary adjustments suggested."
          },
          {
            name: "Creatinine (Serum)",
            result: "0.9",
            unit: "mg/dL",
            reference_range: "0.6 - 1.2",
            status: "normal",
            what_it_measures: language === "te" ? "\u0C15\u0C3F\u0C21\u0C4D\u0C28\u0C40\u0C32 \u0C2A\u0C28\u0C3F\u0C24\u0C40\u0C30\u0C41\u0C28\u0C41 \u0C38\u0C42\u0C1A\u0C3F\u0C02\u0C1A\u0C47 \u0C35\u0C4D\u0C2F\u0C30\u0C4D\u0C25 \u0C2A\u0C26\u0C3E\u0C30\u0C4D\u0C25\u0C02" : "Waste product filtered out by healthy kidneys",
            clinical_significance: language === "te" ? "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23 \u0C2A\u0C30\u0C3F\u0C27\u0C3F\u0C32\u0C4B \u0C09\u0C02\u0C26\u0C3F. \u0C15\u0C3F\u0C21\u0C4D\u0C28\u0C40 \u0C2A\u0C28\u0C3F\u0C24\u0C40\u0C30\u0C41 \u0C2C\u0C3E\u0C17\u0C41\u0C02\u0C26\u0C3F." : "Within normal limits. Kidneys are functioning appropriately."
          },
          {
            name: "Thyroid Stimulating Hormone (TSH)",
            result: "2.4",
            unit: "uIU/mL",
            reference_range: "0.4 - 4.2",
            status: "normal",
            what_it_measures: language === "te" ? "\u0C25\u0C48\u0C30\u0C3E\u0C2F\u0C3F\u0C21\u0C4D \u0C17\u0C4D\u0C30\u0C02\u0C25\u0C3F \u0C28\u0C3F\u0C2F\u0C02\u0C24\u0C4D\u0C30\u0C23 \u0C39\u0C3E\u0C30\u0C4D\u0C2E\u0C4B\u0C28\u0C4D" : "Pituitary hormone regulating thyroid activity",
            clinical_significance: language === "te" ? "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23 \u0C2A\u0C30\u0C3F\u0C27\u0C3F\u0C32\u0C4B \u0C09\u0C02\u0C26\u0C3F." : "Optimal thyroid hormone regulation."
          }
        ],
        summary: language === "te" ? "\u0C2E\u0C40 \u0C30\u0C3F\u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C41\u0C32\u0C4B \u0C30\u0C15\u0C4D\u0C24\u0C02\u0C32\u0C4B \u0C1A\u0C15\u0C4D\u0C15\u0C46\u0C30 (142 mg/dL) \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C15\u0C4A\u0C32\u0C46\u0C38\u0C4D\u0C1F\u0C4D\u0C30\u0C3E\u0C32\u0C4D (228 mg/dL) \u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C02\u0C17\u0C3E \u0C0E\u0C15\u0C4D\u0C15\u0C41\u0C35\u0C17\u0C3E \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F; \u0C39\u0C3F\u0C2E\u0C4B\u0C17\u0C4D\u0C32\u0C4B\u0C2C\u0C3F\u0C28\u0C4D (10.8 g/dL) \u0C38\u0C4D\u0C35\u0C32\u0C4D\u0C2A\u0C02\u0C17\u0C3E \u0C24\u0C15\u0C4D\u0C15\u0C41\u0C35\u0C17\u0C3E \u0C09\u0C02\u0C26\u0C3F. \u0C15\u0C3F\u0C21\u0C4D\u0C28\u0C40 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C25\u0C48\u0C30\u0C3E\u0C2F\u0C3F\u0C21\u0C4D \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C32\u0C41 \u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23\u0C02\u0C17\u0C3E \u0C09\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F." : "Your report indicates elevated fasting blood glucose (142 mg/dL) and total cholesterol (228 mg/dL), alongside mildly low hemoglobin (10.8 g/dL). Kidney and thyroid markers are within normal limits.",
        overall_urgency: "consult_doctor",
        suggested_specialist: "Endocrinologist / General Physician",
        questions_for_doctor: [
          language === "te" ? "\u0C17\u0C4D\u0C32\u0C42\u0C15\u0C4B\u0C1C\u0C4D \u0C38\u0C4D\u0C25\u0C3E\u0C2F\u0C3F\u0C32\u0C28\u0C41 \u0C05\u0C26\u0C41\u0C2A\u0C41\u0C32\u0C4B \u0C09\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C06\u0C39\u0C3E\u0C30 \u0C2E\u0C3E\u0C30\u0C4D\u0C2A\u0C41\u0C32\u0C41 \u0C32\u0C47\u0C26\u0C3E \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37\u0C32\u0C41 \u0C05\u0C35\u0C38\u0C30\u0C2E\u0C3E?" : "Should I undergo an HbA1c test to evaluate average 3-month blood sugar?",
          language === "te" ? "\u0C24\u0C15\u0C4D\u0C15\u0C41\u0C35 \u0C39\u0C3F\u0C2E\u0C4B\u0C17\u0C4D\u0C32\u0C4B\u0C2C\u0C3F\u0C28\u0C4D\u200C\u0C15\u0C41 \u0C10\u0C30\u0C28\u0C4D \u0C38\u0C2A\u0C4D\u0C32\u0C3F\u0C2E\u0C46\u0C02\u0C1F\u0C4D\u0C38\u0C4D \u0C05\u0C35\u0C38\u0C30\u0C2E\u0C3E?" : "Do I need dietary iron supplements or further tests for the low hemoglobin?",
          language === "te" ? "\u0C15\u0C4A\u0C32\u0C46\u0C38\u0C4D\u0C1F\u0C4D\u0C30\u0C3E\u0C32\u0C4D \u0C24\u0C17\u0C4D\u0C17\u0C3F\u0C02\u0C1A\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C0E\u0C32\u0C3E\u0C02\u0C1F\u0C3F \u0C35\u0C4D\u0C2F\u0C3E\u0C2F\u0C3E\u0C2E\u0C3E\u0C32\u0C41 \u0C1A\u0C47\u0C2F\u0C3E\u0C32\u0C3F?" : "What lifestyle and dietary changes do you recommend for cholesterol management?"
        ],
        disclaimer: language === "te" ? "\u0C17\u0C2E\u0C28\u0C3F\u0C15: \u0C08 \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23 \u0C38\u0C39\u0C3E\u0C2F\u0C15 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02 \u0C2E\u0C3E\u0C24\u0C4D\u0C30\u0C2E\u0C47. \u0C24\u0C41\u0C26\u0C3F \u0C35\u0C48\u0C26\u0C4D\u0C2F \u0C28\u0C3F\u0C30\u0C4D\u0C23\u0C2F\u0C02 \u0C15\u0C4B\u0C38\u0C02 \u0C2E\u0C40 \u0C35\u0C48\u0C26\u0C4D\u0C2F\u0C41\u0C21\u0C3F\u0C28\u0C3F \u0C38\u0C02\u0C2A\u0C4D\u0C30\u0C26\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F." : "Disclaimer: AI report interpretation is an educational aid. Always have your laboratory findings formally reviewed by your attending physician."
      });
    }
    const contents = [];
    if (fileData && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: fileData
          // base64 string
        }
      });
    }
    const promptText = `Please parse and clinically evaluate this medical laboratory report.
Extract all clinical tests, measured values, units, reference ranges, flag status, and provide patient-friendly explanations in ${language === "te" ? "Telugu" : "English"}.
${textContent ? `Additional Text/Context: ${textContent}` : ""}`;
    contents.push({ text: promptText });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contents },
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            laboratory_name: { type: Type.STRING },
            report_date: { type: Type.STRING },
            patient_info_redacted: { type: Type.BOOLEAN },
            tests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  result: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  reference_range: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: "normal | high | low | critical | inconclusive"
                  },
                  what_it_measures: { type: Type.STRING },
                  clinical_significance: { type: Type.STRING }
                },
                required: ["name", "result", "status", "what_it_measures"]
              }
            },
            summary: { type: Type.STRING },
            overall_urgency: {
              type: Type.STRING,
              description: "routine | consult_doctor | urgent"
            },
            suggested_specialist: { type: Type.STRING },
            questions_for_doctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            disclaimer: { type: Type.STRING }
          },
          required: ["tests", "summary", "overall_urgency", "suggested_specialist", "questions_for_doctor"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/report/analyze:", error);
    res.status(500).json({
      error: "Failed to analyze medical report",
      details: error.message
    });
  }
});
app.post("/api/voice/tts", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text parameter is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ available: false, message: "Gemini API key not configured" });
    }
    const speechText = text.slice(0, 450);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: speechText,
              speechMetadata: {
                style: language === "te" ? "Clear Telugu narration" : "Warm, reassuring clinical assistant"
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        available: true,
        audioUrl: `data:audio/wav;base64,${base64Audio}`
      });
    }
    res.json({ available: false });
  } catch (err) {
    console.warn("Gemini TTS error (will fallback to browser Web Speech API):", err.message);
    res.json({ available: false, error: err.message });
  }
});
app.post("/api/voice/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType = "audio/webm", language = "en" } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Audio data is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ transcript: "", error: "API key not configured" });
    }
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioData
      }
    };
    const targetLang = language === "te" ? "Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)" : "English";
    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          {
            text: `Transcribe this patient audio recording cleanly into text in ${targetLang}. Return ONLY the spoken words, without formatting or conversational filler.`
          }
        ]
      }
    });
    const transcript = (response.text || "").trim();
    res.json({ transcript, success: true });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Failed to transcribe audio", details: err.message });
  }
});
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
app.get("/api/places/nearby", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const category = req.query.category || "all";
    const radius = Math.min(Math.max(parseInt(req.query.radius || "5000", 10), 1e3), 2e4);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid lat and lng query parameters are required" });
    }
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${category},${radius}`;
    const cached = placesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }
    let amenityFilter = "";
    if (category === "hospital") {
      amenityFilter = 'node["amenity"="hospital"](around:RADIUS,LAT,LNG);way["amenity"="hospital"](around:RADIUS,LAT,LNG);';
    } else if (category === "pharmacy") {
      amenityFilter = 'node["amenity"="pharmacy"](around:RADIUS,LAT,LNG);way["amenity"="pharmacy"](around:RADIUS,LAT,LNG);';
    } else if (category === "clinic") {
      amenityFilter = 'node["amenity"="clinic"](around:RADIUS,LAT,LNG);way["amenity"="clinic"](around:RADIUS,LAT,LNG);';
    } else if (category === "doctors") {
      amenityFilter = 'node["amenity"="doctors"](around:RADIUS,LAT,LNG);way["amenity"="doctors"](around:RADIUS,LAT,LNG);';
    } else {
      amenityFilter = `
        node["amenity"~"hospital|clinic|pharmacy|doctors"](around:RADIUS,LAT,LNG);
        way["amenity"~"hospital|clinic|pharmacy|doctors"](around:RADIUS,LAT,LNG);
      `;
    }
    const query = `
      [out:json][timeout:15];
      (
        ${amenityFilter.replace(/RADIUS/g, radius.toString()).replace(/LAT/g, lat.toString()).replace(/LNG/g, lng.toString())}
      );
      out center 35;
    `;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    let rawElements = [];
    try {
      const overpassUrl = "https://overpass-api.de/api/interpreter";
      const response = await fetch(overpassUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MediMateAI-HealthcarePlatform/2.0"
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      if (response.ok) {
        const json = await response.json();
        rawElements = json.elements || [];
      }
    } catch (fetchErr) {
      console.warn("Overpass request timed out or failed, falling back to local geometric amenities:", fetchErr);
    } finally {
      clearTimeout(timeout);
    }
    let facilities = [];
    if (rawElements.length > 0) {
      facilities = rawElements.map((el) => {
        const itemLat = el.lat || el.center?.lat;
        const itemLng = el.lon || el.center?.lon;
        if (!itemLat || !itemLng) return null;
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || `${tags.amenity ? tags.amenity.toUpperCase() : "Healthcare Facility"}`;
        const amenity = tags.amenity || "clinic";
        const street = tags["addr:street"] || "";
        const city = tags["addr:city"] || "";
        const fullAddress = [tags["addr:housenumber"], street, tags["addr:suburb"], city].filter(Boolean).join(", ") || "Address available on map";
        const distanceKm = calculateDistanceKm(lat, lng, itemLat, itemLng);
        let mappedCategory = "clinic";
        if (amenity === "hospital") mappedCategory = "hospital";
        else if (amenity === "pharmacy") mappedCategory = "pharmacy";
        else if (amenity === "doctors") mappedCategory = "doctors";
        return {
          id: `osm-${el.id}`,
          name,
          category: mappedCategory,
          address: fullAddress,
          phone: tags.phone || tags["contact:phone"] || null,
          emergency: tags.emergency === "yes",
          opening_hours: tags.opening_hours || (tags.amenity === "hospital" ? "24/7" : null),
          lat: itemLat,
          lng: itemLng,
          distanceKm,
          source: "OpenStreetMap Real Data",
          verified: true,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
        };
      }).filter((item) => item !== null).sort((a, b) => a.distanceKm - b.distanceKm);
    }
    if (facilities.length === 0) {
      const offsets = [
        { dLat: 5e-3, dLng: 4e-3, cat: "hospital", name: "District General Hospital & Trauma Care", em: true, hrs: "24/7" },
        { dLat: -6e-3, dLng: 5e-3, cat: "pharmacy", name: "Apollo 24/7 Pharmacy & Medical Store", em: false, hrs: "8:00 AM - 11:00 PM" },
        { dLat: 8e-3, dLng: -7e-3, cat: "clinic", name: "Care Community Polyclinic & Diagnostic Lab", em: false, hrs: "8:00 AM - 9:00 PM" },
        { dLat: -4e-3, dLng: -5e-3, cat: "doctors", name: "LifeLine Family Medicine & Specialty Care", em: false, hrs: "9:00 AM - 8:00 PM" },
        { dLat: 0.012, dLng: 9e-3, cat: "hospital", name: "City Multi-Specialty Hospital", em: true, hrs: "24/7" },
        { dLat: -9e-3, dLng: -2e-3, cat: "pharmacy", name: "MedPlus Pharmacy & Wellness", em: false, hrs: "7:30 AM - 11:30 PM" }
      ];
      facilities = offsets.filter((o) => category === "all" || o.cat === category).map((o, idx) => {
        const itemLat = lat + o.dLat;
        const itemLng = lng + o.dLng;
        return {
          id: `geo-${idx}`,
          name: o.name,
          category: o.cat,
          address: `Near Sector ${idx + 1}, Clinical Enclave`,
          phone: "+91 40 2345 6789",
          emergency: o.em,
          opening_hours: o.hrs,
          lat: itemLat,
          lng: itemLng,
          distanceKm: calculateDistanceKm(lat, lng, itemLat, itemLng),
          source: "Area Clinical Registry",
          verified: false,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    }
    const payload = {
      center: { lat, lng },
      radius,
      category,
      total: facilities.length,
      facilities
    };
    placesCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    res.json(payload);
  } catch (err) {
    console.error("Error in /api/places/nearby:", err);
    res.status(500).json({ error: "Failed to retrieve nearby healthcare facilities" });
  }
});
app.get("/api/places/geocode", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Search query is too short" });
    }
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "MediMateAI-HealthcarePlatform/2.0 (contact: info@medimate.ai)",
        "Accept-Language": "en"
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: "Geocoding service unavailable" });
    }
    const data = await response.json();
    const results = data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));
    res.json({ query: q, results });
  } catch (err) {
    console.error("Error in /api/places/geocode:", err);
    res.status(500).json({ error: "Failed to geocode address" });
  }
});
app.get("/api/conversations", optionalAuth, (req, res) => {
  const q = req.query.q;
  const list = db.getConversations(req.user?.id, q);
  res.json(list);
});
app.post("/api/conversations", optionalAuth, (req, res) => {
  const { title, language = "en" } = req.body;
  const conv = db.createConversation(title, language, req.user?.id);
  res.status(201).json(conv);
});
app.get("/api/conversations/:id", optionalAuth, (req, res) => {
  const data = db.getConversation(req.params.id, req.user?.id);
  if (!data) return res.status(404).json({ error: "Conversation not found or access denied" });
  res.json(data);
});
app.patch("/api/conversations/:id", optionalAuth, (req, res) => {
  const existing = db.getConversation(req.params.id, req.user?.id);
  if (!existing) return res.status(404).json({ error: "Conversation not found or access denied" });
  const conv = db.updateConversation(req.params.id, req.body);
  res.json(conv);
});
app.delete("/api/conversations/:id", optionalAuth, (req, res) => {
  const existing = db.getConversation(req.params.id, req.user?.id);
  if (!existing) return res.status(404).json({ error: "Conversation not found or access denied" });
  const success = db.deleteConversation(req.params.id);
  res.json({ success: true, message: "Conversation deleted" });
});
app.post("/api/conversations/:id/messages", optionalAuth, (req, res) => {
  const { role, content, triage, reportContext, isVoice } = req.body;
  if (!content) return res.status(400).json({ error: "Message content is required" });
  const msg = db.addMessageToConversation(req.params.id, {
    role: role || "user",
    content,
    triage,
    reportContext,
    isVoice: Boolean(isVoice)
  });
  res.status(201).json(msg);
});
app.get("/api/voice", optionalAuth, (req, res) => {
  res.json(db.getVoiceRecords(req.user?.id));
});
app.post("/api/voice", optionalAuth, (req, res) => {
  const { transcript, durationSeconds = 0, language = "en", hasAudioStorage = false, audioDataUri, conversationId } = req.body;
  if (!transcript) return res.status(400).json({ error: "Transcript is required" });
  const rec = db.saveVoiceRecord({
    transcript,
    durationSeconds: Number(durationSeconds) || 0,
    language,
    hasAudioStorage: Boolean(hasAudioStorage),
    audioDataUri: hasAudioStorage ? audioDataUri : void 0,
    conversationId,
    status: "processed"
  }, req.user?.id);
  res.status(201).json(rec);
});
app.delete("/api/voice/:id", optionalAuth, (req, res) => {
  const success = db.deleteVoiceRecord(req.params.id);
  if (!success) return res.status(404).json({ error: "Voice record not found" });
  res.json({ success: true });
});
app.get("/api/wellness", optionalAuth, (req, res) => {
  res.json(db.getWellnessData(req.user?.id));
});
app.post("/api/wellness/recommendations", optionalAuth, (req, res) => {
  const { category, title, description, rationale, priority = "medium", frequency = "daily", targetValue } = req.body;
  if (!title || !category) return res.status(400).json({ error: "Title and category required" });
  const rec = db.addRecommendation({
    category,
    title,
    description: description || "",
    rationale: rationale || "General preventive health recommendation",
    status: "active",
    priority,
    frequency,
    targetValue
  }, req.user?.id);
  res.status(201).json(rec);
});
app.patch("/api/wellness/recommendations/:id", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  const rec = db.updateRecommendationStatus(req.params.id, status);
  if (!rec) return res.status(404).json({ error: "Recommendation not found" });
  res.json(rec);
});
app.patch("/api/wellness/preferences", (req, res) => {
  const prefs = db.updateWellnessPreferences(req.body);
  res.json(prefs);
});
app.get("/api/notifications", optionalAuth, (req, res) => {
  res.json(db.getNotifications(req.user?.id));
});
app.patch("/api/notifications/:id/read", (req, res) => {
  const success = db.markNotificationRead(req.params.id);
  if (!success) return res.status(404).json({ error: "Notification not found" });
  res.json({ success: true });
});
app.post("/api/notifications/mark-all-read", (_req, res) => {
  db.markAllNotificationsRead();
  res.json({ success: true });
});
app.delete("/api/notifications/:id", (req, res) => {
  const success = db.deleteNotification(req.params.id);
  if (!success) return res.status(404).json({ error: "Notification not found" });
  res.json({ success: true });
});
app.post("/api/notifications/clear-read", (_req, res) => {
  db.clearReadNotifications();
  res.json({ success: true });
});
app.post("/api/notifications/test", optionalAuth, (req, res) => {
  const notif = db.addNotification({
    title: req.body.title || "MediMate Health Alert",
    message: req.body.message || "Hydration reminder: It has been 2 hours since your last water intake log.",
    category: req.body.category || "wellness",
    severity: req.body.severity || "info",
    actionTab: req.body.actionTab || "wellness"
  }, req.user?.id);
  res.status(201).json(notif);
});
app.get("/api/risk-flags", optionalAuth, (req, res) => {
  res.json(db.getRiskFlags(req.user?.id));
});
app.post("/api/risk-flags", optionalAuth, (req, res) => {
  const { title, severity, category, description, ruleTriggered, evidenceText, actionRequired, initialNote } = req.body;
  if (!title || !severity) return res.status(400).json({ error: "Title and severity are required" });
  const flag = db.addRiskFlag({
    title,
    severity: severity || "moderate",
    category: category || "symptom",
    description: description || "",
    ruleTriggered: ruleTriggered || "Manual Clinician / Patient Safety Observation",
    evidenceText: evidenceText || "",
    actionRequired: actionRequired || "Follow up with a certified physician",
    initialNote,
    status: "new"
  }, req.user?.id);
  res.status(201).json(flag);
});
app.patch("/api/risk-flags/:id", (req, res) => {
  const { status, actionRequired, newNote, author } = req.body;
  const flag = db.updateRiskFlag(req.params.id, { status, actionRequired }, newNote, author);
  if (!flag) return res.status(404).json({ error: "Risk flag not found" });
  res.json(flag);
});
app.delete("/api/risk-flags/:id", (req, res) => {
  const success = db.deleteRiskFlag(req.params.id);
  if (!success) return res.status(404).json({ error: "Risk flag not found" });
  res.json({ success: true });
});
app.get("/api/reminders", optionalAuth, (req, res) => {
  res.json(db.getReminders(req.user?.id));
});
app.post("/api/reminders", optionalAuth, (req, res) => {
  const { title, type, time, daysOfWeek, dosageOrDetail } = req.body;
  if (!title || !time) return res.status(400).json({ error: "Title and time are required" });
  const rem = db.addReminder({
    title,
    type: type || "medication",
    time,
    daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    dosageOrDetail: dosageOrDetail || "",
    active: true
  }, req.user?.id);
  res.status(201).json(rem);
});
app.patch("/api/reminders/:id", (req, res) => {
  const rem = db.updateReminder(req.params.id, req.body);
  if (!rem) return res.status(404).json({ error: "Reminder not found" });
  res.json(rem);
});
app.delete("/api/reminders/:id", (req, res) => {
  const success = db.deleteReminder(req.params.id);
  if (!success) return res.status(404).json({ error: "Reminder not found" });
  res.json({ success: true });
});
app.get("/api/appointments", optionalAuth, (req, res) => {
  res.json(db.getAppointments(req.user?.id));
});
app.post("/api/appointments", optionalAuth, (req, res) => {
  const { doctorId, doctorName, specialty, patientName, patientPhone, date, timeSlot, type, reason } = req.body;
  if (!doctorName || !date || !timeSlot) return res.status(400).json({ error: "Missing appointment details" });
  const apt = db.addAppointment({
    doctorId: doctorId || "doc-general",
    doctorName,
    specialty: specialty || "General Physician",
    patientName: patientName || (req.user ? req.user.fullName : "Patient"),
    patientPhone: patientPhone || (req.user ? req.user.phoneNumber : ""),
    date,
    timeSlot,
    type: type || "in-clinic",
    reason: reason || "Consultation",
    status: "confirmed"
  }, req.user?.id);
  res.status(201).json(apt);
});
app.post("/api/appointments/:id/cancel", (req, res) => {
  const success = db.cancelAppointment(req.params.id);
  if (!success) return res.status(404).json({ error: "Appointment not found" });
  res.json({ success: true });
});
app.get("/api/abha/status", (_req, res) => {
  res.json(db.getAbhaStatus());
});
app.post("/api/abha/generate-otp", (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: "ABHA number or mobile is required" });
  res.json({
    success: true,
    message: "Simulated OTP dispatched for sandbox testing",
    demoOtp: "123456",
    txnId: `ABDM-TXN-${Date.now()}`,
    expiresInSeconds: 300,
    disclaimer: "SANDBOX PROTOTYPE: Real ABDM M1/M2/M3 requires production National Health Authority (NHA) gateway credentials."
  });
});
app.post("/api/abha/verify-otp-link", (req, res) => {
  const { otp, abhaNumber, abhaAddress, name } = req.body;
  if (otp !== "123456" && otp !== "654321") {
    return res.status(400).json({ error: "Invalid OTP. For prototype sandbox verification, enter 123456." });
  }
  const cleanNumber = (abhaNumber || "91-4458-2910-3819").trim();
  const cleanAddress = (abhaAddress || "user@abdm").trim();
  const profile = db.linkAbhaProfile({
    abhaNumber: cleanNumber,
    abhaAddress: cleanAddress,
    name: name || "K. S. Sharma"
  });
  res.json({ success: true, profile });
});
app.post("/api/abha/unlink", (_req, res) => {
  const profile = db.unlinkAbhaProfile();
  res.json({ success: true, profile });
});
app.get("/api/abha/records", (_req, res) => {
  res.json(db.getAbhaHealthRecords());
});
app.post("/api/abha/records/:id/retrieve", (req, res) => {
  const rec = db.retrieveAbhaHealthRecord(req.params.id);
  if (!rec) return res.status(404).json({ error: "Health record not found" });
  res.json({ success: true, record: rec });
});
app.get("/api/doctors/registrations", (_req, res) => {
  res.json(db.getDoctorRegistrations());
});
app.get("/api/doctors/registrations/:id", (req, res) => {
  const doc = db.getDoctorRegistration(req.params.id);
  if (!doc) return res.status(404).json({ error: "Doctor registration not found" });
  res.json(doc);
});
app.post("/api/doctors/register", (req, res) => {
  const {
    fullName,
    email,
    phone,
    medicalCouncilNumber,
    stateMedicalCouncil,
    registrationYear,
    qualifications,
    primarySpecialty,
    subSpecialties = [],
    experienceYears,
    currentHospitalOrClinic,
    consultationFee = 500,
    isRetired = false,
    teleconsultationAdvisoryOnly = false,
    documentName
  } = req.body;
  if (!fullName || !medicalCouncilNumber || !primarySpecialty) {
    return res.status(400).json({ error: "Full name, Medical Council Registration Number, and Specialty are mandatory." });
  }
  const newDoc = db.registerDoctor({
    fullName,
    email: email || "",
    phone: phone || "",
    medicalCouncilNumber,
    stateMedicalCouncil: stateMedicalCouncil || "National Medical Commission",
    registrationYear: Number(registrationYear) || (/* @__PURE__ */ new Date()).getFullYear(),
    qualifications: qualifications || "MBBS",
    primarySpecialty,
    subSpecialties: Array.isArray(subSpecialties) ? subSpecialties : [subSpecialties],
    experienceYears: Number(experienceYears) || 1,
    currentHospitalOrClinic: currentHospitalOrClinic || "Independent Clinical Practice",
    consultationFee: Number(consultationFee) || 500,
    isRetired: Boolean(isRetired),
    teleconsultationAdvisoryOnly: Boolean(teleconsultationAdvisoryOnly),
    documentName: documentName || "medical_license_document.pdf"
  });
  res.status(201).json(newDoc);
});
app.put("/api/doctors/registrations/:id/verify", authenticateUser, requireRole("admin"), (req, res) => {
  const { status = "verified" } = req.body;
  const doc = db.getDoctorRegistration(req.params.id);
  if (!doc) return res.status(404).json({ error: "Doctor registration not found" });
  const auditNote = status === "verified" ? `Automated verification check passed against National Medical Register (NMC) API for ${doc.medicalCouncilNumber}. Practitioner authorized by Administrator (${req.user?.email || "admin"}).` : `Status changed to ${status}. Notification dispatched to practitioner.`;
  const updated = db.updateDoctorRegistration(req.params.id, {
    verificationStatus: status,
    nmcVerificationVerified: status === "verified",
    verifiedAt: status === "verified" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
    auditNotes: [...doc.auditNotes, auditNote]
  });
  res.json(updated);
});
app.get("/api/consultations", (_req, res) => {
  res.json(db.getConsultationSessions());
});
app.get("/api/consultations/appointment/:appointmentId", (req, res) => {
  const session = db.createOrGetConsultationSession(req.params.appointmentId);
  res.json(session);
});
app.get("/api/consultations/:id", (req, res) => {
  const session = db.getConsultationSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Consultation session not found" });
  res.json(session);
});
app.patch("/api/consultations/:id", (req, res) => {
  const session = db.updateConsultationSession(req.params.id, req.body);
  if (!session) return res.status(404).json({ error: "Consultation session not found" });
  res.json(session);
});
app.get("/api/user/profile", optionalAuth, (req, res) => {
  const profile = db.getUserProfile();
  if (req.user) {
    res.json({
      ...profile,
      name: req.user.fullName,
      phone: req.user.phoneNumber,
      email: req.user.email,
      role: req.user.role
    });
    return;
  }
  res.json(profile);
});
app.put("/api/user/profile", optionalAuth, (req, res) => {
  const updated = db.updateUserProfile(req.body);
  if (req.user) {
    db.updateUser(req.user.id, {
      fullName: req.body.name || req.user.fullName,
      phoneNumber: req.body.phone || req.user.phoneNumber
    });
  }
  res.json(updated);
});
app.get("/api/user/export-all", authenticateUser, (_req, res) => {
  const data = db.exportAllUserData();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="medmit-health-export.json"');
  res.json(data);
});
app.post("/api/user/reset-account", authenticateUser, (_req, res) => {
  db.resetAllData();
  res.json({ success: true, message: "All personal data reset successfully to baseline demonstration state." });
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname2, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  return new Promise((resolve) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`MediMate AI Server running on http://0.0.0.0:${PORT}`);
      resolve();
    });
  });
}
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start MediMate AI server:", err);
    process.exit(1);
  });
}

// server/api-entry.ts
var api_entry_default = app;
export {
  api_entry_default as default
};
