import React, { useState, useEffect } from 'react';
import {
  AuthUser,
  PromoterDetail,
  CustomCostComponent,
  CustomFinanceComponent,
  ProjectDocument,
  ProjectTimelineStage,
  TimelineAuditLog,
  PromoterFundAssistanceStatus,
  PromoterFundAssistanceRequest,
  PromoterFundAssistanceLog
} from '../types';
import { fetchLeadsFromBackend, updateLeadRecord, LeadRecord } from '../utils/leadStore';
import { generateProjectTeaserPDF, TeaserPDFData } from '../utils/pdfGenerator';
import { generateProjectTeaserDOCX } from '../utils/docxGenerator';
import { ProjectEditModal, EditSectionType } from './ProjectEditModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { PhotoUploadModal } from './PhotoUploadModal';
import { DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { CommercialSupplyFundingData } from './CommercialSupplyFundingForm';
import { ProjectTimeline } from './ProjectTimeline';
import { computeProjectTimeline } from '../utils/timelineManager';
import { ProbabilityMeter } from './dashboard/ProbabilityMeter';
import { PromotersManagement } from './dashboard/PromotersManagement';
import { ProjectFinancialsBreakup } from './dashboard/ProjectFinancialsBreakup';
import { PromoterFundAssistanceCard } from './dashboard/PromoterFundAssistanceCard';
import { PromoterFundAssistanceModal } from './PromoterFundAssistanceModal';
import { UnderwritingChecklist } from './dashboard/UnderwritingChecklist';
import { DocumentsCompliance } from './dashboard/DocumentsCompliance';
import { CibilScoreWidget } from './dashboard/CibilScoreWidget';
import { CrisCompanyScoreBanner } from './dashboard/CrisCompanyScoreBanner';
import { BankApplicationTracker } from './dashboard/BankApplicationTracker';
import { CreditInformationCard } from './dashboard/CreditInformationCard';
import { GetHelpFromCaModal } from './dashboard/GetHelpFromCaModal';
import { detectUserLocation } from '../utils/locationDetector';
import { getUserMembership, MembershipPlan } from '../utils/membershipStore';
import { MembershipPlansModal } from './MembershipPlansModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { VerifiedPaymentResult } from '../utils/razorpay';
import { calculateSystemDscr, reconcileProjectFinancials } from '../utils/financialUtils';
import {
  Building,
  Building2,
  FileText,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  PhoneCall,
  TrendingUp,
  FileSpreadsheet,
  Edit3,
  MessageSquare,
  Landmark,
  RefreshCw,
  Calendar,
  Layers,
  MapPin,
  Briefcase,
  ShieldCheck,
  User,
  Camera,
  Gauge,
  ClipboardList,
  IndianRupee,
  Plus,
  Coins,
  Check,
  Activity,
  ExternalLink,
  Eye,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  FileUp,
  Headphones,
  Users2,
  Upload,
  Map as MapIcon,
  Filter,
  CheckCircle,
  FileCheck,
  ArrowRight,
  Search,
  Crown,
  Star,
  CreditCard,
  Receipt,
  Printer
} from 'lucide-react';

interface UserDashboardProps {
  user: AuthUser;
  onOpenAssessment: (projectToEdit?: any) => void;
  onOpenConsultation: () => void;
  onOpenMembership?: () => void;
}

export interface UserProjectDetail {
  id: string;
  projectName: string;
  industry: string;
  location: string;
  totalCostCr: number;
  loanRequiredCr: number;
  promoterContribCr: number;
  equityPercent: number;
  debtPercent: number;
  feasibilityScore: number;
  bankabilityRating: string;
  dscrEstimate: number;
  estInterestRate: string;
  landStatus: string;
  collateralStatus: string;
  promoterExp: string;
  status: 'In Appraisal' | 'DPR Ready' | 'CA Approved' | 'Bank Sanction' | 'New';
  stageNumber: number;
  assignedCA: string;
  assignedBank: string;
  financials?: {
    consultancyCostCr?: string | number;
    machineryCostCr?: string | number;
    civilCostCr?: string | number;
    otherCostsCr?: string | number;
    termLoanCr?: string | number;
    promoterContributionCr?: string | number;
    otherFinanceCr?: string | number;
    totalProjectCost?: string | number;
    totalMeansOfFinance?: string | number;
  };
  downloadedDate: string;
  downloadedPDF: boolean;
  notes?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  photoOrLogo?: string;
  dprFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string; storageKey?: string } | null;
  cmaFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string; storageKey?: string } | null;
  assignedTeam?: string;
  assessmentCompleted?: boolean;
  timelineDate?: string;
  timelineTime?: string;
  timestamp?: string;
  bankAppliedAt?: string;
  loanApprovedAt?: string;
  fundingDisbursedAt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  riskProfileData?: DetailedRiskProfileData;
  commercialData?: CommercialSupplyFundingData;
  promotersList?: PromoterDetail[];
  customCostComponents?: CustomCostComponent[];
  customFinanceComponents?: CustomFinanceComponent[];
  uploadedDocuments?: ProjectDocument[];
  isFunded?: boolean;
  successProbability?: number;
  bankName?: string;
  branchLocation?: string;
  bankIfscCode?: string;
  bankAppRefNumber?: string;
  bankApplicationStatus?: string;
  dprTimelineRollbackReason?: string;
  dprTargetDate?: string;
  dprStageRollback?: boolean;
  timelineStages?: ProjectTimelineStage[];
  timelineAuditLogs?: TimelineAuditLog[];
  promoterContributionAvailable?: 'Yes' | 'No';
  promoterFundAssistanceStatus?: PromoterFundAssistanceStatus;
  promoterFundAssistanceRequest?: PromoterFundAssistanceRequest;
  promoterFundAssistanceLogs?: PromoterFundAssistanceLog[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onOpenAssessment,
  onOpenConsultation,
  onOpenMembership
}) => {
  const [userProjects, setUserProjects] = useState<UserProjectDetail[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState<boolean>(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState<boolean>(false);
  const [isHelpCaModalOpen, setIsHelpCaModalOpen] = useState<boolean>(false);
  const [isPromoterFundAssistanceModalOpen, setIsPromoterFundAssistanceModalOpen] = useState<boolean>(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState<boolean>(false);
  const [activeSectionView, setActiveSectionView] = useState<string>('all');
  const [editSection, setEditSection] = useState<EditSectionType>('all');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [dprRequestSuccess, setDprRequestSuccess] = useState<boolean>(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState<boolean>(false);
  const [isGeneratingTeaser, setIsGeneratingTeaser] = useState(false);
  const [membership, setMembership] = useState(() => getUserMembership(user.email));
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<VerifiedPaymentResult | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Fetch payment history
  const loadPaymentHistory = async () => {
    try {
      const res = await fetch(`/api/payments/history?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPaymentHistory(data.data);
      }
    } catch (err) {
      console.warn('Error fetching payment history:', err);
    }
  };

  useEffect(() => {
    // Detect location silently from IP/Browser
    detectUserLocation().then((loc) => {
      if (loc) setDetectedLocation(loc);
    });
    loadPaymentHistory();
  }, [user.email]);

  useEffect(() => {
    const handleMembershipUpdate = () => {
      setMembership(getUserMembership(user.email));
    };
    window.addEventListener('inisio_membership_updated', handleMembershipUpdate);
    return () => window.removeEventListener('inisio_membership_updated', handleMembershipUpdate);
  }, [user.email]);

  const handleOpenEditSection = (section: EditSectionType) => {
    setEditSection(section);
    setIsEditingModalOpen(true);
  };

  // Load projects tied to user's email
  const loadUserProjects = async () => {
    setIsLoading(true);
    try {
      const leads = await fetchLeadsFromBackend(user.email);
      
      let apiProjects: any[] = [];
      try {
        const pRes = await fetch(`/api/projects?email=${encodeURIComponent(user.email)}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData && pData.data && Array.isArray(pData.data)) {
            apiProjects = pData.data;
          }
        }
      } catch (e) {
        console.log('Project fetch error:', e);
      }

      const projectMap = new Map<string, UserProjectDetail>();
      const normalizeProjectKey = (name?: string) => (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      leads.forEach((lead) => {
        const cost = Number(lead.totalCostCr) || 0;
        const loan = Number(lead.loanRequiredCr) || 0;
        const equity = Number(lead.promoterContribCr) || 0;
        const dPct = cost > 0 ? Math.round((loan / cost) * 100) : 0;
        const eqPct = cost > 0 ? Math.round((equity / cost) * 100) : 0;
        const score = Number(lead.feasibilityScore) || 0;
        
        let rating = 'Investment Grade (A)';
        if (score >= 85) rating = 'Prime Bankable (AAA)';
        else if (score >= 75) rating = 'Highly Viable (AA)';
        else if (score >= 65) rating = 'Moderate (BBB)';

        const dscr = Number(lead.dscrEstimate) || calculateSystemDscr({ industry: lead.industry || '' });
        const interest = String((lead as any).estInterestRate || '');

        const normKey = normalizeProjectKey(lead.projectName);
        const existingEntry = Array.from(projectMap.values()).find(p => 
          p.id === lead.id || (normKey && normalizeProjectKey(p.projectName) === normKey)
        );

        const projectDetail: UserProjectDetail = {
          id: lead.id,
          projectName: lead.projectName || `${lead.industry || 'Industrial'} Project`,
          industry: lead.industry || 'Greenfield Project',
          location: lead.location || 'India',
          totalCostCr: cost,
          loanRequiredCr: loan,
          promoterContribCr: equity,
          equityPercent: eqPct,
          debtPercent: dPct,
          feasibilityScore: score,
          bankabilityRating: rating,
          dscrEstimate: dscr,
          estInterestRate: interest,
          landStatus: lead.landStatus || 'Not provided',
          collateralStatus: lead.collateralStatus || 'Not provided',
          promoterExp: lead.promoterExp || 'Over 10+ Years Industry Track Record',
          status: (lead.status || 'In Appraisal') as any,
          stageNumber: lead.status === 'CA Approved' ? 4 : (lead.downloadedPDF ? 3 : 2),
          assignedCA: lead.consultationAssignedTo || '',
          assignedBank: lead.bankName || lead.assignedBank || '',
          downloadedDate: lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          downloadedPDF: Boolean(lead.downloadedPDF),
          notes: lead.notes || '',
          fullName: lead.fullName,
          mobile: lead.mobile,
          email: lead.email,
          photoOrLogo: lead.photoOrLogo || '',
          dprFile: lead.dprFile || null,
          cmaFile: lead.cmaFile || null,
          assignedTeam: lead.assignedTeam || lead.consultationAssignedTo || '',
          assessmentCompleted: lead.assessmentCompleted,
          timelineDate: lead.timelineDate || '',
          timelineTime: lead.timelineTime || '',
          timestamp: lead.timestamp,
          bankAppliedAt: lead.bankAppliedAt,
          loanApprovedAt: lead.loanApprovedAt,
          fundingDisbursedAt: lead.fundingDisbursedAt,
          lastEditedBy: lead.lastEditedBy,
          lastEditedAt: lead.lastEditedAt,
          riskProfileData: lead.riskProfileData,
          commercialData: lead.commercialData,
          financials: lead.financials,
          promotersList: lead.promotersList,
          customCostComponents: lead.customCostComponents,
          customFinanceComponents: lead.customFinanceComponents,
          uploadedDocuments: lead.uploadedDocuments,
          isFunded: lead.isFunded,
          successProbability: lead.successProbability,
          bankName: lead.bankName,
          branchLocation: lead.branchLocation,
          bankIfscCode: lead.bankIfscCode,
          bankAppRefNumber: lead.bankAppRefNumber,
          bankApplicationStatus: lead.bankApplicationStatus,
          dprTimelineRollbackReason: lead.dprTimelineRollbackReason,
          dprTargetDate: lead.dprTargetDate,
          dprStageRollback: lead.dprStageRollback,
          timelineStages: lead.timelineStages,
          timelineAuditLogs: lead.timelineAuditLogs
        };

        if (!existingEntry) {
          projectMap.set(lead.id, projectDetail);
        } else {
          // Merge latest updated fields into the existing entry
          const merged: UserProjectDetail = {
            ...existingEntry,
            ...projectDetail,
            id: existingEntry.id || projectDetail.id,
            financials: (projectDetail.financials && Object.keys(projectDetail.financials).length > 0) ? projectDetail.financials : existingEntry.financials,
            promotersList: (projectDetail.promotersList && projectDetail.promotersList.length > 0) ? projectDetail.promotersList : existingEntry.promotersList,
            customCostComponents: (projectDetail.customCostComponents && projectDetail.customCostComponents.length > 0) ? projectDetail.customCostComponents : existingEntry.customCostComponents,
            customFinanceComponents: (projectDetail.customFinanceComponents && projectDetail.customFinanceComponents.length > 0) ? projectDetail.customFinanceComponents : existingEntry.customFinanceComponents,
            uploadedDocuments: (projectDetail.uploadedDocuments && projectDetail.uploadedDocuments.length > 0) ? projectDetail.uploadedDocuments : existingEntry.uploadedDocuments,
            riskProfileData: projectDetail.riskProfileData || existingEntry.riskProfileData,
            commercialData: projectDetail.commercialData || existingEntry.commercialData,
          };
          projectMap.set(existingEntry.id, merged);
        }
      });

      apiProjects.forEach((proj) => {
        const id = proj._id || proj.id;
        const cost = Number(proj.totalCostCr) || 0;
        const loan = Number(proj.loanRequiredCr) || 0;
        const equity = Number(proj.promoterContribCr) || 0;
        const dPct = cost > 0 ? Math.round((loan / cost) * 100) : 0;
        const eqPct = cost > 0 ? Math.round((equity / cost) * 100) : 0;
        const score = Number(proj.feasibilityScore) || 0;

        let rating = 'Investment Grade (A)';
        if (score >= 85) rating = 'Prime Bankable (AAA)';
        else if (score >= 75) rating = 'Highly Viable (AA)';
        else if (score >= 65) rating = 'Moderate (BBB)';

        const dscr = Number(proj.dscrEstimate) || calculateSystemDscr({ industry: proj.industry || '' });
        const interest = String(proj.estInterestRate || '');

        const normKey = normalizeProjectKey(proj.projectName);
        const existingEntry = Array.from(projectMap.values()).find(p => 
          p.id === id || (normKey && normalizeProjectKey(p.projectName) === normKey)
        );

        if (!existingEntry) {
          projectMap.set(id, {
            id,
            projectName: proj.projectName || `${proj.industry || 'Industrial'} Project`,
            industry: proj.industry || 'Greenfield Project',
            location: proj.location || 'India',
            totalCostCr: cost,
            loanRequiredCr: loan,
            promoterContribCr: equity,
            equityPercent: eqPct,
            debtPercent: dPct,
            feasibilityScore: score,
            bankabilityRating: rating,
            dscrEstimate: dscr,
            estInterestRate: interest,
            landStatus: proj.landStatus || 'Not provided',
            collateralStatus: proj.collateralStatus || 'Not provided',
            promoterExp: proj.promoterExp || 'Over 10+ Years Industry Track Record',
            status: (proj.status || 'In Appraisal') as any,
            stageNumber: proj.status === 'CA Approved' ? 4 : (proj.downloadedPDF ? 3 : 2),
            assignedCA: proj.assignedCA || '',
            assignedBank: proj.assignedBank || '',
            downloadedDate: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            downloadedPDF: Boolean(proj.downloadedPDF),
            notes: proj.description || '',
            fullName: proj.fullName,
            mobile: proj.mobile,
            email: proj.email,
            photoOrLogo: proj.photoOrLogo || '',
            dprFile: proj.dprFile || null,
            cmaFile: proj.cmaFile || null,
            assignedTeam: proj.assignedTeam || '',
            assessmentCompleted: Boolean(proj.assessmentCompleted),
            timelineDate: proj.timelineDate || '',
            timelineTime: proj.timelineTime || '',
            timestamp: proj.createdAt,
            bankAppliedAt: proj.bankAppliedAt,
            loanApprovedAt: proj.loanApprovedAt,
            fundingDisbursedAt: proj.fundingDisbursedAt,
            financials: proj.financials,
            lastEditedBy: proj.lastEditedBy,
            lastEditedAt: proj.lastEditedAt,
            riskProfileData: proj.riskProfileData,
            commercialData: proj.commercialData,
            promotersList: proj.promotersList,
            customCostComponents: proj.customCostComponents,
            customFinanceComponents: proj.customFinanceComponents,
            uploadedDocuments: proj.uploadedDocuments,
            isFunded: proj.isFunded,
            successProbability: proj.successProbability,
            promoterContributionAvailable: proj.promoterContributionAvailable || 'Yes',
            promoterFundAssistanceStatus: proj.promoterFundAssistanceStatus || 'Not Requested',
            promoterFundAssistanceRequest: proj.promoterFundAssistanceRequest,
            promoterFundAssistanceLogs: proj.promoterFundAssistanceLogs
          });
        }
      });

      const list = Array.from(projectMap.values());
      setUserProjects(list);

      if (list.length === 1) {
        setSelectedProjectId((prev) => {
          if (prev && list.some(p => p.id === prev)) return prev;
          return list[0].id;
        });
      } else if (list.length > 1) {
        setSelectedProjectId((prev) => {
          if (prev && list.some(p => p.id === prev)) return prev;
          return list[0].id;
        });
      }
    } catch (e) {
      console.error('Failed to load user projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProjects();
    const handleUpdate = () => {
      loadUserProjects();
    };
    window.addEventListener('inisio_lead_added', handleUpdate);
    return () => window.removeEventListener('inisio_lead_added', handleUpdate);
  }, [user.email]);

  const activeProject = selectedProjectId 
    ? userProjects.find(p => p.id === selectedProjectId) || null
    : userProjects.length === 1 
      ? userProjects[0] 
      : null;

  const handleSaveModalProject = (updates: Partial<UserProjectDetail>) => {
    if (!activeProject) return;

    const updatedProject: UserProjectDetail = {
      ...activeProject,
      ...updates,
      lastEditedBy: user.name || user.email,
      lastEditedAt: new Date().toISOString()
    };

    if (updates.totalCostCr !== undefined || updates.loanRequiredCr !== undefined) {
      const cost = updates.totalCostCr !== undefined ? Number(updates.totalCostCr) : updatedProject.totalCostCr;
      const loan = updates.loanRequiredCr !== undefined ? Number(updates.loanRequiredCr) : updatedProject.loanRequiredCr;
      const equity = Math.max(0, Math.round((cost - loan) * 10) / 10);
      const dPct = cost > 0 ? Math.round((loan / cost) * 100) : 75;
      const eqPct = 100 - dPct;
      updatedProject.promoterContribCr = equity;
      updatedProject.debtPercent = dPct;
      updatedProject.equityPercent = eqPct;
    }

    const updatedProjects = userProjects.map(p => p.id === activeProject.id ? updatedProject : p);
    setUserProjects(updatedProjects);

    updateLeadRecord(activeProject.id, {
      ...updates,
      email: activeProject.email || user.email,
      fullName: activeProject.fullName || user.name,
      projectName: updates.projectName !== undefined ? updates.projectName : activeProject.projectName,
      industry: updates.industry !== undefined ? updates.industry : activeProject.industry,
      location: updates.location !== undefined ? updates.location : activeProject.location,
      totalCostCr: updates.totalCostCr !== undefined ? updates.totalCostCr : activeProject.totalCostCr,
      loanRequiredCr: updates.loanRequiredCr !== undefined ? updates.loanRequiredCr : activeProject.loanRequiredCr,
      promoterContribCr: updates.promoterContribCr !== undefined ? updates.promoterContribCr : activeProject.promoterContribCr,
      landStatus: updates.landStatus !== undefined ? updates.landStatus : activeProject.landStatus,
      collateralStatus: updates.collateralStatus !== undefined ? updates.collateralStatus : activeProject.collateralStatus,
      promoterExp: updates.promoterExp !== undefined ? updates.promoterExp : activeProject.promoterExp,
      notes: updates.notes !== undefined ? updates.notes : activeProject.notes,
      photoOrLogo: updates.photoOrLogo !== undefined ? updates.photoOrLogo : activeProject.photoOrLogo,
      dprFile: updates.dprFile !== undefined ? (updates.dprFile || undefined) : (activeProject.dprFile || undefined),
      cmaFile: updates.cmaFile !== undefined ? (updates.cmaFile || undefined) : (activeProject.cmaFile || undefined),
      assignedTeam: updates.assignedTeam !== undefined ? updates.assignedTeam : activeProject.assignedTeam,
      timelineDate: updates.timelineDate !== undefined ? updates.timelineDate : activeProject.timelineDate,
      timelineTime: updates.timelineTime !== undefined ? updates.timelineTime : activeProject.timelineTime,
      financials: updates.financials !== undefined ? updates.financials : activeProject.financials,
      customCostComponents: updates.customCostComponents !== undefined ? updates.customCostComponents : activeProject.customCostComponents,
      customFinanceComponents: updates.customFinanceComponents !== undefined ? updates.customFinanceComponents : activeProject.customFinanceComponents,
      promotersList: updates.promotersList !== undefined ? updates.promotersList : activeProject.promotersList,
      riskProfileData: updates.riskProfileData !== undefined ? updates.riskProfileData : activeProject.riskProfileData,
      commercialData: updates.commercialData !== undefined ? updates.commercialData : activeProject.commercialData,
      uploadedDocuments: updates.uploadedDocuments !== undefined ? updates.uploadedDocuments : activeProject.uploadedDocuments,
    }, user.name || user.email);

    triggerToast(`Project '${updatedProject.projectName}' updated successfully.`);
  };

  const handleSavePhotoOrLogo = (photoUrl: string | null) => {
    if (!activeProject) return;
    handleSaveModalProject({ photoOrLogo: photoUrl || '' });
    triggerToast(photoUrl ? 'Photo / logo updated successfully.' : 'Photo / logo removed.');
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleRequestDPRPreparation = () => {
    setDprRequestSuccess(true);
    triggerToast('DPR & CMA preparation request submitted to Inisio Experts Desk!');
    setTimeout(() => setDprRequestSuccess(false), 5000);
  };

  const handleUpdatePromoters = (updatedPromoters: PromoterDetail[]) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      promotersList: updatedPromoters
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    updateLeadRecord(activeProject.id, {
      email: activeProject.email || user.email,
      projectName: activeProject.projectName,
      promotersList: updatedPromoters
    }, user.name || user.email);
    triggerToast('Promoters & board management profiles updated.');
  };

  const handleSaveFinancials = (
    updatedCosts: CustomCostComponent[],
    updatedFinances: CustomFinanceComponent[],
    calculatedTotalCostCr: number,
    calculatedDebtCr: number,
    calculatedEquityCr: number
  ) => {
    if (!activeProject) return;
    const costByCategory = (category: CustomCostComponent['category']) => updatedCosts
      .filter(component => component.category === category)
      .reduce((sum, component) => sum + (Number(component.amountCr) || 0), 0);
    const totalFinance = updatedFinances.reduce((sum, component) => sum + (Number(component.amountCr) || 0), 0);
    const otherFinance = updatedFinances
      .filter(component => component.type !== 'Term Debt' && component.type !== 'Promoter Equity')
      .reduce((sum, component) => sum + (Number(component.amountCr) || 0), 0);
    const synchronizedFinancials = {
      ...activeProject.financials,
      consultancyCostCr: costByCategory('Consultancy'),
      machineryCostCr: costByCategory('Machinery'),
      civilCostCr: costByCategory('Civil'),
      otherCostsCr: updatedCosts
        .filter(component => !['Consultancy', 'Machinery', 'Civil'].includes(component.category))
        .reduce((sum, component) => sum + (Number(component.amountCr) || 0), 0),
      termLoanCr: calculatedDebtCr,
      promoterContributionCr: calculatedEquityCr,
      otherFinanceCr: otherFinance,
      totalProjectCost: calculatedTotalCostCr,
      totalMeansOfFinance: totalFinance
    };
    const updated = {
      ...activeProject,
      totalCostCr: calculatedTotalCostCr,
      loanRequiredCr: calculatedDebtCr,
      promoterContribCr: calculatedEquityCr,
      debtPercent: calculatedTotalCostCr > 0 ? Math.round((calculatedDebtCr / calculatedTotalCostCr) * 100) : 70,
      equityPercent: calculatedTotalCostCr > 0 ? Math.round((calculatedEquityCr / calculatedTotalCostCr) * 100) : 30,
      customCostComponents: updatedCosts,
      customFinanceComponents: updatedFinances,
      financials: synchronizedFinancials
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    updateLeadRecord(activeProject.id, {
      email: activeProject.email || user.email,
      projectName: activeProject.projectName,
      totalCostCr: calculatedTotalCostCr,
      loanRequiredCr: calculatedDebtCr,
      promoterContribCr: calculatedEquityCr,
      financials: synchronizedFinancials,
      customCostComponents: updatedCosts,
      customFinanceComponents: updatedFinances
    }, user.name || user.email);
    triggerToast('Project cost & means of finance updated.');
  };

  const handleUpdateDocuments = (updatedDocs: ProjectDocument[]) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      uploadedDocuments: updatedDocs
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    updateLeadRecord(activeProject.id, {
      email: activeProject.email || user.email,
      projectName: activeProject.projectName,
      uploadedDocuments: updatedDocs
    }, user.name || user.email);
    triggerToast('Project document repository updated.');
  };

  const handleToggleFunded = (isFundedVal: boolean) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      isFunded: isFundedVal,
      status: (isFundedVal ? 'Bank Sanction' : activeProject.status) as any
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    updateLeadRecord(activeProject.id, {
      email: activeProject.email || user.email,
      projectName: activeProject.projectName,
      isFunded: isFundedVal,
      status: isFundedVal ? 'Bank Sanction' : undefined
    }, user.name || user.email);
    triggerToast(isFundedVal ? 'Project marked as 100% Funded & Disbursed!' : 'Funding status updated.');
  };

  const handleTimelineUpdated = (updatedStages: ProjectTimelineStage[], updatedRecord: LeadRecord) => {
    if (!activeProject) return;
    const updated: UserProjectDetail = {
      ...activeProject,
      ...updatedRecord,
      timelineStages: updatedStages,
      timelineAuditLogs: updatedRecord.timelineAuditLogs || activeProject.timelineAuditLogs
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    triggerToast('Project syndication timeline updated.');
  };

  const handleSaveBankDetails = (details: {
    bankName: string;
    branchLocation: string;
    bankIfscCode?: string;
    bankAppRefNumber?: string;
    bankApplicationStatus?: string;
  }) => {
    if (!activeProject) return;
    const updated: UserProjectDetail = {
      ...activeProject,
      bankName: details.bankName,
      assignedBank: details.bankName,
      branchLocation: details.branchLocation,
      bankIfscCode: details.bankIfscCode,
      bankAppRefNumber: details.bankAppRefNumber,
      bankApplicationStatus: details.bankApplicationStatus,
    };
    setUserProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));
    updateLeadRecord(activeProject.id, {
      email: activeProject.email || user.email,
      projectName: activeProject.projectName,
      bankName: details.bankName,
      branchLocation: details.branchLocation,
      bankIfscCode: details.bankIfscCode,
      bankAppRefNumber: details.bankAppRefNumber,
      bankApplicationStatus: details.bankApplicationStatus,
    }, user.name || user.email);
    triggerToast(details.bankName ? `Bank details updated for ${details.bankName}!` : 'Bank details updated.');
  };

  const buildTeaserData = (proj: UserProjectDetail): TeaserPDFData => {
    let consultancyCr = proj.financials?.consultancyCostCr ? String(proj.financials.consultancyCostCr) : '';
    let machineryCr = proj.financials?.machineryCostCr ? String(proj.financials.machineryCostCr) : '';
    let civilCr = proj.financials?.civilCostCr ? String(proj.financials.civilCostCr) : '';
    let otherCostsCr = proj.financials?.otherCostsCr ? String(proj.financials.otherCostsCr) : '';
    const customCosts = Array.isArray(proj.customCostComponents) ? proj.customCostComponents.filter(Boolean) : [];
    const customFinances = Array.isArray(proj.customFinanceComponents) ? proj.customFinanceComponents.filter(Boolean) : [];

    if (customCosts.length > 0) {
      const mach = customCosts.filter(c => c.category === 'Machinery' || c.title?.toLowerCase().includes('machinery')).reduce((s, c) => s + (Number(c.amountCr) || 0), 0);
      const civ = customCosts.filter(c => c.category === 'Civil' || c.title?.toLowerCase().includes('civil') || c.title?.toLowerCase().includes('building')).reduce((s, c) => s + (Number(c.amountCr) || 0), 0);
      const cons = customCosts.filter(c => c.category === 'Consultancy' || c.category === 'Pre-operative' || c.title?.toLowerCase().includes('consultancy')).reduce((s, c) => s + (Number(c.amountCr) || 0), 0);
      const oth = customCosts.filter(c => !['Machinery', 'Civil', 'Consultancy', 'Pre-operative'].includes(c.category) && !c.title?.toLowerCase().includes('machinery') && !c.title?.toLowerCase().includes('civil') && !c.title?.toLowerCase().includes('building') && !c.title?.toLowerCase().includes('consultancy')).reduce((s, c) => s + (Number(c.amountCr) || 0), 0);
      if (mach > 0) machineryCr = mach.toFixed(2);
      if (civ > 0) civilCr = civ.toFixed(2);
      if (cons > 0) consultancyCr = cons.toFixed(2);
      if (oth > 0) otherCostsCr = oth.toFixed(2);
    }

    let termLoanCr = proj.financials?.termLoanCr ? String(proj.financials.termLoanCr) : String(proj.loanRequiredCr);
    let promoterContribCr = proj.financials?.promoterContributionCr ? String(proj.financials.promoterContributionCr) : String(proj.promoterContribCr);
    let otherFinanceCr = proj.financials?.otherFinanceCr ? String(proj.financials.otherFinanceCr) : '0.00';

    if (customFinances.length > 0) {
      const tLoan = customFinances.filter(f => f.type === 'Term Debt' || f.title?.toLowerCase().includes('debt') || f.title?.toLowerCase().includes('loan')).reduce((s, f) => s + (Number(f.amountCr) || 0), 0);
      const eq = customFinances.filter(f => f.type === 'Promoter Equity' || f.title?.toLowerCase().includes('equity') || f.title?.toLowerCase().includes('promoter')).reduce((s, f) => s + (Number(f.amountCr) || 0), 0);
      const othFin = customFinances.filter(f => !['Term Debt', 'Promoter Equity'].includes(f.type) && !f.title?.toLowerCase().includes('debt') && !f.title?.toLowerCase().includes('loan') && !f.title?.toLowerCase().includes('equity') && !f.title?.toLowerCase().includes('promoter')).reduce((s, f) => s + (Number(f.amountCr) || 0), 0);
      if (tLoan > 0) termLoanCr = tLoan.toFixed(2);
      if (eq > 0) promoterContribCr = eq.toFixed(2);
      if (othFin > 0) otherFinanceCr = othFin.toFixed(2);
    }

    const promoters = Array.isArray(proj.promotersList) ? proj.promotersList.filter(Boolean) : [];
    const directors = promoters.length > 0
      ? promoters.map(p => ({ name: p.name || 'Promoter', title: p.role || 'Director / Key Promoter' }))
      : [{ name: user.name || proj.fullName || 'Promoter', title: 'Managing Director / Key Promoter' }];

    const reconciled = reconcileProjectFinancials({
      totalCostCr: proj.totalCostCr,
      loanRequiredCr: proj.loanRequiredCr,
      promoterContribCr: proj.promoterContribCr,
      debtPct: proj.debtPercent,
      eqPct: proj.equityPercent,
      consultancyCostCr: consultancyCr,
      machineryCostCr: machineryCr,
      civilCostCr: civilCr,
      otherCostsCr: otherCostsCr,
      termLoanCr,
      promoterContributionCr: promoterContribCr,
      otherFinanceCr
    });

    return {
      fullName: user.name || proj.fullName || 'Promoter',
      mobile: user.phone || proj.mobile || '',
      email: user.email || proj.email || '',
      projectName: proj.projectName || 'Greenfield Project',
      industry: proj.industry || 'Greenfield Project',
      location: proj.location || 'India',
      totalCostCr: reconciled.totalCostFormatted,
      promoterContribCr: reconciled.promoterContributionFormatted,
      loanRequiredCr: reconciled.termLoanFormatted,
      landStatus: proj.landStatus || 'Not provided',
      collateralStatus: proj.collateralStatus || 'Not provided',
      promoterExp: proj.promoterExp || 'Experienced in Industry',
      description: proj.notes || (proj.assignedBank ? `Targeting ${proj.assignedBank} debt syndication.` : undefined),
      bankName: proj.bankName || proj.assignedBank || '',
      assignedBank: proj.assignedBank || proj.bankName || '',
      branchLocation: proj.branchLocation || '',
      bankIfscCode: proj.bankIfscCode || '',
      bankAppRefNumber: proj.bankAppRefNumber || '',
      feasibilityScore: Number(proj.feasibilityScore) || 0,
      bankabilityRating: proj.bankabilityRating || 'Investment Grade (A)',
      estimatedLoan: reconciled.termLoanFormatted,
      eqPct: reconciled.eqPct,
      debtPct: reconciled.debtPct,
      dscrEstimate: Number(proj.dscrEstimate) || calculateSystemDscr({ industry: proj.industry || '' }),
      estInterestRate: proj.estInterestRate || '8.85% - 9.40%',
      riskProfileData: proj.riskProfileData,
      commercialData: proj.commercialData,
      directors,
      machineryCostCr: reconciled.machineryFormatted,
      civilCostCr: reconciled.civilFormatted,
      consultancyCostCr: reconciled.consultancyFormatted,
      otherCostsCr: reconciled.otherCostsFormatted,
      termLoanCr: reconciled.termLoanFormatted,
      promoterContributionCr: reconciled.promoterContributionFormatted,
      otherFinanceCr: reconciled.otherFinanceFormatted
    };
  };

  const handlePreviewTeaserPDF = async (proj: UserProjectDetail) => {
    if (isGeneratingTeaser) return;
    setIsGeneratingTeaser(true);
    try {
      const pdfData = buildTeaserData(proj);
      await generateProjectTeaserPDF(pdfData, 'preview');
      triggerToast(`Opening ${proj.projectName} Teaser preview in new tab...`);
    } catch (error) {
      console.error('Failed to preview teaser PDF:', error);
      triggerToast('Unable to preview the teaser PDF. Please try again.');
    } finally {
      setIsGeneratingTeaser(false);
    }
  };

  const handleDownloadTeaserPDF = async (proj: UserProjectDetail) => {
    if (isGeneratingTeaser) return;
    setIsGeneratingTeaser(true);
    try {
      const pdfData = buildTeaserData(proj);
      await generateProjectTeaserPDF(pdfData, 'download');
      triggerToast(`Downloaded ${proj.projectName} Teaser PDF!`);
    } catch (error) {
      console.error('Failed to download teaser PDF:', error);
      triggerToast('Unable to download the teaser PDF. Please try again.');
    } finally {
      setIsGeneratingTeaser(false);
    }
  };

  const handleDownloadTeaserDOCX = async (proj: UserProjectDetail) => {
    if (isGeneratingTeaser) return;
    setIsGeneratingTeaser(true);
    try {
      const pdfData = buildTeaserData(proj);
      await generateProjectTeaserDOCX(pdfData);
      triggerToast(`Downloaded ${proj.projectName} Teaser DOCX!`);
    } catch (e) {
      console.error('Failed to download teaser DOCX:', e);
      triggerToast('Unable to download the teaser Word document. Please try again.');
    } finally {
      setIsGeneratingTeaser(false);
    }
  };

  const handleDownloadCMAModel = (proj: UserProjectDetail) => {
    const rows = [
      ['BANK CMA FINANCIAL MODEL & CASH FLOWS', proj.projectName],
      ['Promoter Name', user.name || 'Promoter'],
      ['Email', user.email],
      ['Sector', proj.industry],
      ['Location', proj.location],
      ['Total Capex (Cr)', `INR ${proj.totalCostCr}`],
      ['Promoter Equity (Cr)', `INR ${proj.promoterContribCr} (${proj.equityPercent}%)`],
      ['Term Debt Sanction (Cr)', `INR ${proj.loanRequiredCr} (${proj.debtPercent}%)`],
      ['Projected DSCR', `${proj.dscrEstimate}x`],
      ['Estimated Interest Rate', proj.estInterestRate],
      ['Target Banks', proj.assignedBank],
      ['', ''],
      ['YEAR', 'YEAR 1', 'YEAR 2', 'YEAR 3', 'YEAR 4', 'YEAR 5', 'YEAR 6', 'YEAR 7', 'YEAR 8', 'YEAR 9', 'YEAR 10'],
      ['Projected Revenue (Cr)', (proj.totalCostCr * 0.85).toFixed(1), (proj.totalCostCr * 1.15).toFixed(1), (proj.totalCostCr * 1.45).toFixed(1), (proj.totalCostCr * 1.70).toFixed(1), (proj.totalCostCr * 1.95).toFixed(1), (proj.totalCostCr * 2.15).toFixed(1), (proj.totalCostCr * 2.35).toFixed(1), (proj.totalCostCr * 2.50).toFixed(1), (proj.totalCostCr * 2.65).toFixed(1), (proj.totalCostCr * 2.80).toFixed(1)],
      ['EBITDA Margin', '22.5%', '24.0%', '25.5%', '26.0%', '26.5%', '27.0%', '27.0%', '27.5%', '27.5%', '28.0%'],
      ['Debt Service Coverage Ratio', '1.42x', '1.51x', '1.63x', '1.74x', '1.85x', '1.98x', '2.12x', '2.25x', '2.40x', '2.55x']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bank_CMA_Model_${proj.projectName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Downloaded ${proj.projectName} Bank CMA Model (Excel)!`);
  };

  const formatRealtimeDate = (isoStr?: string) => {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return null;
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateStr} • ${timeStr}`;
  };

  const projectCreationTimestamp = activeProject?.timestamp;
  const assessmentCompletedTime = formatRealtimeDate(projectCreationTimestamp);
  const dprUploadTimestamp = activeProject?.dprFile?.uploadedAt || activeProject?.cmaFile?.uploadedAt;
  const dprDateFormatted = formatRealtimeDate(dprUploadTimestamp);

  const statusMap: Record<string, number> = {
    'New': 1,
    'Contacted': 1,
    'In Appraisal': 2,
    'DPR Ready': 3,
    'CA Approved': 4,
    'Sanctioned': 5
  };
  const adminStageLevel = statusMap[activeProject?.status as string] || 0;

  const isAssessmentCompleted = Boolean(activeProject?.assessmentCompleted);
  const isRatingCompleted = isAssessmentCompleted && Boolean(activeProject?.feasibilityScore || activeProject?.bankabilityRating);
  const isDocCompleted = Boolean(activeProject?.dprFile?.uploadedAt || activeProject?.cmaFile?.uploadedAt) || adminStageLevel >= 3;
  const isBankAppCompleted = Boolean(activeProject?.bankAppliedAt) || adminStageLevel >= 4;
  const isLoanApproved = Boolean(activeProject?.loanApprovedAt) || adminStageLevel >= 5;
  const isFundingCompleted = Boolean(activeProject?.fundingDisbursedAt);

  const timelineStages = computeProjectTimeline(activeProject || {});
  const completedStagesCount = timelineStages.filter(s => s.status === 'Completed').length;
  const activeTimelineStage = timelineStages.find(s => s.status === 'In Progress') || timelineStages[0];
  const currentStageIndex = activeTimelineStage ? activeTimelineStage.id : 1;
  const currentStageName = activeTimelineStage?.name || 'Project Assessment';
  const progressPercent = Math.round((completedStagesCount / timelineStages.length) * 100);

  const hasDpr = Boolean(activeProject?.dprFile);
  const hasCma = Boolean(activeProject?.cmaFile);
  const hasAnyDoc = hasDpr || hasCma;

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-inter antialiased">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-500 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{showToast}</span>
        </div>
      )}



      {/* Edit Modal */}
      {activeProject && (
        <ProjectEditModal
          project={activeProject}
          isOpen={isEditingModalOpen}
          initialSection={editSection}
          onClose={() => setIsEditingModalOpen(false)}
          onSave={handleSaveModalProject}
        />
      )}

      {/* Photo/Logo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        currentPhoto={activeProject?.photoOrLogo}
        projectName={activeProject?.projectName || 'Project'}
        userName={user.name || 'User'}
        onClose={() => setIsPhotoUploadModalOpen(false)}
        onSave={handleSavePhotoOrLogo}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">

        {/* MULTIPLE PROJECTS DASHBOARD STATE */}
        {!activeProject && userProjects.length > 0 && (() => {
          const totalCostAll = userProjects.reduce((sum, p) => sum + (Number(p.totalCostCr) || 0), 0);
          const totalLoanAll = userProjects.reduce((sum, p) => sum + (Number(p.loanRequiredCr) || 0), 0);
          const totalEquityAll = userProjects.reduce((sum, p) => sum + (Number(p.promoterContribCr) || 0), 0);
          const totalProjectsCount = userProjects.length;
          
          return (
            <div className="space-y-6">
              {/* Header UI */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-zinc-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold text-4xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 mb-4">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user.name || 'User'}</h1>
                      {membership.plan === 'pro' ? (
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                          <Crown className="w-3.5 h-3.5 text-amber-300" />
                          <span>Inisio Pro Member (Unlimited)</span>
                        </span>
                      ) : membership.plan === 'enterprise' ? (
                        <span className="px-3 py-1 bg-slate-900 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm border border-amber-400/30">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Enterprise Syndication</span>
                        </span>
                      ) : userProjects.some(project => project.assessmentCompleted) ? (
                        <button
                          type="button"
                          onClick={() => setIsMembershipModalOpen(true)}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Free Starter ({userProjects.length}/1 Used) • Upgrade</span>
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-4 text-sm text-slate-500">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Email address:</p>
                        <p className="font-semibold text-slate-800">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Phone number:</p>
                        <p className="font-semibold text-slate-800">{userProjects[0]?.mobile || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Location:</p>
                        <p className="font-semibold text-slate-800">{userProjects[0]?.location || 'India'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <div className="font-bold text-lg">₹</div>
                    </div>
                    <span className="font-semibold text-slate-600 text-sm">Total Project Cost</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[28px] font-black text-slate-800 tracking-tight">₹{totalCostAll.toFixed(2)}Cr</div>
                      <div className="text-xs text-blue-500 flex items-center gap-1 mt-1 font-bold"><ArrowRight className="w-3 h-3 -rotate-45" /> Across {totalProjectsCount} projects</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-600 text-sm">Total Funding Required</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[28px] font-black text-slate-800 tracking-tight">₹{totalLoanAll.toFixed(2)}Cr</div>
                      <div className="text-xs text-blue-500 flex items-center gap-1 mt-1 font-bold"><ArrowRight className="w-3 h-3 -rotate-45" /> Bank Finance</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-600 text-sm">Promoter Equity</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[28px] font-black text-slate-800 tracking-tight">₹{totalEquityAll.toFixed(2)}Cr</div>
                      <div className="text-xs text-blue-500 flex items-center gap-1 mt-1 font-bold"><ArrowRight className="w-3 h-3 -rotate-45" /> Total Contribution</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="text-sm font-semibold opacity-90 mb-1">Total Projects</div>
                      <div className="text-5xl font-black">{totalProjectsCount}</div>
                    </div>
                    <button onClick={() => onOpenAssessment()} className="w-full mt-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors text-white cursor-pointer">
                      Start Assessment
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs and Table */}
              <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden mt-8">
                <div className="border-b border-zinc-100">
                  <div className="flex items-center gap-8 px-8 pt-6">
                    <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-bold text-sm">Projects ({totalProjectsCount})</button>
                    
                  </div>
                </div>
                
                <div className="p-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <div className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
                        <Search className="w-full h-full" />
                      </div>
                      <input type="text" placeholder="Search project" className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors" />
                    </div>
                    <button className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                      Sort by
                    </button>
                  </div>
                  <button onClick={() => onOpenAssessment()} className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer w-full sm:w-auto justify-center">
                    <span>Create project</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
                    <thead className="text-xs text-slate-400 font-semibold bg-white">
                      <tr>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Project</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Industry</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Total Cost</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Funding Req.</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Status</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100">Created Date</th>
                        <th className="px-6 py-4 font-medium border-b border-zinc-100 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {userProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-[200px]">{p.projectName || 'Untitled'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[150px]">{p.industry}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">₹{p.totalCostCr} Cr</td>
                          <td className="px-6 py-4 font-bold text-slate-700">₹{p.loanRequiredCr} Cr</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                              {p.status || 'In Appraisal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(p.timestamp).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedProjectId(p.id)}
                              className="px-4 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <ArrowRight className="w-3 h-3 -rotate-45" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ---------------------------------------------------- */}
        {/* 1. TOP MINIMALIST CONTROL & PROJECT SWITCHER BAR     */}
        {/* ---------------------------------------------------- */}
        {activeProject && (
        <div className="border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Left: Project Selector & Brand Breadcrumb */}
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600 uppercase tracking-wider">Inisio Project Finance</span>
                <span className="text-zinc-300 text-lg">/</span>
                <span className="text-base text-zinc-500 font-semibold">{user.name || user.email}</span>
              </div>

              {/* Membership Status Pill */}
              {membership.isMember ? (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>{membership.plan === 'pro' ? 'Pro Member' : 'Enterprise'}</span>
                </span>
              ) : activeProject.assessmentCompleted ? (
                <button
                  type="button"
                  onClick={() => setIsMembershipModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Upgrade to Pro</span>
                </button>
              ) : null}

              {/* Back to Projects List (if multiple projects exist) */}
              {userProjects.length > 1 && (
                <button 
                  onClick={() => setSelectedProjectId('')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All Projects</span>
                </button>
              )}

              {/* Project Dropdown / Switcher */}
              {userProjects.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{activeProject?.projectName || 'Select Project'}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">
                        {userProjects.length} {userProjects.length === 1 ? 'Project' : 'Projects'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>

                  {/* Dropdown Menu */}
                  {projectDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setProjectDropdownOpen(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl z-40 py-1.5 divide-y divide-zinc-100 animate-in fade-in-50 slide-in-from-top-1">
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Switch Active Project
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          {userProjects.map((p) => {
                            const isSel = p.id === activeProject?.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedProjectId(p.id);
                                  setProjectDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer ${isSel ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-zinc-700'}`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="truncate font-medium">{p.projectName}</div>
                                  <div className="text-[10px] text-zinc-400 truncate">{p.industry} • ₹{p.totalCostCr} Cr</div>
                                </div>
                                {isSel && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => {
                              setProjectDropdownOpen(false);
                              onOpenAssessment();
                            }}
                            className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Evaluate New Greenfield Project</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                  
                  {activeProject?.status && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Status: {activeProject.status}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onOpenAssessment()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>

              {activeProject && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      void handleDownloadTeaserPDF(activeProject);
                    }}
                    disabled={isGeneratingTeaser}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Download Project Teaser PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingTeaser ? 'Generating...' : 'Download Teaser'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAssessment(activeProject)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit Project Assessment"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* EMPTY STATE IF NO PROJECTS                           */}
        {/* ---------------------------------------------------- */}
        {!isLoading && userProjects.length === 0 && (
          <div className="border border-zinc-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-5 my-12 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Building className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-zinc-900">No Projects Evaluated Yet</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                You haven&rsquo;t submitted any Greenfield project assessments under <strong className="text-zinc-700">{user.email}</strong>. Start an assessment to generate your bankability rating, CMA model, and Executive Teaser.
              </p>
            </div>
            <button
              onClick={() => onOpenAssessment()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Evaluate New Project</span>
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 2. ULTRA-MINIMALIST PROJECT SNAPSHOT & METRICS       */}
        {/* ---------------------------------------------------- */}
        {activeProject && (
          <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
            
            {/* Project Header Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-5">
              <div className="flex items-start gap-4 min-w-0">
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsPhotoUploadModalOpen(true)}
                    className="relative group w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-zinc-200 bg-zinc-50 hover:ring-2 hover:ring-blue-500/40 transition-all"
                    title="Click to update project logo or photo"
                  >
                    {activeProject.photoOrLogo ? (
                      <img
                        src={activeProject.photoOrLogo}
                        alt="Project Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                        {activeProject.projectName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-zinc-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4" />
                      <span className="text-[9px] font-medium mt-0.5">Logo</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setIsPhotoUploadModalOpen(true)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm text-zinc-600 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer z-10"
                    title="Add or change logo"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                      Stage {currentStageIndex} of 6 • {currentStageName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                      {activeProject.status}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight truncate">
                    {activeProject.projectName}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-500 mt-0.5">
                    <span className="font-medium text-zinc-700">{activeProject.industry}</span>
                    <span>•</span>
                    <span>{activeProject.location}</span>
                    <span>•</span>
                    <span>
                      Assigned Bank:{' '}
                      {activeProject.bankName || activeProject.assignedBank ? (
                        <strong className="text-zinc-800 font-semibold">{activeProject.bankName || activeProject.assignedBank}</strong>
                      ) : (
                        <span className="text-zinc-400 italic">Not Specified</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement: Credit Information Report (CIR) Card */}
              <div className="w-full lg:w-[380px] shrink-0">
                <CreditInformationCard
                  status="Coming Soon"
                  creditScore="—"
                  bureau="—"
                  reportDate="—"
                  consentStatus="Not Provided"
                />
              </div>
            </div>

            {/* Smooth Linear Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Stage 1: Assessment</span>
                <span>Stage 3: DPR & CMA</span>
                <span>Stage 6: Funding Disbursed</span>
              </div>
            </div>

            {/* 5-Column High-Legibility Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Total Capex</span>
                <div className="text-lg font-bold text-zinc-900 mt-1">₹ {activeProject.totalCostCr} Cr</div>
                <span className="text-[11px] text-zinc-500">Project Outlay</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Institutional Term Debt</span>
                <div className="text-lg font-bold text-blue-600 mt-1">₹ {activeProject.loanRequiredCr} Cr</div>
                <span className="text-[11px] text-zinc-500 font-medium">{activeProject.debtPercent}% Debt Ratio</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Promoter Equity</span>
                <div className="text-lg font-bold text-zinc-900 mt-1">₹ {activeProject.promoterContribCr} Cr</div>
                <span className="text-[11px] text-zinc-500 font-medium">{activeProject.equityPercent}% In Hand</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Bankability Score</span>
                <div className="text-lg font-bold text-zinc-900 mt-1">{activeProject.feasibilityScore} / 100</div>
                <span className="text-[11px] text-blue-700 font-semibold">{activeProject.bankabilityRating}</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">AI-Generated DSCR</span>
                <div className="text-lg font-bold text-zinc-900 mt-1">
                  {activeProject.dscrEstimate > 0 ? `${activeProject.dscrEstimate.toFixed(2)}x` : 'Pending'}
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">{activeProject.dscrEstimate > 0 ? 'Based on project inputs' : 'Complete assessment for calculation'}</span>
              </div>
            </div>

            {/* Probability Success Meter */}
            <ProbabilityMeter
              score={activeProject.feasibilityScore}
              hasDpr={Boolean(activeProject.dprFile || (activeProject.uploadedDocuments && activeProject.uploadedDocuments.some(d => d.type === 'DPR')))}
              hasCma={Boolean(activeProject.cmaFile || (activeProject.uploadedDocuments && activeProject.uploadedDocuments.some(d => d.type === 'Financial Model')))}
              hasKyc={Boolean(activeProject.promotersList && activeProject.promotersList.some(p => p.kycStatus === 'Verified'))}
              isFunded={activeProject.isFunded}
              onToggleFunded={handleToggleFunded}
            />

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. VERTICAL ORDERING MENU & SECTION FILTERS          */}
        {/* ---------------------------------------------------- */}
        {activeProject && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 scrollbar-none">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'stages', label: '1. Journey with Inisio' },
              { id: 'financials', label: '2. Project Cost & Means of Finance' },
              { id: 'promoters', label: '3. Promoters & Management' },
              { id: 'checklist', label: '4. Indicative Checklist' },
              { id: 'documents', label: '5. Document Repository (DPDP)' },
              { id: 'risk', label: '6. Risk & Collateral' },
              { id: 'advisory', label: '7. Advisory Team & Support' },
              { id: 'payments', label: '8. Payments & Invoices' }
            ].map((tab) => {
              const isSel = activeSectionView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSectionView(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${isSel ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 4. MAIN VERTICAL SECTIONS                            */}
        {/* ---------------------------------------------------- */}
        {activeProject && (
          <div className="space-y-6">

            {/* SECTION 1: 6-STAGE PROJECT LIFECYCLE TRACKER */}
            {(activeSectionView === 'all' || activeSectionView === 'stages') && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
                <ProjectTimeline
                  project={activeProject}
                  user={user}
                  onTimelineUpdated={handleTimelineUpdated}
                  onOpenDocUpload={() => setIsDocUploadModalOpen(true)}
                  onRequestCADrafting={() => {
                    const text = `Hi, I would like to request Inisio CA Drafting for my project: ${activeProject?.projectName || ''}`;
                    window.open(`https://wa.me/916302026462?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                />

                {/* Section 1.5: Direct Bank Application Tracking Details */}
                <BankApplicationTracker
                  bankName={activeProject.bankName || activeProject.assignedBank || ''}
                  branchLocation={activeProject.branchLocation || ''}
                  bankIfscCode={activeProject.bankIfscCode || ''}
                  bankAppRefNumber={activeProject.bankAppRefNumber || ''}
                  bankApplicationStatus={activeProject.bankApplicationStatus || (activeProject.status === 'Bank Sanction' ? 'Sanction Approved' : activeProject.status === 'CA Approved' ? 'Under CA Review' : 'Draft Filing / Pre-Sanction Review')}
                  dprTimelineRollbackReason={activeProject.dprTimelineRollbackReason}
                  dprTargetDate={activeProject.dprTargetDate}
                  dprStageRollback={activeProject.dprStageRollback}
                  onSaveBankDetails={handleSaveBankDetails}
                />
              </div>
            )}

            {/* SECTION 2: PROJECT COST & MEANS OF FINANCE (CUSTOM COMPONENTS + UNITS) */}
            {(activeSectionView === 'all' || activeSectionView === 'financials') && (
              <div className="space-y-4">
                <ProjectFinancialsBreakup
                  totalCostCr={activeProject.totalCostCr}
                  loanRequiredCr={activeProject.loanRequiredCr}
                  promoterContribCr={activeProject.promoterContribCr}
                  financials={activeProject.financials}
                  customCosts={activeProject.customCostComponents}
                  customFinances={activeProject.customFinanceComponents}
                  onSaveFinancials={handleSaveFinancials}
                  onOpenEditModal={() => handleOpenEditSection('financials')}
                />

                {/* Promoter Fund Assistance Feature Card */}
                <PromoterFundAssistanceCard
                  status={activeProject.promoterFundAssistanceStatus || 'Not Requested'}
                  promoterContribCr={activeProject.promoterContribCr}
                  totalCostCr={activeProject.totalCostCr}
                  loanRequiredCr={activeProject.loanRequiredCr}
                  assistanceRequest={activeProject.promoterFundAssistanceRequest}
                  onRequestClick={() => setIsPromoterFundAssistanceModalOpen(true)}
                />
              </div>
            )}

            {/* SECTION 3: PROMOTERS & MANAGEMENT MANAGEMENT */}
            {(activeSectionView === 'all' || activeSectionView === 'promoters') && (
              <div className="space-y-4">
                <PromotersManagement
                  promoters={activeProject.promotersList || []}
                  onUpdatePromoters={handleUpdatePromoters}
                  primaryPromoterName={activeProject.fullName || user.name}
                />
                <CibilScoreWidget
                  applicantName={user.name || activeProject.fullName || 'Lead Promoter'}
                />
              </div>
            )}

            {/* SECTION 4: INDICATIVE UNDERWRITING CHECKLIST */}
            {(activeSectionView === 'all' || activeSectionView === 'checklist') && (
              <UnderwritingChecklist />
            )}

            {/* SECTION 5: DPR & ENCRYPTED DOCUMENT REPOSITORY */}
            {(activeSectionView === 'all' || activeSectionView === 'documents') && (
              <DocumentsCompliance
                documents={activeProject.uploadedDocuments || []}
                onUpdateDocuments={handleUpdateDocuments}
                projectName={activeProject.projectName}
                leadId={activeProject.id}
              />
            )}

            {/* SECTION 6: RISK & COLLATERAL PROFILE */}
            {(activeSectionView === 'all' || activeSectionView === 'risk') && (
              <div className="space-y-4">
                <CrisCompanyScoreBanner
                  score={activeProject.feasibilityScore}
                  companyName={activeProject.projectName}
                  industry={activeProject.industry}
                  caAssessmentTier={membership.plan === 'pro' ? 'Inisio Pro Certified' : 'Standard Appraisal'}
                />

                <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Risk Profile, Land Title &amp; Collateral Status</h2>
                        <p className="text-sm text-zinc-500 mt-0.5">Security coverage and promoter eligibility parameters for underwriting.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEditSection('land')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Risk Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                      <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">Land Status</span>
                      <strong className="text-zinc-900 block font-semibold">{activeProject.landStatus}</strong>
                      <span className="text-[11px] text-zinc-500">Industrial zoning verified</span>
                    </div>

                    <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                      <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">Collateral Security</span>
                      <strong className="text-zinc-900 block font-semibold">{activeProject.collateralStatus}</strong>
                      <span className="text-[11px] text-zinc-500">Primary + Collateral charge</span>
                    </div>

                    <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                      <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">Promoter Track Record</span>
                      <strong className="text-zinc-900 block font-semibold">{activeProject.promoterExp}</strong>
                      <span className="text-[11px] text-zinc-500">Relevant domain experience</span>
                    </div>

                    <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                      <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">Target Debt Syndicate</span>
                      <strong className="text-blue-700 block font-semibold truncate">{activeProject.assignedBank}</strong>
                      <span className="text-[11px] text-zinc-500">Nationalized &amp; Private Banks</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: ADVISORY TEAM & SUPPORT */}
            {(activeSectionView === 'all' || activeSectionView === 'advisory') && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Assigned Inisio Advisory &amp; Support Team</h2>
                      <p className="text-sm text-zinc-500 mt-0.5">Dedicated chartered accountants and banking relationship officers for your project.</p>
                    </div>
                  </div>
                </div>

                {!activeProject.assignedTeam ? (
                  <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-xl text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                    <div className="text-sm font-semibold text-amber-900">No Advisory Team Assigned Yet</div>
                    <p className="text-xs text-amber-700/80 max-w-md mx-auto">
                      Your project has not been assigned a dedicated advisory team yet. Connect with our desk to get started on your documentation.
                    </p>
                    <a
                      href={`https://wa.me/916302026462?text=Hello,%20I%20would%20like%20to%20connect%20with%20Inisio%20to%20assign%20an%20advisory%20team%20for%20my%20project:%20${encodeURIComponent(activeProject.projectName)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Inisio Support</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-800">
                    <span className="font-semibold">Assigned support team:</span> {activeProject.assignedTeam}
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsHelpCaModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Get Help from Inisio CA (Query Desk)</span>
                  </button>

                  <a
                    href="https://wa.me/916302026462"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inisio Expert (+91 63020 26462)</span>
                  </a>

                  <button
                    onClick={onOpenConsultation}
                    className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-zinc-600" />
                    <span>Schedule 1-on-1 Consultation Call</span>
                  </button>

                  <a
                    href="tel:+916302026462"
                    className="w-full sm:w-auto px-4 py-2.5 text-zinc-600 hover:text-zinc-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>
            )}

            {/* SECTION 8: PAYMENTS & INVOICES (RAZORPAY INTEGRATION) */}
            {(activeSectionView === 'all' || activeSectionView === 'payments') && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">8. Subscription, Payments &amp; Tax Invoices</h3>
                      <p className="text-xs text-zinc-500">Official GST receipts, subscription plans &amp; verified Razorpay transactions.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMembershipModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>{membership.isMember ? 'Upgrade / Renew Plan' : 'Get Inisio Pro Plan'}</span>
                    </button>
                  </div>
                </div>

                {/* Subscription Status Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Tier</span>
                    <div className="my-2 flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900 capitalize font-manrope">
                        {membership.plan || 'Free'} Plan
                      </span>
                      {membership.isMember && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {membership.isMember ? 'Unlimited assessment & bank models unlocked' : '1 free project appraisal included'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Gateway</span>
                    <div className="my-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span className="text-base font-bold text-slate-900">Razorpay Verified</span>
                    </div>
                    <span className="text-xs text-slate-500">UPI, NetBanking, Debit/Credit Cards &amp; EMI</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transactions</span>
                    <div className="my-2">
                      <span className="text-2xl font-black text-slate-900 font-manrope">
                        {paymentHistory.length}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">All invoices GST-compliant (18% ITC claimable)</span>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Billing History &amp; Receipts</span>
                    <button
                      type="button"
                      onClick={loadPaymentHistory}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {paymentHistory.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-zinc-500">
                      <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No paid transaction records found yet.</p>
                      <p className="text-[11px] text-zinc-400 mt-1">When you upgrade to Pro or Enterprise, your Razorpay invoices will appear here.</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden overflow-x-auto">
                      <table className="w-full text-xs text-left min-w-[650px]">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-4">Invoice #</th>
                            <th className="py-2.5 px-4">Description / Plan</th>
                            <th className="py-2.5 px-4">Amount</th>
                            <th className="py-2.5 px-4">Date</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                          {paymentHistory.map((p: any) => {
                            const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Recent';
                            return (
                              <tr key={p._id || p.orderId} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-blue-600">
                                  {p.invoiceNumber || 'INV-INISIO-2026'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-bold">{p.planName || 'Pro'}</span>
                                  <span className="text-[11px] text-zinc-500 block capitalize">{p.billingCycle || 'Quarterly'} Subscription</span>
                                </td>
                                <td className="py-3 px-4 font-bold font-mono">
                                  ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 text-zinc-500">{dateStr}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>CAPTURED</span>
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReceipt({
                                        success: true,
                                        message: 'Verified receipt',
                                        paymentId: p.paymentId || p._id,
                                        orderId: p.orderId,
                                        invoiceNumber: p.invoiceNumber || 'INV-INISIO-2026',
                                        status: p.status || 'captured',
                                        planName: p.planName || 'Pro Promoter',
                                        amount: p.amount || 0,
                                        currency: p.currency || 'INR',
                                        receipt: p.receipt || '',
                                        userEmail: p.userEmail || user.email,
                                      });
                                      setIsReceiptModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3 text-blue-600" />
                                    <span>View Invoice</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Get Help from Inisio CA Query Modal */}
      {activeProject && (
        <GetHelpFromCaModal
          isOpen={isHelpCaModalOpen}
          onClose={() => setIsHelpCaModalOpen(false)}
          projectName={activeProject.projectName}
          assignedCA={activeProject.assignedCA || activeProject.assignedTeam}
          userEmail={user.email}
          userName={user.name || activeProject.fullName}
        />
      )}

      {/* Membership Plans Modal */}
      <MembershipPlansModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        currentUser={user}
        onOpenConsultation={onOpenConsultation}
        onPlanUpgraded={(newPlan) => {
          setMembership(getUserMembership(user.email));
        }}
      />

      {/* Document Upload Modal */}
      {activeProject && (
        <DocumentUploadModal
          isOpen={isDocUploadModalOpen}
          project={activeProject}
          onClose={() => setIsDocUploadModalOpen(false)}
          onSave={(updates) => {
            handleSaveModalProject({
              dprFile: updates.dprFile !== undefined ? (updates.dprFile || undefined) : undefined,
              cmaFile: updates.cmaFile !== undefined ? (updates.cmaFile || undefined) : undefined,
              uploadedDocuments: updates.uploadedDocuments || activeProject.uploadedDocuments
            });
            triggerToast('DPR / CMA Documents uploaded and synchronized successfully.');
          }}
        />
      )}

      {/* Project Edit Modal */}
      {activeProject && (
        <ProjectEditModal
          isOpen={isEditingModalOpen}
          project={activeProject}
          initialSection={editSection}
          onClose={() => setIsEditingModalOpen(false)}
          onSave={(updates) => {
            handleSaveModalProject(updates);
          }}
        />
      )}

      {/* Photo/Logo Upload Modal */}
      {activeProject && (
        <PhotoUploadModal
          isOpen={isPhotoUploadModalOpen}
          currentPhoto={activeProject.photoOrLogo}
          projectName={activeProject.projectName}
          onClose={() => setIsPhotoUploadModalOpen(false)}
          onSave={handleSavePhotoOrLogo}
        />
      )}

      {/* Promoter Fund Assistance Modal */}
      {activeProject && (
        <PromoterFundAssistanceModal
          isOpen={isPromoterFundAssistanceModalOpen}
          onClose={() => setIsPromoterFundAssistanceModalOpen(false)}
          project={{
            id: activeProject.id,
            projectName: activeProject.projectName,
            totalCostCr: activeProject.totalCostCr,
            loanRequiredCr: activeProject.loanRequiredCr,
            promoterContribCr: activeProject.promoterContribCr,
            fullName: activeProject.fullName || user.name,
            mobile: activeProject.mobile || user.phone,
            email: activeProject.email || user.email,
            promoterFundAssistanceStatus: activeProject.promoterFundAssistanceStatus,
            promoterFundAssistanceRequest: activeProject.promoterFundAssistanceRequest
          }}
          user={user}
          onRequestSubmitted={(req) => {
            handleSaveModalProject({
              promoterContributionAvailable: 'No',
              promoterFundAssistanceStatus: 'Request Submitted',
              promoterFundAssistanceRequest: req
            });
            triggerToast(`Promoter fund assistance request for ₹${req.requiredAmountCr} Cr submitted!`);
          }}
        />
      )}

      {/* Payment Receipt / Tax Invoice Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        paymentData={selectedReceipt}
      />
    </div>
  );
};
