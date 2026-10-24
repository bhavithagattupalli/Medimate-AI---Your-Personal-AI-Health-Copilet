import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Send,
  Edit3,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { VoiceRecord, AppLanguage } from '../types';
import { fetchVoiceRecords, saveVoiceRecord, deleteVoiceRecord } from '../services/api';

interface VoiceHistoryViewProps {
  language: AppLanguage;
  onSendTranscriptToCopilot: (transcript: string) => void;
}

export const VoiceHistoryView: React.FC<VoiceHistoryViewProps> = ({
  language,
  onSendTranscriptToCopilot,
}) => {
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [voiceConsent, setVoiceConsent] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchVoiceRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load voice records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startVoiceDictation = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(
        language === 'te'
          ? 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి Chrome లేదా Edge ఉపయోగించండి.'
          : 'Web Speech Recognition is not supported by your browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setLiveTranscript('');
        timerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        for (let i = 0; i < event.results.length; i++) {
          finalStr += event.results[i][0].transcript + ' ';
        }
        setLiveTranscript(finalStr.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e);
        stopVoiceDictation();
      };

      recognition.onend = () => {
        stopVoiceDictation();
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopVoiceDictation = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSaveLiveTranscript = async () => {
    if (!liveTranscript.trim()) return;
    try {
      const newRec = await saveVoiceRecord({
        transcript: liveTranscript.trim(),
        durationSeconds: Math.max(recordingSeconds, 1),
        language,
        hasAudioStorage: voiceConsent,
      });
      setRecords((prev) => [newRec, ...prev]);
      setLiveTranscript('');
      setRecordingSeconds(0);
    } catch (err) {
      alert('Failed to save voice record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'te' ? 'ఈ వాయిస్ రికార్డ్‌ను తొలగించాలనుకుంటున్నారా?' : 'Delete this voice record?')) {
      return;
    }
    try {
      await deleteVoiceRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete voice record');
    }
  };

  const handlePlayVoice = (id: string, text: string) => {
    if (currentlyPlayingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlyPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setCurrentlyPlayingId(null);
    utterance.onerror = () => setCurrentlyPlayingId(null);

    setCurrentlyPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const startEdit = (rec: VoiceRecord) => {
    setEditingId(rec.id);
    setEditedTranscript(rec.transcript);
  };

  const handleSaveEdit = (id: string) => {
    if (!editedTranscript.trim()) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, transcript: editedTranscript.trim() } : r))
    );
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'te' ? 'వాయిస్ అసిస్టెంట్ & రికార్డుల చరిత్ర' : 'Voice Assistant & Dictation Hub'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'te'
              ? 'మీ లక్షణాలను మాట్లాడండి, ట్రాన్స్‌క్రిప్ట్‌లను సమీక్షించండి మరియు AI కోపైలట్‌కు పంపండి.'
              : 'Record hands-free symptom dictations, review transcripts, play back audio, and dispatch directly to AI Copilot.'}
          </p>
        </div>

        {/* Consent Badge */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'te' ? 'వాయిస్ ప్రైవసీ రక్షణ క్రియాశీలంగా ఉంది' : 'Voice Storage Consent: Active'}
          </span>
        </div>
      </div>

      {/* Real-time Voice Dictation Station */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <span className="inline-block bg-teal-700/60 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
              {language === 'te' ? 'లైవ్ స్పీచ్ రికార్డర్' : 'Interactive Voice Scratchpad'}
            </span>
            <h2 className="text-lg font-bold">
              {isRecording
                ? language === 'te'
                  ? 'మీ స్వరాన్ని రికార్డ్ చేస్తోంది... వింటున్నాం'
                  : 'Listening to your clinical symptoms...'
                : language === 'te'
                ? 'లక్షణాలను రికార్డ్ చేయడానికి మైక్రోఫోన్ నొక్కండి'
                : 'Tap to dictate symptoms hands-free'}
            </h2>
            <p className="text-xs text-teal-200/80 mt-1">
              {language === 'te'
                ? 'మీరు మాట్లాడే ప్రతి పదం స్వయంచాలకంగా టెక్స్ట్‌గా మారుతుంది. పంపే ముందు సరిచూసుకోవచ్చు.'
                : 'Real-time Web Speech recognition. Transcripts can be edited before submitting to triage.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{recordingSeconds}s elapsed</span>
                </div>
                <button
                  onClick={stopVoiceDictation}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/40"
                >
                  <MicOff className="w-4 h-4" />
                  {language === 'te' ? 'ఆపండి' : 'Stop Recording'}
                </button>
              </div>
            ) : (
              <button
                onClick={startVoiceDictation}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-950/40 hover:scale-105 active:scale-95"
              >
                <Mic className="w-4 h-4" />
                {language === 'te' ? 'మాట్లాడటం ప్రారంభించండి' : 'Start Voice Dictation'}
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript Display Box */}
        {(liveTranscript || isRecording) && (
          <div className="mt-5 pt-4 border-t border-teal-700/50 bg-teal-950/40 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-teal-300 mb-2">
              <span className="font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {language === 'te' ? 'గుర్తించబడిన వచనం (ట్రాన్స్‌క్రిప్ట్):' : 'Recognized Live Transcript:'}
              </span>
              <span className="text-[11px] opacity-75">{liveTranscript.length} characters</span>
            </div>
            <textarea
              value={liveTranscript}
              onChange={(e) => setLiveTranscript(e.target.value)}
              placeholder="Your spoken words will appear here in real-time..."
              rows={3}
              className="w-full bg-transparent text-sm text-white placeholder-teal-400/50 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-teal-800/40">
              <button
                onClick={() => setLiveTranscript('')}
                className="text-xs text-teal-300 hover:text-white px-2.5 py-1 rounded transition"
              >
                Clear
              </button>
              <button
                onClick={handleSaveLiveTranscript}
                className="bg-teal-600/80 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Save to Voice History
              </button>
              <button
                onClick={() => {
                  handleSaveLiveTranscript();
                  onSendTranscriptToCopilot(liveTranscript);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {language === 'te' ? 'AI కోపైలట్‌కు పంపండి' : 'Send to AI Copilot'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Voice Transcripts List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          {language === 'te' ? 'సేవ్ చేసిన వాయిస్ రికార్డులు' : 'Consented Voice Transcripts & Logs'}
        </h2>
        <button
          onClick={loadData}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
          <p className="text-xs font-medium">Loading voice logs...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm mb-1">
            {language === 'te' ? 'వాయిస్ రికార్డులు ఏవీ లేవు' : 'No Voice Transcripts Logged'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'te'
              ? 'పైనున్న మైక్రోఫోన్ బటన్‌ను నొక్కి మీ లక్షణాలను మాట్లాడితే ఇక్కడ సేవ్ అవుతాయి.'
              : 'Use the voice scratchpad above to speak your symptoms and save structured transcripts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayVoice(rec.id, rec.transcript)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                      currentlyPlayingId === rec.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                    title={currentlyPlayingId === rec.id ? 'Stop playback' : 'Play text-to-speech audio'}
                  >
                    {currentlyPlayingId === rec.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'te' ? 'లక్షణాల వాయిస్ నోట్' : 'Symptom Voice Note'}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {rec.durationSeconds}s
                      </span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium uppercase">
                        {rec.language}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(rec.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => onSendTranscriptToCopilot(rec.transcript)}
                    className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                    title="Send to Copilot"
                  >
                    <Send className="w-3 h-3" />
                    <span>{language === 'te' ? 'ట్రయాజ్' : 'Triage in Copilot'}</span>
                  </button>
                  <button
                    onClick={() => startEdit(rec)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Edit transcript"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transcript text */}
              {editingId === rec.id ? (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    rows={2}
                    className="w-full text-xs text-slate-800 p-2 border border-teal-400 rounded-lg focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-slate-500 hover:bg-slate-100 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(rec.id)}
                      className="text-xs bg-teal-600 text-white font-semibold px-3 py-1 rounded hover:bg-teal-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100 leading-relaxed font-sans">
                  "{rec.transcript}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
