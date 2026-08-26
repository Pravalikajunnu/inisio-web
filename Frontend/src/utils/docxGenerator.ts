import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { TeaserPDFData } from './pdfGenerator';
import { getFeasibilityTerm } from '../types';

export async function generateProjectTeaserDOCX(data: TeaserPDFData): Promise<void> {
  const costCr = parseFloat(String(data.totalCostCr)) || 0;
  const costCrFormatted = costCr.toFixed(2);
  const loanCr = parseFloat(String(data.loanRequiredCr)) || (costCr * (data.debtPct / 100));
  const loanCrFormatted = loanCr.toFixed(2);
  const contribCr = parseFloat(String(data.promoterContribCr)) || (costCr * (data.eqPct / 100));
  const contribCrFormatted = contribCr.toFixed(2);

  const machineryCr = data.machineryCostCr ? Number(data.machineryCostCr).toFixed(2) : (costCr * 0.65).toFixed(2);
  const civilCr = data.civilCostCr ? Number(data.civilCostCr).toFixed(2) : (costCr * 0.25).toFixed(2);
  const consultancyCr = data.consultancyCostCr ? Number(data.consultancyCostCr).toFixed(2) : (costCr * 0.05).toFixed(2);
  const otherCostsCr = data.otherCostsCr ? Number(data.otherCostsCr).toFixed(2) : (costCr * 0.05).toFixed(2);

  const userTermLoanCr = data.termLoanCr ? Number(data.termLoanCr).toFixed(2) : loanCrFormatted;
  const userPromoterCr = data.promoterContributionCr ? Number(data.promoterContributionCr).toFixed(2) : contribCrFormatted;
  const userOtherFinCr = data.otherFinanceCr ? Number(data.otherFinanceCr).toFixed(2) : '0.00';

  const totalCostCalc = (parseFloat(machineryCr) + parseFloat(civilCr) + parseFloat(consultancyCr) + parseFloat(otherCostsCr)).toFixed(2);
  const totalFinCalc = (parseFloat(userTermLoanCr) + parseFloat(userPromoterCr) + parseFloat(userOtherFinCr)).toFixed(2);

  const dscr = data.dscrEstimate || (data.debtPct > 75 ? 1.45 : data.debtPct > 65 ? 1.72 : 1.95);
  const feasibilityTerm = getFeasibilityTerm(data.feasibilityScore);

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: [
          // Header / Branding
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: 'INISIO PROJECT INTELLIGENCE',
                bold: true,
                color: '1E40AF',
                size: 20,
              }),
              new TextRun({
                text: ' | Confidential Executive Project Teaser',
                color: '64748B',
                size: 18,
              }),
            ],
            spacing: { after: 240 },
          }),

          // Main Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: data.projectName || 'Greenfield Project Executive Teaser',
                bold: true,
                size: 36,
                color: '0F172A',
              }),
            ],
            spacing: { before: 120, after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Industry: ${data.industry || 'Industrial'}  |  Location: ${data.location || 'India'}  |  Date: ${new Date().toLocaleDateString('en-IN')}`,
                color: '475569',
                size: 20,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Section 1: Executive Bankability & Feasibility Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '1. Executive Assessment & Key Outputs',
                bold: true,
                size: 26,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 200, after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'This automated Executive Teaser summarizes the preliminary underwriting feasibility, project cost appraisal, capital structuring, and debt servicing indicators for credit appraisal committees and institutional lenders.',
                color: '334155',
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Key Metrics Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Bankability Rating: ', bold: true, color: '1E40AF' }),
                          new TextRun({ text: `${data.bankabilityRating || 'A+ (High Viability)'} (Score: ${data.riskScoreOutOf10 ? data.riskScoreOutOf10.toFixed(1) : '8.2'}/10)`, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Feasibility Score: ', bold: true, color: '047857' }),
                          new TextRun({ text: `${data.feasibilityScore || 85}/100 (${feasibilityTerm})`, bold: true }),
                        ],
                        spacing: { before: 60 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Indicative DSCR: ', bold: true, color: 'B45309' }),
                          new TextRun({ text: `${dscr.toFixed(2)}x (Average over 7-10 yrs)`, bold: true }),
                        ],
                        spacing: { before: 60 },
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Total Project CAPEX: ', bold: true }),
                          new TextRun({ text: `₹ ${costCrFormatted} Cr (INR ${costCr} Crores)`, bold: true, color: '0F172A' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Proposed Term Debt: ', bold: true }),
                          new TextRun({ text: `₹ ${userTermLoanCr} Cr (${data.debtPct}%)`, bold: true, color: '1E40AF' }),
                        ],
                        spacing: { before: 60 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Promoter Contribution: ', bold: true }),
                          new TextRun({ text: `₹ ${userPromoterCr} Cr (${data.eqPct}%)`, bold: true, color: '047857' }),
                        ],
                        spacing: { before: 60 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Disclaimer regarding indicative metrics
          new Paragraph({
            children: [
              new TextRun({
                text: '* Note: Indicative DSCR, bankability scores, and interest benchmarks are subject to actual statutory audit, Detailed Project Report (DPR), CMA modeling, and formal credit committee sanction.',
                italics: true,
                color: '64748B',
                size: 17,
              }),
            ],
            spacing: { before: 120, after: 280 },
          }),

          // Section 2: Project Cost & Means of Finance Breakdown
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '2. Capital Expenditure (CAPEX) & Means of Finance',
                bold: true,
                size: 26,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 200, after: 140 },
          }),

          // Breakup Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'CAPEX Item / Cost Component', bold: true, color: '0F172A' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Amount (₹ Cr)', bold: true, color: '0F172A' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Means of Finance', bold: true, color: '0F172A' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Amount (₹ Cr)', bold: true, color: '0F172A' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Plant & Machinery / Technology' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${machineryCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Term Loan (Proposed Debt)' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${userTermLoanCr}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Land & Civil Works Construction' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${civilCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Promoter Equity Contribution' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${userPromoterCr}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Engineering, Consultancy & Pre-op' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${consultancyCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Other Funding / Quasi-Equity' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${userOtherFinCr}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Contingency & Other Capex' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${otherCostsCr}` })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Total Funding Allocated' })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `₹ ${totalFinCalc}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'E2E8F0' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Project Cost (CAPEX)', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'E2E8F0' },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${totalCostCalc} Cr`, bold: true, color: '1E3A8A' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'E2E8F0' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Total Means of Finance', bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'E2E8F0' },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `₹ ${totalFinCalc} Cr`, bold: true, color: '047857' })] })],
                  }),
                ],
              }),
            ],
          }),

          // Section 3: Promoter & Risk Profile
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '3. Promoter & Readiness Profile',
                bold: true,
                size: 26,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 240, after: 140 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Promoter Name / Lead Contact: ', bold: true }),
              new TextRun({ text: data.fullName || 'Promoter' }),
              new TextRun({ text: '  |  Email: ', bold: true }),
              new TextRun({ text: data.email || 'Confidential' }),
              new TextRun({ text: '  |  Mobile: ', bold: true }),
              new TextRun({ text: data.mobile || 'Confidential' }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Land Acquisition Status: ', bold: true }),
              new TextRun({ text: data.landStatus || 'In Progress' }),
              new TextRun({ text: '  |  Collateral Security: ', bold: true }),
              new TextRun({ text: data.collateralStatus || 'Available' }),
              new TextRun({ text: '  |  Promoter Experience: ', bold: true }),
              new TextRun({ text: `${data.promoterExp || '5+'} Years in related sector` }),
            ],
            spacing: { after: 200 },
          }),

          // Section 4: Next Steps & Advisory
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '4. Recommended Next Steps Towards Funding',
                bold: true,
                size: 26,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 200, after: 120 },
          }),

          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'DPR Preparation: ', bold: true }),
              new TextRun({ text: 'Draft comprehensive, bank-grade Detailed Project Report with techno-economic feasibility.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'CMA Data & Financial Modeling: ', bold: true }),
              new TextRun({ text: 'Generate 7 to 10 year Credit Monitoring Arrangement projections including DSCR, ISCR, and cash-flow statements.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lender Matching: ', bold: true }),
              new TextRun({ text: 'Submit structured dossier to public/private sector banks, NBFCs, and development financial institutions (SIDBI, NABARD, IREDA).' }),
            ],
          }),

          // Footer Notice
          new Paragraph({
            children: [
              new TextRun({
                text: '\nGenerated via Inisio Greenfield Project Intelligence Suite. For CA advisory, TEV studies, and DPR drafting support, visit inisio.com or contact advisory@inisio.com.',
                color: '94A3B8',
                size: 16,
                italics: true,
              }),
            ],
            spacing: { before: 300 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${(data.projectName || 'Greenfield_Project').replace(/[^a-zA-Z0-9_-]/g, '_')}_AI_Project_Teaser.docx`;
  saveAs(blob, safeFilename);
}
