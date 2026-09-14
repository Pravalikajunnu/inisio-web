import React from 'react';
import {
  ClipboardList,
  AlertCircle,
  ShieldCheck,
  Building,
  FileCheck,
  Zap,
  Lock,
} from 'lucide-react';

export const UnderwritingChecklist: React.FC = () => {
  const sections = [
    {
      id: 'corporate',
      title: '1. Corporate & Promoter KYC Documentation',
      icon: Building,
      items: [
        { id: 'c-1', text: 'Certificate of Incorporation, MOA, AOA & Board Resolutions' },
        { id: 'c-2', text: 'Company PAN, GSTIN Registration & Udyam MSME Certificate' },
        { id: 'c-3', text: 'PAN, Aadhaar, Passport & CIBIL consent for all Directors/Promoters' },
        { id: 'c-4', text: 'Last 3 Years Audited Financials, Net Worth CA Certificates & ITRs' }
      ]
    },
    {
      id: 'land',
      title: '2. Land Title & Statutory Clearances',
      icon: FileCheck,
      items: [
        { id: 'l-1', text: '30-Year Non-Encumbrance Certificate (NEC) & Legal Title Search Report' },
        { id: 'l-2', text: 'Industrial Area Allotment Order / Registered Sale Deed / Long-term Lease' },
        { id: 'l-3', text: 'Consent to Establish (CTE / NOC) from State Pollution Control Board (SPCB)' },
        { id: 'l-4', text: 'Local Industrial Development Authority / Panchayat Factory Plan Sanction' }
      ]
    },
    {
      id: 'machinery',
      title: '3. Technical Feasibility & Plant Machinery',
      icon: Zap,
      items: [
        { id: 't-1', text: 'Detailed Project Report (DPR) with Process Flowchart & Capacity Planning' },
        { id: 't-2', text: 'Minimum 2 to 3 Competitive Quotations for Core Plant & Heavy Machinery' },
        { id: 't-3', text: 'Civil Works Cost Estimates vetted by Chartered Engineer (CE)' },
        { id: 't-4', text: 'HT Industrial Power Sanction Letter & Water Supply Allocation Order' }
      ]
    },
    {
      id: 'cma',
      title: '4. CMA Financial Modeling & Means of Finance',
      icon: ShieldCheck,
      items: [
        { id: 'f-1', text: 'Bank-formatted CMA Data (10-Year Projected P&L, Balance Sheet & Fund Flow)' },
        { id: 'f-2', text: 'Indicative Debt Service Coverage Ratio (DSCR) & Sensitivity Analysis' },
        { id: 'f-3', text: 'Proof of Promoter Contribution / Margin Money (Bank Balance & Fixed Assets)' },
        { id: 'f-4', text: 'Central / State Capital Investment Subsidy Eligibility Certification' }
      ]
    }
  ];

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Indicative Institutional Underwriting Checklist
            </h3>
            <p className="text-xs text-zinc-500">
              View-only readiness reference for PSU, Private banks, and NBFC consortiums.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">{totalItems} reference requirements</span>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">Important Disclaimer:</span>
          <p className="text-xs text-amber-900 leading-relaxed mt-0.5 font-medium">
            Checklist is indicative and not exhaustive. Requirements may vary depending on the bank and project nature.
          </p>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div
              key={sec.id}
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 space-y-3"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/80">
                <IconComp className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-zinc-900">{sec.title}</h4>
              </div>

              <div className="space-y-2">
                {sec.items.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg text-xs"
                    >
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-zinc-300 bg-zinc-100" aria-hidden="true" />
                      <span className="text-zinc-700">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-zinc-400 text-center pt-2 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>View-only institutional framework. Checklist is not transferable or downloadable.</span>
      </div>
    </div>
  );
};
