import React, { useState } from 'react';
import {
  UserCheck,
  Star,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Search,
  Filter,
  Video,
  CheckCircle2,
  X,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Appointment, AppLanguage, Doctor } from '../types';
import { VETTED_DOCTORS } from '../data/sampleScenarios';

interface DoctorDirectoryViewProps {
  language: AppLanguage;
  preselectedSpecialty?: string | null;
  onBookAppointment: (appointment: Appointment) => void;
  onNavigateToAppointments: () => void;
}

export const DoctorDirectoryView: React.FC<DoctorDirectoryViewProps> = ({
  language,
  preselectedSpecialty,
  onBookAppointment,
  onNavigateToAppointments,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    preselectedSpecialty || 'All'
  );
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [consultType, setConsultType] = useState<'in-clinic' | 'video'>('in-clinic');
  const [consultReason, setConsultReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  const specialties = [
    'All',
    'Cardiologist',
    'General Physician',
    'Endocrinologist',
    'Neurologist',
    'Pediatrician',
    'Gastroenterologist',
  ];

  const filteredDoctors = VETTED_DOCTORS.filter((doc) => {
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch =
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.hospitalAffiliation.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleOpenBooking = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setSelectedTimeSlot(doctor.timeSlots[0] || '10:00 AM');
    setBookingSuccess(null);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForBooking || !patientName.trim() || !patientPhone.trim()) return;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      doctorId: selectedDoctorForBooking.id,
      doctorName: selectedDoctorForBooking.name,
      specialty: selectedDoctorForBooking.specialty,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      date: appointmentDate,
      timeSlot: selectedTimeSlot,
      type: consultType,
      reason: consultReason.trim() || 'General health consultation',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    onBookAppointment(newAppointment);
    setBookingSuccess(newAppointment);
    setPatientName('');
    setPatientPhone('');
    setConsultReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <UserCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {language === 'te' ? 'నిపుణులైన వైద్యుల డైరెక్టరీ & అపాయింట్‌మెంట్స్' : 'Verified Clinical Specialists Directory'}
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {language === 'te'
                ? 'మీ ట్రయేజ్ లేదా ల్యాబ్ ఫలితాల ఆధారంగా సరైన సూపర్-స్పెషలిస్ట్‌ను ఎంచుకోండి. క్లినిక్ లేదా వీడియో కన్సల్టేషన్ బుక్ చేసుకోండి.'
                : 'Directly schedule appointments with board-certified physicians matching your AI Copilot symptom triage or lab report findings.'}
            </p>
          </div>

          <button
            onClick={onNavigateToAppointments}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition self-start md:self-auto"
          >
            <Calendar className="w-4 h-4" />
            <span>View My Appointments</span>
          </button>
        </div>

        {/* Search & Specialty Filter */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              placeholder="Search by doctor name, specialty, or hospital affiliation..."
              className="w-full bg-slate-800/90 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Specialty Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                  selectedSpecialty.toLowerCase() === spec.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specialty Filter notice if navigated from Copilot */}
      {preselectedSpecialty && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">AI Copilot Recommendation:</span>
            <span className="bg-indigo-700 text-white font-semibold px-2 py-0.5 rounded-md">
              {preselectedSpecialty}
            </span>
          </div>
          <button
            onClick={() => setSelectedSpecialty('All')}
            className="text-indigo-700 font-bold hover:underline"
          >
            Show All Doctors
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {doctor.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                    {doctor.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {doctor.qualifications}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>{doctor.rating}</span>
                    </div>
                    <span className="text-slate-400">({doctor.reviewCount} reviews)</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">{doctor.experienceYears} yrs exp</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.hospitalAffiliation}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {doctor.bio}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{doctor.consultationFee}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Next: Tomorrow ({doctor.timeSlots[0]})
              </span>
              <button
                onClick={() => handleOpenBooking(doctor)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Schedule Consultation</h3>
                  <p className="text-xs text-slate-300">
                    {selectedDoctorForBooking.name} ({selectedDoctorForBooking.specialty})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctorForBooking(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Appointment Confirmed!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your appointment reference <span className="font-mono font-bold text-slate-800">#{bookingSuccess.id.slice(-6).toUpperCase()}</span> has been confirmed.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs text-left text-slate-700 space-y-1.5 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-bold">{bookingSuccess.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Slot:</span>
                    <span className="font-bold">{bookingSuccess.date} at {bookingSuccess.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode:</span>
                    <span className="capitalize font-semibold text-indigo-700">{bookingSuccess.type} Consultation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-bold">{bookingSuccess.patientName} ({bookingSuccess.patientPhone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedDoctorForBooking(null);
                      onNavigateToAppointments();
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs"
                  >
                    View All Appointments
                  </button>
                  <button
                    onClick={() => setSelectedDoctorForBooking(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-6 space-y-4 text-xs">
                {/* Consultation Type Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Consultation Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultType('in-clinic')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition ${
                        consultType === 'in-clinic'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>In-Clinic Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultType('video')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition ${
                        consultType === 'video'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Teleconsult</span>
                    </button>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Date & Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Available Slot</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs bg-white"
                    >
                      {selectedDoctorForBooking.timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chief Complaint / Reason */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Visit / Symptoms</label>
                  <input
                    type="text"
                    value={consultReason}
                    onChange={(e) => setConsultReason(e.target.value)}
                    placeholder="Brief description of concerns or follow-up reason..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs"
                  />
                </div>

                {/* Summary & Submit */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Fee Due At Clinic:</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{selectedDoctorForBooking.consultationFee}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-md shadow-indigo-600/20"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
