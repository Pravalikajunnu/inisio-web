import { createAdminNotification } from './notificationStore';
import { DetailedRiskProfileData } from '../components/DetailedRiskProfileForm';
import { CommercialSupplyFundingData } from '../components/CommercialSupplyFundingForm';
import { PromoterDetail, CustomCostComponent, CustomFinanceComponent, ProjectDocument } from '../types';

export interface EditAuditRecord {
  id: string;
  timestamp: string;
  editedBy: string;
  changes: string[];
}

export interface LeadRecord {
  id: string;
  timestamp: string;
  fullName: string;
  mobile: string;
  email: string;
  projectName: string;
  industry: string;
  location: string;
  totalCostCr: string | number;
  loanRequiredCr: string | number;
  feasibilityScore?: number;
  bankabilityRating?: string | number;
  source: string;
  downloadedPDF: boolean;
  notes?: string;
  promoterContribCr?: string | number;
  landStatus?: string;
  collateralStatus?: string;
  promoterExp?: string;
  status?: string;
  photoOrLogo?: string;
  dprFile?: { name: string; size: number; uploadedAt: string };
  cmaFile?: { name: string; size: number; uploadedAt: string };
  assignedTeam?: string;
  assignedRole?: string;
  assignedAt?: string;
  timelineDate?: string;
  timelineTime?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  editHistory?: EditAuditRecord[];
  riskProfileData?: DetailedRiskProfileData;
  commercialData?: CommercialSupplyFundingData;
  promotersList?: PromoterDetail[];
  customCostComponents?: CustomCostComponent[];
  customFinanceComponents?: CustomFinanceComponent[];
  uploadedDocuments?: ProjectDocument[];
  successProbability?: number;
  isFunded?: boolean;
  dprAssignedTo?: string;
  consultationAssignedTo?: string;
  consultationStatus?: 'In Progress' | 'Customer Declined' | 'Completed' | 'Pending';
  consultationNotes?: string;
  membershipTier?: string;
  financials?: {
    machineryCostCr?: string | number;
    civilCostCr?: string | number;
    consultancyCostCr?: string | number;
    otherCostsCr?: string | number;
    termLoanCr?: string | number;
    promoterContributionCr?: string | number;
    otherFinanceCr?: string | number;
    totalProjectCost?: string | number;
    totalMeansOfFinance?: string | number;
  };
  bankAppliedAt?: string;
  loanApprovedAt?: string;
  fundingDisbursedAt?: string;
}

const STORAGE_KEY = 'inisio_admin_leads_v1';

export function getStoredLeads(userEmail?: string): LeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let leads: LeadRecord[] = [];
    if (raw) {
      leads = JSON.parse(raw);
    }

    // If userEmail provided, filter specifically for this user's email (case-insensitive match)
    if (userEmail) {
      const emailLower = userEmail.toLowerCase().trim();
      return leads.filter(l => l.email && l.email.toLowerCase().trim() === emailLower);
    }

    return leads;
  } catch (err) {
    console.error('Failed to load leads:', err);
    return [];
  }
}

export async function fetchLeadsFromBackend(email?: string): Promise<LeadRecord[]> {
  try {
    const url = email ? `/api/leads?email=${encodeURIComponent(email)}` : '/api/leads';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        const formatted: LeadRecord[] = data.data.map((item: any) => ({
          id: item._id || item.id,
          timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
          fullName: item.fullName,
          mobile: item.mobile,
          email: item.email,
          projectName: item.projectName,
          industry: item.industry,
          location: item.location || '',
          totalCostCr: item.totalCostCr || '',
          loanRequiredCr: item.loanRequiredCr || '',
          feasibilityScore: item.feasibilityScore,
          bankabilityRating: item.bankabilityRating,
          source: item.source || 'Web Portal Submission',
          downloadedPDF: item.downloadedPDF || false,
          notes: item.notes,
          promoterContribCr: item.promoterContribCr,
          landStatus: item.landStatus,
          collateralStatus: item.collateralStatus,
          promoterExp: item.promoterExp,
          status: item.status || 'New',
          photoOrLogo: item.photoOrLogo,
          dprFile: item.dprFile,
          cmaFile: item.cmaFile,
          riskProfileData: item.riskProfileData,
          commercialData: item.commercialData,
          consultationStatus: item.consultationStatus,
          consultationAssignedTo: item.consultationAssignedTo,
          consultationNotes: item.consultationNotes
        }));
        
        if (!email) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        }
        window.dispatchEvent(new CustomEvent('inisio_lead_added'));
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Backend sync deferred to local cache:', err);
  }
  return getStoredLeads(email);
}

