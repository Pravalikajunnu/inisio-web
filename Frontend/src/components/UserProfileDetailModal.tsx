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
  Sparkles,
  Check,
  CircleDot,
  Calendar,
  Edit3
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
  const debtPct = totalCost > 0 ? Math.round((loanReq / totalCost) * 100) : 75;
  const eqPct = 100 - debtPct;

  const waMessage = encodeURIComponent(
    `Hello ${lead.fullName || 'Promoter'},\n\n` +
    `I am following up regarding your ${lead.industry || 'greenfield'} project (${lead.projectName || 'Greenfield Unit'}) submitted on Inisio Advisory Platform.\n\n` +
    `Project Capex: ₹${lead.totalCostCr} Cr | Debt Required: ₹${lead.loanRequiredCr} Cr\n\n` +
    `We have prepared the preliminary debt syndication strategy and DPR teaser. Let us know a convenient time to discuss your bank loan sanction process.`
  );

  const stages = [
    { id: 1, name: 'Initial Assessment & Inquiry', status: 'completed', desc: 'Promoter project parameters and capital outlay submitted' },
    { id: 2, name: 'Project Feasibility & Teaser', status: 'completed', desc: '14-Page Teaser generated with bankability rating' },
    { id: 3, name: 'DPR / CMA Verification', status: 'current', desc: 'Technical costing and 10-year cash flow review by CA Desk' },
    { id: 4, name: 'Financial Audit & TEV', status: 'upcoming', desc: 'DSCR stress test and benchmark compliance' },
    { id: 5, name: 'Bank Consortium Matching', status: 'upcoming', desc: 'Selection of public and private sector lending desks' },
    { id: 6, name: 'Bank Credit Submission', status: 'upcoming', desc: 'Formal proposal filing with zonal credit committee' },
    { id: 7, name: 'Query Resolution & Audit', status: 'upcoming', desc: 'Legal title and technical site inspection clearance' },
    { id: 8, name: 'Sanction Letter Issuance', status: 'upcoming', desc: 'Term loan in-principle approval with ROI covenants' },
    { id: 9, name: 'Tranche Disbursement', status: 'upcoming', desc: 'Mortgage charge creation and first Capex drawdown' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in font-inter">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-3xl w-full text-zinc-900 shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  {lead.projectName || lead.fullName || 'Project Details'}
                </h2>
                {lead.downloadedPDF ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    PDF Downloaded
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                    Inquiry Lead
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                <span>{lead.fullName}</span>
                <span>•</span>
                <span>{lead.mobile}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-white text-xs">
          
          {/* User Edits Highlight */}
          {lead.lastEditedBy && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-blue-950">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>User Modification Synced:</strong> Updated by <strong>{lead.lastEditedBy}</strong> on {new Date(lead.lastEditedAt || Date.now()).toLocaleString('en-IN')}.
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                Synced
              </span>
            </div>
          )}

          {/* Direct Contact Actions */}
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
            </div>

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete profile for ${lead.fullName}?`)) {
                    onDelete(lead.id);
                    onClose();
                  }
                }}
                className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
            <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Information &amp; Financial Structure</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Project Name</span>
                <strong className="text-zinc-900 font-semibold">{lead.projectName || 'Greenfield Plant'}</strong>
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
                <span className="text-zinc-800">{lead.landStatus || 'Owned / Allotted'}</span>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Collateral Security</span>
                <span className="text-zinc-800">{lead.collateralStatus || 'Fixed Land & Machinery'}</span>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Promoter Experience</span>
                <span className="text-zinc-800">{lead.promoterExp || '5+ Years Experienced'}</span>
              </div>
            </div>

            {/* Uploaded Documents */}
            {(lead.dprFile || lead.cmaFile) && (
              <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-2">
                {lead.dprFile && (
                  <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] font-medium text-zinc-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>DPR: {lead.dprFile.name}</span>
                  </div>
                )}
                {lead.cmaFile && (
                  <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] font-medium text-zinc-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>CMA: {lead.cmaFile.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vertical Order-Tracking Lifecycle Timeline */}
          <div className="rounded-xl p-4 border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Project Loan Progress Lifecycle</span>
              </h3>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Stage 3 of 9 Active
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
                        <span className={`text-[10px] font-medium ${isCompleted ? 'text-blue-700' : isCurrent ? 'text-blue-600 font-semibold' : 'text-zinc-400'}`}>
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

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
};
