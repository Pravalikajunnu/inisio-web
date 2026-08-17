import { createAdminNotification } from './notificationStore';

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
}

const STORAGE_KEY = 'inisio_admin_leads_v1';

// Initial leads pre-loaded with projects including user's downloaded teasers
const INITIAL_LEADS: LeadRecord[] = [
  {
    id: 'lead-kanu-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    fullName: 'Suraj Kanu',
    mobile: '9848012345',
    email: 'kanusuraj15@gmail.com',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    industry: 'Renewable Energy & Solar',
    location: 'Gujarat (Dholera SIR)',
    totalCostCr: '120',
    loanRequiredCr: '90',
    promoterContribCr: '30',
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'TSIIC / Industrial Park Allotted',
    collateralStatus: 'Plant & Machinery Hypothecation',
    promoterExp: '12+ Years Manufacturing',
    notes: 'Downloaded Teaser PDF. Land acquired in Dholera SIR. Target SBI & Canara Bank consortium.',
    status: 'DPR Ready'
  },
  {
    id: 'lead-kanu-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    fullName: 'Suraj Kanu',
    mobile: '9848012345',
    email: 'kanusuraj15@gmail.com',
    projectName: 'Bio-Pharma Formulation Plant',
    industry: 'Pharmaceuticals & Life Sciences',
    location: 'Telangana (Genome Valley)',
    totalCostCr: '18.5',
    loanRequiredCr: '13.8',
    promoterContribCr: '4.7',
    feasibilityScore: 88,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Industrial Lease Signed',
    collateralStatus: 'Factory Premises & Fixed Assets',
    promoterExp: '10+ Years Pharma R&D',
    notes: 'Downloaded Teaser PDF. USFDA compliant formulation facility in Genome Valley.',
    status: 'In Appraisal'
  },
  {
    id: 'lead-100',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    fullName: 'Pravalika junnu',
    mobile: '6302026462',
    email: 'pravalikajunnu14@gmail.com',
    projectName: 'Hotel Greenfield Resort & Convention',
    industry: 'Hospitality & Commercial',
    location: 'Hyderabad, Telangana',
    totalCostCr: '20',
    loanRequiredCr: '10',
    promoterContribCr: '10',
    feasibilityScore: 90,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Land Owned & Registered',
    collateralStatus: 'Prime Land & Building Mortgage',
    promoterExp: '8+ Years Hospitality & Infrastructure',
    notes: 'Downloaded Teaser PDF. Interested in Debt Syndication for 50% debt component.',
    status: 'In Appraisal'
  },
  {
    id: 'lead-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    fullName: 'Rajesh Patel',
    mobile: '9825011223',
    email: 'rajesh.patel@dahejchem.com',
    projectName: 'High-Purity Chemical Refinery',
    industry: 'Specialty Chemicals',
    location: 'Gujarat (Dahej PCPIR)',
    totalCostCr: '34',
    loanRequiredCr: '25.5',
    promoterContribCr: '8.5',
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'GIDC Land Allotted',
    collateralStatus: 'Factory & Heavy Distillation Columns',
    promoterExp: '15+ Years Chemical Engineering',
    notes: 'Downloaded Teaser PDF. TEFR approved by CA desk.',
    status: 'DPR Ready'
  }
];

export function getStoredLeads(userEmail?: string): LeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let leads: LeadRecord[] = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      leads = INITIAL_LEADS;
    } else {
      leads = JSON.parse(raw);
    }

    // If userEmail provided, filter specifically for this user's email or allow case-insensitive match
    if (userEmail) {
      const emailLower = userEmail.toLowerCase().trim();
      const userLeads = leads.filter(l => l.email && l.email.toLowerCase().trim() === emailLower);
      
      // If user is kanusuraj15@gmail.com and has no leads in storage, make sure the 2 sample teasers exist
      if (userLeads.length === 0 && emailLower === 'kanusuraj15@gmail.com') {
        const kanuLeads = INITIAL_LEADS.filter(l => l.email.toLowerCase() === 'kanusuraj15@gmail.com');
        const merged = [...kanuLeads, ...leads];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return kanuLeads;
      }
      return userLeads;
    }

    return leads;
  } catch (err) {
    console.error('Failed to load leads:', err);
    return INITIAL_LEADS;
  }
}

export async function fetchLeadsFromBackend(email?: string): Promise<LeadRecord[]> {
  try {
    const url = email ? `/api/leads?email=${encodeURIComponent(email)}` : '/api/leads';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
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
          status: item.status || 'New'
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

export function saveLeadRecord(lead: Omit<LeadRecord, 'id' | 'timestamp'>): LeadRecord {
  const leads = getStoredLeads();
  
  const newLead: LeadRecord = {
    ...lead,
    id: `lead-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  const updatedLeads = [newLead, ...leads.filter(l => l.projectName !== lead.projectName || l.email !== lead.email)];
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

  // Asynchronously sync to MongoDB Atlas REST endpoint
  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  }).catch((e) => console.log('Async lead persist:', e.message));

  return newLead;
}

export function deleteLeadRecord(id: string): void {
  const leads = getStoredLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));

  if (id && !id.startsWith('lead-')) {
    fetch(`/api/leads/${id}`, { method: 'DELETE' }).catch(() => {});
  }
}

export function clearAllLeads(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));

  fetch('/api/leads/clear-all', { method: 'DELETE' }).catch(() => {});
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
