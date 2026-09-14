import { createAdminNotification } from './notificationStore';
import { DetailedRiskProfileData } from '../components/DetailedRiskProfileForm';
import { CommercialSupplyFundingData } from '../components/CommercialSupplyFundingForm';
import { PromoterDetail, CustomCostComponent, CustomFinanceComponent, ProjectDocument } from '../types';
import { resolveApiUrl } from './apiClient';

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
  dscrEstimate?: number;
  source: string;
  downloadedPDF: boolean;
  assessmentCompleted?: boolean;
  notes?: string;
  promoterContribCr?: string | number;
  landStatus?: string;
  collateralStatus?: string;
  promoterExp?: string;
  status?: string;
  photoOrLogo?: string;
  dprFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string };
  cmaFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string };
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
const MAX_INLINE_DOC_BYTES = 900 * 1024;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('inisio_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sanitizeDocumentPayload = <T>(value: T): T => {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map(item => sanitizeDocumentPayload(item)) as unknown as T;
  }

  const clone = { ...value } as any;

  if (typeof clone.dataUrl === 'string' && clone.dataUrl.length > MAX_INLINE_DOC_BYTES) {
    delete clone.dataUrl;
  }

  if (typeof clone.fileUrl === 'string' && clone.fileUrl.length > MAX_INLINE_DOC_BYTES) {
    delete clone.fileUrl;
  }

  if (Array.isArray(clone.uploadedDocuments)) {
    clone.uploadedDocuments = clone.uploadedDocuments.map((doc: any) => sanitizeDocumentPayload(doc));
  }

  if (clone.dprFile && typeof clone.dprFile === 'object') {
    clone.dprFile = sanitizeDocumentPayload(clone.dprFile);
  }

  if (clone.cmaFile && typeof clone.cmaFile === 'object') {
    clone.cmaFile = sanitizeDocumentPayload(clone.cmaFile);
  }

  return clone;
};

