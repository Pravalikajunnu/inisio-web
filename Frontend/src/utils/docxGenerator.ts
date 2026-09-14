import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} from 'docx';
import { saveAs } from 'file-saver';
import { TeaserPDFData } from './pdfGenerator';
import { getFeasibilityTerm } from '../types';
import { reconcileProjectFinancials } from './financialUtils';

export async function generateProjectTeaserDOCX(data: TeaserPDFData): Promise<void> {
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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
  const consultancyCr = fin.consultancyFormatted;
  const machineryCr = fin.machineryFormatted;
  const civilCr = fin.civilFormatted;
  const otherCostsCr = fin.otherCostsFormatted;

  const userTermLoanCr = fin.termLoanFormatted;
  const userPromoterCr = fin.promoterContributionFormatted;
  const userOtherFinCr = fin.otherFinanceFormatted;
  const totalFinCr = fin.totalFinanceFormatted;

  const companyLegalName = (data.projectName || 'GREENFIELD PROJECT PRIVATE LIMITED').toUpperCase();
  const rp = data.riskProfileData;

  const rawSource = data.rawMaterialSource || 'Direct Vendors, Authorized Distributors & Aggregators';
  const radius = data.procurementRadiusKm || 'Target Industrial Cluster';
  const customSuppliers = data.keySuppliersList ? ` Key suppliers: ${data.keySuppliersList}.` : '';

  const buyerType = data.primaryBuyersType || 'Industrial Off-Takers, Institutional Buyers & Commercial Wholesalers';
  const agreement = data.offTakeAgreementStatus || 'Commercial Contracts / Direct Wholesale Distribution';
  const customBuyers = data.keyBuyersList ? ` Target buyers: ${data.keyBuyersList}.` : '';

  const descText = data.description ? `${data.description}. ` : '';

  const directorsList = data.directors && data.directors.length > 0
    ? data.directors
    : [
        { name: data.fullName || 'Promoter', title: 'Managing Director / Key Promoter' }
      ];

  // Common styling constants
  const borderGrey = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
  };

  const createSectionBanner = (title: string) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: '0F172A' },
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: title,
                      bold: true,
                      color: 'FFFFFF',
                      size: 20,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1100,
              right: 1100,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'INISIO | PROJECT INTELLIGENCE',
                    bold: true,
                    color: '1E40AF',
                    size: 16,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: ` | Executive Teaser Dossier | ${generatedDate}`,
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 120 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.SPACE_BETWEEN,
                children: [
                  new TextRun({
                    text: 'Prepared by INISIO Advisory  •  Confidential',
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: 'Page ',
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: ' of ',
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    color: '64748B',
                    size: 16,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ==========================================
          // 1. TOP HEADER & COMPANY TITLE
          // ==========================================
          new Paragraph({
            children: [
              new TextRun({
                text: companyLegalName,
                bold: true,
                size: 32,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 80, after: 40 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Company Profile',
                bold: true,
                size: 24,
                color: '1E293B',
                font: 'Arial',
              }),
            ],
            spacing: { after: 180 },
          }),

          // ==========================================
          // 2. GENERAL INFORMATION SECTION
          // ==========================================
          createSectionBanner('General Information'),

          new Paragraph({
            children: [
              new TextRun({
                text: `${companyLegalName} is engaged in the proposed greenfield establishment and operation of facilities in the ${data.industry} sector. The project is situated at ${data.location || 'India'}. It is promoted by ${data.fullName || 'the promoter'} and managed by an experienced management team.`,
                size: 20,
                color: '1E293B',
                font: 'Arial',
              }),
            ],
            spacing: { before: 140, after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `The company proposes to establish a state-of-the-art facility with an estimated total capital outlay of Rs ${data.totalCostCr} Crores (${costCrFormatted} Cr). ${descText}To ensure an uninterrupted operation and supply of raw materials, suitable land has been identified and arranged under ${data.landStatus} status (${data.collateralStatus || 'Freehold Clear Title'}), which is adequate for the proposed plant, storage facilities, and operational requirements.`,
                size: 20,
                color: '1E293B',
                font: 'Arial',
              }),
            ],
            spacing: { after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `The project's technical design, engineering, DPR formulation, financial modeling, and loan syndication support are being provided by INISIO Greenfield Project Advisory, specializing in industrial project finance, TEV studies, and banking consortium structuring.`,
                size: 20,
                color: '1E293B',
                font: 'Arial',
              }),
            ],
            spacing: { after: 220 },
          }),

          // ==========================================
          // 3. SERVICE OFFERINGS SECTION
          // ==========================================
          createSectionBanner('Service Offerings'),

          new Paragraph({ text: '', spacing: { before: 100, after: 60 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 120, bottom: 120, left: 150, right: 150 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `The Production and Supply of ${data.industry}`,
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    margins: { top: 120, bottom: 120, left: 150, right: 150 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Commercial production, quality processing, and wholesale supply of primary outputs and value-added commercial derivatives.',
                            size: 19,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 220 } }),

          // ==========================================
          // 4. DIRECTORS DETAILS SECTION
          // ==========================================
          createSectionBanner('Directors Details'),

          new Paragraph({ text: '', spacing: { before: 100, after: 60 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Name',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Title',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              ...directorsList.map((dir, idx) =>
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
                      margins: { top: 100, bottom: 100, left: 140, right: 140 },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: dir.name,
                              bold: true,
                              size: 19,
                              color: '0F172A',
                              font: 'Arial',
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
                      margins: { top: 100, bottom: 100, left: 140, right: 140 },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: dir.title,
                              size: 19,
                              color: '334155',
                              font: 'Arial',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 240 } }),

          // ==========================================
          // 5. RAW MATERIALS & MARKET OFFTAKE SECTION
          // ==========================================
          createSectionBanner('RAW MATERIALS & MARKET OFFTAKE'),

          new Paragraph({
            children: [
              new TextRun({
                text: `${companyLegalName} will procure essential raw materials, feedstocks, and machinery spares through ${rawSource} within the ${radius}.${customSuppliers} Long-term supply consistency will be maintained via structured vendor agreements.`,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
            ],
            spacing: { before: 140, after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `On the sales and commercialization front, the company plans to supply finished outputs and by-products primarily to ${buyerType} under ${agreement}.${customBuyers} Direct B2B and institutional supply channels will drive revenue realization.`,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
            ],
            spacing: { after: 240 },
          }),

          // ==========================================
          // 6. PROJECT FUNDING FACILITIES SECTION
          // ==========================================
          createSectionBanner('Project Funding Facilities'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Proposed Project Cost Statement',
                bold: true,
                size: 22,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 140, after: 40 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Debt Types: Project Term Loan',
                bold: true,
                size: 18,
                color: '64748B',
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
          }),

          // Project Cost Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Particulars',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Amount (INR Cr)',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Consultancy & Pre-operative Expenses', size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${consultancyCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Plant & Machinery / Technology', size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${machineryCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Land Cost & Civil Works Construction', size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${civilCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Other Project Costs & Contingency', size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${otherCostsCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              // Total Project Cost Row
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'EEF2FF' },
                    margins: { top: 110, bottom: 110, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Total Project Cost (CAPEX)',
                            bold: true,
                            size: 20,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: 'EEF2FF' },
                    margins: { top: 110, bottom: 110, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `Rs. ${costCrFormatted} Cr`,
                            bold: true,
                            size: 20,
                            color: '1E40AF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Means of Finance',
                bold: true,
                size: 22,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),

          // Means of Finance Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Funding Source',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Amount (INR Cr)',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Share (%)',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Project Term Loan (Bank Debt)', bold: true, size: 19, color: '0F172A', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${userTermLoanCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${fin.debtPct}%`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Promoter Contribution (Equity)', bold: true, size: 19, color: '0F172A', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${userPromoterCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${fin.eqPct}%`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Other Sources / Quasi-Equity', size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Rs. ${userOtherFinCr} Cr`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                  new TableCell({
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${fin.otherPct}%`, size: 19, color: '334155', font: 'Arial' })] })],
                  }),
                ],
              }),
              // Total Means of Finance Row
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'ECFDF5' },
                    margins: { top: 110, bottom: 110, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Total Means of Finance',
                            bold: true,
                            size: 20,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: 'ECFDF5' },
                    margins: { top: 110, bottom: 110, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `Rs. ${totalFinCr} Cr`,
                            bold: true,
                            size: 20,
                            color: '047857',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: 'ECFDF5' },
                    margins: { top: 110, bottom: 110, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: '100%',
                            bold: true,
                            size: 20,
                            color: '047857',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 220 } }),

          // ==========================================
          // 7. PRESENT REQUIREMENT SECTION
          // ==========================================
          createSectionBanner('Present Requirement'),

          new Paragraph({
            children: [
              new TextRun({
                text: `The Company proposes to avail a Term Loan of Rs ${data.loanRequiredCr} crore to meet its capital expenditure requirements. The proposed facility will be utilised for the establishment of a ${data.industry} facility, including the procurement and installation of plant & machinery, development of civil infrastructure, and other project-related assets required for the successful implementation and commissioning of the project.`,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
            ],
            spacing: { before: 140, after: 220 },
          }),

          // ==========================================
          // 8. PRIMARY & COLLATERALS SECTION
          // ==========================================
          createSectionBanner('Primary & Collaterals'),

          new Paragraph({ text: '', spacing: { before: 100, after: 60 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Security Type',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Description / Details',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Primary Security',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Hypothecation on all the plant & machinery, equipment, civil structures, and other fixed assets procured/to be procured out of the Term Loan.',
                            size: 19,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Collateral Security',
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.collateralStatus || 'Freehold Clear Title Land / First Charge on Immovable Assets',
                            size: 19,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 220 } }),

          // ==========================================
          // 9. PRELIMINARY INFORMATION SECTION
          // ==========================================
          createSectionBanner('Preliminary Information'),

          new Paragraph({ text: '', spacing: { before: 100, after: 60 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderGrey,
            rows: [
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
            ].map((item, idx) =>
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 38, type: WidthType.PERCENTAGE },
                    shading: { fill: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: item.label,
                            bold: true,
                            size: 19,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 62, type: WidthType.PERCENTAGE },
                    shading: { fill: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: item.val,
                            size: 19,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            ),
          }),

          new Paragraph({ text: '', spacing: { after: 180 } }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Inisio_Teaser_${(data.projectName || data.fullName || 'Greenfield').replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

  try {
    saveAs(blob, fileName);
  } catch (error) {
    console.error('DOCX teaser download failed with saveAs fallback:', error);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  }
}
