import {
  Industry,
  Service,
  TimelineStep,
  Resource,
  Testimonial,
  FAQItem
} from '../types';

export const TRUST_NUMBERS = [
  {
    id: 'projects',
    value: 2500,
    suffix: '+',
    label: 'Projects Evaluated',
    description: 'Comprehensive feasibility reports delivered',
    icon: 'FileCheck'
  },
  {
    id: 'funding',
    value: 500,
    prefix: '₹',
    suffix: 'Cr+',
    label: 'Funding Assisted',
    description: 'Term loans & debt syndication secured',
    icon: 'TrendingUp'
  },
  {
    id: 'industries',
    value: 100,
    suffix: '+',
    label: 'Industries Covered',
    description: 'Across manufacturing, energy, & tech',
    icon: 'Building2'
  },
  {
    id: 'satisfaction',
    value: 95,
    suffix: '%',
    label: 'Client Satisfaction',
    description: 'Repeat entrepreneurs & referrals',
    icon: 'Award'
  }
];

export const INDUSTRIES: Industry[] = [
  // --- FOOD PROCESSING & AGRI-TECH ---
  {
    id: 'basmati_rice',
    name: 'Basmati Rice Processing & Export Unit',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Utensils',
    description: 'Cleaning, grading, polishing, and export packaging of premium basmati rice for international markets.',
    avgLoanSize: '₹3 Cr - ₹30 Cr',
    feasibilityRate: '92%',
    keyFactors: ['APEDA Registration & IEC Code', 'Paddy Procurement Efficiency', 'Confirmed Export LOIs'],
    popularRegions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Telangana'],
    overview: 'A basmati rice processing & export unit involves cleaning, grading, polishing, packaging, and exporting premium basmati rice to international markets in the Middle East, Europe, and USA.',
    projectCostRange: 'Medium Scale: ₹3 Cr – ₹10 Cr | Large Export-Oriented: ₹10 Cr – ₹30 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan / Debt: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.8 | Repayment: 7 – 10 years (Moratorium: 6 – 12 months)',
    roiAndPayback: 'EBITDA Margins: 10% – 18% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'APEDA Export Credit & Interest Subvention (3-4%)',
      'PMKSY Integrated Cold Chain & Agro Processing Clusters (35%-50% Subsidy)',
      'RoDTEP Export Benefits & EXIM Bank Credit Lines'
    ],
    eligibleBanks: ['Punjab National Bank', 'Union Bank of India', 'Bank of India', 'Bank of Baroda', 'State Bank of India'],
    keyRisks: ['Paddy procurement price volatility', 'Country-specific export quotas & phytosanitary tests', 'Delay in APEDA / FSSAI approvals']
  },
  {
    id: 'rice_mill',
    name: 'Rice Mill Project (Paddy Milling)',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Sprout',
    description: 'Processing raw paddy into polished rice, bran, and husk with modern color sorter technology.',
    avgLoanSize: '₹40 Lakh - ₹40 Cr',
    feasibilityRate: '93%',
    keyFactors: ['Paddy Procurement Cost', 'Color Sorter Yield', 'By-product Revenue (Bran & Husk)'],
    popularRegions: ['Andhra Pradesh', 'Telangana', 'Punjab', 'West Bengal'],
    overview: 'Rice milling involves cleaning, de-husking, polishing, and grading paddy into commercial rice. Driven by steady staple consumption, rice mills represent highly bankable agro-processing assets.',
    projectCostRange: 'Small (4-5 T/Hr): ₹40–60 Lakh | Medium (10 T/Hr): ₹1.5–3.2 Cr | Industrial (100 T/Day): ₹12–40 Cr',
    fundingStructure: 'Promoter Equity: 20% – 40% | Bank Debt: 60% – 75% | Subsidy: 10% – 35%',
    dscrNorms: 'DSCR ≥ 1.8 | Max Interest Cap: 9% under subvention',
    roiAndPayback: 'EBITDA Margins: 12% – 20% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'Agriculture Segment Interest Subvention (3% Interest Reduction)',
      'State Capital Subsidy (25% - 33.33% on eligible Capex)',
      'CGTMSE Collateral Cover up to ₹5 Crore'
    ],
    eligibleBanks: ['State Bank of India', 'Canara Bank', 'Punjab National Bank', 'Bank of Baroda', 'SIDBI', 'Central Bank of India'],
    keyRisks: ['Power supply interruption', 'Raw paddy seasonal price swings', 'Excess breakage rate']
  },
  {
    id: 'flour_mill',
    name: 'Flour Mill / Atta Chakki Project',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Utensils',
    description: 'High-volume grain milling into wheat flour (atta), maida, suji, and besan for B2B and retail.',
    avgLoanSize: '₹10 Lakh - ₹2 Cr',
    feasibilityRate: '91%',
    keyFactors: ['Location & B2B Kirana Tie-ups', 'Grain Sourcing Cost', 'Power Installation & Milling Efficiency'],
    popularRegions: ['Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar'],
    overview: 'A flour mill (atta chakki) unit processes wheat and grains into everyday essentials. It is a low-risk, high-volume MSME activity backed by consistent household and institutional demand.',
    projectCostRange: 'Small Scale: ₹10–25 Lakh | Medium Scale: ₹25–80 Lakh | Large Commercial: ₹80 Lakh – ₹2 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.6 | Moratorium: 3 – 6 months',
    roiAndPayback: 'EBITDA Margins: 8% – 12% | Payback Period: 2 – 4 years',
    subsidiesAndSchemes: [
      'PMEGP Subsidy (15% - 35% Capital Subsidy)',
      'PMFME Scheme (35% Credit-linked Subsidy up to ₹10 Lakh)',
      'CGTMSE Collateral Guarantee'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank of India'],
    keyRisks: ['Local retail market competition', 'Wheat grain price volatility', 'Unrealistic revenue projections']
  },
  {
    id: 'spice_processing',
    name: 'Spice Processing & Export Unit',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Utensils',
    description: 'Grinding, blending, and export-oriented pouch & box packaging of turmeric, chili, and masala mixes.',
    avgLoanSize: '₹5 Lakh - ₹5 Cr',
    feasibilityRate: '94%',
    keyFactors: ['Spices Board Quality Clearance', 'FSSAI & HACCP Compliance', 'Vacuum/Food-Grade Packaging'],
    popularRegions: ['Telangana', 'Andhra Pradesh', 'Gujarat', 'Kerala'],
    overview: 'Spice processing converts raw agricultural spices into value-added ground powders and blended masalas. India dominates over 1.5M tons of global spice exports annually.',
    projectCostRange: 'Small Scale: ₹5–15 Lakh | Medium Scale: ₹15–50 Lakh | Large Automatic Unit: ₹50 Lakh – ₹5 Cr+',
    fundingStructure: 'Promoter Equity: 10% – 30% | Bank Loan: 60% – 75% | Subsidy Gap: 10% – 20%',
    dscrNorms: 'DSCR ≥ 1.8 | Repayment: 5 – 10 years',
    roiAndPayback: 'EBITDA Margins: 15% – 35% (up to 45% on oleoresins) | Payback Period: 2 – 5 years',
    subsidiesAndSchemes: [
      'Spices Board Financial Assistance for Exporters & FPOs',
      'PMFME Capital Subsidy (35% up to ₹10 Lakh)',
      'PMEGP Margin Money Subsidy'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Canara Bank', 'Punjab National Bank', 'HDFC Bank', 'SIDBI'],
    keyRisks: ['Adulteration & microbial contamination', 'Raw spice seasonal price spikes', 'Strict export pesticide residue limits']
  },
  {
    id: 'ready_to_eat',
    name: 'Ready-to-Eat Food Manufacturing Unit',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Utensils',
    description: 'Shelf-stable meals, retort curries, and instant snacks produced with frozen or retort technology.',
    avgLoanSize: '₹20 Lakh - ₹5 Cr',
    feasibilityRate: '89%',
    keyFactors: ['Retort Sterilization Line', 'FSSAI Central Clearance', 'Cold Chain Distribution Network'],
    popularRegions: ['Maharashtra', 'Karnataka', 'Gujarat', 'Delhi NCR'],
    overview: 'Ready-to-Eat (RTE) manufacturing produces convenient, shelf-stable meals and instant ethnic dishes. Backed by urbanization and busy lifestyles, RTE is a high-growth PLI-supported sector.',
    projectCostRange: 'Small Scale: ₹20–50 Lakh | Medium Scale: ₹50 Lakh – ₹1 Cr | Large Scale: ₹1 Cr – ₹5 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.8 | Tenure: 5 – 10 years',
    roiAndPayback: 'EBITDA Margins: 12% – 20% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'PLI Scheme for Food Processing (Incentives on Incremental Sales)',
      'PMKSY Cold Chain Scheme (35% - 50% Capital Subsidy)',
      'PMFME Micro-Unit Support'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India', 'Canara Bank'],
    keyRisks: ['Short shelf life if cold chain breaks', 'High initial customer acquisition cost', 'FSSAI non-compliance']
  },
  {
    id: 'dairy_processing',
    name: 'Dairy Farming & Dairy Processing Plant',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Sprout',
    description: 'Cattle rearing, milk chilling, pasteurization, and value-added dairy (curd, ghee, paneer, butter).',
    avgLoanSize: '₹8 Lakh - ₹15 Cr',
    feasibilityRate: '92%',
    keyFactors: ['Milk Yield per Cattle', 'BMC & Chilling Logistics', 'Dairy Cooperative / Corporate Offtake'],
    popularRegions: ['Uttar Pradesh', 'Gujarat', 'Maharashtra', 'Telangana'],
    overview: 'A dairy processing plant processes raw milk into liquid packaged milk and value-added items. The industry is backed by high recurring cash flows and essential commodity status.',
    projectCostRange: 'Dairy Farm (10-50 animals): ₹8–60 Lakh | Processing Plant: ₹1.16 Cr – ₹15 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75% | Subsidy: 15% – 33%',
    dscrNorms: 'DSCR ≥ 1.8 | Effective Interest: 6% - 9% with subvention',
    roiAndPayback: 'EBITDA Margins: 8% – 15% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'NABARD DEDS Subsidy (25% General / 33.33% SC-ST)',
      'AHIDF Scheme (3% Interest Subvention on loans up to ₹2 Cr)',
      'Telangana eLaabh Scheme (33% Equipment Subsidy + ₹4/L incentive)'
    ],
    eligibleBanks: ['State Bank of India (Dairy Plus)', 'HDFC Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India'],
    keyRisks: ['Cattle disease and mortality', 'Feed and fodder price inflation', 'Refrigeration power failure']
  },
  {
    id: 'cold_storage',
    name: 'Cold Storage & Agro Logistics Project',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Warehouse',
    description: 'Multi-commodity temperature-controlled chambers, pre-cooling units, and reefer transport.',
    avgLoanSize: '₹2 Cr - ₹50 Cr',
    feasibilityRate: '91%',
    keyFactors: ['NH Proximity & Market Radius', 'Multi-Commodity Stacking', 'Power Backup & Compressor Automation'],
    popularRegions: ['Uttar Pradesh', 'Punjab', 'Maharashtra', 'West Bengal'],
    overview: 'Cold storage facilities preserve perishable goods (fruits, vegetables, dairy, frozen items), reducing post-harvest losses and receiving top priority sector lending status.',
    projectCostRange: 'Small Scale: ₹2–8 Cr | Medium Scale: ₹8–25 Cr | Large Scale: ₹25–50 Cr+',
    fundingStructure: 'Promoter Equity: 20% – 30% | Bank Loan: 70% – 80%',
    dscrNorms: 'DSCR ≥ 1.5–1.8 | Repayment: 8 – 12 years',
    roiAndPayback: 'EBITDA Margins: 18% – 25% | Payback Period: 5 – 7 years',
    subsidiesAndSchemes: [
      'MoFPI / PMKSY Cold Chain Capital Subsidy (35% - 50%)',
      'NABARD AMI Scheme',
      'Agriculture Infrastructure Fund (AIF 3% Interest Subvention)'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'NABARD'],
    keyRisks: ['Seasonal occupancy fluctuation', 'High power & electricity tariffs', 'Ammonia / refrigerant leaks']
  },
  {
    id: 'plant_based_meat',
    name: 'Plant-Based Meat Manufacturing Unit',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Utensils',
    description: 'Soy/pea protein extrusion, texturization, and cold-chain distribution of vegan/flexitarian meats.',
    avgLoanSize: '₹1 Cr - ₹20 Cr',
    feasibilityRate: '88%',
    keyFactors: ['Extruder & Texturization Tech', 'HoReCa & Retail Offtake LOIs', 'FSSAI Food Safety Systems'],
    popularRegions: ['Maharashtra', 'Karnataka', 'Delhi NCR', 'Telangana'],
    overview: 'Plant-based meat manufacturing is an emerging high-growth sector (>50% CAGR) producing protein-rich alternatives using twin-screw wet extrusion technology.',
    projectCostRange: 'Small Pilot: ₹1–2 Cr | Medium Unit: ₹11 Cr benchmark | Large Plant: ₹20 Cr+',
    fundingStructure: 'Promoter Equity: 20% – 30% | Bank Loan: 70% – 80%',
    dscrNorms: 'DSCR ≥ 1.53–2.16 | Repayment: 3 – 7 years',
    roiAndPayback: 'EBITDA Margins: 20% – 25% | Payback Period: 4 – 6 years',
    subsidiesAndSchemes: [
      'PMKSY Capital Subsidy (35% - 50%)',
      'PMFME Credit-Linked Subsidy (35% up to ₹10 Lakh)',
      'PLISFPI Scheme for RTE / RTC Foods'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Union Bank of India', 'NABARD', 'SIDBI', 'Lendingkart'],
    keyRisks: ['High raw protein input costs', 'Consumer taste/texture acceptance', 'Cold chain maintenance']
  },
  {
    id: 'fisheries_aquaculture',
    name: 'Fisheries & Fish Farming Project',
    category: 'Food Processing & Agri-Tech',
    iconName: 'Sprout',
    description: 'Pond development, Biofloc tanks, fish seed hatcheries, and processing for tilapia, carp & shrimp.',
    avgLoanSize: '₹8 Lakh - ₹5 Cr',
    feasibilityRate: '90%',
    keyFactors: ['Water Quality & Aeration', 'Biofloc / RAS Scientific Farming', 'Buyer & Exporter Tie-ups'],
    popularRegions: ['Andhra Pradesh', 'Odisha', 'Telangana', 'West Bengal'],
    overview: 'Fish farming (aquaculture) involves cultivating fish in ponds or biofloc systems for domestic and export markets, supported strongly under central Blue Revolution initiatives.',
    projectCostRange: 'Small (1 acre): ₹8–15 Lakh | Medium (3-5 acres): ₹25–60 Lakh | Commercial: ₹1 Cr – ₹5 Cr+',
    fundingStructure: 'Promoter Equity: 15% – 25% | Bank Loan: 75% – 85%',
    dscrNorms: 'DSCR ≥ 1.8 | Repayment: up to 48 months',
    roiAndPayback: 'EBITDA Margins: 8% – 18% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'Pradhan Mantri Matsya Sampada Yojana (PMMSY 40% General / 60% SC-ST-Women)',
      'Blue Revolution Scheme for Inland Fisheries',
      'NABARD Scheme for Aquaculture'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India', 'Canara Bank'],
    keyRisks: ['Water contamination & disease outbreak', 'Feed cost fluctuations', 'Land title or lease issues']
  },

  // --- MANUFACTURING & INDUSTRIAL ---
  {
    id: 'rubber_gloves',
    name: 'Rubber Gloves Manufacturing Unit',
    category: 'Manufacturing & Industrial',
    iconName: 'Factory',
    description: 'Dipping lines for disposable medical latex and nitrile gloves serving healthcare and safety.',
    avgLoanSize: '₹5 Cr - ₹60 Cr',
    feasibilityRate: '92%',
    keyFactors: ['Dipping Lines & Automation', 'Pollution Control (ETP) Clearance', 'CIBIL Score > 700'],
    popularRegions: ['Gujarat', 'Tamil Nadu', 'Kerala', 'Maharashtra'],
    overview: 'A rubber gloves manufacturing unit produces disposable latex and nitrile medical/industrial gloves. Driven by expanding healthcare, nitrile glove manufacturing is a high-growth PLI sector.',
    projectCostRange: 'Small Unit: ₹5–10 Cr | Medium Unit: ₹10–25 Cr | Large Scale: ₹25–60 Cr',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.8 | Tenure: 5 – 7 years',
    roiAndPayback: 'EBITDA Margins: 8% – 15% | Payback Period: 5 – 8 years',
    subsidiesAndSchemes: [
      'PLI Scheme for Medical Devices',
      'Capital Subsidy (15% in plant & machinery under CLCSS)',
      'Medical Device Park Common Infrastructure Grant (up to ₹100 Cr)'
    ],
    eligibleBanks: ['State Bank of India', 'Canara Bank', 'Bank of Baroda', 'Punjab National Bank', 'South Indian Bank', 'HDFC Bank'],
    keyRisks: ['Latex raw material price volatility', 'Strict ETP environmental clearance', 'High fuel/boiler costs']
  },
  {
    id: 'packaging_corrugated',
    name: 'Packaging Unit & Corrugated Box Manufacturing',
    category: 'Manufacturing & Industrial',
    iconName: 'Factory',
    description: 'Automatic corrugators, printing, and slotting lines for e-commerce, FMCG, and industrial boxes.',
    avgLoanSize: '₹20 Lakh - ₹20 Cr',
    feasibilityRate: '93%',
    keyFactors: ['Automatic Corrugator Line', 'Kraft Paper Cost Stability', 'E-Commerce & FMCG LOIs'],
    popularRegions: ['Telangana', 'Maharashtra', 'Gujarat', 'Tamil Nadu'],
    overview: 'Packaging units manufacture plastic flexible films and corrugated shipping boxes essential for logistics, e-commerce, and retail supply chains.',
    projectCostRange: 'Small Scale: ₹20L – ₹1 Cr | Medium Scale: ₹1 Cr – ₹5 Cr | Large Automatic: ₹5 Cr – ₹20 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.8 | Tenure: 5 – 10 years',
    roiAndPayback: 'EBITDA Margins: 8% – 18% | Payback Period: 1.5 – 4 years',
    subsidiesAndSchemes: [
      'T-IDEA & T-PRIDE State Industrial Policies (Telangana)',
      'PMEGP Subsidy (15%-35%)',
      'SIDBI Machinery Loan & CGTMSE Cover'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India', 'ICICI Bank', 'SIDBI'],
    keyRisks: ['Kraft paper / plastic granule price swings', 'Local market price competition', 'High electricity load requirement']
  },
  {
    id: 'steel_fabrication',
    name: 'Steel Fabrication Unit (Structural & PEB)',
    category: 'Manufacturing & Industrial',
    iconName: 'HardHat',
    description: 'Structural steel components, PEB sheds, pressure vessels, and industrial staircases.',
    avgLoanSize: '₹20 Lakh - ₹15 Cr',
    feasibilityRate: '91%',
    keyFactors: ['Welders & Skilled Technicians', 'Design Engineering Capability', 'Raw Steel Inventory Management'],
    popularRegions: ['Telangana', 'Gujarat', 'Maharashtra', 'Odisha'],
    overview: 'Steel fabrication units produce structural steel columns, beams, PEB sheds, and custom machinery components required for construction and industrial infrastructure.',
    projectCostRange: 'Small Scale: ₹20–50 Lakh | Medium Scale: ₹50 Lakh – ₹15 Cr | Large Scale: ₹15 Cr – ₹50 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 30% | Bank Loan: 70% – 75%',
    dscrNorms: 'DSCR ≥ 1.5–1.7 | Repayment: 5 – 7 years',
    roiAndPayback: 'EBITDA Margins: 10% – 15% (Specialty: 20-30%) | Payback Period: 2 – 5 years',
    subsidiesAndSchemes: [
      'Credit Linked Capital Subsidy Scheme (CLCSS)',
      'PMEGP & CGTMSE Scheme',
      'MSME Technology Upgradation Grants'
    ],
    eligibleBanks: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'IDFC FIRST Bank', 'SIDBI', 'PNB'],
    keyRisks: ['Steel raw material volatility', 'Occupational & welding hazards', 'High dependence on EPC contracts']
  },
  {
    id: 'furniture_mfg',
    name: 'Furniture Manufacturing Unit (Modular & Wooden)',
    category: 'Manufacturing & Industrial',
    iconName: 'Factory',
    description: 'Wooden, panel-based, and modular office/home furniture manufacturing with CNC machinery.',
    avgLoanSize: '₹5 Lakh - ₹2 Cr',
    feasibilityRate: '90%',
    keyFactors: ['Wood / Plywood Sourcing', 'CNC Panel Saw & Edge Bander', 'Dealer Network & Interior Designer Tie-ups'],
    popularRegions: ['Karnataka', 'Tamil Nadu', 'Rajasthan', 'Telangana'],
    overview: 'A furniture manufacturing unit converts timber, plywood, and engineered boards into modular home and office furniture to meet expanding urban real estate demand.',
    projectCostRange: 'Small Scale: ₹5–30 Lakh | Medium Scale: ₹30–92 Lakh | Large Scale: ₹92 Lakh – ₹2 Cr+',
    fundingStructure: 'Promoter Equity: 20% – 30% | Bank Loan: 70% – 80%',
    dscrNorms: 'DSCR ≥ 1.5 | Repayment: 3 – 7 years',
    roiAndPayback: 'EBITDA Margins: 25% – 30% | Payback Period: 5 – 6 years',
    subsidiesAndSchemes: [
      'MSME Mudra Loans & PMEGP',
      'CGTMSE Collateral Waiver for Small Loans',
      'State MSME Capital Grants'
    ],
    eligibleBanks: ['State Bank of India', 'HDFC Bank', 'SIDBI', 'ICICI Bank', 'Lendingkart', 'Bank of Baroda'],
    keyRisks: ['Plywood / timber price hikes', 'Incomplete documentation', 'Local carpenter competition']
  },
  {
    id: 'commercial_kitchen',
    name: 'Commercial Kitchen Equipment Manufacturing',
    category: 'Manufacturing & Industrial',
    iconName: 'Factory',
    description: 'Professional stainless steel cooking ranges, fryers, dishwashers, and food service counters.',
    avgLoanSize: '₹15 Lakh - ₹10 Cr',
    feasibilityRate: '92%',
    keyFactors: ['Stainless Steel Sheet Fabrication', 'BIS Safety Certification', 'Hotel & Cloud Kitchen Order Pipeline'],
    popularRegions: ['Maharashtra', 'Delhi NCR', 'Tamil Nadu', 'Karnataka'],
    overview: 'Produces stainless steel professional kitchen equipment for hotels, cloud kitchens, hospitals, and restaurants. Backed by the Capital Goods PLI scheme.',
    projectCostRange: 'Micro: ₹15–40 Lakh | Small: ₹30–75 Lakh | Medium: ₹80 Lakh – ₹2 Cr | Large: ₹2 Cr – ₹10 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 40% | Term Loan: 50% – 60% | Working Capital: 10% – 20%',
    dscrNorms: 'DSCR ≥ 1.5–1.7 | Repayment: 3 – 7 years',
    roiAndPayback: 'EBITDA Margins: 12% – 22% (Customized: 20-35%) | Payback Period: 3 – 6 years',
    subsidiesAndSchemes: [
      'Capital Goods PLI Scheme (Incentives on Incremental Sales)',
      'Udyam Registration Benefits',
      'MSME Technology Upgradation Grants'
    ],
    eligibleBanks: ['HDFC Bank', 'Bank of Maharashtra', 'State Bank of India', 'SIDBI', 'Bank of India'],
    keyRisks: ['Stainless steel metal price fluctuations', 'Inadequate bonding or welding defects', 'Institutional payment delays']
  },
  {
    id: 'glass_bottle',
    name: 'Glass Bottle Manufacturing Unit',
    category: 'Manufacturing & Industrial',
    iconName: 'Factory',
    description: 'Melting furnaces and IS bottle-forming lines for pharma, beverage, and cosmetic glass containers.',
    avgLoanSize: '₹5 Cr - ₹100 Cr',
    feasibilityRate: '93%',
    keyFactors: ['Furnace Fuel & Refractories', 'Silica Sand & Soda Ash Supply', 'Beverage & Pharma Supply Contracts'],
    popularRegions: ['Gujarat', 'Telangana', 'Maharashtra', 'Uttar Pradesh'],
    overview: 'Glass bottle plants produce sustainable, eco-friendly glass containers for beverages, pharmaceuticals, and cosmetics, benefiting from the global shift away from single-use plastics.',
    projectCostRange: 'Small Unit: ₹5–20 Cr | Medium Unit: ₹20–100 Cr | Large Unit: ₹100–500 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 30% | Term Loan: 70% – 75% | Working Capital: 25%',
    dscrNorms: 'DSCR ≥ 1.5–1.7 | Repayment: 1 – 10 years',
    roiAndPayback: 'EBITDA Margins: 12% – 30% | Payback Period: 5 – 7 years',
    subsidiesAndSchemes: [
      'PLI Scheme for Bulk Drugs / Pharma Packaging',
      'PMEGP & CGTMSE Schemes',
      'MSME ZED Certification Scheme'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'HDFC Bank', 'SIDBI'],
    keyRisks: ['High furnace continuous energy costs', 'Furnace refractory downtime', 'Glass cullet availability']
  },

  // --- RENEWABLE ENERGY & CLEAN-TECH ---
  {
    id: 'solar_panel_mfg',
    name: 'Solar Panel Manufacturing Unit (PV Modules)',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Sun',
    description: 'Automated solar PV module assembly (Mono PERC, TOPCon, Bifacial) with ALMM enlistment.',
    avgLoanSize: '₹8 Cr - ₹600 Cr',
    feasibilityRate: '95%',
    keyFactors: ['ALMM & BIS Certification', 'Solar Cell Sourcing Cost', 'EPC & Utility Developer PPAs'],
    popularRegions: ['Gujarat', 'Rajasthan', 'Telangana', 'Maharashtra'],
    overview: 'Solar panel manufacturing units assemble high-efficiency PV modules for residential, commercial, and utility-scale projects. The sector is supported by National PLI Tranche I & II and ALMM mandates.',
    projectCostRange: 'Small (10-20 MW): ₹8–15 Cr | Medium (50-100 MW): ₹35–70 Cr | Large (500 MW+): ₹250–600 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75% (IREDA up to 80%)',
    dscrNorms: 'DSCR ≥ 1.5–1.7 | Repayment: 5 – 15 years',
    roiAndPayback: 'EBITDA Margins: 8% – 15% (Integrated: 20-35%) | Payback Period: 5 – 8 years',
    subsidiesAndSchemes: [
      'National PLI Scheme for High Efficiency Solar PV Modules (₹24,000 Cr outlay)',
      'ALMM Mandate Protection against imports',
      'IREDA Concessional Green Loans & State SGST Reimbursement (up to 100%)'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India', 'Canara Bank', 'IREDA', 'SIDBI'],
    keyRisks: ['Global solar cell price volatility', 'Rapid solar cell technology obsolescence', 'Import dependence on polysilicon']
  },
  {
    id: 'green_hydrogen',
    name: 'Green Hydrogen Plant',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Zap',
    description: 'Electrolyzer units powered by renewable energy to produce pure green hydrogen for industrial offtake.',
    avgLoanSize: '₹1.5 Cr - ₹2,120 Cr',
    feasibilityRate: '94%',
    keyFactors: ['Electrolyzer Efficiency & Quotes', 'Renewable Energy PPA', 'Offtake LOI with Refineries/Steel'],
    popularRegions: ['Gujarat', 'Odisha', 'Andhra Pradesh', 'Tamil Nadu'],
    overview: 'Green hydrogen plants produce zero-carbon hydrogen via water electrolysis powered by renewable electricity. Driven by the National Hydrogen Mission, it serves steel, fertilizer, and refinery sectors.',
    projectCostRange: 'Pilot Plant: ₹1.5–12 Cr | Medium Plant: ₹10–15 Cr | Industrial Scale: ₹2,120 Cr benchmark',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.30 | Repayment: 15 – 25 years (Moratorium: 2 – 3 years)',
    roiAndPayback: 'LCOH Target: ₹250-350/kg | EBITDA Margins: 15% – 25% | Payback Period: 6 – 10 years',
    subsidiesAndSchemes: [
      'National Green Hydrogen Mission (NGHM SIGHT Incentive Scheme)',
      'IREDA Green Financing Framework',
      'Priority Sector Lending for Renewable Energy'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'IREDA', 'PFC'],
    keyRisks: ['High initial electrolyzer CapEx', 'Water allocation & purity constraints', 'Uncertain long-term PPA pricing']
  },
  {
    id: 'ev_charging_hub',
    name: 'EV Charging Station Hub (National Highway)',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Zap',
    description: '10-charger DC fast-charging hub (60kW - 150kW) with grid transformer, canopy, and rest amenities.',
    avgLoanSize: '₹15 Lakh - ₹16 Cr',
    feasibilityRate: '92%',
    keyFactors: ['DISCOM Load Sanction (50-200kW+)', 'NHAI / Highway Lease Agreement', 'CMS OCPP Software Compliance'],
    popularRegions: ['Maharashtra', 'Delhi-Jaipur Highway', 'Karnataka', 'Telangana'],
    overview: 'Highway EV charging hubs feature ultra-fast DC chargers for electric vehicles. Supported by PM E-DRIVE and state EV policies, highway hubs generate revenue from charging fees, ads, and shops.',
    projectCostRange: 'Small (2-4 chargers): ₹15–30 Lakh | Medium (4-8 chargers): ₹1–2 Cr | Highway Hub (10+ chargers): ₹10–16 Cr',
    fundingStructure: 'Promoter Equity: 20% – 30% | Bank Loan: 70% – 80%',
    dscrNorms: 'DSCR ≥ 1.3–1.4 | Repayment: 5 – 10 years under EV Mitra',
    roiAndPayback: 'EBITDA Margins: 25% – 40% | Payback Period: 3 – 5 years (Average IRR: 32%)',
    subsidiesAndSchemes: [
      'PM E-DRIVE Central Government Capital Subsidies (up to 50%-100% on infrastructure)',
      'SBI EV Mitra Loan Scheme (2% Interest Reimbursement)',
      'SIDBI EV4ECO Scheme for MSME Charging Hubs'
    ],
    eligibleBanks: ['State Bank of India (EV Mitra)', 'Bank of India', 'IREDA', 'SIDBI', 'NABARD', 'PFC'],
    keyRisks: ['Low utilization during early years', 'Grid power outage & DISCOM delays', 'Cable vandalism & maintenance']
  },
  {
    id: 'ethanol_plant',
    name: 'Ethanol Manufacturing Plant (Bio-Fuel)',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Sprout',
    description: 'Grain or molasses-based distillery for fuel ethanol under the Ethanol Blended Petrol (EBP) programme.',
    avgLoanSize: '₹5 Cr - ₹200 Cr',
    feasibilityRate: '95%',
    keyFactors: ['OMC Tripartite Supply Agreement', 'CPCB Zero Liquid Discharge (ZLD)', 'Grain/Molasses Feedstock Sourcing'],
    popularRegions: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Bihar'],
    overview: 'Ethanol plants convert grain or molasses into fuel-grade anhydrous ethanol for supply to Oil Marketing Companies (OMCs) under India’s 20% EBP blending mandate.',
    projectCostRange: 'Mini/Pilot: ₹5–20 Cr | Small Commercial: ₹25–80 Cr | Medium/Large: ₹80–200 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 30% | Bank Loan: 70% – 75%',
    dscrNorms: 'DSCR ≥ 1.3–1.4 | Repayment: 7 – 15 years',
    roiAndPayback: 'EBITDA Margins: 12% – 18% | Payback Period: 7 – 9 years',
    subsidiesAndSchemes: [
      'DFPD Interest Subvention Scheme (50% interest subvention or max 6% for 5 years)',
      'State Capital Investment Subsidies (up to 40%)',
      'PM JI-VAN Bio-Ethanol Financial Support'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of India (Star Bio Energy)', 'NABARD', 'IREDA', 'NCDC', 'PFC'],
    keyRisks: ['Feedstock price inflation (broken rice/maize)', 'ZLD environmental compliance costs', 'OMC allocation changes']
  },
  {
    id: 'waste_to_energy',
    name: 'Waste-to-Energy Plant (50 TPD MSW)',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Zap',
    description: 'Processing municipal solid waste via RDF or incineration to generate power and tipping fees.',
    avgLoanSize: '₹20 Cr - ₹100 Cr',
    feasibilityRate: '91%',
    keyFactors: ['Long-Term Municipal Waste Supply Concession', 'Power Purchase Agreement (PPA)', 'Turbine & Flue Gas Cleaning Tech'],
    popularRegions: ['Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu'],
    overview: 'Waste-to-Energy (WTE) plants process municipal solid waste into electricity or RDF fuel, solving urban waste disposal while generating contracted power revenue and tipping fees.',
    projectCostRange: 'Small Scale (50 TPD): ₹20–45 Cr | Medium Scale: ₹45–80 Cr | Large Scale: ₹80–120 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.3–1.6 | Repayment: 10 – 15 years',
    roiAndPayback: 'EBITDA Margins: 20% – 30% | Payback Period: 7 – 10 years',
    subsidiesAndSchemes: [
      'Swachh Bharat Mission 2.0 Waste Management Grants',
      'MNRE Bioenergy Programme Capital CFA',
      'State Renewable Energy PPA Tariffs'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'IREDA', 'PFC'],
    keyRisks: ['Inconsistent MSW moisture & calorific value', 'Municipal tipping fee payment delays', 'Public opposition / NIMBY risk']
  },
  {
    id: 'tyre_recycling',
    name: 'Tyre & Plastic Recycling Plant',
    category: 'Renewable Energy & Clean-Tech',
    iconName: 'Factory',
    description: 'Processing end-of-life tyres into crumb rubber, carbon black, pyrolysis oil, and steel scrap under EPR.',
    avgLoanSize: '₹20 Lakh - ₹15 Cr',
    feasibilityRate: '92%',
    keyFactors: ['Rubber EPR Credit Portal License', 'Pollution Control Board CTE/CTO', 'Crumb Rubber Road Offtake'],
    popularRegions: ['Telangana', 'Maharashtra', 'Gujarat', 'Haryana'],
    overview: 'Tyre recycling plants process waste tyres into crumb rubber for rubberized roads, pyrolysis oil, and carbon black. Backed by India’s Waste Tyre Extended Producer Responsibility (EPR) 2022 policy.',
    projectCostRange: 'Small Scale: ₹20–50 Lakh | Medium Scale: ₹50 Lakh – ₹1.5 Cr | Large Scale: ₹1.5 Cr – ₹15 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 30% | Term Loan: 70% – 75%',
    dscrNorms: 'DSCR ≥ 1.5–1.7 | Repayment: 5 – 10 years',
    roiAndPayback: 'EBITDA Margins: 15% – 25% | Payback Period: 2 – 4 years (ROI: 20-30%)',
    subsidiesAndSchemes: [
      'PMEGP Margin Money Subsidy (15%-35%)',
      'Green MSME & State Power Tariff Subsidies',
      'EPR Certificate Trading Revenue'
    ],
    eligibleBanks: ['State Bank of India', 'Union Bank of India', 'SIDBI', 'NABARD', 'IREDA'],
    keyRisks: ['Informal tyre collector competition', 'Strict Hazardous Waste NOC compliance', 'Pyrolysis gas fire hazards']
  },

  // --- LOGISTICS & WAREHOUSING ---
  {
    id: 'warehouse_logistics',
    name: 'Warehouse Logistics Park (Grade-A)',
    category: 'Logistics & Warehousing',
    iconName: 'Warehouse',
    description: 'PEB shed logistics facilities with dock levelers, fire systems, WMS software, and 3PL leasing.',
    avgLoanSize: '₹50 Lakh - ₹250 Cr',
    feasibilityRate: '93%',
    keyFactors: ['National Highway Connectivity', 'Non-Agricultural Industrial NA Zoning', 'Corporate Tenant Pre-Lease LOIs'],
    popularRegions: ['Bhiwandi', 'Chakan', 'Sriperumbudur', 'NCR', 'Chittoor'],
    overview: 'Warehouse logistics parks store, sort, and dispatch goods for e-commerce, FMCG, and manufacturing. Secure corporate lease agreements ensure predictable, annuity-based cash flows.',
    projectCostRange: 'Small (10-25k sq ft): ₹50L–1.5 Cr | Medium (25-100k sq ft): ₹1.5–3.5 Cr | Grade-A Park: ₹3.5–250 Cr+',
    fundingStructure: 'Promoter Equity / VC: 30% – 40% | Bank Debt / LRD: 60% – 70%',
    dscrNorms: 'DSCR ≥ 1.20–1.50 | Loan Tenure: 5 – 12 years (LRD up to 15 yrs)',
    roiAndPayback: 'EBITDA Margins: 10% – 20% | Annual Rental Yields: 12% – 28% | Payback: 3 – 6 years',
    subsidiesAndSchemes: [
      'Agriculture Infrastructure Fund (AIF 3% Subvention)',
      'NABARD AMI Scheme (25% - 33.33% Capital Subsidy)',
      'Income Tax Sec 35AD 100% CapEx Deduction',
      'Telangana State Warehouse Capital Subsidy (up to ₹75 Lakh)'
    ],
    eligibleBanks: ['State Bank of India', 'Punjab National Bank', 'Bank of Baroda', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'IDFC First Bank'],
    keyRisks: ['Defective land title or lease < 10 years', 'Vacancy / tenant turnover', 'Narrow access road (<30 ft)']
  },
  {
    id: 'online_grocery_hub',
    name: 'Online Grocery Dark Store & Quick Commerce Hub',
    category: 'Logistics & Warehousing',
    iconName: 'Warehouse',
    description: 'Urban fulfillment dark stores, cold rooms, and inventory management for 10-minute app deliveries.',
    avgLoanSize: '₹50 Lakh - ₹8 Cr',
    feasibilityRate: '89%',
    keyFactors: ['Location Density & Rider Route Optimization', 'FSSAI License & POS Billing', 'ONDC & Merchant Partner Integration'],
    popularRegions: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR'],
    overview: 'Quick commerce dark store hubs fulfill instant online grocery orders via digital apps. The sector relies on urban micro-fulfillment, fast inventory turn, and ONDC digital infrastructure.',
    projectCostRange: 'Small Pilot (1-2 stores): ₹50 Lakh – ₹1.5 Cr | Medium Cluster (3-5 cities): ₹1.5 – ₹3.5 Cr | Regional Mother Hub: ₹3.5 – ₹8 Cr+',
    fundingStructure: 'Promoter Equity: 30% – 40% | Bank Debt / MSME Retail Loan: 60% – 70%',
    dscrNorms: 'DSCR ≥ 1.30–1.50 | Repayment: 3 – 5 years',
    roiAndPayback: 'EBITDA Margins: 4% – 7% (ultra-high velocity) | Payback Period: 1.5 – 3 years',
    subsidiesAndSchemes: [
      'PMEGP & Mudra Loan Scheme (up to ₹20 Lakh)',
      'ONDC Free Onboarding & Low Transaction Incentives',
      'Telangana Startup SGST Reimbursement & Pavala Vaddi Scheme'
    ],
    eligibleBanks: ['State Bank of India (eBiz Loans)', 'HDFC Bank (SmartUp)', 'ICICI Bank (iStartup)', 'Canara Bank', 'Union Bank', 'SIDBI'],
    keyRisks: ['High customer acquisition marketing burn', 'Perishable grocery spoilage', 'Short store lease lock-in (<3 yrs)']
  },

  // --- HEALTHCARE & SOCIAL INFRA ---
  {
    id: 'hospital_project',
    name: 'Multi-Specialty Hospital Project (50 Beds)',
    category: 'Healthcare & Social Infra',
    iconName: 'Activity',
    description: '50-bed healthcare setup with ICU, Operation Theatres, diagnostics, and specialty doctor panels.',
    avgLoanSize: '₹15 Cr - ₹80 Cr',
    feasibilityRate: '94%',
    keyFactors: ['Qualified Doctor Panel Equity', 'NABH Accreditation & Clinical Licenses', 'Bed Occupancy Rate (>65%)'],
    popularRegions: ['Karnataka', 'Telangana', 'Delhi NCR', 'Maharashtra'],
    overview: 'A 50-bed multi-specialty hospital provides essential healthcare across surgery, pediatrics, general medicine, and diagnostics. It benefits from social infra priority funding and Ayushman Bharat empanelment.',
    projectCostRange: 'Small (30-50 beds): ₹15–30 Cr | Medium (50-100 beds): ₹30–80 Cr | Large: ₹80–200 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 35% | Bank Loan: 65% – 75%',
    dscrNorms: 'DSCR ≥ 1.3–1.7 | Repayment: 10 – 15 years (Moratorium: 12 – 24 months)',
    roiAndPayback: 'EBITDA Margins: 15% – 25% | Payback Period: 6 – 10 years',
    subsidiesAndSchemes: [
      'Ayushman Bharat / PM-JAY Social Infrastructure Support',
      'National Health Mission (NHM) Equipment Subsidies',
      'Healthcare MSME Priority Sector Lending'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Healthcare NBFCs'],
    keyRisks: ['Inadequate qualified medical management', 'Long gestation period before 65%+ occupancy', 'Fire NOC & biomedical waste compliance']
  },

  // --- HOSPITALITY & REAL ESTATE ---
  {
    id: 'budget_hotel',
    name: 'Budget Business Hotel (40 Rooms, Tier-2 City)',
    category: 'Hospitality & Real Estate',
    iconName: 'Hotel',
    description: '40-room corporate business hotel with Wi-Fi, dining, banquet, and OTA franchise tie-ups.',
    avgLoanSize: '₹13.5 Cr - ₹50 Cr',
    feasibilityRate: '88%',
    keyFactors: ['Location Near Corporate / Airport Hubs', 'OTA & Franchise Tie-ups (OYO/FabHotels/Lemon Tree)', 'Fire NOC & FSSAI Clearance'],
    popularRegions: ['Coimbatore', 'Lucknow', 'Indore', 'Vizag'],
    overview: 'Budget business hotels cater to corporate travelers and domestic tourists in secondary markets. Lower land acquisition costs enable high return on investment and fast payback.',
    projectCostRange: 'Small (40 rooms): ₹13.5–30 Cr | Medium (60-80 rooms): ₹35–55 Cr | Large (100+ rooms): ₹50–70 Cr',
    fundingStructure: 'Promoter Equity: 20% – 30% | Bank Loan: 70% – 80%',
    dscrNorms: 'DSCR ≥ 1.3–1.4 | Tenure: 7 – 10 years (Moratorium: 6 – 12 months)',
    roiAndPayback: 'EBITDA Margins: 9% – 15% | Average IRR: 26% | Payback Period: 3 – 10 years',
    subsidiesAndSchemes: [
      'Startup India Seed Fund Scheme (SISFS)',
      'T-IDEA & T-PRIDE Hotel Capital Subsidies (15%-50%)',
      'State Heritage & Tourism Infrastructure Grants'
    ],
    eligibleBanks: ['State Bank of India', 'HDFC Bank', 'Punjab National Bank', 'SIDBI', 'NABARD'],
    keyRisks: ['Off-season low room occupancy (<65%)', 'Tariff competition from unorganized stays', 'Approval & licensing delays']
  },
  {
    id: 'resort_tourism',
    name: 'Beach & Hill Resort / Eco-Tourism Project',
    category: 'Hospitality & Real Estate',
    iconName: 'Hotel',
    description: 'Cottages, swimming pool, restaurant, wellness retreat, and outdoor recreational stays.',
    avgLoanSize: '₹1.5 Cr - ₹50 Cr',
    feasibilityRate: '88%',
    keyFactors: ['Scenic Appeal & Highway Access', 'Local Tourism Board Approval', 'Eco-friendly Environmental Clearances'],
    popularRegions: ['Goa', 'Coorg (KA)', 'Wayand (KL)', 'Uttarakhand'],
    overview: 'Beach and hill resorts serve weekend travelers, corporate retreats, and destination events. They qualify for tourism policy capital subsidies and state development benefits.',
    projectCostRange: 'Homestay: ₹50L–1.5 Cr | Mid-size Resort: ₹1.5–5 Cr | Premium Resort: ₹5–50 Cr+',
    fundingStructure: 'Promoter Equity: 30% – 40% | Bank Term Debt: 60% – 70%',
    dscrNorms: 'DSCR ≥ 1.25–1.50 | Repayment: 5 – 10 years',
    roiAndPayback: 'EBITDA Margins: 15% – 28% | Payback Period: 3 – 5 years',
    subsidiesAndSchemes: [
      'State Tourism Policy Capital Subsidy (25% up to ₹1 Cr)',
      'State Financial Corporation (KSFC/SFC) Tourism Loans',
      'PRASAD & Swadesh Darshan Scheme Benefits'
    ],
    eligibleBanks: ['State Financial Corporations (KSFC)', 'State Bank of India', 'HDFC Bank', 'Bank of Baroda', 'Canara Bank'],
    keyRisks: ['Monsoon / off-season demand drop', 'Environmental compliance in coastal/hill zones', 'Lack of hospitality background']
  },
  {
    id: 'gated_villas',
    name: 'Villas & Gated Community Real Estate',
    category: 'Hospitality & Real Estate',
    iconName: 'Hotel',
    description: 'DTCP/RERA-approved luxury gated community layout, clubhouse, utilities, and villa construction.',
    avgLoanSize: '₹27 Cr - ₹270 Cr',
    feasibilityRate: '91%',
    keyFactors: ['DTCP / RERA Approval Upfront', 'Milestone-based Pre-sales & Bookings', 'Clear Land Title without Encumbrance'],
    popularRegions: ['Hyderabad (Shadnagar/Shankarpally)', 'Bengaluru', 'Pune', 'Chennai'],
    overview: 'Gated community villa projects cater to rising demand for luxury living space. Projects benefit from milestone-based pre-sale cash flows and strict debt-equity discipline.',
    projectCostRange: 'Small (10-50 villas): ₹27–125 Cr | Medium (50 villas): ₹135 Cr | Large (100+ villas): ₹270 Cr+',
    fundingStructure: 'Promoter Equity: 27% – 40% | Bank Loan: 65% – 80%',
    dscrNorms: 'DSCR ≥ 1.2–1.5 | Moratorium: 12 – 24 months',
    roiAndPayback: 'EBITDA Margins: 20% – 35% | Project IRR: 18% – 25% | Payback: 3 – 5 years',
    subsidiesAndSchemes: [
      'RBI Project Finance Guidelines for Housing',
      'SWAMIH Investment Fund for Real Estate',
      'RERA Registration Approval Framework'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'HDFC Ltd', 'LIC Housing Finance'],
    keyRisks: ['Approval delays from DTCP / RERA', 'Slower sales absorption rate', 'Unclear land title disputes']
  },
  {
    id: 'shopping_mall_retail',
    name: 'Shopping Mall & Supermarket Retail',
    category: 'Hospitality & Real Estate',
    iconName: 'Warehouse',
    description: 'Commercial retail malls, multiplexes, food courts, and multi-brand Kirana/supermarket stores.',
    avgLoanSize: '₹15 Lakh - ₹200 Cr',
    feasibilityRate: '92%',
    keyFactors: ['High Footfall Urban Location', 'Anchor Tenant Brand Pre-Leases', 'Inventory Turnover & Billing Systems'],
    popularRegions: ['Tier-1 Metros', 'Tier-2 District Capitals', 'Telangana', 'Maharashtra'],
    overview: 'Shopping malls and multi-brand supermarkets operate on lease and inventory models, benefiting from organized retail growth and steady daily cash flows.',
    projectCostRange: 'Supermarket: ₹15L–2 Cr | Small Mall: ₹75–200 Cr | Large Mall: ₹200–800 Cr+',
    fundingStructure: 'Promoter Equity: 25% – 40% | Bank Loan: 60% – 75%',
    dscrNorms: 'DSCR ≥ 1.50–1.90 | Repayment: 5 – 15 years',
    roiAndPayback: 'EBITDA Margins: 7% – 10% (Supermarket) / 35% – 55% (Mall) | Payback: 1.5 – 12 years',
    subsidiesAndSchemes: [
      'CGTMSE Credit Guarantee for Retail Trade MSMEs',
      'Income Tax Sec 35AD Benefits',
      'State Commercial Real Estate Policies'
    ],
    eligibleBanks: ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'HUDCO', 'NHB', 'HDFC Bank'],
    keyRisks: ['Overestimation of rental income', 'Low pre-leasing or lack of anchor tenants', 'High inventory shrinkage/theft']
  }
];

export const MAIN_SECTORS = [
  'Manufacturing',
  'Food Processing',
  'Textiles',
  'Renewable Energy',
  'Hospitals & Healthcare',
  'Hotels & Hospitality',
  'Education',
  'Warehousing & Logistics',
  'Agriculture & Agro Tech',
  'Cold Storage',
  'Chemical & Petrochemical',
  'Plastic & Polymers',
  'Furniture & Woodworking',
  'Electronics & Hardware',
  'Construction & Real Estate',
  'Pharmaceuticals & Bio-Tech',
  'Logistics & Distribution',
  'Dairy & Livestock'
];

export const SERVICES: Service[] = [
  {
    id: 'dpr_preparation',
    name: 'Bank-Grade Detailed Project Report (DPR)',
    tag: '100% Bankable DPR',
    shortDesc: 'Comprehensive 100+ page DPR reports fully compliant with PSU, Private bank & NABARD underwriting guidelines.',
    fullDesc: 'Comprehensive 100+ page DPR reports fully compliant with PSU, Private bank & NABARD underwriting guidelines.',
    deliverables: [
      '100+ Page Bank-Ready DPR Report',
      'Civil, Plant & Machinery Technical Annexures',
      'Statutory & Licensing Compliance Roadmaps'
    ],
    iconName: 'FileText',
    turnaroundTime: '5-7 Days',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'feasibility_analysis',
    name: 'Project Feasibility & Reality Check',
    tag: 'Technical & Operational',
    shortDesc: 'Comprehensive site, market demand, power, raw material, and operational risk evaluation before capital commitment.',
    fullDesc: 'Comprehensive site, market demand, power, raw material, and operational risk evaluation before capital commitment.',
    deliverables: [
      'Site, Power & Logistics Assessment',
      'Machinery & Technology Evaluation',
      'Operational & Environmental Risk Audit'
    ],
    iconName: 'ShieldCheck',
    turnaroundTime: '3-5 Days',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'loan_processing',
    name: 'Debt Syndication & Loan Advisory',
    tag: 'Debt Syndication',
    shortDesc: 'End-to-end liaison with PSU & Private bank credit committees, TEV audit representation, and sanction letter terms.',
    fullDesc: 'End-to-end liaison with PSU & Private bank credit committees, TEV audit representation, and sanction letter terms.',
    deliverables: [
      'Multi-Bank Pitch & Presentation',
      'Credit Committee Query Resolution',
      'Sanction Terms Negotiation & Drawdown Guidance'
    ],
    iconName: 'Landmark',
    turnaroundTime: '2-3 Weeks',
    imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'vetting_sanction_letter',
    name: 'Vetting of Sanction Letter',
    tag: 'Debt Advisory',
    shortDesc: 'Rigorous legal & financial vetting of bank sanction letters to identify hidden restrictive covenants, fee structures, and interest margins.',
    fullDesc: 'Rigorous legal & financial vetting of bank sanction letters to identify hidden restrictive covenants, fee structures, and interest margins.',
    deliverables: [
      'Clause-by-Clause Covenant & Term Audit',
      'Interest Spread, Processing Fee & Penalty Analysis',
      'Pre-Disbursement Compliance & Security Checklist'
    ],
    iconName: 'FileCheck',
    turnaroundTime: '1-2 Days',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80'
  }
];

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    stepNumber: 1,
    title: 'Submit Project',
    description: 'Provide basic project details including industry, proposed location, estimated capex, and promoter background.',
    duration: 'Day 1',
    keyDeliverable: 'Project File Created',
    badge: 'Instant',
    iconName: 'Send'
  },
  {
    stepNumber: 2,
    title: 'Reality Check',
    description: 'Pre-feasibility evaluation of ground reality, regulatory requirements, site suitability, and market demand.',
    duration: 'Day 2',
    keyDeliverable: 'Pre-Feasibility Verdict',
    badge: '24 Hours',
    iconName: 'CheckCircle2'
  },
  {
    stepNumber: 3,
    title: 'Financial Analysis',
    description: '10-year financial modeling, DSCR calculations, payback estimation, and debt-equity structuring.',
    duration: 'Day 3 - 4',
    keyDeliverable: 'Financial Model & CMA Data',
    badge: 'Financial Audit',
    iconName: 'Calculator'
  },
  {
    stepNumber: 4,
    title: 'Bankability Rating',
    description: 'Stress-testing against RBI guidelines and bank underwriting norms to generate a 0-100 Bankability Score.',
    duration: 'Day 5',
    keyDeliverable: 'Bankability Scorecard & Gaps Report',
    badge: 'Credit Screening',
    iconName: 'ShieldAlert'
  },
  {
    stepNumber: 5,
    title: 'Expert Consultation',
    description: '1-on-1 strategy session with ex-bankers and sector specialists to refine loan structure and select target banks.',
    duration: 'Day 6',
    keyDeliverable: 'Bank Selection & Loan Strategy',
    badge: '1-on-1 Advisory',
    iconName: 'UserCheck'
  },
  {
    stepNumber: 6,
    title: 'Documentation',
    description: 'Compilation of 100+ page Detailed Project Report (DPR), legal dockets, KYC, and government subsidy filings.',
    duration: 'Day 7 - 10',
    keyDeliverable: '100% Bankable DPR & Docket',
    badge: 'Bank Ready',
    iconName: 'FileText'
  },
  {
    stepNumber: 7,
    title: 'Loan Processing',
    description: 'Submission to PSU and Private Banks, credit committee query resolution, and TEV inspection support.',
    duration: 'Week 2 - 3',
    keyDeliverable: 'Credit Committee Clearance',
    badge: 'Active Liaison',
    iconName: 'Landmark'
  },
  {
    stepNumber: 8,
    title: 'Loan Sanction',
    description: 'Final sanction letter issuance, terms optimization, pre-disbursement compliance, and capital release.',
    duration: 'Week 3 - 4',
    keyDeliverable: 'Sanction Letter & Disbursement',
    badge: 'Success',
    iconName: 'Award'
  }
];

export const WHY_CHOOSE_INISIO = [
  {
    id: 'expert_analysis',
    title: 'Proprietary Feasibility Framework',
    description: 'Cross-references 10,000+ benchmarked industrial projects, real-time commodity pricing, and credit standards to detect risks in minutes.',
    iconName: 'BarChart3',
    stat: '10x Faster',
    statLabel: 'Initial Risk Screening'
  },
  {
    id: 'experts',
    title: 'Ex-Bankers & Sector Specialists',
    description: 'Your report is authored and backed by veteran project finance officers who formerly headed corporate credit at top nationalized banks.',
    iconName: 'Users',
    stat: '35+ Yrs',
    statLabel: 'Combined Banking Exp'
  },
  {
    id: 'faster_loan',
    title: '3x Faster Loan Sanctions',
    description: 'By addressing credit officer queries prior to submission, we reduce typical bank approval cycles from 4 months down to 28 days.',
    iconName: 'Zap',
    stat: '28 Days',
    statLabel: 'Avg Sanction Time'
  },
  {
    id: 'complete_guidance',
    title: '360° Greenfield Guidance',
    description: 'From land selection and government subsidy claims (PLI/State incentives) to commercial trial runs and capital disbursement.',
    iconName: 'Compass',
    stat: '100%',
    statLabel: 'End-to-End Ownership'
  }
];

export const FREE_RESOURCES: Resource[] = [
  {
    id: 'bankability_sample',
    title: '2026 Greenfield Bankability Benchmark Report',
    category: 'Bankability',
    type: 'PDF Guide',
    description: 'Learn the exact 18 financial metrics bank credit committees evaluate before sanctioning ₹5 Cr to ₹200 Cr term loans.',
    pagesOrSize: '24 Pages • PDF',
    downloadCount: 3420,
    tags: ['Bank Rules', 'DSCR Limits', 'CMA Format'],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'funding_roadmap',
    title: 'Indian Industrial Debt Funding Master Blueprint',
    category: 'Funding',
    type: 'PDF Guide',
    description: 'Step-by-step roadmap to navigate PSU vs Private Bank debt syndication, CGTMSE limits, and state capital subsidies.',
    pagesOrSize: '36 Pages • PDF',
    downloadCount: 4890,
    tags: ['Debt Syndication', 'Subsidies', 'Term Loan'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'dpr_checklist',
    title: 'Master DPR Readiness Checklist (120 Points)',
    category: 'Documentation',
    type: 'Checklist',
    description: 'Complete checklist of mandatory documents, machinery quotes, land NOCs, and environmental approvals required for bank submission.',
    pagesOrSize: '8 Pages • Interactive PDF',
    downloadCount: 6150,
    tags: ['DPR Requirements', 'Bank Checklist', 'NOCs'],
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'financial_template',
    title: 'Greenfield Financial Model & CMA Format Template',
    category: 'Financial Modeling',
    type: 'Excel Template',
    description: 'Fully unlocked Excel financial model template with automatic DSCR, IRR, sensitivity tables, and CMA ratio statements.',
    pagesOrSize: 'Excel • .XLSX',
    downloadCount: 5210,
    tags: ['Financial Model', 'CMA Sheet', 'IRR Calculator'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Rajesh V. Patel',
    title: 'Managing Director',
    company: 'Vanguard Polymers Pvt Ltd',
    industry: 'Manufacturing',
    fundingAmount: '₹38.5 Cr Term Loan',
    quote: 'Inisio turned our initial concept into a rock-solid, bank-grade DPR in 10 days. The bank credit committee cleared our ₹38.5 Cr loan without asking for a single revision.',
    rating: 5,
    location: 'Ahmedabad, Gujarat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Dr. Ananya Sundaram',
    title: 'Co-Founder & Chief Medical Officer',
    company: 'Apex Medicare Super Speciality Hospital',
    industry: 'Healthcare',
    fundingAmount: '₹62.0 Cr Debt Assisted',
    quote: 'Building a 200-bed hospital requires navigating complex regulatory approvals. Inisio’s Reality Check saved us from choosing an unviable land parcel and secured our funding with SBI.',
    rating: 5,
    location: 'Coimbatore, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Vikramjit Singh Grewal',
    title: 'Promoter',
    company: 'GreenHarvest Agro Cold Chain',
    industry: 'Food Processing',
    fundingAmount: '₹22.0 Cr + ₹4.5 Cr Subsidy',
    quote: 'Their team not only structured our debt with a 2-year moratorium but also helped us claim ₹4.5 Cr MoFPI government subsidy. Exceptional expertise in greenfield projects.',
    rating: 5,
    location: 'Ludhiana, Punjab',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Meera Deshmukh',
    title: 'CEO & Founder',
    company: 'Solterra Energy Parks',
    industry: 'Solar & Renewable',
    fundingAmount: '₹115.0 Cr Project Debt',
    quote: 'The Bankability Score tool gave us instant clarity on our PPA structure. Within 3 weeks of submitting our file, we had dual sanction letters from top national banks.',
    rating: 5,
    location: 'Jodhpur, Rajasthan',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'Assessment',
    question: 'What is a Greenfield Project and how does Inisio evaluate it?',
    answer: 'A greenfield project is a brand-new commercial or industrial enterprise started from scratch where no previous infrastructure exists. Inisio evaluates your greenfield project across 45 key dimensions including promoter background, technology selection, raw material logistics, statutory compliance, market demand, and bankability metrics.'
  },
  {
    id: 'faq_2',
    category: 'Assessment',
    question: 'How accurate is the online Free Project Assessment score?',
    answer: 'Our free online assessment utilizes our proprietary financial evaluation model benchmarked against 10,000+ industrial loan applications. It provides a preliminary accuracy rate of over 88% regarding your bankability, debt-equity requirements, and DSCR feasibility.'
  },
  {
    id: 'faq_3',
    category: 'DPR',
    question: 'Why do traditional DPRs get rejected by bank credit committees?',
    answer: 'Traditional DPRs are often generic templates filled with copy-pasted data that fail to address bank-specific underwriting criteria such as DSCR sensitivity, promoter equity proof, raw material price volatility, and statutory approvals timeline. Inisio DPRs are authored by ex-bank credit heads specifically aligned to RBI and bank credit norms.'
  },
  {
    id: 'faq_4',
    category: 'Loan Process',
    question: 'How long does the loan syndication process take with Inisio?',
    answer: 'While traditional bank loan approvals take 3 to 5 months, Inisio streamlined process typically achieves official loan sanction letters within 21 to 28 days by eliminating back-and-forth query cycles through pre-sanction diligence.'
  },
  {
    id: 'faq_5',
    category: 'Feasibility',
    question: 'Can Inisio help us secure government subsidies for our project?',
    answer: 'Yes! We actively map your project against central and state government incentive schemes (such as PLI schemes, MoFPI agro-processing grants, State Industrial Policy capital subsidies, and interest subvention schemes) and embed subsidy cash flows directly into your financial model.'
  },
  {
    id: 'faq_6',
    category: 'Loan Process',
    question: 'What size of projects does Inisio handle?',
    answer: 'We specialize in greenfield projects ranging from ₹3 Crore to ₹500 Crore capital expenditure across manufacturing, solar, healthcare, food processing, warehousing, textiles, hospitality, and tech infrastructure.'
  }
];
