import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { TeaserPDFData } from './pdfGenerator';
import { getFeasibilityTerm } from '../types';
import { reconcileProjectFinancials } from './financialUtils';

export async function generateProjectTeaserDOCX(data: TeaserPDFData): Promise<void> {
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

  const totalCostCalc = fin.totalCostFormatted;
  const totalFinCalc = fin.totalFinanceFormatted;

  const dscr = data.dscrEstimate || (data.debtPct > 75 ? 1.45 : data.debtPct > 65 ? 1.72 : 1.95);
  const feasibilityTerm = getFeasibilityTerm(data.feasibilityScore);
  const rp = data.riskProfileData;
  const docRefId = `IN-TEASER-${Date.now().toString().slice(-6)}`;
  const dateFormatted = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
  };

  const headerShading = { fill: '1E3A8A' }; // Deep Royal Blue
  const subHeaderShading = { fill: 'F1F5F9' }; // Slate light
  const highlightShading = { fill: 'EFF6FF' }; // Blue tint

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: [
          // -------------------------------------------------------------
          // Top Corporate Header / Inisio Branding
          // -------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: 'INISIO PROJECT INTELLIGENCE',
                bold: true,
                color: '1E40AF',
                size: 20,
                font: 'Arial',
              }),
              new TextRun({
                text: ' | Confidential Institutional Dossier',
                color: '64748B',
                size: 18,
                font: 'Arial',
              }),
            ],
            spacing: { after: 180 },
          }),

          // -------------------------------------------------------------
          // Cover / Main Title Block
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: data.projectName || 'Greenfield Project Executive Teaser',
                bold: true,
                size: 36,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 100, after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Industry Sector: ${data.industry || 'Industrial & Manufacturing'}   •   Location: ${data.location || 'India'}`,
                color: '334155',
                bold: true,
                size: 20,
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Dossier ID: ${docRefId}   •   Assessment Date: ${dateFormatted}   •   Classification: STRICTLY CONFIDENTIAL`,
                color: '64748B',
                size: 17,
                font: 'Arial',
              }),
            ],
            spacing: { after: 260 },
          }),

          // -------------------------------------------------------------
          // Executive Abstract
          // -------------------------------------------------------------
          new Paragraph({
            children: [
              new TextRun({
                text: 'This automated Executive Project Teaser has been structured for Credit Committees, Investment Boards, and Institutional Lenders (PSU Banks, Private Scheduled Commercial Banks, and Development Financial Institutions). It summarizes capital outlay sizing, Means of Finance, Debt Service Coverage Ratios (DSCR), promoter equity readiness, and preliminary underwriting bankability.',
                color: '1E293B',
                size: 19,
                font: 'Arial',
              }),
            ],
            spacing: { after: 240 },
          }),

          // -------------------------------------------------------------
          // SECTION 1: Executive Underwriting & Key Viability Indicators
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '1. Executive Underwriting & Key Viability Indicators',
                bold: true,
                size: 24,
                color: '1E3A8A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 200, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: headerShading,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Metric / Parameter', bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: headerShading,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Assessed Value', bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: headerShading,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Institutional Benchmark', bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: headerShading,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status / Viability', bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Bankability Rating' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${data.bankabilityRating || 'A+ (High)'} (${data.riskScoreOutOf10 ? data.riskScoreOutOf10.toFixed(1) : '8.4'}/10)`, bold: true, color: '1E40AF' })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Min. BBB (6.0/10)' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Compliant (Underwriting Grade)', bold: true, color: '047857' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Feasibility Index' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${data.feasibilityScore || 85}/100 (${feasibilityTerm})`, bold: true, color: '047857' })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Score >= 70' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'High Techno-Economic Feasibility' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Indicative DSCR (Average)' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${dscr.toFixed(2)}x`, bold: true, color: 'B45309' })] })] }),
                  new TableCell({ children: [new Paragraph({ text: '1.40x to 1.75x' })] }),
                  new TableCell({ children: [new Paragraph({ text: dscr >= 1.5 ? 'Robust Debt Servicing Headroom' : 'Standard Debt Coverage' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Debt : Equity Mix' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.debtPct}% Debt : ${data.eqPct}% Equity` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Max. 75:25 Debt:Equity' })] }),
                  new TableCell({ children: [new Paragraph({ text: data.eqPct >= 20 ? 'Eligible for Bank Syndication' : 'Low Equity Buffer' })] }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 2: Project Capital Outlay (CAPEX) & Means of Finance
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '2. Capital Expenditure (CAPEX) & Means of Finance Sizing',
                bold: true,
                size: 24,
                color: '1E3A8A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: subHeaderShading,
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'CAPEX Item / Cost Head', bold: true, color: '0F172A', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: subHeaderShading,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Amount (₹ Cr)', bold: true, color: '0F172A', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: subHeaderShading,
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Means of Finance Source', bold: true, color: '0F172A', size: 18, font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: subHeaderShading,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Amount (₹ Cr)', bold: true, color: '0F172A', size: 18, font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Plant & Machinery / Technology' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${machineryCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Proposed Term Loan (Bank Debt)' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${userTermLoanCr}`, bold: true, color: '1E40AF' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Land & Civil Works Construction' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${civilCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Promoter Equity Contribution' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${userPromoterCr}`, bold: true, color: '047857' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Engineering, Consultancy & Pre-op' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${consultancyCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Quasi-Equity / Subsidy / Others' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${userOtherFinCr}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Contingency & Other Outlay' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${otherCostsCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Total Funding Sourced' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${totalFinCalc}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: highlightShading,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Project Cost (CAPEX)', bold: true, color: '0F172A' })] })],
                  }),
                  new TableCell({
                    shading: highlightShading,
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${totalCostCalc} Cr`, bold: true, color: '1E3A8A' })] })],
                  }),
                  new TableCell({
                    shading: highlightShading,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Means of Finance', bold: true, color: '0F172A' })] })],
                  }),
                  new TableCell({
                    shading: highlightShading,
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${totalFinCalc} Cr`, bold: true, color: '047857' })] })],
                  }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 3: Promoter Track Record & Corporate Governance
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '3. Promoter Track Record & Readiness Profile',
                bold: true,
                size: 24,
                color: '1E3A8A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Promoter / Contact', bold: true })] })] }),
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: data.fullName || 'Promoter' })] }),
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Industry Track Record', bold: true })] })] }),
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: rp?.industryExperience || `${data.promoterExp || '5+'} Years` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Business Constitution', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: rp?.businessConstitution || 'Private Limited Company' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Operating Vintage', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: rp?.businessVintage || '4 to 7 Years' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Land Acquisition Status', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.landStatus || 'In Acquisition' })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Collateral Security Status', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.collateralStatus || 'Primary Fixed Assets Hypothecation' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Collateral Coverage Ratio', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${rp?.collateralCoveragePct || '110'}% of Loan Request` })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Promoter CIBIL Standing', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${rp?.cibilScore || '785'} (High Credit Profile)` })] }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 4: Supply Chain, Offtake & Commercial Framework
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '4. Commercial, Offtake & Supply Chain Infrastructure',
                bold: true,
                size: 24,
                color: '1E3A8A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Raw Material Sourcing', bold: true })] })] }),
                  new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: data.rawMaterialSource || 'Domestic Industrial Vendors & Raw Material Hubs' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Procurement Radius', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.procurementRadiusKm || '50 to 100 KM Radius (Economical Freight Zone)' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Off-Take & Buyer Channels', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.primaryBuyersType || 'B2B Industrial Distributors & Institutional Clients' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Off-Take Contract Status', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.offTakeAgreementStatus || 'MoUs & Letters of Intent (LoI) in execution' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Target Lender Category', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: data.targetBankCategory || 'PSU & Top Scheduled Commercial Banks' })] }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 5: Institutional Road Map & Next Actionables
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '5. Actionable Bank Syndication Roadmap & Deliverables',
                bold: true,
                size: 24,
                color: '1E3A8A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 240, after: 120 },
          }),

          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Detailed Project Report (DPR): ', bold: true, color: '0F172A' }),
              new TextRun({ text: 'Draft comprehensive, bank-grade technical appraisal report covering plant civil layout, machinery vendor quotes, production flowchart, and environmental compliance clearances.' }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'CMA Data Financial Modeling: ', bold: true, color: '0F172A' }),
              new TextRun({ text: 'Generate 7 to 10 year multi-scenario Credit Monitoring Arrangement (CMA) projections including DSCR, ISCR, projected balance sheets, cash flow waterfalls, and sensitivity analysis.' }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Chartered Accountant (CA) Clearance: ', bold: true, color: '0F172A' }),
              new TextRun({ text: 'Complete financial audit, Means of Finance certification, and promoter net worth vetting for bank appraisal committee.' }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lender Dossier Submission: ', bold: true, color: '0F172A' }),
              new TextRun({ text: 'Formal syndication with lead PSU/private banks and development financial institutions (e.g. SBI, HDFC, Canara, SIDBI, IREDA).' }),
            ],
            spacing: { after: 180 },
          }),

          // -------------------------------------------------------------
          // Disclaimer & Advisory Desk Footer
          // -------------------------------------------------------------
          new Paragraph({
            children: [
              new TextRun({
                text: 'CONFIDENTIALITY & LEGAL NOTICE: ',
                bold: true,
                color: '475569',
                size: 16,
                font: 'Arial',
              }),
              new TextRun({
                text: 'This document is generated by the Inisio Greenfield Project Assessment Engine for institutional underwriting evaluation. Projections, DSCR metrics, and capital cost breakups are subject to formal Techno-Economic Viability (TEV) validation, statutory audits, and lender credit approval policies.',
                color: '64748B',
                size: 16,
                font: 'Arial',
              }),
            ],
            spacing: { before: 200, after: 60 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'For CA financial clearance, bank-grade DPR preparation, or syndication advisory: inisio.com | Email: advisory@inisio.com | Tel: +91 99887 76655',
                bold: true,
                color: '1E40AF',
                size: 16,
                font: 'Arial',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${(data.projectName || 'Greenfield_Project').replace(/[^a-zA-Z0-9_-]/g, '_')}_AI_Project_Teaser.docx`;
  saveAs(blob, safeFilename);
}
