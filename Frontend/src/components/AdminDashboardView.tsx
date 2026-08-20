import React, { useState, useEffect } from 'react';
import { getStoredLeads, deleteLeadRecord, clearAllLeads, exportLeadsToCSV, LeadRecord } from '../utils/leadStore';
import { getAdminNotifications, AdminNotification } from '../utils/notificationStore';
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
  UserCheck,
  Bell,
  Activity,
  Edit3,
  Filter,
  Check,
  Plus
} from 'lucide-react';

interface AdminDashboardViewProps {
  user: AuthUser;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'edits' | 'assignments' | 'teasers'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

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

    if (!matchesSearch) return false;

    if (activeTab === 'teasers') return l.downloadedPDF;
    if (activeTab === 'edits') return !!l.lastEditedBy;
    return true;
  }).sort((a, b) => {
    if (activeTab === 'assignments') {
      const aAssigned = !!a.assignedTeam;
      const bAssigned = !!b.assignedTeam;
      if (aAssigned === bAssigned) return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return aAssigned ? 1 : -1;
    }
    if (activeTab === 'edits') {
       const aEdit = a.lastEditedAt ? new Date(a.lastEditedAt).getTime() : 0;
       const bEdit = b.lastEditedAt ? new Date(b.lastEditedAt).getTime() : 0;
       return bEdit - aEdit;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const totalDownloads = leads.filter(l => l.downloadedPDF).length;
  const totalEdits = leads.filter(l => !!l.lastEditedBy).length;
  const unassignedCount = leads.filter(l => !l.assignedTeam).length;

  const totalCapex = leads.reduce((acc, l) => {
    const val = parseFloat(String(l.totalCostCr || 0));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

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
        {/* 1. TOP MINIMALIST HEADER & NAVBAR                    */}
        {/* ---------------------------------------------------- */}
        <div className="border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Admin Control</span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs text-zinc-500 font-medium">{user.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  Super Admin
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                Greenfield Syndication Control &amp; Lead Manager
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Monitor promoter project submissions, user edits, underwriting ratings, and debt syndication pipelines in real time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  exportLeadsToCSV();
                  triggerToast('Exported all leads to CSV!');
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 mt-5 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('edits')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'edits' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Recent Edits</span>
              {totalEdits > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'edits' ? 'bg-zinc-700' : 'bg-zinc-200'}`}>{totalEdits}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'assignments' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assignments</span>
              {unassignedCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'assignments' ? 'bg-amber-500 text-amber-950' : 'bg-amber-100 text-amber-700'}`}>{unassignedCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('teasers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'teasers' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Teaser Downloads</span>
              {totalDownloads > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'teasers' ? 'bg-blue-500 text-blue-950' : 'bg-blue-100 text-blue-700'}`}>{totalDownloads}</span>
              )}
            </button>
          </nav>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. KEY METRICS STRIP                                 */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Total Captured Promoters</span>
            <div className="text-xl font-bold text-zinc-900">{leads.length}</div>
            <span className="text-[11px] text-blue-700 font-medium">Active Greenfield Pipelines</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Teasers Downloaded</span>
            <div className="text-xl font-bold text-blue-600">{totalDownloads}</div>
            <span className="text-[11px] text-zinc-500 font-medium">14-Page PDF Reports Issued</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Evaluated Capex Portfolio</span>
            <div className="text-xl font-bold text-zinc-900">₹ {totalCapex.toFixed(1)} Cr</div>
            <span className="text-[11px] text-zinc-500 font-medium">Cumulative Outlay</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Direct WhatsApp Desk</span>
            <div className="text-base font-bold text-zinc-900 font-mono">+91 63020 26462</div>
            <span className="text-[11px] text-emerald-700 font-medium">Live Inisio Channel</span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. PROMOTER PROJECTS & LEADS TABLE                   */}
        {/* ---------------------------------------------------- */}
        <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
          
          {/* Header with Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900">Promoter Submissions &amp; Activity Tracking</h2>
              <button
                onClick={() => {
                  loadData();
                  triggerToast('Refreshed lead records.');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, project..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Date &amp; Updates</th>
                  <th className="py-2 px-3">Promoter</th>
                  <th className="py-2 px-3">Project &amp; Sector</th>
                  <th className="py-2 px-3">Capex / Debt</th>
                  <th className="py-2 px-3">Stage &amp; Teaser</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs">
                      No lead records match your search or filter.
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
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-zinc-800 font-medium">{formattedDate}</div>
                          {lead.lastEditedBy && (
                            <div className="text-[10px] text-blue-700 flex items-center gap-1 mt-0.5">
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>Edited by user</span>
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">
                            {lead.fullName || 'N/A'}
                          </div>
                          <div className="text-blue-700 font-mono text-[11px]">{lead.mobile || 'N/A'}</div>
                          {lead.email && <div className="text-zinc-400 text-[10px]">{lead.email}</div>}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-zinc-900">{lead.projectName || 'Greenfield Unit'}</div>
                          <div className="text-zinc-500 text-[11px]">{lead.industry || 'General Industry'}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-zinc-900">₹ {lead.totalCostCr} Cr</div>
                          <div className="text-blue-600 text-[11px]">Loan: ₹ {lead.loanRequiredCr} Cr</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            {lead.downloadedPDF ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                <FileCheck2 className="w-3 h-3" />
                                <span>PDF Downloaded</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600">
                                Inquiry Form
                              </span>
                            )}
                            
                            {lead.assignedTeam ? (
                              <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-1">
                                Assigned: {lead.assignedTeam}
                              </div>
                            ) : (
                              <div className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 inline-block mt-1">
                                Unassigned
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="View Profile & Tracking Line"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Track</span>
                            </button>

                            <a
                              href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, '')}?text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3 fill-current" />
                              <span>WA</span>
                            </a>

                            <button
                              onClick={() => {
                                if (confirm(`Delete lead entry for ${lead.fullName}?`)) {
                                  deleteLeadRecord(lead.id);
                                  loadData();
                                  triggerToast('Deleted lead record.');
                                }
                              }}
                              className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              title="Delete"
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

          {/* Table Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100">
            <span>Showing {filteredLeads.length} of {leads.length} records</span>
            <button
              onClick={() => {
                if (confirm('Clear all leads data? This cannot be undone.')) {
                  clearAllLeads();
                  loadData();
                  triggerToast('Cleared all lead records.');
                }
              }}
              className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer text-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All Leads</span>
            </button>
          </div>

        </div>

      </div>

      {/* User Profile Detail Modal */}
      <UserProfileDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={(id) => {
          deleteLeadRecord(id);
          loadData();
          triggerToast('Deleted lead record.');
        }}
      />

    </div>
  );
};
