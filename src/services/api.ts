import {
  CopilotTriageResponse,
  DoctorSummary,
  Facility,
  ReportAnalysisResult,
  ConversationRecord,
  VoiceRecord,
  WellnessRecommendation,
  WellnessPreferences,
  NotificationRecord,
  RiskFlagRecord,
  ReminderRecord,
  Appointment,
  AbhaProfile,
  AbhaAuditLog,
  UserProfile,
  AppLanguage,
  DoctorRegistration,
  ConsultationSession,
  AbhaHealthRecord,
} from '../types';

export async function sendCopilotChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  language: AppLanguage = 'en'
): Promise<CopilotTriageResponse> {
  const response = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }

  return response.json();
}

/**
 * Streaming Copilot Chat with ReadableStream API.
 * Calls onToken as tokens stream in real-time, reducing perceived latency.
 * Falls back seamlessly to non-streaming chat endpoint if stream is interrupted.
 */
export async function streamCopilotChat(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  language?: AppLanguage;
  onToken: (token: string, accumulated: string) => void;
  onDone: (triage: CopilotTriageResponse) => void;
  onError?: (err: Error) => void;
}): Promise<void> {
  const { messages, language = 'en', onToken, onDone, onError } = params;

  try {
    const response = await fetch('/api/copilot/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming failed: HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';
    let completed = false;

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('data:')) {
        const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
        if (!jsonStr) return;
        try {
          const data = JSON.parse(jsonStr);
          if (data.type === 'token' && typeof data.text === 'string') {
            accumulatedText += data.text;
            onToken(data.text, accumulatedText);
          } else if (data.type === 'done' && data.triage) {
            completed = true;
            onDone(data.triage);
          } else if (data.type === 'error') {
            throw new Error(data.error || 'Stream error');
          }
        } catch (e) {
          // ignore partial JSON parse error
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      processLine(buffer.trim());
    }

    // If stream closed without completing triage, fallback to full chat endpoint
    if (!completed) {
      const fallbackResult = await sendCopilotChat(messages, language);
      onDone(fallbackResult);
    }
  } catch (err: any) {
    console.warn('Stream interrupted, activating instant fallback to chat API:', err);
    try {
      const fallbackResult = await sendCopilotChat(messages, language);
      onDone(fallbackResult);
    } catch (fallbackErr: any) {
      console.error('Both stream and fallback failed:', fallbackErr);
      if (onError) onError(fallbackErr);
      else throw fallbackErr;
    }
  }
}

export async function getDoctorSummary(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  language?: AppLanguage;
}): Promise<DoctorSummary> {
  const response = await fetch('/api/copilot/doctor-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }

  return response.json();
}


export async function analyzeReportFile(params: {
  fileData?: string;
  mimeType?: string;
  textContent?: string;
  language?: AppLanguage;
}): Promise<ReportAnalysisResult> {
  const response = await fetch('/api/report/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }

  return response.json();
}

export async function fetchNearbyFacilities(params: {
  lat: number;
  lng: number;
  category?: string;
  radius?: number;
}): Promise<{
  center: { lat: number; lng: number };
  radius: number;
  category: string;
  total: number;
  facilities: Facility[];
}> {
  const query = new URLSearchParams({
    lat: params.lat.toString(),
    lng: params.lng.toString(),
    category: params.category || 'all',
    radius: (params.radius || 5000).toString(),
  });

  const response = await fetch(`/api/places/nearby?${query.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch nearby places (${response.status})`);
  }

  return response.json();
}

export async function geocodeLocationQuery(query: string): Promise<
  Array<{
    displayName: string;
    lat: number;
    lng: number;
    type: string;
    importance: number;
  }>
> {
  const res = await fetch(`/api/places/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error('Geocoding service unavailable');
  }
  const data = await res.json();
  return data.results || [];
}

export async function synthesizeVoiceAudio(
  text: string,
  language: AppLanguage = 'en'
): Promise<{ available: boolean; audioUrl?: string }> {
  try {
    const res = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) return { available: false };
    return res.json();
  } catch (err) {
    return { available: false };
  }
}

export async function transcribeAudioBlob(
  audioBase64: string,
  mimeType: string,
  language: AppLanguage = 'en'
): Promise<{ transcript: string; success: boolean }> {
  const res = await fetch('/api/voice/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioData: audioBase64, mimeType, language }),
  });

  if (!res.ok) {
    throw new Error('Transcription service failed');
  }

  return res.json();
}

// --- Conversations & Messages API ---
export async function fetchConversations(query?: string): Promise<ConversationRecord[]> {
  const url = query ? `/api/conversations?q=${encodeURIComponent(query)}` : '/api/conversations';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load conversations');
  return res.json();
}

export async function createConversation(title: string, language: AppLanguage = 'en'): Promise<ConversationRecord> {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, language }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export async function fetchConversation(id: string): Promise<{ conversation: ConversationRecord; messages: any[] }> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to load conversation details');
  return res.json();
}

export async function updateConversationTitle(id: string, title: string): Promise<ConversationRecord> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to update conversation title');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function addMessageToConversation(
  conversationId: string,
  message: { role: 'user' | 'assistant'; content: string; triage?: any; reportContext?: string; isVoice?: boolean }
): Promise<any> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error('Failed to record message in database');
  return res.json();
}

// --- Voice History API ---
export async function fetchVoiceRecords(): Promise<VoiceRecord[]> {
  const res = await fetch('/api/voice');
  if (!res.ok) throw new Error('Failed to load voice records');
  return res.json();
}

export async function saveVoiceRecord(record: {
  transcript: string;
  durationSeconds: number;
  language?: AppLanguage;
  hasAudioStorage?: boolean;
  audioDataUri?: string;
  conversationId?: string;
}): Promise<VoiceRecord> {
  const res = await fetch('/api/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to save voice record');
  return res.json();
}

export async function deleteVoiceRecord(id: string): Promise<void> {
  const res = await fetch(`/api/voice/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete voice record');
}

// --- Wellness Recommendations API ---
export async function fetchWellnessData(): Promise<{
  recommendations: WellnessRecommendation[];
  preferences: WellnessPreferences;
}> {
  const res = await fetch('/api/wellness');
  if (!res.ok) throw new Error('Failed to load wellness data');
  return res.json();
}

export async function updateRecommendationStatus(
  id: string,
  status: WellnessRecommendation['status']
): Promise<WellnessRecommendation> {
  const res = await fetch(`/api/wellness/recommendations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update recommendation status');
  return res.json();
}

export async function addCustomRecommendation(rec: {
  category: WellnessRecommendation['category'];
  title: string;
  description: string;
  rationale?: string;
  priority?: 'high' | 'medium' | 'low';
  frequency?: 'daily' | 'weekly' | 'custom';
  targetValue?: string;
}): Promise<WellnessRecommendation> {
  const res = await fetch('/api/wellness/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rec),
  });
  if (!res.ok) throw new Error('Failed to add recommendation');
  return res.json();
}

export async function updateWellnessPreferences(prefs: Partial<WellnessPreferences>): Promise<WellnessPreferences> {
  const res = await fetch('/api/wellness/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error('Failed to update wellness preferences');
  return res.json();
}

// --- Notifications Center API ---
export async function fetchNotifications(): Promise<{
  notifications: NotificationRecord[];
  unreadCount: number;
}> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to mark notification read');
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to mark all notifications read');
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete notification');
}

export async function clearReadNotifications(): Promise<void> {
  const res = await fetch('/api/notifications/clear-read', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clear read notifications');
}

export async function triggerTestNotification(title?: string, message?: string): Promise<NotificationRecord> {
  const res = await fetch('/api/notifications/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message }),
  });
  if (!res.ok) throw new Error('Failed to send test notification');
  return res.json();
}

// --- Risk Flags API ---
export async function fetchRiskFlags(): Promise<RiskFlagRecord[]> {
  const res = await fetch('/api/risk-flags');
  if (!res.ok) throw new Error('Failed to load risk flags');
  return res.json();
}

export async function createRiskFlag(flag: {
  title: string;
  severity: 'critical' | 'moderate' | 'low';
  category: 'vital' | 'symptom' | 'lab_report' | 'lifestyle';
  description: string;
  ruleTriggered?: string;
  evidenceText?: string;
  actionRequired?: string;
  initialNote?: string;
}): Promise<RiskFlagRecord> {
  const res = await fetch('/api/risk-flags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flag),
  });
  if (!res.ok) throw new Error('Failed to create risk flag');
  return res.json();
}

export async function updateRiskFlag(
  id: string,
  payload: {
    status?: RiskFlagRecord['status'];
    actionRequired?: string;
    newNote?: string;
    author?: string;
  }
): Promise<RiskFlagRecord> {
  const res = await fetch(`/api/risk-flags/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update risk flag');
  return res.json();
}

export async function deleteRiskFlag(id: string): Promise<void> {
  const res = await fetch(`/api/risk-flags/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete risk flag');
}

// --- Reminders API ---
export async function fetchReminders(): Promise<ReminderRecord[]> {
  const res = await fetch('/api/reminders');
  if (!res.ok) throw new Error('Failed to load reminders');
  return res.json();
}

export async function addReminder(reminder: {
  title: string;
  type: ReminderRecord['type'];
  time: string;
  daysOfWeek: string[];
  dosageOrDetail?: string;
  active?: boolean;
}): Promise<ReminderRecord> {
  const res = await fetch('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminder),
  });
  if (!res.ok) throw new Error('Failed to add reminder');
  return res.json();
}

export async function updateReminder(id: string, updates: Partial<ReminderRecord>): Promise<ReminderRecord> {
  const res = await fetch(`/api/reminders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update reminder');
  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`/api/reminders/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reminder');
}

// --- Appointments API ---
export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch('/api/appointments');
  if (!res.ok) throw new Error('Failed to load appointments');
  return res.json();
}

export async function bookAppointment(apt: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apt),
  });
  if (!res.ok) throw new Error('Failed to book appointment');
  return res.json();
}

export async function cancelAppointment(id: string): Promise<void> {
  const res = await fetch(`/api/appointments/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to cancel appointment');
}

// --- ABHA Integration API ---
export async function fetchAbhaStatus(): Promise<{ profile: AbhaProfile; auditLogs: AbhaAuditLog[] }> {
  const res = await fetch('/api/abha/status');
  if (!res.ok) throw new Error('Failed to load ABHA status');
  return res.json();
}

export async function generateAbhaOtp(identifier: string): Promise<{ success: boolean; demoOtp: string; txnId: string }> {
  const res = await fetch('/api/abha/generate-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  if (!res.ok) throw new Error('Failed to generate mock OTP');
  return res.json();
}

export async function verifyAbhaOtpLink(payload: {
  otp: string;
  abhaNumber: string;
  abhaAddress: string;
  name?: string;
}): Promise<{ success: boolean; profile: AbhaProfile }> {
  const res = await fetch('/api/abha/verify-otp-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to verify OTP');
  }
  return res.json();
}

export async function unlinkAbhaProfile(): Promise<{ success: boolean; profile: AbhaProfile }> {
  const res = await fetch('/api/abha/unlink', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to unlink ABHA profile');
  return res.json();
}

// --- User Profile, Consents & Privacy API ---
export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch('/api/user/profile');
  if (!res.ok) throw new Error('Failed to load user profile');
  return res.json();
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}

export async function resetUserAccount(): Promise<void> {
  const res = await fetch('/api/user/reset-account', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset account');
}

// --- Doctor Registration & Professional Verification API ---
export async function fetchDoctorRegistrations(): Promise<DoctorRegistration[]> {
  const res = await fetch('/api/doctors/registrations');
  if (!res.ok) throw new Error('Failed to load doctor registrations');
  return res.json();
}

export async function registerDoctor(data: {
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
  documentName?: string;
}): Promise<DoctorRegistration> {
  const res = await fetch('/api/doctors/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit doctor registration');
  }
  return res.json();
}

export async function verifyDoctorRegistration(id: string, status: string = 'verified'): Promise<DoctorRegistration> {
  const res = await fetch(`/api/doctors/registrations/${encodeURIComponent(id)}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to verify doctor registration');
  return res.json();
}

// --- Online Consultation Room API ---
export async function fetchConsultationSession(appointmentId: string): Promise<ConsultationSession> {
  const res = await fetch(`/api/consultations/appointment/${encodeURIComponent(appointmentId)}`);
  if (!res.ok) throw new Error('Failed to load consultation session');
  return res.json();
}

export async function updateConsultationSession(id: string, updates: Partial<ConsultationSession>): Promise<ConsultationSession> {
  const res = await fetch(`/api/consultations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update consultation session');
  return res.json();
}

// --- ABHA Health Records Discovery & Retrieval API ---
export async function fetchAbhaHealthRecords(): Promise<AbhaHealthRecord[]> {
  const res = await fetch('/api/abha/records');
  if (!res.ok) throw new Error('Failed to load ABHA health records');
  return res.json();
}

export async function retrieveAbhaHealthRecord(id: string): Promise<{ success: boolean; record: AbhaHealthRecord }> {
  const res = await fetch(`/api/abha/records/${encodeURIComponent(id)}/retrieve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to retrieve ABHA health record');
  return res.json();
}



