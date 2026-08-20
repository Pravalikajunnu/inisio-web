import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { fetchLeadsFromBackend, updateLeadRecord, LeadRecord } from '../utils/leadStore';
import { generateProjectTeaserPDF, TeaserPDFData } from '../utils/pdfGenerator';
import { ProjectEditModal, EditSectionType } from './ProjectEditModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { PhotoUploadModal } from './PhotoUploadModal';
import { DetailedRiskProfileData } from './DetailedRiskProfileForm';
import { CommercialSupplyFundingData } from './CommercialSupplyFundingForm';
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
  ExternalLink,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  FileUp,
  Headphones,
  Users2,
  Upload,
  Map as MapIcon,
  Filter,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface UserDashboardProps {
  user: AuthUser;
  onOpenAssessment: (projectToEdit?: any) => void;
  onOpenConsultation: () => void;
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
  downloadedDate: string;
  downloadedPDF: boolean;
  notes?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  photoOrLogo?: string;
  dprFile?: { name: string; size: number; uploadedAt: string } | null;
  cmaFile?: { name: string; size: number; uploadedAt: string } | null;
  assignedTeam?: string;
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
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onOpenAssessment,
  onOpenConsultation
}) => {
  const [userProjects, setUserProjects] = useState<UserProjectDetail[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState<boolean>(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState<boolean>(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState<boolean>(false);
  const [activeSectionView, setActiveSectionView] = useState<string>('all');
  const [editSection, setEditSection] = useState<EditSectionType>('all');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [dprRequestSuccess, setDprRequestSuccess] = useState<boolean>(false);

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

      leads.forEach((lead) => {
        const cost = parseFloat(String(lead.totalCostCr || 0)) || 10;
        const loan = parseFloat(String(lead.loanRequiredCr || 0)) || Math.round(cost * 0.75 * 10) / 10;
        const equity = parseFloat(String(lead.promoterContribCr || 0)) || Math.round((cost - loan) * 10) / 10;
        const dPct = cost > 0 ? Math.round((loan / cost) * 100) : 75;
        const eqPct = 100 - dPct;
        const score = Number(lead.feasibilityScore || 82);
        
        let rating = 'Investment Grade (A)';
        if (score >= 85) rating = 'Prime Bankable (AAA)';
        else if (score >= 75) rating = 'Highly Viable (AA)';
        else if (score >= 65) rating = 'Moderate (BBB)';

        const dscr = Math.round((1.35 + (score % 15) * 0.03) * 100) / 100;
        const interest = score >= 80 ? '8.65% - 9.15% p.a.' : '9.25% - 9.85% p.a.';

        projectMap.set(lead.id, {
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
          landStatus: lead.landStatus || 'Industrial Land Allotted',
          collateralStatus: lead.collateralStatus || 'Factory & Plant Machinery',
          promoterExp: lead.promoterExp || 'Over 10+ Years Industry Track Record',
          status: (lead.status || 'In Appraisal') as any,
          stageNumber: lead.status === 'CA Approved' ? 4 : (lead.downloadedPDF ? 3 : 2),
          assignedCA: 'CA Rajesh Sharma (FCA #847201)',
          assignedBank: 'SBI / Canara Bank / HDFC Bank Consortium',
          downloadedDate: lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          downloadedPDF: Boolean(lead.downloadedPDF),
          notes: lead.notes || 'Targeting debt syndication with Central / State capital subsidy.',
          fullName: lead.fullName,
          mobile: lead.mobile,
          email: lead.email,
          photoOrLogo: lead.photoOrLogo || '',
          dprFile: lead.dprFile || null,
          cmaFile: lead.cmaFile || null,
          assignedTeam: lead.assignedTeam || 'CA Rajesh Sharma (FCA #847201), Priya Verma (Financial Analyst)',
          timelineDate: lead.timelineDate || '',
          timelineTime: lead.timelineTime || '',
          timestamp: lead.timestamp,
          bankAppliedAt: lead.bankAppliedAt,
          loanApprovedAt: lead.loanApprovedAt,
          fundingDisbursedAt: lead.fundingDisbursedAt,
          lastEditedBy: lead.lastEditedBy,
          lastEditedAt: lead.lastEditedAt,
          riskProfileData: lead.riskProfileData,
          commercialData: lead.commercialData
        });
      });

      apiProjects.forEach((proj) => {
        const id = proj._id || proj.id;
        const cost = parseFloat(String(proj.totalCostCr || 0)) || 10;
        const loan = parseFloat(String(proj.loanRequiredCr || 0)) || Math.round(cost * 0.75 * 10) / 10;
        const equity = parseFloat(String(proj.promoterContribCr || 0)) || Math.round((cost - loan) * 10) / 10;
        const dPct = cost > 0 ? Math.round((loan / cost) * 100) : 75;
        const eqPct = 100 - dPct;
        const score = Number(proj.feasibilityScore || 82);

        let rating = 'Investment Grade (A)';
        if (score >= 85) rating = 'Prime Bankable (AAA)';
        else if (score >= 75) rating = 'Highly Viable (AA)';
        else if (score >= 65) rating = 'Moderate (BBB)';

        const dscr = Math.round((1.35 + (score % 15) * 0.03) * 100) / 100;
        const interest = score >= 80 ? '8.65% - 9.15% p.a.' : '9.25% - 9.85% p.a.';

        if (!projectMap.has(id)) {
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
            landStatus: proj.landStatus || 'Industrial Land Allotted',
            collateralStatus: proj.collateralStatus || 'Factory & Plant Machinery',
            promoterExp: proj.promoterExp || 'Over 10+ Years Industry Track Record',
            status: (proj.status || 'In Appraisal') as any,
            stageNumber: proj.status === 'CA Approved' ? 4 : (proj.downloadedPDF ? 3 : 2),
            assignedCA: 'CA Rajesh Sharma (FCA #847201)',
            assignedBank: 'SBI / Canara Bank / HDFC Bank Consortium',
            downloadedDate: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            downloadedPDF: Boolean(proj.downloadedPDF),
            notes: proj.description || 'Targeting debt syndication with Central / State capital subsidy.',
            fullName: proj.fullName,
            mobile: proj.mobile,
            email: proj.email,
            photoOrLogo: proj.photoOrLogo || '',
            dprFile: proj.dprFile || null,
            cmaFile: proj.cmaFile || null,
            assignedTeam: proj.assignedTeam || 'CA Rajesh Sharma (FCA #847201), Priya Verma (Financial Analyst)',
            timelineDate: proj.timelineDate || '',
            timelineTime: proj.timelineTime || '',
            timestamp: proj.createdAt,
            bankAppliedAt: proj.bankAppliedAt,
            loanApprovedAt: proj.loanApprovedAt,
            fundingDisbursedAt: proj.fundingDisbursedAt,
            lastEditedBy: proj.lastEditedBy,
            lastEditedAt: proj.lastEditedAt,
            riskProfileData: proj.riskProfileData,
            commercialData: proj.commercialData
          });
        }
      });

      const list = Array.from(projectMap.values());
      setUserProjects(list);

      if (list.length > 0) {
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
    const handleUpdate = () => loadUserProjects();
    window.addEventListener('inisio_lead_added', handleUpdate);
    return () => window.removeEventListener('inisio_lead_added', handleUpdate);
  }, [user.email]);

  const activeProject = userProjects.find(p => p.id === selectedProjectId) || userProjects[0] || null;

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
      timelineTime: updates.timelineTime !== undefined ? updates.timelineTime : activeProject.timelineTime
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

  const handleDownloadTeaserPDF = (proj: UserProjectDetail) => {
    const pdfData: TeaserPDFData = {
      fullName: user.name || proj.fullName || 'Promoter',
      mobile: user.phone || proj.mobile || '9848012345',
      email: user.email || proj.email,
      projectName: proj.projectName,
      industry: proj.industry,
      location: proj.location,
      totalCostCr: String(proj.totalCostCr),
      promoterContribCr: String(proj.promoterContribCr),
      loanRequiredCr: String(proj.loanRequiredCr),
      landStatus: proj.landStatus,
      collateralStatus: proj.collateralStatus,
      promoterExp: proj.promoterExp,
      description: proj.notes || `Targeting ${proj.assignedBank} debt syndication.`,
      feasibilityScore: proj.feasibilityScore,
      bankabilityRating: proj.bankabilityRating,
      estimatedLoan: String(proj.loanRequiredCr),
      eqPct: proj.equityPercent,
      debtPct: proj.debtPercent,
      dscrEstimate: proj.dscrEstimate,
      estInterestRate: proj.estInterestRate,
      riskProfileData: proj.riskProfileData
    };

    generateProjectTeaserPDF(pdfData);
    triggerToast(`Downloaded ${proj.projectName} Teaser PDF!`);
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

  const isAssessmentCompleted = Boolean(activeProject && (activeProject.projectName || activeProject.totalCostCr));
  const isRatingCompleted = Boolean(activeProject && (activeProject.feasibilityScore !== undefined || activeProject.bankabilityRating));
  const isDocCompleted = Boolean(activeProject?.dprFile?.uploadedAt || activeProject?.cmaFile?.uploadedAt);
  const isBankAppCompleted = Boolean(activeProject?.bankAppliedAt);
  const isLoanApproved = Boolean(activeProject?.loanApprovedAt);
  const isFundingCompleted = Boolean(activeProject?.fundingDisbursedAt);

  const lifecycleStages = [
    {
      id: 1,
      name: 'Project Assessment',
      description: 'Check your project details and basic requirements.',
      icon: ClipboardList,
      isCompleted: isAssessmentCompleted,
      isInProgress: !isAssessmentCompleted,
      completedAt: isAssessmentCompleted ? assessmentCompletedTime : null
    },
    {
      id: 2,
      name: 'Bankability Rating',
      description: 'Evaluate your project’s loan eligibility and financial strength.',
      icon: Gauge,
      isCompleted: isRatingCompleted,
      isInProgress: isAssessmentCompleted && !isRatingCompleted,
      completedAt: isRatingCompleted ? assessmentCompletedTime : null
    },
    {
      id: 3,
      name: 'Document Preparation',
      description: 'Prepare your DPR and CMA documents for bank submission.',
      icon: FileText,
      isCompleted: isDocCompleted,
      isInProgress: isRatingCompleted && !isDocCompleted,
      completedAt: isDocCompleted ? dprDateFormatted : null
    },
    {
      id: 4,
      name: 'Bank Application',
      description: 'Submit your loan application to suitable banks.',
      icon: Landmark,
      isCompleted: isBankAppCompleted,
      isInProgress: isDocCompleted && !isBankAppCompleted,
      completedAt: isBankAppCompleted ? formatRealtimeDate(activeProject?.bankAppliedAt) : null
    },
    {
      id: 5,
      name: 'Loan Approval',
      description: 'Get approval from the bank with loan terms.',
      icon: ShieldCheck,
      isCompleted: isLoanApproved,
      isInProgress: isBankAppCompleted && !isLoanApproved,
      completedAt: isLoanApproved ? formatRealtimeDate(activeProject?.loanApprovedAt) : null
    },
    {
      id: 6,
      name: 'Funding Disbursal',
      description: 'Complete final steps and receive your project funding.',
      icon: IndianRupee,
      isCompleted: isFundingCompleted,
      isInProgress: isLoanApproved && !isFundingCompleted,
      completedAt: isFundingCompleted ? formatRealtimeDate(activeProject?.fundingDisbursedAt) : null
    }
  ];

  const completedStagesCount = lifecycleStages.filter(s => s.isCompleted).length;
  const currentStageIndex = Math.min(6, completedStagesCount + (lifecycleStages.some(s => s.isInProgress) ? 1 : 0) || 1);
  const currentStageItem = lifecycleStages.find(s => s.id === currentStageIndex) || lifecycleStages[0];
  const currentStageName = currentStageItem.name;
  const progressPercent = Math.round((completedStagesCount / 6) * 100);

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

      {/* Document Upload Modal */}
      {activeProject && (
        <DocumentUploadModal
          project={activeProject}
          isOpen={isDocUploadModalOpen}
          onClose={() => setIsDocUploadModalOpen(false)}
          onSave={(docUpdates) => handleSaveModalProject(docUpdates)}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ---------------------------------------------------- */}
        {/* 1. TOP MINIMALIST CONTROL & PROJECT SWITCHER BAR     */}
        {/* ---------------------------------------------------- */}
        <div className="border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Left: Project Selector & Brand Breadcrumb */}
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600 uppercase tracking-wider">Inisio Project Finance</span>
                <span className="text-zinc-300 text-lg">/</span>
                <span className="text-base text-zinc-500 font-semibold">{user.name || user.email}</span>
              </div>

              {/* Project Dropdown / Switcher */}
              {userProjects.length > 0 && (
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
                    onClick={() => handleDownloadTeaserPDF(activeProject)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download 14-Page Executive Teaser PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Teaser PDF</span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPhotoUploadModalOpen(true)}
                  className="relative group w-14 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-zinc-200 bg-zinc-50 hover:ring-2 hover:ring-blue-500/40 transition-all"
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
                    <span>Assigned Bank: <strong className="text-zinc-800">{activeProject.assignedBank}</strong></span>
                  </div>
                </div>
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
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Bank Term Loan</span>
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
                <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">DSCR & Rate</span>
                <div className="text-lg font-bold text-zinc-900 mt-1">{activeProject.dscrEstimate}x</div>
                <span className="text-[11px] text-zinc-500 font-medium">{activeProject.estInterestRate}</span>
              </div>
            </div>

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
              { id: 'financials', label: '2. Financial & Debt Structure' },
              { id: 'documents', label: '3. DPR & CMA Compliance' },
              { id: 'risk', label: '4. Risk & Collateral' },
              { id: 'advisory', label: '5. Advisory Team & Support' }
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
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <MapIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Your Journey with Inisio</h2>
                      <p className="text-sm text-zinc-500 mt-0.5">Track real-time progress of your greenfield bank loan syndication.</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Stage {currentStageIndex} Active
                  </span>
                </div>

                <div className="space-y-3">
                  {lifecycleStages.map((st) => {
                    const IconComponent = st.icon;
                    const isCompleted = st.isCompleted;
                    const isInProgress = st.isInProgress;
                    const isPending = !isCompleted && !isInProgress;

                    return (
                      <div
                        key={st.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : isInProgress
                            ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-zinc-50/60 border-zinc-200 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Stage Number Badge */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isInProgress
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            {st.id}
                          </div>

                          {/* Icon & Title */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-xs font-bold ${isPending ? 'text-zinc-600' : 'text-zinc-900'}`}>
                                {st.name}
                              </h3>
                              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                              {st.description}
                            </p>

                            {/* Completed Timestamp */}
                            {isCompleted && st.completedAt && (
                              <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                <span>Completed: {st.completedAt}</span>
                              </div>
                            )}

                            {/* Actions for Stage 3 (DPR/CMA) when In Progress */}
                            {isInProgress && st.id === 3 && (
                              <div className="pt-2 flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => setIsDocUploadModalOpen(true)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs"
                                >
                                  Upload DPR/CMA
                                </button>
                                <button
                                  onClick={() => {
                                    const text = `Hi, I would like to request Inisio CA Drafting for my project: ${activeProject?.projectName || ''}`;
                                    window.open(`https://wa.me/916302026462?text=${encodeURIComponent(text)}`, '_blank');
                                  }}
                                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-xs font-semibold cursor-pointer"
                                >
                                  Get help from Inisio CA
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 pl-11 sm:pl-0">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Completed</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>In Progress</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-400 text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: FINANCIAL & DEBT STRUCTURE */}
            {(activeSectionView === 'all' || activeSectionView === 'financials') && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Financial Appraisal &amp; Capital Structure</h2>
                      <p className="text-sm text-zinc-500 mt-0.5">Detailed debt/equity split, cash flow coverage, and interest terms.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEditSection('bankability')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Financials</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Capex Breakdown Box */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Capex Outlay</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Total Project Capex:</span>
                        <strong className="text-zinc-900">₹ {activeProject.totalCostCr} Cr</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Term Loan Required:</span>
                        <strong className="text-blue-600">₹ {activeProject.loanRequiredCr} Cr ({activeProject.debtPercent}%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Promoter Equity:</span>
                        <strong className="text-zinc-900">₹ {activeProject.promoterContribCr} Cr ({activeProject.equityPercent}%)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bank Terms & DSCR */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Underwriting Metrics</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Projected DSCR:</span>
                        <strong className="text-emerald-700 font-bold">{activeProject.dscrEstimate}x (Min 1.25x)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Estimated Interest:</span>
                        <strong className="text-zinc-900">{activeProject.estInterestRate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Target Consortium:</span>
                        <span className="text-zinc-700 font-medium text-right truncate max-w-[150px]">{activeProject.assignedBank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Industry */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Project Identification</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Industry / Sector:</span>
                        <strong className="text-zinc-900 text-right truncate max-w-[150px]">{activeProject.industry}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">State &amp; District:</span>
                        <span className="text-zinc-800 font-medium">{activeProject.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Feasibility Rating:</span>
                        <span className="text-blue-700 font-bold">{activeProject.bankabilityRating}</span>
                      </div>
                    </div>
                  </div>

                </div>


              </div>
            )}

            {/* SECTION 3: DPR & CMA COMPLIANCE CENTER */}
            {(activeSectionView === 'all' || activeSectionView === 'documents') && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Detailed Project Report (DPR) &amp; CMA Documentation</h2>
                      <p className="text-sm text-zinc-500 mt-0.5">Required technical reports and balance sheet schedules for bank sanction.</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${hasAnyDoc ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {hasAnyDoc ? 'Documents Active' : 'Action Required'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* DPR Card */}
                  <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                          {activeProject.dprFile ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
                          <span>Detailed Project Report (DPR)</span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          {activeProject.dprFile ? activeProject.dprFile.name : 'Not yet uploaded / drafted'}
                        </p>
                        <span className="text-[11px] text-zinc-400 block">
                          Comprehensive technical appraisal and machinery cost validation
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 text-xs">
                      <button
                        onClick={() => handleDownloadTeaserPDF(activeProject)}
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Teaser</span>
                      </button>
                      <span className="text-zinc-300">•</span>
                      <button
                        onClick={() => setIsDocUploadModalOpen(true)}
                        className="font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                      >
                        {activeProject.dprFile ? 'Replace Document' : 'Upload DPR File'}
                      </button>
                    </div>
                  </div>
                  
                  {/* CMA Card */}
                  <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                          {activeProject.cmaFile ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <FileSpreadsheet className="w-4 h-4 text-blue-600" />}
                          <span>CMA Financial Model</span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          {activeProject.cmaFile ? activeProject.cmaFile.name : 'Standard Inisio Model Ready'}
                        </p>
                        <span className="text-[11px] text-zinc-400 block">
                          10-Year P&amp;L, balance sheet, fund flow, and DSCR ratios
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 text-xs">
                      <button
                        onClick={() => setIsDocUploadModalOpen(true)}
                        className="font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{activeProject.cmaFile ? 'Replace CMA Model' : 'Upload CMA Model'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DPR Request CTA if needed */}
                {!hasAnyDoc && (
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-zinc-900">Need Inisio Chartered Accountants to prepare your bank-ready DPR?</div>
                        <p className="text-zinc-500 mt-0.5">We draft vetted DPR and CMA reports with guaranteed bank committee compliance within 48 to 72 hours.</p>
                      </div>
                      <button
                        onClick={handleRequestDPRPreparation}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Request DPR Drafting</span>
                      </button>
                    </div>

                    {dprRequestSuccess && (
                      <div className="p-2.5 bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                        <span>Your DPR preparation request has been routed to Inisio Lead CA Rajesh Sharma. We will call you within 2 hours.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: RISK & COLLATERAL PROFILE */}
            {(activeSectionView === 'all' || activeSectionView === 'risk') && (
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
                      <span>Connect to Inisio</span>
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Advisor 1 */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        RS
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-zinc-900 truncate">{activeProject.assignedCA || 'CA Rajesh Sharma'}</div>
                        <div className="text-zinc-500 truncate">Lead CA &amp; Underwriting Head</div>
                        <div className="text-[10px] text-blue-600 font-medium mt-0.5">ICAI #847201</div>
                      </div>
                    </div>

                    {/* Advisor 2 */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                        PV
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-zinc-900 truncate">Priya Verma</div>
                        <div className="text-zinc-500 truncate">Senior Financial Analyst</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">CMA &amp; DSCR Modeling</div>
                      </div>
                    </div>

                    {/* Advisor 3 */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                        VM
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-zinc-900 truncate">Vikram Malhotra</div>
                        <div className="text-zinc-500 truncate">Relationship Manager</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Bank Consortium Liaison</div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href="https://wa.me/916302026462"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inisio Expert Desk (+91 63020 26462)</span>
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

          </div>
        )}

      </div>
    </div>
  );
};
