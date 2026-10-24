import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Lock,
  Phone,
  Heart,
  Globe,
  Bell,
  Mic,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  KeyRound,
  ShieldCheck,
  LogOut,
  LogIn,
  BadgeCheck,
} from 'lucide-react';
import { UserProfile, AppLanguage } from '../types';
import { fetchUserProfile, updateUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface ProfileSettingsViewProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  language,
  onLanguageChange,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'K. S. Sharma',
    age: 48,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98480 12345',
    emergencyContactName: 'Lakshmi Sharma (Spouse)',
    emergencyContactPhone: '+91 98480 67890',
    languagePreference: language,
    consentAiAnalysis: true,
    consentVoiceStorage: true,
    consentAbhaSharing: true,
    consentNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await updateUserProfile(profile);
      setProfile(updated);
      onLanguageChange(updated.languagePreference);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <User className="w-4 h-4 text-teal-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'ప్రొఫైల్, ప్రైవసీ & సమ్మతి సెట్టింగ్‌లు' : 'Profile, Privacy & Consent Center'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'వ్యక్తిగత ఆరోగ్య ప్రొఫైల్, ఎమర్జెన్సీ పరిచయాలు మరియు డేటా సమ్మతి నియంత్రణ.'
              : 'Manage clinical demographics, emergency contact ICE, and granular consent permissions.'}
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
          <p className="text-xs font-medium">Loading user preferences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 0: Account Identity & Security */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-base text-white">
                    {isAuthenticated ? 'Authenticated Session & Security' : 'Session & Account Access'}
                  </h3>
                </div>
                {isAuthenticated && user ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="font-semibold text-slate-200">{user.fullName}</span>
                    <span className="text-slate-400">({user.email})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {user.role}
                    </span>
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Email Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                        <AlertCircle className="w-3 h-3" /> Unverified Email
                      </span>
                    )}
                    {user.phoneNumber && (
                      <span className="text-slate-400 text-[11px]">{user.phoneNumber}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 pt-1">
                    Operating in Local Demo Mode. Sign in or register to protect your health records with end-to-end encrypted sessions and patient isolation.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700/80 hover:bg-slate-700 text-teal-200 border border-teal-500/30 transition shadow-xs"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                    >
                      <span>Create Account</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Clinical Demographic Profile */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>{language === 'te' ? 'వ్యక్తిగత ఆరోగ్య ప్రొఫైల్' : 'Patient Demographics'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: In Case of Emergency (ICE) Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" />
              <span>{language === 'te' ? 'అత్యవసర సంప్రదింపు వ్యక్తి (ICE Contact)' : 'Emergency ICE Contact'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatched automatically during acute medical alerts or when initiating the Emergency Protocol.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name & Relation</label>
                <input
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  placeholder="e.g. Lakshmi Sharma (Spouse)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone Number</label>
                <input
                  type="tel"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  placeholder="+91 98480 67890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Language Preference */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>{language === 'te' ? 'భాషా ప్రాధాన్యత' : 'Language & Localization'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { code: 'en', label: 'English (Indian English)' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
                { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              ].map((lang) => (
                <label key={lang.code} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="radio"
                    name="languagePreference"
                    checked={profile.languagePreference === lang.code}
                    onChange={() => setProfile({ ...profile, languagePreference: lang.code as AppLanguage })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Granular Consent Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{language === 'te' ? 'డేటా గోప్యత & సమ్మతి నియంత్రణలు' : 'Granular Consent Management'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              You maintain complete authority to grant or revoke specific processing rights at any moment.
            </p>

            <div className="space-y-3">
              <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    AI Clinical Decision Support & Symptom Triage
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allows Gemini & Smart Clinical Triage engine to process health symptoms for educational guidance.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentAiAnalysis}
                  onChange={(e) => setProfile({ ...profile, consentAiAnalysis: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Voice Dictation & Consented Audio Retention
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Enables Web Speech transcribing and local storage of symptom dictations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentVoiceStorage}
                  onChange={(e) => setProfile({ ...profile, consentVoiceStorage: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    ABHA Care Context Sharing (ABDM Sandbox)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Permits simulated consent artifact creation for verified healthcare providers in the ABDM sandbox.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentAbhaSharing}
                  onChange={(e) => setProfile({ ...profile, consentAbhaSharing: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Proactive Medication & Hydration Notifications
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allows browser push alerts for scheduled drug dosages and clinical risk alarms.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentNotifications}
                  onChange={(e) => setProfile({ ...profile, consentNotifications: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded mt-0.5"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Consent Settings'}</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
