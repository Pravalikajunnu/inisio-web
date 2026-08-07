import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Calculator,
  Building2,
  FileText,
  Target,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface WhyChooseInisioProps {
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
}

export const WhyChooseInisio: React.FC<WhyChooseInisioProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  const whatWeDoList = [
    { title: 'Project Feasibility Assessment', desc: 'Comprehensive technical and commercial evaluation of greenfield ideas.' },
    { title: 'Bankability Evaluation', desc: 'Pre-screening credit risks against PSU and top private bank underwriting norms.' },
    { title: 'Detailed Project Report (DPR)', desc: '100+ page bank-grade documentation with 10-year financial projections.' },
    { title: 'Financial Planning', desc: 'Debt-equity structuring, working capital estimates, and CMA data preparation.' },
    { title: 'Loan Documentation Support', desc: 'Complete compilation of legal, technical, and compliance files for lenders.' },
    { title: 'End-to-End Project Finance Consultancy', desc: 'Dedicated ex-banker guidance through credit committee queries and sanction.' }
  ];

  const processSteps = [
    { number: '1', title: 'Business Idea', desc: 'Initial concept & vision' },
    { number: '2', title: 'Project Assessment', desc: 'Feasibility & risk review' },
    { number: '3', title: 'Financial Planning', desc: 'Debt-equity & CMA setup' },
    { number: '4', title: 'Bank-Ready DPR', desc: '100+ page bank report' },
    { number: '5', title: 'Loan Documentation', desc: 'Application & sanction' },
    { number: '6', title: 'Funding Guidance', desc: 'Final drawdown support' }
  ];

  const whyChooseUs = [
    {
      icon: Target,
      title: 'Greenfield Project Specialists',
      desc: 'Focused exclusively on new project development and project finance.'
    },
    {
      icon: FileText,
      title: 'Bank-Focused Documentation',
      desc: 'Professional DPRs and financial reports aligned with lender expectations.'
    },
    {
      icon: Building2,
      title: 'Industry Expertise',
      desc: 'Supporting manufacturing, food processing, healthcare, renewable energy, logistics, and more.'
    },
    {
      icon: ShieldCheck,
      title: 'End-to-End Guidance',
      desc: 'From project planning to funding support, our experts assist throughout the journey.'
    }
  ];

  return (
    <div id="about" className="bg-white text-[#111827] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        
        {/* 1. Header & Hero Intro */}
        <section className="max-w-[680px] mx-auto space-y-3 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>About Inisio</span>
          </div>

          <h1 className="font-manrope text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111827] leading-tight tracking-tight">
            Building Bank-Ready Greenfield Projects Across India
          </h1>

          <p className="font-inter text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed">
            Inisio is a specialized project advisory firm helping entrepreneurs transform greenfield project concepts into institutional bank-funded ventures through project evaluation, financial modeling, DPR preparation, and lender syndication.
          </p>
        </section>

        {/* 2. What We Do Section */}
        <section className="space-y-8">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Core Capabilities
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
              What We Do
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#4B5563] leading-relaxed">
              Providing structured, end-to-end advisory across every critical milestone of greenfield financing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {whatWeDoList.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all flex items-start gap-3.5 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-manrope text-base sm:text-lg font-semibold text-[#111827] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Our Approach / Flow */}
        <section className="space-y-8">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Structured Methodology
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
              Our Approach
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#4B5563] leading-relaxed">
              A transparent, phase-by-phase advisory roadmap designed for fast credit committee approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-4">
            {processSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-manrope font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {step.number}
                  </span>
                  {idx < processSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 hidden lg:block shrink-0" />
                  )}
                </div>
                <div>
                  <h4 className="font-manrope text-base font-semibold text-[#111827] tracking-tight">
                    {step.title}
                  </h4>
                  <p className="font-inter text-sm text-[#6B7280] leading-[1.5] mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Why Businesses Choose Inisio */}
        <section className="space-y-8">
          <div className="text-center max-w-[640px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Key Differentiators
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
              Why Businesses Choose Inisio
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {whyChooseUs.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4 text-left">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-manrope text-base sm:text-lg font-semibold text-[#111827] tracking-tight">
                      {card.title}
                    </h3>
                    <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Call-to-Action Section */}
        <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 text-center border border-blue-500/30 shadow-md">
          <div className="max-w-[620px] mx-auto space-y-4">
            <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
              Ready to Start Your Greenfield Project?
            </h2>
            <p className="font-inter text-xs sm:text-sm text-slate-300 leading-relaxed">
              Get an instant feasibility assessment or talk directly with our greenfield loan specialists.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              {onOpenAssessment && (
                <button
                  onClick={onOpenAssessment}
                  className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-blue-400 hover:bg-blue-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {onOpenConsultation && (
                <button
                  onClick={onOpenConsultation}
                  className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Book Free Advisory Call</span>
                </button>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
