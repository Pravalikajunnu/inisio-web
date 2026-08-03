import React, { useState } from 'react';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import { getFeasibilityTerm } from '../types';
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
  Info,
  DollarSign,
  Briefcase,
  User,
  Phone,
  Mail,
  Award,
  BarChart3,
  MessageSquare
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

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    industry: defaultIndustry || '',
    location: '',
    totalCostCr: '',
    promoterContribCr: '',
    loanRequiredCr: '',
    landStatus: '',
    promoterExp: '',
    description: '',
    fullName: '',
    mobile: '',
    email: ''
  });

  // Sync defaultIndustry when passed from parent
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, industry: defaultIndustry || '' }));
  }, [defaultIndustry]);

  // Calculate numbers dynamically
  const cost = parseFloat(formData.totalCostCr) || 0;
  const contrib = parseFloat(formData.promoterContribCr) || 0;
  const autoLoan = Math.max(0, cost - contrib);
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
      if (!formData.promoterExp) {
        alert('Please select the Promoter Track Record.');
        return;
      }
      if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
        alert('Please complete your name, mobile number, and email address.');
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
    promoterExp: formData.promoterExp,
    description: formData.description,
    feasibilityScore: results.feasibilityScore,
    bankabilityRating: results.bankabilityRating,
    estimatedLoan: results.estimatedLoan,
    eqPct: results.eqPct,
    debtPct: results.debtPct,
    dscrEstimate: 1.45,
    estInterestRate: '8.85% - 9.40%'
  });

  const handleDownloadTeaser = () => {
    const pdfData = getPDFData();
    // 1. Download formatted PDF document
    generateProjectTeaserPDF(pdfData);
    // 2. Open WhatsApp lead message to admin (6302026462)
    setTimeout(() => {
      sendLeadToWhatsApp(pdfData, '916302026462');
    }, 500);
  };

  const handleSendWhatsAppLead = () => {
    const pdfData = getPDFData();
    sendLeadToWhatsApp(pdfData, '916302026462');
  };

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
                    <div>
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
                        <option value="Renewable Energy & Solar" className="text-gray-900">Renewable Energy & Solar</option>
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

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Project Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Enter the Location"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
                        />
                      </div>
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
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Promoter Equity (₹ Cr) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="promoterContribCr"
                          value={formData.promoterContribCr}
                          onChange={handleInputChange}
                          placeholder="Enter Promoter Equity (in ₹ Cr)"
                          required
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Loan Amount Required */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                  <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/60 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        %
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Calculated Capital Structure</div>
                        <div className="text-sm font-extrabold text-emerald-900">
                          Equity: <span className="text-emerald-700">{equityPercent}%</span> | Debt: <span className="text-emerald-700">{debtPercent}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-800 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                      {parseFloat(equityPercent) >= 20 ? '✓ Meets Bank Underwriting Standard' : '⚠️ Equity below standard 20% threshold'}
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
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Step 3</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
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
                      Final details to generate your bankability scorecard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Land Status */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Land Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="landStatus"
                        value={formData.landStatus}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium ${formData.landStatus ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        <option value="" disabled hidden>Select Land Status</option>
                        <option value="Owned & Registered" className="text-gray-900">Owned & Registered</option>
                        <option value="Leased / Govt Allotted" className="text-gray-900">Leased / Govt Allotted</option>
                        <option value="MoU Signed / Under Acquisition" className="text-gray-900">MoU Signed / Under Acquisition</option>
                        <option value="Land Selection Pending" className="text-gray-900">Land Selection Pending</option>
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
                          placeholder="e.g. Rajesh Sharma"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Work Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="rajesh@company.com"
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
          /* RESULTS DASHBOARD */
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recalculate</span>
                  </button>
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
                      Land status (<strong>{formData.landStatus}</strong>) reduces implementation delay risks and accelerates preliminary TEFR approvals.
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

            {/* Bottom Primary CTAs */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-lg font-bold text-white font-manrope">Ready to execute your Greenfield financing?</h4>
                <p className="text-xs text-slate-300 mt-1">Book a 1-on-1 session with our senior debt syndication advisors.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadTeaser}
                  className="flex-1 sm:flex-none px-4 py-3 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  title="Downloads official bank-grade PDF report & sends lead to WhatsApp"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Teaser (PDF)</span>
                </button>

                <button
                  onClick={handleSendWhatsAppLead}
                  className="flex-1 sm:flex-none px-4 py-3 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  title="Send project details directly on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Send to WhatsApp</span>
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