export async function saveLeadRecord(lead: Omit<LeadRecord, 'id' | 'timestamp'>): Promise<LeadRecord> {
  const leads = getStoredLeads();
  
  // Try sending to backend first
  let backendLead: any = null;
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (response.ok) {
      const resData = await response.json();
      if (resData && resData.data) {
        backendLead = resData.data;
      }
    }
  } catch (err) {
    console.warn('Backend synchronous create failed, falling back to client cache:', err);
  }

  const newLead: LeadRecord = {
    ...lead,
    id: backendLead?._id || backendLead?.id || `lead-${Date.now()}`,
    timestamp: backendLead?.createdAt || backendLead?.timestamp || new Date().toISOString()
  };

  // Prevent duplicate insertion if an identical ID already exists
  const existingIdx = leads.findIndex(l => l.id === newLead.id);
  const updatedLeads = existingIdx >= 0 
    ? leads.map((l, idx) => idx === existingIdx ? newLead : l)
    : [newLead, ...leads.filter(l => !(l.email?.toLowerCase() === newLead.email?.toLowerCase() && l.projectName === newLead.projectName && l.totalCostCr === newLead.totalCostCr))];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    window.dispatchEvent(new CustomEvent('inisio_lead_added', { detail: newLead }));
  } catch (err) {
    console.error('Failed to save lead record:', err);
  }

  // Trigger Admin Notification
  try {
    const isTeaser = lead.downloadedPDF || lead.source?.includes('PDF');
    createAdminNotification({
      type: isTeaser ? 'TEASER_DOWNLOAD' : 'LEAD_CREATED',
      title: isTeaser ? 'Project Teaser Downloaded' : 'New Greenfield Project Inquiry',
      message: `${lead.fullName || 'Promoter'} (${lead.email || lead.mobile}) ${isTeaser ? 'downloaded Executive Teaser PDF for' : 'submitted project'} '${lead.projectName}' (₹${lead.totalCostCr} Cr).`,
      userEmail: lead.email,
      userName: lead.fullName,
      projectName: lead.projectName,
      metadata: {
        totalCostCr: lead.totalCostCr,
        loanRequiredCr: lead.loanRequiredCr,
        industry: lead.industry,
        source: lead.source
      }
    });
  } catch (err) {
    console.error('Failed to trigger admin notification:', err);
  }

  return newLead;
}

export function updateLeadRecord(id: string, updates: Partial<LeadRecord>, editedBy = 'Promoter'): LeadRecord | null {
  const leads = getStoredLeads();
  let updatedRecord: LeadRecord | null = null;
  let changes: string[] = [];

  const updatedLeads = leads.map(l => {
    if (l.id === id) {
      Object.keys(updates).forEach((key) => {
        const k = key as keyof LeadRecord;
        if (updates[k] !== undefined && updates[k] !== l[k] && typeof updates[k] !== 'object' && k !== 'lastEditedBy' && k !== 'lastEditedAt') {
          changes.push(`${k} changed from '${l[k] || 'none'}' to '${updates[k]}'`);
        }
      });

      const newHistoryRecord: EditAuditRecord = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
        timestamp: new Date().toISOString(),
        editedBy,
        changes
      };

      const editHistory = l.editHistory ? [...l.editHistory] : [];
      if (changes.length > 0) {
        editHistory.unshift(newHistoryRecord);
      }

      updatedRecord = {
        ...l,
        ...updates,
        lastEditedBy: editedBy,
        lastEditedAt: new Date().toISOString(),
        editHistory
      };
      return updatedRecord;
    }
    return l;
  });

  if (updatedRecord) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    window.dispatchEvent(new CustomEvent('inisio_lead_added', { detail: { ...updatedRecord, localUpdate: true } }));

    // Notify admin about this update
    if (changes.length > 0) {
      try {
        createAdminNotification({
          type: 'PROJECT_MODIFIED',
          title: `Project '${(updatedRecord as LeadRecord).projectName}' Modified`,
          message: `${editedBy} updated: ${changes.join(', ')}.`,
          userEmail: (updatedRecord as LeadRecord).email,
          userName: (updatedRecord as LeadRecord).fullName,
          projectName: (updatedRecord as LeadRecord).projectName,
          metadata: { changes, updates }
        });
      } catch (e) {}
    }
  }

  // Synchronously send updates to backend endpoint
  if (id) {
    fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(async res => {
      if (res.ok) {
        const resJson = await res.json().catch(() => ({}));
        if (resJson && resJson.data) {
          window.dispatchEvent(new CustomEvent('inisio_lead_added', { detail: resJson.data }));
        }
      }
    }).catch((err) => console.warn('Backend update sync error:', err));
  }

  return updatedRecord;
}

export function deleteLeadRecord(id: string): void {
  const leads = getStoredLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('inisio_lead_added', { detail: { deletedId: id } }));

  if (id) {
    fetch(`/api/leads/${id}`, { method: 'DELETE' }).then(() => {
      window.dispatchEvent(new CustomEvent('inisio_lead_added'));
    }).catch(() => {});
  }
}

export function clearAllLeads(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));

  fetch('/api/leads/clear-all', { method: 'DELETE' }).then(() => {
    window.dispatchEvent(new CustomEvent('inisio_lead_added'));
  }).catch(() => {});
}

export function exportLeadsToCSV(): void {
  const leads = getStoredLeads();
  if (leads.length === 0) {
    alert('No lead records to export.');
    return;
  }

  const headers = ['Date & Time', 'Promoter Name', 'Mobile', 'Email', 'Project Name', 'Industry Sector', 'Location', 'Total Capex (Cr)', 'Loan Required (Cr)', 'Feasibility %', 'Bankability Rating', 'Downloaded PDF', 'Source'];
  const rows = leads.map(l => [
    new Date(l.timestamp).toLocaleString('en-IN'),
    `"${l.fullName || ''}"`,
    `"${l.mobile || ''}"`,
    `"${l.email || ''}"`,
    `"${l.projectName || ''}"`,
    `"${l.industry || ''}"`,
    `"${l.location || ''}"`,
    `"${l.totalCostCr || ''}"`,
    `"${l.loanRequiredCr || ''}"`,
    `"${l.feasibilityScore || ''}"`,
    `"${l.bankabilityRating || ''}"`,
    l.downloadedPDF ? 'Yes' : 'No',
    `"${l.source || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Inisio_Admin_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
