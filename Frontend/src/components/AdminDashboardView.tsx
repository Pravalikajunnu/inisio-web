import React, { useState, useEffect } from 'react';
import { getStoredLeads, deleteLeadRecord, clearAllLeads, exportLeadsToCSV, LeadRecord } from '../utils/leadStore';
import { UserProfileDetailModal } from './UserProfileDetailModal';
import { AuthUser } from '../types';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Trash2,
  Search,
  Phone,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  FileCheck2,
  Download,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck
} from 'lucide-react';

interface AdminDashboardViewProps {
  user: AuthUser;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'ALL' | 'PDF' | 'FORM'>('ALL');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('inisio_lead_added', handleUpdate);
    return () => window.removeEventListener('inisio_lead_added', handleUpdate);
  }, []);

  const loadData = () => {
    setLeads(getStoredLeads());
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.mobile.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterSource === 'PDF') return matchesSearch && l.downloadedPDF;
    if (filterSource === 'FORM') return matchesSearch && !l.downloadedPDF;
    return matchesSearch;
  });

  const totalDownloads = leads.filter(l => l.downloadedPDF).length;
  const totalCapex = leads.reduce((acc, l) => {
    const val = parseFloat(String(l.totalCostCr || 0));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inisio Platform Executive Administration</span>
            </div>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Control Center — {user.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Real-time monitoring of greenfield project submissions, teaser PDF downloads, total syndicated Capex, and promoter WhatsApp communications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportLeadsToCSV}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export All Leads (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Total Promoters Captured</span>
          <p className="text-2xl font-extrabold text-slate-900 font-manrope">{leads.length}</p>
          <span className="text-xs text-emerald-600 font-medium">Inquiries &amp; Teaser Submissions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">PDF Teaser Downloads</span>
          <p className="text-2xl font-extrabold text-blue-600 font-manrope">{totalDownloads}</p>
          <span className="text-xs text-slate-500">Bankable DPR Teasers Issued</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Total Evaluated Capex</span>
          <p className="text-2xl font-extrabold text-slate-900 font-manrope">₹ {totalCapex.toFixed(1)} Cr</p>
          <span className="text-xs text-slate-500">Greenfield Projects Portfolio</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold uppercase block">Admin Contact Desk</span>
          <p className="text-lg font-bold text-emerald-700 font-manrope">+91 63020 26462</p>
          <span className="text-xs text-slate-500">Live WhatsApp Lead Desk</span>
        </div>
      </div>

      {/* Search & Lead Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-manrope text-lg font-bold text-slate-900">
              Promoter Inquiries &amp; PDF Teaser Log
            </h2>
            <button
              onClick={loadData}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promoter, mobile, project..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterSource('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterSource === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All ({leads.length})
              </button>
              <button
                onClick={() => setFilterSource('PDF')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterSource === 'PDF' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                PDFs ({totalDownloads})
              </button>
              <button
                onClick={() => setFilterSource('FORM')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterSource === 'FORM' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Forms ({leads.length - totalDownloads})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto bg-slate-50/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Date</th>
                <th className="p-3">Promoter Details</th>
                <th className="p-3">Project &amp; Sector</th>
                <th className="p-3">Capex / Loan</th>
                <th className="p-3">Teaser Type</th>
                <th className="p-3">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No lead records found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const formattedDate = new Date(lead.timestamp).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const waText = encodeURIComponent(
                    `Hello ${lead.fullName || 'Promoter'},\n\n` +
                    `Thank you for evaluating your ${lead.industry || 'greenfield'} project on Inisio Greenfield Advisory Platform. ` +
                    `We noticed your interest in financing ₹${lead.loanRequiredCr || lead.totalCostCr} Cr. How can we assist you with DPR and Debt Syndication?`
                  );

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                            {lead.fullName || 'N/A'}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 px-1.5 py-0.2 rounded opacity-80 group-hover:opacity-100 transition-opacity">
                            View Profile
                          </span>
                        </div>
                        <div className="text-blue-700 font-mono text-[11px] font-semibold">{lead.mobile || 'N/A'}</div>
                        {lead.email && <div className="text-slate-500 text-[10px]">{lead.email}</div>}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{lead.projectName || 'Greenfield Unit'}</div>
                        <div className="text-slate-500 text-[11px]">{lead.industry || 'General Industry'}</div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">₹ {lead.totalCostCr} Cr</div>
                        <div className="text-emerald-700 text-[11px]">Loan: ₹ {lead.loanRequiredCr} Cr</div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {lead.downloadedPDF ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>PDF Downloaded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                            Inquiry Form
                          </span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Complete Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>

                          <a
                            href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, '')}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-[#25D366] hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Contact on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${lead.mobile}`}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Call Promoter"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => {
                              if (confirm(`Delete lead entry for ${lead.fullName}?`)) {
                                deleteLeadRecord(lead.id);
                                loadData();
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Showing {filteredLeads.length} of {leads.length} leads</span>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all leads data? This cannot be undone.')) {
                clearAllLeads();
                loadData();
              }
            }}
            className="text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Leads</span>
          </button>
        </div>
      </div>

      {/* Complete User Profile Detail Modal */}
      <UserProfileDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={(id) => {
          deleteLeadRecord(id);
          loadData();
        }}
      />

    </div>
  );
};
