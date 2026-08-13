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
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ArrowLeft,
  Calculator,
  FileText,
  ShieldCheck,
  TrendingUp,
  Coins,
  Building2,
  Percent,
  Clock,
  Briefcase,
  Layers,
  HelpCircle,
  Download,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface IndustriesSectionProps {
  onSelectIndustryForAssessment: (industryName: string) => void;
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
  selectedIndustryName?: string;
}

export interface SectorDetailData {
  id: string;
  title: string;
  shortName: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  executiveSummary: string;
  subSectors: { name: string; description: string }[];
  costRange: string;
  equityNorm: string;
  typicalDebtRatio: string;
  recommendedDSCR: string;
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
    executiveSummary: `India's manufacturing sector is undergoing unprecedented expansion driven by national initiatives like Make in India, PLI schemes, and global supply chain diversification. Greenfield manufacturing projects require meticulous capital planning, land procurement in industrial corridors, precise machinery selection, and bankable financial projections that meet conservative public and private bank debt underwriting norms.`,
    subSectors: [
      { name: 'Precision Engineering & Tooling', description: 'CNC machining, die & mold manufacturing, high-precision industrial components.' },
      { name: 'Fabrication & Structural Steel', description: 'Heavy structural fabrication, pressure vessels, boilers, and industrial frameworks.' },
      { name: 'Auto Components & Assemblies', description: 'OEM tier-1 & tier-2 supply chains, EV chassis, engine parts, and electrical systems.' },
      { name: 'Plastics, Polymers & Packaging', description: 'Injection molding, blow molding, flexible packaging, and eco-friendly polymers.' },
      { name: 'Capital Goods & Heavy Machinery', description: 'Industrial equipment manufacturing, material handling systems, and pumps.' }
    ],
    costRange: '₹2 Cr – ₹250+ Cr',
    equityNorm: '20% – 30% Equity',
    typicalDebtRatio: '70% Bank Debt / 30% Equity',
    recommendedDSCR: '1.35x – 1.60x Minimum',
    moratoriumPeriod: '12 – 18 Months during Civil & Erection Phase',
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
      { title: 'Technical Feasibility Report (TEFR)' },
      { title: 'Pollution Control Consent to Establish (CTE - Orange/Green/Red Category)' },
      { title: 'Industrial Power Sanction & Load Allocation (HT Connection)' },
      { title: 'OEM Off-take Agreements or Letter of Intent (LOI)' },
      { title: 'Detailed Machine Layout & Civil Structural Engineering Plan' },
      { title: 'Comprehensive Financial Model with Sensitivity & Break-Even Analysis' }
    ].map(item => item.title),
    keyRiskFactors: [
      'Fluctuations in raw material prices (steel, aluminum, polymer granules)',
      'Delays in HT power connection or machinery erection',
      'Working capital lock-in due to elongated credit periods for OEM buyers'
    ]
  },
  {
    id: 'food-processing',
    title: 'Food Processing & Agro Industries',
    shortName: 'Food Processing',
    icon: Sprout,
    tagline: 'Rice & grain mills, dairy processing, cold chain logistics, spices & frozen foods',
    description: 'Grain processing, dairy units, cold chains, fruits & vegetable processing, spices, and packaged foods.',
    executiveSummary: `Food processing is a thrust sector in India with immense government backing through PMKSY and NABARD funds. Greenfield agro projects benefit from high capital subsidy grants (up to 50%), interest subvention, and robust local raw material availability. Bank appraisal focuses heavily on raw material seasonal supply chains, working capital management, FSSAI compliance, and cold storage infrastructure.`,
    subSectors: [
      { name: 'Rice & Grain Processing Mills', description: 'Modern automated paddy processing, color sorters, and parboiling units.' },
      { name: 'Dairy & Milk Processing Plants', description: 'Pasteurization, ghee, cheese, milk powder, and cold chain distribution.' },
      { name: 'Cold Storage & Integrated Cold Chains', description: 'Controlled atmosphere (CA) stores, multi-commodity cold rooms, reefer vans.' },
      { name: 'Spices, Seasoning & Extraction', description: 'Grinding, steam sterilization, oleoresin extraction, and export packaging.' },
      { name: 'Fruits, Vegetables & Frozen Foods', description: 'IQF processing, fruit pulp processing, canning, and ready-to-eat foods.' }
    ],
    costRange: '₹1 Cr – ₹120+ Cr',
    equityNorm: '15% – 25% Equity',
    typicalDebtRatio: '75% Debt / 25% Equity (Grant-assisted)',
    recommendedDSCR: '1.40x – 1.70x',
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
      { title: 'Agro Industrial Policy Subsidy', scheme: 'State Agriculture Subsidies', description: 'Stamp duty exemption, SGST reimbursement, and power subsidy.' }
    ],
    dprRequirements: [
      'Raw Material Procurement Tie-up Plan (Farmer Catchment Area Study)',
      'FSSAI & Pollution Control Board Clearances',
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
    id: 'textile',
    title: 'Textile, Spinning & Garmenting',
    shortName: 'Textile',
    icon: Shirt,
    tagline: 'Yarn spinning, weaving mills, processing & dyeing, technical textiles, apparel units',
    description: 'Garment manufacturing, weaving, spinning, textile processing, dyeing, and technical textiles.',
    executiveSummary: `The Indian textile sector is a major employment generator and export driver. Greenfield textile units benefit from the PM MITRA scheme, state textile policies, and interest subvention. Lenders evaluate modern technology adoption (shuttleless looms, automated spinning), effluent treatment plant (ETP/ZLD) compliance, and export order books.`,
    subSectors: [
      { name: 'Garmenting & Apparel Units', description: 'High-volume apparel stitching, embroidery, washing, and export packaging.' },
      { name: 'Weaving & Knitting Mills', description: 'Air-jet, rapier shuttleless looms, circular knitting machines.' },
      { name: 'Textile Processing & Dyeing', description: 'Continuous bleaching, dyeing ranges, printing machines with Zero Liquid Discharge (ZLD).' },
      { name: 'Technical Textiles & Non-Woven', description: 'Geotextiles, medical textiles, automotive fabrics, and protective wear.' }
    ],
    costRange: '₹3 Cr – ₹180+ Cr',
    equityNorm: '20% – 30% Equity',
    typicalDebtRatio: '70% Debt / 30% Equity',
    recommendedDSCR: '1.35x – 1.55x',
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
    id: 'warehousing',
    title: 'Warehousing & Logistics Parks',
    shortName: 'Warehousing',
    icon: Warehouse,
    tagline: 'Grade-A industrial logistics parks, cold storage facilities, inland container depots',
    description: 'Industrial warehouses, logistics parks, supply chain hubs, and cold chain storage.',
    executiveSummary: `With e-commerce boom and National Logistics Policy (PM Gati Shakti), Grade-A warehousing projects offer predictable, annuity-style cash flows. Lenders assess location advantage (highway proximity), land clear titles, PEB structure quality, and pre-lease agreements (LOIs) from major logistics and 3PL operators.`,
    subSectors: [
      { name: 'Grade-A Logistics Parks', description: 'PEB structures, high floor load capacities, dock levellers, FM2 flooring.' },
      { name: 'Cold Chain Warehousing', description: 'Multi-temperature cold rooms for pharma, FMCG, and agricultural produce.' },
      { name: 'Industrial Park Warehouses', description: 'Custom built-to-suit (BTS) warehouses for manufacturing assembly & storage.' },
      { name: 'Inland Container Depots (ICD)', description: 'Container yards, customs bonded warehouses, rail-siding logistics.' }
    ],
    costRange: '₹5 Cr – ₹300+ Cr',
    equityNorm: '25% – 35% Equity',
    typicalDebtRatio: '65% Debt / 35% Equity',
    recommendedDSCR: '1.25x – 1.45x (Supported by long-term lease LOIs)',
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
    id: 'hospitality',
    title: 'Hotels, Resorts & Tourism Infrastructure',
    shortName: 'Hospitality',
    icon: Hotel,
    tagline: 'Business hotels, eco resorts, convention centers & service apartments',
    description: 'Business hotels, boutique resorts, service apartments, convention centers, and wellness retreats.',
    executiveSummary: `India's hospitality sector is experiencing strong RevPAR growth driven by domestic tourism, MICE events, and business travel. Greenfield hotel projects require balanced equity participation (30-40%) and structured term loans with comfortable moratorium periods during construction and initial brand tie-up alignment.`,
    subSectors: [
      { name: 'Business & City Hotels', description: '3-star to 5-star inventory tailored for corporate travelers and events.' },
      { name: 'Eco-Resorts & Wellness Retreats', description: 'Destination resorts, spa retreats, and eco-tourism setups.' },
      { name: 'Convention & Exhibition Centers', description: 'Large banquet facilities, exhibition halls, and wedding destinations.' }
    ],
    costRange: '₹5 Cr – ₹250+ Cr',
    equityNorm: '30% – 40% Equity',
    typicalDebtRatio: '60% Debt / 40% Equity',
    recommendedDSCR: '1.30x – 1.50x',
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
    id: 'healthcare',
    title: 'Healthcare & Hospital Infrastructure',
    shortName: 'Healthcare',
    icon: Activity,
    tagline: 'Multi-speciality hospitals, diagnostic hubs, cancer care units, medical parks',
    description: 'Multi-speciality hospitals, diagnostic centers, speciality clinics, and medical equipment parks.',
    executiveSummary: `Demand for quality healthcare infrastructure across Tier-1, Tier-2, and Tier-3 Indian cities is accelerating. Greenfield hospital projects benefit from priority bank lending status, long term loan tenures, and government interest subsidies under National Health Infrastructure initiatives. Lenders evaluate doctor team credentials, bed-mix revenue economics, and medical equipment financing structure.`,
    subSectors: [
      { name: 'Multi-speciality Hospitals', description: '100 to 500+ bed capacity with ICUs, modular OTs, and emergency care.' },
      { name: 'Super-Speciality Care Centers', description: 'Cardiology, oncology, neurology, and orthopedic centers.' },
      { name: 'Diagnostic & Pathology Chains', description: 'Advanced MRI, CT scan, PET-CT, automated pathology hubs.' }
    ],
    costRange: '₹3 Cr – ₹200+ Cr',
    equityNorm: '20% – 30% Equity',
    typicalDebtRatio: '70% Debt / 30% Equity',
    recommendedDSCR: '1.40x – 1.65x',
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
    id: 'renewable-energy',
    title: 'Renewable Energy & Solar Plants',
    shortName: 'Renewable Energy',
    icon: Sun,
    tagline: 'Solar power plants, wind energy, captive power generation, green hydrogen',
    description: 'Solar power plants, wind farms, captive industrial solar, biomass, and green hydrogen projects.',
    executiveSummary: `Greenfield renewable energy projects enjoy strong ESG momentum, long-term Power Purchase Agreements (PPAs) with creditworthy corporate buyers or DISCOMs, and concessional financing from IREDA, SECI, and nationalized banks. Appraisal revolves around solar irradiation data, PPA tariffs, P90 yield estimates, and land possession continuity.`,
    subSectors: [
      { name: 'Utility-Scale Solar Power Plants', description: 'Grid-connected 5MW to 100MW solar farms with DISCOM/SECI PPA.' },
      { name: 'Captive & Open Access Solar', description: 'Group captive solar setups for industrial & commercial consumers.' },
      { name: 'Biomass & Waste-to-Energy Plants', description: 'Agricultural residue power generation and compressed biogas (CBG).' }
    ],
    costRange: '₹2 Cr – ₹500+ Cr',
    equityNorm: '20% – 25% Equity',
    typicalDebtRatio: '75% Debt / 25% Equity',
    recommendedDSCR: '1.20x – 1.35x (Supported by long PPA contract)',
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
    id: 'pharma-chemicals',
    title: 'Pharma & Specialty Chemical Manufacturing',
    shortName: 'Pharma & Chemicals',
    icon: FlaskConical,
    tagline: 'API manufacturing, formulation plants, specialty chemicals, bulk drug parks',
    description: 'Active Pharmaceutical Ingredients (API), formulations, specialty chemicals, and agrochemicals.',
    executiveSummary: `The Indian pharma & specialty chemical industry is a global powerhouse. Greenfield project development requires strict regulatory compliance (USFDA, WHO-GMP, EU-GMP), state-of-the-art ZLD effluent treatment facilities, and substantial technical competence. Banks look for strong promoter chemical expertise, product patent/off-take security, and environmental clearances.`,
    subSectors: [
      { name: 'Active Pharmaceutical Ingredients (API)', description: 'Bulk drug synthesis, high-potency API, intermediate chemical manufacturing.' },
      { name: 'Formulation Manufacturing Units', description: 'Tablets, capsules, injectables, liquids with WHO-GMP certification.' },
      { name: 'Specialty Chemicals & Polymers', description: 'Performance chemicals, agrochemical intermediates, fine chemicals.' }
    ],
    costRange: '₹10 Cr – ₹350+ Cr',
    equityNorm: '25% – 30% Equity',
    typicalDebtRatio: '70% Debt / 30% Equity',
    recommendedDSCR: '1.40x – 1.65x',
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
    id: 'infrastructure-epc',
    title: 'Infrastructure & Industrial EPC',
    shortName: 'Infrastructure EPC',
    icon: HardHat,
    tagline: 'Civil construction, industrial EPC, roads & bridges, urban infrastructure',
    description: 'Industrial construction contracting, road infrastructure, urban utilities, and EPC project execution.',
    executiveSummary: `Infrastructure development is backed by massive capital expenditure allocations from Central and State Governments. Greenfield EPC setups and equipment banks require hybrid financing—term loans for heavy earthmoving machinery & batching plants, combined with non-fund-based (NFB) limits like Bank Guarantees (BG) and Letter of Credit (LC).`,
    subSectors: [
      { name: 'Industrial Civil Contracting', description: 'Turnkey factory construction, PEB sheds, heavy foundations.' },
      { name: 'Roads, Highways & Bridges', description: 'NHAI, State PWD, HAM & EPC road construction contracting.' },
      { name: 'Urban Utilities & Water Supply', description: 'Pipeline networks, water treatment plants, urban infra.' }
    ],
    costRange: '₹10 Cr – ₹500+ Cr',
    equityNorm: '20% – 30% Equity',
    typicalDebtRatio: '70% Debt / 30% Equity',
    recommendedDSCR: '1.30x – 1.50x',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const toggleExpandCard = (id: string) => {
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

  // Filtered list
  const filteredIndustries = useMemo(() => {
    if (!searchQuery.trim()) return DETAILED_INDUSTRIES;
    const q = searchQuery.toLowerCase().trim();
    return DETAILED_INDUSTRIES.filter(
      (ind) =>
        ind.title.toLowerCase().includes(q) ||
        ind.shortName.toLowerCase().includes(q) ||
        ind.description.toLowerCase().includes(q) ||
        ind.tagline.toLowerCase().includes(q) ||
        ind.subSectors.some(
          (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

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
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-10 text-white border border-slate-800 shadow-md space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  {React.createElement(activeSector.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Comprehensive Greenfield Sector Intelligence
                  </span>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold font-manrope text-white tracking-tight mt-1">
                    {activeSector.title}
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 font-inter max-w-3xl leading-relaxed">
                {activeSector.tagline}
              </p>

              {/* Quick Parameters Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Project Outlay</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-manrope">{activeSector.costRange}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Promoter Equity</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-manrope">{activeSector.equityNorm}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Debt Ratio</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-manrope">{activeSector.typicalDebtRatio}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Min DSCR Norm</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-manrope">{activeSector.recommendedDSCR}</span>
                </div>
              </div>
            </div>

            {/* Main Information Layout (Article / Exploration View) */}
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

                {/* 2. Key Sub-Sectors & Applications */}
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

                {/* 3. Capital Expenditure (Capex) Structure Breakdown */}
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

                {/* 4. Government Schemes & Capital Subsidies */}
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

                {/* 5. DPR & Bankability Checklist */}
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
                      <p className="font-semibold text-blue-700 text-base">{activeSector.recommendedDSCR}</p>
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
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer"
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
          /* VIEW MODE B: GRID + PROMINENT SEARCH BAR (Default Industry Directory) */
          /* ========================================================================= */
          <div className="space-y-12 sm:space-y-16">
            
            {/* 1. Header & Prominent Search Input */}
            <section className="text-center max-w-[680px] mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Greenfield Sector Directory</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-manrope leading-tight">
                Explore Greenfield Industries & Sector Intelligence
              </h1>

              <p className="text-xs sm:text-sm text-[#4B5563] font-inter leading-relaxed max-w-[600px] mx-auto">
                Select an industry sector to explore comprehensive greenfield project descriptions, financial parameters, government subsidy frameworks, and bankability criteria.
              </p>
            </section>

            {/* 2. Industry Cards Grid */}
            <section className="space-y-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-[#111827] font-manrope">
                  All Greenfield Sectors
                </h2>
                <span className="text-sm text-[#6B7280]">
                  {DETAILED_INDUSTRIES.length} Key Industries Covered
                </span>
              </div>

              {filteredIndustries.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200 space-y-4">
                  <p className="text-base text-gray-600 font-inter">
                    No industry sector matched <strong>"{searchQuery}"</strong>.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    View All Greenfield Sectors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                  {filteredIndustries.map((ind) => {
                    const Icon = ind.icon;

                    return (
                      <div
                        key={ind.id}
                        onClick={() => handleOpenDetail(ind.id)}
                        className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-500 hover:shadow-md transition-all duration-300 p-5 text-left flex flex-col justify-between group cursor-pointer h-full"
                      >
                        {/* Top Content */}
                        <div className="space-y-2.5 pb-3">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-2xs">
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Full Industry Title */}
                          <h3 className="text-base font-bold text-[#111827] font-manrope leading-tight group-hover:text-blue-700 transition-colors whitespace-normal break-words">
                            {ind.title}
                          </h3>

                          {/* Tagline / Brief Description */}
                          <p className="text-xs text-[#4B5563] font-inter leading-relaxed line-clamp-2">
                            {ind.description}
                          </p>
                        </div>

                        {/* Bottom Content */}
                        <div className="space-y-2.5 pt-2.5 border-t border-gray-100 mt-auto">
                          {/* Financial Outlay & Equity Norm */}
                          <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-600">
                            <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 truncate">
                              Outlay: {ind.costRange}
                            </span>
                            <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 shrink-0">
                              Eq: {ind.equityNorm}
                            </span>
                          </div>

                          {/* Read More Text Link */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(ind.id);
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 font-manrope inline-flex items-center gap-1.5 transition-colors cursor-pointer group/link hover:underline"
                            >
                              <span>Read More</span>
                              <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. Global Call-to-Action Section */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center border border-blue-500/30 shadow-md">
                <div className="max-w-[700px] mx-auto space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Bank-Ready Execution</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white font-manrope tracking-tight leading-[1.2]">
                    Ready to Build Your Greenfield Project?
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 font-inter leading-[1.6]">
                    Speak with our experts to evaluate your project, prepare a bank-ready DPR, and receive complete funding guidance.
                  </p>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={onOpenConsultation}
                      className="px-5 py-3 bg-blue-400 hover:bg-blue-300 text-slate-950 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <PhoneCall className="w-4 h-4 text-slate-950" />
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
