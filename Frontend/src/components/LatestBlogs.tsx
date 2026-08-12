import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  X,
  Share2,
  CheckCircle2,
  Building2,
  Sparkles,
  ChevronRight,
  Calculator,
  MessageSquare
} from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
  content: {
    intro: string;
    sections: { heading: string; body: string }[];
    keyTakeaways: string[];
  };
}

export const SAMPLE_BLOGS: BlogPost[] = [
  {
    id: 'get-business-loan-india',
    title: 'How to Get a Business Loan in India',
    category: 'Debt Syndication',
    date: '10 Aug 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    summary: 'A step-by-step guide to applying for MSME and corporate business loans with bankable document preparation and interest rate optimization.',
    content: {
      intro: 'Securing a business loan in India requires more than just filling out bank application forms. Indian PSU and private sector banks follow stringent credit underwriting frameworks that scrutinize promoter experience, collateral strength, cash flow projections, and debt-service coverage ratio (DSCR).',
      sections: [
        {
          heading: '1. Choose the Right Loan Structure',
          body: 'Determine whether your project requires a Term Loan for capital assets (land, building, plant machinery) or a Working Capital Facility (Cash Credit / Overdraft) for raw materials and operational cycles.'
        },
        {
          heading: '2. Prepare Bankable DPR & Financial Models',
          body: 'Banks require a Detailed Project Report (DPR) certified by experienced advisors. Ensure your DPR includes clear Capex estimates, 5 to 7-year balance sheet projections, Sensitivity Analysis, and a DSCR above 1.5x.'
        },
        {
          heading: '3. Approach the Right Banking Partner',
          body: 'Different banks specialize in different sectors—SBI and Canara Bank favor heavy manufacturing, while HDFC and ICICI often process tech parks and healthcare expansion faster with flexible collateral norms.'
        }
      ],
      keyTakeaways: [
        'Maintain a minimum promoter equity contribution of 25% to 30%.',
        'Ensure land is non-agricultural (NA) converted with clear title deeds.',
        'Target a Debt Service Coverage Ratio (DSCR) above 1.5x for seamless approval.'
      ]
    }
  },
  {
    id: 'prepare-bankable-dpr',
    title: 'How to Prepare a Bankable DPR',
    category: 'DPR & Advisory',
    date: '05 Aug 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    summary: 'Learn what credit committees look for in Detailed Project Reports (DPR), debt-equity ratios, DSCR projections, and financial modeling.',
    content: {
      intro: 'A Detailed Project Report (DPR) is the single most critical document submitted to bank credit committees. A poorly structured DPR leads to rejection or delays, whereas a professionally prepared DPR accelerates loan sanction.',
      sections: [
        {
          heading: '1. Detailed Technical & Civil Estimates',
          body: 'Include architect-certified civil estimates, machinery quotations from verified OEMs, and land allotment letters from state industrial development corporations (e.g., TSIIC, MIDC, RIICO).'
        },
        {
          heading: '2. Sound Financial Assumptions',
          body: 'Avoid overly optimistic sales growth projections. Include realistic capacity utilization build-up (e.g., Year 1: 50%, Year 2: 70%, Year 3+: 85%) and factor in interest during construction (IDC).'
        },
        {
          heading: '3. Risk Mitigation & TEFR Validation',
          body: 'Incorporate a Techno-Economic Feasibility Report (TEFR) highlighting raw material availability, power sanction feasibility, and environmental clearance status.'
        }
      ],
      keyTakeaways: [
        'Attach OEM machinery quotations and certified civil layout plans.',
        'Demonstrate realistic capacity utilization curves.',
        'Include TEFR sensitivity tests for raw material price spikes.'
      ]
    }
  },
  {
    id: 'business-loan-eligibility-checklist',
    title: 'Business Loan Eligibility Checklist',
    category: 'Financial Checklist',
    date: '28 Jul 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    summary: 'Essential documents and eligibility parameters required by Indian public and private banks for fast-track loan sanction.',
    content: {
      intro: 'To avoid back-and-forth bank queries, promoters should compile a complete credit dossier before approaching lenders. Having all documents ready reduces sanction turnaround time from months to weeks.',
      sections: [
        {
          heading: 'KYC & Promoter Track Record',
          body: 'Aadhaar, PAN, Net Worth Statements certified by CA, 3 years ITR of promoters, and details of existing running businesses.'
        },
        {
          heading: 'Project & Land Documents',
          body: 'Registered Sale Deed / Allotment Letter, Approved Factory Building Layout, Pollution Control Board (PCB) CTE/CTO clearances.'
        },
        {
          heading: 'Financial Documents',
          body: 'Audited Financial Statements for last 3 fiscal years, provisional financial statement for current year, and GST returns.'
        }
      ],
      keyTakeaways: [
        'Keep promoter CIBIL score above 720+.',
        'Keep CA-certified Net Worth Statements updated.',
        'Ensure GST returns align closely with audited turnover figures.'
      ]
    }
  },
  {
    id: 'top-reasons-loans-rejected',
    title: 'Top Reasons Business Loans Get Rejected',
    category: 'Credit Underwriting',
    date: '20 Jul 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    summary: 'Understand key red flags like low DSCR, improper land documentation, weak promoter contribution, and how Inisio resolves them.',
    content: {
      intro: 'Over 40% of greenfield and expansion business loan applications in India face rejection during initial credit appraisal due to preventable technical or financial mismatches.',
      sections: [
        {
          heading: '1. Weak Promoter Contribution or Lack of Skin in the Game',
          body: 'Banks expect promoters to bring 25-30% equity upfront. Attempting 100% debt funding without tangible equity commitment is the primary reason for immediate rejection.'
        },
        {
          heading: '2. Unclear Collateral Title & Zone Classification',
          body: 'Pledging agricultural land or property under litigation created severe documentation blocks. Land must be clearly designated for industrial/commercial use.'
        },
        {
          heading: '3. Inadequate Cash Flow and Low DSCR (< 1.25x)',
          body: 'If projected cash flows fail to show at least 1.25x debt coverage over interest and principal repayments, banks classify the proposal as high default risk.'
        }
      ],
      keyTakeaways: [
        'Pre-validate DSCR and debt-equity parameters prior to bank submission.',
        'Resolve land title and zoning approvals before credit appraisal.',
        'Work with specialized debt syndication advisors to bridge compliance gaps.'
      ]
    }
  },
  {
    id: 'working-capital-vs-term-loan',
    title: 'Working Capital vs Term Loan',
    category: 'Corporate Finance',
    date: '14 Jul 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    summary: 'Key differences between Cash Credit (CC) / Overdraft (OD) limits and Term Loans for capital expenditure and plant expansion.',
    content: {
      intro: 'Matching the right financial instrument to the right business need is essential for optimal interest costs and healthy working capital cycles.',
      sections: [
        {
          heading: 'Term Loans for Long-Term Asset Creation',
          body: 'Term loans feature fixed repayment schedules (5 to 10 years) with moratorium periods. They are used exclusively for land, factory construction, and heavy machinery.'
        },
        {
          heading: 'Working Capital for Operational Liquidity',
          body: 'Cash Credit (CC) or Letter of Credit (LC) facilities finance inventory and receivables. Interest is paid only on the utilized amount on a monthly basis.'
        },
        {
          heading: 'Hybrid Financing Strategy',
          body: 'Successful greenfield ventures tie term loans to long-term assets while establishing a sanctioned CC limit to absorb seasonal inventory holding periods.'
        }
      ],
      keyTakeaways: [
        'Never use short-term working capital funds for long-term land or Capex.',
        'Negotiate moratorium periods on term loans until commercial operation date (COD).',
        'Review drawing power (DP) calculations regularly to maintain CC limits.'
      ]
    }
  },
  {
    id: 'msme-loan-schemes-explained',
    title: 'MSME Loan Schemes Explained',
    category: 'Government Schemes',
    date: '02 Jul 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    summary: 'Complete breakdown of CGTMSE, PMEGP, MUDRA, and subsidy schemes available for manufacturing and service sectors in India.',
    content: {
      intro: 'The Government of India and various state governments offer attractive credit guarantee and interest subsidy schemes to empower manufacturing and MSME enterprises.',
      sections: [
        {
          heading: '1. CGTMSE (Credit Guarantee Scheme)',
          body: 'Provides collateral-free credit facilities up to ₹5 Crore for eligible MSME micro and small enterprises, with guarantee coverage provided by the trust.'
        },
        {
          heading: '2. State Capital Subsidies & Power Tariffs',
          body: 'State policies (e.g. Telangana T-IDEA, Maharashtra PSI) offer 15-25% capital investment subsidies, power tariff reimbursements, and 100% stamp duty exemption.'
        },
        {
          heading: '3. Interest Subsidies under TUFS & PLI Schemes',
          body: 'Targeted sectors like textiles, electronics, and green energy receive interest subventions ranging from 3% to 6% per annum.'
        }
      ],
      keyTakeaways: [
        'Register under MSME Udyam Portal before submitting bank proposals.',
        'Explore CGTMSE coverage for collateral-relaxed options up to ₹5 Cr.',
        'Combine central and state incentives to lower effective borrowing costs.'
      ]
    }
  }
];

