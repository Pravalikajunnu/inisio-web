import React from 'react';
import { LeadRecord } from '../utils/leadStore';
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
  Sparkles
} from 'lucide-react';

interface UserProfileDetailModalProps {
  lead: LeadRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const UserProfileDetailModal: React.FC<UserProfileDetailModalProps> = ({
  lead,
  onClose,
  onDelete
}) => {
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
  const debtPct = totalCost > 0 ? Math.round((loanReq / totalCost) * 100) : 70;
  const eqPct = 100 - debtPct;

  const waMessage = encodeURIComponent(
    `Hello ${lead.fullName || 'Promoter'},\n\n` +
    `I am following up regarding your ${lead.industry || 'greenfield'} project (${lead.projectName || 'Greenfield Unit'}) submitted on Inisio Advisory Platform.\n\n` +
    `Project Capex: ₹${lead.totalCostCr} Cr | Debt Required: ₹${lead.loanRequiredCr} Cr\n\n` +
    `We have prepared the preliminary debt syndication strategy and DPR teaser. Let us know a convenient time to discuss your bank loan sanction process.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full text-slate-900 shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center text-xl font-bold font-manrope shadow-inner">
              {lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-manrope text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {lead.fullName || 'Promoter Profile'}
                </h2>
                {lead.downloadedPDF ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    PDF Downloaded
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Inquiry Lead
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 font-inter">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Submitted on {formattedDate}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono text-[11px]">{lead.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 font-inter bg-slate-50/50">
          
          {/* Quick Action Banner */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Direct Contact:</span>
              <a
                href={`https://wa.me/91${lead.mobile?.replace(/[^0-9]/g, '')}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#25D366] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${lead.mobile}`}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call {lead.mobile}</span>
              </a>

              {lead.email && lead.email !== 'N/A' && (
                <a
                  href={`mailto:${lead.email}`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Send Email</span>
                </a>
              )}
            </div>

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete profile record for ${lead.fullName}?`)) {
                    onDelete(lead.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
            )}
          </div>

          {/* Section 1: Promoter Profile Information */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="font-manrope text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Promoter &amp; Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm block">{lead.fullName || 'N/A'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Mobile Phone</span>
                <a href={`tel:${lead.mobile}`} className="font-bold text-blue-700 text-sm block hover:underline font-mono">
                  {lead.mobile || 'N/A'}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Email Address</span>
                <span className="font-semibold text-slate-800 block truncate" title={lead.email}>
                  {lead.email || 'N/A'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Promoter Location</span>
                <span className="font-semibold text-slate-800 block">{lead.location || 'Telangana / India'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Lead Source</span>
                <span className="font-semibold text-slate-800 block">{lead.source || 'Online Portal'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Industry Track Record</span>
                <span className="font-semibold text-slate-800 block">{lead.promoterExp || '5+ Years Experienced'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Greenfield Project Profile */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-manrope text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Project &amp; Site Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Project Title</span>
                <span className="font-bold text-slate-900 text-sm block">{lead.projectName || 'Greenfield Project'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Industry Sector</span>
                <span className="font-bold text-blue-700 block">{lead.industry || 'General Industry'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Project Location</span>
                <span className="font-semibold text-slate-800 block">{lead.location || 'India'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Land Acquisition Status</span>
                <span className="font-semibold text-slate-800 block">{lead.landStatus || 'Land Identified / Allotted'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Primary Collateral / Security</span>
                <span className="font-semibold text-slate-800 block">{lead.collateralStatus || 'Fixed Land & Plant Machinery'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Teaser Document Issued</span>
                <span className="font-semibold text-emerald-700 block">
                  {lead.downloadedPDF ? 'Yes (PDF Teaser Downloaded)' : 'Pending Teaser Issuance'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Structure & Loan Metrics */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <h3 className="font-manrope text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Financial Capex &amp; Loan Requirement
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Debt/Equity: {debtPct}:{eqPct}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-500 font-medium block text-[11px]">Total Project Capex</span>
                <span className="font-extrabold text-slate-900 text-base font-manrope block">
                  ₹ {lead.totalCostCr} Cr
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 space-y-0.5">
                <span className="text-blue-700 font-semibold block text-[11px]">Requested Bank Loan</span>
                <span className="font-extrabold text-blue-700 text-base font-manrope block">
                  ₹ {lead.loanRequiredCr} Cr
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-500 font-medium block text-[11px]">Promoter Equity Est.</span>
                <span className="font-extrabold text-slate-900 text-base font-manrope block">
                  ₹ {lead.promoterContribCr || equityEst.toFixed(1)} Cr ({eqPct}%)
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 space-y-0.5">
                <span className="text-emerald-700 font-semibold block text-[11px]">Underwritten Loan Eligibility</span>
                <span className="font-extrabold text-emerald-800 text-base font-manrope block">
                  ₹ {lead.loanRequiredCr} Cr
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Advisory & Bankability Scorecard */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                <h3 className="font-manrope text-sm font-bold text-white uppercase tracking-wider">
                  4. Inisio Advisory Underwriting Scorecard
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-300 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">
                Verified Evaluation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium block">Feasibility Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-manrope text-emerald-400">
                    {lead.feasibilityScore || 88}%
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                    Highly Feasible
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium block">Bankability Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-manrope text-blue-400">
                    Grade {lead.bankabilityRating || 'A+'}
                  </span>
                  <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-semibold">
                    Sanction Ready
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium block">Advisory Status</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    DPR &amp; Teaser Ready
                  </span>
                </div>
              </div>
            </div>

            {lead.notes && (
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">System / Promoter Notes:</span>
                <p className="text-slate-200 leading-relaxed italic">{lead.notes}</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Complete profile parameters for {lead.fullName || 'Promoter'}.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Close Profile View
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
