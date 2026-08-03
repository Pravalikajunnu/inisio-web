import React, { useState } from 'react';
import { INDUSTRIES } from '../data/landingData';
import { AssessmentData, AssessmentResult, getFeasibilityTerm } from '../types';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Download,
  PhoneCall,
  Clock,
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIndustry?: string;
  onOpenConsultation: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  defaultIndustry = '',
  onOpenConsultation
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<AssessmentData>({
    industry: defaultIndustry || '',
    projectCostCr: 25,
    equityPercent: 25,
    landStatus: 'owned',
    promoterExpYears: 8,
    locationState: '',
    dprReady: false,
    targetBankType: 'PSU'
  });

  React.useEffect(() => {
    if (defaultIndustry) {
      setFormData(prev => ({ ...prev, industry: defaultIndustry }));
    }
  }, [defaultIndustry]);

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [applicantInfo, setApplicantInfo] = useState({
    fullName: '',
    mobile: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleDownloadPDFReport = () => {
    const loanAmt = formData.projectCostCr * (1 - formData.equityPercent / 100);
    const pdfData: TeaserPDFData = {
      fullName: applicantInfo.fullName || 'Promoter',
      mobile: applicantInfo.mobile || 'Not Provided',
      email: applicantInfo.email || 'Not Provided',
      projectName: `${formData.industry} Greenfield Project`,
      industry: formData.industry,
      location: formData.locationState || 'India',
      totalCostCr: formData.projectCostCr,
      promoterContribCr: parseFloat(((formData.projectCostCr * formData.equityPercent) / 100).toFixed(2)),
      loanRequiredCr: parseFloat(loanAmt.toFixed(2)),
      landStatus: formData.landStatus === 'owned' ? 'Owned & Registered' : formData.landStatus === 'identified' ? 'Identified / MoU' : 'Not Acquired',
      promoterExp: `${formData.promoterExpYears}+ Years Experience`,
      description: `Targeting ${formData.targetBankType} bank financing for ${formData.industry} project in ${formData.locationState || 'India'}.`,
      feasibilityScore: result?.feasibilityScore || 85,
      bankabilityRating: result?.bankabilityGrade || 'A+',
      estimatedLoan: result?.maxLoanAmountCr || loanAmt.toFixed(2),
      eqPct: formData.equityPercent,
      debtPct: 100 - formData.equityPercent,
      dscrEstimate: result?.dscrEstimate || 1.45,
      estInterestRate: result?.estInterestRate || '8.85% - 9.40%',
      strengthPoints: result?.strengthPoints,
      keyRisks: result?.keyRisks
    };

    // 1. Download PDF Document
    generateProjectTeaserPDF(pdfData);

    // 2. Open WhatsApp Lead Notification to Admin (6302026462)
    setTimeout(() => {
      sendLeadToWhatsApp(pdfData, '916302026462');
    }, 500);
  };

  const handleSendWhatsAppDirect = () => {
    const loanAmt = formData.projectCostCr * (1 - formData.equityPercent / 100);
    const pdfData: TeaserPDFData = {
      fullName: applicantInfo.fullName || 'Promoter',
      mobile: applicantInfo.mobile || 'Not Provided',
      email: applicantInfo.email || 'Not Provided',
      projectName: `${formData.industry} Greenfield Project`,
      industry: formData.industry,
      location: formData.locationState || 'India',
      totalCostCr: formData.projectCostCr,
      promoterContribCr: parseFloat(((formData.projectCostCr * formData.equityPercent) / 100).toFixed(2)),
      loanRequiredCr: parseFloat(loanAmt.toFixed(2)),
      landStatus: formData.landStatus === 'owned' ? 'Owned & Registered' : formData.landStatus === 'identified' ? 'Identified / MoU' : 'Not Acquired',
      promoterExp: `${formData.promoterExpYears}+ Years Experience`,
      description: `Targeting ${formData.targetBankType} bank financing in ${formData.locationState || 'India'}.`,
      feasibilityScore: result?.feasibilityScore || 85,
      bankabilityRating: result?.bankabilityGrade || 'A+',
      estimatedLoan: result?.maxLoanAmountCr || loanAmt.toFixed(2),
      eqPct: formData.equityPercent,
      debtPct: 100 - formData.equityPercent
    };
    sendLeadToWhatsApp(pdfData, '916302026462');
  };

  const calculateAssessment = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Calculate realistic Bankability & Feasibility metrics
      const equityAmount = (formData.projectCostCr * formData.equityPercent) / 100;
      const loanAmount = formData.projectCostCr - equityAmount;

      // Base feasibility calculation
      let score = 70;
      if (formData.equityPercent >= 25) score += 12;
      else if (formData.equityPercent >= 20) score += 6;

      if (formData.landStatus === 'owned') score += 10;
      else if (formData.landStatus === 'identified') score += 5;

      if (formData.promoterExpYears >= 5) score += 8;

      if (formData.dprReady) score += 5;

      score = Math.min(score, 98);

      let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' = 'A+';
      if (score >= 90) grade = 'A+';
      else if (score >= 82) grade = 'A';
      else if (score >= 75) grade = 'B+';
      else if (score >= 65) grade = 'B';
      else grade = 'C';

      // Estimated DSCR calculation
      const dscr = parseFloat((1.35 + (score - 70) * 0.015).toFixed(2));
      const payback = parseFloat((4.5 + (100 - score) * 0.05).toFixed(1));

      setResult({
        feasibilityScore: score,
        bankabilityGrade: grade,
        maxLoanAmountCr: parseFloat(loanAmount.toFixed(2)),
        estInterestRate: formData.targetBankType === 'PSU' ? '8.85% - 9.40%' : '9.20% - 10.10%',
        dscrEstimate: dscr,
        paybackYears: payback,
        keyRisks: [
          formData.equityPercent < 25 ? 'Equity contribution below 25% requires promoter collateral' : 'Standard raw material price sensitivity',
          formData.landStatus !== 'owned' ? 'Land acquisition/NOC timeline requires bank verification' : 'Environmental consent to operate (CTO) pending'
        ],
        strengthPoints: [
          `Strong promoter track record (${formData.promoterExpYears}+ years industry experience)`,
          `Estimated Debt Service Coverage Ratio (${dscr}x) comfortably exceeds bank threshold of 1.35x`,
          `High sector alignment in ${formData.locationState}`
        ]
      });

      setIsCalculating(false);
      setStep(4); // Result step
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-emerald-glow">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                Project Assessment Engine v4.2
              </span>
              <h3 className="font-display font-bold text-xl text-gray-900">
                Greenfield Feasibility & Bankability Calculator
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        {step < 4 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Step 0{step} of 03: {step === 1 ? 'Industry & Location' : step === 2 ? 'Capex & Equity' : 'Promoter & Bank Preferences'}</span>
              <span className="text-emerald-700 font-bold">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-2 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 1: Industry & Location */}
        {step === 1 && (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Select Your Project Sector / Industry:
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className={`w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer ${
                  formData.industry ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <option value="" disabled hidden>Select Industry or Sector</option>
                {Array.from(new Set(INDUSTRIES.map(i => i.category))).map(cat => (
                  <optgroup key={cat} label={`── ${cat} ──`}>
                    {INDUSTRIES.filter(i => i.category === cat).map(ind => (
                      <option key={ind.id} value={ind.name}>{ind.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Target Project State / Location:
              </label>
              <select
                value={formData.locationState}
                onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                <option value="">-- Select Target Project State / Location --</option>
                {['Gujarat', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Telangana', 'Madhya Pradesh', 'Haryana', 'West Bengal', 'Odisha'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (!formData.industry) {
                  alert('Please select your project sector / industry.');
                  return;
                }
                if (!formData.locationState) {
                  alert('Please select target project state / location.');
                  return;
                }
                setStep(2);
              }}
              className="w-full py-3.5 px-4 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Capex & Financials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Capex & Equity */}
        {step === 2 && (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-900">
                <span>Estimated Total Project Capex (Land + Machinery + Construction):</span>
                <span className="text-emerald-700 text-sm">₹ {formData.projectCostCr} Crore</span>
              </div>
              <input
                type="range"
                min="3"
                max="300"
                step="1"
                value={formData.projectCostCr}
                onChange={(e) => setFormData({ ...formData, projectCostCr: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>₹3 Cr</span>
                <span>₹150 Cr</span>
                <span>₹300 Cr</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-900">
                <span>Promoter Equity Contribution %:</span>
                <span className="text-emerald-700 text-sm">{formData.equityPercent}% (₹{((formData.projectCostCr * formData.equityPercent) / 100).toFixed(2)} Cr)</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={formData.equityPercent}
                onChange={(e) => setFormData({ ...formData, equityPercent: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500">
                *PSU Bank norm usually requires min 20% to 25% promoter equity.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Land Availability Status:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'owned', label: 'Land Owned' },
                  { key: 'identified', label: 'Identified / MoU' },
                  { key: 'not_started', label: 'Not Acquired' }
                ].map((ls) => (
                  <button
                    key={ls.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, landStatus: ls.key as any })}
                    className={`py-2.5 px-3 font-semibold rounded-xl border text-center transition-all ${
                      formData.landStatus === ls.key
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 text-xs font-bold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-4 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Promoter Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Promoter & Bank Preferences */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicantInfo.fullName}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={applicantInfo.mobile}
                  onChange={(e) => setApplicantInfo({ ...applicantInfo, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Promoter / Management Experience in Industry:
              </label>
              <select
                value={formData.promoterExpYears}
                onChange={(e) => setFormData({ ...formData, promoterExpYears: Number(e.target.value) })}
                className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value={2}>First-time entrepreneur (&lt; 3 Years)</option>
                <option value={5}>Experienced (3 to 7 Years)</option>
                <option value={10}>Industry Veteran (8+ Years)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Target Banking Institution Category:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'PSU', label: 'PSU Banks (SBI, BoB, PNB)' },
                  { key: 'Private', label: 'Private Banks (HDFC, ICICI)' },
                  { key: 'NBFC', label: 'NBFC / Financial Inst.' }
                ].map((bk) => (
                  <button
                    key={bk.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetBankType: bk.key as any })}
                    className={`py-2.5 px-3 font-semibold rounded-xl border text-center transition-all ${
                      formData.targetBankType === bk.key
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {bk.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 text-xs font-bold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!applicantInfo.fullName.trim() || !applicantInfo.mobile.trim()) {
                    alert('Please enter your Name and Mobile Number to generate report.');
                    return;
                  }
                  calculateAssessment();
                }}
                disabled={isCalculating}
                className="flex-1 py-3.5 px-4 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Underwriting Metrics...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 text-emerald-200" />
                    <span>Generate Bankability Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Live Results Report */}
        {step === 4 && result && (
          <div className="space-y-6 pt-2 animate-in fade-in">
            
            {/* Top Score Summary Banner */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    PROJECT ASSESSMENT SUMMARY
                  </span>
                  <h4 className="font-display font-bold text-lg text-white">{formData.industry}</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">{result.bankabilityGrade}</span>
                  <span className="text-[10px] text-gray-400 block">Bankability Rating</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Feasibility Check</span>
                  <span className="text-xl font-bold text-emerald-400">{getFeasibilityTerm(result.feasibilityScore)}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Eligible Term Loan</span>
                  <span className="text-lg font-bold text-white">₹{result.maxLoanAmountCr} Cr</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Estimated DSCR</span>
                  <span className="text-lg font-bold text-emerald-300">{result.dscrEstimate}x</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Interest Rate Range</span>
                  <span className="text-xs font-bold text-white mt-1 block">{result.estInterestRate}</span>
                </div>
              </div>
            </div>

            {/* Strengths & Risks Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bank Credit Strengths:</span>
                </div>
                <ul className="space-y-1.5 text-emerald-950">
                  {result.strengthPoints.map((sp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600">•</span>
                      <span>{sp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Identified Credit Risks:</span>
                </div>
                <ul className="space-y-1.5 text-amber-950">
                  {result.keyRisks.map((kr, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600">•</span>
                      <span>{kr}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleDownloadPDFReport}
                className="flex-1 py-3 px-3.5 font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Downloads PDF teaser & opens WhatsApp lead chat with admin"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Teaser</span>
              </button>

              <button
                onClick={handleSendWhatsAppDirect}
                className="flex-1 py-3 px-3.5 font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Send details directly to WhatsApp"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Send to WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenConsultation();
                }}
                className="py-3 px-3.5 font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Book Free Call</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
