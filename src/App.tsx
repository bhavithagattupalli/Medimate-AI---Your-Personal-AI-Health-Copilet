import React, { useState, useEffect } from 'react';
import { AppLanguage, AppTab, Appointment, CopilotTriageResponse, ReportAnalysisResult } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CopilotView } from './components/CopilotView';
import { ReportAnalyzerView } from './components/ReportAnalyzerView';
import { NearbyCareView } from './components/NearbyCareView';
import { DoctorDirectoryView } from './components/DoctorDirectoryView';
import { AppointmentsView } from './components/AppointmentsView';
import { EmergencyModal } from './components/EmergencyModal';
import { ChatHistoryView } from './components/ChatHistoryView';
import { VoiceHistoryView } from './components/VoiceHistoryView';
import { WellnessRecommendationsView } from './components/WellnessRecommendationsView';
import { NotificationsCenterView } from './components/NotificationsCenterView';
import { RiskFlagsView } from './components/RiskFlagsView';
import { HealthRecordsView } from './components/HealthRecordsView';
import { AbhaIntegrationView } from './components/AbhaIntegrationView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { DoctorRegistrationView } from './components/DoctorRegistrationView';
import { ConsultationRoomView } from './components/ConsultationRoomView';
import { fetchAppointments, bookAppointment as apiBookAppointment, cancelAppointment as apiCancelAppointment } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

function AppContent() {
  const { isAuthModalOpen, closeAuthModal, authModalTab } = useAuth();
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [activeConsultationAppointment, setActiveConsultationAppointment] = useState<Appointment | null>(null);

  // Cross-feature shared context
  const [activeSpecialtyHint, setActiveSpecialtyHint] = useState<string | null>(null);
  const [activeTriage, setActiveTriage] = useState<CopilotTriageResponse | null>(null);
  const [activeReport, setActiveReport] = useState<ReportAnalysisResult | null>(null);
  const [reportContextForCopilot, setReportContextForCopilot] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePromptForCopilot, setActivePromptForCopilot] = useState<string | null>(null);

  // Appointments state with persistence
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => console.warn('Could not load appointments:', err));
  }, []);

  const handleBookAppointment = async (apt: Appointment) => {
    try {
      const created = await apiBookAppointment(apt);
      setAppointments((prev) => [created, ...prev]);
    } catch (e) {
      setAppointments((prev) => [apt, ...prev]);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await apiCancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Connected Navigation Handlers
  const handleNavigateToNearbyCare = (specialty?: string) => {
    if (specialty) setActiveSpecialtyHint(specialty);
    setCurrentTab('nearby');
  };

  const handleNavigateToDoctors = (specialty?: string) => {
    if (specialty) setActiveSpecialtyHint(specialty);
    setCurrentTab('doctors');
  };

  const handleSendReportToCopilot = (reportSummary: string) => {
    setReportContextForCopilot(reportSummary);
    setCurrentTab('copilot');
  };

  const handleSaveReportResult = (result: ReportAnalysisResult) => {
    setActiveReport(result);
    if (result.suggested_specialist) {
      setActiveSpecialtyHint(result.suggested_specialist);
    }
  };

  const handleOpenConversationInCopilot = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentTab('copilot');
  };

  const handleSendVoiceTranscriptToCopilot = (transcript: string) => {
    setActivePromptForCopilot(transcript);
    setCurrentTab('copilot');
  };

  const handleStartNewConsultation = () => {
    setActiveConversationId(null);
    setCurrentTab('copilot');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'emergency') {
            setIsEmergencyModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        language={language}
        onToggleLanguage={setLanguage}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        activeSpecialtyHint={activeSpecialtyHint}
        hasAnalyzedReport={Boolean(activeReport)}
      />

      {/* Main Tab View Routing */}
      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && (
          <DashboardView
            language={language}
            onNavigateTab={(tab) => {
              if (tab === 'emergency') {
                setIsEmergencyModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            activeTriage={activeTriage}
            activeReport={activeReport}
            appointmentCount={appointments.length}
          />
        )}

        {currentTab === 'copilot' && (
          <CopilotView
            language={language}
            onNavigateToNearbyCare={handleNavigateToNearbyCare}
            onNavigateToDoctors={handleNavigateToDoctors}
            onNavigateToReport={() => setCurrentTab('report')}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            initialReportContext={reportContextForCopilot}
            onClearReportContext={() => setReportContextForCopilot(null)}
            activeConversationId={activeConversationId}
            initialPrompt={activePromptForCopilot}
            onClearInitialPrompt={() => setActivePromptForCopilot(null)}
          />
        )}

        {currentTab === 'chat_history' && (
          <ChatHistoryView
            language={language}
            onOpenConversation={handleOpenConversationInCopilot}
            onNewChat={handleStartNewConsultation}
          />
        )}

        {currentTab === 'voice' && (
          <VoiceHistoryView
            language={language}
            onSendTranscriptToCopilot={handleSendVoiceTranscriptToCopilot}
          />
        )}

        {currentTab === 'wellness' && (
          <WellnessRecommendationsView
            language={language}
            onNavigateTab={(t) => setCurrentTab(t as AppTab)}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsCenterView
            language={language}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'risk_flags' && (
          <RiskFlagsView
            language={language}
            onNavigateToEmergency={() => setIsEmergencyModalOpen(true)}
            onNavigateToDoctors={handleNavigateToDoctors}
          />
        )}

        {currentTab === 'records' && (
          <HealthRecordsView
            language={language}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'abha' && (
          <AbhaIntegrationView
            language={language}
            onSendRecordToAnalyzer={(summary) => {
              setReportContextForCopilot(summary);
              setCurrentTab('report');
            }}
            onSendRecordToCopilot={(prompt) => {
              setActivePromptForCopilot(prompt);
              setCurrentTab('copilot');
            }}
          />
        )}

        {currentTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            language={language}
            onCancelAppointment={handleCancelAppointment}
            onNavigateToDoctors={() => setCurrentTab('doctors')}
            onStartConsultation={(apt) => {
              setActiveConsultationAppointment(apt);
              setCurrentTab('consultation');
            }}
          />
        )}

        {currentTab === 'consultation' && (
          <ConsultationRoomView
            language={language}
            appointment={activeConsultationAppointment}
            onEndCall={() => setCurrentTab('appointments')}
            onNavigateToAppointments={() => setCurrentTab('appointments')}
          />
        )}

        {currentTab === 'doctor_portal' && (
          <DoctorRegistrationView
            language={language}
            onNavigateToDoctors={() => setCurrentTab('doctors')}
          />
        )}

        {currentTab === 'settings' && (
          <ProfileSettingsView
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {currentTab === 'report' && (
          <ReportAnalyzerView
            language={language}
            onSendToCopilot={handleSendReportToCopilot}
            onNavigateToNearbyCare={handleNavigateToNearbyCare}
            onSaveReportResult={handleSaveReportResult}
          />
        )}

        {currentTab === 'nearby' && (
          <NearbyCareView
            language={language}
            preselectedSpecialty={activeSpecialtyHint}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {currentTab === 'doctors' && (
          <DoctorDirectoryView
            language={language}
            preselectedSpecialty={activeSpecialtyHint}
            onBookAppointment={handleBookAppointment}
            onNavigateToAppointments={() => setCurrentTab('appointments')}
          />
        )}
      </main>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        language={language}
        onNavigateToHospitals={() => {
          setActiveSpecialtyHint('Emergency Medicine');
          setCurrentTab('nearby');
        }}
      />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
