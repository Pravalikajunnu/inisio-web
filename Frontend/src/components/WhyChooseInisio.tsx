import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  FileText,
  Landmark,
  IndianRupee,
  CheckCircle2,
  Search,
  Send,
  ShieldCheck,
  Calculator,
  PhoneCall,
  TrendingUp,
  Rocket,
  Layers,
  FolderKanban,
  CheckSquare,
  Building2,
  Check
} from 'lucide-react';

interface WhyChooseInisioProps {
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
}

export const WhyChooseInisio: React.FC<WhyChooseInisioProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  // Step 1 process overview (Understand -> Prepare -> Apply -> Get Funded)
  const overviewSteps = [
    {
      step: '1',
      title: 'UNDERSTAND',
      desc: 'We analyze your business goals and funding requirements.',
      icon: Search
    },
    {
      step: '2',
      title: 'PREPARE',
      desc: 'We assess loan eligibility and compile bank-grade documents.',
      icon: FileText
    },
    {
      step: '3',
      title: 'APPLY',
      desc: 'We guide you toward suitable banks and financial institutions.',
      icon: Send
    },
    {
      step: '4',
      title: 'GET FUNDED',
      desc: 'Secure the business loan you need to grow and expand.',
      icon: CheckCircle2,
      isSuccess: true
    }
  ];

  // SECTION 2: What We Help You With
  const whatWeHelpWith = [
    {
      title: 'Loan Eligibility',
      desc: 'Understand your funding requirements and loan eligibility.',
      icon: CheckSquare
    },
    {
      title: 'Documentation',
      desc: 'Prepare the necessary documents for your business loan application.',
      icon: FileText
    },
    {
      title: 'Bank Assistance',
      desc: 'Get guidance on approaching suitable banks and financial institutions.',
      icon: Landmark
    },
    {
      title: 'Business Funding',
      desc: 'Take the right steps toward securing the funding your business needs.',
      icon: IndianRupee
    }
  ];

  // SECTION 3: How Inisio Helps (6-Step Visual Journey)
  const sixStepJourney = [
    {
      num: '01',
      title: 'Your Requirement',
      desc: 'Understand your business and funding needs.',
      icon: Search
    },
    {
      num: '02',
      title: 'Eligibility Check',
      desc: 'Assess your loan eligibility and funding requirements.',
      icon: Calculator
    },
    {
      num: '03',
      title: 'Document Preparation',
      desc: 'Prepare the necessary business and financial documents.',
      icon: FileText
    },
    {
      num: '04',
      title: 'Bank Assistance',
      desc: 'Guide you toward suitable banks and financial institutions.',
      icon: Landmark
    },
    {
      num: '05',
      title: 'Loan Application',
      desc: 'Support you through the application process.',
      icon: Send
    },
    {
      num: '06',
      title: 'Funding',
      desc: 'Work toward securing the required business funding.',
      icon: CheckCircle2,
      isSuccess: true
    }
  ];

  // SECTION 4: Why Choose Inisio? (4 Concise Benefits)
  const whyChooseBenefits = [
    {
      title: 'Simple Loan Process',
      desc: 'Clear, hassle-free guidance that removes complexity and confusion from bank financing.'
    },
    {
      title: 'Business-Focused Guidance',
      desc: 'Tailored support aligned with your specific business model, project stage, and funding goals.'
    },
    {
      title: 'Bank-Ready Documentation',
      desc: 'Professionally structured financial reports and documentation that meet credit norms.'
    },
    {
      title: 'End-to-End Assistance',
      desc: 'Dedicated advisory from initial requirements analysis through document preparation to final sanction.'
    }
  ];

  // SECTION 5: Who We Help (4 Categories)
  const whoWeHelpCategories = [
    {
      title: 'Start a Business',
      desc: 'Get guidance when turning your business idea into reality.',
      icon: Rocket,
      badge: 'Greenfield & New Ventures'
    },
    {
      title: 'Expand Your Business',
      desc: 'Explore funding options to support business growth.',
      icon: TrendingUp,
      badge: 'Growth & Scaling'
    },
    {
      title: 'Purchase Equipment',
      desc: 'Get support for equipment and expansion requirements.',
      icon: Layers,
      badge: 'Machinery & Capital Goods'
    },
    {
      title: 'Develop a Project',
      desc: 'Prepare your project for suitable funding opportunities.',
      icon: FolderKanban,
      badge: 'Project Advisory'
    }
  ];

  return (
    <div id="about" className="bg-white text-[#111827] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ==========================================
            SECTION 1: STORY & OVERVIEW
           ========================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Story */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Section Tag */}
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>About Inisio</span>
            </div>

            <h1 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] leading-tight tracking-tight">
              Your Business Needs Funding. We Help You Get the Right Loan.
            </h1>

            <div className="space-y-4 font-inter text-sm sm:text-base text-[#4B5563] leading-relaxed">
              <p>
                Starting or growing a business often requires funding. But finding the right loan, understanding eligibility, preparing documents, and approaching banks can be difficult.
              </p>

              <p className="font-semibold text-blue-700 text-base sm:text-lg">
                That’s where Inisio helps.
              </p>

              <p>
                Inisio makes the business loan process simpler. We understand your business and funding requirements, help you assess your loan eligibility, prepare the necessary documents, and guide you toward suitable banks and financial institutions for your business loan.
              </p>

              <p>
                Whether you are starting a new business, expanding an existing business, purchasing equipment, or developing a new project, we help you take the right steps toward securing the funding you need.
              </p>
            </div>

            {/* Highlighted Statement */}
            <div className="bg-blue-50/80 border-l-4 border-blue-600 p-4 sm:p-5 rounded-r-xl shadow-xs">
              <p className="font-manrope text-base sm:text-lg font-bold text-blue-950">
                “We help you go from business plan to business loan.”
              </p>
            </div>
          </div>

          {/* Right Column: Clean Fintech Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/40 border border-slate-200/80 p-6 sm:p-8 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-100/50 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

              <div className="relative space-y-3.5">
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 tracking-wide">Inisio Advisory Guidance</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Bank Sanction
                  </span>
                </div>

                {/* Step 1 Node */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Entrepreneur & Business Plan</div>
                      <div className="text-[11px] text-slate-500">Project requirements & funding goals</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">1. Plan</span>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-blue-300" />
                </div>

                {/* Step 2 Node */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Eligibility & Document Prep</div>
                      <div className="text-[11px] text-slate-500">Assessment & bank-grade reports</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">2. Assess</span>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-blue-300" />
                </div>

                {/* Step 3 Node */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Bank & Financial Institutions</div>
                      <div className="text-[11px] text-slate-500">Connecting to suitable lenders</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">3. Guide</span>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-emerald-400" />
                </div>

                {/* Step 4 Node - Approval */}
                <div className="bg-emerald-50/90 rounded-xl p-3.5 border border-emerald-200/90 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <IndianRupee className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                        Business Loan Disbursal
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-emerald-800">Approved funding for growth</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Section 1 Visual Steps Bar */}
        <section className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewSteps.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 ${
                    s.isSuccess
                      ? 'bg-emerald-50/60 border-emerald-200/90'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        s.isSuccess
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <span
                      className={`font-manrope font-extrabold text-xs ${
                        s.isSuccess ? 'text-emerald-700' : 'text-blue-600'
                      }`}
                    >
                      0{s.step}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`font-manrope font-bold text-sm tracking-tight ${
                        s.isSuccess ? 'text-emerald-950' : 'text-slate-900'
                      }`}
                    >
                      {s.title}
                    </h3>
                    <p className="font-inter text-xs text-[#6B7280] leading-relaxed mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center max-w-2xl mx-auto pt-1">
            <p className="font-inter text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 py-2.5 px-5 rounded-xl border border-slate-200/60">
              “Our goal is simple: make business funding easier, clearer, and more accessible for entrepreneurs.”
            </p>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: WHAT WE HELP YOU WITH
           ========================================== */}
        <section className="space-y-8 pt-4 border-t border-slate-200/70">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Core Assistance
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              What We Help You With
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#6B7280]">
              End-to-end guidance to prepare your business for successful bank financing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whatWeHelpWith.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all text-left flex flex-col justify-between space-y-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-manrope font-bold text-base text-[#111827] tracking-tight">
                      {idx + 1}. {item.title}
                    </h3>
                    <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==========================================
            SECTION 3: HOW INISIO HELPS (6-STEP VISUAL JOURNEY)
           ========================================== */}
        <section className="space-y-8 pt-6 border-t border-slate-200/70">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Process Journey
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              From Business Need to Funding
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#6B7280]">
              A structured 6-step advisory path designed to guide you seamlessly from initial idea to bank sanction.
            </p>
          </div>

          {/* Top Horizontal Step Progress Bar (Desktop / Tablet) */}
          <div className="hidden md:block max-w-4xl mx-auto px-4">
            <div className="relative flex items-center justify-between">
              {/* Connecting Background Line */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 -translate-y-1/2 z-0 rounded-full scale-x-100 origin-left" />

              {sixStepJourney.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-manrope font-bold text-xs shadow-xs transition-all ${
                      step.isSuccess
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-white text-blue-700 border-2 border-blue-600 group-hover:scale-105'
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                      step.isSuccess ? 'text-emerald-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Step Journey Grid (3 Columns x 2 Rows for maximum space & readability) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 pt-2">
            {sixStepJourney.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-6 border text-left flex flex-col justify-between space-y-4 transition-all duration-200 ${
                    step.isSuccess
                      ? 'bg-gradient-to-br from-emerald-50/80 to-white border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-400'
                      : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Row: Step Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-manrope font-extrabold text-xs px-3 py-1 rounded-full border ${
                        step.isSuccess
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-blue-50 text-blue-700 border-blue-200/80'
                      }`}
                    >
                      Step {step.num}
                    </span>

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        step.isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5">
                    <h3
                      className={`font-manrope font-bold text-base sm:text-lg tracking-tight ${
                        step.isSuccess ? 'text-emerald-950' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`font-inter text-xs sm:text-sm leading-relaxed ${
                        step.isSuccess ? 'text-emerald-800/90' : 'text-slate-600'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>{step.isSuccess ? 'Final Sanction' : `Phase ${idx < 3 ? '1: Advisory' : '2: Application'}`}</span>
                    {idx < 5 && (
                      <span className="text-blue-500 font-bold hidden md:inline">
                        Step 0{idx + 2} →
                      </span>
                    )}
                    {step.isSuccess && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        ✓ Disbursal Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==========================================
            SECTION 4: WHY CHOOSE INISIO?
           ========================================== */}
        <section className="space-y-8 pt-4 border-t border-slate-200/70">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Clear Value Proposition
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Why Choose Inisio?
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#6B7280]">
              Transparent, professional advisory designed for speed, clarity, and bankability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whyChooseBenefits.map((b, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-manrope font-bold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
                    {b.title}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            SECTION 5: WHO WE HELP
           ========================================== */}
        <section className="space-y-8 pt-4 border-t border-slate-200/70">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Tailored Guidance
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Funding Support for Every Stage of Your Business
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#6B7280]">
              Whether starting fresh or scaling up, we align with your specific stage of growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whoWeHelpCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all text-left flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200/80">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-manrope font-bold text-base text-slate-900 tracking-tight">
                        {cat.title}
                      </h3>
                      <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed mt-1">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onOpenAssessment}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-200/60"
                  >
                    <span>Check Stage Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==========================================
            SECTION 6: FINAL CTA
           ========================================== */}
        <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center border border-blue-500/30 shadow-xl relative overflow-hidden">
          {/* Subtle background ambient light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-[620px] mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-300 bg-blue-900/60 px-3.5 py-1 rounded-full border border-blue-700/50 uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Inisio Loan Advisory</span>
            </div>

            <h2 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Looking for a Project Loan?
            </h2>

            <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto">
              Tell us about your business and funding requirement. We'll help you understand the next steps.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={onOpenAssessment}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-950 bg-blue-400 hover:bg-blue-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Calculator className="w-4 h-4 text-slate-950" />
                <span>Check Loan Eligibility →</span>
              </button>

              {onOpenConsultation && (
                <button
                  onClick={onOpenConsultation}
                  className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Talk to an Expert</span>
                </button>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};


