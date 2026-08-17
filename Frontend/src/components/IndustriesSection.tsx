import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Factory,
  Sprout,
  Shirt,
  Warehouse,
  Hotel,
  Activity,
  Sun,
  FlaskConical,
  HardHat,
  GraduationCap,
  Server,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ArrowLeft,
  FileText,
  ShieldCheck,
  TrendingUp,
  Percent,
  Clock,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Coins,
  Scale,
  Landmark,
  FileCheck
} from 'lucide-react';

interface IndustriesSectionProps {
  onSelectIndustryForAssessment: (industryName: string) => void;
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
  selectedIndustryName?: string;
}

export interface FinancialParameters {
  typicalProjectCost: string;
  expectedBankFunding: string;
  promoterContribution: string;
  estimatedROI: string;
  paybackPeriod: string;
  dscr: string;
  breakEvenPeriod: string;
}

export interface SectorDetailData {
  id: string;
  title: string;
  shortName: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  executiveSummary: string;
  financialMetrics: FinancialParameters;
  revenueDrivers: { title: string; description: string }[];
  complianceAndApprovals: { category: string; approvals: string[] }[];
  subSectors: { name: string; description: string }[];
  moratoriumPeriod: string;
  repaymentTenure: string;
  capexBreakdown: { category: string; percentage: number; detail: string }[];
  subsidiesAndIncentives: { title: string; scheme: string; description: string }[];
  dprRequirements: string[];
  keyRiskFactors: string[];
}

