import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { getStoredLeads, updateLeadRecord, fetchLeadsFromBackend, LeadRecord } from '../utils/leadStore';
import api from '../utils/apiClient';
import {
  Users2,
  Calendar,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  RefreshCw,
  Building,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertCircle,
  Eye,
  LogOut
} from 'lucide-react';

interface ProsyncDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export const ProsyncDashboard: React.FC<ProsyncDashboardProps> = ({ user, onLogout }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      const assignedLeads = await fetchLeadsFromBackend();
      setLeads(assignedLeads.filter((lead) => Boolean(lead.consultationAssignedTo)));
    } catch (error) {
      setLeads([]);
      triggerToast('Unable to load consultation projects.');
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('inisio_lead_added', loadData);
    return () => window.removeEventListener('inisio_lead_added', loadData);
  }, []);

  const handleUpdateStatus = (leadId: string, status: 'In Progress' | 'Customer Declined' | 'Completed') => {
    api.leads.update(leadId, {
      consultationStatus: status,
      consultationNotes: consultationNotes || undefined
    }).then(() => {
      loadData();
      if (selectedLead && selectedLead.id === leadId) setSelectedLead({ ...selectedLead, consultationStatus: status, consultationNotes });
      triggerToast(`Status updated to '${status}'.`);
    }).catch(() => {
      triggerToast('Unable to update consultation status.');
    });
  };

  const handleSaveNotes = (leadId: string) => {
    api.leads.update(leadId, {
      consultationNotes,
    }).then(() => {
      loadData();
      triggerToast('Consultation notes saved successfully.');
    }).catch(() => triggerToast('Unable to save consultation notes.'));
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.mobile || '').includes(searchQuery) ||
      (lead.industry || '').toLowerCase().includes(searchQuery.toLowerCase());

    const leadStatus = lead.consultationStatus || 'In Progress';
    const matchesStatus = statusFilter === 'all' || leadStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const inProgressCount = leads.filter(l => (l.consultationStatus || 'In Progress') === 'In Progress').length;
  const completedCount = leads.filter(l => l.consultationStatus === 'Completed').length;
  const declinedCount = leads.filter(l => l.consultationStatus === 'Customer Declined').length;

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900">Prosync Consultation Advisory Desk</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Advisor Portal
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Logged in as: {user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">In Progress Consultations</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}</div>
              <span className="text-[11px] text-zinc-500">Active promoter evaluations</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Completed Consultations</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</div>
              <span className="text-[11px] text-emerald-700">DPR / Advisory routed</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Customer Declined</span>
              <div className="text-2xl font-black text-zinc-600 mt-1">{declinedCount}</div>
              <span className="text-[11px] text-zinc-500">Closed leads</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search promoter, project, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs rounded-lg outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Filter:</span>
            {['all', 'In Progress', 'Completed', 'Customer Declined'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {f === 'all' ? 'All Leads' : f}
              </button>
            ))}
            <button
              onClick={loadData}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] bg-zinc-50/50">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Promoter Details</th>
                  <th className="py-3 px-4">Project &amp; Sector</th>
                  <th className="py-3 px-4">Capex / Debt</th>
                  <th className="py-3 px-4">Consultation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs">
                      No consultation records matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const currentStatus = lead.consultationStatus || 'In Progress';
                    const dateFormatted = new Date(lead.timestamp).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setConsultationNotes(lead.consultationNotes || '');
                        }}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-medium text-zinc-700 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                            {lead.fullName || 'Lead Promoter'}
                          </div>
                          <div className="text-zinc-500 font-mono text-[11px]">{lead.mobile || 'N/A'}</div>
                          {lead.email && <div className="text-zinc-400 text-[10px]">{lead.email}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-900">{lead.projectName}</div>
                          <div className="text-zinc-500 text-[11px]">{lead.industry}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-800">
                          ₹ {lead.totalCostCr} Cr
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            currentStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : currentStatus === 'Customer Declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          }`}>
                            {currentStatus === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {currentStatus === 'Customer Declined' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {currentStatus === 'In Progress' && <Clock className="w-3 h-3 text-blue-600" />}
                            <span>{currentStatus}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                              setConsultationNotes(lead.consultationNotes || '');
                            }}
                            className="px-3 py-1 bg-zinc-100 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Lead Consultation Drawer/Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                      {selectedLead.projectName}
                    </h3>
                    <p className="text-xs text-zinc-500">Promoter: {selectedLead.fullName} ({selectedLead.mobile})</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Lead Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Total Capex</span>
                  <span className="font-bold text-zinc-900 font-mono">₹ {selectedLead.totalCostCr} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Loan Required</span>
                  <span className="font-bold text-blue-600 font-mono">₹ {selectedLead.loanRequiredCr} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Feasibility</span>
                  <span className="font-bold text-emerald-700">{selectedLead.feasibilityScore || 82}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Bankability</span>
                  <span className="font-bold text-zinc-800">{selectedLead.bankabilityRating || 'Grade A'}</span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">Update Consultation Status:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedLead.id, 'In Progress')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      (selectedLead.consultationStatus || 'In Progress') === 'In Progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Progress</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedLead.id, 'Completed')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      selectedLead.consultationStatus === 'Completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedLead.id, 'Customer Declined')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      selectedLead.consultationStatus === 'Customer Declined'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Customer Declined</span>
                  </button>
                </div>
              </div>

              {/* Consultation Notes */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-zinc-700">Advisory Consultation Notes &amp; Action Plan:</label>
                <textarea
                  rows={4}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Record discussions, promoter margin availability, preferred banks, and next steps for DPR preparation..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-sans text-xs"
                />
                <button
                  onClick={() => handleSaveNotes(selectedLead.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Notes
                </button>
              </div>

              {/* Quick Communication Links */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${selectedLead.mobile}`}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call {selectedLead.mobile}</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedLead.mobile}?text=${encodeURIComponent(
                    `Hello ${selectedLead.fullName},\n\nThis is Prosync Financial Advisory regarding your project assessment for '${selectedLead.projectName}'. We would like to discuss your DPR and funding structure.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Promoter</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
