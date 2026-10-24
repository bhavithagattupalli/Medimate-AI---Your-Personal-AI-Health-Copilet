import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Mic,
  Calendar,
  Heart,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AppLanguage, AppTab } from '../types';
import { fetchConversations, fetchVoiceRecords, fetchReminders, resetUserAccount } from '../services/api';

interface HealthRecordsViewProps {
  language: AppLanguage;
  onNavigateTab: (tab: AppTab) => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  language,
  onNavigateTab,
}) => {
  const [stats, setStats] = useState({
    conversationsCount: 0,
    voiceNotesCount: 0,
    remindersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [convs, voice, rems] = await Promise.all([
        fetchConversations(),
        fetchVoiceRecords(),
        fetchReminders(),
      ]);
      setStats({
        conversationsCount: convs.length,
        voiceNotesCount: voice.length,
        remindersCount: rems.length,
      });
    } catch (err) {
      console.error('Failed to load records summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportData = () => {
    window.location.href = '/api/user/export-all';
  };

  const handleResetAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      alert(language === 'te' ? 'దయచేసి నిర్ధారణ కోసం RESET అని టైప్ చేయండి.' : 'Please type RESET to confirm account data wipe.');
      return;
    }
    try {
      setIsResetting(true);
      await resetUserAccount();
      setShowResetModal(false);
      setConfirmInput('');
      await loadData();
      alert(language === 'te' ? 'డేటా అంతా రీసెట్ చేయబడింది.' : 'All local account data has been safely reset.');
    } catch (err) {
      alert('Failed to reset account data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <FolderLock className="w-4 h-4 text-teal-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'ఆరోగ్య రికార్డులు & నా డేటా' : 'Health Records & My Data Vault'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'మీ వ్యక్తిగత ఆరోగ్య సమాచారం, ఎగుమతి (Export) మరియు ప్రైవసీ నిర్వహణ.'
              : 'Complete sovereignty over your clinical consultations, audio recordings, reminders, and data export.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'te' ? 'డేటా డౌన్‌లోడ్ (JSON)' : 'Export My Data (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Privacy & Security Guarantee Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm">
            {language === 'te' ? '100% వినియోగదారు నియంత్రణ & గోప్యత' : 'Zero-Telemetry Data Sovereignty'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {language === 'te'
              ? 'మీ ఆరోగ్య వివరాలు మీ స్వంత నియంత్రణలో ఉంటాయి. మీరు ఎప్పుడైనా మీ పూర్తి డేటాను JSON రూపంలో డౌన్‌లోడ్ చేసుకోవచ్చు లేదా శాశ్వతంగా తొలగించవచ్చు.'
              : 'Your clinical consults, triage histories, and consented voice notes are strictly stored on your instance. No behavioral tracking or third-party ads. You can export or erase your data at any time.'}
          </p>
        </div>
      </div>

      {/* Storage Categories Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => onNavigateTab('chat_history')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-2xl font-bold text-slate-900">{stats.conversationsCount}</span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-teal-700 transition">
            {language === 'te' ? 'AI ఆరోగ్య సంభాషణలు' : 'Triage Consultations'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Saved clinical triage sessions</p>
        </div>

        <div
          onClick={() => onNavigateTab('voice')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-2xl font-bold text-slate-900">{stats.voiceNotesCount}</span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition">
            {language === 'te' ? 'వాయిస్ నోట్స్' : 'Voice Transcripts'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Dictated symptom transcripts</p>
        </div>

        <div
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-2xl font-bold text-slate-900">{stats.remindersCount}</span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-amber-700 transition">
            {language === 'te' ? 'రిమైండర్లు & అపాయింట్‌మెంట్‌లు' : 'Active Reminders'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Medication and checkup schedules</p>
        </div>
      </div>

      {/* Danger Zone: Account Reset / Data Erasure */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-rose-900 text-base">
              {language === 'te' ? 'డేటా తొలగింపు & ఖాతా రీసెట్ (Danger Zone)' : 'Erase All Health Data & Reset'}
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              {language === 'te'
                ? 'ఈ చర్య మీ అన్ని సంభాషణలు, వాయిస్ రికార్డులు మరియు రిమైండర్‌లను డేటాబేస్ నుండి శాశ్వతంగా తొలగిస్తుంది.'
                : 'Permanently wipes all conversations, voice transcripts, lab records, and reminders from the database. This action is irreversible.'}
            </p>

            <button
              onClick={() => setShowResetModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ఖాతా డేటాను రీసెట్ చేయండి' : 'Reset My Account Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-step Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              {language === 'te' ? 'ఖాతా రీసెట్‌ను నిర్ధారించండి' : 'Confirm Account Wipe'}
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              {language === 'te'
                ? 'శాశ్వతంగా తొలగించడానికి క్రింద పెట్టెలో RESET అని టైప్ చేయండి.'
                : 'To confirm permanent erasure of all records, please type RESET in the box below.'}
            </p>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="RESET"
              className="w-full text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wider mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmInput('');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAccount}
                disabled={confirmInput.trim().toUpperCase() !== 'RESET' || isResetting}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition"
              >
                {isResetting ? 'Resetting...' : 'Erase All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