export const DETAILED_INDUSTRIES: SectorDetailData[] = [
  {
    id: 'manufacturing',
    title: 'Manufacturing & Heavy Engineering',
    shortName: 'Manufacturing',
    icon: Factory,
    tagline: 'Precision engineering, fabrication, plastics, auto components & capital goods units',
    description: 'Engineering units, fabrication facilities, auto components, plastics, packaging, and heavy machinery production.',
    executiveSummary: `India's manufacturing sector is expanding rapidly under Make in India, PLI programs, and global supply chain rebalancing. Greenfield manufacturing setups require structured capital expenditure planning, industrial zone clearances, high-precision machinery debt financing, and bankable financial models that comfortably clear lender DSCR underwriting thresholds.`,
    financialMetrics: {
      typicalProjectCost: '₹3 Cr – ₹250+ Cr',
      expectedBankFunding: '70% – 75% Bank Debt',
      promoterContribution: '25% – 30% Equity',
      estimatedROI: '18% – 26% p.a.',
      paybackPeriod: '4.5 – 6 Years',
      dscr: '1.35x – 1.60x Minimum',
      breakEvenPeriod: 'Year 2 (at 52%–58% Capacity)'
    },
    revenueDrivers: [
      { title: 'Long-term OEM Contracts', description: 'Multi-year supply master agreements with automotive, defense, and industrial OEM brands.' },
      { title: 'Value-Added Fabrication & Assembly', description: 'High-margin CNC precision tooling, sub-assemblies, and specialized engineering parts.' },
      { title: 'Export Orders & Global Supply Chains', description: 'Direct exports to Southeast Asia, Europe, and Middle East markets with duty drawbacks.' },
      { title: 'Aftermarket Spares & Servicing', description: 'Recurring revenue from replacement spare parts, annual maintenance, and tooling refurbishments.' }
    ],
    complianceAndApprovals: [
      { category: 'Statutory & Land Clearances', approvals: ['Industrial Land Allotment / Conversion (NA)', 'Town & Country Planning Building Plan Approval', 'Factory Inspectorate Plan Sanction'] },
      { category: 'Environmental & Safety', approvals: ['Pollution Control Board CTE & CTO (Orange/Green/Red Category)', 'State Fire & Safety NOC', 'Hazardous Waste Management Authorization'] },
      { category: 'Utilities & Commercial', approvals: ['High Tension (HT) Industrial Power Sanction', 'Groundwater / Industrial Water Connection NOC', 'Boiler & Pressure Vessel Registration (IBR)'] }
    ],
    subSectors: [
      { name: 'Precision Engineering & Tooling', description: 'CNC machining, die & mold manufacturing, high-precision industrial components.' },
      { name: 'Fabrication & Structural Steel', description: 'Heavy structural fabrication, pressure vessels, boilers, and industrial frameworks.' },
      { name: 'Auto Components & Assemblies', description: 'OEM tier-1 & tier-2 supply chains, EV chassis, engine parts, and electrical systems.' },
      { name: 'Plastics, Polymers & Packaging', description: 'Injection molding, blow molding, flexible packaging, and eco-friendly polymers.' },
      { name: 'Capital Goods & Heavy Machinery', description: 'Industrial equipment manufacturing, material handling systems, and pumps.' }
    ],
    moratoriumPeriod: '12 – 18 Months during Civil & Machinery Erection',
    repaymentTenure: '7 – 10 Years Term Loan',
    capexBreakdown: [
      { category: 'Plant & Heavy Machinery', percentage: 45, detail: 'Imported/Indigenous machinery, CNC tools, testing gear, automation' },
      { category: 'Factory Civil Shed & Infrastructure', percentage: 25, detail: 'Heavy industrial flooring, crane gantries, PEB sheds, utility blocks' },
      { category: 'Land & Site Development', percentage: 15, detail: 'Industrial park plot, levelling, compound wall, power substation setup' },
      { category: 'Working Capital Margin & Pre-Op', percentage: 15, detail: 'Interest during construction, trial run costs, initial raw material buffer' }
    ],
    subsidiesAndIncentives: [
      { title: 'State Industrial Policy Capital Grant', scheme: 'State Government Industrial Policy', description: '15% to 25% capital subsidy on eligible fixed capital investment (FCI).' },
      { title: 'Electricity Duty Exemption', scheme: 'State Power Tariff Concession', description: '100% exemption on electricity duty for 5 to 7 years from commercial operations.' },
      { title: 'Interest Subvention Scheme', scheme: 'MSME & SIDBI Subvention', description: '2% to 5% annual interest rebate on term loans for greenfield manufacturing.' },
      { title: 'PLI Scheme Benefits', scheme: 'Production Linked Incentive (MoI&T)', description: '4% to 7% incentive on net incremental sales for auto components and engineering.' }
    ],
    dprRequirements: [
      'Comprehensive Techno-Economic Feasibility Report (TEFR)',
      'Pollution Control Consent to Establish (CTE)',
      'Industrial Power Sanction & Load Allocation (HT Connection)',
      'OEM Off-take Agreements or Letter of Intent (LOI)',
      'Detailed Machine Layout & Civil Structural Engineering Drawings',
      'Banking Financial Model with Sensitivity & Break-Even Analysis'
    ],
    keyRiskFactors: [
      'Fluctuations in raw material prices (steel, aluminum, polymer granules)',
      'Delays in HT power connection or machinery commissioning',
      'Working capital lock-in due to elongated credit periods for OEM buyers'
    ]
  },
  {
    id: 'food-processing',
    title: 'Food Processing & Agro Industries',
    shortName: 'Food Processing',
    icon: Sprout,
    tagline: 'Rice & grain mills, dairy processing, cold chain logistics, spices & packaged foods',
    description: 'Grain processing, dairy units, cold chains, fruits & vegetable processing, spices, and packaged foods.',
    executiveSummary: `Food processing is a designated national priority sector eligible for high central and state capital subsidies under PMKSY and NABARD funds (up to 35%–50% grant-in-aid). Bank appraisal emphasizes raw material catchment security, seasonal inventory financing, FSSAI quality benchmarks, and efficient cold storage integration.`,
    financialMetrics: {
      typicalProjectCost: '₹1.5 Cr – ₹120+ Cr',
      expectedBankFunding: '75% Bank Debt (Subsidized)',
      promoterContribution: '20% – 25% Equity',
      estimatedROI: '20% – 30% p.a.',
      paybackPeriod: '3.5 – 5 Years',
      dscr: '1.40x – 1.70x',
      breakEvenPeriod: 'Year 1.5 (at 48% Capacity)'
    },
    revenueDrivers: [
      { title: 'Bulk & Institutional B2B Sales', description: 'Long-term off-take supply to FMCG brands, supermarket retail chains, and government agencies.' },
      { title: 'Direct-to-Consumer Packaged Goods', description: 'High-margin branded consumer packs for rice, spices, pasteurized dairy, and frozen products.' },
      { title: 'Agro By-Product Monetization', description: 'Secondary revenue from rice bran, husk power generation, whey protein, and oil cakes.' },
      { title: 'Agri Export Channels', description: 'Export of premium basmati, spices, dehydrated vegetables, and fruit pulp to GCC/EU.' }
    ],
    complianceAndApprovals: [
      { category: 'Food Safety & Hygiene', approvals: ['FSSAI Central / State Manufacturing License', 'HACCP & ISO 22000 Food Safety Certification', 'APEDA / MPEDA Registration for Exports'] },
      { category: 'Environmental & Municipal', approvals: ['State Pollution Control Board CTE (Effluent Treatment Plant Approval)', 'Ground Water Authority NOC for Water Extraction', 'Local Panchayat / Municipal Trade License'] },
      { category: 'Subsidy & Scheme Approvals', approvals: ['MoFPI PMKSY In-Principle Grant Approval', 'NABARD Food Processing Fund Registration'] }
    ],
    subSectors: [
      { name: 'Rice & Grain Processing Mills', description: 'Modern automated paddy processing, color sorters, and parboiling units.' },
      { name: 'Dairy & Milk Processing Plants', description: 'Pasteurization, ghee, cheese, milk powder, and cold chain distribution.' },
      { name: 'Cold Storage & Integrated Cold Chains', description: 'Controlled atmosphere (CA) stores, multi-commodity cold rooms, reefer vans.' },
      { name: 'Spices, Seasoning & Extraction', description: 'Grinding, steam sterilization, oleoresin extraction, and export packaging.' },
      { name: 'Fruits, Vegetables & Frozen Foods', description: 'IQF processing, fruit pulp processing, canning, and ready-to-eat foods.' }
    ],
    moratoriumPeriod: '12 Months',
    repaymentTenure: '7 – 10 Years',
    capexBreakdown: [
      { category: 'Processing Machinery & Color Sorters', percentage: 50, detail: 'Automated sorting, processing lines, packaging & testing lab' },
      { category: 'Civil Building & Hygiene Infrastructure', percentage: 30, detail: 'FSSAI compliant epoxied flooring, clean rooms, cold storage' },
      { category: 'Pre-operative & Trial Production', percentage: 10, detail: 'Boiler setup, ETP plant, FSSAI approvals, utility connections' },
      { category: 'Land & Agro Site Development', percentage: 10, detail: 'Agro-industrial plot, borewell, transformer setup' }
    ],
    subsidiesAndIncentives: [
      { title: 'MoFPI PMKSY Capital Grant', scheme: 'Pradhan Mantri Kisan SAMPADA Yojana', description: '35% to 50% grant-in-aid of eligible project cost up to ₹5 Cr – ₹10 Cr.' },
      { title: 'NABARD Food Processing Fund', scheme: 'Concessional Debt Financing', description: 'Term loan at subsidized interest rate under NABARD FPF scheme.' },
      { title: 'Agro Industrial Policy Subsidy', scheme: 'State Agriculture Subsidies', description: 'Stamp duty exemption, SGST reimbursement, and power tariff subsidies.' }
    ],
    dprRequirements: [
      'Raw Material Procurement Tie-up Plan (Farmer Catchment Area Study)',
      'FSSAI & State Pollution Control Board Clearances',
      'Detailed Cold Chain / Storage Technical Specifications',
      'Financial Projection with Seasonal Working Capital Assessment',
      'Subsidy Eligibility Dossier for MoFPI / State Govt'
    ],
    keyRiskFactors: [
      'Seasonality of agricultural raw material supply and price volatility',
      'Perishability risks mitigated through efficient cold chain management',
      'Quality control and stringent export/FSSAI regulatory norms'
    ]
  },
  {
    id: 'renewable-energy',
    title: 'Renewable Energy & Solar Parks',
    shortName: 'Renewable Energy',
    icon: Sun,
    tagline: 'Utility solar power plants, commercial open access, captive rooftop & biogas',
    description: 'Solar power plants, wind farms, captive industrial solar, biomass, and green hydrogen projects.',
    executiveSummary: `Greenfield renewable energy projects enjoy strong ESG tailwinds, guaranteed long-term 25-year Power Purchase Agreements (PPAs) with creditworthy corporate buyers or DISCOMs, and concessional debt from IREDA, SECI, and nationalized banks. Appraisals center around solar irradiation data, PPA tariffs, P90 generation yield simulations, and contiguous land possession.`,
    financialMetrics: {
      typicalProjectCost: '₹3.5 Cr – ₹450+ Cr',
      expectedBankFunding: '75% – 80% Debt',
      promoterContribution: '20% – 25% Equity',
      estimatedROI: '16% – 22% p.a.',
      paybackPeriod: '5.5 – 7.5 Years',
      dscr: '1.20x – 1.38x (PPA Backed)',
      breakEvenPeriod: 'Year 1 (from COD with PPA off-take)'
    },
    revenueDrivers: [
      { title: 'Long-term 25-Year PPA Tariff', description: 'Fixed or escalating tariff revenue from State DISCOMs, SECI, or group captive industrial consumers.' },
      { title: 'Open Access Commercial Power Sales', description: 'Direct supply to high-tariff commercial/industrial power consumers at competitive green tariffs.' },
      { title: 'Renewable Energy Certificates (REC)', description: 'Tradable carbon credits and green certificate monetization on Indian power exchanges.' },
      { title: 'Captive Power Cost Savings', description: 'Direct replacement of high-cost grid electricity (₹8-11/kWh) with ₹3.5-4.5/kWh solar generation.' }
    ],
    complianceAndApprovals: [
      { category: 'Grid & Power Evacuation', approvals: ['State DISCOM Grid Connectivity Feasibility & Bay Allocation Approval', 'Chief Electrical Inspector to Government (CEIG) Safety Sanction', 'State Electricity Regulatory Commission (SERC) PPA Approval'] },
      { category: 'Land & Revenue Clearances', approvals: ['25-Year Registered Land Lease / Freehold Title Search', 'Non-Agricultural (NA) Land Conversion for Renewable Energy', 'Right of Way (ROW) Clearances for Dedicated Transmission Line'] },
      { category: 'Environmental & Aviation', approvals: ['State Pollution Control Board Consent (Green Category)', 'Airport Authority of India (AAI) NOC (for Solar Glare & Height)'] }
    ],
    subSectors: [
      { name: 'Utility-Scale Solar Power Plants', description: 'Grid-connected 5MW to 100MW solar farms with DISCOM/SECI PPA.' },
      { name: 'Captive & Open Access Solar', description: 'Group captive solar setups for industrial & commercial consumers.' },
      { name: 'Biomass & Waste-to-Energy Plants', description: 'Agricultural residue power generation and compressed biogas (CBG).' }
    ],
    moratoriumPeriod: '6 – 12 Months',
    repaymentTenure: '12 – 15 Years',
    capexBreakdown: [
      { category: 'Solar PV Modules & Inverters', percentage: 60, detail: 'Tier-1 bifacial modules, central/string inverters, SCADA' },
      { category: 'Balance of Plant (BOP) & Civil', percentage: 20, detail: 'MMS structural mounting, cabling, transformer, land levelling' },
      { category: 'Transmission Line & Evacuation', percentage: 10, detail: 'Dedicated HT line, bay extension at DISCOM substation' },
      { category: 'Land Lease/Purchase & Clearances', percentage: 10, detail: 'Solar land aggregation, CEIG approval, PPA execution' }
    ],
    subsidiesAndIncentives: [
      { title: 'IREDA Concessional Financing', scheme: 'IREDA / SECI Credit Line', description: 'Low-interest long-tenure term loans with extended repayment.' },
      { title: 'Accelerated Depreciation (AD)', scheme: 'Income Tax Act Sec 32', description: '40% AD benefits for commercial and captive power producers.' },
      { title: 'Open Access Duty Waivers', scheme: 'State Renewable Energy Policy', description: 'Cross-subsidy surcharge & wheeling charge exemptions in select states.' }
    ],
    dprRequirements: [
      'Solar Resource Assessment & P50/P90 Generation Yield DPR',
      'Executed Power Purchase Agreement (PPA) / Open Access Agreement',
      'DISCOM Grid Feasibility & Power Evacuation Approval',
      'Land Ownership / 25-Year Registered Lease Agreement',
      'Detailed Financial Model with Degradation Factor & DSCR Sensitivity'
    ],
    keyRiskFactors: [
      'DISCOM payment delays (mitigated via group captive open access model)',
      'Transmission line grid curtailment or evacuation bottlenecks',
      'Solar module price volatility and safeguard duty shifts'
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Hospital Infrastructure',
    shortName: 'Healthcare',
    icon: Activity,
    tagline: 'Multi-speciality hospitals, diagnostic hubs, cancer care units, medical parks',
    description: 'Multi-speciality hospitals, diagnostic centers, speciality clinics, and medical equipment parks.',
    executiveSummary: `Demand for quality healthcare infrastructure across Tier-1, Tier-2, and Tier-3 Indian cities is accelerating. Greenfield hospital projects benefit from priority bank lending status, long loan tenures, and interest subsidies under National Health Infrastructure initiatives. Lenders evaluate doctor team credentials, bed-mix revenue economics, and medical equipment lease financing.`,
    financialMetrics: {
      typicalProjectCost: '₹5 Cr – ₹250+ Cr',
      expectedBankFunding: '70% – 75% Debt',
      promoterContribution: '25% – 30% Equity',
      estimatedROI: '18% – 25% p.a.',
      paybackPeriod: '5 – 6.5 Years',
      dscr: '1.40x – 1.65x',
      breakEvenPeriod: 'Year 2 (at 45% Bed Occupancy)'
    },
    revenueDrivers: [
      { title: 'In-Patient Department (IPD) Admissions', description: 'High-value surgical procedures, ICU critical care, and inpatient room tariffs.' },
      { title: 'Out-Patient (OPD) & Pharmacy Sales', description: 'Consultation fees and continuous, high-margin in-house 24x7 pharmacy dispensations.' },
      { title: 'Diagnostic & Imaging Services', description: 'MRI, CT Scan, Cath Lab, automated pathology tests, and health check packages.' },
      { title: 'Insurance & Corporate Empanelments', description: 'Steady patient inflow from Ayushman Bharat (PM-JAY), TPA, CGHS, and corporate tie-ups.' }
    ],
    complianceAndApprovals: [
      { category: 'Clinical & Medical Registrations', approvals: ['Clinical Establishments Act Registration', 'Atomic Energy Regulatory Board (AERB) Approval (for Radiology/CT/Cath Lab)', 'PNDT Registration for Ultrasound & Imaging'] },
      { category: 'Safety & Environment', approvals: ['State Pollution Control Board Bio-Medical Waste Authorization', 'State Fire & Safety Department NOC for High-Occupancy Buildings', 'Pharmacy Drug License (Form 20/21) for In-House Chemist'] },
      { category: 'Infrastructure & Quality', approvals: ['Local Municipal Hospital Building Sanction', 'NABH (National Accreditation Board) Readiness Alignment', 'Medical Gas Pipeline System (MGPS) Safety Certification'] }
    ],
    subSectors: [
      { name: 'Multi-speciality Hospitals', description: '100 to 500+ bed capacity with ICUs, modular OTs, and emergency care.' },
      { name: 'Super-Speciality Care Centers', description: 'Cardiology, oncology, neurology, and orthopedic centers.' },
      { name: 'Diagnostic & Pathology Chains', description: 'Advanced MRI, CT scan, PET-CT, automated pathology hubs.' }
    ],
    moratoriumPeriod: '18 – 24 Months',
    repaymentTenure: '9 – 12 Years',
    capexBreakdown: [
      { category: 'High-End Medical Equipment', percentage: 45, detail: 'CT, MRI, modular OT, cath lab, ICU ventilators, dialysis' },
      { category: 'Hospital Building & Clean Room Civil', percentage: 35, detail: 'Radiation shielding, OT air handling, patient rooms, ramps' },
      { category: 'Land & Campus Infra', percentage: 10, detail: 'Hospital plot, medical gas pipeline system, ETP' },
      { category: 'Pre-Op, NABH Approvals & Margin', percentage: 10, detail: 'PNDT, AERB licenses, NABH consultant, doctor retainer buffer' }
    ],
    subsidiesAndIncentives: [
      { title: 'Healthcare Infra Subvention Scheme', scheme: 'State Health Policy', description: 'Capital subsidy & interest subvention for hospitals in tier-2/3 cities.' },
      { title: 'Customs Duty Concessions', scheme: 'Medical Equipment Import Policy', description: 'Concessional import duty on lifesaving diagnostic machinery.' }
    ],
    dprRequirements: [
      'Catchment Area Healthcare Gap Assessment Report',
      'Promoter & Core Medical Doctor Panel Profile Dossier',
      'AERB, Pollution Board & Fire Safety Clearances Plan',
      'Equipment Procurement & Vendor Credit Structure',
      'Detailed DPR with Bed Occupancy & ARPOB (Average Revenue Per Occupied Bed) Modeling'
    ],
    keyRiskFactors: [
      'Doctor talent retention and clinical team stability',
      'Rapid technological obsolescence of diagnostic machinery',
      'Regulatory price caps on specific medical procedures and implants'
    ]
  },
  {
    id: 'hospitality',
    title: 'Hotels, Resorts & Tourism Infrastructure',
    shortName: 'Hospitality',
    icon: Hotel,
    tagline: 'Business hotels, eco resorts, convention centers & service apartments',
    description: 'Business hotels, boutique resorts, service apartments, convention centers, and wellness retreats.',
    executiveSummary: `India's hospitality sector is seeing robust RevPAR growth driven by business travel, MICE events, and domestic tourism. Greenfield hotel projects require balanced promoter equity (30%–40%) and structured term loans with comfortable moratorium tenures (18–24 months) during construction and initial brand tie-up alignment.`,
    financialMetrics: {
      typicalProjectCost: '₹5 Cr – ₹300+ Cr',
      expectedBankFunding: '60% – 65% Debt',
      promoterContribution: '35% – 40% Equity',
      estimatedROI: '15% – 22% p.a.',
      paybackPeriod: '6 – 8 Years',
      dscr: '1.30x – 1.50x',
      breakEvenPeriod: 'Year 2.5 (at 50% Room Occupancy)'
    },
    revenueDrivers: [
      { title: 'Room Inventory (ARR & RevPAR)', description: 'Average room rate (ARR) revenue generated through direct bookings, corporate rates, and OTAs.' },
      { title: 'Food & Beverage (F&B) & Banquets', description: 'High-margin banqueting for weddings, MICE corporate conferences, specialty restaurants, and bars.' },
      { title: 'Ancillary Services & Spa', description: 'Spa wellness treatments, airport transfers, laundry, and leisure activity charges.' },
      { title: 'Commercial Retail / Event Leasing', description: 'Lease rentals from banquet pop-ups, business centers, and souvenir boutique stores.' }
    ],
    complianceAndApprovals: [
      { category: 'Hospitality & Commercial Licenses', approvals: ['Local Municipal Corporation Hotel Trade License', 'FSSAI Central / State License for All Kitchens & Dining Outlets', 'Excise Bar / Liquor License (L-1 / FL-3) from State Excise Dept'] },
      { category: 'Fire, Safety & Police', approvals: ['State Fire Safety Department Final Occupancy NOC', 'Police Eating House & Lodging License', 'Lift / Escalator Inspectorate License'] },
      { category: 'Environmental & Building', approvals: ['State Pollution Board Consent for Sewage Treatment Plant (STP)', 'Ministry of Tourism Star Classification Certification', 'Copyright & Music Licensing (PPL / IPRS)'] }
    ],
    subSectors: [
      { name: 'Business & City Hotels', description: '3-star to 5-star inventory tailored for corporate travelers and events.' },
      { name: 'Eco-Resorts & Wellness Retreats', description: 'Destination resorts, spa retreats, and eco-tourism setups.' },
      { name: 'Convention & Exhibition Centers', description: 'Large banquet facilities, exhibition halls, and wedding destinations.' }
    ],
    moratoriumPeriod: '18 – 24 Months',
    repaymentTenure: '10 – 12 Years',
    capexBreakdown: [
      { category: 'Civil Building & Architectural Interiors', percentage: 50, detail: 'Guest rooms, lobby, banquets, structural civil construction' },
      { category: 'MEP, HVAC, Elevators & Kitchen Gear', percentage: 25, detail: 'Central AC, DG sets, commercial kitchen, smart room automation' },
      { category: 'Land & Site Development', percentage: 15, detail: 'Commercial land, landscaping, parking infrastructure' },
      { category: 'Pre-Operating & Brand Tie-up Fees', percentage: 10, detail: 'Hotel management operator tie-up, staff training, marketing' }
    ],
    subsidiesAndIncentives: [
      { title: 'State Tourism Policy Capital Subsidy', scheme: 'State Tourism Incentives', description: '15% to 20% capital subsidy on building & interior investment.' },
      { title: 'Luxury Tax & Electricity Duty Exemptions', scheme: 'State Concessions', description: 'Exemption for 5 to 10 years for mega tourism projects.' }
    ],
    dprRequirements: [
      'Hospitality Feasibility & RevPAR Projection Study',
      'Hotel Operator Management Agreement / Franchise LOI',
      'Building Plan Approvals & Fire NOC',
      'Environmental Clearance & Water Sanction',
      'Detailed Cash Flow Projections with Seasonal Occupancy Scenarios'
    ],
    keyRiskFactors: [
      'Seasonal occupancy variations and RevPAR sensitivity',
      'Elongated construction timelines affecting interest during construction (IDC)',
      'Evolving consumer preferences and competitor room supply additions'
    ]
  },
  {
    id: 'warehousing',
    title: 'Warehousing, Logistics & Supply Hubs',
    shortName: 'Warehousing & Logistics',
    icon: Warehouse,
    tagline: 'Grade-A logistics parks, cold storage chains, 3PL hubs & container depots',
    description: 'Industrial warehouses, logistics parks, supply chain hubs, and cold chain storage.',
    executiveSummary: `Boosted by national e-commerce growth and the PM Gati Shakti Master Plan, Grade-A warehousing projects deliver predictable, annuity-style cash flows with Lease Rental Discounting (LRD) refinancing upside. Lenders value strategic highway frontage, clear land titles, PEB structural engineering standards, and pre-lease agreements from 3PL operators.`,
    financialMetrics: {
      typicalProjectCost: '₹5 Cr – ₹350+ Cr',
      expectedBankFunding: '70% Bank Debt',
      promoterContribution: '30% Equity',
      estimatedROI: '14% – 19% p.a. (Steady Annuity)',
      paybackPeriod: '6.5 – 8.5 Years',
      dscr: '1.25x – 1.45x (Supported by Pre-Leases)',
      breakEvenPeriod: 'Year 1.5 (at 60% Leased Area)'
    },
    revenueDrivers: [
      { title: 'Long-Term Base Lease Rentals', description: '9 to 15-year fixed lease agreements with 5% annual escalation with tier-1 3PL and e-commerce tenants.' },
      { title: 'Common Area Maintenance (CAM) Charges', description: 'Monthly CAM fee covering estate security, power backup, road maintenance, and fire infrastructure.' },
      { title: 'Value-Added Logistics Services', description: 'Cross-docking fees, material handling equipment (forklift) leasing, and inventory management.' },
      { title: 'Cold Storage Temperature Premiums', description: '2.5x higher rental realizations for multi-temperature pharmaceutical and agro cold rooms.' }
    ],
    complianceAndApprovals: [
      { category: 'Land & Zoning Clearances', approvals: ['Agricultural to Non-Agricultural (NA Industrial / Logistics) Conversion', '30-Year Clear Title Search & Revenue Boundary Demarcation', 'Access Permission from National Highways Authority (NHAI) / State PWD'] },
      { category: 'Structural & Fire Safety', approvals: ['Town & Country Planning Approved Industrial Layout & PEB Drawings', 'State Fire Department Comprehensive Fire Hydrant & Sprinkler NOC', 'Gram Panchayat / Municipal Construction Sanction'] },
      { category: 'Environmental & Utilities', approvals: ['State Pollution Control Board Consent to Establish (Green Category)', 'High-Tension Dedicated Industrial Power Feeder Sanction'] }
    ],
    subSectors: [
      { name: 'Grade-A Logistics Parks', description: 'PEB structures, high floor load capacities, dock levellers, FM2 flooring.' },
      { name: 'Cold Chain Warehousing', description: 'Multi-temperature cold rooms for pharma, FMCG, and agricultural produce.' },
      { name: 'Industrial Park Warehouses', description: 'Custom built-to-suit (BTS) warehouses for manufacturing assembly & storage.' },
      { name: 'Inland Container Depots (ICD)', description: 'Container yards, customs bonded warehouses, rail-siding logistics.' }
    ],
    moratoriumPeriod: '12 Months',
    repaymentTenure: '10 – 12 Years (LRD eligible post construction)',
    capexBreakdown: [
      { category: 'Land Acquisition & Site Clearing', percentage: 40, detail: 'Strategic highway contiguous land, NA conversion, leveling' },
      { category: 'PEB Structure & Civil Works', percentage: 40, detail: 'Steel PEB superstructure, FM2 laser screed floor, roofing' },
      { category: 'Infra, Fire Fighting & Solar', percentage: 12, detail: 'Hydrant systems, paved roads, solar rooftop, security' },
      { category: 'Approvals & Pre-Op Contingency', percentage: 8, detail: 'Town planning approval, fire NOC, interest during construction' }
    ],
    subsidiesAndIncentives: [
      { title: 'PM Gati Shakti Infra Support', scheme: 'National Logistics Policy', description: 'Priority road connectivity and single-window clearance.' },
      { title: 'State Industrial Logistics Policy', scheme: 'Stamp Duty Concession', description: '50% to 100% stamp duty waiver and capital subsidy in logistics zones.' }
    ],
    dprRequirements: [
      'Micro-market Catchment & Traffic Flow Survey Report',
      'Land Title Clear Report (30-Year Search) & Zone Clearance',
      'Civil & Structural PEB Engineering Drawings',
      'Pre-Lease LOI / MoU from 3PL / E-commerce Companies',
      'Financial Model with Lease Rental Discounting (LRD) Transition Path'
    ],
    keyRiskFactors: [
      'Land acquisition delays or clear-title disputes',
      'Initial vacancy risk prior to long-term tenant lock-in',
      'Changes in regional transport regulations or highway bypass routes'
    ]
  },
  {
    id: 'education',
    title: 'Education, Universities & Skill Campuses',
    shortName: 'Education',
    icon: GraduationCap,
    tagline: 'Engineering colleges, international schools, medical universities & vocational centers',
    description: 'Schools, higher education campuses, technical training institutes, and skill development universities.',
    executiveSummary: `Education infrastructure in India is underpinned by high societal demand and recurring student fee collections. Greenfield educational campus projects require careful accreditation planning (AICTE, UGC, CBSE), substantial contiguous land parcels, and specialized trust/society debt financing structures with attractive loan tenures.`,
    financialMetrics: {
      typicalProjectCost: '₹5 Cr – ₹200+ Cr',
      expectedBankFunding: '65% – 70% Debt',
      promoterContribution: '30% – 35% Equity',
      estimatedROI: '16% – 24% p.a.',
      paybackPeriod: '5.5 – 7 Years',
      dscr: '1.35x – 1.60x',
      breakEvenPeriod: 'Year 3 (at 65% Student Enrollment)'
    },
    revenueDrivers: [
      { title: 'Tuition & Academic Term Fees', description: 'Predictable, semester-wise recurring tuition fees across primary, secondary, and graduate cohorts.' },
      { title: 'Hostel, Boarding & Cafeteria', description: 'Substantial recurring revenue from on-campus residential boarding and student meal services.' },
      { title: 'Transportation & Logistics Fees', description: 'Dedicated school bus fleet fees covering student transport zones.' },
      { title: 'Corporate Executive & Skill Programs', description: 'Weekend executive MBA, industry certification workshops, and vocational skilling programs.' }
    ],
    complianceAndApprovals: [
      { category: 'Educational Affiliations & Accreditation', approvals: ['State Education Board / CBSE / ICSE Affiliation NOC', 'AICTE / UGC Approval (for Technical / University Higher Ed)', 'National Council for Teacher Education (NCTE) / Medical Council if applicable'] },
      { category: 'Land & Trust Clearances', approvals: ['Registered Educational Trust / Section 8 Non-Profit Entity 12A/80G Clearances', 'Contiguous Land Ownership / 30-Year Lease with Institutional Land-Use Sanction', 'Building Plan Approval for Educational Occupancy'] },
      { category: 'Safety & Environmental', approvals: ['Fire Department Safety NOC for High-Density Student Campuses', 'Structural Stability Certificate by Registered Chartered Engineer', 'Food Safety (FSSAI) License for Campus Mess & Canteens'] }
    ],
    subSectors: [
      { name: 'K-12 International Schools', description: 'CBSE, ICSE, Cambridge campuses with modern smart classrooms and sports facilities.' },
      { name: 'Engineering & Technology Colleges', description: 'AICTE-approved higher education technical institutes and computing labs.' },
      { name: 'Medical & Nursing Institutes', description: 'Healthcare clinical colleges attached to functional hospital infrastructure.' },
      { name: 'Vocational & Skill Hubs', description: 'NSDC-aligned industrial training institutes (ITIs) and digital skills centers.' }
    ],
    moratoriumPeriod: '18 – 24 Months',
    repaymentTenure: '8 – 12 Years',
    capexBreakdown: [
      { category: 'Academic Building & Classrooms', percentage: 45, detail: 'Smart lecture halls, laboratories, auditoriums, PEB indoor stadiums' },
      { category: 'Hostel & Residential Blocks', percentage: 25, detail: 'Student dormitories, dining halls, staff quarters' },
      { category: 'Land & Campus Infrastructure', percentage: 18, detail: 'Contiguous acreage, sports grounds, internal paved roads' },
      { category: 'IT Infra, Lab Equipment & Pre-Op', percentage: 12, detail: 'High-speed networking, physics/chemistry labs, affiliation deposits' }
    ],
    subsidiesAndIncentives: [
      { title: 'CSR & Skill India Funding', scheme: 'NSDC Capital Grant', description: 'Concessional funding for vocational training equipment and labs.' },
      { title: 'Property Tax & Utility Concessions', scheme: 'State Educational Policy', description: 'Rebates on municipal taxes and subsidized electricity tariffs.' }
    ],
    dprRequirements: [
      'Student Demographics & Catchment Feasibility Study',
      'Affiliation Roadmap with Regulatory Compliance Matrix',
      'Master Campus Architectural & Civil Structural Plan',
      'Faculty Recruitment & Operational Budgeting Plan',
      'Financial Model with Enrollment Ramp-Up Scenarios'
    ],
    keyRiskFactors: [
      'Initial student enrollment lag during first 1–2 academic years',
      'Affiliation or inspection delays by educational regulatory bodies',
      'High faculty salary commitments during ramp-up phase'
    ]
  },
  {
    id: 'it-parks',
    title: 'IT Parks, Tech Hubs & Data Centers',
    shortName: 'IT Parks & Tech Hubs',
    icon: Server,
    tagline: 'SEZ IT parks, co-working tech campuses, hyperscale data centers & incubators',
    description: 'Commercial technology parks, data centers, software development hubs, and co-working towers.',
    executiveSummary: `Driven by India's digital transformation, AI infrastructure surge, and GCC (Global Capability Center) expansions, IT Parks and Data Centers represent high-yield, institutional asset classes. Greenfield projects benefit from SEZ status, state IT policies, long-term multinational leases, and Lease Rental Discounting (LRD) refinancing structures.`,
    financialMetrics: {
      typicalProjectCost: '₹15 Cr – ₹600+ Cr',
      expectedBankFunding: '65% – 70% Debt',
      promoterContribution: '30% – 35% Equity',
      estimatedROI: '17% – 25% p.a.',
      paybackPeriod: '5 – 7 Years',
      dscr: '1.30x – 1.55x (Lease Backed)',
      breakEvenPeriod: 'Year 2 (at 55% Leased Occupancy)'
    },
    revenueDrivers: [
      { title: 'Commercial Grade-A Office Leases', description: 'Triple-net (NNN) long-term 9-year leases with top IT services, GCCs, and multinational tech firms.' },
      { title: 'Data Center Co-location & Power Tariffs', description: 'High-yield server rack lease rentals, power usage effectiveness (PUE) markups, and cross-connect fees.' },
      { title: 'Fit-Out Amortization & CAM Rentals', description: 'Monthly charges for bespoke warm-shell and fully furnished plug-and-play tenant fit-outs.' },
      { title: 'Retail, Food Court & Amenity Leases', description: 'Revenue shares from on-campus banking branches, food courts, gyms, and convenience stores.' }
    ],
    complianceAndApprovals: [
      { category: 'Zoning & Commercial Clearances', approvals: ['IT / ITES Specific Land Zone Conversion Approval', 'SEZ Developer / Co-Developer Notification (Ministry of Commerce) if applicable', 'High-Rise Commercial Building Plan Sanction'] },
      { category: 'Utilities & Power Reliability', approvals: ['Dual-Grid Redundant High-Tension (HT) Power Feeder Approval', 'Diesel Generator (DG) Environmental Clearance for 100% Power Backup', 'Dedicated Fiber Optic Cable Right-of-Way (ROW) NOC'] },
      { category: 'Safety & Data Security', approvals: ['State Fire Safety NOC with FM-200 / Novec Clean Agent Fire Suppression Approval', 'Tier-III / Tier-IV Data Center Uptime Institute Certification', 'Local Municipal Sewage Treatment & Green Building (IGBC/LEED) Certification'] }
    ],
    subSectors: [
      { name: 'Grade-A IT & GCC Parks', description: 'Modern commercial towers, plug-and-play smart workspaces for MNC tech teams.' },
      { name: 'Edge & Hyperscale Data Centers', description: 'High-density server facilities with redundant power, cooling, and Tier-III uptime.' },
      { name: 'Incubation & Co-Working Hubs', description: 'Flexible shared office ecosystems for startups and growing enterprises.' }
    ],
    moratoriumPeriod: '18 – 24 Months',
    repaymentTenure: '9 – 12 Years',
    capexBreakdown: [
      { category: 'Commercial Superstructure Civil Works', percentage: 40, detail: 'High-strength concrete, glass facade, smart elevator banks' },
      { category: 'MEP, Precision HVAC & Redundant Power', percentage: 35, detail: 'Dual substations, chillers, UPS banks, diesel generators' },
      { category: 'Commercial Land & Development', percentage: 15, detail: 'IT corridor plot, parking basements, security perimeter' },
      { category: 'Approvals, Green Certifications & Fit-Out', percentage: 10, detail: 'LEED Gold certification, fire NOC, tenant warm-shell prep' }
    ],
    subsidiesAndIncentives: [
      { title: 'State IT/ITES Policy Subsidy', scheme: 'State IT Capital Grants', description: 'Capital subsidy of 15% to 25% on eligible investments and power tariff discounts.' },
      { title: 'Data Center Specific Incentives', scheme: 'National Data Center Policy', description: 'Exemption on electricity duty, subsidized land rates, and stamp duty waiver.' }
    ],
    dprRequirements: [
      'Commercial Real Estate Micro-Market Absorption Survey',
      'Power Availability & Redundancy Engineering Report',
      'Tenant LOIs & Pre-Lease Pipeline Documentation',
      'Green Building & Architectural Master Plan',
      'Financial Model with LRD Refinancing Transition'
    ],
    keyRiskFactors: [
      'Tenant lease absorption delays during economic tech cycles',
      'High capital intensity of precision cooling and power infrastructure',
      'Power supply stability and grid transition challenges'
    ]
  },
  {
    id: 'pharma-chemicals',
    title: 'Pharma & Specialty Chemical Manufacturing',
    shortName: 'Pharma & Chemicals',
    icon: FlaskConical,
    tagline: 'API manufacturing, formulation plants, specialty chemicals, bulk drug parks',
    description: 'Active Pharmaceutical Ingredients (API), formulations, specialty chemicals, and agrochemicals.',
    executiveSummary: `The Indian pharma & specialty chemical sector is a global leader. Greenfield project financing requires rigorous regulatory compliance (USFDA, WHO-GMP, EU-GMP), state-of-the-art Zero Liquid Discharge (ZLD) effluent treatment, and experienced chemical promoters. Banks prioritize promoter technical track records, patent security, and environmental clearances.`,
    financialMetrics: {
      typicalProjectCost: '₹10 Cr – ₹350+ Cr',
      expectedBankFunding: '70% Bank Debt',
      promoterContribution: '30% Equity',
      estimatedROI: '22% – 32% p.a.',
      paybackPeriod: '4 – 5.5 Years',
      dscr: '1.40x – 1.65x',
      breakEvenPeriod: 'Year 2 (at 50% Plant Capacity)'
    },
    revenueDrivers: [
      { title: 'Contract Manufacturing (CDMO / CMO)', description: 'Long-term manufacturing contracts with global innovator pharma companies for APIs and intermediates.' },
      { title: 'Direct API & Formulation Exports', description: 'Regulated market exports to US, EU, and emerging markets with high gross profit margins.' },
      { title: 'Specialty Chemical Industrial Off-Take', description: 'Supply to agrochemical, polymer, electronic chemical, and paint industry verticals.' },
      { title: 'Domestic Generic Formulations', description: 'Distribution through institutional hospital tenders and nationwide retail pharmacy chains.' }
    ],
    complianceAndApprovals: [
      { category: 'Environmental & Pollution Clearances', approvals: ['Environment Clearance (EC) from MoEFCC / State SEIAA (Category 5(f))', 'State Pollution Control Board Consent to Establish (CTE - Red Category)', 'Zero Liquid Discharge (ZLD) / Multi-Effect Evaporator (MEE) Plant Design Approval'] },
      { category: 'Drug Licensing & Quality', approvals: ['State & Central Drugs Standard Control Organisation (CDSCO) Manufacturing License', 'WHO-GMP & Schedule M Good Manufacturing Practice Certification', 'PESO Approval for Storage of Hazardous Solvents & Gases'] },
      { category: 'Industrial & Safety', approvals: ['Factory Inspectorate Hazardous Process Approval', 'Fire Department Specialized Chemical Hazard NOC', 'Boiler & High-Pressure Reactor Clearances'] }
    ],
    subSectors: [
      { name: 'Active Pharmaceutical Ingredients (API)', description: 'Bulk drug synthesis, high-potency API, intermediate chemical manufacturing.' },
      { name: 'Formulation Manufacturing Units', description: 'Tablets, capsules, injectables, liquids with WHO-GMP certification.' },
      { name: 'Specialty Chemicals & Polymers', description: 'Performance chemicals, agrochemical intermediates, fine chemicals.' }
    ],
    moratoriumPeriod: '18 – 24 Months',
    repaymentTenure: '8 – 10 Years',
    capexBreakdown: [
      { category: 'Chemical Reactors & Processing Gear', percentage: 45, detail: 'SS/Glass-lined reactors, centrifuges, clean rooms, HVAC' },
      { category: 'ZLD ETP Plant & Environmental Civil', percentage: 25, detail: 'Multiple effect evaporators (MEE), RO systems, safe storage' },
      { category: 'Land & Industrial Chemical Infrastructure', percentage: 15, detail: 'GIDC/MIDC/RIICO chemical plot, steam boilers, fire safety' },
      { category: 'Testing Lab, Validations & Pre-Op', percentage: 15, detail: 'HPLC, GC testing labs, WHO-GMP validation, trial batches' }
    ],
    subsidiesAndIncentives: [
      { title: 'PLI Scheme for Bulk Drugs / APIs', scheme: 'Ministry of Chemicals & Fertilizers', description: 'Financial incentives on incremental sales of key APIs.' },
      { title: 'Bulk Drug Park Subsidies', scheme: 'Central & State Park Grants', description: 'Common infrastructure usage, power & steam cost reductions.' }
    ],
    dprRequirements: [
      'Environment Clearance (EC) from MoEFCC / State SEIAA (Category 5(f))',
      'Detailed Plant Layout & ZLD Engineering Design',
      'Drug License Application & GMP Compliance Roadmap',
      'Raw Material Sourcing Security & Buyer MoU Agreements',
      'Comprehensive Debt Syndication Financial Model'
    ],
    keyRiskFactors: [
      'Delays in obtaining Environment Clearance (EC) or Drug Licenses',
      'Environmental compliance penalties if ETP operations fail',
      'Global price fluctuations of key chemical starting materials (KSM)'
    ]
  },
  {
    id: 'textile',
    title: 'Textile, Spinning & Garmenting',
    shortName: 'Textile & Garments',
    icon: Shirt,
    tagline: 'Yarn spinning, weaving mills, processing & dyeing, technical textiles, apparel units',
    description: 'Garment manufacturing, weaving, spinning, textile processing, dyeing, and technical textiles.',
    executiveSummary: `The Indian textile sector is a massive employment generator and export engine. Greenfield units benefit from the PM MITRA scheme, amended state textile policies, and interest subvention. Lenders evaluate modern technology adoption (shuttleless looms, automated spinning), Zero Liquid Discharge (ZLD) effluent compliance, and export order books.`,
    financialMetrics: {
      typicalProjectCost: '₹3 Cr – ₹180+ Cr',
      expectedBankFunding: '70% – 75% Debt',
      promoterContribution: '25% – 30% Equity',
      estimatedROI: '18% – 25% p.a.',
      paybackPeriod: '4.5 – 6 Years',
      dscr: '1.35x – 1.55x',
      breakEvenPeriod: 'Year 2 (at 52% Capacity)'
    },
    revenueDrivers: [
      { title: 'Global Brand Apparel Exports', description: 'Direct export orders for global retail clothing brands with foreign currency receivables.' },
      { title: 'Yarn & Fabric B2B Supply', description: 'Volume supply of processed yarn and grey/finished fabric to domestic apparel manufacturers.' },
      { title: 'High-Value Technical Textiles', description: 'Specialized non-woven, geotextile, medical textile, and automotive fabric manufacturing.' },
      { title: 'Job-Work & Dyeing Processing', description: 'High-margin commission job-work for spinning, printing, and fabric finishing.' }
    ],
    complianceAndApprovals: [
      { category: 'Environmental & Effluent', approvals: ['State Pollution Control Board Consent (Red Category for Dyeing/Bleaching)', 'Zero Liquid Discharge (ZLD) ETP Installation Approval', 'Hazardous Sludge Disposal Agreement'] },
      { category: 'Industrial & Labor', approvals: ['Factory Inspectorate Registration & Structural Safety Plan', 'State Power Sanction for High-Tension Loom Drives', 'Boiler Inspectorate Registration for Steam Generation'] },
      { category: 'Export & Scheme', approvals: ['Textile Commissioner Registration', 'ATUFS / State Textile Scheme Capital Subsidy Registration'] }
    ],
    subSectors: [
      { name: 'Garmenting & Apparel Units', description: 'High-volume apparel stitching, embroidery, washing, and export packaging.' },
      { name: 'Weaving & Knitting Mills', description: 'Air-jet, rapier shuttleless looms, circular knitting machines.' },
      { name: 'Textile Processing & Dyeing', description: 'Continuous bleaching, dyeing ranges, printing machines with Zero Liquid Discharge (ZLD).' },
      { name: 'Technical Textiles & Non-Woven', description: 'Geotextiles, medical textiles, automotive fabrics, and protective wear.' }
    ],
    moratoriumPeriod: '12 – 18 Months',
    repaymentTenure: '7 – 9 Years',
    capexBreakdown: [
      { category: 'Spinning/Weaving Machinery', percentage: 55, detail: 'High-speed automated machinery, testing equipment' },
      { category: 'Factory Building & ZLD ETP Plant', percentage: 25, detail: 'Humidity control civil sheds, water treatment, ZLD plant' },
      { category: 'Utilities & Power Backup', percentage: 10, detail: 'Captive solar setup, steam boilers, transformers' },
      { category: 'Land & Working Capital Margin', percentage: 10, detail: 'Plot acquisition, raw cotton/yarn stock margin' }
    ],
    subsidiesAndIncentives: [
      { title: 'ATUFS Capital Subsidy', scheme: 'Amended Technology Upgradation Fund Scheme', description: '10% to 15% capital subsidy on benchmarked machinery.' },
      { title: 'State Textile Policy Subsidy', scheme: 'State Interest Subvention', description: '5% to 7% interest subvention on term loans for up to 7 years.' },
      { title: 'PM MITRA Park Incentives', scheme: 'Integrated Textile Park Subsidy', description: 'Plug-and-play infra, power tariff discounts, common ETP usage.' }
    ],
    dprRequirements: [
      'Comprehensive Technology Selection Report',
      'Environmental Clearance & ZLD ETP Technical DPR',
      'Power & Steam Utility Requirement Assessment',
      'Working Capital Working (Cotton Yarn Inventory Days)',
      'State Textile Policy Subsidy Eligibility Framework'
    ],
    keyRiskFactors: [
      'Fluctuations in cotton and synthetic yarn prices',
      'Environmental compliance costs for dyeing and processing units',
      'International trade tariff shifts and export buyer order cycles'
    ]
  },
  {
    id: 'infrastructure-epc',
    title: 'Infrastructure, Construction & EPC',
    shortName: 'Infrastructure EPC',
    icon: HardHat,
    tagline: 'Civil construction, industrial EPC, roads & bridges, urban infrastructure',
    description: 'Industrial construction contracting, road infrastructure, urban utilities, and EPC project execution.',
    executiveSummary: `Infrastructure contracting is powered by massive capital expenditure allocations from Central and State Governments (NHAI, PWD, Railways). Greenfield EPC setups and heavy equipment banks require hybrid financing—equipment term loans combined with non-fund-based (NFB) limits like Bank Guarantees (BG) and Letters of Credit (LC).`,
    financialMetrics: {
      typicalProjectCost: '₹10 Cr – ₹500+ Cr',
      expectedBankFunding: '70% – 75% Debt (Fund & Non-Fund)',
      promoterContribution: '25% – 30% Equity',
      estimatedROI: '19% – 28% p.a.',
      paybackPeriod: '4 – 5.5 Years',
      dscr: '1.30x – 1.50x',
      breakEvenPeriod: 'Year 1.5 (with Active Order Book)'
    },
    revenueDrivers: [
      { title: 'Government EPC Contract Billings', description: 'Milestone-based progress billing on awarded NHAI, PWD, railway, and urban development projects.' },
      { title: 'Private Turnkey Industrial Construction', description: 'High-margin turnkey factory, warehouse, and commercial building execution contracts.' },
      { title: 'Heavy Equipment Rental & Fleet Leasing', description: 'Secondary revenue from leasing idle batching plants, transit mixers, and cranes to subcontractors.' },
      { title: 'Annuity & HAM Concession Payments', description: 'Long-term bi-annual annuity payments on Hybrid Annuity Model (HAM) highway projects.' }
    ],
    complianceAndApprovals: [
      { category: 'Contractor Registration & Licensing', approvals: ['State PWD / CPWD / NHAI Class-1 Contractor Approval', 'Labor Department Contract Labor License', 'Tender Enlistment & Technical Pre-Qualification Credentials'] },
      { category: 'Safety & Equipment', approvals: ['Pollution Board Consent for Ready-Mix Concrete (RMC) & Stone Crusher Plants', 'PESO Diesel Storage Consumer Pump License', 'Mining Department Quarrying License for Aggregates & Sand'] },
      { category: 'Financial & Guarantees', approvals: ['Bank Performance Guarantee & Advance Payment Guarantee Sanction Limits', 'Letter of Credit (LC) Facility for Raw Materials (Steel/Cement)'] }
    ],
    subSectors: [
      { name: 'Industrial Civil Contracting', description: 'Turnkey factory construction, PEB sheds, heavy foundations.' },
      { name: 'Roads, Highways & Bridges', description: 'NHAI, State PWD, HAM & EPC road construction contracting.' },
      { name: 'Urban Utilities & Water Supply', description: 'Pipeline networks, water treatment plants, urban infra.' }
    ],
    moratoriumPeriod: '12 Months',
    repaymentTenure: '5 – 7 Years (Equipment Loan) & Working Capital Limits',
    capexBreakdown: [
      { category: 'Heavy Earthmoving & Construction Machinery', percentage: 55, detail: 'Excavators, batching plants, pavers, cranes, tippers' },
      { category: 'Non-Fund Based Limits (BG / LC Margin)', percentage: 25, detail: 'Margin money for performance bank guarantees and LC' },
      { category: 'Workshop Yard & Office Infra', percentage: 10, detail: 'Equipment maintenance yard, testing lab, site offices' },
      { category: 'Working Capital & Pre-op Expenses', percentage: 10, detail: 'Mobilization advances, tender deposits, engineering team' }
    ],
    subsidiesAndIncentives: [
      { title: 'National Infrastructure Pipeline (NIP)', scheme: 'NIP Priority Credit', description: 'Priority credit underwriting for qualified contractors.' },
      { title: 'MSME Guarantee Cover', scheme: 'CGTMSE Coverage', description: 'Collateral-free credit guarantee for MSME machinery purchases.' }
    ],
    dprRequirements: [
      'Order Book Profile & Awarded Govt / Industrial Tenders',
      'Contractor Class Approval & Technical Capability Credentials',
      'Equipment Fleet Capacity & Maintenance Plan',
      'Cash Flow Projections with Working Capital & BG Limit Structuring',
      'Detailed Financial Feasibility Report'
    ],
    keyRiskFactors: [
      'Delayed payments from government departments or project principals',
      'Working capital strain due to bank guarantee margin blockages',
      'Variations in diesel, cement, and steel input costs'
    ]
  }
];

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  onSelectIndustryForAssessment,
  onOpenConsultation,
  selectedIndustryName
}) => {
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [cardActiveTab, setCardActiveTab] = useState<Record<string, 'financials' | 'revenue' | 'compliance'>>({});

  const toggleExpandCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setTabForCard = (id: string, tab: 'financials' | 'revenue' | 'compliance', e: React.MouseEvent) => {
    e.stopPropagation();
    setCardActiveTab((prev) => ({ ...prev, [id]: tab }));
    // Auto expand card if collapsed
    setExpandedCardIds((prev) => new Set(prev).add(id));
  };

  // Auto-select if selectedIndustryName is passed
  useEffect(() => {
    if (selectedIndustryName) {
      const match = DETAILED_INDUSTRIES.find(
        (ind) =>
          ind.title.toLowerCase().includes(selectedIndustryName.toLowerCase()) ||
          ind.shortName.toLowerCase().includes(selectedIndustryName.toLowerCase()) ||
          ind.id.toLowerCase().includes(selectedIndustryName.toLowerCase())
      );
      if (match) {
        setActiveSectorId(match.id);
      }
    }
  }, [selectedIndustryName]);

  const activeSector = useMemo(() => {
    return DETAILED_INDUSTRIES.find((ind) => ind.id === activeSectorId) || null;
  }, [activeSectorId]);

  const handleOpenDetail = (sectorId: string) => {
    setActiveSectorId(sectorId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveSectorId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-[#111827] min-h-screen py-12 sm:py-20 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* VIEW MODE A: FULL DETAILED SECTOR PAGE (When a sector is selected) */}
        {/* ========================================================================= */}
        {activeSector ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12 text-left"
          >
            {/* Top Back Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#111827] font-semibold text-sm rounded-xl transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
                <span>Back to All Greenfield Sectors</span>
              </button>
            </div>

            {/* Sector Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-md space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  {React.createElement(activeSector.icon, { className: 'w-7 h-7' })}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Comprehensive Greenfield Sector Intelligence
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-manrope text-white tracking-tight mt-1">
                    {activeSector.title}
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 font-inter max-w-3xl leading-relaxed">
                {activeSector.tagline}
              </p>

              {/* Complete Financial Parameters Grid (7 Metrics) */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block">
                  Core Financial Parameters & Underwriting Norms
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Project Cost</span>
                    <span className="text-xs sm:text-sm font-bold text-blue-400 font-manrope">{activeSector.financialMetrics.typicalProjectCost}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Bank Debt %</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-manrope">{activeSector.financialMetrics.expectedBankFunding}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Promoter Margin</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200 font-manrope">{activeSector.financialMetrics.promoterContribution}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Estimated ROI</span>
                    <span className="text-xs sm:text-sm font-bold text-purple-400 font-manrope">{activeSector.financialMetrics.estimatedROI}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Payback Period</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-400 font-manrope">{activeSector.financialMetrics.paybackPeriod}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Min DSCR</span>
                    <span className="text-xs sm:text-sm font-bold text-cyan-400 font-manrope">{activeSector.financialMetrics.dscr}</span>
                  </div>
                  <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Break-Even</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-300 font-manrope">{activeSector.financialMetrics.breakEvenPeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Information Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Comprehensive Detailed Content (8 cols) */}
              <div className="lg:col-span-8 space-y-10">
                
                {/* 1. Executive Summary & Market Dynamics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
                  <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827] flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span>Executive Sector Overview & Feasibility Dynamics</span>
                  </h2>
                  <p className="text-base text-[#4B5563] leading-[1.7] whitespace-pre-line font-inter">
                    {activeSector.executiveSummary}
                  </p>
                </div>

                {/* 2. Key Revenue Drivers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Income Generation Model
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827] flex items-center gap-2">
                      <Coins className="w-6 h-6 text-emerald-600" />
                      <span>Key Revenue Drivers</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSector.revenueDrivers.map((rd, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/70 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{rd.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter">
                          {rd.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Required Compliance & Approvals */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Statutory Clearance Roadmap
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827] flex items-center gap-2">
                      <Scale className="w-6 h-6 text-blue-600" />
                      <span>Required Compliance & Approvals</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeSector.complianceAndApprovals.map((cat, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>{cat.category}</span>
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 font-inter">
                          {cat.approvals.map((app, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80">
                              <span className="text-blue-600 font-bold">•</span>
                              <span>{app}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Key Sub-Sectors & Applications */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Scope & Verticals
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827]">
                      Sub-Sectors & Eligible Greenfield Verticals
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSector.subSectors.map((sub, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center gap-2 font-semibold text-[#111827] text-base">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{sub.name}</span>
                        </div>
                        <p className="text-sm text-[#4B5563] leading-[1.5]">
                          {sub.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Capital Expenditure (Capex) Structure Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Project Cost Structure
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827]">
                      Typical Greenfield Capex Cost Allocation
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeSector.capexBreakdown.map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between text-sm sm:text-base font-semibold text-[#111827]">
                          <span className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            {item.category}
                          </span>
                          <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-bold">
                            {item.percentage}% of Capex
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6B7280]">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Government Schemes & Capital Subsidies */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Incentives Framework
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827]">
                      Government Subsidies & Concessions
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeSector.subsidiesAndIncentives.map((sub, idx) => (
                      <div key={idx} className="p-5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-blue-950 text-base">
                            {sub.title}
                          </h3>
                          <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md shrink-0">
                            {sub.scheme}
                          </span>
                        </div>
                        <p className="text-sm text-[#4B5563] leading-[1.5]">
                          {sub.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. DPR & Bankability Checklist */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Bank Appraisal Deliverables
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#111827]">
                      Required DPR & Credit Documentation Checklist
                    </h2>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#374151]">
                    {activeSector.dprRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Right Column: Sticky Sector Action Card & Credit Parameters (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Credit Underwriting Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs sticky top-24">
                  <h3 className="text-lg font-bold font-manrope text-[#111827] border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Lead Bank Credit Parameters</span>
                  </h3>

                  <div className="space-y-4 text-sm font-inter">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-500">Repayment Moratorium</span>
                      <p className="font-semibold text-[#111827] text-base">{activeSector.moratoriumPeriod}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-500">Term Loan Tenure</span>
                      <p className="font-semibold text-[#111827] text-base">{activeSector.repaymentTenure}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-500">Debt Service Coverage (DSCR)</span>
                      <p className="font-semibold text-blue-700 text-base">{activeSector.financialMetrics.dscr}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-500">Expected ROI</span>
                      <p className="font-semibold text-purple-700 text-base">{activeSector.financialMetrics.estimatedROI}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <span className="text-xs font-semibold uppercase text-gray-500 block">Key Risk Sensitivities</span>
                      <ul className="space-y-1.5 text-xs text-[#4B5563]">
                        {activeSector.keyRiskFactors.map((rf, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <button
                      onClick={() => onSelectIndustryForAssessment(activeSector.title)}
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer font-manrope font-bold"
                    >
                      <span>Start {activeSector.shortName} Assessment</span>
                    </button>

                    <button
                      onClick={onOpenConsultation}
                      className="w-full py-3 px-4 border border-gray-300 hover:border-blue-500 text-[#111827] font-semibold text-sm rounded-xl transition-all flex items-center justify-center bg-gray-50 hover:bg-blue-50 cursor-pointer"
                    >
                      <span>Talk to Sector Specialist</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Back Button */}
            <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-[#111827] font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span>Back to All Greenfield Sectors</span>
              </button>
              
              <button
                onClick={onOpenConsultation}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Book Advisory Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE B: COMPACT GRID + ACCORDION TABS (Industry Directory) */
          /* ========================================================================= */
          <div className="space-y-8 sm:space-y-10">
            
            {/* 1. Header */}
            <section className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Greenfield Sector Directory</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] tracking-tight font-manrope leading-tight">
                Greenfield Industries & Project Intelligence
              </h1>

              <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed max-w-xl mx-auto">
                Explore comprehensive sector parameters including Revenue Drivers, Compliance & Approvals, Project Costs, Expected Bank Debt, and Payback Periods.
              </p>
            </section>

            {/* 2. Industry Cards Grid (3 Columns, Compact Sizing) */}
            <section className="space-y-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] font-manrope">
                    All Greenfield Sectors
                  </h2>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {DETAILED_INDUSTRIES.length} Sectors
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 items-start">
                {DETAILED_INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const isExpanded = expandedCardIds.has(ind.id);
                    const currentTab = cardActiveTab[ind.id] || 'financials';

                    return (
                      <div
                        key={ind.id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 shadow-2xs hover:shadow-md transition-all duration-200 p-4 text-left flex flex-col justify-between group"
                      >
                        {/* Top Content */}
                        <div className="space-y-3">
                          {/* Header: Icon, Category Pill, Outlay Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-100/70 inline-block">
                                  {ind.shortName}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/70 shrink-0 font-manrope">
                              {ind.financialMetrics.typicalProjectCost}
                            </span>
                          </div>

                          {/* Industry Title */}
                          <div>
                            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 font-manrope leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                              {ind.title}
                            </h3>
                            {/* Brief Description - concise 2-line clamp */}
                            <p className="text-xs text-slate-500 font-inter leading-relaxed line-clamp-2 mt-1 min-h-[32px]">
                              {ind.description}
                            </p>
                          </div>

                          {/* Financial Parameters Quick Compact Matrix */}
                          <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50/90 rounded-xl border border-slate-200/70 text-center">
                            <div className="px-1">
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Bank Debt</span>
                              <span className="text-[11px] font-bold text-slate-800 block truncate">{ind.financialMetrics.expectedBankFunding}</span>
                            </div>
                            <div className="px-1 border-x border-slate-200/60">
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Est. ROI</span>
                              <span className="text-[11px] font-bold text-purple-700 block truncate">{ind.financialMetrics.estimatedROI}</span>
                            </div>
                            <div className="px-1">
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Payback</span>
                              <span className="text-[11px] font-bold text-emerald-700 block truncate">{ind.financialMetrics.paybackPeriod}</span>
                            </div>
                          </div>

                          {/* Interactive Compact Micro-Tabs */}
                          <div className="pt-1">
                            {/* Tab Selectors */}
                            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                              <button
                                onClick={(e) => setTabForCard(ind.id, 'financials', e)}
                                className={`flex-1 py-1 px-1.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer truncate ${
                                  isExpanded && currentTab === 'financials'
                                    ? 'bg-white text-blue-600 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Financials
                              </button>
                              <button
                                onClick={(e) => setTabForCard(ind.id, 'revenue', e)}
                                className={`flex-1 py-1 px-1.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer truncate ${
                                  isExpanded && currentTab === 'revenue'
                                    ? 'bg-white text-emerald-600 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Revenue
                              </button>
                              <button
                                onClick={(e) => setTabForCard(ind.id, 'compliance', e)}
                                className={`flex-1 py-1 px-1.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer truncate ${
                                  isExpanded && currentTab === 'compliance'
                                    ? 'bg-white text-blue-600 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Approvals
                              </button>
                            </div>

                            {/* Accordion Content Panel */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-2">
                                    {/* Tab 1: Detailed Financial Parameters */}
                                    {currentTab === 'financials' && (
                                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase font-bold block">Promoter Margin:</span>
                                            <span className="font-semibold text-slate-800">{ind.financialMetrics.promoterContribution}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase font-bold block">Min DSCR:</span>
                                            <span className="font-semibold text-blue-700">{ind.financialMetrics.dscr}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase font-bold block">Break-Even:</span>
                                            <span className="font-semibold text-slate-800">{ind.financialMetrics.breakEvenPeriod}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase font-bold block">Repayment:</span>
                                            <span className="font-semibold text-slate-800">{ind.repaymentTenure}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Tab 2: Key Revenue Drivers */}
                                    {currentTab === 'revenue' && (
                                      <div className="p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-1 text-[11px]">
                                        <ul className="space-y-1 text-slate-700">
                                          {ind.revenueDrivers.slice(0, 3).map((rd, rIdx) => (
                                            <li key={rIdx} className="flex items-start gap-1">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                              <div className="line-clamp-2">
                                                <strong className="text-slate-900">{rd.title}: </strong>
                                                <span className="text-slate-600">{rd.description}</span>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Tab 3: Required Compliance & Approvals */}
                                    {currentTab === 'compliance' && (
                                      <div className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-1 text-[11px]">
                                        <ul className="space-y-1 text-slate-700">
                                          {ind.complianceAndApprovals.flatMap((c) => c.approvals).slice(0, 3).map((app, aIdx) => (
                                            <li key={aIdx} className="flex items-start gap-1">
                                              <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                                              <span className="line-clamp-1">{app}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => toggleExpandCard(ind.id, e)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'Quick Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(ind.id)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 font-manrope inline-flex items-center gap-0.5 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-blue-50"
                            >
                              <span>Know More</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => onSelectIndustryForAssessment(ind.title)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-manrope font-bold text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
                            >
                              Check Eligibility
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </section>

            {/* 3. Global Call-to-Action Section */}
            <section className="pt-4">
              <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white text-center border border-blue-500/30 shadow-md">
                <div className="max-w-[700px] mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Bank-Ready Execution</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white font-manrope tracking-tight leading-[1.2]">
                    Ready to Start Your Greenfield Project?
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 font-inter leading-[1.6]">
                    "Let Inisio guide you from idea to funding with expert project planning and bank loan assistance."
                  </p>

                  <div className="pt-1 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={onOpenConsultation}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold font-manrope text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Book Free Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
};