interface LatestBlogsProps {
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
}

export const LatestBlogs: React.FC<LatestBlogsProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  const [showAll, setShowAll] = useState(false);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const visibleBlogs = showAll ? SAMPLE_BLOGS : SAMPLE_BLOGS.slice(0, 3);

  return (
    <section id="blogs" className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-[#FAFCFF] border-t border-slate-100 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Advisory Insights &amp; Articles
          </span>
          <h2 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Latest Blogs &amp; Financial Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Expert guidance on debt syndication, bankable DPR preparation, MSME loan schemes, and financial risk assessment.
          </p>
        </div>

        {/* Blog Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => setActivePost(blog)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer h-full"
            >
              {/* Featured Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
                  {blog.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Date & Read Time */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {blog.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {blog.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-manrope text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* 2-3 Line Description */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {blog.summary}
                  </p>
                </div>

                {/* Read More Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800 flex items-center gap-1">
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                    Inisio Advisory
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Blogs / Toggle Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-7 py-3 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-xl border border-blue-200 shadow-2xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>{showAll ? 'Show Fewer Articles' : 'View All Blogs'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>

      </div>

      {/* Full Article Reader Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full text-slate-900 shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="relative h-56 sm:h-64 overflow-hidden shrink-0">
              <img
                src={activePost.image}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                title="Close article"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/80 inline-block">
                  {activePost.category}
                </span>
                <h2 className="font-manrope text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  {activePost.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span>{activePost.date}</span>
                  <span>•</span>
                  <span>{activePost.readTime}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 font-inter text-slate-800 text-sm leading-relaxed">
              <p className="text-base font-medium text-slate-900 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                {activePost.content.intro}
              </p>

              <div className="space-y-5">
                {activePost.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="font-manrope font-bold text-slate-900 text-base">
                      {sec.heading}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Key Takeaways */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Key Inisio Advisory Takeaways</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {activePost.content.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Inside Modal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Need Bank Loan Advisory for Your Business?</h4>
                  <p className="text-xs text-slate-600">Calculate eligibility or request a consultation with Inisio advisors.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenAssessment && (
                    <button
                      onClick={() => {
                        setActivePost(null);
                        onOpenAssessment();
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Check Loan Eligibility</span>
                    </button>
                  )}
                  {onOpenConsultation && (
                    <button
                      onClick={() => {
                        setActivePost(null);
                        onOpenConsultation();
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Call</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Inisio Corporate Financial Advisory</span>
              <button
                onClick={() => setActivePost(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
