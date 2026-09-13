import React, { useState, useEffect, useRef } from 'react';
import { generateProjectTeaserPDF, sendLeadToWhatsApp, TeaserPDFData } from '../utils/pdfGenerator';
import { generateProjectTeaserDOCX } from '../utils/docxGenerator';
import { getFeasibilityTerm, AuthUser, UserRole, PromoterDetail } from '../types';
import { LocationDropdowns } from './LocationDropdowns';
import { validateIndianMobileNumber } from '../utils/validation';
import { DetailedRiskProfileForm, DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { calculateComprehensiveRiskScore } from '../utils/underwritingScorer';
import { updateLeadRecord, saveLeadRecord } from '../utils/leadStore';
import { reconcileProjectFinancials } from '../utils/financialUtils';
import { MembershipPlansModal } from './MembershipPlansModal';
import { DPRRequestModal } from './DPRRequestModal';
import { FundingRequestModal } from './FundingRequestModal';
import { recordAssessmentCompletion } from '../utils/membershipStore';
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
  LayoutDashboard,
  FileType,
  TrendingUp,
  Percent,
  Coins,
  FileCheck,
  ExternalLink,
  Clock,
  MapPin,
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Shield,
  Crown,
  Star,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface ProjectAssessmentPageProps {
  onOpenConsultation: () => void;
  defaultIndustry?: string;
  editingProject?: any;
  onFinishEditing?: () => void;
  onNavigateToDashboard?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: (mode?: 'login' | 'signup' | 'forgot-password', prefill?: { email?: string; name?: string; phone?: string }) => void;
  onLoginSuccess?: (user: AuthUser) => void;
}

type AssessmentStage =
  | 1
  | 2
  | 3
  | 'feasibility_result'
  | 'collect_bankability'
  | 'bankability_result'
  | 'collect_financials'
  | 'final_assessment_results';

export const ProjectAssessmentPage: React.FC<ProjectAssessmentPageProps> = ({
  onOpenConsultation,
  defaultIndustry = '',
  editingProject,
  onFinishEditing,
  onNavigateToDashboard,
  currentUser,
  onOpenAuth,
  onLoginSuccess
}) => {
  const [stage, setStage] = useState<AssessmentStage>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [step2Error, setStep2Error] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(editingProject?.id || null);
  const createdProjectIdRef = useRef<string | null>(editingProject?.id || null);
  const isSavingRef = useRef<boolean>(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Authentication State
  const [activeUser, setActiveUser] = useState<AuthUser | null>(() => {
    if (currentUser) return currentUser;
    try {
      const stored = localStorage.getItem('inisio_active_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });
  const [authNotice, setAuthNotice] = useState('');

  // Inline Quick Auth Form State on Final Step
  const [inlineAuthMode, setInlineAuthMode] = useState<'login' | 'signup'>('login');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineName, setInlineName] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineAuthLoading, setInlineAuthLoading] = useState(false);
  const [inlineAuthError, setInlineAuthError] = useState('');
  const [inlineAuthSuccess, setInlineAuthSuccess] = useState('');
  const [showInlinePassword, setShowInlinePassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  // Stage 2 Inputs: Risk Profile Data for Bankability Rating
  const [riskProfileData, setRiskProfileData] = useState<DetailedRiskProfileData | null>(null);

  // Stage 1 Form State: Initial 3 Steps (All blank by default - no forced pre-selection)
  const [financials, setFinancials] = useState<{
    consultancyCostCr: string;
    machineryCostCr: string;
    civilCostCr: string;
    otherCostsCr: string;
    termLoanCr: string;
    promoterContributionCr: string;
    otherFinanceCr: string;
    totalProjectCost?: string;
    totalMeansOfFinance?: string;
  }>({
    consultancyCostCr: '',
    machineryCostCr: '',
    civilCostCr: '',
    otherCostsCr: '',
    termLoanCr: '',
    promoterContributionCr: '',
    otherFinanceCr: '',
    totalProjectCost: '',
    totalMeansOfFinance: ''
  });

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
    email: '',
    numPromoters: 1
  });

  const [numPromoters, setNumPromoters] = useState<number>(1);
  const [additionalPromoters, setAdditionalPromoters] = useState<Array<{
    id: string;
    name: string;
    experienceYears: string;
    qualification: string;
  }>>([]);

  const mobileValidation = validateIndianMobileNumber(formData.mobile);

  // Helper to build full promoters list for persistence
  const buildPromotersList = (): PromoterDetail[] => {
    const primaryPromoter: PromoterDetail = {
      id: 'p-1',
      name: formData.fullName || 'Lead Promoter',
      experienceYears: formData.promoterExp || '5+ Years',
      qualification: riskProfileData?.educationalBackground || 'Post Graduate / Professional',
      shareholdingPct: numPromoters > 1 ? Math.round(100 / numPromoters) : 100,
      role: 'Managing Director / Lead Promoter',
      kycStatus: 'Verified'
    };

    const extraPromoters: PromoterDetail[] = additionalPromoters.slice(0, Math.max(0, numPromoters - 1)).map((p, idx) => ({
      id: p.id || `p-${idx + 2}`,
      name: p.name || `Co-Promoter ${idx + 2}`,
      experienceYears: p.experienceYears || '5 Years',
      qualification: p.qualification || 'Graduate / Professional',
      shareholdingPct: Math.round(100 / numPromoters),
      role: 'Director / Co-Promoter',
      kycStatus: 'Pending'
    }));

    return [primaryPromoter, ...extraPromoters];
  };

  // Sync additional promoters array when numPromoters changes
  const handleNumPromotersChange = (newCount: number) => {
    setNumPromoters(newCount);
    setFormData(prev => ({ ...prev, numPromoters: newCount }));
    const countNeeded = Math.max(0, newCount - 1);
    setAdditionalPromoters(prev => {
      const updated = [...prev];
      while (updated.length < countNeeded) {
        const nextIdx = updated.length + 2;
        updated.push({
          id: `p-${nextIdx}`,
          name: '',
          experienceYears: '',
          qualification: 'B.Tech / Engineering'
        });
      }
      return updated.slice(0, countNeeded);
    });
  };

  const handleUpdateAdditionalPromoter = (index: number, field: 'name' | 'experienceYears' | 'qualification', value: string) => {
    setAdditionalPromoters(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleAddSinglePromoter = () => {
    const newCount = numPromoters + 1;
    handleNumPromotersChange(newCount);
  };

  const handleRemoveSinglePromoter = (indexToRemove: number) => {
    if (numPromoters <= 1) return;
    setAdditionalPromoters(prev => prev.filter((_, idx) => idx !== indexToRemove));
    const newCount = Math.max(1, numPromoters - 1);
    setNumPromoters(newCount);
    setFormData(prev => ({ ...prev, numPromoters: newCount }));
  };

  // Pre-fill inputs when editing a project
  React.useEffect(() => {
    let activeUser: any = null;
    try {
      const stored = localStorage.getItem('inisio_active_user');
      if (stored) activeUser = JSON.parse(stored);
    } catch (e) {}

    if (editingProject) {
      if (editingProject.id || editingProject._id) {
        const pId = editingProject.id || editingProject._id;
        setCreatedProjectId(pId);
        createdProjectIdRef.current = pId;
        setIsDataSaved(true);
      }

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

      const projCost = parseFloat(String(editingProject.totalCostCr)) || 10;
      const projContrib = parseFloat(String(editingProject.promoterContribCr)) || (projCost * 0.25);
      const projLoan = parseFloat(String(editingProject.loanRequiredCr)) || (projCost - projContrib);

      setFormData({
        projectName: editingProject.projectName || '',
        industry: editingProject.industry || defaultIndustry || '',
        location: editingProject.location || '',
        totalCostCr: String(editingProject.totalCostCr || projCost),
        promoterContribCr: String(editingProject.promoterContribCr || projContrib),
        loanRequiredCr: String(editingProject.loanRequiredCr || projLoan),
        landStatus: editingProject.landStatus || '',
        collateralStatus: editingProject.collateralStatus || '',
        promoterExp: editingProject.promoterExp || '',
        description: editingProject.notes || editingProject.description || '',
        fullName: contactFullName,
        mobile: contactMobile,
        email: contactEmail,
        numPromoters: editingProject.promotersList?.length ? editingProject.promotersList.length : 1
      });

      if (editingProject.promotersList && editingProject.promotersList.length > 1) {
        setNumPromoters(editingProject.promotersList.length);
        const extras = editingProject.promotersList.slice(1).map((p: any, idx: number) => ({
          id: p.id || `p-${idx + 2}`,
          name: p.name || '',
          experienceYears: String(p.experienceYears || '5 Years'),
          qualification: p.qualification || 'Graduate / Professional'
        }));
        setAdditionalPromoters(extras);
      } else {
        setNumPromoters(1);
        setAdditionalPromoters([]);
      }

      // Pre-fill Underwriting / Bankability Risk Profile
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

      if (editingProject.financials) {
        setFinancials({
          consultancyCostCr: editingProject.financials.consultancyCostCr ? String(editingProject.financials.consultancyCostCr) : (projCost * 0.05).toFixed(2),
          machineryCostCr: editingProject.financials.machineryCostCr ? String(editingProject.financials.machineryCostCr) : (projCost * 0.65).toFixed(2),
          civilCostCr: editingProject.financials.civilCostCr ? String(editingProject.financials.civilCostCr) : (projCost * 0.25).toFixed(2),
          otherCostsCr: editingProject.financials.otherCostsCr ? String(editingProject.financials.otherCostsCr) : (projCost * 0.05).toFixed(2),
          termLoanCr: editingProject.financials.termLoanCr ? String(editingProject.financials.termLoanCr) : projLoan.toFixed(2),
          promoterContributionCr: editingProject.financials.promoterContributionCr ? String(editingProject.financials.promoterContributionCr) : projContrib.toFixed(2),
          otherFinanceCr: editingProject.financials.otherFinanceCr ? String(editingProject.financials.otherFinanceCr) : '0.00',
          totalProjectCost: editingProject.financials.totalProjectCost ? String(editingProject.financials.totalProjectCost) : projCost.toFixed(2),
          totalMeansOfFinance: editingProject.financials.totalMeansOfFinance ? String(editingProject.financials.totalMeansOfFinance) : projCost.toFixed(2)
        });
      } else {
        setFinancials({
          consultancyCostCr: (projCost * 0.05).toFixed(2),
          machineryCostCr: (projCost * 0.65).toFixed(2),
          civilCostCr: (projCost * 0.25).toFixed(2),
          otherCostsCr: (projCost * 0.05).toFixed(2),
          termLoanCr: projLoan.toFixed(2),
          promoterContributionCr: projContrib.toFixed(2),
          otherFinanceCr: '0.00',
          totalProjectCost: projCost.toFixed(2),
          totalMeansOfFinance: projCost.toFixed(2)
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
  }, [editingProject?.id, defaultIndustry]);

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
  }, [editingProject?.id]);

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

      // Automatically sync Means of Finance and benchmark Capex from Step 2 inputs
      const currentCost = parseFloat(formData.totalCostCr) || 0;
      const currentContrib = parseFloat(formData.promoterContribCr) || 0;
      const currentLoan = Math.max(0, currentCost - currentContrib);

      const benchmarkFin = reconcileProjectFinancials({
        totalCostCr: currentCost,
        loanRequiredCr: currentLoan,
        promoterContribCr: currentContrib,
        consultancyCostCr: financials.consultancyCostCr,
        machineryCostCr: financials.machineryCostCr,
        civilCostCr: financials.civilCostCr,
        otherCostsCr: financials.otherCostsCr,
        termLoanCr: financials.termLoanCr,
        promoterContributionCr: financials.promoterContributionCr,
        otherFinanceCr: financials.otherFinanceCr
      });

      setFinancials(prev => ({
        ...prev,
        termLoanCr: currentLoan > 0 ? currentLoan.toFixed(2) : (prev.termLoanCr || benchmarkFin.termLoanFormatted),
        promoterContributionCr: currentContrib > 0 ? currentContrib.toFixed(2) : (prev.promoterContributionCr || benchmarkFin.promoterContributionFormatted),
        otherFinanceCr: prev.otherFinanceCr || '0.00',
        consultancyCostCr: prev.consultancyCostCr || benchmarkFin.consultancyFormatted,
        machineryCostCr: prev.machineryCostCr || benchmarkFin.machineryFormatted,
        civilCostCr: prev.civilCostCr || benchmarkFin.civilFormatted,
        otherCostsCr: prev.otherCostsCr || benchmarkFin.otherCostsFormatted,
        totalProjectCost: currentCost > 0 ? currentCost.toFixed(2) : benchmarkFin.totalCostFormatted,
        totalMeansOfFinance: currentCost > 0 ? currentCost.toFixed(2) : benchmarkFin.totalFinanceFormatted
      }));

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

  // Map all inputs into the PDF payload (using fully reconciled and verified financial figures)
  const getPDFData = (): TeaserPDFData => {
    // Dynamic indicative DSCR calculation
    const calculatedDscr = results.debtPct > 75 ? 1.48 : results.debtPct > 65 ? 1.72 : 1.95;

    const reconciled = reconcileProjectFinancials({
      totalCostCr: formData.totalCostCr,
      loanRequiredCr: formData.loanRequiredCr,
      promoterContribCr: formData.promoterContribCr,
      debtPct: results.debtPct,
      eqPct: results.eqPct,
      consultancyCostCr: financials.consultancyCostCr,
      machineryCostCr: financials.machineryCostCr,
      civilCostCr: financials.civilCostCr,
      otherCostsCr: financials.otherCostsCr,
      termLoanCr: financials.termLoanCr,
      promoterContributionCr: financials.promoterContributionCr,
      otherFinanceCr: financials.otherFinanceCr
    });

    const promotersList = buildPromotersList();
    const directors = promotersList.map(p => ({
      name: p.name,
      title: p.role || 'Director / Promoter'
    }));

    return {
      // Step 1 Feasibility Inputs
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      projectName: formData.projectName || 'Greenfield Project',
      industry: formData.industry,
      location: formData.location,
      totalCostCr: reconciled.totalCostFormatted,
      promoterContribCr: reconciled.promoterContributionFormatted,
      loanRequiredCr: reconciled.termLoanFormatted,
      landStatus: formData.landStatus,
      collateralStatus: formData.collateralStatus,
      promoterExp: formData.promoterExp,
      description: formData.description,
      feasibilityScore: results.feasibilityScore,
      bankabilityRating: riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : results.bankabilityRating,
      estimatedLoan: results.estimatedLoan,
      eqPct: reconciled.eqPct,
      debtPct: reconciled.debtPct,
      dscrEstimate: calculatedDscr,
      estInterestRate: '8.85% - 9.40%',
      directors,

      // Step 2 Bankability Underwriting Inputs
      riskProfileData: riskProfileData || undefined,
      riskScoreOutOf10: comprehensiveRisk.scoreOutOf10,
      machineryCostCr: reconciled.machineryFormatted,
      civilCostCr: reconciled.civilFormatted,
      consultancyCostCr: reconciled.consultancyFormatted,
      otherCostsCr: reconciled.otherCostsFormatted,
      termLoanCr: reconciled.termLoanFormatted,
      promoterContributionCr: reconciled.promoterContributionFormatted,
      otherFinanceCr: reconciled.otherFinanceFormatted
    };
  };

  const handleRequireAuth = (mode: 'login' | 'signup' = 'login', reason?: string) => {
    if (reason) {
      setAuthNotice(reason);
    }
    if (onOpenAuth) {
      onOpenAuth(mode, {
        email: formData.email,
        name: formData.fullName,
        phone: formData.mobile
      });
    } else {
      setAuthNotice('Please sign in or create an account to proceed with further steps.');
    }
  };

  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineAuthError('');
    setInlineAuthSuccess('');
    setInlineAuthLoading(true);

    const emailToUse = (inlineEmail || formData.email).trim().toLowerCase();
    const nameToUse = (inlineName || formData.fullName || emailToUse.split('@')[0]).trim();
    const phoneToUse = (inlinePhone || formData.mobile).trim();

    if (!emailToUse) {
      setInlineAuthError('Please enter your email address');
      setInlineAuthLoading(false);
      return;
    }
    if (!inlinePassword || inlinePassword.length < 6) {
      setInlineAuthError('Password must be at least 6 characters');
      setInlineAuthLoading(false);
      return;
    }

    try {
      const endpoint = inlineAuthMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body = inlineAuthMode === 'signup'
        ? { email: emailToUse, password: inlinePassword, name: nameToUse, phone: phoneToUse, role: 'user' }
        : { email: emailToUse, password: inlinePassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      setInlineAuthLoading(false);

      if (res.ok && data.success && data.data) {
        const userData = data.data;
        if (userData.token) {
          localStorage.setItem('inisio_auth_token', userData.token);
        }
        const loggedUser: AuthUser = {
          email: userData.email,
          role: (userData.role as UserRole) || 'user',
          name: userData.name || nameToUse || 'Promoter',
          phone: userData.phone || phoneToUse,
          company: userData.company,
          token: userData.token
        };
        localStorage.setItem('inisio_active_user', JSON.stringify(loggedUser));
        setActiveUser(loggedUser);
        setAuthNotice('');

        // Link current project to user in leadStore
        const computed = computeResults();
        const activeBankability = riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : String(computed.bankabilityRating);
        const activeId = editingProject?.id || createdProjectIdRef.current || createdProjectId;
        const payloadToSave = {
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
          fullName: loggedUser.name,
          mobile: loggedUser.phone || formData.mobile,
          email: loggedUser.email,
          feasibilityScore: computed.feasibilityScore,
          bankabilityRating: activeBankability,
          riskProfileData: riskProfileData || undefined,
          financials: financials,
          promotersList: buildPromotersList()
        };

        if (activeId) {
          updateLeadRecord(activeId, payloadToSave, loggedUser.name);
        } else if (!isSavingRef.current) {
          isSavingRef.current = true;
          saveLeadRecord({
            ...payloadToSave,
            source: 'Project Assessment Flow',
            downloadedPDF: false
          }).then(saved => {
            setCreatedProjectId(saved.id);
            createdProjectIdRef.current = saved.id;
          }).finally(() => {
            isSavingRef.current = false;
          });
        }

        setInlineAuthSuccess(`Signed in successfully as ${loggedUser.name}! Your project has been saved to your dashboard.`);
        if (onLoginSuccess) {
          onLoginSuccess(loggedUser);
        }
      } else {
        setInlineAuthError(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setInlineAuthLoading(false);
      setInlineAuthError('Network error. Please try again.');
    }
  };

  const handleDownloadTeaser = (action: 'download' | 'preview' = 'download') => {
    if (!activeUser) {
      handleRequireAuth('login', 'Please sign in or create an account to preview or download the AI Project Teaser.');
      return;
    }
    setIsDownloadingPdf(true);
    const pdfData = getPDFData();
    generateProjectTeaserPDF(pdfData, action);
    setTimeout(() => setIsDownloadingPdf(false), 1000);
  };

  const handleDownloadDocxTeaser = async () => {
    if (!activeUser) {
      handleRequireAuth('login', 'Please sign in or create an account to download the official AI Project Teaser in DOCX format.');
      return;
    }
    try {
      setIsDownloadingDocx(true);
      const pdfData = getPDFData();
      await generateProjectTeaserDOCX(pdfData);
    } catch (err) {
      console.error('Failed to generate DOCX teaser:', err);
      alert('Could not generate DOCX teaser. Please try again.');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleSaveAndRedirectToOutputs = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.projectName.trim()) {
      alert('Please enter your Project Name before saving.');
      return;
    }

    if (formData.email && !inlineEmail) {
      setInlineEmail(formData.email);
    }
    if (formData.fullName && !inlineName) {
      setInlineName(formData.fullName);
    }
    if (formData.mobile && !inlinePhone) {
      setInlinePhone(formData.mobile);
    }

    const cCost = parseFloat(financials.consultancyCostCr) || 0;
    const mCost = parseFloat(financials.machineryCostCr) || 0;
    const lCost = parseFloat(financials.civilCostCr) || 0;
    const oCost = parseFloat(financials.otherCostsCr) || 0;
    const totalCost = cCost + mCost + lCost + oCost;
    
    const tLoan = parseFloat(financials.termLoanCr) || 0;
    const pContrib = parseFloat(financials.promoterContributionCr) || 0;
    const oFin = parseFloat(financials.otherFinanceCr) || 0;
    const totalFin = tLoan + pContrib + oFin;

    if (totalCost > 0 && totalFin > 0 && Math.abs(totalCost - totalFin) > 0.05) {
      alert(`Total Project Cost (₹${totalCost.toFixed(2)} Cr) must equal Total Means of Finance (₹${totalFin.toFixed(2)} Cr).`);
      return;
    }

    const updatedFinancials = {
      ...financials,
      totalProjectCost: totalCost > 0 ? totalCost.toString() : formData.totalCostCr,
      totalMeansOfFinance: totalFin > 0 ? totalFin.toString() : formData.totalCostCr
    };

    setFinancials(updatedFinancials);

    const computed = computeResults();
    const activeBankability = riskProfileData ? String(comprehensiveRisk.scoreOutOf10) : String(computed.bankabilityRating);
    const updatedPayload = {
      projectName: formData.projectName || 'Greenfield Project',
      industry: formData.industry,
      location: formData.location,
      totalCostCr: updatedFinancials.totalProjectCost,
      promoterContribCr: updatedFinancials.promoterContributionCr || formData.promoterContribCr,
      loanRequiredCr: updatedFinancials.termLoanCr || formData.loanRequiredCr,
      landStatus: formData.landStatus,
      collateralStatus: formData.collateralStatus,
      promoterExp: formData.promoterExp,
      notes: formData.description,
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      feasibilityScore: computed.feasibilityScore,
      bankabilityRating: activeBankability,
      riskProfileData: riskProfileData || undefined,
      financials: updatedFinancials,
      promotersList: buildPromotersList()
    };

    // Guarantee idempotent save: Only save once in the dashboard
    const activeId = editingProject?.id || createdProjectIdRef.current || createdProjectId;
    if (activeId) {
      updateLeadRecord(activeId, updatedPayload, formData.fullName || 'Promoter');
    } else if (!isSavingRef.current) {
      isSavingRef.current = true;
      saveLeadRecord({
        ...updatedPayload,
        source: 'Project Assessment Flow',
        downloadedPDF: false
      }).then(saved => {
        setCreatedProjectId(saved.id);
        createdProjectIdRef.current = saved.id;
      }).finally(() => {
        isSavingRef.current = false;
      });
    }

    setIsDataSaved(true);
    setSaveSuccessMessage('Project assessment saved successfully to your dashboard!');
    recordAssessmentCompletion(formData.email || activeUser?.email);
    setStage('final_assessment_results');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveProjectEdits = async (skipRedirect = false) => {
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
      riskProfileData: riskProfileData || undefined,
      financials: financials,
      promotersList: buildPromotersList()
    };

    const activeId = editingProject?.id || createdProjectIdRef.current || createdProjectId;
    if (activeId) {
      updateLeadRecord(activeId, updatedPayload, formData.fullName || 'Promoter');
    } else if (!isSavingRef.current) {
      isSavingRef.current = true;
      try {
        const saved = await saveLeadRecord({
          ...updatedPayload,
          source: 'Project Assessment Form',
          downloadedPDF: false
        });
        setCreatedProjectId(saved.id);
        createdProjectIdRef.current = saved.id;
      } finally {
        isSavingRef.current = false;
      }
    }

    setSaveSuccessMessage('Project details updated successfully!');
    if (!skipRedirect) {
      setTimeout(() => {
        if (onNavigateToDashboard) {
          onNavigateToDashboard();
        } else if (onFinishEditing) {
          onFinishEditing();
        }
      }, 1200);
    }
  };

  const handleGoToDashboard = async () => {
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
      riskProfileData: riskProfileData || undefined,
      financials: financials,
      promotersList: buildPromotersList()
    };

    const activeId = editingProject?.id || createdProjectIdRef.current || createdProjectId;
    if (activeId) {
      updateLeadRecord(activeId, payload, formData.fullName || 'Promoter');
    } else if (!isSavingRef.current) {
      isSavingRef.current = true;
      try {
        const saved = await saveLeadRecord({
          ...payload,
          source: 'Project Assessment Flow',
          downloadedPDF: false
        });
        setCreatedProjectId(saved.id);
        createdProjectIdRef.current = saved.id;
      } finally {
        isSavingRef.current = false;
      }
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
      <section className="bg-slate-900 text-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free First Project Assessment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-manrope">
            {editingProject ? `Edit: ${formData.projectName || editingProject.projectName}` : 'Greenfield Project Assessment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-inter">
            {editingProject
              ? 'Update your project parameters, cost structure, land and risk inputs, and re-evaluate underwriting scores.'
              : 'Assess your project viability, debt-capacity, and bankability rating before approaching lenders and credit committees.'}
          </p>

          {/* Tangible Outputs Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300 font-medium">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">✓ Bankability Rating (AAA to BBB)</span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">✓ DSCR & Debt Capacity</span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">✓ Means of Finance</span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">✓ Downloadable PDF Teaser</span>
          </div>
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
                onClick={() => handleSaveProjectEdits()}
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

        {/* Quick Section Navigation Bar */}
        <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              type="button"
              onClick={() => {
                setStage(1);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
              <span>Project Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStage(2);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
              <span>Financials &amp; CAPEX</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStage(3);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 3 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">3</span>
              <span>Readiness &amp; Contact</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStage('collect_bankability');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 'collect_bankability' || stage === 'bankability_result' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">4</span>
              <span>Underwriting Scoring</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStage('collect_financials');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 'collect_financials' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">5</span>
              <span>Cost &amp; Finance Breakup</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStage('final_assessment_results');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 'final_assessment_results' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">6</span>
              <span>AI Teaser &amp; Outputs</span>
            </button>
          </div>
        </div>

        {/* Save Success Toast Banner */}
        {saveSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage} {isDataSaved ? '' : 'Returning to your dashboard...'}</span>
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
                        onClick={() => handleSaveProjectEdits()}
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
                        Funding Needed (₹ Cr)
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
                        Equity: {equityPercent}% | Debt: {debtPercent}%
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

                  {/* CAPEX Cost Breakup & Component Sizing Section */}
                  <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Detailed Capital Outlay (CAPEX) Breakup</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Break down your project cost across plant, machinery, civil works, and engineering.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const c = parseFloat(formData.totalCostCr) || 10;
                          const l = parseFloat(formData.loanRequiredCr) || (c * 0.75);
                          const p = parseFloat(formData.promoterContribCr) || (c * 0.25);
                          setFinancials({
                            machineryCostCr: (c * 0.65).toFixed(2),
                            civilCostCr: (c * 0.25).toFixed(2),
                            consultancyCostCr: (c * 0.05).toFixed(2),
                            otherCostsCr: (c * 0.05).toFixed(2),
                            termLoanCr: l.toFixed(2),
                            promoterContributionCr: p.toFixed(2),
                            otherFinanceCr: '0.00',
                            totalProjectCost: c.toFixed(2),
                            totalMeansOfFinance: c.toFixed(2)
                          });
                        }}
                        className="px-3 py-1.5 text-[11px] font-bold bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs w-fit"
                      >
                        Auto-allocate Standard Breakup
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Plant &amp; Machinery (₹ Cr)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={financials.machineryCostCr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFinancials(prev => ({ ...prev, machineryCostCr: val }));
                            }}
                            placeholder="e.g. 6.50"
                            className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Land &amp; Civil Works (₹ Cr)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={financials.civilCostCr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFinancials(prev => ({ ...prev, civilCostCr: val }));
                            }}
                            placeholder="e.g. 2.50"
                            className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Consultancy &amp; Pre-op (₹ Cr)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={financials.consultancyCostCr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFinancials(prev => ({ ...prev, consultancyCostCr: val }));
                            }}
                            placeholder="e.g. 0.50"
                            className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Other / Contingency (₹ Cr)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={financials.otherCostsCr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFinancials(prev => ({ ...prev, otherCostsCr: val }));
                            }}
                            placeholder="e.g. 0.50"
                            className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reconciliation summary */}
                    {(() => {
                      const m = parseFloat(financials.machineryCostCr) || 0;
                      const civ = parseFloat(financials.civilCostCr) || 0;
                      const con = parseFloat(financials.consultancyCostCr) || 0;
                      const oth = parseFloat(financials.otherCostsCr) || 0;
                      const capexSum = m + civ + con + oth;
                      const totalCostInput = parseFloat(formData.totalCostCr) || 0;
                      const diff = Math.abs(capexSum - totalCostInput);
                      const isCapexAligned = totalCostInput === 0 || diff < 0.05;

                      return (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 font-medium">CAPEX Sum Total:</span>
                            <span className="font-bold text-slate-900">₹ {capexSum.toFixed(2)} Cr</span>
                            {totalCostInput > 0 && (
                              <span className="text-slate-400">/ Total Cost: ₹ {totalCostInput.toFixed(2)} Cr</span>
                            )}
                          </div>
                          {!isCapexAligned && (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              Difference of ₹ {diff.toFixed(2)} Cr from Total Cost
                            </span>
                          )}
                          {isCapexAligned && totalCostInput > 0 && (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> 100% Sizing Aligned
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

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
                          onClick={() => handleSaveProjectEdits()}
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

                  {/* Promoter & Contact Info */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
                      <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Promoter &amp; Contact Details</span>
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-gray-600">
                          Number of Promoters:
                        </label>
                        <select
                          value={numPromoters}
                          onChange={(e) => handleNumPromotersChange(Number(e.target.value))}
                          className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value={1}>1 (Single Promoter)</option>
                          <option value={2}>2 Promoters</option>
                          <option value={3}>3 Promoters</option>
                          <option value={4}>4 Promoters</option>
                          <option value={5}>5+ Promoters</option>
                        </select>
                      </div>
                    </div>

                    {/* Primary Promoter Card */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                          Primary Promoter
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Rajesh Malhotra"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
                            placeholder="Enter 10-digit mobile"
                            maxLength={10}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
                            placeholder="promoter@company.com"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Promoters (Rendered dynamically if numPromoters > 1) */}
                    {numPromoters > 1 && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                            Additional Co-Promoters ({additionalPromoters.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddSinglePromoter}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Another Promoter</span>
                          </button>
                        </div>

                        {additionalPromoters.map((promoter, index) => (
                          <div
                            key={promoter.id || index}
                            className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-3 relative"
                          >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="text-[11px] font-bold text-zinc-800">
                                Promoter {index + 2} (Co-Director / Partner)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSinglePromoter(index)}
                                className="text-[10px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Promoter Name *
                                </label>
                                <input
                                  type="text"
                                  value={promoter.name}
                                  onChange={(e) => handleUpdateAdditionalPromoter(index, 'name', e.target.value)}
                                  required
                                  placeholder={`e.g. Co-Promoter ${index + 2}`}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Experience (Years) *
                                </label>
                                <select
                                  value={promoter.experienceYears || ''}
                                  onChange={(e) => handleUpdateAdditionalPromoter(index, 'experienceYears', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                                >
                                  <option value="">Select Experience</option>
                                  <option value="1-3 Years">1-3 Years (Early Career)</option>
                                  <option value="3-5 Years">3-5 Years (Relevant Domain)</option>
                                  <option value="5-10 Years">5-10 Years (Senior Track Record)</option>
                                  <option value="10+ Years">10+ Years (Industry Veteran)</option>
                                  <option value="15+ Years">15+ Years (Executive Experience)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                  Qualification *
                                </label>
                                <select
                                  value={promoter.qualification}
                                  onChange={(e) => handleUpdateAdditionalPromoter(index, 'qualification', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                                >
                                  <option value="B.Tech / Engineering">B.Tech / Engineering</option>
                                  <option value="MBA / Business Management">MBA / Business Management</option>
                                  <option value="Chartered Accountant (CA)">Chartered Accountant (CA)</option>
                                  <option value="Post Graduate / Master's">Post Graduate / Master's</option>
                                  <option value="Doctorate (Ph.D)">Doctorate (Ph.D)</option>
                                  <option value="Graduate / Other">Graduate / Other</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                          onClick={() => handleSaveProjectEdits()}
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
                    onClick={() => handleSaveProjectEdits()}
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
                  Estimated Funding Needed
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
                    onClick={() => handleSaveProjectEdits()}
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
                    onClick={() => handleSaveProjectEdits()}
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
                <div className="text-xs text-slate-500 mt-0.5">₹ {cost.toFixed(2)} Cr capex</div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Required Institutional Debt</div>
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
                  <span>Next Step: Project Financials &amp; Means of Finance</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Enter your project cost breakup and review your means of finance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const currentCost = parseFloat(formData.totalCostCr) || 0;
                    const currentContrib = parseFloat(formData.promoterContribCr) || 0;
                    const currentLoan = Math.max(0, currentCost - currentContrib);

                    setFinancials(prev => ({
                      ...prev,
                      termLoanCr: prev.termLoanCr || (currentLoan > 0 ? currentLoan.toFixed(2) : ''),
                      promoterContributionCr: prev.promoterContributionCr || (currentContrib > 0 ? currentContrib.toFixed(2) : ''),
                      otherFinanceCr: prev.otherFinanceCr || '',
                      consultancyCostCr: prev.consultancyCostCr || '',
                      machineryCostCr: prev.machineryCostCr || '',
                      civilCostCr: prev.civilCostCr || '',
                      otherCostsCr: prev.otherCostsCr || '',
                      totalProjectCost: prev.totalProjectCost || (currentCost > 0 ? currentCost.toFixed(2) : ''),
                      totalMeansOfFinance: prev.totalMeansOfFinance || (currentCost > 0 ? currentCost.toFixed(2) : '')
                    }));

                    setStage('collect_financials');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Next: Financials &amp; Means of Finance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: COLLECT FINANCIALS                                                */}
        {/* ========================================================================= */}
        {stage === 'collect_financials' && (() => {
          const currentCostFromPrev = parseFloat(formData.totalCostCr) || 0;
          const currentContribFromPrev = parseFloat(formData.promoterContribCr) || 0;
          const currentLoanFromPrev = Math.max(0, currentCostFromPrev - currentContribFromPrev);

          const cCost = parseFloat(financials.consultancyCostCr) || 0;
          const mCost = parseFloat(financials.machineryCostCr) || 0;
          const lCost = parseFloat(financials.civilCostCr) || 0;
          const oCost = parseFloat(financials.otherCostsCr) || 0;
          const totalCost = cCost + mCost + lCost + oCost;
          
          const tLoan = parseFloat(financials.termLoanCr) || (currentLoanFromPrev > 0 ? currentLoanFromPrev : 0);
          const pContrib = parseFloat(financials.promoterContributionCr) || (currentContribFromPrev > 0 ? currentContribFromPrev : 0);
          const oFin = parseFloat(financials.otherFinanceCr) || 0;
          const totalFin = (tLoan + pContrib + oFin) || currentCostFromPrev;
          
          const debtPct = totalFin > 0 ? ((tLoan / totalFin) * 100).toFixed(1) : '0.0';
          const eqPct = totalFin > 0 ? ((pContrib / totalFin) * 100).toFixed(1) : '0.0';
          
          const isBalanced = totalCost === 0 || Math.abs(totalCost - totalFin) < 0.05;

          const handleSyncFromPreviousInputs = () => {
            setFinancials(prev => ({
              ...prev,
              termLoanCr: currentLoanFromPrev > 0 ? currentLoanFromPrev.toFixed(2) : '',
              promoterContributionCr: currentContribFromPrev > 0 ? currentContribFromPrev.toFixed(2) : '',
              otherFinanceCr: prev.otherFinanceCr || '',
              totalProjectCost: currentCostFromPrev > 0 ? currentCostFromPrev.toFixed(2) : '',
              totalMeansOfFinance: currentCostFromPrev > 0 ? currentCostFromPrev.toFixed(2) : ''
            }));
          };

          return (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Means of Finance Auto-populated</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-manrope">Project Cost &amp; Means of Finance</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Please enter your project cost breakup amounts below. Means of finance is loaded directly from your project outlay of ₹{currentCostFromPrev.toFixed(2)} Cr.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncFromPreviousInputs}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Reset Means of Finance to match Step 2 inputs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-sync Means of Finance</span>
              </button>
            </div>

            {/* Notification Badge */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Target Outlay:</strong> ₹{currentCostFromPrev.toFixed(2)} Cr • <strong>Term Loan:</strong> ₹{currentLoanFromPrev.toFixed(2)} Cr ({results.debtPct}%) • <strong>Promoter Equity:</strong> ₹{currentContribFromPrev.toFixed(2)} Cr ({results.eqPct}%)
                </span>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-semibold shrink-0">
                Live Synced
              </span>
            </div>

            <div className="space-y-6">
              {/* Cost Breakup */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-500" />
                    <span>Project Cost Breakup</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Enter cost breakup amounts manually</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Consultancy &amp; Pre-op (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.consultancyCostCr}
                      onChange={(e) => setFinancials({...financials, consultancyCostCr: e.target.value})}
                      placeholder="e.g. 2.50"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Plant &amp; Machinery (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.machineryCostCr}
                      onChange={(e) => setFinancials({...financials, machineryCostCr: e.target.value})}
                      placeholder="e.g. 30.00"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Land &amp; Civil Works (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.civilCostCr}
                      onChange={(e) => setFinancials({...financials, civilCostCr: e.target.value})}
                      placeholder="e.g. 15.00"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Other Project Costs (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.otherCostsCr}
                      onChange={(e) => setFinancials({...financials, otherCostsCr: e.target.value})}
                      placeholder="e.g. 2.50"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-xl flex justify-between items-center border border-blue-100">
                  <div>
                    <span className="text-sm font-bold text-blue-900 block">Total Project Cost</span>
                    {totalCost === 0 && (
                      <span className="text-[11px] text-blue-600">Enter component costs above to calculate total</span>
                    )}
                  </div>
                  <span className="text-base font-black text-blue-700">₹ {totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr</span>
                </div>
              </div>

              {/* Means of Finance */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-500" />
                  <span>Means of Finance</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Project Term Debt / Bank Loan (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.termLoanCr !== '' ? financials.termLoanCr : (currentLoanFromPrev > 0 ? currentLoanFromPrev.toFixed(2) : '')}
                      onChange={(e) => setFinancials({...financials, termLoanCr: e.target.value})}
                      placeholder="Enter debt amount..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                    {totalFin > 0 && <div className="text-[10px] font-medium text-emerald-600 text-right">{debtPct}% Allocation</div>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Promoter Contribution / Equity (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.promoterContributionCr !== '' ? financials.promoterContributionCr : (currentContribFromPrev > 0 ? currentContribFromPrev.toFixed(2) : '')}
                      onChange={(e) => setFinancials({...financials, promoterContributionCr: e.target.value})}
                      placeholder="Enter promoter contribution..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                    {totalFin > 0 && <div className="text-[10px] font-medium text-emerald-600 text-right">{eqPct}% Allocation</div>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Other Sources / Grants (Cr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financials.otherFinanceCr}
                      onChange={(e) => setFinancials({...financials, otherFinanceCr: e.target.value})}
                      placeholder="Optional (e.g. 0.00)"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl flex justify-between items-center border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-900">Total Means of Finance</span>
                  <span className="text-base font-black text-emerald-700">₹ {totalFin.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr</span>
                </div>
              </div>
            </div>
            
            {(!isBalanced && totalCost > 0) && (
               <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200 flex items-center justify-between gap-2">
                 <span>Note: Total Project Cost (₹{totalCost.toFixed(2)} Cr) must equal Total Means of Finance (₹{totalFin.toFixed(2)} Cr).</span>
                 <button
                   type="button"
                   onClick={handleSyncFromPreviousInputs}
                   className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                 >
                   Auto-balance Means of Finance
                 </button>
               </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setStage('bankability_result');
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (totalCost > 0 && totalFin > 0 && Math.abs(totalCost - totalFin) > 0.05) {
                    alert(`Total Project Cost (₹${totalCost.toFixed(2)} Cr) must equal Total Means of Finance (₹${totalFin.toFixed(2)} Cr).`);
                    return;
                  }
                  handleSaveAndRedirectToOutputs();
                }}
                disabled={!isBalanced && (totalCost > 0 || totalFin > 0)}
                className="px-6 py-3 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save &amp; View Assessment Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* STAGE 4: FINAL ASSESSMENT RESULTS & DOWNLOADS                              */}
        {/* ========================================================================= */}
        {stage === 'final_assessment_results' && (() => {
          const finResolved = reconcileProjectFinancials({
            totalCostCr: formData.totalCostCr,
            loanRequiredCr: formData.loanRequiredCr,
            promoterContribCr: formData.promoterContribCr,
            debtPct: results.debtPct,
            eqPct: results.eqPct,
            consultancyCostCr: financials.consultancyCostCr,
            machineryCostCr: financials.machineryCostCr,
            civilCostCr: financials.civilCostCr,
            otherCostsCr: financials.otherCostsCr,
            termLoanCr: financials.termLoanCr,
            promoterContributionCr: financials.promoterContributionCr,
            otherFinanceCr: financials.otherFinanceCr
          });

          const cCost = finResolved.consultancyCostCr;
          const mCost = finResolved.machineryCostCr;
          const lCost = finResolved.civilCostCr;
          const oCost = finResolved.otherCostsCr;
          const totalCost = finResolved.totalCostCr;
          
          const tLoan = finResolved.termLoanCr;
          const pContrib = finResolved.promoterContributionCr;
          const oFin = finResolved.otherFinanceCr;
          const totalFin = finResolved.totalFinanceCr;
          
          const debtPctCalc = finResolved.debtPct.toString();
          const eqPctCalc = finResolved.eqPct.toString();
          const dscrValue = (results.debtPct > 75 ? 1.48 : results.debtPct > 65 ? 1.72 : 1.95).toFixed(2);
          const activeBankability = riskProfileData ? comprehensiveRisk.scoreOutOf10.toFixed(1) : results.bankabilityRating;

          return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-400">
              {/* Header Card */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    {activeUser ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Logged in as {activeUser.name} • Project Linked to Dashboard</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold mb-2">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Authentication Required for Downstream Steps</span>
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-manrope">
                      Executive Project Assessment Outputs
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">{formData.projectName || 'Greenfield Project'}</span>
                      <span>•</span>
                      <span>{formData.industry}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {formData.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setStage('collect_financials');
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Adjust Cost &amp; Finance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeUser) {
                          handleRequireAuth('login', 'Please sign in or register to access your personal dashboard and manage this project.');
                          return;
                        }
                        if (onNavigateToDashboard) {
                          onNavigateToDashboard();
                        } else if (onFinishEditing) {
                          onFinishEditing();
                        } else {
                          window.location.href = '/dashboard';
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      {!activeUser && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>View in Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Authentication Notification Banner if triggered by action */}
                {authNotice && !activeUser && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 animate-in fade-in shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="font-extrabold text-amber-900 text-sm mb-0.5">Sign In Required</div>
                      <div className="text-amber-800 font-medium">{authNotice}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRequireAuth('login')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}

                {/* Top 6 Key Outputs Cards Grid */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Key Assessment &amp; Underwriting Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Output 1: Bankability */}
                    <div className="p-5 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl shadow-md border border-blue-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                            1. Bankability Rating
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/30 border border-blue-400/40 rounded-full text-[10px] font-extrabold text-blue-200">
                            {comprehensiveRisk.ratingLabel || 'AAA Rating'}
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black font-manrope my-2 text-white">
                          {activeBankability} <span className="text-base font-normal text-blue-300">/ 10</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-blue-200/90 font-medium pt-2 border-t border-blue-800/80">
                        {riskProfileData?.isNewToCredit ? 'New-to-Credit Profile' : `CIBIL: ${riskProfileData?.cibilScore || '785'} • Collateral: ${riskProfileData?.collateralCoveragePct || '100'}%`}
                      </p>
                    </div>

                    {/* Output 2: Feasibility */}
                    <div className="p-5 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                            2. Feasibility Status
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-[10px] font-extrabold text-emerald-200">
                            {getFeasibilityTerm(results.feasibilityScore)}
                          </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black font-manrope my-2 text-white">
                          {results.feasibilityScore} <span className="text-base font-normal text-emerald-300">/ 100</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-200/90 font-medium pt-2 border-t border-emerald-800/80">
                        Land: {formData.landStatus || 'In Progress'} • Experience: {formData.promoterExp || '5+ Yrs'}
                      </p>
                    </div>

                    {/* Output 3: Total Project CAPEX */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          3. Total Project CAPEX
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-manrope my-2">
                          ₹ {totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-base font-bold text-slate-500">Cr</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                        Machinery: ₹{mCost.toFixed(1)} Cr • Civil: ₹{lCost.toFixed(1)} Cr
                      </div>
                    </div>

                    {/* Output 4: Proposed Debt */}
                    <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                            4. Proposed Debt
                          </span>
                          <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            {debtPctCalc}% Outlay
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-blue-900 font-manrope my-2">
                          ₹ {tLoan.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-base font-bold text-blue-700">Cr</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-blue-700/90 font-medium pt-2 border-t border-blue-200">
                        Target Institutional Term Debt
                      </div>
                    </div>

                    {/* Output 5: Promoter Contribution */}
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            5. Promoter Contribution
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {eqPctCalc}% Equity
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-manrope my-2">
                          ₹ {pContrib.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-base font-bold text-emerald-700">Cr</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-700/90 font-medium pt-2 border-t border-emerald-200">
                        Required In-Hand Equity / Capital Margin
                      </div>
                    </div>

                    {/* Output 6: Indicative DSCR */}
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                            6. Indicative DSCR
                          </span>
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Min: &gt;1.35x
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-950 font-manrope my-2">
                          {dscrValue}x <span className="text-xs font-semibold text-amber-800">(Avg 7-10 Yrs)</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-800/90 font-medium pt-2 border-t border-amber-200">
                        Strong Debt Servicing Coverage Capacity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory / Methodology Notice */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Methodology Disclaimer:</strong> Key underwriting outputs (Bankability Rating, Indicative DSCR, Debt Capacity, and Feasibility Score) are subject to actual statutory audit, Detailed Project Report (DPR), CMA financial modeling, and formal lender credit committee sanction methodology.
                  </span>
                </div>

                {/* Breakdown Summary Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* CAPEX Breakdown */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-manrope">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>CAPEX (Project Cost) Breakdown</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Plant &amp; Machinery</span>
                        <span className="font-bold text-slate-900">₹ {mCost.toFixed(2)} Cr ({totalCost > 0 ? ((mCost / totalCost) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Land &amp; Civil Works</span>
                        <span className="font-bold text-slate-900">₹ {lCost.toFixed(2)} Cr ({totalCost > 0 ? ((lCost / totalCost) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Consultancy &amp; Pre-op</span>
                        <span className="font-bold text-slate-900">₹ {cCost.toFixed(2)} Cr ({totalCost > 0 ? ((cCost / totalCost) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Other Capex &amp; Contingency</span>
                        <span className="font-bold text-slate-900">₹ {oCost.toFixed(2)} Cr ({totalCost > 0 ? ((oCost / totalCost) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-slate-900 text-sm">
                        <span>Total CAPEX Outlay</span>
                        <span className="text-blue-700">₹ {totalCost.toFixed(2)} Cr</span>
                      </div>
                    </div>
                  </div>

                  {/* Means of Finance Breakdown */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-manrope">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <span>Means of Finance Structure</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Institutional Term Loan</span>
                        <span className="font-bold text-blue-700">₹ {tLoan.toFixed(2)} Cr ({debtPctCalc}%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Promoter Equity Contribution</span>
                        <span className="font-bold text-emerald-700">₹ {pContrib.toFixed(2)} Cr ({eqPctCalc}%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Other Sources / Grants</span>
                        <span className="font-bold text-slate-900">₹ {oFin.toFixed(2)} Cr</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-600">Debt-to-Equity Ratio</span>
                        <span className="font-bold text-slate-900">{debtPctCalc}:{eqPctCalc}</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-slate-900 text-sm">
                        <span>Total Means of Finance</span>
                        <span className="text-emerald-700">₹ {totalFin.toFixed(2)} Cr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* AUTHENTICATION GATE CARD (MANDATORY FOR DOWNSTREAM PROCEEDINGS)           */}
              {/* ========================================================================= */}
              {!activeUser ? (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-indigo-500/40 space-y-6 animate-in fade-in">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/80">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Step 6: Login / Sign In to Continue to Further Steps</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-manrope text-white">
                        Sign In or Register to Save Project &amp; Unlock Teaser Downloads
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        You have completed your Greenfield Project Assessment for <span className="text-white font-semibold">{formData.projectName || 'your project'}</span>. To permanently save this record to your Promoter Dashboard, download your official branded AI Project Teaser (.docx &amp; .pdf), and request CA / Lender syndication, please sign in with your account or create a free promoter profile.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRequireAuth('login')}
                        className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In with Existing Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequireAuth('signup')}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Free Account</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Quick Login / Sign Up Form */}
                  <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Instant 1-Click Verification &amp; Project Linking</span>
                      </div>

                      {/* Mode Toggle Tabs */}
                      <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setInlineAuthMode('login');
                            setInlineAuthError('');
                            setInlineAuthSuccess('');
                          }}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            inlineAuthMode === 'login' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineAuthMode('signup');
                            setInlineAuthError('');
                            setInlineAuthSuccess('');
                          }}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            inlineAuthMode === 'signup' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Create Account
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleInlineAuthSubmit} className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {inlineAuthMode === 'signup' && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Full Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={inlineName || formData.fullName}
                              onChange={(e) => setInlineName(e.target.value)}
                              placeholder="e.g. Ramesh Sharma"
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Email Address <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={inlineEmail || formData.email}
                            onChange={(e) => setInlineEmail(e.target.value)}
                            placeholder="e.g. ramesh@example.com"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {inlineAuthMode === 'signup' && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              value={inlinePhone || formData.mobile}
                              onChange={(e) => setInlinePhone(e.target.value)}
                              placeholder="10-digit mobile"
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Password <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showInlinePassword ? 'text' : 'password'}
                              required
                              value={inlinePassword}
                              onChange={(e) => setInlinePassword(e.target.value)}
                              placeholder="Enter password (min 6 chars)"
                              className="w-full px-3.5 py-2.5 pr-9 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowInlinePassword(!showInlinePassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                              {showInlinePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={inlineAuthLoading}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {inlineAuthLoading ? (
                              <span>Processing...</span>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{inlineAuthMode === 'signup' ? 'Register & Unlock Teaser' : 'Sign In & Unlock Teaser'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {inlineAuthError && (
                        <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{inlineAuthError}</span>
                        </div>
                      )}

                      {inlineAuthSuccess && (
                        <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{inlineAuthSuccess}</span>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                        Verified Promoter Account Linked
                      </div>
                      <div className="text-xs text-emerald-800 font-medium">
                        Signed in as <span className="font-bold">{activeUser.name}</span> ({activeUser.email}). This project is permanently saved to your Promoter Dashboard.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToDashboard) {
                        onNavigateToDashboard();
                      } else if (onFinishEditing) {
                        onFinishEditing();
                      } else {
                        window.location.href = '/dashboard';
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Go to Dashboard</span>
                  </button>
                </div>
              )}

              {/* Immediate Download & Next Actions Box */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Executive Deliverables Ready</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-manrope text-white">
                      Download AI Project Teaser &amp; Underwriting Dossier
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Download your official bank-ready Project Teaser with complete Proposed Project Cost Statement, Means of Finance, and Comprehensive Underwriting Scorecard in both print-ready <strong>PDF</strong> and editable <strong>DOCX</strong> formats.
                      {!activeUser && <span className="text-amber-400 block mt-1 font-semibold">🔒 Sign in or register to unlock instant downloads.</span>}
                    </p>
                  </div>

                  {/* Dual Primary Download Actions (PDF & DOCX) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {/* Primary PDF Download */}
                    <button
                      type="button"
                      onClick={() => handleDownloadTeaser('download')}
                      disabled={isDownloadingPdf}
                      className={`px-6 py-3.5 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                        activeUser
                          ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white hover:shadow-rose-500/25'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {!activeUser ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Sign In to Download PDF</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 stroke-[2.5]" />
                          <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Project Teaser (PDF)'}</span>
                        </>
                      )}
                    </button>

                    {/* Primary DOCX Download */}
                    <button
                      type="button"
                      onClick={() => handleDownloadDocxTeaser()}
                      disabled={isDownloadingDocx}
                      className={`px-6 py-3.5 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                        activeUser
                          ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white hover:shadow-blue-500/25'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {!activeUser ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Sign In to Download DOCX</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 stroke-[2.5]" />
                          <span>{isDownloadingDocx ? 'Generating DOCX...' : 'Download Project Teaser (DOCX)'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadTeaser('preview')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      {!activeUser && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Preview PDF Teaser</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!activeUser) {
                          handleRequireAuth('login', 'Please sign in or create an account to book your CA consultation.');
                          return;
                        }
                        onOpenConsultation();
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      {!activeUser && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Consult CA &amp; Project Advisor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeUser) {
                          handleRequireAuth('login', 'Please sign in or register to access your personal dashboard.');
                          return;
                        }
                        if (onNavigateToDashboard) {
                          onNavigateToDashboard();
                        } else if (onFinishEditing) {
                          onFinishEditing();
                        } else {
                          window.location.href = '/dashboard';
                        }
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {!activeUser && <Lock className="w-3.5 h-3.5 text-amber-300" />}
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Membership Call-to-Action Card */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Inisio Executive Membership</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-manrope text-white tracking-tight">
                      Have another project to assess? Upgrade to Inisio Membership.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-inter">
                      Unlock unlimited greenfield project feasibility appraisals, editable Word &amp; PDF dossiers, 10-year bank CMA financial models, and priority Chartered Accountant debt syndication advisory.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMembershipModalOpen(true)}
                      className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 active:from-blue-600 active:to-indigo-700 text-white font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>View Membership Plans</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* DPR & Funding Monetization Pathways (2-Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DPR Pathway Card */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-400/30">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>DPR &amp; Bank TEV Preparation</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black font-manrope text-white tracking-tight">
                      Need a Detailed Project Report (DPR)?
                    </h3>

                    <p className="text-sm font-semibold text-indigo-200">
                      Get Connected With our DPR Partner.
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed font-inter">
                      Get your bank-compliant Techno-Economic Viability (TEV) study and Detailed Project Report drafted by empaneled Chartered Engineers and financial analysts for fast loan sanction.
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-indigo-900/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      ✓ SBI &amp; Consortium Ready Format
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDPRModalOpen(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
                    >
                      <span>Request DPR Assistance</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Funding Pathway Card */}
                <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
                      <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Debt Syndication &amp; Project Finance</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black font-manrope text-white tracking-tight">
                      Looking for Project Funding?
                    </h3>

                    <p className="text-sm font-semibold text-emerald-200">
                      Connect with our debt syndication network.
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed font-inter">
                      Direct access to senior credit desks across leading PSU Consortiums, Private Banks, SIDBI MSME capital schemes, and structured debt funds.
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-teal-900/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      ✓ ₹1 Cr - ₹100+ Cr Sanction Limits
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFundingModalOpen(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Coins className="w-4 h-4 text-emerald-300" />
                      <span>Request Funding Assistance</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}
      </div>

      {/* Membership Plans Modal */}
      <MembershipPlansModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        currentUser={activeUser}
        onOpenAuth={onOpenAuth}
        onOpenConsultation={onOpenConsultation}
      />

      {/* DPR Request Modal */}
      <DPRRequestModal
        isOpen={isDPRModalOpen}
        onClose={() => setIsDPRModalOpen(false)}
        projectName={formData.projectName || formData.industry || 'Greenfield Project'}
        industry={formData.industry || 'Manufacturing'}
        totalCostCr={formData.totalCostCr || '10.00'}
        loanRequiredCr={formData.loanRequiredCr || '7.50'}
        user={activeUser}
        onSubmitSuccess={(msg) => {
          setActionToast(msg);
          setTimeout(() => setActionToast(null), 6000);
        }}
      />

      {/* Funding Request Modal */}
      <FundingRequestModal
        isOpen={isFundingModalOpen}
        onClose={() => setIsFundingModalOpen(false)}
        projectName={formData.projectName || formData.industry || 'Greenfield Project'}
        industry={formData.industry || 'Manufacturing'}
        totalCostCr={formData.totalCostCr || '10.00'}
        loanRequiredCr={formData.loanRequiredCr || '7.50'}
        user={activeUser}
        onSubmitSuccess={(msg) => {
          setActionToast(msg);
          setTimeout(() => setActionToast(null), 6000);
        }}
      />

      {/* Action Success Toast Banner */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-100">Request Received</p>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{actionToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

