import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  HelpCircle,
  Activity,
  ArrowRight,
  PhoneCall,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Check,
  ClipboardList,
  Trash2,
  Copy,
  Printer,
  X,
  Ambulance,
  Loader2,
} from 'lucide-react';
import { AppLanguage, ChatMessage, CopilotTriageResponse, DoctorSummary, UrgencyLevel } from '../types';
import { useEmergencyCall } from '../hooks/useEmergencyCall';
import {
  sendCopilotChat,
  streamCopilotChat,
  synthesizeVoiceAudio,
  transcribeAudioBlob,
  getDoctorSummary,
  fetchConversation,
  createConversation,
  addMessageToConversation,
} from '../services/api';
import { SAMPLE_SYMPTOM_SCENARIOS, SymptomScenario } from '../data/sampleScenarios';

interface CopilotViewProps {
  language: AppLanguage;
  onNavigateToNearbyCare: (specialty?: string) => void;
  onNavigateToDoctors: (specialty?: string) => void;
  onNavigateToReport: () => void;
  onOpenEmergencyModal: () => void;
  initialReportContext?: string | null;
  onClearReportContext?: () => void;
  activeConversationId?: string | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  language,
  onNavigateToNearbyCare,
  onNavigateToDoctors,
  onNavigateToReport,
  onOpenEmergencyModal,
  initialReportContext,
  onClearReportContext,
  activeConversationId,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const { isCalling, callingNumber, callAmbulance108, callEmergency112 } = useEmergencyCall();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    activeConversationId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          language === 'te'
            ? 'నమస్కారం! నేను మీ మెడిమేట్ AI హెల్త్ కోపైలట్‌ను. మీ ప్రస్తుత లక్షణాలు లేదా సమస్యలను వివరించండి (టైప్ చేయండి లేదా మైక్ నొక్కి మాట్లాడండి).'
            : language === 'hi'
            ? 'नमस्ते! मैं आपका मेडिमेट AI हेल्थ कोपायलट हूं। अपने लक्षणों या स्वास्थ्य संबंधी प्रश्नों का वर्णन करें (टाइप करें या माइक पर बोलें)।'
            : language === 'ta'
            ? 'வணக்கம்! நான் உங்கள் மெடிமேட் AI சுகாதார வழிகாட்டி. உங்கள் அறிகுறிகள் அல்லது உடல்நலக் கவலைகளைப் பகிரவும்.'
            : language === 'kn'
            ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಮೆಡಿಮೇಟ್ AI ಹೆಲ್ತ್ ಕೋಪೈಲಟ್. ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ಆರೋಗ್ಯದ ಪ್ರಶ್ನೆಗಳನ್ನು ವಿವರಿಸಿ.'
            : 'Hello! I am your MediMate AI Health Copilot. Describe what symptoms you are experiencing. You can type or click the microphone to speak hands-free.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeTriage, setActiveTriage] = useState<CopilotTriageResponse | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  // Voice States: Dual Engine (Web Speech API + Audio Stream Fallback)
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechPermissionError, setSpeechPermissionError] = useState<string | null>(null);
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false);
  const [handsFreeAutoSend, setHandsFreeAutoSend] = useState(true);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Doctor Summary & Clear Chat modal states
  const [isDoctorSummaryOpen, setIsDoctorSummaryOpen] = useState(false);
  const [isGeneratingDoctorSummary, setIsGeneratingDoctorSummary] = useState(false);
  const [doctorSummaryData, setDoctorSummaryData] = useState<DoctorSummary | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Suggested Starter Questions (Localized for 5 languages)
  const STARTER_QUESTIONS = [
    {
      id: 'understand',
      label:
        language === 'te'
          ? 'లక్షణాల వివరణ'
          : language === 'hi'
          ? 'लक्षण समझें'
          : language === 'ta'
          ? 'அறிகுறிகள்'
          : language === 'kn'
          ? 'ರೋಗಲಕ್ಷಣ ತಿಳಿಯಿರಿ'
          : 'Understand Symptoms',
      query:
        language === 'te'
          ? 'నా లక్షణాలను అర్థం చేసుకోవడంలో సహాయపడండి.'
          : language === 'hi'
          ? 'मेरे लक्षणों को समझने में मेरी मदद करें।'
          : language === 'ta'
          ? 'என் அறிகுறிகளைப் புரிந்து கொள்ள உதவுங்கள்.'
          : language === 'kn'
          ? 'ನನ್ನ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಿ.'
          : 'Help me understand my symptoms.',
    },
    {
      id: 'specialty',
      label:
        language === 'te'
          ? 'ఏ డాక్టర్‌ను సంప్రదించాలి?'
          : language === 'hi'
          ? 'विशेषज्ञ डॉक्टर'
          : language === 'ta'
          ? 'மருத்துவர் ஆலோசனை'
          : language === 'kn'
          ? 'ಯಾವ ವೈದ್ಯರು?'
          : 'Doctor Specialty Advice',
      query:
        language === 'te'
          ? 'నేను ఏ రకమైన వైద్యుడిని సంప్రదించాలి?'
          : language === 'hi'
          ? 'मुझे किस प्रकार के विशेषज्ञ डॉक्टर से परामर्श लेना चाहिए?'
          : language === 'ta'
          ? 'நான் எந்த வகையான மருத்துவரை அணுக வேண்டும்?'
          : language === 'kn'
          ? 'ನಾನು ಯಾವ ರೀತಿಯ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು?'
          : 'What type of doctor should I consult?',
    },
    {
      id: 'explain-term',
      label:
        language === 'te'
          ? 'ఆరోగ్య పదం వివరణ'
          : language === 'hi'
          ? 'सरल भाषा में समझें'
          : language === 'ta'
          ? 'விளக்கம்'
          : language === 'kn'
          ? 'ಪದದ ವಿವರಣೆ'
          : 'Explain Health Term',
      query:
        language === 'te'
          ? 'ఈ ఆరోగ్య పదాన్ని సరళమైన భాషలో వివరించండి.'
          : language === 'hi'
          ? 'इस चिकित्सीय शब्द को सरल भाषा में समझाएं।'
          : language === 'ta'
          ? 'இந்த மருத்துவ வார்த்தையை எளிய மொழியில் விளக்குங்கள்.'
          : language === 'kn'
          ? 'ಈ ಆರೋಗ್ಯ ಪದವನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ.'
          : 'Explain this health term in simple language.',
    },
    {
      id: 'doctor-questions',
      label:
        language === 'te'
          ? 'డాక్టర్‌కు ప్రశ్నలు'
          : language === 'hi'
          ? 'डॉक्टर के लिए प्रश्न'
          : language === 'ta'
          ? 'மருத்துவரிடம் கேட்க'
          : language === 'kn'
          ? 'ವೈದ್ಯರಿಗೆ ಪ್ರಶ್ನೆಗಳು'
          : 'Prepare Doctor Questions',
      query:
        language === 'te'
          ? 'వైద్యుడిని అడగడానికి ప్రశ్నలు సిద్ధం చేయండి.'
          : language === 'hi'
          ? 'मेरे डॉक्टर से पूछने के लिए महत्वपूर्ण प्रश्न तैयार करें।'
          : language === 'ta'
          ? 'மருத்துவரிடம் கேட்பதற்கான கேள்விகளைத் தயார் செய்யுங்கள்.'
          : language === 'kn'
          ? 'ನನ್ನ ವೈದ್ಯರನ್ನು ಕೇಳಲು ಪ್ರಶ್ನೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.'
          : 'Help me prepare questions for my doctor.',
    },
  ];

  // Audio recording refs
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Clean Voice Commands: "send", "submit", "clear"
  const processVoiceCommands = (rawText: string) => {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    if (lower === 'clear' || lower === 'delete' || lower === 'తుడిచివేయి' || lower === 'క్లియర్') {
      setInputValue('');
      setInterimTranscript('');
      latestTranscriptRef.current = '';
      return { action: 'clear' as const, content: '' };
    }

    if (
      lower.endsWith(' send') ||
      lower.endsWith(' submit') ||
      lower === 'send' ||
      lower === 'submit' ||
      lower.endsWith(' పంపు') ||
      lower.endsWith(' పంపించు')
    ) {
      const cleanContent = text
        .replace(/\b(send|submit|పంపు|పంపించు)\b/gi, '')
        .trim();
      return { action: 'send' as const, content: cleanContent || text };
    }

    return { action: 'none' as const, content: text };
  };

  // Convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // Stop all media tracks and analysis
  const cleanupMediaStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Toggle voice input with mic permission handling & volume analysis
  const handleToggleVoiceInput = async () => {
    if (isListening) {
      // User tapped stop listening
      stopListening(false);
      return;
    }

    setSpeechPermissionError(null);
    setInterimTranscript('');
    latestTranscriptRef.current = '';

    try {
      // 1. Explicitly request microphone stream (unlocks browser mic permission dialog)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. Set up live volume visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(Math.round((avg / 128) * 100), 100);
            setAudioLevel(normalized);
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (audioErr) {
        console.warn('AudioContext visualization not available:', audioErr);
      }

      // 3. Set up MediaRecorder backup for Gemini 3.5 Transcribe
      audioChunksRef.current = [];
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr);
      }

      // 4. Set up Web Speech API SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        const speechLangMap: Record<string, string> = {
          te: 'te-IN',
          hi: 'hi-IN',
          ta: 'ta-IN',
          kn: 'kn-IN',
          en: 'en-IN',
        };
        recognition.lang = speechLangMap[language] || 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptPart;
            } else {
              interim += transcriptPart;
            }
          }

          const currentSpoken = (final || interim).trim();
          if (currentSpoken) {
            latestTranscriptRef.current = currentSpoken;
            setInputValue(currentSpoken);
            setInterimTranscript(interim);

            const { action, content } = processVoiceCommands(currentSpoken);

            if (action === 'clear') {
              return;
            }

            if (action === 'send' && content.length > 2) {
              stopListening(true, content);
              return;
            }

            // Hands-Free Auto-Send on speech pause (1.4s silence detection)
            if (handsFreeAutoSend && currentSpoken.length >= 4) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (latestTranscriptRef.current && latestTranscriptRef.current.length >= 4) {
                  const toSend = latestTranscriptRef.current;
                  stopListening(true, toSend);
                }
              }, 1400);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechPermissionError('Microphone permission blocked. Please enable microphone access in your browser bar.');
          }
        };

        recognition.onend = () => {
          // If stopped without auto-send, keep state in sync
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      setIsListening(true);
    } catch (err: any) {
      console.error('Failed to open microphone:', err);
      setSpeechPermissionError(
        'Could not access microphone. Please grant microphone permission in your browser or type symptoms.'
      );
      cleanupMediaStream();
      setIsListening(false);
    }
  };

  // Stop listening with fallback to Gemini Transcribe if SpeechRecognition was empty
  const stopListening = async (shouldAutoSend: boolean = false, overrideText?: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    cleanupMediaStream();
    setIsListening(false);
    setInterimTranscript('');

    const capturedText = overrideText || latestTranscriptRef.current || inputValue;

    // If Web Speech API captured text, send or keep it
    if (capturedText.trim()) {
      if (shouldAutoSend) {
        handleSendMessage(capturedText);
      }
      return;
    }

    // Fallback: If Web Speech returned empty but audio was recorded, transcribe via Gemini 3.5 Transcribe
    if (audioChunksRef.current.length > 0) {
      setIsTranscribingAudio(true);
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 2000) {
          const base64Audio = await blobToBase64(audioBlob);
          const result = await transcribeAudioBlob(base64Audio, 'audio/webm', language);
          if (result.success && result.transcript) {
            setInputValue(result.transcript);
            if (shouldAutoSend && result.transcript.length > 2) {
              handleSendMessage(result.transcript);
            }
          }
        }
      } catch (transcribeErr) {
        console.warn('Backup transcription error:', transcribeErr);
      } finally {
        setIsTranscribingAudio(false);
      }
    }
  };

  // Stop currently playing voice
  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioPlayingId(null);
    setIsVoiceLoading(false);
  };

  // Speak message aloud using Gemini 3.8 Flash Lite TTS with instant browser fallback
  const handleSpeakText = async (text: string, messageId: string) => {
    if (activeAudioPlayingId === messageId) {
      stopAudioPlayback();
      return;
    }

    stopAudioPlayback();
    setActiveAudioPlayingId(messageId);
    setIsVoiceLoading(true);

    try {
      const ttsRes = await synthesizeVoiceAudio(text, language);

      if (ttsRes.available && ttsRes.audioUrl) {
        setIsVoiceLoading(false);
        const audio = new Audio(ttsRes.audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => setActiveAudioPlayingId(null);
        audio.onerror = () => fallbackBrowserSpeech(text);
        await audio.play();
        return;
      }
    } catch (err) {
      // Fall through to browser speech synthesis
    }

    fallbackBrowserSpeech(text);
  };

  const fallbackBrowserSpeech = (text: string) => {
    setIsVoiceLoading(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const speechLangMap: Record<string, string> = {
        te: 'te-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        en: 'en-IN',
      };
      utterance.lang = speechLangMap[language] || 'en-US';
      utterance.rate = 1.05;
      utterance.onend = () => setActiveAudioPlayingId(null);
      utterance.onerror = () => setActiveAudioPlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveAudioPlayingId(null);
    }
  };

  // Load conversation if activeConversationId is provided
  useEffect(() => {
    if (activeConversationId) {
      setCurrentConversationId(activeConversationId);
      fetchConversation(activeConversationId)
        .then((data) => {
          if (data && data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                triage: m.triage,
                reportContext: m.reportContext,
                isVoice: m.isVoice,
              }))
            );
          }
        })
        .catch((err) => console.warn('Could not load conversation:', err));
    }
  }, [activeConversationId]);

  // Handle passed initialPrompt from Voice History or other views
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Handle passed initialReportContext if navigated from report analyzer
  useEffect(() => {
    if (initialReportContext) {
      const prompt =
        language === 'te'
          ? `నేను నా మెడికల్ రిపోర్టును అప్‌లోడ్ చేసాను. దయచేసి ఈ ఫలితాలను విశ్లేషించి వివరించండి:\n\n${initialReportContext}`
          : `I have uploaded a lab report with the following details. Please explain what these findings mean and what steps I should discuss with my doctor:\n\n${initialReportContext}`;
      handleSendMessage(prompt, 'Report Analysis Context Attached');
      if (onClearReportContext) onClearReportContext();
    }
  }, [initialReportContext]);

  const handleSendMessage = async (textToSend?: string, attachedContext?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    if (isListening) {
      stopListening(false);
    }

    stopAudioPlayback();
    setLastError(null);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportContext: attachedContext,
    };

    // Auto-persist consultation & message to backend
    let activeId = currentConversationId;
    if (!activeId) {
      createConversation(text.slice(0, 45) + (text.length > 45 ? '...' : ''), language)
        .then((c) => {
          activeId = c.id;
          setCurrentConversationId(c.id);
          addMessageToConversation(c.id, {
            role: 'user',
            content: text,
            reportContext: attachedContext,
          }).catch(() => {});
        })
        .catch(() => {});
    } else {
      addMessageToConversation(activeId, {
        role: 'user',
        content: text,
        reportContext: attachedContext,
      }).catch(() => {});
    }

    const newMessages = [...messages, userMessage];
    setInputValue('');
    setIsLoading(true);

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '', // Streaming tokens will append here
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...newMessages, initialAssistantMessage]);

    const startTime = performance.now();
    let accumulatedContent = '';

    const apiPayload = newMessages.map((m) => ({
      role: m.role,
      content: m.reportContext ? `${m.reportContext}\n\n${m.content}` : m.content,
    }));

    try {
      await streamCopilotChat({
        messages: apiPayload,
        language,
        onToken: (_token, accumulated) => {
          accumulatedContent = accumulated;
          // Progressively update the message in state as tokens stream in
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        },
        onDone: (triageResult) => {
          const durationMs = Math.round(performance.now() - startTime);
          setResponseTimeMs(durationMs);

          const finalExplanation =
            triageResult.explanation || accumulatedContent || triageResult.summary;

          if (activeId) {
            addMessageToConversation(activeId, {
              role: 'assistant',
              content: finalExplanation,
              triage: triageResult,
            }).catch(() => {});
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: finalExplanation,
                    triage: triageResult,
                  }
                : msg
            )
          );

          setActiveTriage(triageResult);
          setIsLoading(false);

          if (autoVoiceEnabled) {
            setTimeout(() => {
              handleSpeakText(finalExplanation, assistantMsgId);
            }, 150);
          }
        },
        onError: (err) => {
          console.error('Streaming Copilot error:', err);
          setLastError(err.message || 'Stream connection interrupted. Please retry.');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    error: true,
                    content: 'Clinical assessment temporarily delayed. Please click retry below.',
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Copilot request failed:', err);
      setLastError(err.message || 'Failed to reach AI Copilot. Please check connection and retry.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                error: true,
                content: 'Clinical assessment temporarily delayed. Please click retry below.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Doctor Summary handlers
  const handleOpenDoctorSummary = async () => {
    setIsDoctorSummaryOpen(true);
    setIsGeneratingDoctorSummary(true);
    setCopiedSummary(false);

    try {
      const summary = await getDoctorSummary({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        language,
      });
      setDoctorSummaryData(summary);
    } catch (err) {
      console.warn('Failed to fetch doctor summary from API, using client fallback:', err);
      const userMsgs = messages.filter((m) => m.role === 'user').map((m) => m.content);
      setDoctorSummaryData({
        reported_symptoms: userMsgs.length > 0 ? userMsgs : ['General health query - see conversation notes'],
        duration_and_severity: '[Not specified by patient - ask clinician to inquire]',
        associated_symptoms: ['[None explicitly reported by user]'],
        user_medical_context: '[None reported in chat session - inquire about allergies and chronic illnesses]',
        questions_for_doctor: [
          'What diagnostic tests (e.g. CBC, fever profile) do you recommend for these symptoms?',
          'What warning signs should prompt immediate emergency escalation?',
          'Are there specific supportive care routines or dietary restrictions to follow?',
        ],
        missing_information: [
          'Exact thermometer temperature reading (°F / °C)',
          'Any over-the-counter medications taken before consultation',
          'Known drug allergies or chronic conditions',
        ],
        generated_at: new Date().toLocaleString(),
      });
    } finally {
      setIsGeneratingDoctorSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!doctorSummaryData) return;
    const textToCopy = `MEDIMATE AI — CLINICAL BRIEFING SUMMARY
Generated: ${doctorSummaryData.generated_at}

1. REPORTED SYMPTOMS:
${doctorSummaryData.reported_symptoms.map((s) => `• ${s}`).join('\n')}

2. DURATION & SEVERITY:
${doctorSummaryData.duration_and_severity}

3. ASSOCIATED SYMPTOMS:
${doctorSummaryData.associated_symptoms.map((s) => `• ${s}`).join('\n')}

4. USER-PROVIDED MEDICAL CONTEXT:
${doctorSummaryData.user_medical_context}

5. QUESTIONS TO DISCUSS WITH CLINICIAN:
${doctorSummaryData.questions_for_doctor.map((q) => `• ${q}`).join('\n')}

6. MISSING CLINICAL INFORMATION:
${doctorSummaryData.missing_information.map((m) => `• [MISSING] ${m}`).join('\n')}

---
DISCLAIMER: This briefing summary is compiled by MediMate AI based on self-reported patient conversation for healthcare consultation. It does NOT constitute a confirmed medical diagnosis.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleConfirmClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'te'
            ? 'నమస్కారం! సంభాషణ రీసెట్ చేయబడింది. మీ ప్రస్తుత లక్షణాలు లేదా సందేహాలను తెలియజేయండి.'
            : 'Hello! Your conversation has been reset. What symptoms or health concerns can I assist you with?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveTriage(null);
    setLastError(null);
    setInputValue('');
    setIsClearConfirmOpen(false);
  };

  const handleApplyScenario = (scenario: SymptomScenario) => {
    const text = language === 'te' ? scenario.teluguSymptoms : scenario.symptoms;
    handleSendMessage(text);
  };

  const renderUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow-sm animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" />
            {language === 'te' ? 'అత్యవసరం (Emergency)' : 'Immediate Emergency'}
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            {language === 'te' ? 'సత్వర శ్రద్ధ (Urgent - 24h)' : 'Urgent Assessment (24h)'}
          </span>
        );
      case 'routine':
        return (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === 'te' ? 'సాధారణ సంప్రదింపు (Routine)' : 'Routine Clinical Consult'}
          </span>
        );
      case 'self-care':
        return (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            {language === 'te' ? 'స్వీయ సంరక్షణ (Self-Care)' : 'Self-Care & Monitoring'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Demo Presets Bar */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-7 text-white shadow-2xl border border-teal-800/40 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {language === 'te' ? 'AI హెల్త్ కోపైలట్ (వాయిస్ ట్రయేజ్)' : 'AI Health Copilot & Voice Triage'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                <Zap className="w-3 h-3 text-amber-300" />
                Live Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {language === 'te'
                ? 'మీరు మాట్లాడే ప్రతి మాటను టెక్స్ట్‌గా మార్చి తక్షణమే విశ్లేషిస్తాము. తెలుగు & ఇంగ్లీష్ హ్యాండ్స్-ఫ్రీ వాయిస్.'
                : 'Speak symptoms directly into your microphone or type naturally. Features real-time voice dictation with automatic speech-to-text triage.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Primary Voice Mic Toggle Button */}
            <button
              onClick={handleToggleVoiceInput}
              className={`text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition font-bold shadow-lg ${
                isListening
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-500/40 ring-4 ring-red-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20 hover:scale-105'
              }`}
              title="Click to speak your symptoms"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-spin" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Mic</span>
                </>
              )}
            </button>

            {/* Auto-Voice Narration Toggle */}
            <button
              onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
              className={`text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition font-semibold border ${
                autoVoiceEnabled
                  ? 'bg-teal-400 text-slate-950 border-teal-300 font-bold shadow-xs'
                  : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
              }`}
              title="Automatically read assistant replies aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Read: {autoVoiceEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Prepare Doctor Summary Button */}
            <button
              onClick={handleOpenDoctorSummary}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition font-extrabold shadow-md shadow-emerald-500/20 hover:scale-105"
              title="Generate a clinical briefing summary for your clinician"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Prepare Doctor Summary</span>
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="bg-white/10 hover:bg-rose-500/20 hover:border-rose-400/40 text-slate-300 hover:text-white text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition font-semibold border border-white/15"
              title="Clear conversation history"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={onNavigateToReport}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition font-semibold border border-white/15"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>Lab Report</span>
            </button>
          </div>
        </div>

        {/* Suggested Starter Questions Section */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggested Inquiries (1-Click Prompt):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {STARTER_QUESTIONS.map((sq) => (
              <button
                key={sq.id}
                onClick={() => handleSendMessage(sq.query)}
                className="text-left bg-slate-800/60 hover:bg-teal-900/40 border border-slate-700/70 hover:border-teal-400/50 p-2.5 rounded-xl transition text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between group"
              >
                <span className="truncate">{sq.query}</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Demo Scenario Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              {language === 'te' ? 'పరీక్షించడానికి నమూనా దృశ్యాలు:' : 'Instant Clinical Demo Scenarios (Judge Evaluation):'}
            </span>
            {responseTimeMs && (
              <span className="text-[11px] text-teal-300 font-mono flex items-center gap-1 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/50">
                <Zap className="w-3 h-3 text-amber-300" />
                Response: {responseTimeMs}ms
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_SYMPTOM_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleApplyScenario(sc)}
                className="text-left bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/80 hover:border-teal-500/60 p-3 rounded-2xl transition group backdrop-blur-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span
                    className={
                      sc.category === 'Emergency'
                        ? 'text-rose-400 font-extrabold'
                        : sc.category === 'Urgent'
                        ? 'text-amber-400'
                        : 'text-teal-300'
                    }
                  >
                    {sc.category}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs font-semibold text-slate-200 line-clamp-1">{sc.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{sc.specialty}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat and Triage View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chat Conversation Stream (2 cols) */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[640px] relative">
          {/* Permission error banner if user denied mic */}
          {speechPermissionError && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-3 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                {speechPermissionError}
              </span>
              <button
                onClick={() => setSpeechPermissionError(null)}
                className="text-amber-800 hover:underline font-bold text-[11px] ml-2 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Voice HUD Overlay when microphone is listening */}
          {isListening && (
            <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 text-white px-5 py-3.5 flex items-center justify-between shadow-xl border-b border-rose-900/50 animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-3.5">
                {/* Live sound-wave equalizer responding to audio volume */}
                <div className="flex items-center gap-1 h-6 px-2 py-1 bg-rose-900/40 rounded-lg border border-rose-700/40">
                  <span
                    className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, (audioLevel * 0.24))}px` }}
                  />
                  <span
                    className="w-1 bg-red-300 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(10, (audioLevel * 0.35))}px` }}
                  />
                  <span
                    className="w-1 bg-white rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(14, (audioLevel * 0.45))}px` }}
                  />
                  <span
                    className="w-1 bg-red-300 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(8, (audioLevel * 0.3))}px` }}
                  />
                  <span
                    className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, (audioLevel * 0.2))}px` }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-wide text-rose-200">
                      {language === 'te'
                        ? 'మైక్రోఫోన్ ఆన్‌లో ఉంది — మాట్లాడుతున్నారు'
                        : 'Microphone Active — Voice Dictation'}
                    </span>
                    <span className="bg-rose-800/80 text-[10px] uppercase font-mono px-2 py-0.2 rounded-full border border-rose-600/40">
                      {language === 'te' ? 'Telugu' : 'English'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {handsFreeAutoSend
                      ? 'Speak your symptoms. Auto-sends 1.4s after speaking, or say "send".'
                      : 'Speak freely. Tap Done or say "send" when finished.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHandsFreeAutoSend(!handsFreeAutoSend)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition border ${
                    handsFreeAutoSend
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Toggle automatic submission after speech pause"
                >
                  Auto-Send: {handsFreeAutoSend ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => stopListening(true)}
                  className="bg-white hover:bg-rose-50 text-slate-900 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* Backup audio transcription spinner */}
          {isTranscribingAudio && (
            <div className="bg-teal-50 border-b border-teal-200 text-teal-900 text-xs px-4 py-2 flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Transcribing your speech with Gemini 3.5 Transcribe...</span>
            </div>
          )}

          {/* Chat Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';
              const isSpeaking = activeAudioPlayingId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xs transition ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-teal-700/10'
                    }`}
                  >
                    {/* Header info with Voice Read-Aloud Button */}
                    <div className="flex items-center justify-between gap-3 mb-2 text-[11px] opacity-75">
                      <span className="font-semibold flex items-center gap-1.5">
                        {isAssistant ? (
                          <>
                            <Activity className="w-3.5 h-3.5 text-teal-600" />
                            <span>MediMate Copilot</span>
                          </>
                        ) : (
                          <span>You</span>
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Voice Listen Button for Assistant Messages */}
                        {isAssistant && (
                          <button
                            onClick={() => handleSpeakText(message.content, message.id)}
                            className={`p-1 px-2 rounded-lg transition flex items-center gap-1 text-[11px] font-bold ${
                              isSpeaking
                                ? 'bg-teal-600 text-white shadow-xs animate-pulse'
                                : 'text-teal-700 hover:bg-teal-50 border border-teal-200/60'
                            }`}
                            title="Listen to response"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                        <span>{message.timestamp}</span>
                      </div>
                    </div>

                    {/* Report context badge if attached */}
                    {message.reportContext && (
                      <div className="mb-2.5 bg-teal-900/40 text-teal-100 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                        <span>Attached Laboratory Report Data</span>
                      </div>
                    )}

                    {/* Message content with real-time streaming cursor indicator */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                      {message.error ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-rose-950 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Clinical assessment temporarily delayed</span>
                          </div>
                          <p className="text-[11px] text-rose-800 leading-relaxed">
                            {language === 'te'
                              ? 'నెట్‌వర్క్ జాప్యం వల్ల విశ్లేషణ పూర్తి కాలేదు. దయచేసి క్రింది బటన్ నొక్కి పునఃప్రయత్నించండి.'
                              : 'We experienced a temporary connectivity delay. Click below to instantly re-analyze using our resilient clinical engine.'}
                          </p>
                          <button
                            onClick={() => {
                              const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                              if (lastUser) handleSendMessage(lastUser.content);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Assessment</span>
                          </button>
                        </div>
                      ) : message.content ? (
                        <span>{message.content}</span>
                      ) : isAssistant && isLoading ? (
                        <span className="flex items-center gap-2 text-teal-700 font-medium text-xs py-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                          <span>{language === 'te' ? 'లక్షణాలను విశ్లేషిస్తోంది...' : 'Evaluating symptoms and clinical triage...'}</span>
                        </span>
                      ) : isAssistant ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 space-y-1.5">
                          <p className="text-xs font-semibold">Ready to assess symptoms...</p>
                          <button
                            onClick={() => {
                              const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                              if (lastUser) handleSendMessage(lastUser.content);
                            }}
                            className="text-xs font-bold text-amber-800 underline hover:no-underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Click to evaluate
                          </button>
                        </div>
                      ) : null}
                      {isAssistant && isLoading && !message.triage && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal-600 animate-pulse rounded-xs align-baseline" />
                      )}
                    </div>

                    {/* If assistant returned structured triage */}
                    {message.triage && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700">Triage Assessment:</span>
                          {renderUrgencyBadge(message.triage.urgency)}
                        </div>

                        {/* Emergency Protocol Trigger if emergency */}
                        {message.triage.urgency === 'emergency' && (
                          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 text-red-950 space-y-2.5 animate-pulse shadow-sm">
                            <div className="flex items-center gap-2">
                              <AlertOctagon className="w-5 h-5 text-red-600" />
                              <span className="font-bold text-xs uppercase tracking-wide">
                                {language === 'te'
                                  ? 'అత్యవసర హెచ్చరిక: ఆలస్యం చేయవద్దు'
                                  : 'CRITICAL EMERGENCY WARNING: SEEK IMMEDIATE CARE'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">
                              {language === 'te'
                                ? 'ఈ లక్షణాలు గుండె లేదా ఇతర కీలక సమస్యలను సూచించవచ్చు. దయచేసి వెంటనే 108 అంబులెన్స్ లేదా 112 కి కాల్ చేయండి. సమీప ఎమర్జెన్సీ ఆసుపత్రికి వెళ్ళండి.'
                                : language === 'hi'
                                ? 'ये लक्षण गंभीर आपातकाल का संकेत देते हैं। तुरंत 108 (एम्बुलेंस) या 112 डायल करें। स्वयं गाड़ी न चलाएं।'
                                : language === 'ta'
                                ? 'இந்த அறிகுறிகள் உடனடி மருத்துவ அவசரத்தைக் குறிக்கின்றன. உடனே 108 ஆம்புலன்ஸ் அல்லது 112 அழைக்கவும்.'
                                : language === 'kn'
                                ? 'ಈ ಲಕ್ಷಣಗಳು ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಥವಾ 112 ಗೆ ಕರೆ ಮಾಡಿ.'
                                : 'These symptoms indicate a potentially life-threatening situation. Call 108 (India Emergency Ambulance) or 112 immediately. Do not drive yourself.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                onClick={(e) => callAmbulance108(e)}
                                disabled={isCalling}
                                className={`bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                                  isCalling && callingNumber === '108' ? 'ring-2 ring-white animate-pulse' : ''
                                }`}
                              >
                                {isCalling && callingNumber === '108' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Ambulance className="w-3.5 h-3.5 animate-bounce" />
                                )}
                                <span>{isCalling && callingNumber === '108' ? 'Connecting 108...' : 'Call 108 (Ambulance)'}</span>
                              </button>
                              <button
                                onClick={(e) => callEmergency112(e)}
                                disabled={isCalling}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                              >
                                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                                <span>{isCalling && callingNumber === '112' ? 'Dialing 112...' : 'Call 112'}</span>
                              </button>
                              <button
                                onClick={() => onNavigateToNearbyCare('hospital')}
                                className="bg-white/80 hover:bg-white text-slate-900 border border-slate-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                                Emergency Hospitals
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Suggested Specialty */}
                        {message.triage.suggested_specialty && (
                          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                                Recommended Specialist:
                              </span>
                              <p className="font-bold text-teal-950 text-sm mt-0.5">
                                {message.triage.suggested_specialty}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onNavigateToDoctors(message.triage?.suggested_specialty)}
                                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Book
                              </button>
                              <button
                                onClick={() => onNavigateToNearbyCare(message.triage?.suggested_specialty)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                Facilities
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reasons for Suggested Specialty */}
                        {message.triage.reasons_for_specialty && (
                          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-xs space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                              <Info className="w-3 h-3 text-teal-600" />
                              Why this specialist is recommended:
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px] font-medium">
                              {message.triage.reasons_for_specialty}
                            </p>
                          </div>
                        )}

                        {/* Follow up questions prompt */}
                        {message.triage.follow_up_questions && message.triage.follow_up_questions.length > 0 && (
                          <div className="bg-slate-100/80 rounded-xl p-3 text-xs text-slate-700 space-y-1.5">
                            <span className="font-semibold text-slate-900 flex items-center gap-1 text-[11px]">
                              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                              Follow-up questions to clarify context:
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px]">
                              {message.triage.follow_up_questions.map((q, idx) => (
                                <li
                                  key={idx}
                                  className="cursor-pointer hover:text-teal-700 hover:underline"
                                  onClick={() => setInputValue(q)}
                                >
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Safe next steps */}
                        {message.triage.next_steps && message.triage.next_steps.length > 0 && (
                          <div className="text-xs text-slate-600 space-y-1">
                            <span className="font-semibold text-slate-900 text-[11px]">Recommended Clinical Steps:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                              {message.triage.next_steps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-600 text-xs py-2 px-3.5 bg-white rounded-2xl w-fit border border-slate-200 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span className="font-medium">Evaluating symptoms (Fast Triage Mode)...</span>
              </div>
            )}

            {lastError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl p-4 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Assessment Request Notice</p>
                  <p className="mt-0.5">{lastError}</p>
                  <button
                    onClick={() => handleSendMessage()}
                    className="mt-2 text-red-800 font-bold underline hover:no-underline"
                  >
                    Retry Assessment
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar with Microphone & Voice Controls */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shadow-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              {/* Voice Microphone Dictation Button with glowing indicator */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-3.5 rounded-2xl transition flex items-center justify-center shrink-0 relative ${
                  isListening
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-400/30 animate-pulse'
                    : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 shadow-xs hover:border-teal-300'
                }`}
                title={isListening ? 'Stop recording voice' : 'Click to speak symptoms (Microphone)'}
              >
                {isListening ? (
                  <div className="relative flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening to your voice... speak now (auto-sends on pause)'
                      : language === 'te'
                      ? 'లక్షణాలు మాట్లాడండి (మైక్ నొక్కండి) లేదా టైప్ చేయండి...'
                      : 'Describe symptoms or click mic to speak hands-free...'
                  }
                  className={`w-full text-xs sm:text-sm rounded-2xl px-4 py-3.5 outline-none border transition shadow-inner ${
                    isListening
                      ? 'bg-rose-50/70 border-rose-300 text-rose-950 placeholder-rose-400 font-medium'
                      : 'bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 border-transparent focus:border-teal-500'
                  }`}
                  disabled={isLoading}
                />

                {/* Live speech transcription preview bubble */}
                {isListening && interimTranscript && (
                  <div className="absolute -top-8 left-1 bg-slate-900/95 text-white text-[11px] px-3 py-1 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="truncate max-w-[280px] font-mono">"{interimTranscript}"</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3.5 rounded-2xl transition shadow-md shadow-teal-600/20 disabled:shadow-none flex items-center justify-center shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-teal-600" />
                <span>
                  Hands-Free Voice: Speak symptoms, pause or say <b className="text-slate-600">"send"</b> to submit, <b className="text-slate-600">"clear"</b> to reset.
                </span>
              </span>
              <span className="font-bold text-rose-600">Emergency: Call 108 (India Ambulance) / 112</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Clinical Summary & Connected Pathway (1 col) */}
        <div className="space-y-4">
          {/* Active Triage Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Live Patient Status
              </h3>
              {activeTriage && renderUrgencyBadge(activeTriage.urgency)}
            </div>

            {activeTriage ? (
              <div className="space-y-3.5 text-xs">
                {/* Voice listen button for current summary */}
                <div className="flex items-center justify-between bg-teal-50/70 border border-teal-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-teal-900 text-[11px]">Audio Narration:</span>
                  </div>
                  <button
                    onClick={() => handleSpeakText(activeTriage.explanation || activeTriage.summary, 'active-summary')}
                    className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    {activeAudioPlayingId === 'active-summary' ? 'Stop Voice' : 'Play Guidance'}
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Symptom Summary
                  </span>
                  <p className="text-slate-800 font-medium mt-1 leading-relaxed">{activeTriage.summary}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Recommended Specialty
                  </span>
                  <p className="text-teal-700 font-extrabold text-sm mt-0.5">
                    {activeTriage.suggested_specialty}
                  </p>
                </div>

                {activeTriage.warning_signs && activeTriage.warning_signs.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Red Flag Warning Signs:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-800 text-[11px]">
                      {activeTriage.warning_signs.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Connected next actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Next Recommended Actions
                  </span>

                  <button
                    onClick={() => onNavigateToNearbyCare(activeTriage.suggested_specialty)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-3.5 rounded-2xl flex items-center justify-between transition shadow-md shadow-teal-600/20"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Find Nearby {activeTriage.suggested_specialty} Care
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToDoctors(activeTriage.suggested_specialty)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      Book Specialist Appointment
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={onNavigateToReport}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition border border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Have Lab Reports? Upload Here
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2.5">
                <Activity className="w-9 h-9 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600">No active symptoms evaluated yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Click the microphone button to dictate your symptoms, or select one of the demo scenarios above.
                </p>
              </div>
            )}
          </div>

          {/* Clinical Safeguards Note */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-[11px] text-slate-500 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Medical Safety Standards</span>
            </div>
            <p className="leading-relaxed">
              MediMate AI operates strictly on evidence-based triage. The system does not write prescriptions, alter clinical medication doses, or issue definitive diagnostic decrees without clinical examination.
            </p>
            <p className="text-slate-400">
              For real emergencies, bypass conversational AI and contact 112 / 108 immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Prepare Doctor Summary */}
      {isDoctorSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-700/80 rounded-xl">
                  <ClipboardList className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Clinician Briefing Summary</h3>
                  <p className="text-xs text-teal-200">
                    Prepared for your doctor consultation based solely on stated symptoms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDoctorSummaryOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {isGeneratingDoctorSummary ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
                  <RefreshCw className="w-7 h-7 text-teal-600 animate-spin" />
                  <p className="font-semibold text-sm">Compiling clinical notes from your chat...</p>
                  <p className="text-xs text-slate-400">Marking reported facts and highlighting missing information.</p>
                </div>
              ) : doctorSummaryData ? (
                <div className="space-y-4">
                  {/* Metadata banner */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span>MediMate AI Clinical Summary</span>
                    <span>{doctorSummaryData.generated_at}</span>
                  </div>

                  {/* 1. Reported Symptoms */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      1. Patient-Reported Symptoms
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      {doctorSummaryData.reported_symptoms.map((s, idx) => (
                        <li key={idx} className="font-medium">{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Duration & Severity */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      2. Duration & Reported Severity
                    </span>
                    <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 text-teal-950 font-medium">
                      {doctorSummaryData.duration_and_severity}
                    </div>
                  </div>

                  {/* 3. Associated Symptoms */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      3. Associated Symptoms & Concerns
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      {doctorSummaryData.associated_symptoms.map((as, idx) => (
                        <li key={idx}>{as}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. User Medical Context */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      4. User-Provided Context & History
                    </span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {doctorSummaryData.user_medical_context}
                    </p>
                  </div>

                  {/* 5. Questions for Doctor */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block text-teal-800">
                      5. Recommended Questions to Ask Your Doctor
                    </span>
                    <div className="space-y-1.5">
                      {doctorSummaryData.questions_for_doctor.map((q, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-100 rounded-xl flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-800">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Missing Clinical Information */}
                  <div className="space-y-1.5 bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
                    <span className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      6. Information Missing from Chat (To Tell Doctor)
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px] mt-1">
                      {doctorSummaryData.missing_information.map((m, idx) => (
                        <li key={idx}><span className="font-bold">[NOT SPECIFIED]:</span> {m}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Disclaimer: This document is an informational consultation guide prepared from patient inputs. It does not replace clinical evaluation or diagnostic lab tests.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setIsDoctorSummaryOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    copiedSummary
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                  }`}
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Clear Chat Confirmation */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Clear Conversation?</h3>
                <p className="text-xs text-slate-500">Reset symptoms and start a fresh session</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to clear this symptom conversation? Your current triage results and discussion history will be reset.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearChat}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-md shadow-rose-600/20"
              >
                Yes, Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
