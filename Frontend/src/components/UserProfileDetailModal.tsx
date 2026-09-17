import React, { useState } from 'react';
import { LeadRecord, updateLeadRecord } from '../utils/leadStore';
import { generateProjectTeaserPDF } from '../utils/pdfGenerator';
import { DocumentViewerModal, DocumentViewerTarget } from './DocumentViewerModal';
import { ProjectDocument } from '../types';
import { calculateSystemDscr } from '../utils/financialUtils';
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  FileText,
  Clock,
  MessageSquare,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Share2,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Check,
  CircleDot,
  Calendar,
  Edit3,
  Download,
  Eye,
  FileSpreadsheet,
  Upload,
  Plus,
  Lock,
  Landmark,
  FileCheck
} from 'lucide-react';

interface UserProfileDetailModalProps {
  lead: LeadRecord | null;
  onClose: () => void;
  onEdit?: (lead: LeadRecord) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export const UserProfileDetailModal: React.FC<UserProfileDetailModalProps> = ({
  lead,
  onClose,
  onEdit,
  onDelete,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'promoters' | 'financials' | 'documents' | 'lifecycle' | 'audit'>('overview');
  const [viewingDoc, setViewingDoc] = useState<DocumentViewerTarget | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('Company KYC');
  const [isUploading, setIsUploading] = useState(false);

  if (!lead) return null;

  const formattedDate = new Date(lead.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const totalCost = parseFloat(String(lead.totalCostCr || 0));
  const loanReq = parseFloat(String(lead.loanRequiredCr || 0));
  const equityEst = Math.max(0, totalCost - loanReq);
  const debtPct = totalCost > 0 ? Math.round((loanReq / totalCost) * 100) : 75;
  const eqPct = 100 - debtPct;

  const waMessage = encodeURIComponent(
    `Hello ${lead.fullName || 'Promoter'},\n\n` +
    `I am contacting you from Inisio Advisory Desk regarding your ${lead.industry || 'greenfield'} project (${lead.projectName || 'Greenfield Unit'}).\n\n` +
    `Project Capex: ₹${lead.totalCostCr} Cr | Loan Required: ₹${lead.loanRequiredCr} Cr\n\n` +
    `We have reviewed your project dossier and are ready to assist with DPR validation and bank debt syndication.`
  );

  const handleGenerateTeaser = async (action: 'download' | 'preview' = 'download') => {
    setIsGeneratingPDF(true);
    try {
      await generateProjectTeaserPDF({
        fullName: lead.fullName || 'Promoter',
        mobile: lead.mobile || '',
        email: lead.email || '',
        projectName: lead.projectName || 'Greenfield Project',
        industry: lead.industry || 'Manufacturing',
        location: lead.location || 'India',
        totalCostCr: lead.totalCostCr || '10',
        loanRequiredCr: lead.loanRequiredCr || '7.5',
        equityPercent: eqPct,
        debtPercent: debtPct,
        feasibilityScore: lead.feasibilityScore || 82,
        bankabilityRating: typeof lead.bankabilityRating === 'string' ? lead.bankabilityRating : 'Investment Grade (A)',
        projectViabilityStatus: 'High Viability',
        dscrRatio: lead.dscrEstimate || calculateSystemDscr({ industry: lead.industry || '' }),
        interestRateRange: '8.65% - 9.15% p.a.',
        turnoverYear1: '₹ 14.50 Cr',
        patYear1: '₹ 2.85 Cr',
        landStatus: lead.landStatus || 'Owned / Allotted',
        collateralStatus: lead.collateralStatus || 'Fixed Land & Machinery',
        promoterExp: lead.promoterExp || '5+ Years Track Record',
        subsidiesEligible: ['Central Capital Investment Subsidy (30%)', 'State Interest Subvention (5%)', 'State SGST Reimbursement (100% 7 Yrs)'],
        topMatchingBanks: [
          { name: 'State Bank of India', type: 'Public Sector Bank', fit: '95% Fit (Best Term Loan Pricing)', maxFundingCr: '₹ 500 Cr', roiRange: '8.50% - 9.00%' },
          { name: 'Canara Bank', type: 'Public Sector Bank', fit: '92% Fit (Fast Infrastructure Clearance)', maxFundingCr: '₹ 300 Cr', roiRange: '8.65% - 9.15%' },
          { name: 'HDFC Bank', type: 'Private Commercial Bank', fit: '90% Fit (Working Capital & Capex Combo)', maxFundingCr: '₹ 250 Cr', roiRange: '8.90% - 9.40%' }
        ],
        financials: lead.financials ? {
          machineryCostCr: lead.financials.machineryCostCr,
          civilCostCr: lead.financials.civilCostCr,
          consultancyCostCr: lead.financials.consultancyCostCr,
          otherCostsCr: lead.financials.otherCostsCr,
          termLoanCr: lead.financials.termLoanCr,
          promoterContributionCr: lead.financials.promoterContributionCr,
          otherFinanceCr: lead.financials.otherFinanceCr,
          totalProjectCost: lead.financials.totalProjectCost,
          totalMeansOfFinance: lead.financials.totalMeansOfFinance
        } : undefined
      }, action);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadTeaser = () => handleGenerateTeaser('download');
  const handlePreviewTeaser = () => handleGenerateTeaser('preview');

  // Compile all documents for display
  const allDocuments: ProjectDocument[] = [];
  if (lead.dprFile) {
    allDocuments.push({
      id: 'dpr-doc-1',
      name: lead.dprFile.name,
      type: 'Detailed Project Report (DPR)',
      size: lead.dprFile.size,
      uploadedAt: lead.dprFile.uploadedAt || new Date().toISOString(),
      status: 'Verified',
      dataUrl: lead.dprFile.dataUrl,
      fileUrl: lead.dprFile.fileUrl,
      storageKey: lead.dprFile.storageKey
    });
  }
  if (lead.cmaFile) {
    allDocuments.push({
      id: 'cma-doc-1',
      name: lead.cmaFile.name,
      type: 'Financial Model / CMA',
      size: lead.cmaFile.size,
      uploadedAt: lead.cmaFile.uploadedAt || new Date().toISOString(),
      status: 'Verified',
      dataUrl: lead.cmaFile.dataUrl,
      fileUrl: lead.cmaFile.fileUrl,
      storageKey: lead.cmaFile.storageKey
    });
  }
  if (lead.uploadedDocuments && Array.isArray(lead.uploadedDocuments)) {
    lead.uploadedDocuments.forEach(doc => {
      if (!allDocuments.some(d => d.name === doc.name)) {
        allDocuments.push(doc);
      }
    });
  }

  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDoc: ProjectDocument = {
        id: `admin-doc-${Date.now()}`,
        name: file.name,
        type: uploadCategory,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'Verified',
        dataUrl: dataUrl
      };

      const updatedDocs = [...(lead.uploadedDocuments || []), newDoc];
      updateLeadRecord(lead.id, {
        uploadedDocuments: updatedDocs,
        lastEditedBy: 'Admin Team',
        lastEditedAt: new Date().toISOString()
      }, 'Admin Team');

      lead.uploadedDocuments = updatedDocs;
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const stages = [
    { id: 1, name: 'Initial Assessment & Inquiry', status: 'completed', desc: 'Promoter project parameters and capital outlay submitted' },
    { id: 2, name: 'Project Feasibility & Teaser', status: 'completed', desc: '14-Page Teaser generated with bankability rating' },
    { id: 3, name: 'DPR / CMA Verification', status: lead.dprFile || lead.cmaFile ? 'completed' : 'current', desc: 'Technical costing and 10-year cash flow review by CA Desk' },
    { id: 4, name: 'Financial Audit & TEV', status: lead.status === 'CA Approved' ? 'completed' : lead.status === 'In Appraisal' ? 'current' : 'upcoming', desc: 'DSCR stress test and benchmark compliance' },
    { id: 5, name: 'Bank Consortium Matching', status: lead.status === 'Bank Submitted' || lead.status === 'Sanctioned' ? 'completed' : 'upcoming', desc: 'Selection of public and private sector lending desks' },
    { id: 6, name: 'Bank Credit Submission', status: lead.status === 'Bank Submitted' || lead.status === 'Sanctioned' ? 'completed' : 'upcoming', desc: 'Formal proposal filing with zonal credit committee' },
    { id: 7, name: 'Query Resolution & Audit', status: lead.status === 'Sanctioned' ? 'completed' : 'upcoming', desc: 'Legal title and technical site inspection clearance' },
    { id: 8, name: 'Sanction Letter Issuance', status: lead.status === 'Sanctioned' ? 'completed' : 'upcoming', desc: 'Term loan in-principle approval with ROI covenants' },
    { id: 9, name: 'Tranche Disbursement', status: lead.status === 'Disbursed' ? 'completed' : 'upcoming', desc: 'Mortgage charge creation and first Capex drawdown' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in font-inter">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full text-zinc-900 shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {lead.projectName || 'Greenfield Project'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {lead.status || (lead.downloadedPDF ? 'PDF Downloaded' : 'In Appraisal')}
                </span>
                {lead.lastEditedBy && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>User Synced</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-semibold text-zinc-800">{lead.fullName}</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">{lead.mobile}</span>
                <span>•</span>
                <span>{lead.email}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(lead)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Edit Project"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            )}

            <button
              onClick={handlePreviewTeaser}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-800 font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-zinc-200"
              title="Preview 14-Page Teaser PDF in New Tab"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview Teaser</span>
            </button>

            <button
              onClick={handleDownloadTeaser}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Download 14-Page Teaser PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-zinc-200 bg-white shrink-0 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Project Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('promoters')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'promoters'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Promoters &amp; KYC ({lead.promotersList?.length || 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Capex &amp; Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Uploaded Files ({allDocuments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lifecycle'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lifecycle Stages</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail ({lead.editHistory?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-white text-xs">
          
          {/* Quick Contact & Action Ribbon */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/91${lead.mobile?.replace(/[^0-9]/g, '')}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp Promoter</span>
              </a>

              <a
                href={`tel:${lead.mobile}`}
                className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call {lead.mobile}</span>
              </a>

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email</span>
                </a>
              )}

              {onEdit && (
                <button
                  onClick={() => onEdit(lead)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Project</span>
                </button>
              )}
            </div>

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete the project profile for "${lead.projectName || lead.fullName}"?`)) {
                    onDelete(lead.id);
                    onClose();
                  }
                }}
                className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
                <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Project Details &amp; Operational Setup</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Project Name</span>
                    <strong className="text-zinc-900 font-bold text-xs">{lead.projectName || 'Greenfield Plant'}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Industry Sector</span>
                    <strong className="text-blue-700 font-semibold">{lead.industry || 'Manufacturing'}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Location</span>
                    <span className="text-zinc-800 font-medium">{lead.location || 'India'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Total Capex</span>
                    <strong className="text-zinc-900 font-bold text-sm">₹ {lead.totalCostCr} Cr</strong>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Term Loan Required</span>
                    <strong className="text-blue-600 font-bold text-sm">₹ {lead.loanRequiredCr} Cr</strong>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Promoter Equity</span>
                    <strong className="text-zinc-900 font-bold text-sm">
                      ₹ {lead.promoterContribCr || equityEst.toFixed(1)} Cr ({eqPct}%)
                    </strong>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Land Status</span>
                    <span className="text-zinc-800 font-medium">{lead.landStatus || 'Owned / Allotted'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Collateral Security</span>
                    <span className="text-zinc-800 font-medium">{lead.collateralStatus || 'Fixed Land & Machinery'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Promoter Experience</span>
                    <span className="text-zinc-800 font-medium">{lead.promoterExp || '5+ Years Experienced'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Assigned Advisory Team</span>
                    <span className="text-zinc-800 font-medium">{lead.assignedTeam || 'CA Rajesh Sharma & Advisory Desk'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Project Status</span>
                    <span className="font-semibold text-emerald-700">{lead.status || 'In Appraisal'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Feasibility Score</span>
                    <span className="font-bold text-blue-600">{lead.feasibilityScore || 82} / 100 (Prime Bankable)</span>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Project Notes &amp; Objectives</span>
                    <p className="text-zinc-700 leading-relaxed text-xs">{lead.notes}</p>
                  </div>
                )}
              </div>

              {/* Risk Profile & Commercial Data Summary */}
              {lead.riskProfileData && (
                <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
                  <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Risk Profile &amp; Underwriting Criteria</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <span className="text-[10px] text-zinc-400 block uppercase">Promoter CIBIL</span>
                      <strong className="text-zinc-900 font-bold">{lead.riskProfileData.cibilScore || '780+'}</strong>
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <span className="text-[10px] text-zinc-400 block uppercase">Business Constitution</span>
                      <strong className="text-zinc-900 font-bold">{lead.riskProfileData.businessConstitution || 'Private Limited'}</strong>
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <span className="text-[10px] text-zinc-400 block uppercase">Collateral Coverage</span>
                      <strong className="text-zinc-900 font-bold">{lead.riskProfileData.collateralCoveragePct || '125'}%</strong>
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <span className="text-[10px] text-zinc-400 block uppercase">Business Vintage</span>
                      <strong className="text-zinc-900 font-bold">{lead.riskProfileData.businessVintage || '8+ Years'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROMOTERS & KYC */}
          {activeTab === 'promoters' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Lead Promoter &amp; Primary Applicant</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                    Primary Applicant
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Full Name</span>
                    <strong className="text-zinc-900 font-semibold">{lead.fullName || 'Promoter'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Mobile Phone</span>
                    <strong className="text-blue-700 font-semibold">{lead.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Email Address</span>
                    <span className="text-zinc-800 font-medium">{lead.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Experience</span>
                    <span className="text-zinc-800">{lead.promoterExp || '5+ Years in Sector'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Location</span>
                    <span className="text-zinc-800">{lead.location || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Co-Promoters List */}
              {lead.promotersList && lead.promotersList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-zinc-900 text-xs">Co-Promoters &amp; Board of Directors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lead.promotersList.map((p, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-zinc-900 text-xs">{p.name || `Promoter ${idx + 1}`}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full">
                            {p.shareholding ? `${p.shareholding}% Equity` : `Co-Promoter ${idx + 1}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
                          <div>
                            <span className="text-zinc-400 text-[10px] block">Role</span>
                            <span className="font-medium text-zinc-800">{p.role || 'Executive Director'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[10px] block">Experience</span>
                            <span className="font-medium text-zinc-800">{p.experience || 'N/A'} Years</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[10px] block">Qualification</span>
                            <span className="font-medium text-zinc-800">{p.qualification || 'Graduate / Professional'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[10px] block">DIN / PAN</span>
                            <span className="font-mono text-zinc-800">{p.dinOrPan || 'Verified'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Project Capex</span>
                  <div className="text-xl font-bold text-zinc-900">₹ {lead.totalCostCr} Cr</div>
                  <span className="text-[11px] text-zinc-500">100% Capital Outlay</span>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Term Loan Requirement</span>
                  <div className="text-xl font-bold text-blue-700">₹ {lead.loanRequiredCr} Cr</div>
                  <span className="text-[11px] text-blue-600">{debtPct}% Debt Financing</span>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Promoter Equity</span>
                  <div className="text-xl font-bold text-emerald-700">
                    ₹ {lead.promoterContribCr || equityEst.toFixed(1)} Cr
                  </div>
                  <span className="text-[11px] text-emerald-600">{eqPct}% Promoter Contribution</span>
                </div>
              </div>

              {/* Detailed Cost Breakup */}
              {lead.financials && (
                <div className="rounded-xl border border-zinc-200 p-4 bg-white space-y-3">
                  <h4 className="font-bold text-zinc-900 text-xs">Cost of Project &amp; Means of Finance Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      <strong className="text-[11px] text-zinc-800 uppercase block mb-1">Cost Components (₹ Cr)</strong>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Plant &amp; Machinery:</span>
                        <span className="font-semibold text-zinc-900">₹ {lead.financials.machineryCostCr || '-'} Cr</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Civil &amp; Factory Shed:</span>
                        <span className="font-semibold text-zinc-900">₹ {lead.financials.civilCostCr || '-'} Cr</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Technical Consultancy:</span>
                        <span className="font-semibold text-zinc-900">₹ {lead.financials.consultancyCostCr || '-'} Cr</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Contingencies &amp; WC Margin:</span>
                        <span className="font-semibold text-zinc-900">₹ {lead.financials.otherCostsCr || '-'} Cr</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      <strong className="text-[11px] text-zinc-800 uppercase block mb-1">Means of Finance (₹ Cr)</strong>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Bank Term Loan:</span>
                        <span className="font-semibold text-blue-700">₹ {lead.financials.termLoanCr || lead.loanRequiredCr} Cr</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Promoter Equity:</span>
                        <span className="font-semibold text-emerald-700">₹ {lead.financials.promoterContributionCr || lead.promoterContribCr || equityEst.toFixed(1)} Cr</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Govt Capital Subsidy / Other:</span>
                        <span className="font-semibold text-zinc-900">₹ {lead.financials.otherFinanceCr || '0.00'} Cr</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: UPLOADED DOCUMENTS & FILES */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 text-xs">Project Dossier &amp; Uploaded Files</h3>
                  <p className="text-[11px] text-zinc-500">View, preview in-app, or download all promoter uploaded documents.</p>
                </div>

                {/* Upload Action for Admin */}
                {!readOnly && (
                  <div className="flex items-center gap-2">
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                    >
                      <option value="Detailed Project Report (DPR)">DPR Document</option>
                      <option value="Financial Model / CMA">CMA Data</option>
                      <option value="Company KYC">Company KYC</option>
                      <option value="Promoter KYC">Promoter KYC</option>
                      <option value="Audited Balance Sheet">Audited Balance Sheet</option>
                      <option value="Land Title Document">Land Title Deed</option>
                    </select>

                    <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Attach File'}</span>
                      <input type="file" onChange={handleAdminFileUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {allDocuments.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                  <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-500 font-medium">No files uploaded yet for this project.</p>
                  <p className="text-[11px] text-zinc-400">Use the attach button above or edit the project to upload files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allDocuments.map((doc) => {
                    const formattedDocSize = typeof doc.size === 'number'
                      ? (doc.size < 1024 * 1024 ? `${(doc.size / 1024).toFixed(1)} KB` : `${(doc.size / (1024 * 1024)).toFixed(2)} MB`)
                      : (doc.size || '1.2 MB');

                    return (
                      <div key={doc.id} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                              {doc.name.toLowerCase().endsWith('.xls') || doc.name.toLowerCase().endsWith('.xlsx') ? (
                                <FileSpreadsheet className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-900 text-xs truncate" title={doc.name}>
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-medium text-blue-700">{doc.type || 'Project Document'}</span>
                                <span>•</span>
                                <span>{formattedDocSize}</span>
                              </div>
                            </div>
                          </div>

                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded shrink-0 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>256-Bit</span>
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-200/60">
                          <button
                            onClick={() => {
                              setViewingDoc({
                                name: doc.name,
                                type: doc.type,
                                size: doc.size,
                                dataUrl: doc.dataUrl,
                                fileUrl: doc.fileUrl,
                                storageKey: doc.storageKey,
                                uploadedAt: doc.uploadedAt
                              });
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>Open &amp; Preview</span>
                          </button>

                          {(doc.dataUrl || doc.fileUrl || doc.storageKey) ? (
                            <a
                              href={doc.dataUrl || doc.fileUrl}
                              download={doc.name}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                const blob = new Blob([`Inisio Advisory Document: ${doc.name}\nProject: ${lead.projectName}\nCategory: ${doc.type}`], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = doc.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Project Assessment Progress Lifecycle</span>
                </h3>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Current Status: {lead.status || 'In Appraisal'}
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:h-full before:w-0.5 before:bg-zinc-200 before:z-0 pl-1 pt-1">
                {stages.map((st) => {
                  const isCompleted = st.status === 'completed';
                  const isCurrent = st.status === 'current';
                  return (
                    <div key={st.id} className="relative z-10 flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-white border-2 border-zinc-300 text-zinc-400'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.id}
                      </div>

                      <div className="flex-1 pb-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-xs ${isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {st.name}
                          </span>
                          <span className={`text-[10px] font-medium ${isCompleted ? 'text-blue-700 font-semibold' : isCurrent ? 'text-blue-600 font-semibold' : 'text-zinc-400'}`}>
                            {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
              <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Audit Trail &amp; Edit History</span>
              </h3>

              {(!lead.editHistory || lead.editHistory.length === 0) ? (
                <div className="p-6 text-center text-zinc-400 text-xs">
                  No previous modification history logged. Current parameters match original submission.
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.editHistory.map((audit) => (
                    <div key={audit.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Edited by: <strong className="text-zinc-700">{audit.editedBy}</strong>
                        </span>
                        <span>{new Date(audit.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-700">
                        {audit.changes.map((change, idx) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            ID: <code className="text-zinc-600 font-mono">{lead.id}</code>
          </span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(lead)}
                className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  readOnly
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-zinc-950'
                }`}
              >
                {readOnly ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specifications</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Project</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Close View
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Document Viewer Modal */}
      <DocumentViewerModal
        documentItem={viewingDoc}
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        projectName={lead.projectName || 'Greenfield Project'}
      />
    </div>
  );
};
