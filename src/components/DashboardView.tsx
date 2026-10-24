import React from 'react';
import {
  Activity,
  MessageSquare,
  FileText,
  MapPin,
  UserCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Clock,
  HeartPulse,
  Pill,
  CheckCircle2,
  Stethoscope,
  Loader2,
} from 'lucide-react';
import { AppLanguage, AppTab, CopilotTriageResponse, ReportAnalysisResult } from '../types';
import { useEmergencyCall } from '../hooks/useEmergencyCall';

interface DashboardViewProps {
  language: AppLanguage;
  onNavigateTab: (tab: AppTab) => void;
  onOpenEmergencyModal: () => void;
  activeTriage: CopilotTriageResponse | null;
  activeReport: ReportAnalysisResult | null;
  appointmentCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  onNavigateTab,
  onOpenEmergencyModal,
  activeTriage,
  activeReport,
  appointmentCount,
}) => {
  const { isCalling, callingNumber, callAmbulance108 } = useEmergencyCall();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner with Prominent Main Action */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 sm:p-10 text-white overflow-hidden shadow-2xl border border-teal-800/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MediMate AI Healthcare Assistant 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {language === 'te'
              ? 'మీ వ్యక్తిగత AI ఆరోగ్య సహాయకుడు & క్లినికల్ ట్రయేజ్'
              : 'Your Intelligent Healthcare Companion & Clinical Triage'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'te'
              ? 'లక్షణాలను వెంటనే విశ్లేషించండి, ల్యాబ్ రిపోర్టులను అర్థం చేసుకోండి మరియు సమీపంలోని విశ్వసనీయ ఆసుపత్రులు, క్లినిక్స్ మరియు వైద్యులను కనుగొనండి.'
              : 'Safely evaluate symptoms, decipher complex pathology lab reports into everyday language, and locate verified nearby healthcare facilities and medical stores.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Primary Action Button */}
            <button
              onClick={() => onNavigateTab('copilot')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'te' ? 'ఆరోగ్య సంభాషణ ప్రారంభించండి' : 'Start Health Conversation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => onNavigateTab('report')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl border border-white/20 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{language === 'te' ? 'ల్యాబ్ రిపోర్ట్ విశ్లేషించండి' : 'Upload Lab Report'}</span>
            </button>

            {/* Find Nearby Care Quick Link */}
            <button
              onClick={() => onNavigateTab('nearby')}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-2xl border border-slate-700 transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Find Care Near Me</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected 3-Step Patient Journey Workflow Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              The Connected MediMate Patient Journey
            </h2>
            <p className="text-xs text-slate-500">
              Seamless transition from symptom understanding to diagnostic clarity and real-world care.
            </p>
          </div>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full self-start">
            Step-by-Step Clinical Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1 */}
          <div
            onClick={() => onNavigateTab('copilot')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition">
              1. Symptom Triage & Copilot
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Describe how you feel in English or Telugu. The Copilot checks for red flags, calculates urgency, and suggests relevant medical specialties.
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigateTab('report')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition">
              2. Lab Report OCR & Analysis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload blood tests or pathology reports. Gemini OCR extracts exact values, marks abnormal flags, and prepares questions to discuss with your doctor.
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigateTab('nearby')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-800 transition">
              3. Nearby Care & Specialist Booking
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find verified local hospitals, polyclinics, and pharmacies on OpenStreetMap, and book verified specialist appointments directly.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: AI Health Copilot */}
        <div
          onClick={() => onNavigateTab('copilot')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">AI Health Copilot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conversational symptom evaluation, follow-up questions, and specialty recommendations in English and Telugu.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Consult Copilot</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 2: Report Scanner */}
        <div
          onClick={() => onNavigateTab('report')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Report Analyzer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deep multimodal document parsing for PDF and image lab reports. Highlights critical values and reference thresholds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Upload or Scan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 3: Nearby Care */}
        <div
          onClick={() => onNavigateTab('nearby')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Find Nearby Care</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive map with real OpenStreetMap hospitals, clinics, and medical shops with direct navigation links.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Open Map Finder</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 4: Doctor Directory */}
        <div
          onClick={() => onNavigateTab('doctors')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Doctor Directory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Search verified physicians by specialty, view clinical credentials, and book in-clinic or video appointments.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>Browse Specialists</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Platform Wellness, Flags, ABDM & Voice Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 5: Wellness Recommendations */}
        <div
          onClick={() => onNavigateTab('wellness')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Wellness Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Personalized hydration, sleep hygiene, physical activity goals, and preventive care reminders.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Track Daily Goals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 6: Clinical Risk Flags */}
        <div
          onClick={() => onNavigateTab('risk_flags')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Clinical Risk Flags</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated safety rules and traceable evidence flags derived from vital signs and consultation history.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>Inspect Risk Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 7: ABHA / ABDM Gateway */}
        <div
          onClick={() => onNavigateTab('abha')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">ABHA / ABDM Gateway</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Digital health account integration in mock sandbox mode, consent artifact linking, and health card.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>View ABHA Health Card</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 8: Voice Dictation & Data Vault */}
        <div
          onClick={() => onNavigateTab('voice')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Voice Dictation Hub</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hands-free clinical speech recognition, playback, transcript editing, and direct dispatch to Copilot.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Voice Scratchpad</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Active Session Health Context (if user has run triage or uploaded a report) */}
      {(activeTriage || activeReport || appointmentCount > 0) && (
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Active Session Patient Progress
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTriage && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Last Evaluated Symptoms
                </span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {activeTriage.summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-teal-900">
                    Rec: {activeTriage.suggested_specialty}
                  </span>
                  <button
                    onClick={() => onNavigateTab('copilot')}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Resume Copilot
                  </button>
                </div>
              </div>
            )}

            {activeReport && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Analyzed Medical Report
                </span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {activeReport.fileName || 'Diagnostic Panel'} ({activeReport.tests.length} tests)
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-emerald-900">
                    {activeReport.overall_urgency}
                  </span>
                  <button
                    onClick={() => onNavigateTab('report')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View Report
                  </button>
                </div>
              </div>
            )}

            {appointmentCount > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Upcoming Consultations
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {appointmentCount} Active Appointment(s) Scheduled
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-emerald-600">Confirmed</span>
                  <button
                    onClick={() => onNavigateTab('appointments')}
                    className="text-xs font-bold text-indigo-700 hover:underline"
                  >
                    Manage Slots
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety & Compliance Footer Banner */}
      <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-teal-700 shrink-0" />
          <div>
            <span className="font-bold text-slate-800">Clinical Triage & Patient Safety Standard</span>
            <p className="text-[11px] text-slate-500">
              MediMate AI enforces strict emergency prioritization. In life-threatening emergencies, bypass digital chat and dial 108 (India Emergency Ambulance) or 112 immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => callAmbulance108(e)}
            disabled={isCalling}
            className={`bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/30 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
              isCalling && callingNumber === '108' ? 'ring-2 ring-red-300 animate-pulse' : ''
            }`}
          >
            {isCalling && callingNumber === '108' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            )}
            <span>{isCalling && callingNumber === '108' ? 'Connecting 108...' : 'Call 108 (Ambulance)'}</span>
          </button>
          <button
            onClick={onOpenEmergencyModal}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-3 py-2 rounded-xl transition text-xs cursor-pointer"
          >
            Protocol Info
          </button>
        </div>
      </div>
    </div>
  );
};
