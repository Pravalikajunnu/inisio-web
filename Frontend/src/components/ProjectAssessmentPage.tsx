import React, { useState } from 'react';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import { getFeasibilityTerm } from '../types';
import { LocationDropdowns } from './LocationDropdowns';
import { validateIndianMobileNumber } from '../utils/validation';
import { DetailedRiskProfileForm, DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { calculateComprehensiveRiskScore } from '../utils/underwritingScorer';
import { updateLeadRecord, saveLeadRecord } from '../utils/leadStore';
import {
  Calculator,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Landmark,
  FileText,
  PhoneCall,
  Download,
  RotateCcw,
  Sparkles,
  Briefcase,
  User,
  Award,
  ShieldCheck,
  Building,
  Users2,
  CreditCard,
  Layers,
  Check,
  AlertCircle,
  Save,
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';

interface ProjectAssessmentPageProps {
  onOpenConsultation: () => void;
  defaultIndustry?: string;
  editingProject?: any;
  onFinishEditing?: () => void;
  onNavigateToDashboard?: () => void;
}

type AssessmentStage =
  | 1
  | 2
  | 3
  | 'feasibility_result'
  | 'collect_bankability'
  | 'bankability_result';

export const ProjectAssessmentPage: React.FC<ProjectAssessmentPageProps> = ({
  onOpenConsultation,
  defaultIndustry = '',
  editingProject,
  onFinishEditing,
  onNavigateToDashboard
}) => {
  const [stage, setStage] = useState<AssessmentStage>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [step2Error, setStep2Error] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Stage 2 Inputs: Risk Profile Data for Bankability Rating
  const [riskProfileData, setRiskProfileData] = useState<DetailedRiskProfileData | null>(null);

  // Stage 1 Form State: Initial 3 Steps (All blank by default - no forced pre-selection)
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

  // Pre-fill inputs when editing a project
  React.useEffect(() => {
    let activeUser: any = null;
    try {
      const stored = localStorage.getItem('inisio_active_user');
      if (stored) activeUser = JSON.parse(stored);
    } catch (e) {}

    if (editingProject) {
      const contactFullName = 
        editingProject.fullName || 
        editingProject.name || 
        editingProject.applicantName || 
        editingProject.contactName || 
        activeUser?.name || 
        '';

      const contactMobile = 
        editingProject.mobile || 
        editingProject.phone || 
        editingProject.applicantMobile || 
        editingProject.contactPhone || 
        activeUser?.phone || 
        '';

      const contactEmail = 
        editingProject.email || 
        editingProject.applicantEmail || 
        editingProject.contactEmail || 
        activeUser?.email || 
        '';

      setFormData({
        projectName: editingProject.projectName || '',
        industry: editingProject.industry || defaultIndustry || '',
        location: editingProject.location || '',
        totalCostCr: String(editingProject.totalCostCr || ''),
        promoterContribCr: String(editingProject.promoterContribCr || ''),
        loanRequiredCr: String(editingProject.loanRequiredCr || ''),
        landStatus: editingProject.landStatus || '',
        collateralStatus: editingProject.collateralStatus || '',
        promoterExp: editingProject.promoterExp || '',
        description: editingProject.notes || editingProject.description || '',
        fullName: contactFullName,
        mobile: contactMobile,
        email: contactEmail
      });

      // Pre-fill Underwriting / Bankability Risk Profile
      const projCost = parseFloat(String(editingProject.totalCostCr)) || 10;
      const projContrib = parseFloat(String(editingProject.promoterContribCr)) || (projCost * 0.25);
      const projEqPct = projCost > 0 ? Math.round((projContrib / projCost) * 100) : 25;
      const projDebtPct = 100 - projEqPct;

      if (editingProject.riskProfileData) {
        setRiskProfileData(editingProject.riskProfileData);
      } else {
        setRiskProfileData({
          industryExperience: editingProject.promoterExp || '6 to 10 Years',
          educationalBackground: 'Post Graduate (Master\'s / MBA)',
          businessConstitution: 'Private Limited Company',
          businessVintage: '4 to 7 Years',
          contributionType: editingProject.landStatus?.toLowerCase().includes('owned') ? 'Combination of Cash & Land' : 'Cash / Bank Balance',
          collateralCoveragePct: '110',
          debtEquityRatio: `${projDebtPct}:${projEqPct}`,
          managementTeamSize: '5',
          technicalWorkforceCount: '15',
          cibilScore: '785',
          isNewToCredit: false
        });
      }
    } else if (defaultIndustry) {
      setFormData((prev) => ({
        ...prev,
        industry: defaultIndustry,
        fullName: prev.fullName || activeUser?.name || '',
        mobile: prev.mobile || activeUser?.phone || '',
        email: prev.email || activeUser?.email || ''
      }));
    }
  }, [editingProject, defaultIndustry]);

  // Auto-fill logged in user info if available and not editing
  React.useEffect(() => {
    if (editingProject) return;
    try {
      const stored = localStorage.getItem('inisio_active_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email) {
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || u.name || '',
            mobile: prev.mobile || u.phone || '',
            email: prev.email || u.email || ''
          }));
        }
      }
    } catch (e) {}
  }, [editingProject]);

  // Calculate numbers dynamically
  const cost = parseFloat(formData.totalCostCr) || 0;
  const contrib = parseFloat(formData.promoterContribCr) || 0;
  const equityPercent = cost > 0 ? ((contrib / cost) * 100).toFixed(1) : '0';
  const debtPercent = cost > 0 ? (((cost - contrib) / cost) * 100).toFixed(1) : '0';
  const isEquityEligible = cost > 0 && parseFloat(equityPercent) >= 20;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'totalCostCr' || name === 'promoterContribCr') {
        setStep2Error('');
        const updatedCost = parseFloat(name === 'totalCostCr' ? value : prev.totalCostCr) || 0;
        const updatedContrib = parseFloat(name === 'promoterContribCr' ? value : prev.promoterContribCr) || 0;
        if (updatedCost > 0) {
          updated.loanRequiredCr = Math.max(0, updatedCost - updatedContrib).toFixed(2);
        } else {
          updated.loanRequiredCr = '';
        }
      }
      return updated;
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error('');

    if (stage === 1) {
      if (!formData.projectName.trim() || !formData.industry || !formData.location.trim()) {
        alert('Please enter your Project Name, select Industry, and choose Location to continue.');
        return;
      }
      setStage(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (stage === 2) {
      if (!formData.totalCostCr || parseFloat(formData.totalCostCr) <= 0) {
        setStep2Error('Please enter a valid Total Project Cost in ₹ Crores.');
        return;
      }
      if (formData.promoterContribCr === '' || parseFloat(formData.promoterContribCr) < 0) {
        setStep2Error('Please enter how much money you have for the project in your hand (Promoter Equity).');
        return;
      }
      if (!isEquityEligible) {
        setStep2Error(`Promoter equity contribution is ${equityPercent}%, which is below the minimum required 20% for bank financing. Please increase promoter equity to proceed.`);
        return;
      }
      setStage(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (stage === 3) {
      if (!formData.landStatus) {
        alert('Please select Land Status.');
        return;
      }
      if (!formData.collateralStatus) {
        alert('Please select Collateral Status.');
        return;
      }
      if (!formData.promoterExp) {
        alert('Please select Promoter Track Record.');
        return;
      }
      if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
        setMobileTouched(true);
        alert('Please enter your full name, mobile number, and email address.');
        return;
      }
      if (!mobileValidation.isValid) {
        setMobileTouched(true);
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStage('feasibility_result');
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }, 800);
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

    // Collateral check
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

  // Map all inputs into the PDF payload (using ONLY user-provided information)
  const getPDFData = (): TeaserPDFData => ({
    // Step 1 Feasibility Inputs
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
    bankabilityRating: riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : results.bankabilityRating,
    estimatedLoan: results.estimatedLoan,
    eqPct: results.eqPct,
    debtPct: results.debtPct,
    dscrEstimate: 1.45,
    estInterestRate: '8.85% - 9.40%',

    // Step 2 Bankability Underwriting Inputs
    riskProfileData: riskProfileData || undefined,
    riskScoreOutOf10: comprehensiveRisk.scoreOutOf10
  });

  const handleDownloadTeaser = () => {
    const pdfData = getPDFData();
    generateProjectTeaserPDF(pdfData);
  };

  const handleSaveProjectEdits = () => {
    if (!formData.projectName.trim()) {
      alert('Please enter your Project Name before saving.');
      return;
    }
    const computed = computeResults();
    const activeBankability = riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : String(computed.bankabilityRating);
    const updatedPayload = {
      projectName: formData.projectName,
      industry: formData.industry,
      location: formData.location,
      totalCostCr: formData.totalCostCr,
      promoterContribCr: formData.promoterContribCr,
      loanRequiredCr: formData.loanRequiredCr,
      landStatus: formData.landStatus,
      collateralStatus: formData.collateralStatus,
      promoterExp: formData.promoterExp,
      notes: formData.description,
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      feasibilityScore: computed.feasibilityScore,
      bankabilityRating: activeBankability,
      riskProfileData: riskProfileData || undefined
    };

    if (editingProject?.id) {
      updateLeadRecord(editingProject.id, updatedPayload, formData.fullName || 'Promoter');
    } else {
      saveLeadRecord({
        ...updatedPayload,
        source: 'Project Assessment Form',
        downloadedPDF: false
      });
    }

    setSaveSuccessMessage('Project details updated successfully!');
    setTimeout(() => {
      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      } else if (onFinishEditing) {
        onFinishEditing();
      }
    }, 1200);
  };

  const handleGoToDashboard = () => {
    // Save project if not already saved
    const computed = computeResults();
    const activeBankability = riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : String(computed.bankabilityRating);
    const payload = {
      projectName: formData.projectName || 'Greenfield Project',
      industry: formData.industry,
      location: formData.location,
      totalCostCr: formData.totalCostCr,
      promoterContribCr: formData.promoterContribCr,
      loanRequiredCr: formData.loanRequiredCr,
      landStatus: formData.landStatus,
      collateralStatus: formData.collateralStatus,
      promoterExp: formData.promoterExp,
      notes: formData.description,
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      feasibilityScore: computed.feasibilityScore,
      bankabilityRating: activeBankability,
      riskProfileData: riskProfileData || undefined
    };

    if (editingProject?.id) {
      updateLeadRecord(editingProject.id, payload, formData.fullName || 'Promoter');
    } else {
      saveLeadRecord({
        ...payload,
        source: 'Project Assessment Flow',
        downloadedPDF: false
      });
    }

    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else if (onFinishEditing) {
      onFinishEditing();
    }
  };

  // Cost numbers
  const costLakhs = (cost * 100).toFixed(2);
  const loanCr = parseFloat(formData.loanRequiredCr) || (cost * (results.debtPct / 100));
  const loanLakhs = (loanCr * 100).toFixed(2);
  const contribLakhs = (contrib * 100).toFixed(2);

  const consultancyLakhs = (parseFloat(costLakhs) * 0.02).toFixed(2);
  const machineryLakhs = (parseFloat(costLakhs) * 0.68).toFixed(2);
  const civilLakhs = (parseFloat(costLakhs) * 0.30).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{editingProject ? 'Edit Project Assessment' : 'Project Evaluation'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-manrope">
            {editingProject ? `Edit: ${formData.projectName || editingProject.projectName}` : 'Greenfield Project Assessment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2">
            {editingProject
              ? 'Update your project parameters, cost structure, land and risk inputs, and re-evaluate underwriting scores.'
              : 'Calculate your project feasibility, underwriting bankability score, and sample executive teaser.'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 space-y-6">

        {/* Editing Mode Banner */}
        {editingProject && (
          <div className="bg-blue-600 text-white px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                  Interactive Assessment Editing
                </span>
                <p className="text-xs font-semibold text-white">
                  Editing project parameters for <strong>{formData.projectName || editingProject.projectName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveProjectEdits}
                className="flex-1 sm:flex-none px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save Updates</span>
              </button>

              {onFinishEditing && (
                <button
                  type="button"
                  onClick={onFinishEditing}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Save Success Toast Banner */}
        {saveSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage} Returning to your dashboard...</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1: STEPS 1, 2, 3 FORM                                                */}
        {/* ========================================================================= */}
        {(stage === 1 || stage === 2 || stage === 3) && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
            {/* Steps Progress */}
            <div className="bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-800 text-white">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  className="flex items-center gap-2 text-left group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${stage >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    1
                  </div>
                  <span className={`text-xs font-semibold ${stage === 1 ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    Project Details
                  </span>
                </button>

                <div className={`h-0.5 flex-1 mx-2 sm:mx-3 ${stage >= 2 ? 'bg-blue-600' : 'bg-slate-800'}`} />

                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="flex items-center gap-2 text-left group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${stage >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    2
                  </div>
                  <span className={`text-xs font-semibold ${stage === 2 ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    Financial Details
                  </span>
                </button>

                <div className={`h-0.5 flex-1 mx-2 sm:mx-3 ${stage >= 3 ? 'bg-blue-600' : 'bg-slate-800'}`} />

                <button
                  type="button"
                  onClick={() => setStage(3)}
                  className="flex items-center gap-2 text-left group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${stage >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    3
                  </div>
                  <span className={`text-xs font-semibold ${stage === 3 ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    Readiness &amp; Contact
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleNextStep} className="p-4 sm:p-8 space-y-6">
              {/* STEP 1: PROJECT DETAILS */}
              {stage === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Step 1: Project Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter your project name, industry sector, and location.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="Enter your project name (e.g. Bionex CNG, Solar Power Plant)"
                        required
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium text-gray-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Industry / Sector <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium ${
                          formData.industry ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled hidden>Select Industry / Sector</option>
                        {formData.industry && !['Renewable Energy & CBG / Bio-Gas', 'Solar & Wind Power Infrastructure', 'Renewable Energy & Solar', 'Manufacturing & Heavy Industry', 'Food Processing & Cold Chain', 'Pharmaceuticals & Healthcare', 'Pharmaceuticals & Life Sciences', 'Textiles & Apparel', 'Real Estate & Commercial Infra', 'Hospitality & Commercial', 'Logistics & Warehousing', 'Chemicals & Fertilizers', 'Specialty Chemicals', 'Hotels & Hospitality', 'Data Centers & Tech Parks', 'Other Greenfield Sector'].includes(formData.industry) && (
                          <option value={formData.industry} className="text-gray-900">{formData.industry}</option>
                        )}
                        <option value="Renewable Energy & CBG / Bio-Gas" className="text-gray-900">Renewable Energy &amp; CBG / Bio-Gas</option>
                        <option value="Solar & Wind Power Infrastructure" className="text-gray-900">Solar &amp; Wind Power Infrastructure</option>
                        <option value="Renewable Energy & Solar" className="text-gray-900">Renewable Energy &amp; Solar</option>
                        <option value="Manufacturing & Heavy Industry" className="text-gray-900">Manufacturing &amp; Heavy Industry</option>
                        <option value="Food Processing & Cold Chain" className="text-gray-900">Food Processing &amp; Cold Chain</option>
                        <option value="Pharmaceuticals & Healthcare" className="text-gray-900">Pharmaceuticals &amp; Healthcare</option>
                        <option value="Pharmaceuticals & Life Sciences" className="text-gray-900">Pharmaceuticals &amp; Life Sciences</option>
                        <option value="Textiles & Apparel" className="text-gray-900">Textiles &amp; Apparel</option>
                        <option value="Real Estate & Commercial Infra" className="text-gray-900">Real Estate &amp; Commercial Infra</option>
                        <option value="Hotels & Hospitality" className="text-gray-900">Hotels &amp; Hospitality</option>
                        <option value="Hospitality & Commercial" className="text-gray-900">Hospitality &amp; Commercial</option>
                        <option value="Logistics & Warehousing" className="text-gray-900">Logistics &amp; Warehousing</option>
                        <option value="Chemicals & Fertilizers" className="text-gray-900">Chemicals &amp; Fertilizers</option>
                        <option value="Specialty Chemicals" className="text-gray-900">Specialty Chemicals</option>
                        <option value="Data Centers & Tech Parks" className="text-gray-900">Data Centers &amp; Tech Parks</option>
                        <option value="Other Greenfield Sector" className="text-gray-900">Other Greenfield Sector</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <LocationDropdowns
                        value={formData.location}
                        onChange={(loc) => setFormData((prev) => ({ ...prev, location: loc }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {editingProject ? (
                      <button
                        type="button"
                        onClick={handleSaveProjectEdits}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Updates Now</span>
                      </button>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Step 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: FINANCIAL DETAILS & STRICT EQUITY CHECK */}
              {stage === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blue-600" />
                      Step 2: Financial Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Input your project cost and equity contribution in ₹ Crores.
                    </p>
                  </div>

                  {step2Error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{step2Error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Total Project Cost (₹ Cr) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="totalCostCr"
                          value={formData.totalCostCr}
                          onChange={handleInputChange}
                          placeholder="Enter total project cost in ₹ Cr"
                          required
                          className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        How much money do you have for the project in your hand? (Promoter Equity ₹ Cr) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="promoterContribCr"
                          value={formData.promoterContribCr}
                          onChange={handleInputChange}
                          placeholder="Enter promoter equity in hand in ₹ Cr"
                          required
                          className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Loan Needed (₹ Cr)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          name="loanRequiredCr"
                          value={formData.loanRequiredCr}
                          onChange={handleInputChange}
                          placeholder="Automatically calculated"
                          readOnly
                          className="w-full pl-7 pr-3 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl font-bold text-blue-900 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Equity Banner with Dynamic Color & Validation Check */}
                  {cost > 0 && contrib > 0 && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border transition-all ${
                        isEquityEligible
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <span className="font-bold">
                        Equity: {equityPercent}% | Loan: {debtPercent}%
                      </span>
                      <span className={`font-bold flex items-center gap-1 ${isEquityEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isEquityEligible ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>✓ Meets minimum 20% equity criteria</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>⚠️ Equity below minimum 20% requirement (Banks require min 20% promoter contribution)</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStage(1)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {editingProject && (
                        <button
                          type="button"
                          onClick={handleSaveProjectEdits}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Updates</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        className={`px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          isEquityEligible
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-slate-400 hover:bg-slate-500'
                        }`}
                      >
                        <span>Proceed to Step 3</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: READINESS & CONTACT */}
              {stage === 3 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Step 3: Readiness &amp; Contact Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Provide land status, collateral, promoter experience, and contact info.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Land Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="landStatus"
                        value={formData.landStatus}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                          formData.landStatus ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled hidden>Select Land Status</option>
                        {formData.landStatus && !['Owned & Registered', 'Land Owned & Registered', 'Leased / Govt Allotted', 'Industrial Lease Signed', 'TSIIC / Industrial Park Allotted', 'MoU Signed / Under Acquisition', 'Land Selection Pending'].includes(formData.landStatus) && (
                          <option value={formData.landStatus} className="text-gray-900">{formData.landStatus}</option>
                        )}
                        <option value="Owned & Registered" className="text-gray-900">Owned &amp; Registered</option>
                        <option value="Land Owned & Registered" className="text-gray-900">Land Owned &amp; Registered</option>
                        <option value="Leased / Govt Allotted" className="text-gray-900">Leased / Govt Allotted</option>
                        <option value="Industrial Lease Signed" className="text-gray-900">Industrial Lease Signed</option>
                        <option value="TSIIC / Industrial Park Allotted" className="text-gray-900">TSIIC / Industrial Park Allotted</option>
                        <option value="MoU Signed / Under Acquisition" className="text-gray-900">MoU Signed / Under Acquisition</option>
                        <option value="Land Selection Pending" className="text-gray-900">Land Selection Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Collateral / Mortgage Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="collateralStatus"
                        value={formData.collateralStatus}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                          formData.collateralStatus ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled hidden>Select Collateral Status</option>
                        {formData.collateralStatus && !['Freehold (Clear Title)', 'Prime Land & Building Mortgage', 'Plant & Machinery Hypothecation', 'Factory Premises & Fixed Assets', 'Leasehold (Bank Clause)', 'Govt. Allotted Land', 'Under Mortgage / Encumbered', 'Agricultural / Conversion Pending'].includes(formData.collateralStatus) && (
                          <option value={formData.collateralStatus} className="text-gray-900">{formData.collateralStatus}</option>
                        )}
                        <option value="Freehold (Clear Title)" className="text-gray-900">Freehold (Clear Title)</option>
                        <option value="Prime Land & Building Mortgage" className="text-gray-900">Prime Land &amp; Building Mortgage</option>
                        <option value="Plant & Machinery Hypothecation" className="text-gray-900">Plant &amp; Machinery Hypothecation</option>
                        <option value="Factory Premises & Fixed Assets" className="text-gray-900">Factory Premises &amp; Fixed Assets</option>
                        <option value="Leasehold (Bank Clause)" className="text-gray-900">Leasehold (Bank Clause)</option>
                        <option value="Govt. Allotted Land" className="text-gray-900">Govt. Allotted Land</option>
                        <option value="Under Mortgage / Encumbered" className="text-gray-900">Under Mortgage / Encumbered</option>
                        <option value="Agricultural / Conversion Pending" className="text-gray-900">Agricultural / Conversion Pending</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Promoter Track Record <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="promoterExp"
                        value={formData.promoterExp}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                          formData.promoterExp ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled hidden>Select Promoter Track Record</option>
                        {formData.promoterExp && !['10+ Years (Industry Veteran)', '12+ Years Manufacturing', '10+ Years Pharma R&D', '8+ Years Hospitality & Infrastructure', '5-10 Years (Established Player)', '3-5 Years (Relevant Sector)', '0-3 Years (First-Time Promoter)'].includes(formData.promoterExp) && (
                          <option value={formData.promoterExp} className="text-gray-900">{formData.promoterExp}</option>
                        )}
                        <option value="10+ Years (Industry Veteran)" className="text-gray-900">10+ Years (Industry Veteran)</option>
                        <option value="12+ Years Manufacturing" className="text-gray-900">12+ Years Manufacturing</option>
                        <option value="10+ Years Pharma R&D" className="text-gray-900">10+ Years Pharma R&amp;D</option>
                        <option value="8+ Years Hospitality & Infrastructure" className="text-gray-900">8+ Years Hospitality &amp; Infrastructure</option>
                        <option value="5-10 Years (Established Player)" className="text-gray-900">5-10 Years (Established Player)</option>
                        <option value="3-5 Years (Relevant Sector)" className="text-gray-900">3-5 Years (Relevant Sector)</option>
                        <option value="0-3 Years (First-Time Promoter)" className="text-gray-900">0-3 Years (First-Time Promoter)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Project Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        rows={2}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter brief project description (e.g. proposed capacity, plant details)"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contact Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Mobile Number *</label>
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
                          placeholder="Enter your 10-digit mobile number"
                          maxLength={10}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {mobileTouched && !mobileValidation.isValid && (
                          <p className="text-[11px] text-red-600 mt-1">{mobileValidation.error}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your email address"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStage(2)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {editingProject && (
                        <button
                          type="button"
                          onClick={handleSaveProjectEdits}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Updates</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>Evaluating...</span>
                        ) : (
                          <>
                            <Calculator className="w-4 h-4" />
                            <span>Get Feasibility Result</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1 RESULT: FEASIBILITY CHECK RESULT                                   */}
        {/* ========================================================================= */}
        {stage === 'feasibility_result' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-400">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Feasibility Result Available</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-manrope">
                  {formData.projectName || 'Greenfield Project'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formData.industry} • {formData.location}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editingProject && (
                  <button
                    onClick={handleSaveProjectEdits}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project Updates</span>
                  </button>
                )}

                <button
                  onClick={() => setStage(1)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Edit Inputs</span>
                </button>
              </div>
            </div>

            {/* Feasibility Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 text-white rounded-2xl">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Feasibility Check
                </span>
                <div className="text-2xl sm:text-3xl font-black font-manrope">
                  {getFeasibilityTerm(results.feasibilityScore)}
                </div>
                <p className="text-xs text-slate-300 mt-1">Score: {results.feasibilityScore}/100</p>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                  Estimated Loan Needed
                </span>
                <div className="text-2xl sm:text-3xl font-black text-blue-950 font-manrope">
                  ₹ {results.estimatedLoan} <span className="text-sm font-semibold">Cr</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">Promoter: ₹ {formData.promoterContribCr} Cr ({results.eqPct}%)</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Land &amp; Collateral
                </span>
                <div className="text-base font-bold text-slate-900">
                  {formData.landStatus}
                </div>
                <p className="text-xs text-slate-600 mt-1">{formData.collateralStatus}</p>
              </div>
            </div>

            {/* Simple Direct Next Action */}
            <div className="pt-3 flex items-center justify-end border-t border-slate-100">
              <button
                onClick={() => {
                  setStage('collect_bankability');
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Bankability Rating</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2 INPUT: DETAILED RISK PROFILE FOR BANKABILITY RATING                */}
        {/* ========================================================================= */}
        {stage === 'collect_bankability' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStage('feasibility_result')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Feasibility Result</span>
              </button>

              <div className="flex items-center gap-2">
                {editingProject && (
                  <button
                    type="button"
                    onClick={handleSaveProjectEdits}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project Updates</span>
                  </button>
                )}
                <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Step 2: Bankability Underwriting Form
                </div>
              </div>
            </div>

            <DetailedRiskProfileForm
              defaultEquityPercent={results.eqPct}
              defaultPromoterExpYears={formData.promoterExp ? parseInt(formData.promoterExp) || 8 : 8}
              initialData={riskProfileData}
              onSubmitSuccess={(data) => {
                setRiskProfileData(data);
                setStage('bankability_result');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              sectionId="bankability-form-section"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2 RESULT: BANKABILITY RATING RESULT                                  */}
        {/* ========================================================================= */}
        {stage === 'bankability_result' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-400">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bankability Rating Computed</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-manrope">
                  Bankability Rating: {riskProfileData ? comprehensiveRisk.scoreOutOf10.toFixed(1) : results.bankabilityRating} / 10
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Project: {formData.projectName} • Industry: {formData.industry}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editingProject && (
                  <button
                    type="button"
                    onClick={handleSaveProjectEdits}
                    className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project Updates</span>
                  </button>
                )}
                <button
                  onClick={() => setStage('collect_bankability')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Edit Underwriting Inputs</span>
                </button>
              </div>
            </div>

            {/* Direct Bankability Overview Based Purely on User Inputs */}
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                    Underwriting Bankability Grade
                  </span>
                  <span className="text-[11px] font-semibold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50">
                    {comprehensiveRisk.ratingLabel}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black font-manrope my-1 text-white">
                  {riskProfileData ? comprehensiveRisk.scoreOutOf10.toFixed(1) : results.bankabilityRating} <span className="text-xl font-normal text-blue-200">/ 10</span>
                </div>
                <p className="text-xs text-slate-300">
                  {riskProfileData?.businessConstitution || 'Corporate Entity'} • {riskProfileData?.businessVintage || 'Established Unit'} • Collateral: {riskProfileData?.collateralCoveragePct || '100'}%
                </p>
              </div>

              <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-col gap-3 sm:border-l sm:border-slate-800 sm:pl-6 text-left sm:text-right">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Feasibility Score</span>
                  <span className="text-base font-bold text-emerald-400">
                    {results.feasibilityScore}/100 ({getFeasibilityTerm(results.feasibilityScore)})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Promoter Credit Track</span>
                  <span className="text-base font-bold text-white">
                    {riskProfileData?.isNewToCredit ? 'New to Credit' : `${riskProfileData?.cibilScore || '785'} CIBIL`}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Structuring Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Project Outlay</div>
                <div className="text-lg font-black text-slate-900 font-manrope mt-0.5">₹ {formData.totalCostCr} Cr</div>
                <div className="text-xs text-slate-500 mt-0.5">₹ {costLakhs} Lakhs capex</div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Required Bank Loan</div>
                <div className="text-lg font-black text-blue-900 font-manrope mt-0.5">₹ {results.estimatedLoan} Cr</div>
                <div className="text-xs text-blue-700 mt-0.5">{results.debtPct}% Debt allocation</div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Promoter Equity</div>
                <div className="text-lg font-black text-emerald-900 font-manrope mt-0.5">₹ {formData.promoterContribCr} Cr</div>
                <div className="text-xs text-emerald-700 mt-0.5">{results.eqPct}% Equity contribution</div>
              </div>
            </div>

            {/* Next Steps & Action Banner */}
            <div className="p-5 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-manrope flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Assessment &amp; Bankability Completed</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your project details are ready. Go to your dashboard to track status or download the sample teaser directly.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadTeaser}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Sample Teaser</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Book Consultation</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
