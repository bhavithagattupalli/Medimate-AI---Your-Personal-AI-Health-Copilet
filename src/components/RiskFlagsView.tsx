import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  PhoneCall,
  Search,
  MessageSquare,
  RefreshCw,
  FileText,
  UserCheck,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { RiskFlagRecord, AppLanguage, AppTab } from '../types';
import { fetchRiskFlags, createRiskFlag, updateRiskFlag, deleteRiskFlag } from '../services/api';
import { useEmergencyCall } from '../hooks/useEmergencyCall';

interface RiskFlagsViewProps {
  language: AppLanguage;
  onNavigateToEmergency: () => void;
  onNavigateToDoctors: (specialty?: string) => void;
}

export const RiskFlagsView: React.FC<RiskFlagsViewProps> = ({
  language,
  onNavigateToEmergency,
  onNavigateToDoctors,
}) => {
  const { isCalling, callingNumber, callAmbulance108 } = useEmergencyCall();
  const [flags, setFlags] = useState<RiskFlagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeNoteFlagId, setActiveNoteFlagId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<RiskFlagRecord['severity']>('moderate');
  const [newCategory, setNewCategory] = useState<RiskFlagRecord['category']>('vital');
  const [newDescription, setNewDescription] = useState('');
  const [newRule, setNewRule] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newAction, setNewAction] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRiskFlags();
      setFlags(data);
    } catch (err) {
      console.error('Failed to load risk flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusTransition = async (
    id: string,
    newStatus: RiskFlagRecord['status'],
    optionalNote?: string
  ) => {
    try {
      const updated = await updateRiskFlag(id, {
        status: newStatus,
        newNote: optionalNote || `Status updated to ${newStatus}`,
        author: 'User',
      });
      setFlags((prev) => prev.map((f) => (f.id === id ? updated : f)));
    } catch (err) {
      alert('Failed to update flag status');
    }
  };

  const handleAddNote = async (id: string) => {
    if (!noteText.trim()) return;
    try {
      const updated = await updateRiskFlag(id, {
        newNote: noteText.trim(),
        author: 'User / Patient Log',
      });
      setFlags((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setNoteText('');
      setActiveNoteFlagId(null);
    } catch (err) {
      alert('Failed to append clinical note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'te' ? 'ఈ రిస్క్ ఫ్లాగ్‌ను తొలగించాలనుకుంటున్నారా?' : 'Delete this clinical risk flag?')) {
      return;
    }
    try {
      await deleteRiskFlag(id);
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete risk flag');
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await createRiskFlag({
        title: newTitle.trim(),
        severity: newSeverity,
        category: newCategory,
        description: newDescription.trim(),
        ruleTriggered: newRule.trim() || 'Manual clinical vital entry',
        evidenceText: newEvidence.trim() || 'Observed by patient / caregiver',
        actionRequired: newAction.trim() || 'Consult a certified physician for physical evaluation',
      });
      setFlags((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewRule('');
      setNewEvidence('');
      setNewAction('');
    } catch (err) {
      alert('Failed to record risk flag');
    }
  };

  const filtered = flags.filter((f) => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  const criticalCount = flags.filter((f) => f.severity === 'critical' && f.status !== 'resolved').length;
  const moderateCount = flags.filter((f) => f.severity === 'moderate' && f.status !== 'resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'వైద్యపరమైన రిస్క్ ఫ్లాగ్‌లు' : 'Clinical Risk Flags & Decision Support'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'సింప్టమ్ విశ్లేషణ మరియు ల్యాబ్ నివేదికల ఆధారంగా రూపొందించిన భద్రతా సంకేతాలు.'
              : 'Rule-traceable clinical observation flags generated from symptom triage, vital trends, and lab reports.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <button
              onClick={(e) => callAmbulance108(e)}
              disabled={isCalling}
              className={`inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition animate-pulse cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                isCalling && callingNumber === '108' ? 'ring-2 ring-white' : ''
              }`}
              title="Call 108 Emergency Ambulance"
            >
              {isCalling && callingNumber === '108' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PhoneCall className="w-3.5 h-3.5" />
              )}
              <span>
                {isCalling && callingNumber === '108'
                  ? 'Connecting 108...'
                  : language === 'te'
                  ? '108 అత్యవసరం'
                  : language === 'hi'
                  ? '108 आपातकालीन'
                  : language === 'ta'
                  ? '108 அவசர அழைப்பு'
                  : language === 'kn'
                  ? '108 ತುರ್ತು ಕರೆ'
                  : 'Call 108 Emergency'}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఫ్లాగ్ నమోదు చేయండి' : 'Log Risk Flag'}</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Severity Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-700">{criticalCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'te' ? 'తీవ్రమైన రిస్క్ (Critical)' : 'Critical Safety Flags'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{moderateCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'te' ? 'మధ్యస్థ స్థాయి (Moderate)' : 'Moderate / Follow-up'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {flags.filter((f) => f.status === 'resolved').length}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'te' ? 'పరిష్కరించబడినవి (Resolved)' : 'Resolved Flags'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500">Severity:</span>
          {['all', 'critical', 'moderate', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Flags List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-600" />
          <p className="text-xs font-medium">Loading clinical risk matrix...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Active Risk Flags</h3>
          <p className="text-xs text-slate-500 mt-1">No clinical alerts matching your active filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((flag) => {
            const isCritical = flag.severity === 'critical';
            const isModerate = flag.severity === 'moderate';

            const severityBorder = isCritical
              ? 'border-rose-300 bg-rose-50/15'
              : isModerate
              ? 'border-amber-300 bg-amber-50/15'
              : 'border-slate-200';

            return (
              <div
                key={flag.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition ${severityBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isModerate
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {flag.severity} RISK
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded uppercase">
                        {flag.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(flag.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{flag.title}</h3>
                  </div>

                  {/* Status Dropdown Transition */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="relative">
                      <select
                        value={flag.status}
                        onChange={(e) =>
                          handleStatusTransition(flag.id, e.target.value as any)
                        }
                        className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="new">Status: New</option>
                        <option value="under_review">Status: Under Review</option>
                        <option value="acknowledged">Status: Acknowledged</option>
                        <option value="resolved">Status: Resolved</option>
                        <option value="dismissed">Status: Dismissed</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => handleDelete(flag.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete flag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">{flag.description}</p>

                {/* Evidence & Traceability Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs space-y-2 mb-3">
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                      {language === 'te' ? 'ఆధారమైన వైద్య నియమం (Rule Triggered):' : 'Triggered Clinical Rule:'}
                    </span>
                    <span className="font-mono text-slate-800 text-[11px]">{flag.ruleTriggered}</span>
                  </div>

                  {flag.evidenceText && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                        {language === 'te' ? 'లక్ష్య ఆధారాలు (Evidence / Logs):' : 'Documented Evidence:'}
                      </span>
                      <span className="text-slate-600 italic">{flag.evidenceText}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-teal-800 block text-[11px] uppercase tracking-wider">
                      {language === 'te' ? 'సిఫార్సు చేసిన చర్య (Action Required):' : 'Recommended Patient Action:'}
                    </span>
                    <span className="text-slate-800 font-medium">{flag.actionRequired}</span>
                  </div>
                </div>

                {/* Clinical Notes Audit Trail */}
                {flag.notes && flag.notes.length > 0 && (
                  <div className="mb-3 pl-3 border-l-2 border-teal-500 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Audit Notes History:
                    </span>
                    {flag.notes.map((n, idx) => (
                      <div key={idx} className="text-slate-600">
                        <span className="font-semibold text-slate-800">{n.author}:</span> {n.note}{' '}
                        <span className="text-[10px] text-slate-400">
                          ({new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {activeNoteFlagId === flag.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Type clinical note..."
                          className="px-2.5 py-1 text-xs border border-teal-400 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddNote(flag.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setActiveNoteFlagId(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveNoteFlagId(flag.id);
                          setNoteText('');
                        }}
                        className="text-xs text-slate-600 hover:text-teal-700 flex items-center gap-1 font-medium transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Add Clinician/Self Note</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCritical && (
                      <button
                        onClick={onNavigateToEmergency}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Emergency 112</span>
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateToDoctors('General Physician')}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Consult Specialist</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Risk Flag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {language === 'te' ? 'రిస్క్ ఫ్లాగ్ నమోదు చేయండి' : 'Log Clinical Risk Observation'}
            </h3>
            <form onSubmit={handleCreateFlag} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Persistent Cough with Blood-tinged Sputum"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="critical">Critical (Red)</option>
                    <option value="moderate">Moderate (Amber)</option>
                    <option value="low">Low (Blue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="symptom">Symptom</option>
                    <option value="vital">Vital Sign</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe clinical context..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Triggered Rule</label>
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="e.g. Hemoptysis guideline check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Required</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Chest X-ray and Pulmonologist review"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
                >
                  Save Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
