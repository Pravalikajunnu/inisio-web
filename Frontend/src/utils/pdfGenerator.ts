import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { getFeasibilityTerm } from '../types';
import { DetailedRiskProfileData } from '../components/DetailedRiskProfileForm';
import { reconcileProjectFinancials } from './financialUtils';

export interface TeaserPDFData {
  // Step 1 Feasibility Inputs
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
  collateralStatus?: string;
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
  directors?: Array<{ name: string; title: string }>;

  // Step 2 Bankability Underwriting Inputs
  riskProfileData?: DetailedRiskProfileData;
  riskScoreOutOf10?: number;

  // Step 3 Suppliers, Buyers & Funding Facilities Inputs
  rawMaterialSource?: string;
  procurementRadiusKm?: string;
  keySuppliersList?: string;
  primaryBuyersType?: string;
  offTakeAgreementStatus?: string;
  keyBuyersList?: string;
  targetBankCategory?: string;
  fundingFacilityTypes?: string[];
  moratoriumPeriodMonths?: string;
  repaymentTenureYears?: string;
  machineryCostCr?: string | number;
  civilCostCr?: string | number;
  consultancyCostCr?: string | number;
  otherCostsCr?: string | number;
  termLoanCr?: string | number;
  promoterContributionCr?: string | number;
  otherFinanceCr?: string | number;
  gstNumber?: string;
  panNumber?: string;

  // Legacy string helper fields
  suppliersInfo?: string;
  buyersInfo?: string;
}

