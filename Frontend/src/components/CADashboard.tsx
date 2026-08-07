import React, { useState } from 'react';
import { AuthUser } from '../types';
import {
  Briefcase,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Download,
  Search,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  FileText,
  Sparkles
} from 'lucide-react';

interface CADashboardProps {
  user: AuthUser;
}

interface CAProjectAudit {
  id: string;
  promoterName: string;
  projectName: string;
  industry: string;
  capexCr: number;
  loanCr: number;
  dscr: number;
  subsidyEligible: boolean;
  status: 'Pending Audit' | 'CA Approved' | 'Clarification Needed';
  updatedAt: string;
}

export const CADashboard: React.FC<CADashboardProps> = ({ user }) => {
  const [audits, setAudits] = useState<CAProjectAudit[]>([
    {
      id: 'CA-2026-001',
      promoterName: 'Vikram Malhotra',
      projectName: 'Bio-Pharma Formulation Plant',
      industry: 'Pharma & Biotech',
      capexCr: 18.5,
      loanCr: 13.8,
      dscr: 1.48,
      subsidyEligible: true,
      status: 'Pending Audit',
      updatedAt: 'Today, 10:30 AM'
    },
    {
      id: 'CA-2026-002',
      promoterName: 'Rajesh Patel',
      projectName: 'High-Purity Chemical Refinery',
      industry: 'Specialty Chemicals',
      capexCr: 34.0,
      loanCr: 25.5,
      dscr: 1.62,
      subsidyEligible: true,
      status: 'CA Approved',
      updatedAt: 'Yesterday'
    },
    {
      id: 'CA-2026-003',
      promoterName: 'Sunita Reddy',
      projectName: 'Precision Auto Component Unit',
      industry: 'Auto Ancillary',
      capexCr: 12.0,
      loanCr: 9.0,
      dscr: 1.35,
      subsidyEligible: true,
      status: 'Pending Audit',
      updatedAt: '05 Aug 2026'
    }
  ]);

  const [search, setSearch] = useState('');

  const handleApprove = (id: string) => {
    setAudits(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'CA Approved' } : item))
    );
  };

  const filtered = audits.filter(
    a =>
      a.promoterName.toLowerCase().includes(search.toLowerCase()) ||
      a.projectName.toLowerCase().includes(search.toLowerCase()) ||
      a.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      
      {/* CA Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Chartered Accountant Financial Audit Portal</span>
            </div>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CA Financial Appraisal Desk — {user.name}
            </h1>
            <p className="text-sm text-purple-200/80 max-w-2xl">
              Audit promoter financial models, verify CMA projections, calculate DSCR norms, and sign off on bank-ready Technoeconomic Viability (TEV) reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 bg-purple-900/80 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>CA License: FCA / ICAI #847201</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Pending CA Audits</span>
          <p className="text-2xl font-extrabold text-amber-600 font-manrope">
            {audits.filter(a => a.status === 'Pending Audit').length} Projects
          </p>
          <span className="text-xs text-slate-500">Awaiting Balance Sheet Verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Verified CA Appraisals</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-manrope">
            {audits.filter(a => a.status === 'CA Approved').length} Projects
          </p>
          <span className="text-xs text-emerald-600 font-medium">Ready for Bank Credit Committee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Total Audited Capex</span>
          <p className="text-2xl font-extrabold text-slate-900 font-manrope">
            ₹ {audits.reduce((acc, a) => acc + a.capexCr, 0).toFixed(1)} Cr
          </p>
          <span className="text-xs text-purple-600 font-medium">Syndicated Debt: ₹ 48.3 Cr</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Avg Debt Service Ratio</span>
          <p className="text-2xl font-extrabold text-blue-600 font-manrope">1.48x DSCR</p>
          <span className="text-xs text-slate-500">RBI &amp; Bank Norm Benchmark: &gt; 1.25x</span>
        </div>
      </div>

      {/* CA Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-manrope text-lg font-bold text-slate-900">
              Project Appraisal Queue &amp; CMA Verification
            </h2>
            <p className="text-xs text-slate-500">
              Review and issue CA Net Worth &amp; Financial Appraisal Certificates
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search promoter, project..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Promoter / Entity</th>
                <th className="p-3">Project &amp; Sector</th>
                <th className="p-3">Capex &amp; Loan</th>
                <th className="p-3">DSCR Ratio</th>
                <th className="p-3">Audit Status</th>
                <th className="p-3">CA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-purple-700 font-bold">{item.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{item.promoterName}</div>
                    <div className="text-[11px] text-slate-500">{item.updatedAt}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{item.projectName}</div>
                    <div className="text-slate-500 text-[11px]">{item.industry}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">₹ {item.capexCr} Cr</div>
                    <div className="text-blue-600 text-[11px]">Loan: ₹ {item.loanCr} Cr</div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      {item.dscr}x DSCR
                    </span>
                  </td>
                  <td className="p-3">
                    {item.status === 'CA Approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CA Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Audit</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {item.status === 'Pending Audit' ? (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sign &amp; Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Certificate issued for ${item.projectName}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-600" />
                        <span>Certificate</span>
                      </button>
                    )}
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
