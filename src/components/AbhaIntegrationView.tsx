import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  LogOut,
  AlertCircle,
  FileCheck2,
  Clock,
  Layers,
  FileText,
  TrendingDown,
  TrendingUp,
  Activity,
  Download,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AbhaProfile, AbhaAuditLog, AppLanguage, AbhaHealthRecord, HealthTimelineMilestone } from '../types';
import {
  fetchAbhaStatus,
  generateAbhaOtp,
  verifyAbhaOtpLink,
  unlinkAbhaProfile,
  fetchAbhaHealthRecords,
  retrieveAbhaHealthRecord,
} from '../services/api';

interface AbhaIntegrationViewProps {
  language: AppLanguage;
  onSendRecordToAnalyzer?: (summary: string) => void;
  onSendRecordToCopilot?: (summary: string) => void;
}

export const AbhaIntegrationView: React.FC<AbhaIntegrationViewProps> = ({
  language,
  onSendRecordToAnalyzer,
  onSendRecordToCopilot,
}) => {
  const [profile, setProfile] = useState<AbhaProfile>({
    isLinked: false,
    mode: 'mock_sandbox',
    activeConsentArtifacts: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AbhaAuditLog[]>([]);
  const [records, setRecords] = useState<AbhaHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'card' | 'records' | 'timeline'>('card');
  const [retrievingId, setRetrievingId] = useState<string | null>(null);

  // Linkage flow states
  const [step, setStep] = useState<'input' | 'otp' | 'consent'>('input');
  const [identifier, setIdentifier] = useState('91-4458-2910-3819');
  const [otp, setOtp] = useState('123456');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Personal Health Timeline Milestones
  const timelineMilestones: HealthTimelineMilestone[] = [
    {
      id: 'mile-1',
      date: '18 Oct 2026',
      title: 'Fasting Plasma Glucose & Lipid Profile',
      category: 'lab_test',
      facilityOrDoctor: 'Care Community Hospital & Diagnostics',
      keyMetric: { name: 'Fasting Glucose', value: '106 mg/dL', unit: 'mg/dL', trend: 'needs_attention' },
      notes: 'Borderline elevated fasting glucose. HbA1c improved to 6.2% from 6.7% last quarter.',
    },
    {
      id: 'mile-2',
      date: '15 Jun 2026',
      title: 'Quarterly Hypertensive & Cardiology Follow-up',
      category: 'consultation',
      facilityOrDoctor: 'Dr. Rajeshwar Rao, MD',
      keyMetric: { name: 'Blood Pressure', value: '122/80', unit: 'mmHg', trend: 'improving' },
      notes: 'Sitting blood pressure well controlled on low-dose Telmisartan and daily 45 min walk.',
    },
    {
      id: 'mile-3',
      date: '02 Mar 2026',
      title: 'E-Prescription & Chronic Medication Plan',
      category: 'prescription',
      facilityOrDoctor: 'Apollo Health City Pharmacy & OPD',
      keyMetric: { name: 'Total Cholesterol', value: '188 mg/dL', unit: 'mg/dL', trend: 'stable' },
      notes: 'Prescribed Telmisartan 40mg OD and weekly Vitamin D3 60,000 IU.',
    },
    {
      id: 'mile-4',
      date: '20 Nov 2025',
      title: 'Annual Cardiac Stress Echo Screening',
      category: 'vitals_trend',
      facilityOrDoctor: 'Fortis Hospital & Heart Centre',
      keyMetric: { name: 'Ejection Fraction', value: '62%', unit: '%', trend: 'stable' },
      notes: 'Negative for inducible myocardial ischemia at 92% maximum predicted heart rate.',
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, recordsData] = await Promise.all([
        fetchAbhaStatus(),
        fetchAbhaHealthRecords().catch(() => []),
      ]);
      setProfile(statusData.profile);
      setAuditLogs(statusData.auditLogs);
      setRecords(recordsData);
    } catch (err) {
      console.error('Failed to load ABHA status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await generateAbhaOtp(identifier.trim());
      setDemoOtpNotice(res.demoOtp);
      setStep('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch mock OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await verifyAbhaOtpLink({
        otp: otp.trim(),
        abhaNumber: identifier.includes('@') ? '91-4458-2910-3819' : identifier.trim(),
        abhaAddress: identifier.includes('@') ? identifier.trim() : 'kssharma@abdm',
        name: 'K. S. Sharma',
      });
      setProfile(res.profile);
      setStep('input');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    if (
      !window.confirm(
        language === 'te'
          ? 'ABHA ప్రొఫైల్‌ను అన్‌లింక్ చేయాలనుకుంటున్నారా?'
          : 'Are you sure you want to unlink your ABHA identification from MediMate?'
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await unlinkAbhaProfile();
      await loadData();
    } catch (err) {
      alert('Failed to unlink ABHA profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveRecord = async (id: string) => {
    setRetrievingId(id);
    try {
      const res = await retrieveAbhaHealthRecord(id);
      if (res.success) {
        setRecords((prev) => prev.map((r) => (r.id === id ? res.record : r)));
      }
    } catch (err) {
      alert('Failed to retrieve record from ABDM Gateway');
    } finally {
      setRetrievingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5 text-indigo-700" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'te' ? 'ABHA / ABDM డిజిటల్ హెల్త్ మిషన్' : 'ABHA / ABDM Digital Health Mission Hub'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Ayushman Bharat Digital Mission (Milestone 1, 2 & 3) compliant digital health identifier, consent gateway, and longitudinal EHR timeline.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh ABDM Gateway"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* ABDM Architecture & Sandbox Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Layers className="w-4 h-4 text-amber-700" />
        </div>
        <div className="text-xs text-amber-950 leading-relaxed">
          <div className="font-extrabold flex items-center gap-2 mb-0.5">
            <span>PROTOTYPE ABDM SANDBOX (M1 / M2 / M3 ADAPTER ACTIVE)</span>
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              NHA Specification Compliant
            </span>
          </div>
          <p>
            {language === 'te'
              ? 'ఈ మాడ్యూల్ ABDM స్పెసిఫికేషన్లను ప్రదర్శించడానికి సిమ్యులేటెడ్ శాండ్‌బాక్స్‌ని ఉపయోగిస్తుంది. నేషనల్ హెల్త్ అథారిటీ (NHA) నిబంధనల ప్రకారం కన్సెంట్ ఆర్టిఫాక్ట్స్ మరియు కేర్ కాంటెక్స్ట్ లింకింగ్ పనిచేస్తుంది.'
              : 'This interface demonstrates the modular ABDM M1 (ABHA creation/linking), M2 (HIP care context discovery & linking), and M3 (HIU health record exchange via FHIR) protocol emulator. For live hospital deployments, configure live NHA client credentials in .env.'}
          </p>
        </div>
      </div>

      {/* Sub-Tabs: Digital Card | Discovered Health Records | Longitudinal Timeline */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'card'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Digital ABHA Card</span>
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'records'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Discovered EHR Records ({records.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health Timeline & Trends</span>
        </button>
      </div>

      {/* TAB 1: Digital Card & Verification Flow */}
      {activeTab === 'card' && (
        <>
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
              <p className="text-xs font-medium">Querying ABDM Gateway status...</p>
            </div>
          ) : profile.isLinked ? (
            <div className="space-y-6">
              {/* Digital ABHA Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-indigo-800/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 shadow-md">
                      🇮🇳
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg tracking-tight">ABHA Health Card</h3>
                      <p className="text-xs text-indigo-200">Ayushman Bharat Digital Mission (Sandbox)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Linked & Verified</span>
                    </span>
                    <button
                      onClick={handleUnlink}
                      className="bg-slate-800/80 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 text-xs px-3 py-1 rounded-xl transition flex items-center gap-1 border border-slate-700"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Unlink</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 items-center">
                  <div className="sm:col-span-2 space-y-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                        ABHA Number
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-white">
                        {profile.abhaNumber || '91-4458-2910-3819'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-indigo-300 font-medium block">ABHA Address (PHR):</span>
                        <span className="font-mono font-bold text-white">{profile.abhaAddress || 'kssharma@abdm'}</span>
                      </div>
                      <div>
                        <span className="text-indigo-300 font-medium block">Holder Name:</span>
                        <span className="font-bold text-white">{profile.name || 'K. S. Sharma'}</span>
                      </div>
                      <div>
                        <span className="text-indigo-300 font-medium block">Gender / DOB:</span>
                        <span className="text-white">Male / 14-Jun-1978</span>
                      </div>
                      <div>
                        <span className="text-indigo-300 font-medium block">Linked Hospital (HIP):</span>
                        <span className="text-white truncate block">Care Community Hospital</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-3.5 rounded-2xl w-32 h-32 mx-auto sm:ml-auto flex flex-col items-center justify-center text-slate-900 shadow-lg">
                    <QrCode className="w-20 h-20 text-slate-900 stroke-[1.8]" />
                    <span className="text-[9px] font-mono font-bold mt-1 text-slate-600">SCAN AT OPD</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-800/40 text-[11px] text-indigo-300/80 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Consent-Manager Architecture • HIP/HIU Encrypted
                  </span>
                  <span>Active Consents: {profile.activeConsentArtifacts || 2}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Unlinked State: Step Form */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">Connect Your Digital ABHA Identity</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Link your 14-digit ABHA ID or PHR address (@abdm) to securely import medical histories, prescriptions, and lab reports.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {step === 'input' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      14-Digit ABHA Number or Mobile
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="91-4458-2910-3819 or 98480 12345"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Demo preset provided for instant sandbox evaluation.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Simulating OTP...' : 'Send Simulated OTP'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                    <span className="font-bold block">Sandbox Test Mode OTP:</span>
                    <span>Enter demo OTP: </span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-300">
                      {demoOtpNotice || '123456'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-widest px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl shadow-xs transition"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify & Link Card'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Discovered EHR Records (Milestone 2 & 3) */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Discovered Health Records via ABDM Gateway</h2>
              <p className="text-xs text-slate-500">
                Care Contexts discovered from participating hospitals and diagnostic laboratories with authorized user consent.
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-100">
              {records.length} Care Contexts Found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{rec.documentName}</h3>
                      <p className="text-xs text-slate-500">
                        {rec.facilityName} • <strong>{rec.date}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {rec.hiType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {rec.careContextReference.split('/')[0]}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Summary: </strong>
                    {rec.summary}
                  </p>
                  {rec.keyFindings && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Parameters:</span>
                      {rec.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Record Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-500">
                    Clinician: <strong className="text-slate-700">{rec.doctorName}</strong> ({rec.department})
                  </div>

                  <div className="flex items-center gap-2">
                    {onSendRecordToAnalyzer && (
                      <button
                        onClick={() => onSendRecordToAnalyzer(`${rec.documentName}: ${rec.summary} ${rec.keyFindings.join(', ')}`)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Analyze with AI</span>
                      </button>
                    )}

                    {onSendRecordToCopilot && (
                      <button
                        onClick={() => onSendRecordToCopilot(`I have this ABDM health record from ${rec.facilityName} dated ${rec.date}: "${rec.summary}". What does this mean for my health?`)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 transition flex items-center gap-1.5"
                      >
                        <span>Discuss in Copilot</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRetrieveRecord(rec.id)}
                      disabled={retrievingId === rec.id}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      {retrievingId === rec.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching FHIR...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Retrieve FHIR Record</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Longitudinal Health Timeline & Trends */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Personal Health Timeline & Trend Tracker</h2>
              <p className="text-xs text-slate-500">
                Chronological aggregation of clinical encounters, lab trends, and preventive health reviews.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" /> Controlled
              </span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
            {timelineMilestones.map((m) => (
              <div key={m.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-xs" />
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">{m.date}</span>
                      <h3 className="font-extrabold text-slate-900 text-sm">{m.title}</h3>
                      <p className="text-xs text-slate-500">{m.facilityOrDoctor}</p>
                    </div>

                    {m.keyMetric && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right self-start sm:self-auto">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{m.keyMetric.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-800 text-sm">{m.keyMetric.value}</span>
                          {m.keyMetric.trend === 'improving' ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" /> Improving
                            </span>
                          ) : m.keyMetric.trend === 'needs_attention' ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" /> Monitor
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              Stable
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{m.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABDM Consent & Activity Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>ABDM Gateway Activity & Consent Audit Log</span>
        </h3>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No transaction logs recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate">{log.details}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
