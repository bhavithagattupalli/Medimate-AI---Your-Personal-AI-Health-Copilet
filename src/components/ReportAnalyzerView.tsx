import React, { useState } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Info,
  Layers,
  MapPin,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { AppLanguage, ReportAnalysisResult, ReportTestItem } from '../types';
import { analyzeReportFile } from '../services/api';
import { SYNTHETIC_SAMPLE_REPORTS } from '../data/sampleScenarios';

interface ReportAnalyzerViewProps {
  language: AppLanguage;
  onSendToCopilot: (reportSummary: string) => void;
  onNavigateToNearbyCare: (specialty?: string) => void;
  onSaveReportResult: (result: ReportAnalysisResult) => void;
}

export const ReportAnalyzerView: React.FC<ReportAnalyzerViewProps> = ({
  language,
  onSendToCopilot,
  onNavigateToNearbyCare,
  onSaveReportResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'explanation' | 'questions'>('tests');

  // Manual test text input fallback
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a PDF, PNG, JPG, or WEBP medical report.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);

    // Convert file to base64 and auto-analyze
    await processFileForAnalysis(file);
  };

  const processFileForAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const base64Data = await convertFileToBase64(file);
      const result = await analyzeReportFile({
        fileData: base64Data,
        mimeType: file.type,
        language,
      });

      result.fileName = file.name;
      setAnalysisResult(result);
      onSaveReportResult(result);
    } catch (err: any) {
      console.error('Report analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze medical report. Please verify image clarity and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!manualText.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeReportFile({
        textContent: manualText,
        language,
      });
      result.fileName = 'Manual Lab Entry';
      setAnalysisResult(result);
      onSaveReportResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze text data.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:image/...;base64, prefix
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLoadSampleReport = (sample: (typeof SYNTHETIC_SAMPLE_REPORTS)[0]) => {
    setAnalysisResult(sample.data);
    setSelectedFile(null);
    setErrorMessage(null);
    onSaveReportResult(sample.data);
  };

  const renderStatusBadge = (status: ReportTestItem['status']) => {
    switch (status) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-red-200">
            ▲ HIGH
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
            ▼ LOW
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md animate-pulse">
            CRITICAL
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
            ✓ Normal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
            Review
          </span>
        );
    }
  };

  // Connected flow action: Pass extracted lab report summary to AI Copilot
  const handleDiscussInCopilot = () => {
    if (!analysisResult) return;
    const testList = analysisResult.tests
      .map((t) => `- ${t.name}: ${t.result} ${t.unit} (Ref: ${t.reference_range}) -> Status: ${t.status.toUpperCase()}`)
      .join('\n');
    const fullSummary = `Lab Report from: ${analysisResult.laboratory_name || 'Diagnostics'}\nDate: ${
      analysisResult.report_date || 'Recent'
    }\nSummary: ${analysisResult.summary}\nKey Tests:\n${testList}\nSuggested Specialty: ${
      analysisResult.suggested_specialist
    }`;
    onSendToCopilot(fullSummary);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <FileCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {language === 'te' ? 'AI మెడికల్ రిపోర్ట్ అనలైజర్ & OCR' : 'AI Medical Report Analyzer & OCR'}
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              {language === 'te'
                ? 'ల్యాబ్ నివేదికలను (PDF లేదా ఫోటో) అప్‌లోడ్ చేయండి. ప్రతి పరీక్ష ఫలితాన్ని, సూచన పరిమితులను సులభమైన తెలుగు లేదా ఆంగ్లంలో వివరిస్తాము.'
                : 'Upload diagnostic lab reports (PDF, PNG, JPG). MediMate extracts exact test values, flags abnormalities against reference ranges, and explains them in plain language.'}
            </p>
          </div>

          {analysisResult && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscussInCopilot}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discuss with Copilot</span>
              </button>
              <button
                onClick={() => onNavigateToNearbyCare(analysisResult.suggested_specialist)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>Find Nearby Care</span>
              </button>
            </div>
          )}
        </div>

        {/* Preset Sample Reports for instant Hackathon Testing */}
        <div className="mt-5 pt-4 border-t border-teal-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            {language === 'te' ? 'పరీక్షించడానికి నమూనా ల్యాబ్ రిపోర్టులు:' : 'Quick Demo Lab Reports (Click to evaluate):'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
            {SYNTHETIC_SAMPLE_REPORTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSampleReport(sample)}
                className="text-left bg-slate-800/80 hover:bg-slate-700/90 border border-emerald-500/30 hover:border-emerald-400 p-2.5 rounded-xl transition group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-0.5">
                  <span className="truncate">{sample.label}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">{sample.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone & Manual Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* File Upload Box */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 p-6 text-center transition group relative cursor-pointer shadow-xs">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              disabled={isAnalyzing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {language === 'te' ? 'ల్యాబ్ రిపోర్ట్ అప్‌లోడ్ చేయండి' : 'Upload Diagnostic Report'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, PNG, JPG, or WEBP (Max 10MB)
            </p>
            <div className="mt-3 inline-block bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition">
              Browse Document
            </div>
            {selectedFile && (
              <div className="mt-3 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Privacy & OCR Disclaimer */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Minimization & Privacy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Patient personal identifiers (names, IDs, phone numbers) are automatically redacted before analysis. No sensitive health files are sold or used for ad targeting.
            </p>
          </div>

          {/* Manual text entry accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
            >
              <span>Paste Test Values Manually</span>
              <ChevronDown className={`w-4 h-4 transition ${showManualInput ? 'rotate-180' : ''}`} />
            </button>
            {showManualInput && (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="e.g.: Hemoglobin: 10.2 g/dL (Ref: 12-15), Glucose Fasting: 145 mg/dL (Ref: 70-100)..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
                <button
                  onClick={handleManualAnalyze}
                  disabled={!manualText.trim() || isAnalyzing}
                  className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold py-2 rounded-xl transition"
                >
                  Analyze Pasted Values
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Analysis Output */}
        <div className="lg:col-span-2">
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Processing Report with Gemini OCR</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Extracting clinical tests, identifying reference ranges, and generating patient-friendly explanations in {language === 'te' ? 'Telugu' : 'English'}...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-700 space-y-2 mb-4">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Report Analysis Notice</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
              <h3 className="font-bold text-slate-700 text-sm">No Medical Report Loaded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload your pathology report or select one of the ready demo panels above to view extracted tests, reference thresholds, and clinical guidance.
              </p>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              {/* Report Header Overview */}
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Report Metadata
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {analysisResult.laboratory_name || 'Laboratory Diagnostic Report'}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Date: {analysisResult.report_date || 'Current'}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        {analysisResult.tests.length} Parameters Extracted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Urgency:</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        analysisResult.overall_urgency === 'urgent'
                          ? 'bg-red-600 text-white animate-pulse'
                          : analysisResult.overall_urgency === 'consult_doctor'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {analysisResult.overall_urgency === 'urgent'
                        ? 'Urgent Review'
                        : analysisResult.overall_urgency === 'consult_doctor'
                        ? 'Consult Doctor'
                        : 'Routine Checkup'}
                    </span>
                  </div>
                </div>

                {/* Plain language summary box */}
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed shadow-inner">
                  <span className="font-bold text-slate-900 block mb-1">
                    {language === 'te' ? 'ల్యాబ్ ఫలితాల సారాంశం (Plain Telugu):' : 'Key Clinical Findings:'}
                  </span>
                  {analysisResult.summary}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-5 flex items-center space-x-2 border-b border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`py-2 px-3 border-b-2 transition ${
                    activeTab === 'tests'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Extracted Tests ({analysisResult.tests.length})
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`py-2 px-3 border-b-2 transition ${
                    activeTab === 'questions'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Questions for Your Doctor ({analysisResult.questions_for_doctor?.length || 0})
                </button>
              </div>

              {/* Tab 1: Extracted Tests Table */}
              {activeTab === 'tests' && (
                <div className="p-5 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Test Name</th>
                        <th className="py-2.5 px-3">Result & Unit</th>
                        <th className="py-2.5 px-3">Reference Range</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">What it Measures</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysisResult.tests.map((test, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {test.name}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {test.result} {test.unit}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {test.reference_range || '—'}
                          </td>
                          <td className="py-3 px-3">{renderStatusBadge(test.status)}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs text-[11px]">
                            <p>{test.what_it_measures}</p>
                            {test.clinical_significance && (
                              <p className="text-slate-400 text-[10px] mt-0.5">
                                {test.clinical_significance}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Questions for Doctor */}
              {activeTab === 'questions' && (
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    {language === 'te'
                      ? 'ఈ ప్రశ్నలను మీ తదుపరి వైద్య సంప్రదింపుల్లో మీ వైద్యుడితో చర్చించండి:'
                      : 'Take these specific, tailored questions to your physician to maximize your clinical consultation:'}
                  </p>
                  <div className="space-y-2">
                    {analysisResult.questions_for_doctor?.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 flex items-start gap-2.5"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Connected Workflow Actions */}
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Recommended Next Step: </span>
                  Consult {analysisResult.suggested_specialist || 'General Physician'}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDiscussInCopilot}
                    className="flex-1 sm:flex-initial bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask AI Copilot About These Findings</span>
                  </button>

                  <button
                    onClick={() => onNavigateToNearbyCare(analysisResult.suggested_specialist)}
                    className="flex-1 sm:flex-initial bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Find Specialist Nearby</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
