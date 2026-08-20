import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { getStoredLeads, updateLeadRecord, LeadRecord } from '../utils/leadStore';
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
  Sparkles,
  CircleDot,
  Eye,
  ChevronRight,
  Filter,
  IndianRupee,
  Calendar,
  Layers
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
  equityCr: number;
  dscr: number;
  subsidyEligible: boolean;
  status: 'Pending Audit' | 'CA Approved' | 'Clarification Needed';
  updatedAt: string;
  stageNumber: number;
  location: string;
  landStatus: string;
  collateral: string;
}

export const CADashboard: React.FC<CADashboardProps> = ({ user }) => {
  const [audits, setAudits] = useState<CAProjectAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<CAProjectAudit | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending Audit' | 'CA Approved'>('ALL');
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const loadAudits = () => {
    const leads = getStoredLeads();
    const mapped: CAProjectAudit[] = leads.map(l => {
      const capex = parseFloat(String(l.totalCostCr || 0)) || 10;
      const loan = parseFloat(String(l.loanRequiredCr || 0)) || Math.round(capex * 0.75 * 10) / 10;
      const equity = parseFloat(String(l.promoterContribCr || 0)) || Math.round((capex - loan) * 10) / 10;
      const dscr = 1.35 + (Number(l.feasibilityScore || 80) % 20) * 0.02;

      return {
        id: l.id,
        promoterName: l.fullName || 'Promoter',
        projectName: l.projectName || 'Greenfield Project',
        industry: l.industry || 'Industrial Manufacturing',
        capexCr: capex,
        loanCr: loan,
        equityCr: equity,
        dscr: Math.round(dscr * 100) / 100,
        subsidyEligible: true,
        status: (l.status === 'CA Approved' ? 'CA Approved' : 'Pending Audit') as any,
        updatedAt: l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently',
        stageNumber: l.status === 'CA Approved' ? 4 : 3,
        location: l.location || 'India',
        landStatus: l.landStatus || 'Industrial Land Allotted',
        collateral: l.collateralStatus || 'Factory & Plant Machinery'
      };
    });
    setAudits(mapped);
    if (mapped.length > 0 && !selectedAudit) {
      setSelectedAudit(mapped[0]);
    }
  };

  useEffect(() => {
    loadAudits();
    const handleUpdate = () => loadAudits();
    window.addEventListener('inisio_lead_added', handleUpdate);
    return () => window.removeEventListener('inisio_lead_added', handleUpdate);
  }, []);

  const handleApprove = (id: string) => {
    setAudits(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'CA Approved', stageNumber: 4 } : item))
    );
    updateLeadRecord(id, { status: 'CA Approved' });
    if (selectedAudit && selectedAudit.id === id) {
      setSelectedAudit(prev => prev ? { ...prev, status: 'CA Approved', stageNumber: 4 } : null);
    }
    triggerToast(`Project verified and certified by CA!`);
  };

  const filtered = audits.filter(a => {
    const matchesSearch =
      a.promoterName.toLowerCase().includes(search.toLowerCase()) ||
      a.projectName.toLowerCase().includes(search.toLowerCase()) ||
      a.industry.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && a.status === statusFilter;
  });

  const stages = [
    { id: 1, name: 'Project Assessment Submitted', desc: 'Promoter capex & equity benchmarks locked' },
    { id: 2, name: 'Bankability Rating Computed', desc: 'Underwriting feasibility scoring generated' },
    { id: 3, name: 'DPR & CMA Audit in Progress', desc: 'Balance sheet reconciliation & DSCR audit' },
    { id: 4, name: 'Financial Model Signed Off', desc: 'DSCR norms verified (>1.25x RBI standard)' },
    { id: 5, name: 'Bank Credit Committee Filing', desc: 'Targeting SBI, Canara, and HDFC Consortium' },
    { id: 6, name: 'Sanction Letter Issuance', desc: 'Formal loan sanction approval' }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-inter antialiased">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-500 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ---------------------------------------------------- */}
        {/* 1. TOP MINIMALIST HEADER & BREADCRUMB                */}
        {/* ---------------------------------------------------- */}
        <div className="border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">CA Audit Desk</span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs text-zinc-500 font-medium">{user.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  FCA / ICAI #847201
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                Financial Appraisal &amp; Audit Workspace
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Audit promoter financial models, verify DSCR benchmarks, and issue bank-ready certifications.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. KEY METRICS STRIP                                 */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Pending Audits</span>
            <div className="text-xl font-bold text-zinc-900">
              {audits.filter(a => a.status === 'Pending Audit').length} Projects
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Awaiting CA Certification</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Approved Appraisals</span>
            <div className="text-xl font-bold text-blue-600">
              {audits.filter(a => a.status === 'CA Approved').length} Projects
            </div>
            <span className="text-[11px] text-blue-700 font-medium">Bank Committee Ready</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Audited Capex Outlay</span>
            <div className="text-xl font-bold text-zinc-900">
              ₹ {audits.reduce((acc, a) => acc + a.capexCr, 0).toFixed(1)} Cr
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Greenfield Portfolio</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Average Portfolio DSCR</span>
            <div className="text-xl font-bold text-zinc-900">1.48x</div>
            <span className="text-[11px] text-emerald-700 font-medium">Benchmark &gt; 1.25x Met</span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. AUDIT WORKSPACE (2-COLUMN HIGH LEGIBILITY LAYOUT) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Columns: Projects Audit Queue Table */}
          <div className="lg:col-span-7 border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Promoter Projects Queue</h2>
                <p className="text-xs text-zinc-500">Select any project to inspect parameters and verify compliance.</p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search plant or promoter..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2">
              {(['ALL', 'Pending Audit', 'CA Approved'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {tab === 'ALL' ? 'All Audits' : tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-3">Project &amp; Sector</th>
                    <th className="py-2 px-3">Capex / Debt</th>
                    <th className="py-2 px-3">DSCR</th>
                    <th className="py-2 px-3">Audit Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filtered.map(item => {
                    const isSelected = selectedAudit?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedAudit(item)}
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-zinc-900">{item.projectName}</div>
                          <div className="text-[11px] text-zinc-500">{item.promoterName} • {item.industry}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-zinc-900">₹ {item.capexCr} Cr</div>
                          <div className="text-blue-600 text-[11px]">Debt: ₹ {item.loanCr} Cr</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {item.dscr}x
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.status === 'CA Approved' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                          {item.status === 'Pending Audit' ? (
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-blue-600">
                              Certified
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                        No projects match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 Columns: Deep Project Audit & Vertical Tracking Line */}
          <div className="lg:col-span-5 border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">
                {selectedAudit ? selectedAudit.projectName : 'Project Audit Details'}
              </h3>
              <p className="text-xs text-zinc-500">
                {selectedAudit ? `${selectedAudit.promoterName} • ${selectedAudit.location}` : 'Select a project to review'}
              </p>
            </div>

            {selectedAudit ? (
              <div className="space-y-4 text-xs">
                
                {/* Financial Summary Box */}
                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-medium">Total Capex</span>
                      <strong className="text-zinc-900 text-sm font-bold">₹ {selectedAudit.capexCr} Cr</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-medium">Loan Required</span>
                      <strong className="text-blue-600 text-sm font-bold">₹ {selectedAudit.loanCr} Cr</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-medium">Promoter Equity</span>
                      <strong className="text-zinc-900">₹ {selectedAudit.equityCr} Cr</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-medium">DSCR Benchmark</span>
                      <strong className="text-emerald-700 font-bold">{selectedAudit.dscr}x Compliant</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 space-y-1 text-zinc-600">
                    <div><strong>Land Title:</strong> {selectedAudit.landStatus}</div>
                    <div><strong>Collateral:</strong> {selectedAudit.collateral}</div>
                  </div>
                </div>

                {/* Vertical Loan Lifecycle Progress Line */}
                <div className="space-y-2 pt-1">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Loan Lifecycle Milestones
                  </span>

                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:h-full before:w-0.5 before:bg-zinc-200 before:z-0 pl-0.5 pt-1">
                    {stages.map((st) => {
                      const isCompleted = st.id < selectedAudit.stageNumber || (selectedAudit.status === 'CA Approved' && st.id <= 4);
                      const isCurrent = st.id === selectedAudit.stageNumber;

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
                          <div>
                            <span className={`font-bold block text-xs ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                              {st.name}
                            </span>
                            <span className="text-[11px] text-zinc-500">{st.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Approve Action */}
                {selectedAudit.status === 'Pending Audit' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleApprove(selectedAudit.id)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Approve &amp; Sign-off Document
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Select any project from the queue to view audit breakdown.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
