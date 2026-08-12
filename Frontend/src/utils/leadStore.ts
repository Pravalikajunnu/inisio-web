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
}

const STORAGE_KEY = 'inisio_admin_leads_v1';

// Initial dummy leads for demonstration if empty so admin dashboard looks complete on first open
const INITIAL_LEADS: LeadRecord[] = [
  {
    id: 'lead-100',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    fullName: 'Pravalika junnu',
    mobile: '6302026462',
    email: 'pravalikajunnu14@gmail.com',
    projectName: 'Hotel Greenfield Resort & Convention',
    industry: 'Data Centers & Tech Parks',
    location: 'Hyderabad, Telangana',
    totalCostCr: '20',
    loanRequiredCr: '10',
    feasibilityScore: 90,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Land Owned & Registered',
    collateralStatus: 'Prime Land & Building Mortgage',
    promoterExp: '8+ Years Hospitality & Infrastructure',
    notes: 'Downloaded Teaser PDF. Interested in Debt Syndication for 50% debt component.'
  },
  {
    id: 'lead-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    fullName: 'Rajesh Sharma',
    mobile: '9848012345',
    email: 'rajesh.sharma@solaris-ind.com',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    industry: 'Renewable Energy',
    location: 'Gujarat (Dholera SIR)',
    totalCostCr: '120',
    loanRequiredCr: '90',
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'TSIIC / Industrial Park Allotted',
    collateralStatus: 'Plant & Machinery Hypothecation',
    promoterExp: '12+ Years Manufacturing',
    notes: 'Downloaded Teaser PDF. Land acquired in Dholera.'
  },
  {
    id: 'lead-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    fullName: 'Kiran Varma',
    mobile: '9440156789',
    email: 'kiran.v@hyderabadpharma.in',
    projectName: 'API Pharma Intermediate Facility',
    industry: 'Pharmaceuticals & APIs',
    location: 'Telangana (Sultanpur)',
    totalCostCr: '65',
    loanRequiredCr: '45',
    feasibilityScore: 88,
    bankabilityRating: 'A',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Industrial Lease Signed',
    collateralStatus: 'Factory Premises & Fixed Assets',
    promoterExp: '10+ Years Pharma R&D',
    notes: 'Downloaded Teaser PDF. Land identified with TSIIC.'
  },
  {
    id: 'lead-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    fullName: 'Suresh Reddy',
    mobile: '9849098765',
    email: 'suresh@reddygranites.com',
    projectName: 'Auto Component Casting & Stamping',
    industry: 'Auto Components & EV',
    location: 'Karnataka (Hosur Border)',
    totalCostCr: '40',
    loanRequiredCr: '28',
    feasibilityScore: 81,
    bankabilityRating: 'B+',
    source: 'Contact Form Submitted',
    downloadedPDF: false,
    landStatus: 'Private Land Identified',
    collateralStatus: 'Land & Personal Guarantee',
    promoterExp: '6+ Years Auto Components',
    notes: 'Submitted contact form for TEFR valuation.'
  }
];

export function getStoredLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load leads:', err);
    return INITIAL_LEADS;
  }
}

export function saveLeadRecord(lead: Omit<LeadRecord, 'id' | 'timestamp'>): LeadRecord {
  const leads = getStoredLeads();
  
  // Check if lead with same mobile exists recently to update or prepend
  const newLead: LeadRecord = {
    ...lead,
    id: `lead-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  const updatedLeads = [newLead, ...leads];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    // Trigger window event so open admin modal updates live
    window.dispatchEvent(new CustomEvent('inisio_lead_added', { detail: newLead }));
  } catch (err) {
    console.error('Failed to save lead record:', err);
  }

  return newLead;
}

export function deleteLeadRecord(id: string): void {
  const leads = getStoredLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));
}

export function clearAllLeads(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_lead_added'));
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
