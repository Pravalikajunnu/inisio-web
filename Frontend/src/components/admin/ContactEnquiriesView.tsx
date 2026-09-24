import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Edit3,
  Archive,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink,
  UserCheck,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

export interface ContactEnquiryRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Closed' | 'Spam';
  notes?: string;
  assignedTo?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const TEAM_MEMBERS = [
  'Senior Project Advisory Desk',
  'CA Rajesh Sharma (Financial Due Diligence)',
  'Prosync Syndication Desk',
  'DPR Technical Consultant',
  'Operations & Compliance Desk',
];

interface ContactEnquiriesViewProps {
  onTriggerToast: (msg: string) => void;
}

export const ContactEnquiriesView: React.FC<ContactEnquiriesViewProps> = ({ onTriggerToast }) => {
  const [enquiries, setEnquiries] = useState<ContactEnquiryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Modals & Editing
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiryRecord | null>(null);
  const [editingEnquiry, setEditingEnquiry] = useState<ContactEnquiryRecord | null>(null);
  const [editStatus, setEditStatus] = useState<string>('New');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter, dateRangeFilter, showArchived]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: pageSize,
        isArchived: showArchived,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }

      if (dateRangeFilter === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        params.startDate = d.toISOString();
      } else if (dateRangeFilter === '7days') {
        const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        params.startDate = d.toISOString();
      } else if (dateRangeFilter === '30days') {
        const d = new Date(Date.now() - 30 * 24 * 3600 * 1000);
        params.startDate = d.toISOString();
      }

      const res = await apiClient.contact.getEnquiries(params);
      const items = res?.data?.enquiries || res?.enquiries || (Array.isArray(res) ? res : []);
      const pagination = res?.data?.pagination || res?.pagination;

      setEnquiries(items);
      if (pagination) {
        setTotalCount(pagination.total || items.length);
        setTotalPages(pagination.totalPages || 1);
      } else {
        setTotalCount(items.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to fetch contact enquiries:', err);
      onTriggerToast(err?.message || 'Could not load contact enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries();
  };

  const handleOpenEdit = (enquiry: ContactEnquiryRecord) => {
    setEditingEnquiry(enquiry);
    setEditStatus(enquiry.status);
    setEditNotes(enquiry.notes || '');
    setEditAssignedTo(enquiry.assignedTo || TEAM_MEMBERS[0]);
  };

  const handleSaveEdit = async () => {
    if (!editingEnquiry) return;
    setIsUpdating(true);
    try {
      await apiClient.contact.updateEnquiry(editingEnquiry._id, {
        status: editStatus,
        notes: editNotes,
        assignedTo: editAssignedTo,
      });

      onTriggerToast(`Enquiry for ${editingEnquiry.name} updated to "${editStatus}"`);
      setEditingEnquiry(null);
      if (selectedEnquiry && selectedEnquiry._id === editingEnquiry._id) {
        setSelectedEnquiry({
          ...selectedEnquiry,
          status: editStatus as any,
          notes: editNotes,
          assignedTo: editAssignedTo,
        });
      }
      fetchEnquiries();
    } catch (err: any) {
      onTriggerToast(err?.message || 'Failed to update enquiry');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.contact.updateEnquiry(id, { status: newStatus });
      onTriggerToast(`Status updated to ${newStatus}`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus as any } : e))
      );
    } catch (err: any) {
      onTriggerToast(err?.message || 'Failed to change status');
    }
  };

  const handleArchiveToggle = async (enquiry: ContactEnquiryRecord) => {
    const targetState = !enquiry.isArchived;
    try {
      await apiClient.contact.updateEnquiry(enquiry._id, { isArchived: targetState });
      onTriggerToast(
        targetState ? `Enquiry archived.` : `Enquiry restored to active inbox.`
      );
      if (selectedEnquiry && selectedEnquiry._id === enquiry._id) {
        setSelectedEnquiry(null);
      }
      fetchEnquiries();
    } catch (err: any) {
      onTriggerToast(err?.message || 'Failed to update archive status');
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this contact enquiry? This action cannot be undone.')) {
      return;
    }
    try {
      await apiClient.contact.deleteEnquiry(id, true);
      onTriggerToast('Enquiry permanently deleted.');
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(null);
      }
      fetchEnquiries();
    } catch (err: any) {
      onTriggerToast(err?.message || 'Failed to delete enquiry');
    }
  };

  const exportToCSV = () => {
    if (enquiries.length === 0) {
      onTriggerToast('No enquiries available to export.');
      return;
    }

    const headers = ['ID', 'Name', 'Phone', 'Email', 'Company', 'Subject', 'Message', 'Status', 'Notes', 'Assigned To', 'Date'];
    const rows = enquiries.map((e) => [
      `"${e._id}"`,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${e.phone || ''}"`,
      `"${e.email || ''}"`,
      `"${(e.company || '').replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${(e.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${e.status || 'New'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"${(e.assignedTo || '').replace(/"/g, '""')}"`,
      `"${new Date(e.createdAt).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inisio_Contact_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast('Contact enquiries exported to CSV');
  };

  // Status Styling Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20 font-bold';
      case 'Contacted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Spam':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const newEnquiryCount = enquiries.filter((e) => e.status === 'New').length;

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-5 font-inter">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-manrope">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Contact Enquiries Desk</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {totalCount} total
            </span>
            {newEnquiryCount > 0 && !showArchived && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
                {newEnquiryCount} New Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review inbound website contact submissions, assign advisory leads, log consultation notes, and connect on WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showArchived
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Viewing Archived' : 'View Archived'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchEnquiries}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="sm:col-span-6 lg:col-span-5 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, email, company, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-14 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute right-12 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-md cursor-pointer transition-colors"
          >
            Go
          </button>
        </form>

        {/* Status Filter */}
        <div className="sm:col-span-3 lg:col-span-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
            <option value="Spam">Spam</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="sm:col-span-3 lg:col-span-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Date:</span>
          <select
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value as any);
              setPage(1);
            }}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today Only</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* 3. Enquiries Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5">Name &amp; Coordinates</th>
              <th className="py-3 px-3.5">Company &amp; Subject</th>
              <th className="py-3 px-3.5">Message Excerpt</th>
              <th className="py-3 px-3.5">Submitted Date</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading contact enquiries...</span>
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No contact enquiries found.</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchTerm || statusFilter !== 'All'
                      ? 'Try clearing the search or filter settings.'
                      : 'New enquiries submitted via the Contact Us form will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              enquiries.map((item) => {
                const isNew = item.status === 'New';
                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isNew ? 'bg-blue-50/30 font-medium' : ''
                    }`}
                  >
                    {/* Name & Coordinates */}
                    <td className="py-3 px-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                          {isNew && (
                            <span className="px-1.5 py-0.2 bg-blue-600 text-white font-bold text-[9px] rounded-xs uppercase">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <a
                            href={`tel:${item.phone}`}
                            className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${item.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                              `Hello ${item.name}, thank you for contacting Inisio Advisory regarding "${item.subject || 'Greenfield Project'}"...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <a href={`mailto:${item.email}`} className="hover:underline flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{item.email}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Company & Subject */}
                    <td className="py-3 px-3.5 max-w-[220px]">
                      <div className="space-y-0.5">
                        {item.company ? (
                          <div className="flex items-center gap-1 text-slate-800 font-semibold truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.company}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Individual / Promoter</span>
                        )}
                        <p className="text-slate-600 text-xs line-clamp-1" title={item.subject}>
                          {item.subject || 'General Greenfield Enquiry'}
                        </p>
                      </div>
                    </td>

                    {/* Message Excerpt */}
                    <td className="py-3 px-3.5 max-w-[280px]">
                      <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed" title={item.message}>
                        {item.message}
                      </p>
                      {item.notes && (
                        <div className="mt-1 bg-amber-50 border border-amber-200/80 rounded-md px-1.5 py-0.5 text-[10px] text-amber-800 font-semibold line-clamp-1">
                          Note: {item.notes}
                        </div>
                      )}
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item._id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                        <option value="Spam">Spam</option>
                      </select>
                      {item.assignedTo && (
                        <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[130px]" title={`Assigned: ${item.assignedTo}`}>
                          👤 {item.assignedTo.split(' ')[0]}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedEnquiry(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Status & Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleArchiveToggle(item)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.isArchived
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={item.isArchived ? 'Restore to Inbox' : 'Archive Enquiry'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeletePermanent(item._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div>
            Showing Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} enquiries)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW FULL ENQUIRY DETAILS                                        */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 font-manrope">
                  Contact Enquiry Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Badge & Metadata */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Status</span>
                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${getStatusBadge(selectedEnquiry.status)}`}>
                  {selectedEnquiry.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Submitted On</span>
                <span className="text-xs text-slate-700 font-medium">
                  {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{selectedEnquiry.name}</span>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Company / Firm</span>
                <span className="text-slate-900 font-semibold">{selectedEnquiry.company || 'Not Specified'}</span>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone Number</span>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-900 font-bold">{selectedEnquiry.phone}</span>
                  <a
                    href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, '').slice(-10)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-md inline-flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email Address</span>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-900 font-medium truncate">{selectedEnquiry.email}</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-blue-600 hover:underline font-bold text-[10px]"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Subject:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900">
                {selectedEnquiry.subject || 'General Greenfield Project Enquiry'}
              </div>
            </div>

            {/* Full Message */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Message Content:</span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Admin Notes & Assignment */}
            {(selectedEnquiry.notes || selectedEnquiry.assignedTo) && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 space-y-2 text-xs">
                {selectedEnquiry.assignedTo && (
                  <div className="flex items-center gap-2 text-blue-900">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span><strong>Assigned Desk:</strong> {selectedEnquiry.assignedTo}</span>
                  </div>
                )}
                {selectedEnquiry.notes && (
                  <div className="text-blue-950">
                    <strong>Admin Note:</strong> {selectedEnquiry.notes}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedEnquiry(null);
                  handleOpenEdit(selectedEnquiry);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Status &amp; Notes</span>
              </button>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT STATUS, NOTES & ASSIGNMENT                                  */}
      {/* ========================================================================= */}
      {editingEnquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-manrope">
                  Update Enquiry Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Managing enquiry for <strong>{editingEnquiry.name}</strong> ({editingEnquiry.phone})
                </p>
              </div>
              <button
                onClick={() => setEditingEnquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Workflow Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
                <option value="Spam">Spam</option>
              </select>
            </div>

            {/* Team Member Assignment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Assign Team Member</label>
              <select
                value={editAssignedTo}
                onChange={(e) => setEditAssignedTo(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {TEAM_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Internal Admin Notes (Only visible to admin)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Spoke with promoter. Project needs ₹ 25 Cr term loan for food processing unit. Follow-up on Thursday."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Save Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingEnquiry(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <span>Saving Updates...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactEnquiriesView;
