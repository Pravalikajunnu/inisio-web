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
  category: 'Assessment' | 'Loan Process' | 'DPR' | 'Feasibility';
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

export type UserRole = 'user' | 'admin' | 'ca';

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  company?: string;
  phone?: string;
  token?: string;
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
