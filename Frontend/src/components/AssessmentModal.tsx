import React, { useState } from 'react';
import { INDUSTRIES } from '../data/landingData';
import { AssessmentData, AssessmentResult, getFeasibilityTerm } from '../types';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import { LocationDropdowns } from './LocationDropdowns';
import { validateIndianMobileNumber } from '../utils/validation';
import { DetailedRiskProfileForm, DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { calculateComprehensiveRiskScore } from '../utils/underwritingScorer';
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
  MessageSquare,
  Lock,
  Unlock,
  AlertCircle
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
    collateralStatus: 'Freehold (Clear Title)',
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

  // Auto-fill applicant details if logged in
  React.useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('inisio_active_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.email) {
            setApplicantInfo(prev => ({
              fullName: prev.fullName || u.name || '',
              mobile: prev.mobile || u.phone || '',
              email: prev.email || u.email || ''
            }));
          }
        }
      } catch (e) {}
    }
  }, [isOpen]);

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Lock & Risk Profile State
  const [isTeaserUnlocked, setIsTeaserUnlocked] = useState(false);
  const [riskProfileSubmitted, setRiskProfileSubmitted] = useState(false);
  const [riskProfileData, setRiskProfileData] = useState<DetailedRiskProfileData | null>(null);
  const [showRiskProfile, setShowRiskProfile] = useState(false);

  const [applicantInfo, setApplicantInfo] = useState({
    fullName: '',
    mobile: '',
    email: ''
  });
  const [mobileTouched, setMobileTouched] = useState(false);

  const mobileValidation = validateIndianMobileNumber(applicantInfo.mobile);
  const comprehensiveRisk = calculateComprehensiveRiskScore(riskProfileData, result?.feasibilityScore || 85);

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
      keyRisks: result?.keyRisks,
      riskProfileData: riskProfileData || undefined,
      riskScoreOutOf10: comprehensiveRisk.scoreOutOf10
    };

    // 1. Download PDF Document
    generateProjectTeaserPDF(pdfData);
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-blue-glow">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block">
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
              <span className="text-blue-700 font-bold">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300"
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
                className={`w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer ${
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

            <div>
              <LocationDropdowns
                value={formData.locationState}
                onChange={(loc) => setFormData({ ...formData, locationState: loc })}
                required
              />
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
              className="w-full py-3.5 px-4 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                <span className="text-blue-700 text-sm">₹ {formData.projectCostCr} Crore</span>
              </div>
              <input
                type="range"
                min="3"
                max="300"
                step="1"
                value={formData.projectCostCr}
                onChange={(e) => setFormData({ ...formData, projectCostCr: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>₹3 Cr</span>
                <span>₹150 Cr</span>
                <span>₹300 Cr</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-900 leading-tight">
                <span>How much money / equity do you have available for this project? (₹ CR):</span>
                <span className={`text-sm font-bold ${formData.equityPercent >= 20 ? 'text-blue-700' : 'text-rose-700'}`}>
                  {formData.equityPercent}% (₹{((formData.projectCostCr * formData.equityPercent) / 100).toFixed(2)} Cr)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={formData.equityPercent}
                onChange={(e) => setFormData({ ...formData, equityPercent: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                  formData.equityPercent >= 20
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
              >
                <span>
                  {formData.equityPercent >= 20
                    ? '✓ Capital structure meets minimum 20% equity threshold'
                    : '⚠️ Equity is below standard 20% threshold. Please improve your margin / promoter contribution to proceed.'}
                </span>
                <span className="font-bold shrink-0">
                  Equity: {formData.equityPercent}% | Debt: {100 - formData.equityPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Project Land Status:
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
                        ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-500'
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
                disabled={formData.equityPercent < 20}
                onClick={() => {
                  if (formData.equityPercent < 20) return;
                  setStep(3);
                }}
                className={`flex-1 py-3.5 px-4 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 ${
                  formData.equityPercent >= 20
                    ? 'text-white bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    : 'text-gray-400 bg-gray-200 border border-gray-300 cursor-not-allowed opacity-75'
                }`}
                title={formData.equityPercent < 20 ? 'Equity is below standard 20% threshold. Please improve your margin / promoter contribution to proceed.' : ''}
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
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={applicantInfo.mobile}
                  onChange={(e) => {
                    setApplicantInfo({ ...applicantInfo, mobile: e.target.value });
                    setMobileTouched(true);
                  }}
                  onBlur={() => setMobileTouched(true)}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                    mobileTouched && !mobileValidation.isValid
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/40 text-red-900 font-medium'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {mobileTouched && !mobileValidation.isValid && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {mobileValidation.error}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Collateral / Mortgageable Status:
              </label>
              <select
                value={formData.collateralStatus || 'Freehold (Clear Title)'}
                onChange={(e) => setFormData({ ...formData, collateralStatus: e.target.value })}
                className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
              >
                <option value="Freehold (Clear Title)">Freehold (Clear Title)</option>
                <option value="Leasehold (Bank Clause)">Leasehold (Bank Clause)</option>
                <option value="Agricultural / Conversion Pending">Agricultural / Conversion Pending</option>
                <option value="Under Mortgage / Encumbered">Under Mortgage / Encumbered</option>
                <option value="Govt. Allotted Land">Govt. Allotted Land</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Promoter / Management Experience in Industry:
              </label>
              <select
                value={formData.promoterExpYears}
                onChange={(e) => setFormData({ ...formData, promoterExpYears: Number(e.target.value) })}
                className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
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
                  { key: 'PSU', label: 'PSU Banks (SBI, Canara, Indian Bank)' },
                  { key: 'Private', label: 'Private Banks (HDFC, ICICI, Axis)' },
                  { key: 'NBFC', label: 'NBFC / Financial Inst.' }
                ].map((bk) => (
                  <button
                    key={bk.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetBankType: bk.key as any })}
                    className={`py-2.5 px-3 font-semibold rounded-xl border text-center transition-all ${
                      formData.targetBankType === bk.key
                        ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-500'
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
                  setMobileTouched(true);
                  if (!applicantInfo.fullName.trim() || !applicantInfo.mobile.trim()) {
                    alert('Please enter your Name and Mobile Number to generate report.');
                    return;
                  }
                  if (!mobileValidation.isValid) {
                    return;
                  }
                  calculateAssessment();
                }}
                disabled={isCalculating}
                className="flex-1 py-3.5 px-4 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Underwriting Metrics...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 text-blue-200" />
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
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                    PROJECT ASSESSMENT SUMMARY
                  </span>
                  <h4 className="font-display font-bold text-lg text-white">{formData.industry}</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-400">{result.bankabilityGrade}</span>
                  <span className="text-[10px] text-gray-400 block">Bankability Rating</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Feasibility Check</span>
                  <span className="text-xl font-bold text-blue-400">{getFeasibilityTerm(result.feasibilityScore)}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Eligible Term Loan</span>
                  <span className="text-lg font-bold text-white">₹{result.maxLoanAmountCr} Cr</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Estimated DSCR</span>
                  <span className="text-lg font-bold text-blue-300">{result.dscrEstimate}x</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-gray-400 block">Interest Rate Range</span>
                  <span className="text-xs font-bold text-white mt-1 block">{result.estInterestRate}</span>
                </div>
              </div>
            </div>

            {/* Strengths & Risks Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Bank Credit Strengths:</span>
                </div>
                <ul className="space-y-1.5 text-blue-950">
                  {result.strengthPoints.map((sp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600">•</span>
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

            {/* Proceed to Detailed Risk Assessment Call to Action */}
            {!showRiskProfile && (
              <div className="flex flex-col items-center justify-center p-5 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-center shadow-lg my-1">
                <p className="text-xs text-gray-300 mb-3 max-w-sm">
                  Complete the 5-part Detailed Risk Assessment to generate your comprehensive 10-point underwriting score and unlock the downloadable Teaser PDF.
                </p>
                <button
                  onClick={() => {
                    setShowRiskProfile(true);
                    setTimeout(() => {
                      const el = document.getElementById('modal-risk-profile-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Proceed to Detailed Risk Assessment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Additional Data Collection Step: Detailed Risk Profile */}
            {showRiskProfile && (
              <DetailedRiskProfileForm
                isUnlocked={isTeaserUnlocked}
                onSubmitSuccess={(data) => {
                  setRiskProfileData(data);
                  setRiskProfileSubmitted(true);
                  setIsTeaserUnlocked(true);
                }}
                defaultEquityPercent={formData.equityPercent}
                defaultPromoterExpYears={formData.promoterExpYears}
                theme="dark"
                sectionId="modal-risk-profile-section"
              />
            )}

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleDownloadPDFReport}
                className={`flex-1 py-3 px-3.5 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isTeaserUnlocked
                    ? 'text-slate-950 bg-blue-400 hover:bg-blue-300'
                    : 'text-amber-300 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900/80'
                }`}
                title={isTeaserUnlocked ? 'Downloads PDF teaser report' : 'Complete Detailed Risk Profile to unlock PDF'}
              >
                {isTeaserUnlocked ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
                <span>{isTeaserUnlocked ? 'Download PDF Teaser' : 'Unlock PDF Teaser'}</span>
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
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Book Free Call</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
