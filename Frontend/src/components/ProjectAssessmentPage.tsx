import React, { useState } from 'react';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import { getFeasibilityTerm } from '../types';
import { LocationDropdowns } from './LocationDropdowns';
import { validateIndianMobileNumber } from '../utils/validation';
import { DetailedRiskProfileForm, DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { calculateComprehensiveRiskScore } from '../utils/underwritingScorer';
import {
  Calculator,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Landmark,
  ShieldCheck,
  TrendingUp,
  FileText,
  PhoneCall,
  Download,
  RotateCcw,
  Sparkles,
  Briefcase,
  User,
  Award,
  BarChart3,
  MessageSquare,
  Eye,
  Layers,
  Check,
  Lock,
  Unlock,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface ProjectAssessmentPageProps {
  onOpenConsultation: () => void;
  defaultIndustry?: string;
}

export const ProjectAssessmentPage: React.FC<ProjectAssessmentPageProps> = ({
  onOpenConsultation,
  defaultIndustry = ''
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 'results'>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'scorecard' | 'teaser'>('scorecard');
  const [mobileTouched, setMobileTouched] = useState(false);

  // Lock & Detailed Risk Profile State
  const [isTeaserUnlocked, setIsTeaserUnlocked] = useState(false);
  const [riskProfileSubmitted, setRiskProfileSubmitted] = useState(false);
  const [riskProfileData, setRiskProfileData] = useState<DetailedRiskProfileData | null>(null);
  const [showRiskProfile, setShowRiskProfile] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    industry: defaultIndustry || '',
    location: '',
    totalCostCr: '',
    promoterContribCr: '',
    loanRequiredCr: '',
    landStatus: '',
    collateralStatus: '',
    promoterExp: '',
    description: '',
    fullName: '',
    mobile: '',
    email: ''
  });

  const mobileValidation = validateIndianMobileNumber(formData.mobile);

  // Sync defaultIndustry when passed from parent
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, industry: defaultIndustry || '' }));
  }, [defaultIndustry]);

  // Calculate numbers dynamically
  const cost = parseFloat(formData.totalCostCr) || 0;
  const contrib = parseFloat(formData.promoterContribCr) || 0;
  const equityPercent = cost > 0 ? ((contrib / cost) * 100).toFixed(1) : '0';
  const debtPercent = cost > 0 ? (((cost - contrib) / cost) * 100).toFixed(1) : '0';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'totalCostCr' || name === 'promoterContribCr') {
        const updatedCost = parseFloat(name === 'totalCostCr' ? value : prev.totalCostCr) || 0;
        const updatedContrib = parseFloat(name === 'promoterContribCr' ? value : prev.promoterContribCr) || 0;
        if (updatedCost > 0) {
          updated.loanRequiredCr = Math.max(0, updatedCost - updatedContrib).toString();
        } else {
          updated.loanRequiredCr = '';
        }
      }
      return updated;
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.projectName.trim() || !formData.industry || !formData.location.trim()) {
        alert('Please enter Project Name, select Industry, and enter Location to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.totalCostCr || parseFloat(formData.totalCostCr) <= 0) {
        alert('Please enter a valid Total Project Cost.');
        return;
      }
      if (formData.promoterContribCr === '' || parseFloat(formData.promoterContribCr) < 0) {
        alert('Please enter the Promoter Equity contribution.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.landStatus) {
        alert('Please select the Land Status.');
        return;
      }
      if (!formData.collateralStatus) {
        alert('Please select the Collateral / Mortgageable Status.');
        return;
      }
      if (!formData.promoterExp) {
        alert('Please select the Promoter Track Record.');
        return;
      }
      if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
        setMobileTouched(true);
        alert('Please complete your name, mobile number, and email address.');
        return;
      }
      if (!mobileValidation.isValid) {
        setMobileTouched(true);
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1200);
    }
  };

  // Computation of Feasibility & Bankability
  const computeResults = () => {
    const eqPct = parseFloat(equityPercent);
    let baseFeasibility = 72;
    let baseBankability = 7.0;

    // Equity check
    if (eqPct >= 30) {
      baseFeasibility += 12;
      baseBankability += 1.3;
    } else if (eqPct >= 20) {
      baseFeasibility += 8;
      baseBankability += 0.8;
    }

    // Land status check
    if (formData.landStatus === 'Owned & Registered') {
      baseFeasibility += 8;
      baseBankability += 0.8;
    } else if (formData.landStatus === 'Leased / Govt Allotted') {
      baseFeasibility += 5;
      baseBankability += 0.5;
    }

    // Collateral status check
    if (formData.collateralStatus.includes('Freehold')) {
      baseFeasibility += 6;
      baseBankability += 0.6;
    } else if (formData.collateralStatus.includes('Leasehold')) {
      baseFeasibility += 3;
      baseBankability += 0.3;
    }

    // Experience check
    if (formData.promoterExp.includes('10+ Years')) {
      baseFeasibility += 7;
      baseBankability += 0.8;
    } else if (formData.promoterExp.includes('5-10 Years')) {
      baseFeasibility += 5;
      baseBankability += 0.5;
    }

    const feasibilityScore = Math.min(96, Math.max(65, baseFeasibility));
    const bankabilityRating = Math.min(9.8, Math.max(6.2, baseBankability)).toFixed(1);
    const estimatedLoan = (cost * (parseFloat(debtPercent) / 100)).toFixed(2);

    return {
      feasibilityScore,
      bankabilityRating,
      estimatedLoan,
      eqPct,
      debtPct: parseFloat(debtPercent)
    };
  };

  const results = computeResults();
  const comprehensiveRisk = calculateComprehensiveRiskScore(riskProfileData, results.feasibilityScore);

  const getPDFData = (): TeaserPDFData => ({
    fullName: formData.fullName,
    mobile: formData.mobile,
    email: formData.email,
    projectName: formData.projectName || 'Greenfield Project',
    industry: formData.industry,
    location: formData.location,
    totalCostCr: formData.totalCostCr,
    promoterContribCr: formData.promoterContribCr,
    loanRequiredCr: formData.loanRequiredCr,
    landStatus: formData.landStatus,
    collateralStatus: formData.collateralStatus,
    promoterExp: formData.promoterExp,
    description: formData.description,
    feasibilityScore: results.feasibilityScore,
    bankabilityRating: results.bankabilityRating,
    estimatedLoan: results.estimatedLoan,
    eqPct: results.eqPct,
    debtPct: results.debtPct,
    dscrEstimate: 1.45,
    estInterestRate: '8.85% - 9.40%',
    riskProfileData: riskProfileData || undefined,
    riskScoreOutOf10: comprehensiveRisk.scoreOutOf10
  });

  const handleDownloadTeaser = () => {
    const pdfData = getPDFData();
    generateProjectTeaserPDF(pdfData);
  };

  const handleSelectTeaserTab = () => {
    setViewMode('teaser');
  };

  const handleDownloadTeaserClick = () => {
    if (!isTeaserUnlocked) {
      alert('Teaser PDF download is locked. Please complete the Detailed Risk Profile form below to unlock.');
      const el = document.getElementById('risk-profile-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    handleDownloadTeaser();
  };

  const handleSendWhatsAppLead = () => {
    const pdfData = getPDFData();
    sendLeadToWhatsApp(pdfData, '916302026462');
  };

  // Cost breakdowns for Teaser view
  const costLakhs = (cost * 100).toFixed(2);
  const loanCr = parseFloat(formData.loanRequiredCr) || (cost * (results.debtPct / 100));
  const loanLakhs = (loanCr * 100).toFixed(2);
  const contribLakhs = (contrib * 100).toFixed(2);

  const consultancyLakhs = (parseFloat(costLakhs) * 0.02).toFixed(2);
  const machineryLakhs = (parseFloat(costLakhs) * 0.68).toFixed(2);
  const civilLakhs = (parseFloat(costLakhs) * 0.30).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Page Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glowing Background Elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bank-Grade Advisory Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-manrope leading-tight mb-3">
            Greenfield Project Assessment
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-inter leading-relaxed mb-6">
            Evaluate your project's feasibility, bankability, and estimated loan eligibility through a simple, structured assessment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Confidential Evaluation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>RBI & PSU Bank Aligned Norms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Preliminary Report</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Assessment Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {step !== 'results' ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden">
            {/* Step Progress Bar Header */}
            <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 text-white">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    1
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold hidden sm:inline ${step === 1 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Project Details
                  </span>
                </div>

                <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    2
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold hidden sm:inline ${step === 2 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Financial Details
                  </span>
                </div>

                <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    3
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold hidden sm:inline ${step === 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Additional Details
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleNextStep} className="p-6 sm:p-10 space-y-8">
              {/* STEP 1: PROJECT DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      Step 1: Project Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Tell us about your proposed greenfield venture.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="Enter the Project Name"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
                      />
                    </div>

                    {/* Industries or Sector */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Industries or Sector <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium ${
                          formData.industry ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled hidden>Select Industry or Sector</option>
                        <option value="Renewable Energy & CBG / Bio-Gas" className="text-gray-900">Renewable Energy & CBG / Bio-Gas</option>
                        <option value="Solar & Wind Power Infrastructure" className="text-gray-900">Solar & Wind Power Infrastructure</option>
                        <option value="Manufacturing & Heavy Industry" className="text-gray-900">Manufacturing & Heavy Industry</option>
                        <option value="Food Processing & Cold Chain" className="text-gray-900">Food Processing & Cold Chain</option>
                        <option value="Pharmaceuticals & Healthcare" className="text-gray-900">Pharmaceuticals & Healthcare</option>
                        <option value="Textiles & Apparel" className="text-gray-900">Textiles & Apparel</option>
                        <option value="Real Estate & Commercial Infra" className="text-gray-900">Real Estate & Commercial Infra</option>
                        <option value="Logistics & Warehousing" className="text-gray-900">Logistics & Warehousing</option>
                        <option value="Chemicals & Fertilizers" className="text-gray-900">Chemicals & Fertilizers</option>
                        <option value="Hotels & Hospitality" className="text-gray-900">Hotels & Hospitality</option>
                        <option value="Data Centers & Tech Parks" className="text-gray-900">Data Centers & Tech Parks</option>
                        <option value="Other Greenfield Sector" className="text-gray-900">Other Greenfield Sector</option>
                      </select>
                    </div>

                    {/* Location Selection (Side by Side Dependent Dropdowns) */}
                    <div className="md:col-span-2">
                      <LocationDropdowns
                        value={formData.location}
                        onChange={(loc) => setFormData((prev) => ({ ...prev, location: loc }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Financial Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: FINANCIAL DETAILS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-emerald-600" />
                      Step 2: Financial Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Input your project capital outlay and funding structure in ₹ Crores.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Project Cost */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Total Project Cost (₹ Cr) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="totalCostCr"
                          value={formData.totalCostCr}
                          onChange={handleInputChange}
                          placeholder="Enter Total Cost (in ₹ Cr)"
                          required
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Promoter Contribution */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 leading-tight">
                        How much money / equity do you have available for this project? (₹ CR) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="promoterContribCr"
                          value={formData.promoterContribCr}
                          onChange={handleInputChange}
                          placeholder="Enter Equity Available (in ₹ Cr)"
                          required
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Loan Amount Required */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 leading-tight">
                        Estimated Loan Needed (₹ Cr)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="loanRequiredCr"
                          value={formData.loanRequiredCr}
                          onChange={handleInputChange}
                          placeholder="Calculated automatically"
                          className="w-full pl-8 pr-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold text-emerald-900 text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Ratios Preview Card */}
                  {(() => {
                    const isEquityValid = cost > 0 && contrib > 0 && parseFloat(equityPercent) >= 20;
                    return (
                      <>
                        <div
                          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                            isEquityValid
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-rose-50 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-sm ${
                                isEquityValid ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            >
                              %
                            </div>
                            <div>
                              <div
                                className={`text-xs font-bold uppercase tracking-wide ${
                                  isEquityValid ? 'text-emerald-950' : 'text-rose-950'
                                }`}
                              >
                                Calculated Capital Structure
                              </div>
                              <div
                                className={`text-sm font-extrabold ${
                                  isEquityValid ? 'text-emerald-900' : 'text-rose-900'
                                }`}
                              >
                                Equity:{' '}
                                <span className={isEquityValid ? 'text-emerald-700' : 'text-rose-700'}>
                                  {equityPercent}%
                                </span>{' '}
                                | Debt:{' '}
                                <span className={isEquityValid ? 'text-emerald-700' : 'text-rose-700'}>
                                  {debtPercent}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-xs px-3 py-2 rounded-lg border font-semibold flex items-center gap-1.5 ${
                              isEquityValid
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                : 'text-rose-600 bg-rose-50 border-rose-200'
                            }`}
                          >
                            {isEquityValid
                              ? '✓ Capital structure meets minimum 20% equity threshold'
                              : '⚠️ Equity is below standard 20% threshold. Please improve your margin / promoter contribution to proceed.'}
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="submit"
                            disabled={!isEquityValid}
                            className={`px-6 py-3 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 ${
                              isEquityValid
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-75'
                            }`}
                            title={
                              !isEquityValid
                                ? 'Equity is below standard 20% threshold. Please improve your margin / promoter contribution to proceed.'
                                : ''
                            }
                          >
                            <span>Proceed to Step 3</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* STEP 3: ADDITIONAL & CONTACT DETAILS */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                      Step 3: Readiness & Contact Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Final details to generate your bankability scorecard and executive teaser.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Land Status */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Project Land Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="landStatus"
                        value={formData.landStatus}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium ${formData.landStatus ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        <option value="" disabled hidden>Select Project Land Status</option>
                        <option value="Owned & Registered" className="text-gray-900">Owned & Registered</option>
                        <option value="Leased / Govt Allotted" className="text-gray-900">Leased / Govt Allotted</option>
                        <option value="MoU Signed / Under Acquisition" className="text-gray-900">MoU Signed / Under Acquisition</option>
                        <option value="Land Selection Pending" className="text-gray-900">Land Selection Pending</option>
                      </select>
                    </div>

                    {/* Collateral / Mortgageable Status */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Collateral / Mortgageable Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="collateralStatus"
                        value={formData.collateralStatus}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium ${formData.collateralStatus ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        <option value="" disabled hidden>Select Collateral Status</option>
                        <option value="Freehold (Clear Title)" className="text-gray-900">Freehold (Clear Title)</option>
                        <option value="Leasehold (Bank Clause)" className="text-gray-900">Leasehold (Bank Clause)</option>
                        <option value="Agricultural / Conversion Pending" className="text-gray-900">Agricultural / Conversion Pending</option>
                        <option value="Under Mortgage / Encumbered" className="text-gray-900">Under Mortgage / Encumbered</option>
                        <option value="Govt. Allotted Land" className="text-gray-900">Govt. Allotted Land</option>
                      </select>
                    </div>

                    {/* Promoter Experience */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Promoter Track Record <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="promoterExp"
                        value={formData.promoterExp}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium ${formData.promoterExp ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        <option value="" disabled hidden>Select Promoter Track Record</option>
                        <option value="10+ Years (Industry Veteran)" className="text-gray-900">10+ Years (Industry Veteran)</option>
                        <option value="5-10 Years (Established Player)" className="text-gray-900">5-10 Years (Established Player)</option>
                        <option value="3-5 Years (Relevant Sector)" className="text-gray-900">3-5 Years (Relevant Sector)</option>
                        <option value="0-3 Years (First-Time Promoter)" className="text-gray-900">0-3 Years (First-Time Promoter)</option>
                      </select>
                    </div>

                    {/* Brief Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Brief Project Scope / Objectives
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide any additional context like technical partners, expected capacity, or off-take agreements..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Contact Fields Box */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Contact & Confidential Delivery</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Your Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={(e) => {
                            handleInputChange(e);
                            setMobileTouched(true);
                          }}
                          onBlur={() => setMobileTouched(true)}
                          required
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                            mobileTouched && !mobileValidation.isValid
                              ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50/40 text-red-900 font-medium'
                              : 'border-gray-200 focus:ring-2 focus:ring-emerald-500 text-gray-900'
                          }`}
                        />
                        {mobileTouched && !mobileValidation.isValid && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            {mobileValidation.error}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Work Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter work email address"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Assessment Report...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 text-emerald-100" />
                          <span>Calculate Feasibility & Eligibility</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* RESULTS DASHBOARD & TEASER FORMAT SWITCHER */
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* View Switcher Bar */}
            <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-between gap-2 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setViewMode('scorecard')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    viewMode === 'scorecard'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Scorecard & Analytics</span>
                </button>

                <button
                  onClick={handleSelectTeaserTab}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    viewMode === 'teaser'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : isTeaserUnlocked
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-amber-400/90 hover:bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  {isTeaserUnlocked ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Executive Teaser (Inisio Format)</span>
                  {!isTeaserUnlocked && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-semibold uppercase">
                      Locked
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Recalculate</span>
                </button>

                <button
                  onClick={handleDownloadTeaserClick}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isTeaserUnlocked
                      ? 'text-slate-950 bg-emerald-400 hover:bg-emerald-300'
                      : 'text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60'
                  }`}
                >
                  {isTeaserUnlocked ? (
                    <Download className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isTeaserUnlocked ? 'Download Teaser PDF' : 'Unlock Teaser PDF'}</span>
                </button>
              </div>
            </div>

            {viewMode === 'scorecard' ? (
              <>
                {/* Report Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assessment Completed</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-manrope">
                        {formData.projectName || 'Greenfield Project'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-3">
                        <span>Sector: <strong className="text-gray-800">{formData.industry}</strong></span>
                        <span>•</span>
                        <span>Location: <strong className="text-gray-800">{formData.location}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* 3 Core Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    {/* Feasibility Check */}
                    <div className="p-5 bg-slate-900 text-white rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4" />
                          <span>Feasibility Check</span>
                        </div>
                        <div className="text-4xl font-black text-white my-2 font-manrope flex items-baseline gap-1">
                          {getFeasibilityTerm(results.feasibilityScore)}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                        <span>Viability Rating</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {results.feasibilityScore >= 78 ? 'High Feasibility' : 'Moderate Feasibility'}
                        </span>
                      </div>
                    </div>

                    {/* Bankability Rating */}
                    <div className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg shadow-emerald-600/20">
                      <div>
                        <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          <span>Bankability Rating</span>
                        </div>
                        <div className="text-4xl font-black text-white my-2 font-manrope">
                          {results.bankabilityRating} <span className="text-lg font-normal text-emerald-200">/ 10</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs text-emerald-100">
                        <span>Lender Category</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                          Tier-1 Bankable
                        </span>
                      </div>
                    </div>

                    {/* Estimated Loan Eligibility */}
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-emerald-700" />
                          <span>Estimated Loan Eligibility</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-950 my-2 font-manrope">
                          ₹ {results.estimatedLoan} <span className="text-sm font-semibold text-emerald-700">Cr</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
                        <span>Max Debt LTV</span>
                        <span className="font-bold text-emerald-900">{results.debtPct}% Debt Funding</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proceed to Detailed Risk Assessment Call to Action */}
                {!showRiskProfile && (
                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/80 text-center shadow-lg my-2">
                    <div className="max-w-md space-y-2 mb-4">
                      <h4 className="text-base font-bold text-white font-manrope">Ready for Underwriting & Detailed Risk Scoring?</h4>
                      <p className="text-xs text-slate-300">
                        Enter promoter background, collateral coverage, credit track, and workforce details to generate your comprehensive 10-point underwriting rating and unlock the Executive Teaser PDF report.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowRiskProfile(true);
                        setTimeout(() => {
                          const el = document.getElementById('risk-profile-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Proceed to Detailed Risk Assessment</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
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
                    sectionId="risk-profile-section"
                  />
                )}

                {/* Observations & Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Observations */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Key Analytical Observations</span>
                    </h3>

                    <ul className="space-y-3 text-xs text-gray-700 font-medium">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Promoter equity commitment of <strong>₹ {formData.promoterContribCr} Cr ({results.eqPct}%)</strong> aligns with lead banker requirements for Greenfield project debt.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Land status (<strong>{formData.landStatus}</strong>) and Collateral status (<strong>{formData.collateralStatus}</strong>) reduce implementation delay risks.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Promoter experience (<strong>{formData.promoterExp}</strong>) enhances credit agency rating and loan margin pricing.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Eligible for state-level interest subventions and capital subsidies under active industrial policies.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Actionable Recommendations */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Next Steps</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          1
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Compile Bank-Grade DPR & Financial Model</div>
                          <div className="text-gray-600 mt-0.5">Prepare a 10-year cash flow projection and TEV study aligned with banking standards.</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          2
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Debt Syndication & Lender Mapping</div>
                          <div className="text-gray-600 mt-0.5">Engage with consortium banks and financial institutions for competitive interest rates.</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          3
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Subsidy Alignment & Statutory Approvals</div>
                          <div className="text-gray-600 mt-0.5">Apply for industrial land clearances, environmental consents, and capital subsidy registration.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* EXECUTIVE PROJECT TEASER VIEW (EXACT FORMAT WITH INISIO BRANDING) */
              <div className="space-y-6 bg-slate-200/80 p-4 sm:p-8 rounded-3xl border border-gray-300">
                {!isTeaserUnlocked && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Teaser Preview & Download Pending Risk Profile Submission</h4>
                        <p className="text-xs text-slate-600">Please complete all 5 required sections of the Detailed Risk Profile form below to unlock & calculate your rating out of 10.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewMode('scorecard');
                        setShowRiskProfile(true);
                        setTimeout(() => {
                          const el = document.getElementById('risk-profile-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0 transition-all cursor-pointer shadow-sm"
                    >
                      Fill Detailed Risk Profile
                    </button>
                  </div>
                )}

                {/* EXECUTIVE TEASER DOCUMENT */}
                <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 space-y-6 text-slate-900 border border-gray-200">
                  {/* Top Legal Header */}
                  <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-manrope uppercase">
                      {(formData.projectName || 'GREENFIELD PROJECT PRIVATE LIMITED').toUpperCase()}
                    </h1>
                    <h2 className="text-base font-bold text-slate-700 font-manrope mt-1">
                      Company Profile & Executive Project Teaser
                    </h2>
                  </div>

                  {/* Section 1: General Information */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      General Information
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5 font-sans">
                      <p>
                        <strong>{(formData.projectName || 'The Company').toUpperCase()}</strong> is engaged in the proposed greenfield establishment and operation of high-capacity facilities in the <strong>{formData.industry}</strong> sector. The project is proposed at <strong>{formData.location}</strong>, promoted by <strong>{formData.fullName || 'Promoter'}</strong>.
                      </p>
                      <p>
                        The company proposes to establish a high-capacity greenfield plant with an estimated project cost of <strong>₹ {formData.totalCostCr} Crores (₹ {costLakhs} Lakhs)</strong>. To ensure uninterrupted operations and raw material security, the company has arranged suitable land under <strong>{formData.landStatus}</strong> status (Collateral / Title: <strong>{formData.collateralStatus || 'Freehold Clear Title'}</strong>).
                      </p>
                      <p>
                        The project's technical design, engineering, DPR compilation, and debt syndication support are being structured by <strong>INISIO Greenfield Project Advisory</strong>, specializing in industrial project finance, TEV studies, and consortium bank structuring.
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Service Offerings */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Service Offerings
                    </div>
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-900">
                        <div className="col-span-1">Core Offering</div>
                        <div className="col-span-2">Description & Scope</div>
                      </div>
                      <div className="grid grid-cols-3 p-3 text-slate-800">
                        <div className="col-span-1 font-bold">Production & Commercial Supply of {formData.industry}</div>
                        <div className="col-span-2 leading-relaxed">Commercial manufacture, refining, and supply of primary product outputs and value-added by-products for institutional, commercial, and industrial off-takers.</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Directors Details */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Directors Details
                    </div>
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-2 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-900">
                        <div>Name</div>
                        <div>Title / Designation</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 text-slate-800">
                        <div className="font-bold">{formData.fullName || 'Promoter'}</div>
                        <div>Promoter / Lead Investor</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Suppliers and Buyers */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      SUPPLIERS AND BUYERS
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5 font-sans">
                      <p>
                        <strong>{formData.projectName || 'The Company'}</strong> adopts an integrated supply chain model, sourcing raw materials and key feedstock through contract farming, primary producers, aggregators, and industrial suppliers within an optimal transport radius.
                      </p>
                      <p>
                        On the marketing front, the company plans to sell primary output primarily to Oil Marketing Companies (OMCs), City Gas Distribution (CGD) networks, industrial bulk consumers, or retail networks. By-products will be marketed to institutional fertilizer and commercial agricultural users.
                      </p>
                    </div>
                  </div>

                  {/* Section 5: Project Funding Facilities */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Project Funding Facilities
                    </div>

                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide pt-1">
                      Proposed Project Cost Statement
                    </div>

                    {/* Cost Table */}
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-2 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-900">
                        <div>Particulars</div>
                        <div className="text-right">Amount (₹ Lakhs)</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div>Consultancy, TEFR & Engineering Fees</div>
                        <div className="text-right font-mono">{consultancyLakhs}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div>Plant & Machinery, Technology & Procurement</div>
                        <div className="text-right font-mono">{machineryLakhs}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div>Land Cost, Civil Works & Infrastructure</div>
                        <div className="text-right font-mono">{civilLakhs}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 bg-slate-50 font-bold text-slate-900">
                        <div>Total Project Cost</div>
                        <div className="text-right font-mono text-emerald-700">{costLakhs} lakhs</div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide pt-2">
                      Means of Finance
                    </div>

                    {/* Means Table */}
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-900">
                        <div>Means of Finance</div>
                        <div>Amount (INR Lakhs)</div>
                        <div className="text-right">Share (%)</div>
                      </div>
                      <div className="grid grid-cols-3 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-900">Project Term Loan</div>
                        <div className="font-mono">{loanLakhs} lakhs</div>
                        <div className="text-right font-bold text-emerald-700">{results.debtPct}%</div>
                      </div>
                      <div className="grid grid-cols-3 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-900">Promoter Contribution</div>
                        <div className="font-mono">{contribLakhs} lakhs</div>
                        <div className="text-right font-bold text-slate-700">{results.eqPct}%</div>
                      </div>
                      <div className="grid grid-cols-3 p-2.5 bg-slate-50 font-bold text-slate-900">
                        <div>Total Means of Finance</div>
                        <div className="font-mono">{costLakhs} lakhs</div>
                        <div className="text-right">100%</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Present Requirement */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Present Requirement
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      The Company proposes to avail a Term Loan facility of <strong>₹ {formData.loanRequiredCr} Crore</strong> to meet its capital expenditure requirements. The proposed facility will be utilized for the establishment of the {formData.industry} facility, including procurement and installation of plant & machinery, civil infrastructure development, and operational commissioning.
                    </p>
                  </div>

                  {/* Section 7: Primary & Collaterals */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Primary & Collaterals
                    </div>
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-900">
                        <div>Security Type</div>
                        <div className="col-span-2">Details</div>
                      </div>
                      <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                        <div className="font-bold text-slate-900">Primary Security</div>
                        <div className="col-span-2 text-slate-800">Hypothecation on all the plant & machinery, equipment, civil structures, and fixed assets procured out of the Term Loan.</div>
                      </div>
                      <div className="grid grid-cols-3 p-3">
                        <div className="font-bold text-slate-900">Collateral Security</div>
                        <div className="col-span-2 text-emerald-800 font-bold">{formData.collateralStatus || 'Freehold (Clear Title)'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Detailed Risk Profile & Underwriting Assessment */}
                  {riskProfileSubmitted && (
                    <div className="space-y-3">
                      <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm flex items-center justify-between">
                        <span>Detailed Risk Profile & Underwriting Assessment</span>
                        <span className="text-emerald-400 font-extrabold text-xs">
                          Rating: {comprehensiveRisk.scoreOutOf10} / 10 ({comprehensiveRisk.ratingLabel})
                        </span>
                      </div>
                      <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-emerald-50/70">
                          <div className="font-bold text-slate-800">Underwriting Rating (out of 10)</div>
                          <div className="font-extrabold text-emerald-800">{comprehensiveRisk.scoreOutOf10} / 10 ({comprehensiveRisk.ratingLabel})</div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                          <div className="font-bold text-slate-700">CIBIL / Credit Score Track</div>
                          <div className="font-semibold text-slate-900">
                            {riskProfileData?.isNewToCredit ? 'New to Credit (N/A)' : (riskProfileData?.cibilScore ? `${riskProfileData.cibilScore} Score` : 'N/A')}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                          <div className="font-bold text-slate-700">Collateral Coverage %</div>
                          <div className="font-semibold text-slate-900">
                            {riskProfileData?.collateralCoveragePct ? `${riskProfileData.collateralCoveragePct}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                          <div className="font-bold text-slate-700">Industry Experience</div>
                          <div className="text-slate-900">{riskProfileData?.industryExperience || formData.promoterExp || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                          <div className="font-bold text-slate-700">Educational Background</div>
                          <div className="text-slate-900">{riskProfileData?.educationalBackground || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                          <div className="font-bold text-slate-700">Business Constitution & Vintage</div>
                          <div className="text-slate-900">
                            {riskProfileData ? `${riskProfileData.businessConstitution} (${riskProfileData.businessVintage})` : 'N/A'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                          <div className="font-bold text-slate-700">Promoter Contribution Type</div>
                          <div className="text-slate-900">{riskProfileData?.contributionType || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                          <div className="font-bold text-slate-700">Management & Technical Workforce</div>
                          <div className="text-slate-900">
                            {riskProfileData ? `${riskProfileData.managementTeamSize} Mgmt / Directors • ${riskProfileData.technicalWorkforceCount} Tech Staff` : 'N/A'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 p-2.5">
                          <div className="font-bold text-slate-700">Debt–Equity Ratio</div>
                          <div className="font-bold text-slate-900">{riskProfileData?.debtEquityRatio || `${results.debtPct}:${results.eqPct}`}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 9: Preliminary Information */}
                  <div className="space-y-3">
                    <div className="bg-[#0F172A] text-white px-4 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-sm">
                      Preliminary Information
                    </div>
                    <div className="border border-slate-200 text-xs sm:text-sm rounded-sm overflow-hidden">
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                        <div className="font-bold text-slate-700">Project Name</div>
                        <div className="font-bold text-slate-900">{formData.projectName || 'Greenfield Project'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-700">Promoter Name</div>
                        <div className="font-semibold text-slate-900">{formData.fullName || 'N/A'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                        <div className="font-bold text-slate-700">Industry Sector</div>
                        <div className="font-semibold text-slate-900">{formData.industry}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-700">Project Location</div>
                        <div className="text-slate-900">{formData.location || 'India'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                        <div className="font-bold text-slate-700">Land Status</div>
                        <div className="text-slate-900">{formData.landStatus || 'N/A'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-700">Collateral Status</div>
                        <div className="text-slate-900">{formData.collateralStatus || 'N/A'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                        <div className="font-bold text-slate-700">Promoter Experience</div>
                        <div className="text-slate-900">{formData.promoterExp || 'N/A'}</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                        <div className="font-bold text-slate-700">Feasibility Score</div>
                        <div className="font-bold text-emerald-700">{getFeasibilityTerm(results.feasibilityScore)} ({results.feasibilityScore}/100)</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5">
                        <div className="font-bold text-slate-700">Bankability Grade</div>
                        <div className="font-bold text-slate-900">{results.bankabilityRating} / 10</div>
                      </div>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div>Official Teaser Preview</div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-800 uppercase">Prepared by</div>
                      <div className="text-base font-black text-emerald-600 font-manrope">INISIO</div>
                      <div className="text-[11px] font-semibold text-slate-700">Greenfield Advisory</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Primary CTAs */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-lg font-bold text-white font-manrope">Ready to execute your Greenfield financing?</h4>
                <p className="text-xs text-slate-300 mt-1">Book a 1-on-1 session with our senior debt syndication advisors.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadTeaserClick}
                  className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isTeaserUnlocked
                      ? 'text-slate-900 bg-emerald-400 hover:bg-emerald-300'
                      : 'text-amber-300 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900/80'
                  }`}
                  title={isTeaserUnlocked ? 'Downloads official bank-grade PDF teaser document' : 'Complete Detailed Risk Profile to unlock PDF download'}
                >
                  {isTeaserUnlocked ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
                  <span>{isTeaserUnlocked ? 'Download Teaser PDF' : 'Unlock Teaser PDF'}</span>
                </button>

                <button
                  onClick={onOpenConsultation}
                  className="flex-1 sm:flex-none px-5 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Book Free Call</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