const normalizeLead = (lead: Partial<LeadRecord>): LeadRecord => ({
  ...lead,
  id: String(lead.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
  timestamp: String(lead.timestamp || new Date().toISOString()),
  fullName: String(lead.fullName || ''),
  mobile: String(lead.mobile || ''),
  email: String(lead.email || ''),
  projectName: String(lead.projectName || ''),
  industry: String(lead.industry || ''),
  location: String(lead.location || ''),
  totalCostCr: lead.totalCostCr ?? '',
  loanRequiredCr: lead.loanRequiredCr ?? '',
  source: String(lead.source || 'Web Portal Submission'),
  downloadedPDF: Boolean(lead.downloadedPDF),
  editHistory: Array.isArray(lead.editHistory) ? lead.editHistory : [],
  promotersList: Array.isArray(lead.promotersList) ? lead.promotersList : [],
  customCostComponents: Array.isArray(lead.customCostComponents) ? lead.customCostComponents : [],
  customFinanceComponents: Array.isArray(lead.customFinanceComponents) ? lead.customFinanceComponents : [],
    uploadedDocuments: Array.isArray(lead.uploadedDocuments) ? sanitizeDocumentPayload(lead.uploadedDocuments) : [],
});

export function getStoredLeads(userEmail?: string): LeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let leads: LeadRecord[] = [];
    if (raw) {
      leads = JSON.parse(raw).map(normalizeLead);
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
    const localMatches = getStoredLeads(email);
    const url = email ? `/api/leads?email=${encodeURIComponent(email)}` : '/api/leads';
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        const formatted: LeadRecord[] = data.data.map((item: any) => normalizeLead({
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
          promoterContribCr: item.promoterContribCr,
          feasibilityScore: item.feasibilityScore,
          bankabilityRating: item.bankabilityRating,
          dscrEstimate: Number(item.dscrEstimate) || 0,
          source: item.source || 'Web Portal Submission',
          downloadedPDF: item.downloadedPDF || false,
          assessmentCompleted: Boolean(item.assessmentCompleted),
          notes: item.notes,
          landStatus: item.landStatus,
          collateralStatus: item.collateralStatus,
          promoterExp: item.promoterExp,
          status: item.status || 'New',
          photoOrLogo: item.photoOrLogo,
          dprFile: item.dprFile,
          cmaFile: item.cmaFile,
          assignedTeam: item.assignedTeam,
          assignedRole: item.assignedRole,
          assignedAt: item.assignedAt,
          timelineDate: item.timelineDate,
          timelineTime: item.timelineTime,
          lastEditedBy: item.lastEditedBy,
          lastEditedAt: item.lastEditedAt,
          editHistory: item.editHistory || [],
          riskProfileData: item.riskProfileData,
          commercialData: item.commercialData,
          promotersList: item.promotersList || [],
          customCostComponents: item.customCostComponents || [],
          customFinanceComponents: item.customFinanceComponents || [],
          uploadedDocuments: (item.uploadedDocuments || []).map((document: any) => ({
            ...document,
            id: document.id || document._id,
            fileUrl: document.fileUrl || (document._id ? resolveApiUrl(`/documents/${document._id}/download`) : undefined)
          })),
          successProbability: item.successProbability,
          isFunded: item.isFunded,
          dprAssignedTo: item.dprAssignedTo,
          consultationAssignedTo: item.consultationAssignedTo,
          consultationStatus: item.consultationStatus,
          consultationNotes: item.consultationNotes,
          membershipTier: item.membershipTier,
          financials: item.financials || {},
          bankAppliedAt: item.bankAppliedAt,
          loanApprovedAt: item.loanApprovedAt,
          fundingDisbursedAt: item.fundingDisbursedAt
        }));

        const merged = [...formatted];
        localMatches.forEach((localLead) => {
          const matchingIndex = merged.findIndex((item) => String(item.id) === String(localLead.id) || (
            item.email && localLead.email && item.email.toLowerCase() === localLead.email.toLowerCase() && item.projectName && localLead.projectName && item.projectName.toLowerCase() === localLead.projectName.toLowerCase()
          ));
          if (matchingIndex < 0) {
            merged.push(localLead);
            return;
          }

          const backendLead = merged[matchingIndex];
          const mergeDocument = <T extends { dataUrl?: string; fileUrl?: string; storageKey?: string }>(backendDocument?: T, localDocument?: T) => {
            if (!backendDocument && !localDocument) return undefined;
            return {
              ...localDocument,
              ...backendDocument,
              dataUrl: backendDocument?.dataUrl || localDocument?.dataUrl,
              fileUrl: backendDocument?.fileUrl || localDocument?.fileUrl,
              storageKey: backendDocument?.storageKey || localDocument?.storageKey
            } as T;
          };
          merged[matchingIndex] = {
            ...backendLead,
            dprFile: mergeDocument(backendLead.dprFile, localLead.dprFile),
            cmaFile: mergeDocument(backendLead.cmaFile, localLead.cmaFile),
            uploadedDocuments: [...(backendLead.uploadedDocuments || []), ...(localLead.uploadedDocuments || [])]
              .reduce((documents: any[], document: any) => {
                const existing = documents.findIndex(item => item.id === document.id || item.name === document.name);
                if (existing < 0) documents.push(document);
                else documents[existing] = mergeDocument(documents[existing], document);
                return documents;
              }, [])
          };
        });

        if (!email) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }

        if (merged.length > 0) return merged;
      }
    }
  } catch (err) {
    console.warn('Backend sync deferred to local cache:', err);
  }
  return [];
}

export async function saveLeadRecord(lead: Omit<LeadRecord, 'id' | 'timestamp'>): Promise<LeadRecord> {
  const leads = getStoredLeads();
  
  // Try sending to backend first
  let backendLead: any = null;
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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

  // Prevent duplicate insertion if an identical ID or identical user + project name already exists
  const isSameProject = (a: LeadRecord, b: LeadRecord) => {
    if (a.id && b.id && a.id === b.id) return true;
    const aEmail = (a.email || '').trim().toLowerCase();
    const bEmail = (b.email || '').trim().toLowerCase();
    const aName = (a.projectName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const bName = (b.projectName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return Boolean(aEmail && bEmail && aEmail === bEmail && aName && bName && aName === bName);
  };

  const existingIdx = leads.findIndex(l => isSameProject(l, newLead));
  const updatedLeads = existingIdx >= 0 
    ? leads.map((l, idx) => idx === existingIdx ? { ...l, ...newLead, id: l.id || newLead.id } : l)
    : [newLead, ...leads.filter(l => !isSameProject(l, newLead))];

  try {
    const safeLeads = sanitizeDocumentPayload(updatedLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLeads));
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
    const safeLeads = sanitizeDocumentPayload(updatedLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLeads));
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
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
    fetch(`/api/leads/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(() => {
      window.dispatchEvent(new CustomEvent('inisio_lead_added'));
    }).catch(() => {});
  }
}

export function clearAllLeads(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));

  fetch('/api/leads/clear-all', { method: 'DELETE', headers: getAuthHeaders() }).then(() => {
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
