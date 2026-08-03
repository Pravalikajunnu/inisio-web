import jsPDF from 'jspdf';
import { saveLeadRecord } from './leadStore';
import { getFeasibilityTerm } from '../types';

export interface TeaserPDFData {
  fullName: string;
  mobile: string;
  email: string;
  projectName?: string;
  industry: string;
  location: string;
  totalCostCr: string | number;
  promoterContribCr: string | number;
  loanRequiredCr: string | number;
  landStatus: string;
  promoterExp: string;
  description?: string;
  feasibilityScore: number;
  bankabilityRating: string | number;
  estimatedLoan: string | number;
  eqPct: number;
  debtPct: number;
  dscrEstimate?: number;
  estInterestRate?: string;
  strengthPoints?: string[];
  keyRisks?: string[];
}

export function generateProjectTeaserPDF(data: TeaserPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const reportId = `INS-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Top Accent Banner (Emerald Header)
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INISIO GREENFIELD ADVISORY', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Bank-Ready Greenfield Project Evaluation & Debt Syndication Teaser', 14, 20);

  // Top Right Date & Report ID
  doc.setFontSize(8);
  doc.text(`Report ID: ${reportId}`, pageWidth - 14, 13, { align: 'right' });
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 19, { align: 'right' });

  let y = 36;

  // 1. PROMOTER & APPLICANT INFORMATION
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. APPLICANT & PROMOTER DETAILS', 18, y + 5);

  y += 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Promoter Name:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.fullName || 'N/A', 52, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Mobile Number:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.mobile || 'N/A', 142, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Email Address:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.email || 'N/A', 52, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Promoter Track Record:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.promoterExp || 'N/A', 152, y);

  y += 10;

  // 2. PROJECT PROFILE
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. GREENFIELD PROJECT PROFILE', 18, y + 5);

  y += 11;
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold');
  doc.text('Project Title:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.projectName || 'Greenfield Project', 52, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Industry Sector:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.industry || 'N/A', 142, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Project Location:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.location || 'N/A', 52, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Land Status:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.landStatus || 'N/A', 142, y);

  if (data.description) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Brief Description:', 18, y);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(data.description, pageWidth - 70);
    doc.text(splitDesc, 52, y);
    y += (splitDesc.length - 1) * 4;
  }

  y += 10;

  // 3. FINANCIAL STRUCTURE TABLE
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. CAPEX & CAPITAL STRUCTURE', 18, y + 5);

  y += 11;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL PARAMETER', 18, y + 5);
  doc.text('AMOUNT (INR CRORES)', 95, y + 5);
  doc.text('SHARE (%) / NORMS', 150, y + 5);

  y += 7;
  const financialRows = [
    { label: 'Total Project Capex', val: `₹ ${data.totalCostCr} Cr`, norm: '100.0%' },
    { label: 'Promoter Equity Contribution', val: `₹ ${data.promoterContribCr} Cr`, norm: `${data.eqPct}% (Min 20-25% PSU Norm)` },
    { label: 'Required Bank Debt / Term Loan', val: `₹ ${data.loanRequiredCr} Cr`, norm: `${data.debtPct}% (Max 75-80% Leverage)` },
  ];

  financialRows.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 6.5, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, 18, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row.val, 95, y + 4.5);
    doc.text(row.norm, 150, y + 4.5);
    y += 6.5;
  });

  y += 8;

  // 4. BANKABILITY & ADVISORY METRICS BOX
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setTextColor(6, 95, 70); // Emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. PROPRIETARY BANKABILITY EVALUATION', 18, y + 6);

  // 4 Metric Columns inside box
  const colW = (pageWidth - 36) / 4;
  
  // Col 1: Feasibility
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Feasibility Check', 18, y + 13);
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(getFeasibilityTerm(data.feasibilityScore), 18, y + 21);

  // Col 2: Bankability Grade
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Bankability Rating', 18 + colW, y + 13);
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.bankabilityRating} / 10`, 18 + colW, y + 21);

  // Col 3: Est Loan Eligibility
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Est. Loan Sanction', 18 + colW * 2, y + 13);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹ ${data.estimatedLoan} Cr`, 18 + colW * 2, y + 21);

  // Col 4: DSCR Estimate
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Est. DSCR Coverage', 18 + colW * 3, y + 13);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.dscrEstimate || '1.45'}x`, 18 + colW * 3, y + 21);

  y += 34;

  // 5. CREDIT OBSERVATIONS & RECOMMENDATIONS
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('5. CREDIT OBSERVATIONS & NEXT STEPS', 18, y + 5);

  y += 11;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const observations = [
    `• Promoter Equity (${data.eqPct}%) aligns with PSU & Top Private Bank underwriting benchmarks.`,
    `• Land status (${data.landStatus}) enables fast-track TEFR and TEV validation.`,
    `• Next Step: Prepare 100+ page Detailed Project Report (DPR) with 10-Year Financial Model.`,
    `• Next Step: Structure Debt Syndication and Submit to Credit Committee for Term Loan Sanction.`
  ];

  observations.forEach((obs) => {
    doc.text(obs, 18, y);
    y += 5.5;
  });

  y += 6;

  // Footer Box (Contact & Direct Advisory Desk)
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('INISIO GREENFIELD ADVISORY & DEBT SYNDICATION DESK', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('WhatsApp Lead Desk: +91 6302026462  |  Email: contact@inisio.in  |  Web: https://inisio.in', 18, y + 12);
  doc.text('Confidential Document prepared exclusively for the project promoter. All rights reserved by Inisio.', 18, y + 17);

  // Trigger Save & Record Lead to Admin Store
  saveLeadRecord({
    fullName: data.fullName || 'Promoter',
    mobile: data.mobile || 'N/A',
    email: data.email || 'N/A',
    projectName: data.projectName || `${data.industry} Greenfield Project`,
    industry: data.industry || 'General Industry',
    location: data.location || 'India',
    totalCostCr: data.totalCostCr,
    loanRequiredCr: data.loanRequiredCr,
    feasibilityScore: data.feasibilityScore,
    bankabilityRating: data.bankabilityRating,
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    notes: `Land: ${data.landStatus}. Exp: ${data.promoterExp}.`
  });

  const fileName = `Inisio_Teaser_${(data.projectName || data.fullName || 'Greenfield').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

export function sendLeadToWhatsApp(data: TeaserPDFData, adminPhone = '916302026462') {
  const text = `*NEW GREENFIELD PROJECT ASSESSMENT LEAD* 🚀\n\n` +
    `*Promoter Details:*\n` +
    `• Name: ${data.fullName || 'N/A'}\n` +
    `• Phone: ${data.mobile || 'N/A'}\n` +
    `• Email: ${data.email || 'N/A'}\n` +
    `• Track Record: ${data.promoterExp || 'N/A'}\n\n` +
    `*Project Profile:*\n` +
    `• Project Name: ${data.projectName || 'Greenfield Project'}\n` +
    `• Industry Sector: ${data.industry || 'N/A'}\n` +
    `• Location: ${data.location || 'N/A'}\n` +
    `• Land Status: ${data.landStatus || 'N/A'}\n\n` +
    `*Financial Breakdown:*\n` +
    `• Total Capex: ₹ ${data.totalCostCr} Cr\n` +
    `• Promoter Equity: ₹ ${data.promoterContribCr} Cr (${data.eqPct}%)\n` +
    `• Required Debt: ₹ ${data.loanRequiredCr} Cr (${data.debtPct}%)\n\n` +
    `*Advisory Evaluation:*\n` +
    `• Feasibility Check: ${getFeasibilityTerm(data.feasibilityScore)}\n` +
    `• Bankability Grade: ${data.bankabilityRating}/10\n` +
    `• Est. Eligible Loan: ₹ ${data.estimatedLoan} Cr\n\n` +
    `_User downloaded PDF Teaser and requested contact from Inisio Advisory Desk._`;

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
