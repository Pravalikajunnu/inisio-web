import React from 'react';
import { FileText, Clock, Info } from 'lucide-react';

export type CIRStatus =
  | 'Coming Soon'
  | 'Consent Pending'
  | 'Report Requested'
  | 'Report Available'
  | 'Failed to Fetch'
  | string;

export interface CreditInformationCardProps {
  status?: CIRStatus;
  creditScore?: number | string;
  bureau?: string;
  reportDate?: string;
  consentStatus?: string;
  className?: string;
}

export const CreditInformationCard: React.FC<CreditInformationCardProps> = ({
  status = 'Coming Soon',
  creditScore = '—',
  bureau = '—',
  reportDate = '—',
  consentStatus = 'Not Provided',
  className = ''
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'Report Available':
        return {
          label: 'Available',
          dot: 'bg-emerald-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'Consent Pending':
        return {
          label: 'Consent Pending',
          dot: 'bg-amber-500',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'Report Requested':
        return {
          label: 'Requested',
          dot: 'bg-blue-500',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'Failed to Fetch':
        return {
          label: 'Failed',
          dot: 'bg-rose-500',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'Coming Soon':
      default:
        return {
          label: 'Coming Soon',
          dot: 'bg-amber-400',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80'
        };
    }
  };

  const statusBadge = getStatusBadge();
  const isAvailable = status === 'Report Available';

  return (
    <div
      className={`bg-zinc-50/80 border border-zinc-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2 font-inter ${className}`}
      id="cir-summary-card"
    >
      {/* Header: Title, Icon, Badge & Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-zinc-900 truncate">
              Credit Information Report (CIR)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* 4 Metadata Fields in a Compact Row */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="p-1.5 bg-white rounded-md border border-zinc-200/70 text-center">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Score
          </span>
          <div className="text-xs font-bold text-zinc-900 mt-0.5">
            {creditScore}
          </div>
        </div>

        <div className="p-1.5 bg-white rounded-md border border-zinc-200/70 text-center">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Bureau
          </span>
          <div className="text-xs font-bold text-zinc-900 mt-0.5 truncate">
            {bureau}
          </div>
        </div>

        <div className="p-1.5 bg-white rounded-md border border-zinc-200/70 text-center">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Date
          </span>
          <div className="text-xs font-bold text-zinc-900 mt-0.5 truncate">
            {reportDate}
          </div>
        </div>

        <div className="p-1.5 bg-white rounded-md border border-zinc-200/70 text-center">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider block truncate">
            Consent
          </span>
          <div className="text-[11px] font-medium text-zinc-600 mt-0.5 truncate" title={consentStatus}>
            {consentStatus}
          </div>
        </div>
      </div>

      {/* Description & Action Button Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
        <p className="text-[10px] text-zinc-500 leading-snug max-w-xs line-clamp-2">
          Your Credit Information Report helps lenders evaluate credit history and supports funding decisions.
        </p>

        <div className="relative group shrink-0">
          <button
            type="button"
            disabled={!isAvailable}
            title="Credit bureau integration will be available in a future release."
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs'
                : 'bg-zinc-200/70 text-zinc-500 cursor-not-allowed border border-zinc-200/80'
            }`}
          >
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Coming Soon</span>
          </button>

          {/* Hover Tooltip */}
          <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover:block w-56 p-1.5 bg-zinc-900 text-white text-[9px] rounded shadow-md text-center z-20">
            Credit bureau integration will be available in a future release.
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pt-1 border-t border-zinc-200/60 flex items-start gap-1 text-[9px] text-zinc-400 leading-tight">
        <Info className="w-2.5 h-2.5 text-zinc-400 shrink-0 mt-0.5" />
        <p className="line-clamp-2">
          <strong className="font-semibold text-zinc-600">Disclaimer:</strong> Inisio does not generate or modify credit scores. Credit information will be obtained only from an authorized credit bureau after your explicit consent.
        </p>
      </div>
    </div>
  );
};
