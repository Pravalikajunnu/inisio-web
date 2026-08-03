import React, { useState, useEffect } from 'react';
import { getStoredLeads, deleteLeadRecord, clearAllLeads, exportLeadsToCSV, LeadRecord } from '../utils/leadStore';
import {
  X,
  Lock,
  Unlock,
  Users,
  FileSpreadsheet,
  Download,
  Trash2,
  Search,
  Phone,
  MessageSquare,
  Building2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface AdminLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLeadsModal: React.FC<AdminLeadsModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'ALL' | 'PDF' | 'FORM'>('ALL');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    const handleUpdate = () => loadData();
    window.addEventListener('inisio_lead_added', handleUpdate);
    return () => window.removeEventListener('inisio_lead_added', handleUpdate);
  }, [isOpen]);

  const loadData = () => {
    setLeads(getStoredLeads());
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'inisio2026' || password === 'admin' || password === '6302026462') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Password. Hint: inisio2026 or 6302026462');
    }
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full text-white shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-manrope text-lg sm:text-xl font-bold text-white tracking-tight">
                  Admin Lead & Download Portal
                </h2>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-inter">
                Track all project teaser PDF downloads & promoter lead submissions in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Password Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-manrope text-xl font-bold text-white">Protected Admin Desk</h3>
              <p className="text-xs text-slate-400">
                Enter your security password to access live lead metrics and teaser download history.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (inisio2026)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Lead Dashboard</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-500">
              Default password: <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">inisio2026</code>
            </p>
          </div>
        ) : (
          /* Main Dashboard Content */
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 font-inter">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Leads Captured</span>
                <span className="text-2xl font-bold font-manrope text-white">{leads.length}</span>
              </div>

              <div className="bg-emerald-950/50 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">PDF Teaser Downloads</span>
                <span className="text-2xl font-bold font-manrope text-emerald-400">{totalDownloads}</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Evaluated Capex</span>
                <span className="text-xl sm:text-2xl font-bold font-manrope text-white">₹ {totalCapex.toFixed(0)} Cr</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Admin WhatsApp</span>
                <span className="text-sm font-bold text-emerald-400 font-manrope truncate block">+91 63020 26462</span>
              </div>
            </div>

            {/* Filter & Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search promoter, phone, industry..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Source Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFilterSource('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${filterSource === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  All ({leads.length})
                </button>
                <button
                  onClick={() => setFilterSource('PDF')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${filterSource === 'PDF' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  PDF Downloads ({totalDownloads})
                </button>
                <button
                  onClick={() => setFilterSource('FORM')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${filterSource === 'FORM' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Inquiries ({leads.length - totalDownloads})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  onClick={exportLeadsToCSV}
                  className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={loadData}
                  className="p-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Leads"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Promoter Details</th>
                    <th className="p-3">Project & Industry</th>
                    <th className="p-3">Total Capex / Loan</th>
                    <th className="p-3">Teaser PDF</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        No lead records found. Download a Teaser PDF to see it logged here instantly.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const formattedDate = new Date(lead.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const waText = encodeURIComponent(
                        `Hello ${lead.fullName || 'Promoter'},\n\n` +
                        `Thank you for evaluating your ${lead.industry || 'greenfield'} project on Inisio Greenfield Advisory Platform. ` +
                        `We noticed your interest in financing ₹${lead.loanRequiredCr || lead.totalCostCr} Cr. How can we assist you with DPR and Debt Syndication?`
                      );

                      return (
                        <tr key={lead.id} className="hover:bg-slate-900/80 transition-colors">
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {formattedDate}
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-white text-sm">{lead.fullName || 'N/A'}</div>
                            <div className="text-emerald-400 font-mono text-[11px] font-semibold">{lead.mobile || 'N/A'}</div>
                            {lead.email && <div className="text-slate-400 text-[10px]">{lead.email}</div>}
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{lead.projectName || 'Greenfield Project'}</div>
                            <div className="text-slate-400 text-[11px]">{lead.industry || 'General Industry'}</div>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <div className="font-bold text-white">₹ {lead.totalCostCr} Cr</div>
                            <div className="text-emerald-400 text-[11px]">Loan: ₹ {lead.loanRequiredCr} Cr</div>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            {lead.downloadedPDF ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>PDF Downloaded</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                                Inquiry Form
                              </span>
                            )}
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, '')}?text=${waText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Contact on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 fill-current" />
                                <span>WhatsApp</span>
                              </a>

                              <a
                                href={`tel:${lead.mobile}`}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                title="Call Promoter"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => {
                                  if (confirm(`Delete lead entry for ${lead.fullName}?`)) {
                                    deleteLeadRecord(lead.id);
                                  }
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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

            {/* Bottom Actions */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <p>Showing {filteredLeads.length} of {leads.length} leads</p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all leads data? This cannot be undone.')) {
                    clearAllLeads();
                  }
                }}
                className="text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Leads</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
