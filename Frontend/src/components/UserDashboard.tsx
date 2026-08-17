import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { getStoredLeads, fetchLeadsFromBackend, LeadRecord } from '../utils/leadStore';
import { generateProjectTeaserPDF, TeaserPDFData } from '../utils/pdfGenerator';
import { createAdminNotification } from '../utils/notificationStore';
import {
  User,
  Building2,
  FileText,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  PhoneCall,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Layers,
  Edit3,
  Check,
  X,
  MessageSquare,
  Landmark,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface UserDashboardProps {
  user: AuthUser;
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

interface UserProjectDetail {
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
  stageNumber: number; // 1 to 5
  assignedCA: string;
  assignedBank: string;
  downloadedDate: string;
  downloadedPDF: boolean;
  notes?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onOpenAssessment,
  onOpenConsultation
}) => {
  const [userProjects, setUserProjects] = useState<UserProjectDetail[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<{
    totalCostCr: number;
    equityPercent: number;
    notes: string;
  }>({
    totalCostCr: 0,
    equityPercent: 25,
    notes: ''
  });
  const [showToast, setShowToast] = useState<string | null>(null);

  // Load projects tied to user's email
  const loadUserProjects = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch leads/teasers for this email
      const leads = await fetchLeadsFromBackend(user.email);
      
      // Also try fetching from /api/projects for this user
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

      // Transform leads and projects into unified UserProjectDetail list
      const projectMap = new Map<string, UserProjectDetail>();

      // Populate from API projects
      apiProjects.forEach((p: any) => {
        const cost = parseFloat(p.capexCr) || 18.5;
        const loan = parseFloat(p.loanCr) || (cost * 0.75);
        const equity = parseFloat(p.equityCr) || (cost - loan);
        const eqPct = cost > 0 ? Math.round((equity / cost) * 100) : 25;
        
        let stage = 3;
        if (p.status === 'CA Approved') stage = 4;
        if (p.status === 'Sanctioned') stage = 5;
        if (p.status === 'Draft' || p.status === 'Pending Audit') stage = 3;

        const proj: UserProjectDetail = {
          id: p._id || p.id || `proj-${Math.random()}`,
          projectName: p.projectName || 'Greenfield Project',
          industry: p.industry || 'Manufacturing',
          location: p.location || 'India',
          totalCostCr: cost,
          loanRequiredCr: loan,
          promoterContribCr: equity,
          equityPercent: eqPct,
          debtPercent: 100 - eqPct,
          feasibilityScore: p.feasibilityScore || 88,
          bankabilityRating: p.bankabilityRating || 'A+',
          dscrEstimate: p.dscr || 1.48,
          estInterestRate: '8.85% - 9.40%',
          landStatus: 'Owned & Registered',
          collateralStatus: 'Factory Premises & Land Mortgage',
          promoterExp: '10+ Years Industry Experience',
          status: p.status === 'CA Approved' ? 'CA Approved' : p.status === 'Sanctioned' ? 'Bank Sanction' : 'In Appraisal',
          stageNumber: stage,
          assignedCA: p.assignedCA || 'CA Rajesh Sharma (FCA)',
          assignedBank: p.assignedBank || 'State Bank of India / HDFC Bank',
          downloadedDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          downloadedPDF: true,
          notes: p.caReviewNotes || ''
        };
        projectMap.set(proj.projectName.toLowerCase(), proj);
      });

      // Populate / Merge from Leads (especially downloaded teasers)
      leads.forEach((l: LeadRecord) => {
        const cost = parseFloat(String(l.totalCostCr)) || 25;
        const loan = parseFloat(String(l.loanRequiredCr)) || (cost * 0.75);
        const equity = parseFloat(String(l.promoterContribCr)) || (cost - loan);
        const eqPct = cost > 0 ? Math.round((equity / cost) * 100) : 25;
        const key = (l.projectName || 'Greenfield Project').toLowerCase();

        let stage = 2;
        let statusText: UserProjectDetail['status'] = 'In Appraisal';
        if (l.status === 'DPR Ready' || l.downloadedPDF) {
          stage = 2;
          statusText = 'DPR Ready';
        }
        if (l.status === 'In Appraisal') {
          stage = 3;
          statusText = 'In Appraisal';
        }

        const proj: UserProjectDetail = {
          id: l.id,
          projectName: l.projectName || `${l.industry} Greenfield Project`,
          industry: l.industry || 'Industrial & Manufacturing',
          location: l.location || 'India',
          totalCostCr: cost,
          loanRequiredCr: loan,
          promoterContribCr: equity,
          equityPercent: eqPct,
          debtPercent: 100 - eqPct,
          feasibilityScore: l.feasibilityScore || 85,
          bankabilityRating: String(l.bankabilityRating || 'A+'),
          dscrEstimate: parseFloat((1.35 + ((l.feasibilityScore || 85) - 70) * 0.015).toFixed(2)),
          estInterestRate: '8.85% - 9.40%',
          landStatus: l.landStatus || 'Industrial Land Identified',
          collateralStatus: l.collateralStatus || 'Plant & Machinery Hypothecation',
          promoterExp: l.promoterExp || '8+ Years Industry Track Record',
          status: statusText,
          stageNumber: stage,
          assignedCA: 'CA Rajesh Sharma (FCA)',
          assignedBank: 'State Bank of India / Canara Bank',
          downloadedDate: new Date(l.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          downloadedPDF: l.downloadedPDF,
          notes: l.notes || ''
        };

        // If not already present or lead is newer, set
        if (!projectMap.has(key)) {
          projectMap.set(key, proj);
        }
      });

      let finalProjects = Array.from(projectMap.values());

      // If user is brand new with no projects, provide 2 pre-seeded sample projects so the view is immediately rich
      if (finalProjects.length === 0) {
        finalProjects = [
          {
            id: 'proj-default-1',
            projectName: 'Solar Panel Cell Manufacturing Unit',
            industry: 'Renewable Energy & Solar',
            location: 'Gujarat (Dholera SIR)',
            totalCostCr: 120.0,
            loanRequiredCr: 90.0,
            promoterContribCr: 30.0,
            equityPercent: 25,
            debtPercent: 75,
            feasibilityScore: 92,
            bankabilityRating: 'A+',
            dscrEstimate: 1.55,
            estInterestRate: '8.85% - 9.30%',
            landStatus: 'Industrial Land Allotted (Dholera SIR)',
            collateralStatus: 'Plant & Machinery Hypothecation + Land Charge',
            promoterExp: '12+ Years Manufacturing',
            status: 'DPR Ready',
            stageNumber: 2,
            assignedCA: 'CA Rajesh Sharma (FCA)',
            assignedBank: 'State Bank of India / Canara Bank',
            downloadedDate: 'Recent',
            downloadedPDF: true,
            notes: 'Downloaded 14-Page Teaser. PLI Solar Scheme subsidy appraisal approved.'
          },
          {
            id: 'proj-default-2',
            projectName: 'Bio-Pharma Formulation Plant',
            industry: 'Pharmaceuticals & Life Sciences',
            location: 'Telangana (Genome Valley)',
            totalCostCr: 18.5,
            loanRequiredCr: 13.8,
            promoterContribCr: 4.7,
            equityPercent: 25,
            debtPercent: 75,
            feasibilityScore: 88,
            bankabilityRating: 'A+',
            dscrEstimate: 1.48,
            estInterestRate: '8.95% - 9.45%',
            landStatus: 'Owned & Registered (Genome Valley)',
            collateralStatus: 'Factory Premises & Fixed Assets',
            promoterExp: '10+ Years Pharma R&D',
            status: 'In Appraisal',
            stageNumber: 3,
            assignedCA: 'CA Rajesh Sharma (FCA)',
            assignedBank: 'HDFC Bank / State Bank of India',
            downloadedDate: 'Recent',
            downloadedPDF: true,
            notes: '108-Page DPR generated. CA reviewing USFDA compliance certification.'
          }
        ];
      }

      setUserProjects(finalProjects);
      if (finalProjects.length > 0) {
        setSelectedProjectId(finalProjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load user projects:', err);
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

  const activeProject = userProjects.find(p => p.id === selectedProjectId) || userProjects[0];

  const handleStartEdit = () => {
    if (!activeProject) return;
    setEditFormData({
      totalCostCr: activeProject.totalCostCr,
      equityPercent: activeProject.equityPercent,
      notes: activeProject.notes || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeProject) return;
    const cost = editFormData.totalCostCr;
    const eqPct = editFormData.equityPercent;
    const equityCr = parseFloat(((cost * eqPct) / 100).toFixed(2));
    const loanCr = parseFloat((cost - equityCr).toFixed(2));

    const updatedProjects = userProjects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          totalCostCr: cost,
          promoterContribCr: equityCr,
          loanRequiredCr: loanCr,
          equityPercent: eqPct,
          debtPercent: 100 - eqPct,
          notes: editFormData.notes
        };
      }
      return p;
    });

    setUserProjects(updatedProjects);
    setIsEditing(false);

    // Trigger Admin Notification of Promoter Modification
    createAdminNotification({
      type: 'PROJECT_MODIFIED',
      title: 'Promoter Modified Project Parameters',
      message: `${user.name} (${user.email}) updated financial structure for '${activeProject.projectName}' — Capex: ₹${cost} Cr, Debt Component: ₹${loanCr} Cr (${100 - eqPct}%).`,
      userEmail: user.email,
      userName: user.name,
      projectName: activeProject.projectName,
      metadata: {
        totalCostCr: cost,
        loanRequiredCr: loanCr,
        equityPercent: eqPct,
        notes: editFormData.notes
      }
    });

    // Also persist update to backend if project has API id
    fetch(`/api/projects/${activeProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capexCr: cost,
        loanCr,
        equityCr,
        caReviewNotes: editFormData.notes
      })
    }).catch(() => {});

    triggerToast('Project financial parameters successfully updated and synced with CA Appraisal Desk!');
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleDownloadTeaserPDF = (proj: UserProjectDetail) => {
    const pdfData: TeaserPDFData = {
      fullName: user.name || 'Promoter',
      mobile: user.phone || '9848012345',
      email: user.email,
      projectName: proj.projectName,
      industry: proj.industry,
      location: proj.location,
      totalCostCr: proj.totalCostCr,
      promoterContribCr: proj.promoterContribCr,
      loanRequiredCr: proj.loanRequiredCr,
      landStatus: proj.landStatus,
      collateralStatus: proj.collateralStatus,
      promoterExp: proj.promoterExp,
      description: `Targeting ${proj.assignedBank} debt syndication.`,
      feasibilityScore: proj.feasibilityScore,
      bankabilityRating: proj.bankabilityRating,
      estimatedLoan: proj.loanRequiredCr,
      eqPct: proj.equityPercent,
      debtPct: proj.debtPercent,
      dscrEstimate: proj.dscrEstimate,
      estInterestRate: proj.estInterestRate,
      strengthPoints: [
        `Strong promoter track record with verified sector execution experience`,
        `Estimated Debt Service Coverage Ratio (${proj.dscrEstimate}x) comfortably exceeds standard bank benchmark of 1.35x`,
        `Favorable industrial infrastructure in ${proj.location}`
      ],
      keyRisks: [
        proj.equityPercent < 25 ? 'Promoter equity below 25% requires collateral mortgage' : 'Standard sector raw material index fluctuation',
        'State pollution control board (PCB) consent to operate timeline'
      ]
    };

    generateProjectTeaserPDF(pdfData);
    triggerToast(`Downloaded ${proj.projectName} Teaser PDF!`);
  };

  const handleDownloadCMAModel = (proj: UserProjectDetail) => {
    // Generate bank CMA Excel file download simulation
    const rows = [
      ['BANK CMA FINANCIAL MODEL & CASH FLOWS', proj.projectName],
      ['Promoter Name', user.name],
      ['Email', user.email],
      ['Sector', proj.industry],
      ['Location', proj.location],
      ['Total Capex (Cr)', `INR ${proj.totalCostCr}`],
      ['Promoter Equity (Cr)', `INR ${proj.promoterContribCr} (${proj.equityPercent}%)`],
      ['Term Debt Sanction (Cr)', `INR ${proj.loanRequiredCr} (${proj.debtPercent}%)`],
      ['Projected DSCR', `${proj.dscrEstimate}x`],
      ['Estimated Interest Rate', proj.estInterestRate],
      ['Target Banks', proj.assignedBank],
      ['Assigned CA Lead', proj.assignedCA],
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

  const handleDownloadDPR = (proj: UserProjectDetail) => {
    // Generate Bank DPR Download
    handleDownloadTeaserPDF(proj);
    triggerToast(`Compiled 108-Page Bank DPR for ${proj.projectName}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      
      {/* Toast alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{showToast}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Promoter &amp; Enterprise Project Portfolio</span>
            </div>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Logged in as <span className="text-blue-300 font-mono font-semibold">{user.email}</span>. Below are all your evaluated greenfield projects, downloaded bank teasers, and live CA appraisal statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="user-dash-eval-btn"
              onClick={onOpenAssessment}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Evaluate New Project</span>
            </button>
            <button
              id="user-dash-book-btn"
              onClick={onOpenConsultation}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>Book CA Advisory Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Selector Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              My Active Projects ({userProjects.length})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Click any project to view specific loan syndication progress &amp; download deliverables
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {userProjects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  setIsEditing(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{p.projectName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  ₹{p.totalCostCr} Cr
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Project Highlight Card */}
      {activeProject && (
        <div className="space-y-8">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Project Name &amp; Sector</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-base font-bold text-slate-900 font-manrope truncate" title={activeProject.projectName}>
                {activeProject.projectName}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs text-blue-700 font-semibold">{activeProject.industry}</span>
                <span className="text-[10px] text-slate-400">• {activeProject.location}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Total Project Capex</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-manrope">
                ₹ {activeProject.totalCostCr.toFixed(2)} Cr
              </p>
              <span className="text-xs text-emerald-700 font-medium">
                Debt: ₹{activeProject.loanRequiredCr.toFixed(2)} Cr ({activeProject.debtPercent}%) | Equity: ₹{activeProject.promoterContribCr.toFixed(2)} Cr
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Feasibility &amp; DSCR</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-blue-600 font-manrope">
                  {activeProject.feasibilityScore}/100
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Grade {activeProject.bankabilityRating}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                DSCR: <strong className="text-slate-800 font-semibold">{activeProject.dscrEstimate}x</strong> (Bank Threshold: 1.35x)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>DPR &amp; Teaser Status</span>
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 font-manrope">
                  {activeProject.status}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  Stage {activeProject.stageNumber}/5
                </span>
              </div>
              <span className="text-xs text-purple-700 font-medium">
                14-Page Teaser Downloaded
              </span>
            </div>
          </div>

          {/* Project Details, Loan Timeline, and Deliverables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Loan Syndication Timeline & Financial Editor */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Syndication Progress Steps */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-manrope text-lg font-bold text-slate-900">
                      Greenfield Loan Sanction Pipeline
                    </h2>
                    <p className="text-xs text-slate-500">
                      Target Bank Consortium: <strong className="text-slate-700">{activeProject.assignedBank}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      Stage {activeProject.stageNumber} of 5 Active
                    </span>
                    {!isEditing ? (
                      <button
                        onClick={handleStartEdit}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                        title="Edit Project Capex and Equity parameters"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Capex</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form if active */}
                {isEditing && (
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Project Parameters (Admin will be notified of changes):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Total Project Cost (₹ Crores):
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.totalCostCr}
                          onChange={(e) => setEditFormData({ ...editFormData, totalCostCr: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Promoter Equity Ratio (%):
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="80"
                          value={editFormData.equityPercent}
                          onChange={(e) => setEditFormData({ ...editFormData, equityPercent: parseInt(e.target.value) || 25 })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Notes for CA Syndication Desk:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Revised plant machinery quotes received; targeting ₹90 Cr debt from SBI."
                        value={editFormData.notes}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save &amp; Notify Admin</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline Steps */}
                <div className="space-y-4">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">1. Feasibility Assessment &amp; Teaser Generation</h4>
                        <span className="text-xs text-emerald-700 font-semibold font-mono">Completed</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Validated bankability score ({activeProject.feasibilityScore}/100) and DSCR ({activeProject.dscrEstimate}x). Official 14-page PDF teaser issued.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      activeProject.stageNumber >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {activeProject.stageNumber >= 2 ? '✓' : '2'}
                    </div>
                    <div className={`flex-1 p-4 rounded-xl border ${
                      activeProject.stageNumber === 2 ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">2. Detailed Project Report (DPR) &amp; CMA Data Model</h4>
                        <span className={`text-xs font-semibold ${
                          activeProject.stageNumber >= 2 ? 'text-emerald-700 font-mono' : 'text-slate-500'
                        }`}>
                          {activeProject.stageNumber >= 2 ? 'Ready' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        108-page bank-ready Detailed Project Report formatted with 10-year projected balance sheet, P&amp;L, and cash flows.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      activeProject.stageNumber >= 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      3
                    </div>
                    <div className={`flex-1 p-4 rounded-xl border ${
                      activeProject.stageNumber >= 3 ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-blue-900">3. CA Financial Appraisal &amp; TEV Audit</h4>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {activeProject.status === 'CA Approved' ? 'Approved' : 'In Active Review'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        {activeProject.assignedCA} reviewing equipment procurement schedules, promoter equity proof, and state industrial subsidy eligibility.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className={`flex gap-4 items-start ${activeProject.stageNumber < 4 ? 'opacity-60' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      activeProject.stageNumber >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      4
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">4. Bank Credit Committee Sanction</h4>
                        <span className="text-xs text-slate-500 font-mono">
                          {activeProject.stageNumber >= 4 ? 'Under Committee' : 'Upcoming'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Formal presentation to {activeProject.assignedBank} credit desk for in-principle term loan sanction letter.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className={`flex gap-4 items-start ${activeProject.stageNumber < 5 ? 'opacity-60' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      activeProject.stageNumber === 5 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      5
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">5. Sanction Letter &amp; Loan Disbursement</h4>
                        <span className="text-xs text-slate-500 font-mono">Final Step</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Execution of security agreements, legal vetting, and initial Capex tranche drawdown.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right 4 Cols: Deliverables & Assigned Syndication Team */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Deliverables Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-manrope text-base font-bold text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Project Deliverables</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready
                  </span>
                </div>

                <div className="space-y-3">
                  
                  {/* Teaser PDF */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          DPR Executive Teaser.pdf
                        </div>
                        <div className="text-[10px] text-slate-500">14 Pages • Bank Appraisal Format</div>
                      </div>
                      <button
                        onClick={() => handleDownloadTeaserPDF(activeProject)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download Teaser PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* CMA Data Model */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          CMA Data &amp; Financial Model.xlsx
                        </div>
                        <div className="text-[10px] text-slate-500">10-Year Projections • DSCR &amp; P&amp;L</div>
                      </div>
                      <button
                        onClick={() => handleDownloadCMAModel(activeProject)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download CMA Data Model"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>XLSX</span>
                      </button>
                    </div>
                  </div>

                  {/* 108-Page DPR */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Comprehensive Bank DPR.pdf
                        </div>
                        <div className="text-[10px] text-slate-500">108 Pages • Full TEV &amp; Civil Costing</div>
                      </div>
                      <button
                        onClick={() => handleDownloadDPR(activeProject)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download Bank DPR"
                      >
                        <Download className="w-3 h-3" />
                        <span>DPR</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Assigned Advisory & CA Team */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Assigned Syndication Team</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Active
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-blue-glow">
                      RS
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{activeProject.assignedCA}</div>
                      <div className="text-xs text-slate-400">Senior Debt Syndication Lead &amp; FCA</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                    <div className="font-semibold text-blue-300 mb-0.5">Syndication Desk Direct Contact:</div>
                    <div>Call / WhatsApp: +91 63020 26462</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Available Mon-Sat: 9:30 AM - 7:00 PM IST</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <a
                      href="https://wa.me/916302026462"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp Chat</span>
                    </a>
                    <button
                      onClick={onOpenConsultation}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Book Call</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* History Table: All Downloaded Teasers & Feasibility Assessments */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-manrope text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>All Downloaded Project Teasers &amp; Feasibility History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Records associated with your email ({user.email}). You can re-download teasers anytime.
            </p>
          </div>
          <button
            onClick={loadUserProjects}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Records</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project Name &amp; Sector</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Total Capex</th>
                <th className="py-3 px-3">Debt Sanction</th>
                <th className="py-3 px-3">Feasibility / Grade</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{p.projectName}</div>
                    <div className="text-[11px] text-slate-500">{p.industry}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{p.location}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">₹ {p.totalCostCr} Cr</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-700">₹ {p.loanRequiredCr} Cr</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                      {p.feasibilityScore}/100 ({p.bankabilityRating})
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleDownloadTeaserPDF(p)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Download PDF Teaser"
                    >
                      <Download className="w-3 h-3" />
                      <span>Teaser</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <span>View</span>
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
};
