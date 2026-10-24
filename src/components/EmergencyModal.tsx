import React from 'react';
import {
  AlertOctagon,
  PhoneCall,
  X,
  MapPin,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  Ambulance,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { useEmergencyCall } from '../hooks/useEmergencyCall';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onNavigateToHospitals: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateToHospitals,
}) => {
  const {
    isCalling,
    callingNumber,
    permissionNotice,
    clearPermissionNotice,
    callAmbulance108,
    callEmergency112,
  } = useEmergencyCall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'te' ? 'అత్యవసర వైద్య ప్రోటోకాల్' : 'Emergency Medical Protocol'}
              </h2>
              <p className="text-xs text-rose-100">
                {language === 'te' ? 'తక్షణ చర్య అవసరం' : 'Immediate Clinical Action Required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Permission notice banner if direct calling was blocked */}
          {permissionNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{permissionNotice}</span>
              </div>
              <button
                onClick={clearPermissionNotice}
                className="text-amber-700 hover:text-amber-900 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 space-y-1">
              <p className="font-semibold text-rose-900">
                {language === 'te'
                  ? 'తీవ్రమైన ప్రమాద సంకేతాలు ఉన్నప్పుడు AI సంభాషణను ఆపివేయండి:'
                  : 'Stop AI conversation and seek urgent care if you experience:'}
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-rose-800">
                <li>
                  {language === 'te'
                    ? 'తీవ్రమైన ఛాతీ ఒత్తిడి లేదా ఎడమ చేతికి వ్యాపించే నొప్పి'
                    : 'Crushing chest tightness radiating to arm, jaw, or back'}
                </li>
                <li>
                  {language === 'te'
                    ? 'శ్వాస తీసుకోవడంలో తీవ్రమైన ఇబ్బంది లేదా ఊపిరాడకపోవడం'
                    : 'Severe difficulty breathing or blue lips/fingertips'}
                </li>
                <li>
                  {language === 'te'
                    ? 'ముఖం వంగిపోవడం, ఒకవైపు తిమ్మిరి లేదా మాట ముద్దబడటం (పక్షవాతం)'
                    : 'Sudden facial droop, arm weakness, or slurred speech (Stroke)'}
                </li>
                <li>
                  {language === 'te'
                    ? 'అకస్మాత్తుగా స్పృహ కోల్పోవడం లేదా అపస్మారక స్థితి'
                    : 'Sudden collapse, loss of consciousness, or severe head trauma'}
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Call Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={(e) => callAmbulance108(e)}
              disabled={isCalling}
              className={`flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3.5 px-4 rounded-xl font-black text-sm shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                isCalling && callingNumber === '108' ? 'ring-2 ring-red-400 animate-pulse' : ''
              }`}
            >
              {isCalling && callingNumber === '108' ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Ambulance className="w-5 h-5 text-white animate-bounce" />
              )}
              <span>
                {isCalling && callingNumber === '108'
                  ? 'Connecting 108...'
                  : language === 'te'
                  ? '108 అంబులెన్స్‌కు కాల్ చేయండి'
                  : language === 'hi'
                  ? '108 एम्बुलेंस को कॉल करें'
                  : language === 'ta'
                  ? '108 அவசர ஊர்தி (அழைக்கவும்)'
                  : language === 'kn'
                  ? '108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ'
                  : 'Call 108 (Ambulance)'}
              </span>
            </button>

            <button
              onClick={(e) => callEmergency112(e)}
              disabled={isCalling}
              className={`flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                isCalling && callingNumber === '112' ? 'ring-2 ring-slate-400 animate-pulse' : ''
              }`}
            >
              {isCalling && callingNumber === '112' ? (
                <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
              ) : (
                <PhoneCall className="w-5 h-5 text-rose-400" />
              )}
              <span>
                {isCalling && callingNumber === '112'
                  ? 'Connecting 112...'
                  : language === 'te'
                  ? '112 కి కాల్ చేయండి'
                  : language === 'hi'
                  ? '112 राष्ट्रीय हेल्पलाइन'
                  : language === 'ta'
                  ? '112 அவசர உதவி'
                  : language === 'kn'
                  ? '112 ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ'
                  : 'Call 112 (Unified Emergency)'}
              </span>
            </button>
          </div>

          {/* Find nearest ER Hospital */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToHospitals();
              }}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl text-xs font-semibold transition"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>
                  {language === 'te'
                    ? 'సమీపంలోని 24/7 ఎమర్జెన్సీ ఆసుపత్రులను మ్యాప్‌లో చూడండి'
                    : language === 'hi'
                    ? 'नजदीकी 24/7 आपातकालीन अस्पतालों को मानचित्र पर देखें'
                    : language === 'ta'
                    ? 'அருகிலுள்ள 24/7 அவசர சிகிச்சை மருத்துவமனைகளைக் கண்டறியவும்'
                    : language === 'kn'
                    ? 'ಹತ್ತಿರದ 24/7 ತುರ್ತು ಆಸ್ಪತ್ರೆಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ'
                    : 'View Nearby 24/7 Emergency Hospitals on Map'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>

            <p className="text-[11px] text-center text-slate-500 italic">
              {language === 'te'
                ? 'గమనిక: మీ స్వంతంగా డ్రైవ్ చేయవద్దు. ఎల్లప్పుడూ 108 అంబులెన్స్ లేదా ఇతరుల సహాయం తీసుకోండి.'
                : language === 'hi'
                ? 'सुरक्षा नियम: आपात स्थिति में स्वयं वाहन न चलाएं। 108 एम्बुलेंस या आपातकालीन सहायता का अनुरोध करें।'
                : language === 'ta'
                ? 'பாதுகாப்பு விதி: அவசர நிலையில் நீங்களே வாகனம் ஓட்ட வேண்டாம். 108 ஆம்புலன்ஸை அழைக்கவும்.'
                : language === 'kn'
                ? 'ಸುರಕ್ಷತಾ ನಿಯಮ: ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ನೀವೇ ವಾಹನ ಚಲಾಯಿಸಬೇಡಿ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಹಾಯ ಪಡೆಯಿರಿ.'
                : 'Safety rule: Never drive yourself to an emergency department. Request a 108 ambulance or emergency escort.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
