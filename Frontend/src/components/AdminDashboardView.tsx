import React, { useState, useEffect } from 'react';
import { getStoredLeads, fetchLeadsFromBackend, deleteLeadRecord, clearAllLeads, exportLeadsToCSV, updateLeadRecord, LeadRecord } from '../utils/leadStore';
import { getAdminNotifications, AdminNotification, getUnreadNotificationCount } from '../utils/notificationStore';
import { getAllRegisteredUsers, RegisteredUserRecord, updateUserStatus, exportUsersToCSV } from '../utils/userStore';
import { getVisitorSummary, VisitorSummary, getStoredVisitorLogs, VisitorLog, exportVisitorsToCSV } from '../utils/visitorStore';
import { UserProfileDetailModal } from './UserProfileDetailModal';
import { LeadEditModal } from './LeadEditModal';
import { AdminNotificationModal } from './AdminNotificationModal';
import { AuthUser } from '../types';
import api from '../utils/apiClient';
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
  Plus,
  Globe,
  Smartphone,
  Laptop,
  Radio,
  ExternalLink,
  Lock,
  UserPlus,
  IndianRupee,
  PhoneCall,
  Calendar,
  Mail
} from 'lucide-react';

interface AdminDashboardViewProps {
  user: AuthUser;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUserRecord[]>([]);
  const [visitorSummary, setVisitorSummary] = useState<VisitorSummary>({
    totalVisits: 0,
    uniqueVisitors: 0,
    activeNow: 1,
    desktopPercent: 65,
    mobilePercent: 35,
    topPages: [],
    recentLogs: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'visitors' | 'edits' | 'assignments' | 'teasers' | 'promoter_funds'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  useEffect(() => {
    loadData();
    
    const handleUpdate = () => loadData();
    const handleNotifUpdate = () => setUnreadNotifs(getUnreadNotificationCount());
    const handleVisitorUpdate = () => setVisitorSummary(getVisitorSummary());
    const handleUserUpdate = () => setUsersList(getAllRegisteredUsers());

    window.addEventListener('inisio_lead_added', handleUpdate);
    window.addEventListener('inisio_admin_notification_added', handleNotifUpdate);
    window.addEventListener('inisio_visitor_logged', handleVisitorUpdate);
    window.addEventListener('inisio_user_registered_or_logged_in', handleUserUpdate);

    // Initial load
    loadData();

    return () => {
      window.removeEventListener('inisio_lead_added', handleUpdate);
      window.removeEventListener('inisio_admin_notification_added', handleNotifUpdate);
      window.removeEventListener('inisio_visitor_logged', handleVisitorUpdate);
      window.removeEventListener('inisio_user_registered_or_logged_in', handleUserUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [backendLeads, backendUsers] = await Promise.all([
        fetchLeadsFromBackend(),
        api.users.getAll()
      ]);
      setLeads(backendLeads);
      setUsersList(backendUsers.map((u: any) => ({
        id: u._id || u.id,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        company: u.company || '',
        role: u.role || 'user',
        createdAt: u.createdAt || '',
        lastLoginAt: u.lastLoginAt || '',
        loginCount: u.loginCount || 0,
        status: u.status || 'active'
      })));
    } catch (error) {
      setLeads([]);
      setUsersList([]);
      triggerToast('Unable to load live admin data.');
    }
    setVisitorSummary(getVisitorSummary());
    setUnreadNotifs(getUnreadNotificationCount());
  };

  const filteredLeads = leads.filter(l => {
    const fullName = l.fullName || '';
    const mobile = l.mobile || '';
    const email = l.email || '';
    const industry = l.industry || '';
    const projectName = l.projectName || '';
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mobile.includes(searchQuery) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectName.toLowerCase().includes(searchQuery.toLowerCase());

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

  const filteredUsers = usersList.filter(u => {
    const name = u.name || '';
    const email = u.email || '';
    const phone = u.phone || '';
    const company = u.company || '';
    const role = u.role || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalDownloads = leads.filter(l => l.downloadedPDF).length;
  const totalEdits = leads.filter(l => !!l.lastEditedBy).length;
  const unassignedCount = leads.filter(l => !l.assignedTeam).length;

  const totalCapex = leads.reduce((acc, l) => {
    const val = parseFloat(String(l.totalCostCr || 0));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const promoterFundLeads = leads.filter(l => 
    (l.promoterFundAssistanceStatus && l.promoterFundAssistanceStatus !== 'Not Requested') ||
    l.promoterContributionAvailable === 'No' ||
    Boolean(l.promoterFundAssistanceRequest)
  );

  const consultationLeads = leads.filter(l => 
    l.source?.toLowerCase().includes('consultation') ||
    l.source?.toLowerCase().includes('advisory') ||
    Boolean(l.consultationAssignedTo) ||
    Boolean(l.consultationStatus) ||
    l.source === 'Advisory Call Booked' ||
    l.source === 'Free Consultation Booked' ||
    l.source === 'Contact Form Submitted'
  );

  const handleUpdateFundStatus = (leadId: string, newStatus: any) => {
    updateLeadRecord(leadId, {
      promoterFundAssistanceStatus: newStatus
    }, user.name || user.email || 'Admin');
    triggerToast(`Updated fund assistance status to "${newStatus}"`);
    loadData();
  };

  const handleUpdateConsultation = (leadId: string, updates: { consultationStatus?: any; consultationAssignedTo?: string; notes?: string }) => {
    updateLeadRecord(leadId, updates, user.name || user.email || 'Admin');
    triggerToast('Updated consultation booking status!');
    loadData();
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-inter antialiased">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-500 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Ultra-Minimalist Role Feature Banner */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          {user.role === 'superadmin' ? (
            <span className="text-slate-700"><strong>Super Admin (Viewer Only):</strong> You have comprehensive read-only access across all Project Pipelines, User Profiles, and Live Traffic Analytics. Editing and modifications are restricted to Admin accounts.</span>
          ) : user.role === 'admin' || user.role === 'admin3' ? (
            <span className="text-slate-700"><strong>Admin Desk (Full Authority):</strong> You have full administrative control to edit projects, assign advisory teams, update KYC statuses, and manage records.</span>
          ) : user.role === 'admin2' ? (
            <span className="text-slate-700"><strong>Admin (Editor):</strong> You can view and edit project details, manage lead assignments, and inspect user activity.</span>
          ) : (
            <span className="text-slate-700"><strong>Admin (Viewer):</strong> You can view all project submissions, user profiles, and visitor analytics without modification rights.</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ---------------------------------------------------- */}
        {/* 1. TOP MINIMALIST HEADER & NAVBAR                    */}
        {/* ---------------------------------------------------- */}
        <div className="border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Executive Admin Desk</span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs text-zinc-500 font-medium">{user.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                Project Pipelines, Users &amp; Live Traffic Control
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time tracking of greenfield project assessments, authenticated user accounts, and website visitor traffic.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              {user.role !== 'admin1' && (
                <button
                  onClick={() => {
                    if (activeTab === 'users') {
                      const list = filteredUsers.length > 0 ? filteredUsers : usersList;
                      exportUsersToCSV(list, leads);
                      triggerToast(`Exported ${list.length} user records to CSV!`);
                    } else if (activeTab === 'visitors') {
                      const logs = visitorSummary.recentLogs && visitorSummary.recentLogs.length > 0
                        ? visitorSummary.recentLogs
                        : getStoredVisitorLogs();
                      exportVisitorsToCSV(logs);
                      triggerToast(`Exported ${logs.length} visitor traffic records to CSV!`);
                    } else if (activeTab === 'consultations') {
                      exportLeadsToCSV(consultationLeads);
                      triggerToast(`Exported ${consultationLeads.length} consultation records to CSV!`);
                    } else {
                      const list = filteredLeads.length > 0 ? filteredLeads : leads;
                      exportLeadsToCSV(list);
                      triggerToast(`Exported ${list.length} project pipelines to CSV!`);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={`Export ${activeTab === 'users' ? 'Users' : activeTab === 'visitors' ? 'Visitors' : 'Projects'} to CSV`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'users' ? 'Export Users CSV' : activeTab === 'visitors' ? 'Export Visitors CSV' : 'Export CSV'}
                  </span>
                </button>
              )}
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
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>{leads.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users &amp; Logins</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'users' ? 'bg-zinc-700 text-white' : 'bg-blue-100 text-blue-800'}`}>{usersList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'visitors' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Website Visitors</span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {visitorSummary.activeNow} Live
              </span>
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
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assignments</span>
              {unassignedCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'assignments' ? 'bg-amber-500 text-amber-950' : 'bg-amber-100 text-amber-700'}`}>{unassignedCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('promoter_funds')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'promoter_funds' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Promoter Fund Requests</span>
              {promoterFundLeads.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === 'promoter_funds' ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-100 text-emerald-800'}`}>
                  {promoterFundLeads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'consultations' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Free Consultations</span>
              {consultationLeads.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === 'consultations' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}>
                  {consultationLeads.length}
                </span>
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
        {/* 2. KEY METRICS STRIP (4-Pillar Overview)             */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Total Captured Projects</span>
            <div className="text-xl font-bold text-zinc-900">{leads.length}</div>
            <span className="text-[11px] text-blue-700 font-medium">Active Greenfield Pipelines</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Registered Accounts</span>
            <div className="text-xl font-bold text-indigo-600">{usersList.length}</div>
            <span className="text-[11px] text-zinc-500 font-medium">Promoters, CAs &amp; Admins</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Website Visitor Traffic</span>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <span>{visitorSummary.totalVisits}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                {visitorSummary.activeNow} online
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Real-time telemetry</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Evaluated Capex Outlay</span>
            <div className="text-xl font-bold text-zinc-900">₹ {totalCapex.toFixed(1)} Cr</div>
            <span className="text-[11px] text-zinc-500 font-medium">Cumulative Pipeline Value</span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. TAB SPECIFIC MAIN VIEWS                           */}
        {/* ---------------------------------------------------- */}

        {/* VIEW A: USERS & LOGINS VIEW */}
        {activeTab === 'users' && (
          <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Authenticated Users &amp; Login History</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  All signed-up promoters, chartered accountants, and admin accounts with their login frequency and linked projects.
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, phone..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">User &amp; Organization</th>
                    <th className="py-2.5 px-3">Contact Details</th>
                    <th className="py-2.5 px-3">Role &amp; Privilege</th>
                    <th className="py-2.5 px-3">Last Active Login</th>
                    <th className="py-2.5 px-3">Login Count</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs">
                        No registered users match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const lastLoginFormatted = new Date(u.lastLoginAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const userProjects = leads.filter(l => (l.email || '').toLowerCase() === (u.email || '').toLowerCase());

                      return (
                        <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-zinc-900">{u.name}</div>
                            <div className="text-[11px] text-zinc-500">{u.company || 'Greenfield Enterprise'}</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-blue-700">{u.email}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{u.phone || 'N/A'}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role.startsWith('admin')
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.role === 'ca'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {u.role}
                            </span>
                            {userProjects.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {userProjects.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => setSelectedLead(p)}
                                    className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                                    title="View & Edit Project"
                                  >
                                    <Building2 className="w-2.5 h-2.5" />
                                    <span className="truncate max-w-[120px]">{p.projectName || 'Project'}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-medium text-zinc-800">{lastLoginFormatted}</div>
                            <div className="text-[10px] text-zinc-400">Created: {new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-zinc-900">{u.loginCount || 1}</span>
                            <span className="text-zinc-400 text-[11px] ml-1">sessions</span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW B: WEBSITE VISITORS & TRAFFIC ANALYTICS VIEW */}
        {activeTab === 'visitors' && (
          <div className="space-y-5">
            {/* Real-Time Traffic Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Live Active Sessions</span>
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-Time</span>
                  </span>
                </div>
                <div className="text-3xl font-black text-zinc-900">{visitorSummary.activeNow}</div>
                <p className="text-xs text-zinc-500">Active promoter and advisor browser sessions right now.</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Device Distribution</span>
                <div className="flex items-center justify-between text-sm font-bold text-zinc-800 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>Desktop: {visitorSummary.desktopPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mobile: {visitorSummary.mobilePercent}%</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: `${visitorSummary.desktopPercent}%` }} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${visitorSummary.mobilePercent}%` }} />
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Total Tracked Visits</span>
                <div className="text-3xl font-black text-blue-600">{visitorSummary.totalVisits}</div>
                <p className="text-xs text-zinc-500">{visitorSummary.uniqueVisitors} unique sessions logged across all channels.</p>
              </div>
            </div>

            {/* Top Visited Pages & Live Visitor Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Top Pages */}
              <div className="p-5 bg-white rounded-2xl border border-zinc-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Visited Modules</h3>
                <div className="space-y-2.5">
                  {visitorSummary.topPages.map((tp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800 truncate max-w-[180px]">{tp.page}</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">{tp.count} views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity Stream */}
              <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-Time Visitor Log Stream</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">Last 20 events</span>
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-zinc-400 uppercase text-[10px] border-b border-zinc-100">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Page Visited</th>
                        <th className="py-2 px-2">Device &amp; Browser</th>
                        <th className="py-2 px-2">Referrer / Channel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-zinc-600">
                      {visitorSummary.recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50/80">
                          <td className="py-2 px-2 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2 px-2 font-medium text-zinc-800">{log.page}</td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] mr-1">
                              {log.device}
                            </span>
                            <span className="text-zinc-400 text-[10px]">{log.browser}</span>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap text-blue-600 text-[11px]">{log.referrer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: PROMOTER FUND ASSISTANCE DESK VIEW */}
        {activeTab === 'promoter_funds' && (
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Fund Requests</span>
                <div className="text-2xl font-bold text-zinc-900 mt-1">{promoterFundLeads.length}</div>
                <span className="text-[11px] text-zinc-500">Promoter equity assistance</span>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">Under Review / New</span>
                <div className="text-2xl font-bold text-amber-900 mt-1">
                  {promoterFundLeads.filter(l => !l.promoterFundAssistanceStatus || l.promoterFundAssistanceStatus === 'Requested' || l.promoterFundAssistanceStatus === 'Request Submitted' || l.promoterFundAssistanceStatus === 'Under Review').length}
                </div>
                <span className="text-[11px] text-amber-700">Awaiting advisory connection</span>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">Connected / In Progress</span>
                <div className="text-2xl font-bold text-indigo-900 mt-1">
                  {promoterFundLeads.filter(l => l.promoterFundAssistanceStatus === 'Connected with Investor/Lender' || l.promoterFundAssistanceStatus === 'Contacted').length}
                </div>
                <span className="text-[11px] text-indigo-700">Investor / co-promoter talks</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Completed / Arranged</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1">
                  {promoterFundLeads.filter(l => l.promoterFundAssistanceStatus === 'Completed' || l.promoterFundAssistanceStatus === 'Assistance Provided').length}
                </div>
                <span className="text-[11px] text-emerald-700">Equity bridge structured</span>
              </div>
            </div>

            {/* Promoter Fund Table Container */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-zinc-900">Promoter Fund Assistance Requests</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {promoterFundLeads.length} Requests
                  </span>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search promoter, project, notes..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date &amp; Status</th>
                      <th className="py-2.5 px-3">Promoter &amp; Contact</th>
                      <th className="py-2.5 px-3">Project &amp; Sector</th>
                      <th className="py-2.5 px-3">Total Capex / Debt</th>
                      <th className="py-2.5 px-3">Required Promoter Fund</th>
                      <th className="py-2.5 px-3">Update Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {promoterFundLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-zinc-400">
                          <IndianRupee className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                          <p className="font-medium text-sm">No promoter fund assistance requests yet</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Requests submitted by promoters in project assessment will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      promoterFundLeads
                        .filter(l => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (l.fullName && l.fullName.toLowerCase().includes(q)) ||
                            (l.projectName && l.projectName.toLowerCase().includes(q)) ||
                            (l.mobile && l.mobile.includes(q)) ||
                            (l.promoterFundAssistanceRequest?.notes && l.promoterFundAssistanceRequest.notes.toLowerCase().includes(q))
                          );
                        })
                        .map((lead) => {
                          const req = lead.promoterFundAssistanceRequest;
                          const reqAmount = req?.requiredAmountCr || lead.promoterContribCr || '0';
                          const status = lead.promoterFundAssistanceStatus || 'Requested';

                          return (
                            <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-semibold text-zinc-800">
                                  {new Date(req?.requestedAt || lead.timestamp).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === 'Completed' || status === 'Assistance Provided'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : status === 'Connected with Investor/Lender' || status === 'Contacted'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : status === 'Under Review'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {status}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-zinc-900">{lead.fullName || 'Lead Promoter'}</div>
                                <div className="text-[11px] text-zinc-500">{lead.mobile || '—'}</div>
                                <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">{lead.email || '—'}</div>
                                {req?.preferredContactMethod && (
                                  <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                                    Pref: {req.preferredContactMethod}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-zinc-900 max-w-[180px] truncate">{lead.projectName || 'Greenfield Unit'}</div>
                                <div className="text-[11px] text-blue-600 font-medium">{lead.industry || 'Manufacturing'}</div>
                                <div className="text-[10px] text-zinc-400">{lead.location || 'India'}</div>
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-semibold text-zinc-900">₹ {lead.totalCostCr} Cr <span className="text-zinc-400 font-normal">Capex</span></div>
                                <div className="text-[11px] text-blue-600 font-medium">₹ {lead.loanRequiredCr} Cr <span className="text-zinc-400 font-normal">Loan</span></div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-emerald-700 text-sm">₹ {reqAmount} Cr</div>
                                {req?.notes && (
                                  <div className="text-[10px] text-zinc-500 mt-1 italic max-w-[200px] line-clamp-2" title={req.notes}>
                                    "{req.notes}"
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                {(user.role === 'admin' || user.role === 'admin3') ? (
                                  <select
                                    value={status}
                                    onChange={(e) => handleUpdateFundStatus(lead.id, e.target.value)}
                                    className="px-2 py-1 bg-white border border-zinc-300 rounded text-[11px] font-semibold text-zinc-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                                  >
                                    <option value="Requested">Requested</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Connected with Investor/Lender">Connected with Investor/Lender</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                ) : (
                                  <span className="text-zinc-500 text-[11px]">{status}</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                  >
                                    Dossier
                                  </button>

                                  {(user.role === 'admin' || user.role === 'admin3') && (
                                    <button
                                      onClick={() => setEditingLead(lead)}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  )}

                                  {lead.mobile && (
                                    <a
                                      href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.fullName || 'Promoter'},\n\nWe have received your Promoter Fund Assistance request for ${lead.projectName || 'your project'} (₹${reqAmount} Cr requirement). Inisio Advisory Desk is reviewing co-funding options.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                      title="Chat on WhatsApp"
                                    >
                                      <MessageSquare className="w-3 h-3 fill-current" />
                                      <span>WA</span>
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW D: PROMOTER FUND ASSISTANCE DESK VIEW */}

        {/* VIEW E: FREE 1-ON-1 BANKING CONSULTATIONS DESK */}
        {activeTab === 'consultations' && (
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Consultations</span>
                <div className="text-2xl font-bold text-blue-600 mt-1">{consultationLeads.length}</div>
                <span className="text-[11px] text-zinc-500">1-on-1 banking sessions booked</span>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">Pending / New</span>
                <div className="text-2xl font-bold text-amber-900 mt-1">
                  {consultationLeads.filter(l => !l.consultationStatus || l.consultationStatus === 'Pending' || l.consultationStatus === 'New').length}
                </div>
                <span className="text-[11px] text-amber-700">Awaiting advisor callback</span>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">In Progress</span>
                <div className="text-2xl font-bold text-indigo-900 mt-1">
                  {consultationLeads.filter(l => l.consultationStatus === 'In Progress').length}
                </div>
                <span className="text-[11px] text-indigo-700">Advisory discussions active</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Completed Sessions</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1">
                  {consultationLeads.filter(l => l.consultationStatus === 'Completed').length}
                </div>
                <span className="text-[11px] text-emerald-700">Banking advisory concluded</span>
              </div>
            </div>

            {/* Consultations Table Container */}
            <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-zinc-900">Booked Banking Consultations</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {consultationLeads.length} Bookings
                  </span>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search promoter, phone, notes..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Promoter &amp; Contact</th>
                      <th className="py-2.5 px-3">Company &amp; Sector</th>
                      <th className="py-2.5 px-3">Project Budget / Capex</th>
                      <th className="py-2.5 px-3">Promoter Requirements / Notes</th>
                      <th className="py-2.5 px-3">Assigned Advisor</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {consultationLeads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-zinc-400">
                          <PhoneCall className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                          <p className="font-medium text-sm">No consultation bookings yet</p>
                          <p className="text-xs text-zinc-400 mt-0.5">When promoters click "Book Free Consultation", submissions will appear here instantly.</p>
                        </td>
                      </tr>
                    ) : (
                      consultationLeads
                        .filter(l => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (l.fullName && l.fullName.toLowerCase().includes(q)) ||
                            (l.projectName && l.projectName.toLowerCase().includes(q)) ||
                            (l.mobile && l.mobile.includes(q)) ||
                            (l.email && l.email.toLowerCase().includes(q)) ||
                            (l.industry && l.industry.toLowerCase().includes(q)) ||
                            (l.notes && l.notes.toLowerCase().includes(q))
                          );
                        })
                        .map((lead) => {
                          const status = lead.consultationStatus || 'Pending';
                          const assigned = lead.consultationAssignedTo || 'Prosync';

                          return (
                            <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-semibold text-zinc-800">
                                  {new Date(lead.timestamp).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-[10px] text-zinc-400">
                                  {new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : status === 'In Progress'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : status === 'Customer Declined'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {status}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-zinc-900">{lead.fullName || 'Promoter'}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-medium text-zinc-700">{lead.mobile || '—'}</span>
                                  {lead.mobile && (
                                    <a
                                      href={`tel:${lead.mobile}`}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Call"
                                    >
                                      <Phone className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">{lead.email || '—'}</div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-semibold text-zinc-900 max-w-[180px] truncate">{lead.projectName || 'Greenfield Enterprise'}</div>
                                <div className="text-[11px] text-blue-600 font-medium">{lead.industry || 'General Sector'}</div>
                                <div className="text-[10px] text-zinc-400">{lead.location || 'India'}</div>
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-bold text-zinc-900 text-sm">
                                  {lead.totalCostCr ? `₹ ${lead.totalCostCr} Cr` : '—'}
                                </div>
                                <span className="text-[10px] text-zinc-400">Estimated Capex</span>
                              </td>

                              <td className="py-3 px-3">
                                {lead.notes ? (
                                  <div className="text-xs text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100 max-w-[220px] line-clamp-3" title={lead.notes}>
                                    "{lead.notes}"
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 text-[11px] italic">No specific notes provided</span>
                                )}
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                {(user.role === 'admin' || user.role === 'admin3') ? (
                                  <select
                                    value={assigned}
                                    onChange={(e) => handleUpdateConsultation(lead.id, { consultationAssignedTo: e.target.value })}
                                    className="px-2 py-1 bg-white border border-zinc-300 rounded text-[11px] font-semibold text-zinc-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                                  >
                                    <option value="Prosync">Prosync Desk</option>
                                    <option value="Inisio Banking Desk">Inisio Banking Desk</option>
                                    <option value="Senior Ex-Banker">Senior Ex-Banker</option>
                                    <option value="CA Partner">CA Partner</option>
                                  </select>
                                ) : (
                                  <span className="text-zinc-700 font-medium text-[11px]">{assigned}</span>
                                )}
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                {(user.role === 'admin' || user.role === 'admin3') ? (
                                  <select
                                    value={status}
                                    onChange={(e) => handleUpdateConsultation(lead.id, { consultationStatus: e.target.value as any })}
                                    className="px-2 py-1 bg-white border border-zinc-300 rounded text-[11px] font-semibold text-zinc-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Customer Declined">Customer Declined</option>
                                  </select>
                                ) : (
                                  <span className="text-zinc-700 text-[11px]">{status}</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                  >
                                    Dossier
                                  </button>

                                  {(user.role === 'admin' || user.role === 'admin3') && (
                                    <button
                                      onClick={() => setEditingLead(lead)}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  )}

                                  {lead.mobile && (
                                    <a
                                      href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.fullName || 'Promoter'},\n\nThank you for booking a Free Banking Consultation with Inisio Advisory regarding ${lead.projectName || 'your greenfield project'}. Our senior team is ready to connect.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                      title="Chat on WhatsApp"
                                    >
                                      <MessageSquare className="w-3 h-3 fill-current" />
                                      <span>WA</span>
                                    </a>
                                  )}

                                  {(user.role === 'admin' || user.role === 'admin3') && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete consultation booking for ${lead.fullName || 'this lead'}?`)) {
                                          deleteLeadRecord(lead.id);
                                          triggerToast('Consultation booking deleted.');
                                          loadData();
                                        }
                                      }}
                                      className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW F: PROMOTER PROJECTS & LEADS TABLE (When on 'all', 'edits', 'assignments', 'teasers') */}
        {activeTab !== 'users' && activeTab !== 'visitors' && activeTab !== 'promoter_funds' && activeTab !== 'consultations' && (
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

                              <button
                                onClick={() => setEditingLead(lead)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                                  user.role === 'superadmin' || user.role === 'admin1'
                                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/50'
                                }`}
                                title={user.role === 'superadmin' || user.role === 'admin1' ? 'View Project Details' : 'Edit Project Details'}
                              >
                                {user.role === 'superadmin' || user.role === 'admin1' ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    <span>Specs</span>
                                  </>
                                ) : (
                                  <>
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </>
                                )}
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

                              {(user.role === 'admin' || user.role === 'admin3') && (
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
                              )}
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
              {(user.role === 'admin' || user.role === 'admin3') && (
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
              )}
            </div>

          </div>
        )}

      </div>

      {/* User Profile Detail Modal */}
      <UserProfileDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        readOnly={user.role === 'superadmin' || user.role === 'admin1'}
        onEdit={(leadToEdit) => {
          setSelectedLead(null);
          setEditingLead(leadToEdit);
        }}
        onDelete={(user.role === 'admin' || user.role === 'admin3') ? (id) => {
          deleteLeadRecord(id);
          loadData();
          triggerToast('Deleted lead record.');
        } : undefined}
      />

      <LeadEditModal
        lead={editingLead}
        user={user}
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSaved={() => {
          loadData();
          triggerToast('Project details successfully updated.');
        }}
      />

      <AdminNotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};

