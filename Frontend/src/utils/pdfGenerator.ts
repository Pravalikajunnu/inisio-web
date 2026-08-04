import jsPDF from 'jspdf';
import { saveLeadRecord } from './leadStore';
import { getFeasibilityTerm } from '../types';
import { DetailedRiskProfileData } from '../components/DetailedRiskProfileForm';

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
  gstNumber?: string;
  panNumber?: string;
  riskProfileData?: DetailedRiskProfileData;
  riskScoreOutOf10?: number;
}

export function generateProjectTeaserPDF(data: TeaserPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 20;
  const maxY = pageHeight - bottomMargin;

  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = 18;
    }
  };

  const costCr = parseFloat(String(data.totalCostCr)) || 0;
  const costLakhs = (costCr * 100).toFixed(2);
  const loanCr = parseFloat(String(data.loanRequiredCr)) || (costCr * (data.debtPct / 100));
  const loanLakhs = (loanCr * 100).toFixed(2);
  const contribCr = parseFloat(String(data.promoterContribCr)) || (costCr * (data.eqPct / 100));
  const contribLakhs = (contribCr * 100).toFixed(2);

  const consultancyLakhs = (parseFloat(costLakhs) * 0.02).toFixed(2);
  const machineryLakhs = (parseFloat(costLakhs) * 0.68).toFixed(2);
  const civilLakhs = (parseFloat(costLakhs) * 0.30).toFixed(2);

  const projectName = (data.projectName || 'GREENFIELD PROJECT').toUpperCase();

  // Helper for Section Banners (Navy `#0F172A`)
  const drawSectionBanner = (title: string, neededHeightAfter: number = 25) => {
    checkPageBreak(10 + neededHeightAfter);
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title, margin + 4, y + 4.8);
    y += 10;
  };

  // Helper for Footer
  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    // Left Page Number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Page ${pageNum} of ${totalPages}`, margin, pageHeight - 9);

    // Right Branding "Prepared by INISIO"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Prepared by', pageWidth - margin, pageHeight - 11, { align: 'right' });
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text('INISIO', pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // ==================== DOCUMENT HEADER ====================
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(projectName, margin, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Company Profile & Executive Project Teaser', margin, y);

  y += 10;

  // 1. General Information
  drawSectionBanner('General Information', 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const genInfoText1 = `${projectName} is engaged in the proposed greenfield establishment and operation of facilities in the ${data.industry} sector. Proposed location at ${data.location}, promoted by ${data.fullName || 'Promoter'}.`;
  const splitGen1 = doc.splitTextToSize(genInfoText1, contentWidth);
  checkPageBreak(splitGen1.length * 4.2 + 2);
  doc.text(splitGen1, margin, y);
  y += splitGen1.length * 4.2 + 3;

  const genInfoText2 = `The company proposes to establish a state-of-the-art facility with an estimated total capital outlay of Rs ${data.totalCostCr} Crores (Rs ${costLakhs} Lakhs). To ensure uninterrupted operation and raw material security, suitable land has been arranged under ${data.landStatus} status (${data.collateralStatus || 'Freehold Clear Title'}).`;
  const splitGen2 = doc.splitTextToSize(genInfoText2, contentWidth);
  checkPageBreak(splitGen2.length * 4.2 + 2);
  doc.text(splitGen2, margin, y);
  y += splitGen2.length * 4.2 + 3;

  const genInfoText3 = `Project technical design, DPR formulation, financial modeling, and bank debt syndication support are being provided by INISIO Greenfield Project Advisory, specializing in industrial project finance, TEV studies, and consortium bank structuring.`;
  const splitGen3 = doc.splitTextToSize(genInfoText3, contentWidth);
  checkPageBreak(splitGen3.length * 4.2 + 6);
  doc.text(splitGen3, margin, y);
  y += splitGen3.length * 4.2 + 6;

  // 2. Service Offerings
  drawSectionBanner('Service Offerings', 20);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Core Offering', margin + 4, y + 4.2);
  doc.text('Description & Scope', margin + 55, y + 4.2);
  y += 6;

  const serviceDesc = `Commercial manufacture, refining, and supply of primary product outputs and value-added by-products for institutional, commercial, and industrial off-takers.`;
  const splitService = doc.splitTextToSize(serviceDesc, contentWidth - 60);
  const serviceRowH = Math.max(8, splitService.length * 4.2 + 3);

  checkPageBreak(serviceRowH + 6);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, serviceRowH, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, serviceRowH, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Production & Supply (${data.industry})`, margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(splitService, margin + 55, y + 4.5);
  y += serviceRowH + 6;

  // 3. Directors Details
  drawSectionBanner('Directors Details', 15);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Name', margin + 4, y + 4.2);
  doc.text('Title / Designation', margin + 110, y + 4.2);
  y += 6;

  const directorsList = data.directors && data.directors.length > 0 ? data.directors : [
    { name: data.fullName || 'Promoter', title: 'Promoter / Lead Investor' }
  ];

  directorsList.forEach((dir, idx) => {
    checkPageBreak(7);
    const c = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(c, c, c);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(dir.name, margin + 4, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(dir.title, margin + 110, y + 4.2);
    y += 6;
  });
  y += 6;

  // 4. Suppliers and Buyers
  drawSectionBanner('SUPPLIERS AND BUYERS', 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const suppText1 = `${projectName} adopts an integrated supply chain model, sourcing raw materials and key feedstock through contract farming, primary producers, aggregators, and industrial suppliers within an optimal transport radius.`;
  const splitSupp1 = doc.splitTextToSize(suppText1, contentWidth);
  checkPageBreak(splitSupp1.length * 4.2 + 2);
  doc.text(splitSupp1, margin, y);
  y += splitSupp1.length * 4.2 + 3;

  const suppText2 = `On the marketing front, the company plans to sell primary output primarily to Oil Marketing Companies (OMCs), City Gas Distribution (CGD) networks, industrial bulk consumers, or retail networks. By-products will be marketed to institutional fertilizer and commercial agricultural users.`;
  const splitSupp2 = doc.splitTextToSize(suppText2, contentWidth);
  checkPageBreak(splitSupp2.length * 4.2 + 6);
  doc.text(splitSupp2, margin, y);
  y += splitSupp2.length * 4.2 + 6;

  // 5. Project Funding Facilities
  drawSectionBanner('Project Funding Facilities', 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PROPOSED PROJECT COST STATEMENT', margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');
  doc.text('Particulars', margin + 4, y + 4.2);
  doc.text('Amount (INR Lakhs)', margin + 110, y + 4.2);
  y += 6;

  const costRows = [
    { item: 'Consultancy, TEFR & Engineering Fees', val: `${consultancyLakhs}` },
    { item: 'Plant & Machinery, Technology & Procurement', val: `${machineryLakhs}` },
    { item: 'Land Cost, Civil Works & Infrastructure', val: `${civilLakhs}` }
  ];

  costRows.forEach((row) => {
    checkPageBreak(6);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'D');

    doc.setFont('helvetica', 'normal');
    doc.text(row.item, margin + 4, y + 4.2);
    doc.text(row.val, margin + 110, y + 4.2);
    y += 6;
  });

  checkPageBreak(6);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Project Cost', margin + 4, y + 4.2);
  doc.text(`${costLakhs} lakhs`, margin + 110, y + 4.2);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MEANS OF FINANCE', margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');
  doc.text('Means of Finance', margin + 4, y + 4.2);
  doc.text('Amount (INR Lakhs)', margin + 85, y + 4.2);
  doc.text('Share (%)', margin + 140, y + 4.2);
  y += 6;

  const meansRows = [
    { name: 'Project Term Loan', val: `${loanLakhs} lakhs`, pct: `${data.debtPct}%` },
    { name: 'Promoter Contribution', val: `${contribLakhs} lakhs`, pct: `${data.eqPct}%` }
  ];

  meansRows.forEach((row) => {
    checkPageBreak(6);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'D');

    doc.setFont('helvetica', 'bold');
    doc.text(row.name, margin + 4, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(row.val, margin + 85, y + 4.2);
    doc.text(row.pct, margin + 140, y + 4.2);
    y += 6;
  });

  checkPageBreak(6);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'D');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Means of Finance', margin + 4, y + 4.2);
  doc.text(`${costLakhs} lakhs`, margin + 85, y + 4.2);
  doc.text('100%', margin + 140, y + 4.2);
  y += 8;

  // 6. Present Requirement
  drawSectionBanner('Present Requirement', 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const reqText = `The Company proposes to avail a Term Loan facility of Rs ${data.loanRequiredCr} Crore to meet its capital expenditure requirements. The proposed facility will be utilized for the establishment of the ${data.industry} facility, including procurement and installation of plant & machinery, civil infrastructure development, and operational commissioning.`;
  const splitReq = doc.splitTextToSize(reqText, contentWidth);
  checkPageBreak(splitReq.length * 4.2 + 6);
  doc.text(splitReq, margin, y);
  y += splitReq.length * 4.2 + 8;

  // 7. Primary & Collaterals
  drawSectionBanner('Primary & Collaterals', 25);

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
    { type: 'Primary Security', desc: 'Hypothecation on all the plant & machinery, equipment, civil structures, and other fixed assets procured out of the Term Loan.' },
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

  // 8. Detailed Risk Profile & Underwriting Assessment
  if (data.riskProfileData || data.riskScoreOutOf10) {
    drawSectionBanner('Detailed Risk Profile & Underwriting Assessment', 50);

    const rp = data.riskProfileData;
    const cibilStr = rp?.isNewToCredit ? 'New to Credit (N/A)' : (rp?.cibilScore ? `${rp.cibilScore} Score` : 'N/A');
    const riskScoreVal = data.riskScoreOutOf10 || 8.0;

    const riskGrid: Array<{ label: string; val: string }> = [
      { label: 'Underwriting Score (out of 10)', val: `${riskScoreVal} / 10 (${riskScoreVal >= 8.5 ? 'Excellent' : riskScoreVal >= 7.0 ? 'Good' : riskScoreVal >= 5.5 ? 'Average' : 'High Risk'})` },
      { label: 'CIBIL / Credit Score Track', val: cibilStr },
      { label: 'Collateral Coverage %', val: rp?.collateralCoveragePct ? `${rp.collateralCoveragePct}%` : 'N/A' },
      { label: 'Promoter Experience', val: rp?.industryExperience || data.promoterExp || 'N/A' },
      { label: 'Educational Background', val: rp?.educationalBackground || 'N/A' },
      { label: 'Business Constitution', val: rp?.businessConstitution || 'N/A' },
      { label: 'Business Vintage', val: rp?.businessVintage || 'N/A' },
      { label: 'Promoter Contribution Type', val: rp?.contributionType || 'N/A' },
      { label: 'Management & Technical Workforce', val: rp ? `${rp.managementTeamSize || 0} Mgmt / ${rp.technicalWorkforceCount || 0} Tech Staff` : 'N/A' },
      { label: 'Debt–Equity Ratio', val: rp?.debtEquityRatio || `${data.debtPct}:${data.eqPct}` }
    ];

    riskGrid.forEach((item, idx) => {
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
      doc.text(item.val, margin + 70, y + 4.2);
      y += 6;
    });

    y += 6;
  }

  // 9. Preliminary Information
  drawSectionBanner('Preliminary Information', 50);

  const prelimGrid: Array<{ label: string; val: string }> = [
    { label: 'Project Name', val: projectName },
    { label: 'Promoter Name', val: data.fullName || 'N/A' },
    { label: 'Industry Sector', val: data.industry },
    { label: 'Project Location', val: data.location || 'India' },
    { label: 'Land Status', val: data.landStatus || 'N/A' },
    { label: 'Collateral Status', val: data.collateralStatus || 'N/A' },
    { label: 'Promoter Experience', val: data.promoterExp || 'N/A' },
    { label: 'Feasibility Assessment', val: `${getFeasibilityTerm(data.feasibilityScore)} (${data.feasibilityScore}/100)` },
    { label: 'Bankability Grade', val: `${data.bankabilityRating} / 10` }
  ];

  if (data.gstNumber) {
    prelimGrid.push({ label: 'GST Number', val: data.gstNumber });
  }
  if (data.panNumber) {
    prelimGrid.push({ label: 'PAN Number', val: data.panNumber });
  }

  prelimGrid.forEach((item, idx) => {
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
    doc.text(item.val, margin + 60, y + 4.2);
    y += 6;
  });

  // Render footers dynamically on all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

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
    notes: `Land: ${data.landStatus}. Collateral: ${data.collateralStatus || 'N/A'}. Exp: ${data.promoterExp}.`
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
    `• Land Status: ${data.landStatus || 'N/A'}\n` +
    `• Collateral Status: ${data.collateralStatus || 'N/A'}\n\n` +
    `*Financial Breakdown:*\n` +
    `• Total Capex: ₹ ${data.totalCostCr} Cr\n` +
    `• Promoter Equity: ₹ ${data.promoterContribCr} Cr (${data.eqPct}%)\n` +
    `• Required Debt: ₹ ${data.loanRequiredCr} Cr (${data.debtPct}%)\n\n` +
    `*Advisory Evaluation:*\n` +
    `• Feasibility Check: ${getFeasibilityTerm(data.feasibilityScore)}\n` +
    `• Bankability Grade: ${data.bankabilityRating}/10\n` +
    `• Est. Eligible Loan: ₹ ${data.estimatedLoan} Cr\n\n` +
    `_User requested official Executive Project Teaser from Inisio Advisory Desk._`;

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
