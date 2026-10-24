import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Trash2,
  AlertCircle,
  UserCheck,
  ArrowRight,
  Pill,
  Droplets,
  Activity,
  Plus,
  RefreshCw,
  BellRing,
} from 'lucide-react';
import { Appointment, ReminderRecord, AppLanguage } from '../types';
import { fetchReminders, addReminder, updateReminder, deleteReminder } from '../services/api';

interface AppointmentsViewProps {
  appointments: Appointment[];
  language: AppLanguage;
  onCancelAppointment: (id: string) => void;
  onNavigateToDoctors: () => void;
  onStartConsultation?: (appointment: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  language,
  onCancelAppointment,
  onNavigateToDoctors,
  onStartConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'reminders'>('appointments');
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // New reminder form state
  const [remTitle, setRemTitle] = useState('');
  const [remType, setRemType] = useState<ReminderRecord['type']>('medication');
  const [remTime, setRemTime] = useState('09:00 AM');
  const [remDosage, setRemDosage] = useState('');
  const [remDays, setRemDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const loadReminders = async () => {
    try {
      setLoadingReminders(true);
      const data = await fetchReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoadingReminders(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleToggleTaken = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await updateReminder(id, { completedToday: !currentStatus });
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert('Failed to update reminder adherence');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm(language === 'te' ? 'ఈ రిమైండర్‌ను తొలగించాలనుకుంటున్నారా?' : 'Delete this reminder schedule?')) {
      return;
    }
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete reminder');
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim() || !remTime.trim()) return;
    try {
      const created = await addReminder({
        title: remTitle.trim(),
        type: remType,
        time: remTime.trim(),
        dosageOrDetail: remDosage.trim(),
        daysOfWeek: remDays,
        active: true,
      });
      setReminders((prev) => [...prev, created]);
      setShowAddReminderModal(false);
      setRemTitle('');
      setRemDosage('');
    } catch (err) {
      alert('Failed to add reminder');
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'vitals':
        return <Activity className="w-4 h-4 text-rose-600" />;
      default:
        return <BellRing className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {language === 'te' ? 'అపాయింట్‌మెంట్‌లు & మందుల రిమైండర్లు' : 'Appointments & Medication Reminders'}
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'te'
              ? 'షెడ్యూల్ చేసిన డాక్టర్ సంప్రదింపులు మరియు రోజువారీ ఔషధాల రిమైండర్ల నిర్వహణ.'
              : 'Track confirmed clinical consultations and stay adherent to daily medication schedules.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'appointments' ? (
            <button
              onClick={onNavigateToDoctors}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === 'te' ? 'కొత్త డాక్టర్‌ని బుక్ చేయండి' : 'Book New Doctor'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'te' ? 'కొత్త రిమైండర్ చేర్చండి' : 'Add Medication Reminder'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'appointments'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Clinical Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'reminders'
              ? 'bg-teal-50 text-teal-700 border border-teal-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medication & Health Reminders ({reminders.length})</span>
        </button>
      </div>

      {/* TAB 1: Clinical Appointments */}
      {activeTab === 'appointments' && (
        <>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-slate-800 text-sm">No Appointments Scheduled Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Consult the AI Copilot for symptom triage or browse our verified doctors directory to schedule a consultation.
              </p>
              <button
                onClick={onNavigateToDoctors}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Browse Doctors
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-indigo-100">
                        {apt.specialty}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{apt.id.slice(-6).toUpperCase()}</span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{apt.doctorName}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {apt.type === 'video' ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Teleconsult (Video Call)</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hospital / In-Clinic Visit</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 pt-1">
                      <span>
                        Patient: <b className="text-slate-700">{apt.patientName}</b> ({apt.patientPhone})
                      </span>
                      {apt.reason && <span className="block mt-0.5 text-slate-400 italic">" {apt.reason} "</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    {onStartConsultation && (
                      <button
                        onClick={() => onStartConsultation(apt)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </button>
                    )}
                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-semibold flex items-center gap-1"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden">Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Medication & Health Reminders */}
      {activeTab === 'reminders' && (
        <>
          {loadingReminders ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
              <p className="text-xs font-medium">Loading reminder schedules...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
              <Pill className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-slate-800 text-sm">No Medication Reminders Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Set daily alarms for your prescribed medicines, BP checks, or hydration routines.
              </p>
              <button
                onClick={() => setShowAddReminderModal(true)}
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Create Reminder
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => {
                const isDone = rem.completedToday;

                return (
                  <div
                    key={rem.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDone ? 'border-emerald-200 bg-emerald-50/15' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {getReminderIcon(rem.type)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{rem.title}</h4>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {rem.type}
                          </span>
                        </div>

                        {rem.dosageOrDetail && (
                          <p className="text-xs text-slate-600 mt-0.5">{rem.dosageOrDetail}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            {rem.time}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {rem.daysOfWeek.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleToggleTaken(rem.id, isDone)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Taken Today' : 'Mark Taken'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {language === 'te' ? 'కొత్త మందుల రిమైండర్ చేర్చండి' : 'Create Medication / Health Reminder'}
            </h3>
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="e.g. Telmisartan 40mg or Blood Pressure Check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={remType}
                    onChange={(e) => setRemType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="medication">Medication</option>
                    <option value="vitals">Vital Check (BP/Sugar)</option>
                    <option value="hydration">Hydration</option>
                    <option value="activity">Physical Exercise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage or Instructions</label>
                <input
                  type="text"
                  value={remDosage}
                  onChange={(e) => setRemDosage(e.target.value)}
                  placeholder="e.g. 1 tablet post breakfast with warm water"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
