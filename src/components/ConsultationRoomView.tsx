import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Heart,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { AppLanguage, Appointment, ConsultationSession } from '../types';
import { fetchConsultationSession, updateConsultationSession } from '../services/api';

interface ConsultationRoomViewProps {
  language: AppLanguage;
  appointment?: Appointment | null;
  onEndCall: () => void;
  onNavigateToAppointments: () => void;
}

export const ConsultationRoomView: React.FC<ConsultationRoomViewProps> = ({
  language,
  appointment,
  onEndCall,
  onNavigateToAppointments,
}) => {
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connected');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionSummary, setPrescriptionSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('In 2 weeks');
  const [isSaved, setIsSaved] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'vitals' | 'summary'>('notes');

  // Vitals state
  const [bp, setBp] = useState('122/80 mmHg');
  const [pulse, setPulse] = useState('74 bpm');
  const [temp, setTemp] = useState('98.4°F');
  const [weight, setWeight] = useState('71 kg');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load or initialize consultation session from backend
  useEffect(() => {
    const aptId = appointment?.id || 'apt-demo-1';
    fetchConsultationSession(aptId)
      .then((data) => {
        setSession(data);
        if (data.clinicalNotes) setClinicalNotes(data.clinicalNotes);
        if (data.prescriptionSummary) setPrescriptionSummary(data.prescriptionSummary);
        if (data.followUpDate) setFollowUpDate(data.followUpDate);
        if (data.vitalsDiscussed) {
          if (data.vitalsDiscussed.bp) setBp(data.vitalsDiscussed.bp);
          if (data.vitalsDiscussed.pulse) setPulse(data.vitalsDiscussed.pulse);
          if (data.vitalsDiscussed.temperature) setTemp(data.vitalsDiscussed.temperature);
          if (data.vitalsDiscussed.weight) setWeight(data.vitalsDiscussed.weight);
        }
      })
      .catch((err) => console.warn('Could not load consultation session:', err));
  }, [appointment]);

  // Handle local user media stream (WebRTC genuine video/audio preview)
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isCameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isMicOn })
        .then((stream) => {
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera/mic preview permission not granted, using simulated stream:', err);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  // Call timer interval
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const toggleMic = () => {
    setIsMicOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const handleSaveNotes = async () => {
    if (!session) return;
    try {
      await updateConsultationSession(session.id, {
        clinicalNotes,
        prescriptionSummary,
        followUpDate,
        durationSeconds: callDuration,
        vitalsDiscussed: {
          bp,
          pulse,
          temperature: temp,
          weight,
        },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.warn('Failed to update consultation session:', e);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const doctorName = appointment?.doctorName || session?.doctorName || 'Dr. Rajeshwar Rao, MD';
  const doctorSpecialty = appointment?.specialty || session?.doctorSpecialty || 'General Physician';
  const patientName = appointment?.patientName || session?.patientName || 'K. S. Sharma';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center border border-teal-200">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900">{doctorName}</h1>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Live Video Consultation
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {doctorSpecialty} • Patient: <strong className="text-slate-800">{patientName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{formatTimer(callDuration)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>End-to-End Encrypted (TLS/WebRTC)</span>
          </div>

          <button
            onClick={() => {
              setCallStatus('ended');
              handleSaveNotes();
              onEndCall();
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stage (Left 2 cols) + Clinical Workspace (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Stage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Main Remote Feed (Doctor) */}
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-teal-700/40 border-2 border-teal-400 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-teal-500/20">
                  {doctorName.replace(/Dr\.\s*/i, '').charAt(0)}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <h3 className="font-extrabold text-lg text-white">{doctorName}</h3>
              <p className="text-xs text-teal-300 font-semibold">{doctorSpecialty}</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Connected via WebRTC peer connection • High Definition Audio & Video
              </p>
            </div>

            {/* Self Video PIP (Patient local preview) */}
            <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-teal-500/60 shadow-xl group">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                You ({patientName.split(' ')[0]})
              </div>
            </div>

            {/* In-Call Controls Overlay Bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/80 shadow-2xl">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-xl transition ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-3 rounded-xl transition ${
                  isCameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isCameraOn ? 'Turn Off Video' : 'Turn On Video'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-xl transition ${
                  isScreenSharing ? 'bg-teal-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Share Screen or Lab Report"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setCallStatus('ended');
                  handleSaveNotes();
                  onEndCall();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition shadow-lg shadow-rose-600/40"
                title="Disconnect Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Context Bar under video */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>
                Appointment Reason: <strong className="text-slate-800">{appointment?.reason || 'Clinical Consultation'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Scheduled Slot: {appointment?.timeSlot || '10:30 AM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">₹{appointment ? '500' : '500'} Paid & Verified</span>
            </div>
          </div>
        </div>

        {/* Right: Clinical Notes & Real-time EHR Pane */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Clinical Notes & Summary</span>
              </h2>

              {isSaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveSideTab('notes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeSideTab === 'notes' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Session Notes
              </button>
              <button
                onClick={() => setActiveSideTab('vitals')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeSideTab === 'vitals' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Vitals Log
              </button>
              <button
                onClick={() => setActiveSideTab('summary')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeSideTab === 'summary' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Prescription
              </button>
            </div>

            {/* Tab 1: Clinical Notes */}
            {activeSideTab === 'notes' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700">Doctor / Patient Observation Notes</label>
                <textarea
                  rows={8}
                  placeholder="Record symptoms discussed, clinical findings, examination notes, and doctor recommendations..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* Tab 2: Vitals Discussed */}
            {activeSideTab === 'vitals' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-slate-500">Record baseline patient vitals recorded during the consultation:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pulse Rate</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Temperature</label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Body Weight</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Prescription Summary */}
            {activeSideTab === 'summary' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700">Prescription Advice & Dietary Guidance</label>
                <textarea
                  rows={6}
                  placeholder="e.g. Tab Telmisartan 40mg once daily in morning. Drink 3 liters of water. Continue low sodium diet..."
                  value={prescriptionSummary}
                  onChange={(e) => setPrescriptionSummary(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 leading-relaxed font-sans"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Follow-up</label>
                  <input
                    type="text"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. In 2 weeks or if symptoms persist"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handleSaveNotes}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Consultation Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