const triggerBlobDownload = (blobUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const triggerBlobPreview = (blobUrl: string, fileName: string) => {
  const previewWin = window.open('', '_blank');
  if (previewWin) {
    previewWin.opener = null;
    previewWin.location.href = blobUrl;
    return;
  }

  triggerBlobDownload(blobUrl, fileName);
};

export function generateProjectTeaserPDF(data: TeaserPDFData, action: 'download' | 'preview' = 'download') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 22;
  const maxY = pageHeight - bottomMargin;
  const generatedAt = new Date();
  const generatedDate = generatedAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const generatedTime = generatedAt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  let y = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = 20;
    }
  };

  const fin = reconcileProjectFinancials({
    totalCostCr: data.totalCostCr,
    loanRequiredCr: data.loanRequiredCr,
    promoterContribCr: data.promoterContribCr,
    debtPct: data.debtPct,
    eqPct: data.eqPct,
    consultancyCostCr: data.consultancyCostCr,
    machineryCostCr: data.machineryCostCr,
    civilCostCr: data.civilCostCr,
    otherCostsCr: data.otherCostsCr,
    termLoanCr: data.termLoanCr,
    promoterContributionCr: data.promoterContributionCr,
    otherFinanceCr: data.otherFinanceCr
  });

  const costCrFormatted = fin.totalCostFormatted;
  const loanCrFormatted = fin.termLoanFormatted;
  const contribCrFormatted = fin.promoterContributionFormatted;

  const machineryCr = fin.machineryFormatted;
  const civilCr = fin.civilFormatted;
  const consultancyCr = fin.consultancyFormatted;
  const otherCostsCr = fin.otherCostsFormatted;
  
  const userTermLoanCr = fin.termLoanFormatted;
  const userPromoterCr = fin.promoterContributionFormatted;
  const userOtherFinCr = fin.otherFinanceFormatted;

  const companyLegalName = (data.projectName || 'GREENFIELD PROJECT PRIVATE LIMITED').toUpperCase();
  const rp = data.riskProfileData;

  // Section Banner Helper (Dark Slate Header like Sample Teaser)
  const drawSectionBanner = (title: string, neededHeightAfter: number = 20) => {
    checkPageBreak(10 + neededHeightAfter);
    doc.setFillColor(15, 23, 42); // #0F172A Slate-900
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title, margin + 4, y + 4.8);
    y += 11;
  };

  // Footer Helper
  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated ${generatedDate}, ${generatedTime}`, margin, pageHeight - 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('INISIO', margin, pageHeight - 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Greenfield Project Advisory | Official Executive Teaser', pageWidth / 2, pageHeight - 7, { align: 'center' });
  };

  // ==================== PAGE 1 ====================
  // Branded header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(companyLegalName, margin, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Company Profile', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Official PDF | Generated ${generatedDate} at ${generatedTime}`, pageWidth - margin, y, { align: 'right' });

  y += 9;

  // General Information
  drawSectionBanner('General Information', 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const genP1 = `${companyLegalName} is engaged in the proposed greenfield establishment and operation of facilities in the ${data.industry} sector. The project is situated at ${data.location || 'India'}. It is promoted by ${data.fullName || 'the promoter'} and managed by an experienced management team.`;
  const splitP1 = doc.splitTextToSize(genP1, contentWidth);
  doc.text(splitP1, margin, y);
  y += splitP1.length * 4.2 + 3;

  const descText = data.description ? `${data.description}. ` : '';
  const genP2 = `The company proposes to establish a state-of-the-art facility with an estimated total capital outlay of Rs ${costCrFormatted} Crores. ${descText}To ensure an uninterrupted operation and supply of raw materials, suitable land has been identified and arranged under ${data.landStatus} status (${data.collateralStatus || 'Freehold Clear Title'}), which is adequate for the proposed plant, storage facilities, and operational requirements.`;
  const splitP2 = doc.splitTextToSize(genP2, contentWidth);
  checkPageBreak(splitP2.length * 4.2 + 3);
  doc.text(splitP2, margin, y);
  y += splitP2.length * 4.2 + 3;

  const genP3 = `The project's technical design, engineering, DPR formulation, financial modeling, and loan syndication support are being provided by INISIO Greenfield Project Advisory, specializing in industrial project finance, TEV studies, and banking consortium structuring.`;
  const splitP3 = doc.splitTextToSize(genP3, contentWidth);
  checkPageBreak(splitP3.length * 4.2 + 6);
  doc.text(splitP3, margin, y);
  y += splitP3.length * 4.2 + 7;

  // Service Offerings
  drawSectionBanner('Service Offerings', 25);

  const serviceH = 16;
  checkPageBreak(serviceH);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, serviceH, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, serviceH, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const leftService = doc.splitTextToSize(`The Production and Supply of ${data.industry}`, contentWidth * 0.4 - 4);
  doc.text(leftService, margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const rightService = doc.splitTextToSize(`Commercial production, quality processing, and wholesale supply of primary outputs and value-added commercial derivatives.`, contentWidth * 0.6 - 6);
  doc.text(rightService, margin + contentWidth * 0.4 + 2, y + 5);

  y += serviceH + 8;

  // Directors Details Table
  drawSectionBanner('Directors Details', 30);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Name', margin + 4, y + 4.2);
  doc.text('Title', margin + 110, y + 4.2);
  y += 6;

  const directorsList = data.directors && data.directors.length > 0
    ? data.directors
    : [
        { name: data.fullName || 'Promoter', title: 'Managing Director / Key Promoter' }
      ];

  directorsList.forEach((dir, idx) => {
    checkPageBreak(6);
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(dir.name, margin + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(dir.title, margin + 110, y + 4.2);
    y += 6;
  });

  y += 8;

  // ==================== PAGE 2 ====================
  // Raw Materials & Supply Model
  drawSectionBanner('RAW MATERIALS & MARKET OFFTAKE', 40);

  const rawSource = data.rawMaterialSource || 'Direct Vendors, Authorized Distributors & Aggregators';
  const radius = data.procurementRadiusKm || 'Target Industrial Cluster';
  const customSuppliers = data.keySuppliersList ? ` Key suppliers: ${data.keySuppliersList}.` : '';

  const supText1 = `${companyLegalName} will procure essential raw materials, feedstocks, and machinery spares through ${rawSource} within the ${radius}.${customSuppliers} Long-term supply consistency will be maintained via structured vendor agreements.`;
  const splitSup1 = doc.splitTextToSize(supText1, contentWidth);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(splitSup1, margin, y);
  y += splitSup1.length * 4.2 + 3;

  const buyerType = data.primaryBuyersType || 'Industrial Off-Takers, Institutional Buyers & Commercial Wholesalers';
  const agreement = data.offTakeAgreementStatus || 'Commercial Contracts / Direct Wholesale Distribution';
  const customBuyers = data.keyBuyersList ? ` Target buyers: ${data.keyBuyersList}.` : '';

  const supText2 = `On the sales and commercialization front, the company plans to supply finished outputs and by-products primarily to ${buyerType} under ${agreement}.${customBuyers} Direct B2B and institutional supply channels will drive revenue realization.`;
  const splitSup2 = doc.splitTextToSize(supText2, contentWidth);
  checkPageBreak(splitSup2.length * 4.2 + 3);
  doc.text(splitSup2, margin, y);
  y += splitSup2.length * 4.2 + 7;

  // Project Funding Facilities
  drawSectionBanner('Project Funding Facilities', 65);

  // Subheading 1: Cost Statement
  checkPageBreak(38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Proposed Project Cost Statement', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Debt Types: Project Term Loan', margin, y);
  y += 5;

  // Table 1 Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Particulars', margin + 4, y + 4.5);
  doc.text('Amount (INR Cr)', margin + 110, y + 4.5);
  y += 6.5;

  const costRows = [
    { name: 'Consultancy & Pre-operative Expenses', amt: `Rs. ${consultancyCr} Cr` },
    { name: 'Plant & Machinery / Technology', amt: `Rs. ${machineryCr} Cr` },
    { name: 'Land Cost & Civil Works Construction', amt: `Rs. ${civilCr} Cr` },
    { name: 'Other Project Costs & Contingency', amt: `Rs. ${otherCostsCr} Cr` }
  ];

  costRows.forEach((r, idx) => {
    checkPageBreak(6.5);
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(r.name, margin + 4, y + 4.5);
    doc.text(r.amt, margin + 110, y + 4.5);
    y += 6.5;
  });

  // Total Project Cost Row
  checkPageBreak(6.5);
  doc.setFillColor(238, 242, 255); // Light Indigo/Blue Tint
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.rect(margin, y, contentWidth, 6.5, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Project Cost (CAPEX)', margin + 4, y + 4.5);
  doc.setTextColor(30, 64, 175);
  doc.text(`Rs. ${costCrFormatted} Cr`, margin + 110, y + 4.5);
  y += 11; // Clear vertical spacing before Means of Finance

  // Subheading 2: Means of Finance
  checkPageBreak(38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Means of Finance', margin, y);
  y += 5;

  // Table 2 Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6.5, 'D');
  doc.text('Funding Source', margin + 4, y + 4.5);
  doc.text('Amount (INR Cr)', margin + 85, y + 4.5);
  doc.text('Share (%)', margin + 140, y + 4.5);
  y += 6.5;

  const totalFinCr = fin.totalFinanceFormatted;
  
  const meansRows = [
    { name: 'Project Term Loan (Bank Debt)', amt: `Rs. ${userTermLoanCr} Cr`, pct: `${fin.debtPct}%` },
    { name: 'Promoter Contribution (Equity)', amt: `Rs. ${userPromoterCr} Cr`, pct: `${fin.eqPct}%` },
    { name: 'Other Sources / Quasi-Equity', amt: `Rs. ${userOtherFinCr} Cr`, pct: `${fin.otherPct}%` }
  ];

  meansRows.forEach((m, idx) => {
    checkPageBreak(6.5);
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(m.name, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(m.amt, margin + 85, y + 4.5);
    doc.text(m.pct, margin + 140, y + 4.5);
    y += 6.5;
  });

  // Total Means Row
  checkPageBreak(6.5);
  doc.setFillColor(236, 253, 245); // Emerald light tint
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.rect(margin, y, contentWidth, 6.5, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Means of Finance', margin + 4, y + 4.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`Rs. ${totalFinCr} Cr`, margin + 85, y + 4.5);
  doc.text('100%', margin + 140, y + 4.5);
  y += 11;

  // Present Requirement
  drawSectionBanner('Present Requirement', 25);

  const reqText = `The Company proposes to avail a Term Loan of Rs ${loanCrFormatted} crore to meet its capital expenditure requirements. The proposed facility will be utilised for the establishment of a ${data.industry} facility, including the procurement and installation of plant & machinery, development of civil infrastructure, and other project-related assets required for the successful implementation and commissioning of the project.`;
  const splitReq = doc.splitTextToSize(reqText, contentWidth);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(splitReq, margin, y);
  y += splitReq.length * 4.2 + 8;

  // ==================== PAGE 3 ====================
  // Primary & Collaterals
  drawSectionBanner('Primary & Collaterals', 30);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Security Type', margin + 4, y + 4.2);
  doc.text('Description / Details', margin + 55, y + 4.2);
  y += 6;

  const secRows = [
    { type: 'Primary Security', desc: 'Hypothecation on all the plant & machinery, equipment, civil structures, and other fixed assets procured/to be procured out of the Term Loan.' },
    { type: 'Collateral Security', desc: `${data.collateralStatus || 'Freehold Clear Title Land / First Charge on Immovable Assets'}` }
  ];

  secRows.forEach((row, idx) => {
    const splitDesc = doc.splitTextToSize(row.desc, contentWidth - 60);
    const rowH = Math.max(8, splitDesc.length * 4.2 + 3);
    checkPageBreak(rowH);

    const c = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(c, c, c);
    doc.rect(margin, y, contentWidth, rowH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowH, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row.type, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(splitDesc, margin + 55, y + 4.5);
    y += rowH;
  });

  y += 8;

  // Preliminary Information
  drawSectionBanner('Preliminary Information', 45);

  const prelimRows: Array<{ label: string; val: string }> = [
    { label: 'Entity Type', val: rp?.businessConstitution || 'Private Limited Company / Greenfield Entity' },
    { label: 'Project / Legal Name', val: companyLegalName },
    { label: 'Key Promoter', val: data.fullName || 'Promoter' },
    { label: 'Contact Phone', val: data.mobile || 'Confidential / On Request' },
    { label: 'Contact Email', val: data.email || 'Confidential / On Request' },
    { label: 'Operating / Track Record', val: rp?.businessVintage || `${data.promoterExp || 'Experienced'} in Industry` },
    ...(data.gstNumber ? [{ label: 'GST Number', val: data.gstNumber }] : []),
    ...(data.panNumber ? [{ label: 'PAN Number', val: data.panNumber }] : []),
    { label: 'Registered Location', val: `${data.location || 'India'}` },
    { label: 'Proposed Plant Site', val: `${data.location || 'India'} (${data.landStatus})` },
    { label: 'Feasibility Score', val: `${getFeasibilityTerm(data.feasibilityScore)} (${data.feasibilityScore}/100)` },
    { label: 'Bankability Grade', val: `${data.bankabilityRating} / 10 (Tier-1 Bankable Grade)` }
  ];

  prelimRows.forEach((item, idx) => {
    checkPageBreak(6);
    const c = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(c, c, c);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.label, margin + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.text(item.val, margin + 65, y + 4.2);
    y += 6;
  });

  // Render footers dynamically across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  const fileName = `Inisio_Teaser_${(data.projectName || data.fullName || 'Greenfield').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  if (action === 'preview') {
    const pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
    try {
      triggerBlobPreview(pdfBlobUrl, fileName);
    } catch (error) {
      console.error('Teaser preview failed:', error);
      triggerBlobDownload(pdfBlobUrl, fileName);
    }
    setTimeout(() => URL.revokeObjectURL(pdfBlobUrl), 60000);
    return;
  }

  try {
    saveAs(doc.output('blob'), fileName);
  } catch (error) {
    console.error('Native teaser download failed, using blob fallback:', error);
    const pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
    triggerBlobDownload(pdfBlobUrl, fileName);
    setTimeout(() => URL.revokeObjectURL(pdfBlobUrl), 60000);
  }
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
    `• Land Status: ${data.landStatus || 'N/A'}\n` +
    `• Collateral Status: ${data.collateralStatus || 'N/A'}\n\n` +
    `*Financial Breakdown:*\n` +
    `• Total Capex: ₹ ${data.totalCostCr} Cr\n` +
    `• Promoter Equity: ₹ ${data.promoterContribCr} Cr (${data.eqPct}%)\n` +
    `• Required Debt: ₹ ${data.loanRequiredCr} Cr (${data.debtPct}%)\n\n` +
    `*Suppliers & Buyers:*\n` +
    `• Raw Material Source: ${data.rawMaterialSource || 'N/A'}\n` +
    `• Buyers Segment: ${data.primaryBuyersType || 'N/A'}\n\n` +
    `*Advisory Evaluation:*\n` +
    `• Feasibility Check: ${getFeasibilityTerm(data.feasibilityScore)}\n` +
    `• Bankability Grade: ${data.bankabilityRating}/10\n` +
    `• Est. Eligible Loan: ₹ ${data.estimatedLoan} Cr\n\n` +
    `_User generated official Executive Project Teaser from Inisio Advisory Desk._`;

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
