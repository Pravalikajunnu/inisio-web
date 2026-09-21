import React from 'react';
import {
  IndianRupee,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  FileCheck2
} from 'lucide-react';
import { PromoterFundAssistanceRequest, PromoterFundAssistanceStatus } from '../../types';

interface PromoterFundAssistanceCardProps {
  status?: PromoterFundAssistanceStatus;
  promoterContribCr?: number | string;
  totalCostCr?: number | string;
  loanRequiredCr?: number | string;
  assistanceRequest?: PromoterFundAssistanceRequest;
  onRequestClick: () => void;
  isAssessmentView?: boolean;
}

export const PromoterFundAssistanceCard: React.FC<PromoterFundAssistanceCardProps> = ({
  status = 'Not Requested',
  promoterContribCr = 0,
  totalCostCr = 0,
  loanRequiredCr = 0,
  assistanceRequest,
  onRequestClick,
  isAssessmentView = false
}) => {
  const contribNum = Number(promoterContribCr) || 0;
  
  // Format to Lakhs if < 1 Cr or provide both Cr and Lakhs
  const displayLakhs = Math.round(contribNum * 100);
  const displayFormatted = contribNum >= 1
    ? `₹ ${contribNum.toFixed(2)} Cr (₹ ${displayLakhs} Lakhs)`
    : `₹ ${displayLakhs} Lakhs`;

  const getStatusBadge = () => {
    switch (status) {
      case 'Requested':
      case 'Request Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>Requested</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Under Review</span>
          </span>
        );
      case 'Connected with Investor/Lender':
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
            <PhoneCall className="w-3 h-3 text-indigo-600" />
            <span>Connected with Investor/Lender</span>
          </span>
        );
      case 'Assistance Provided':
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Not Requested':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium border border-zinc-200">
            <span>Not Requested</span>
          </span>
        );
    }
  };

  return (
    <div className="border border-blue-200/90 rounded-2xl p-5 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 shadow-xs space-y-4 font-inter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 text-sm sm:text-base">
                Promoter Fund Assistance
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Support in bridging promoter equity contribution via co-investors &amp; structured quasi-debt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-zinc-400 font-medium">Status:</span>
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Metric 1: Promoter Contribution Required */}
        <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
          <span className="text-[11px] font-semibold text-zinc-500 block uppercase tracking-wider">
            Promoter Contribution Required
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1 font-mono">
            {displayFormatted}
          </div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">
            Target promoter equity stake
          </span>
        </div>

        {/* Metric 2: Guidance / Status Summary */}
        <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Need Help Arranging Funds?</span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
              {status === 'Not Requested'
                ? 'Promoter contribution is an important part of project funding. If you need support in arranging your promoter fund, Inisio can help connect you with suitable funding assistance options.'
                : status === 'Request Submitted' || status === 'Under Review'
                ? `Assistance request is being evaluated by Inisio debt syndication specialists for project: ${assistanceRequest?.projectName || 'your project'}.`
                : 'Advisory team is actively working with co-funding networks to structure your promoter equity solution.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            {assistanceRequest?.requestedAt && (
              <span className="text-[10px] text-zinc-400">
                Submitted on: {new Date(assistanceRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}

            <button
              type="button"
              onClick={onRequestClick}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                status === 'Not Requested'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <span>{status === 'Not Requested' ? 'Request Promoter Fund Assistance' : 'View / Edit Request Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-start gap-2 text-[10px] text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-normal">
          <strong>Advisory Disclaimer:</strong> Promoter fund assistance is a facilitation service. Funding availability depends on eligibility, investor/lender requirements, and applicable terms. Inisio does not promise or guarantee debt/equity approval.
        </p>
      </div>
    </div>
  );
};
