import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  ShieldAlert,
  UserCheck,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  Award,
  Phone,
  Mail,
} from 'lucide-react';
import { AppLanguage, DoctorRegistration, DoctorVerificationStatus } from '../types';
import { fetchDoctorRegistrations, registerDoctor, verifyDoctorRegistration } from '../services/api';

interface DoctorRegistrationViewProps {
  language: AppLanguage;
  onNavigateToDoctors?: () => void;
}

export const DoctorRegistrationView: React.FC<DoctorRegistrationViewProps> = ({
  language,
  onNavigateToDoctors,
}) => {
  const [registrations, setRegistrations] = useState<DoctorRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portal' | 'register' | 'directory'>('portal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState('');
  const [stateMedicalCouncil, setStateMedicalCouncil] = useState('Telangana State Medical Council');
  const [registrationYear, setRegistrationYear] = useState<number>(2014);
  const [qualifications, setQualifications] = useState('MBBS, MD (General Medicine)');
  const [primarySpecialty, setPrimarySpecialty] = useState('General Physician');
  const [subSpecialtiesText, setSubSpecialtiesText] = useState('Preventive Health, Chronic Disease');
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [currentHospitalOrClinic, setCurrentHospitalOrClinic] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(500);
  const [isRetired, setIsRetired] = useState(false);
  const [teleconsultationAdvisoryOnly, setTeleconsultationAdvisoryOnly] = useState(false);
  const [documentName, setDocumentName] = useState<string>('state_council_registration.pdf');
  const [hasAgreedToEthics, setHasAgreedToEthics] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDoctorRegistrations();
      setRegistrations(data);
    } catch (e) {
      console.warn('Failed to fetch doctor registrations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !medicalCouncilNumber || !primarySpecialty) return;
    if (!hasAgreedToEthics) {
      alert('Please agree to the Telemedicine Practice Guidelines & Code of Ethics.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const subSpecialties = subSpecialtiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await registerDoctor({
        fullName,
        email,
        phone,
        medicalCouncilNumber,
        stateMedicalCouncil,
        registrationYear,
        qualifications,
        primarySpecialty,
        subSpecialties,
        experienceYears,
        currentHospitalOrClinic: currentHospitalOrClinic || (isRetired ? 'Retired Senior Practice (Advisory)' : 'Independent Clinic'),
        consultationFee,
        isRetired,
        teleconsultationAdvisoryOnly: isRetired ? true : teleconsultationAdvisoryOnly,
        documentName,
      });

      setRegistrations((prev) => [created, ...prev]);
      setSuccessMessage('Doctor credentials submitted successfully! Application is queued for NMC registry verification.');
      setActiveTab('portal');
      // Reset form
      setFullName('');
      setMedicalCouncilNumber('');
      setCurrentHospitalOrClinic('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCheck = async (id: string) => {
    setVerifyingId(id);
    try {
      const updated = await verifyDoctorRegistration(id, 'verified');
      setRegistrations((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      alert('Failed to execute NMC verification check');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.medicalCouncilNumber.toLowerCase().includes(q) ||
      r.primarySpecialty.toLowerCase().includes(q) ||
      r.stateMedicalCouncil.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: DoctorVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Practitioner
          </span>
        );
      case 'pending_verification':
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending NMC Audit
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
            <BadgeCheck className="w-4 h-4 text-emerald-300" />
            <span>National Medical Commission (NMC) & State Council Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'te' ? 'వైద్యుల నమోదు & ధృవీకరణ పోర్టల్' : 'Doctor Registration & Professional Verification Portal'}
          </h1>
          <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
            Onboard certified healthcare practitioners, verify medical council registrations, support retired senior clinicians for teleconsultation advisories, and safeguard clinical standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('register')}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-md transition transform hover:scale-105 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Register as Doctor</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('portal');
              loadData();
            }}
            className="bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-400/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Audit Log</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('portal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'portal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Credential Registry ({registrations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>New Doctor Application</span>
        </button>
      </div>

      {/* VIEW 1: Credential Registry & Verification Manager */}
      {activeTab === 'portal' && (
        <div className="space-y-6">
          {/* Search bar & filter stats */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Doctor name, Council registration number, or Specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                Verified: {registrations.filter((r) => r.verificationStatus === 'verified').length}
              </span>
              <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                Pending: {registrations.filter((r) => r.verificationStatus !== 'verified').length}
              </span>
            </div>
          </div>

          {/* Cards List */}
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading verified practitioner database...</div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No matching practitioner applications found.</p>
              <button
                onClick={() => setActiveTab('register')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition"
              >
                Register a new doctor now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRegistrations.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 font-black text-lg flex items-center justify-center border border-emerald-200 shrink-0">
                          {doc.fullName.replace(/Dr\.\s*/i, '').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">{doc.fullName}</h3>
                            {doc.isRetired && (
                              <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md" title="Retired Senior Clinician - Secondary Opinion & Teleconsultation Advisory">
                                Retired Specialist
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 font-bold">{doc.primarySpecialty}</p>
                          <p className="text-[11px] text-slate-500">{doc.qualifications}</p>
                        </div>
                      </div>
                      <div>{getStatusBadge(doc.verificationStatus)}</div>
                    </div>

                    {/* Registration details */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Medical Council Reg #:</span>
                        <span className="font-mono font-bold text-slate-800">{doc.medicalCouncilNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">State Council:</span>
                        <span className="font-medium text-slate-800">{doc.stateMedicalCouncil}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Experience & Year:</span>
                        <span className="font-medium text-slate-800">{doc.experienceYears} Years (Reg. {doc.registrationYear})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Hospital / Practice:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[200px]" title={doc.currentHospitalOrClinic}>
                          {doc.currentHospitalOrClinic}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500 font-medium">Consultation Fee:</span>
                        <span className="font-bold text-emerald-700">₹{doc.consultationFee} / session</span>
                      </div>
                    </div>

                    {/* Audit Trail */}
                    {doc.auditNotes && doc.auditNotes.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification Audit Notes</p>
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 space-y-1">
                          {doc.auditNotes.slice(0, 3).map((note, idx) => (
                            <p key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold mt-0.5">•</span>
                              <span>{note}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{doc.documentName || 'license.pdf'}</span>
                    </div>

                    {doc.verificationStatus !== 'verified' ? (
                      <button
                        onClick={() => handleVerifyCheck(doc.id)}
                        disabled={verifyingId === doc.id}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        {verifyingId === doc.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying NMC...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Run NMC Check</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>NMC Certified</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Doctor Onboarding Form */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Healthcare Practitioner Registration</h2>
            <p className="text-xs text-slate-500">
              Submit your medical qualifications for verification against the National Medical Commission (NMC) Registry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Senior / Retired Doctor Toggle */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-2xl flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span className="font-extrabold text-sm text-purple-950">Retired Senior Clinician Mode</span>
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Are you a retired professor, senior specialist, or medical director? Register to provide high-value secondary opinions, diagnostic reviews, and preventive advisory sessions.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isRetired}
                  onChange={(e) => {
                    setIsRetired(e.target.checked);
                    if (e.target.checked) setTeleconsultationAdvisoryOnly(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name (with title) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajeshwar Rao, MD"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Specialty *</label>
                <select
                  value={primarySpecialty}
                  onChange={(e) => setPrimarySpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="General Physician">General Physician / Internal Medicine</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Gynecologist">Gynecologist & Obstetrician</option>
                  <option value="Endocrinologist">Endocrinologist & Diabetologist</option>
                  <option value="Psychiatrist">Psychiatrist & Behavioral Health</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="doctor@hospital.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Medical Council & Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medical Council Registration # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS-MC-2014-9821"
                  value={medicalCouncilNumber}
                  onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State Medical Council *</label>
                <select
                  value={stateMedicalCouncil}
                  onChange={(e) => setStateMedicalCouncil(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Telangana State Medical Council">Telangana State Medical Council</option>
                  <option value="Andhra Pradesh Medical Council">Andhra Pradesh Medical Council</option>
                  <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                  <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                  <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                  <option value="Delhi Medical Council">Delhi Medical Council</option>
                  <option value="National Medical Commission">National Medical Commission (Direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications & Degrees</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD, DM, FRCP"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Year</label>
                <input
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={registrationYear}
                  onChange={(e) => setRegistrationYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Experience (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min="100"
                  max="3000"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Hospital Affiliation or Clinic Name</label>
                <input
                  type="text"
                  placeholder={isRetired ? "e.g. Emeritus Clinical Advisor / Retired Practice" : "e.g. Apollo Health City, Jubilee Hills"}
                  value={currentHospitalOrClinic}
                  onChange={(e) => setCurrentHospitalOrClinic(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">State Medical Council Certificate / Degree Copy</p>
                  <p className="text-[11px] text-slate-500">PDF, JPG, or PNG up to 10MB</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {documentName}
              </span>
            </div>

            {/* Telemedicine Code of Ethics */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={hasAgreedToEthics}
                  onChange={(e) => setHasAgreedToEthics(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I hereby certify that my medical council registration is valid and in good standing. I agree to abide by the <strong>Telemedicine Practice Guidelines (2020)</strong> under the National Medical Commission Act, maintaining patient confidentiality, transparent fee disclosure, and clinical record keeping.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('portal')}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit for NMC Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
