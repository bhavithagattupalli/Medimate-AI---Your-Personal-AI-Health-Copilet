import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  FileText,
  MapPin,
  MessageSquare,
  PhoneCall,
  UserCheck,
  Calendar,
  Globe,
  ArrowRight,
  ShieldAlert,
  Bell,
  Heart,
  CreditCard,
  FolderLock,
  Mic,
  Settings,
  ChevronDown,
  Menu,
  X,
  Video,
  Stethoscope,
  BadgeCheck,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { AppLanguage, AppTab } from '../types';
import { fetchNotifications } from '../services/api';
import { useEmergencyCall } from '../hooks/useEmergencyCall';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: AppLanguage;
  onToggleLanguage: (lang: AppLanguage) => void;
  onOpenEmergencyModal: () => void;
  activeSpecialtyHint?: string | null;
  hasAnalyzedReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  onOpenEmergencyModal,
  activeSpecialtyHint,
  hasAnalyzedReport,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const {
    isCalling,
    callingNumber,
    permissionNotice,
    clearPermissionNotice,
    callAmbulance108,
    callEmergency112,
  } = useEmergencyCall();

  useEffect(() => {
    const checkNotifs = async () => {
      try {
        const data = await fetchNotifications();
        setUnreadNotifs(data.unreadCount);
      } catch (e) {
        // quiet ignore
      }
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (tab: AppTab) => {
    onSelectTab(tab);
    setIsMoreMenuOpen(false);
    setIsMobileDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300 animate-pulse shrink-0" />
          <span className="truncate">
            {language === 'te'
              ? 'తీవ్రమైన ఛాతీ నొప్పి, పక్షవాతం లేదా శ్వాస ఇబ్బంది ఉన్నట్లయితే — తక్షణమే 108 కి కాల్ చేయండి'
              : language === 'hi'
              ? 'गंभीर आपातकाल (सीने में दर्द, सांस की तकलीफ, स्ट्रोक)? तुरंत 108 (एम्बुलेंस) या 112 डायल करें'
              : language === 'ta'
              ? 'அவசர மருத்துவ உதவி (மார்பு வலி, பக்கவாதம்)? உடனே 108 அல்லது 112 அழைக்கவும்'
              : language === 'kn'
              ? 'ತುರ್ತು ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿ (ಎದೆ ನೋವು, ಪಾರ್ಶ್ವವಾಯು)? ತಕ್ಷಣ 108 ಅಥವಾ 112 ಗೆ ಕರೆ ಮಾಡಿ'
              : 'Medical Emergency (Chest Pain, Stroke, Severe Breathlessness)? Call 108 (India Ambulance) or 112'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => callAmbulance108(e)}
            disabled={isCalling}
            className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3 py-1 rounded-full text-[11px] font-black shadow-md shadow-rose-900/50 transition transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed ${
              isCalling && callingNumber === '108' ? 'ring-2 ring-white animate-pulse' : ''
            }`}
            title="Dial 108 - Free Emergency Ambulance & Medical Service (India)"
          >
            {isCalling && callingNumber === '108' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <PhoneCall className="w-3 h-3 animate-bounce" />
            )}
            <span>{isCalling && callingNumber === '108' ? 'Connecting 108...' : 'Call 108'}</span>
          </button>
          <button
            onClick={(e) => callEmergency112(e)}
            disabled={isCalling}
            className="hidden md:inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-rose-200 px-2 py-0.5 rounded-full text-[11px] font-medium transition disabled:opacity-50"
            title="Unified National Emergency Helpline"
          >
            <span>{isCalling && callingNumber === '112' ? 'Calling 112...' : '112'}</span>
          </button>
          <button
            onClick={onOpenEmergencyModal}
            className="hidden sm:inline-flex items-center gap-1.5 bg-rose-800/80 hover:bg-rose-700 text-rose-100 px-2.5 py-1 rounded-full text-[11px] font-semibold transition"
          >
            Protocol Info
          </button>
        </div>
      </div>

      {/* Permission Notice Banner (if direct calling permission was restricted) */}
      {permissionNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{permissionNotice}</span>
          </div>
          <button
            onClick={clearPermissionNotice}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MediMate</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                  AI Healthcare
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">Connected Clinical Platform</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => handleNavClick('copilot')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 relative ${
                currentTab === 'copilot'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
              {activeSpecialtyHint && (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping absolute top-1.5 right-1" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('wellness')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'wellness'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Wellness</span>
            </button>

            <button
              onClick={() => handleNavClick('risk_flags')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'risk_flags'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Risk Flags</span>
            </button>

            <button
              onClick={() => handleNavClick('appointments')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'appointments'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => handleNavClick('abha')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'abha'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>ABHA / ABDM</span>
            </button>

            {/* "More Sections" Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-fadeIn">
                  <button
                    onClick={() => handleNavClick('chat_history')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Chat History</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('voice')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Voice Assistant Hub</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('report')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lab Report Analyzer</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('nearby')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nearby Care Map</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('doctors')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Doctor Directory</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('consultation')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-teal-50 text-teal-800 flex items-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5 text-teal-600" />
                    <span>Online Consultation Room</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('doctor_portal')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 text-emerald-800 flex items-center gap-2"
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Doctor Verification Portal</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('records')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <FolderLock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Health Records & My Data</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleNavClick('settings')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                    <span>Profile & Privacy Settings</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions: Notifications Bell, 5-Language Switcher, Emergency */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => handleNavClick('notifications')}
              className={`p-2 rounded-xl border border-slate-200 transition relative ${
                currentTab === 'notifications'
                  ? 'bg-teal-50 text-teal-700 border-teal-300'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* 5-Language Switcher */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onToggleLanguage(e.target.value as AppLanguage)}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                title="Select Platform Language"
              >
                <option value="en">English (EN)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {/* Desktop Auth Controls */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleNavClick('settings')}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition text-left group"
                  title="Profile & Privacy Settings"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user.fullName}
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                      user.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : user.role === 'doctor'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'doctor' ? 'Verified Doctor' : 'Patient'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                  title="Sign Out of MediMate AI"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Full 14 Sections + Auth Controls) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-lg animate-fadeIn max-h-[80vh] overflow-y-auto">
          {/* Mobile Auth Banner */}
          <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                    <div className="text-[10px] text-teal-600 font-semibold">{user.role.toUpperCase()}</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openAuthModal('signin');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    openAuthModal('register');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
          {[
            { id: 'dashboard', label: '1. Dashboard Overview', icon: Activity },
            { id: 'copilot', label: '2. AI Health Copilot', icon: MessageSquare },
            { id: 'chat_history', label: '3. Consultation History', icon: MessageSquare },
            { id: 'voice', label: '4. Voice Assistant & Dictation', icon: Mic },
            { id: 'wellness', label: '5. Wellness Recommendations', icon: Heart },
            { id: 'notifications', label: `6. Notifications Center (${unreadNotifs})`, icon: Bell },
            { id: 'risk_flags', label: '7. Clinical Risk Flags', icon: AlertTriangle },
            { id: 'records', label: '8. Health Records & Timeline', icon: FolderLock },
            { id: 'abha', label: '9. ABHA / ABDM Integration', icon: CreditCard },
            { id: 'appointments', label: '10. Appointments & Reminders', icon: Calendar },
            { id: 'consultation', label: 'Online Consultation Room', icon: Video },
            { id: 'doctor_portal', label: 'Doctor Verification Portal', icon: BadgeCheck },
            { id: 'emergency', label: '11. Emergency Protocol — Call 108 / 112', icon: PhoneCall },
            { id: 'settings', label: '12. Profile, Privacy & Settings', icon: Settings },
            { id: 'report', label: 'Lab Report Analyzer', icon: FileText },
            { id: 'nearby', label: 'Nearby Care Facilities', icon: MapPin },
            { id: 'doctors', label: 'Verified Doctor Directory', icon: UserCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'emergency') {
                    onOpenEmergencyModal();
                    setIsMobileDrawerOpen(false);
                  } else {
                    handleNavClick(item.id as AppTab);
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                  currentTab === item.id
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-teal-600" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Connected Patient Journey Status Banner */}
      {(activeSpecialtyHint || hasAnalyzedReport) && (
        <div className="bg-teal-50 border-t border-teal-100 py-1.5 px-4 text-xs text-teal-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-medium">
                {activeSpecialtyHint
                  ? `Recommended Specialty: ${activeSpecialtyHint}`
                  : 'Report uploaded & analyzed in current session'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {activeSpecialtyHint && currentTab !== 'nearby' && (
                <button
                  onClick={() => onSelectTab('nearby')}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 underline underline-offset-2"
                >
                  Locate {activeSpecialtyHint} Clinics <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {hasAnalyzedReport && currentTab !== 'copilot' && (
                <button
                  onClick={() => onSelectTab('copilot')}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 underline underline-offset-2"
                >
                  Discuss Report with AI Copilot <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation bottom quick bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1 text-[11px] font-medium text-slate-600">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'dashboard' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Activity className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => handleNavClick('copilot')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'copilot' ? 'text-teal-600 font-bold' : ''}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Copilot</span>
        </button>
        <button
          onClick={() => handleNavClick('wellness')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'wellness' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Heart className="w-4 h-4" />
          <span>Wellness</span>
        </button>
        <button
          onClick={() => handleNavClick('risk_flags')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'risk_flags' ? 'text-teal-600 font-bold' : ''}`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Flags</span>
        </button>
        <button
          onClick={() => handleNavClick('abha')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'abha' ? 'text-teal-600 font-bold' : ''}`}
        >
          <CreditCard className="w-4 h-4 text-indigo-500" />
          <span>ABHA</span>
        </button>
      </div>
    </header>
  );
};
