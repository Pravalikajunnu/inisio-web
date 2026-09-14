export interface Industry {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
  avgLoanSize: string;
  feasibilityRate: string;
  keyFactors: string[];
  popularRegions: string[];
  overview?: string;
  projectCostRange?: string;
  fundingStructure?: string;
  dscrNorms?: string;
  roiAndPayback?: string;
  subsidiesAndSchemes?: string[];
  eligibleBanks?: string[];
  keyRisks?: string[];
  imageUrl?: string;
}

export interface Service {
  id: string;
  name: string;
  tag: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  iconName: string;
  turnaroundTime: string;
  imageUrl?: string;
}

export interface TimelineStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  keyDeliverable: string;
  badge: string;
  iconName: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  type: 'PDF Guide' | 'Excel Template' | 'Checklist' | 'Whitepaper';
  description: string;
  pagesOrSize: string;
  downloadCount: number;
  tags: string[];
  imageUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  fundingAmount: string;
  quote: string;
  rating: number;
  location: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  category: 'Assessment' | 'Funding Process' | 'DPR' | 'Feasibility';
  question: string;
  answer: string;
}

export interface AssessmentData {
  industry: string;
  projectCostCr: number;
  equityPercent: number;
  landStatus: 'owned' | 'leased' | 'identified' | 'not_started';
  collateralStatus?: string;
  promoterExpYears: number;
  locationState: string;
  dprReady: boolean;
  targetBankType: 'PSU' | 'Private' | 'NBFC' | 'Undecided';
}

export interface AssessmentResult {
  feasibilityScore: number;
  bankabilityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  maxLoanAmountCr: number;
  estInterestRate: string;
  dscrEstimate: number;
  paybackYears: number;
  keyRisks: string[];
  strengthPoints: string[];
}

export function getFeasibilityTerm(score: number | string): 'Good' | 'Average' | 'Moderate' {
  const num = typeof score === 'number' ? score : parseFloat(score as string);
  if (isNaN(num)) return 'Good';
  if (num >= 78) return 'Good';
  if (num >= 65) return 'Average';
  return 'Moderate';
}

export type UserRole = 'user' | 'ca' | 'superadmin' | 'dpr_consultant' | 'prosync_admin' | 'admin' | 'admin1' | 'admin2' | 'admin3' | 'prosync';

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  company?: string;
  phone?: string;
  token?: string;
}

export interface PromoterDetail {
  id: string;
  name: string;
  pan?: string;
  din?: string;
  experienceYears?: number | string;
  experience?: number | string;
  qualification: string;
  shareholdingPct?: number | string;
  role?: string;
  kycStatus?: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Uploaded';
  netWorthCr?: number | string;
  cibilScore?: number | string;
}

export interface CustomCostComponent {
  id: string;
  title: string;
  amountCr: number;
  category: 'Machinery' | 'Civil' | 'Consultancy' | 'Technology' | 'Contingency' | 'Working Capital' | 'Other';
}

export interface CustomFinanceComponent {
  id: string;
  title: string;
  amountCr: number;
  type: 'Term Debt' | 'Promoter Equity' | 'Subsidy / Grant' | 'Unsecured Loan' | 'Venture Debt' | 'Other';
}

export interface ProjectDocument {
  id: string;
  type: 'Company KYC' | 'Promoter KYC' | 'DPR' | 'Financial Model' | 'Other Document';
  name: string;
  size?: number | string;
  uploadedAt: string;
  fileUrl?: string;
  dataUrl?: string;
  storageKey?: string;
  status: 'Uploaded' | 'Under Review' | 'Verified';
  dpdpConsent: boolean;
}

export interface ConsultationAssignment {
  id: string;
  leadId: string;
  promoterName: string;
  email: string;
  phone: string;
  projectName: string;
  industry: string;
  projectCostCr?: number | string;
  requestedAt: string;
  assignedTo: 'Prosync' | string;
  status: 'In Progress' | 'Customer Declined' | 'Completed' | 'Pending';
  notes?: string;
  lastUpdated?: string;
}

export interface DprAssignment {
  id: string;
  leadId: string;
  promoterName: string;
  projectName: string;
  industry: string;
  projectCostCr?: number | string;
  requestedAt: string;
  assignedConsultant: 'DPR Consultant 1' | 'DPR Consultant 2' | 'DPR Consultant 3' | string;
  status: 'Assigned' | 'Drafting' | 'Review' | 'Delivered';
  notes?: string;
  checklistCaptured?: string[];
}

export interface ConsultationFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  projectCostCr: string;
  preferredDate: string;
  preferredSlot: string;
  additionalNotes: string;
}
