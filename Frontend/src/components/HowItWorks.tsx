import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  FileSearch,
  FileSpreadsheet,
  Building2,
  Send,
  HelpCircle,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  FileCheck,
  Landmark,
  Briefcase,
  Users2,
  BarChart3,
  BadgeCheck,
  Layers
} from 'lucide-react';

interface HowItWorksProps {
  onOpenConsultation: () => void;
  onOpenAssessment: () => void;
  onNavigateToContact: () => void;
}

interface StepItem {
  number: number;
  id: string;
  title: string;
  shortTitle: string;
  timeframe: string;
  description: string;
  icon: React.ElementType;
  points: string[];
  deliverables: string[];
}

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: 1,
    id: 'consultation',
    title: 'Free Project Consultation',
    shortTitle: 'Consultation',
    timeframe: 'Day 1 – 2',
    description: 'Help entrepreneurs understand whether their Greenfield Project is suitable for bank funding.',
    icon: MessageSquare,
    points: [
      'Understand the business idea',
      'Discuss project cost',
      'Estimate funding requirement',
      'Explain the project loan process'
    ],
    deliverables: ['Initial Consultation', 'Project Checklist']
  },
  {
    number: 2,
    id: 'feasibility',
    title: 'Project Feasibility Assessment',
    shortTitle: 'Feasibility',
    timeframe: 'Day 3 – 5',
    description: 'Evaluate whether the project is financially and technically viable.',
    icon: FileSearch,
    points: [
      'Market demand',
      'Technical feasibility',
      'Investment analysis',
      'Profitability estimation',
      'Project loan eligibility'
    ],
    deliverables: ['Feasibility Report', 'Bankability Assessment']
  },
  {
    number: 3,
    id: 'documentation',
    title: 'DPR & Financial Documentation',
    shortTitle: 'DPR & Documents',
    timeframe: 'Day 6 – 12',
    description: 'Prepare complete bank-ready documents.',
    icon: FileSpreadsheet,
    points: [
      'Detailed Project Report (DPR)',
      'Financial Projections',
      'Cost Estimates',
      'CMA Data',
      'Required Documents'
    ],
    deliverables: ['Complete Project Loan File', 'Bank-Ready DPR']
  },
  {
    number: 4,
    id: 'bank-selection',
    title: 'Select the Right Bank',
    shortTitle: 'Bank Selection',
    timeframe: 'Day 13 – 16',
    description: 'Recommend the most suitable lender.',
    icon: Building2,
    points: [
      'Compare banks',
      'Compare loan schemes',
      'Compare interest rates',
      'Government subsidy options',
      'Funding structure'
    ],
    deliverables: ['Bank Recommendation', 'Loan Strategy']
  },
  {
    number: 5,
    id: 'application',
    title: 'Project Loan Application',
    shortTitle: 'Application',
    timeframe: 'Day 17 – 20',
    description: 'Handle the complete application process.',
    icon: Send,
    points: [
      'Prepare application',
      'Verify documents',
      'Submit to bank',
      'Track application'
    ],
    deliverables: ['Submitted Loan Application', 'Tracking Support']
  },
  {
    number: 6,
    id: 'bank-review',
    title: 'Bank Review Support',
    shortTitle: 'Bank Review',
    timeframe: 'Day 21 – 35',
    description: 'Coordinate with banks until approval.',
    icon: HelpCircle,
    points: [
      'Respond to bank queries',
      'Additional documentation',
      'Site inspection support',
      'Financial clarification'
    ],
    deliverables: ['Query Resolution', 'Updated Documents']
  },
  {
    number: 7,
    id: 'sanction',
    title: 'Project Loan Sanction',
    shortTitle: 'Loan Sanction',
    timeframe: 'Day 36 – 45',
    description: 'Guide the client after approval.',
    icon: Award,
    points: [
      'Explain sanction letter',
      'Loan conditions',
      'Documentation support',
      'Next steps'
    ],
    deliverables: ['Sanction Letter Guidance', 'Loan Acceptance Support']
  },
  {
    number: 8,
    id: 'disbursement',
    title: 'Loan Disbursement & Project Execution',
    shortTitle: 'Disbursement',
    timeframe: 'Post-Sanction',
    description: 'Continue supporting the client after sanction.',
    icon: TrendingUp,
    points: [
      'Loan disbursement assistance',
      'Project implementation guidance',
      'Subsidy support',
      'Post-loan advisory'
    ],
    deliverables: ['Fund Release Support', 'Ongoing Project Guidance']
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onOpenConsultation,
  onOpenAssessment,
  onNavigateToContact
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="bg-white text-slate-900 min-h-screen py-10 sm:py-16 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* ========================================================================= */}
        {/* 1. Hero Section */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Project Loan Advisory Platform (Not a Bank)</span>
          </div>

          <h1 className="font-manrope text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Your Step-by-Step Journey to a <span className="text-blue-600">Successful Project Loan</span>
          </h1>

          <p className="font-inter text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            From your business idea to project loan sanction and fund disbursement, Inisio guides you through every stage with expert advisory, bank-ready documentation, and complete project finance support.
          </p>

          {/* Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-3xl mx-auto">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-2xs hover:border-blue-300 transition-colors">
              <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-manrope">Project Loan Experts</h3>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-2xs hover:border-blue-300 transition-colors">
              <FileCheck className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-manrope">Bank-Ready Documentation</h3>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-2xs hover:border-blue-300 transition-colors">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-manrope">Faster Loan Processing</h3>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-2xs hover:border-blue-300 transition-colors">
              <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-manrope">End-to-End Advisory</h3>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onOpenAssessment}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-manrope font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Start Project Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConsultation}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-manrope font-semibold text-sm sm:text-base rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>Book Free Consultation</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. Interactive Step Progression Track */}
        {/* ========================================================================= */}
        <section className="max-w-5xl mx-auto space-y-4">
          
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-manrope">
                  8-Step Project Loan Process
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Step {activeStep} of 8: {HOW_IT_WORKS_STEPS[activeStep - 1]?.title}
                </span>
              </div>

              {/* Prev / Next Quick Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prev = Math.max(1, activeStep - 1);
                    setActiveStep(prev);
                    document.getElementById(`step-${prev}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  disabled={activeStep === 1}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(8, activeStep + 1);
                    setActiveStep(next);
                    document.getElementById(`step-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  disabled={activeStep === 8}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Step Selector Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {HOW_IT_WORKS_STEPS.map((step) => {
                const isActive = activeStep === step.number;
                const isCompleted = activeStep > step.number;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStep(step.number);
                      document.getElementById(`step-${step.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : isCompleted
                        ? 'bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100/80'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-blue-100' : isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                      Step {step.number}
                    </span>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">
                      {step.shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. Detailed 8-Step Timeline (Vertical Connected Flow) */}
        {/* ========================================================================= */}
        <section className="relative max-w-5xl mx-auto space-y-6 sm:space-y-10">
          
          {/* Central Connecting Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 -translate-x-1/2 z-0" />

          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 1;

            return (
              <motion.div
                key={step.id}
                id={`step-${step.number}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={`relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center scroll-mt-24 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Center Badge Number for Desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-blue-600 shadow-md items-center justify-center font-manrope font-extrabold text-sm text-blue-700 z-20">
                  {step.number}
                </div>

                {/* Main Card Column */}
                <div className={`${isEven ? 'md:col-start-2' : 'md:col-start-1'}`}>
                  <div
                    className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-300 shadow-2xs hover:shadow-lg ${
                      activeStep === step.number
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200/90 hover:border-blue-300'
                    }`}
                  >
                    {/* Top Row: Icon, Step Tag & Title */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              Step {step.number}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {step.timeframe}
                            </span>
                          </div>
                          <h3 className="font-manrope text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Step Description */}
                    <p className="font-inter text-xs sm:text-sm text-slate-600 leading-relaxed py-2.5">
                      {step.description}
                    </p>

                    {/* Key Activities List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        What Inisio Does:
                      </span>
                      <ul className="space-y-1.5">
                        {step.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/80 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-3 sm:px-6 rounded-b-2xl">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Deliverables:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {step.deliverables.map((del, dIdx) => (
                          <span key={dIdx} className="text-[11px] font-semibold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200/80 shadow-2xs">
                            ✓ {del}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Counterpart Visual Indicator for Desktop Side */}
                <div className={`hidden md:flex flex-col justify-center ${isEven ? 'md:col-start-1 text-right' : 'md:col-start-2 text-left'}`}>
                  <div className={`p-4 rounded-xl bg-slate-50/80 border border-slate-200 max-w-xs ${isEven ? 'ml-auto' : 'mr-auto'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded inline-block mb-1">
                      Step {step.number} Milestone
                    </span>
                    <h4 className="font-manrope text-xs sm:text-sm font-bold text-slate-900">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {step.deliverables.join(' • ')}
                    </p>
                  </div>
                </div>

              </motion.div>
            );
          })}

        </section>

        {/* ========================================================================= */}
        {/* 4. Statistics Section (Animated Counters) */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-blue-800/40 shadow-lg">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Proven Advisory Track Record
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white">
              Greenfield Project Loan Expertise
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <span className="font-manrope text-2xl sm:text-3xl font-extrabold text-blue-400 block">
                ₹5 Cr – ₹500 Cr+
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">Projects Supported</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <span className="font-manrope text-2xl sm:text-3xl font-extrabold text-blue-400 block">
                30+
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">Banking Partners</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <span className="font-manrope text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
                100%
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">Bank-Ready DPR</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <span className="font-manrope text-2xl sm:text-3xl font-extrabold text-blue-400 block">
                End-to-End
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">Project Loan Advisory</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. Why Choose Inisio */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Why Choose Inisio
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900">
              Your Trusted Project Loan Advisory Partner
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-inter">
              We help you prepare, apply, and secure Greenfield Project funding without confusion or delays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-manrope text-base font-bold text-slate-900">
                Project Loan Specialists
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Experts in Greenfield Project financing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-manrope text-base font-bold text-slate-900">
                Bank-Ready Documentation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Professional DPRs and financial reports prepared as per banking standards.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-manrope text-base font-bold text-slate-900">
                Faster Loan Processing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reduce delays with complete documentation and dedicated support.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-manrope text-base font-bold text-slate-900">
                Complete Project Finance Support
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From idea validation to loan disbursement.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. Final Call-to-Action */}
        {/* ========================================================================= */}
        <section className="pt-4">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white text-center border border-blue-900/60 shadow-xl relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Greenfield Project Finance</span>
              </div>

              <h2 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Get Your Project Loan?
              </h2>

              <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Whether you're setting up a manufacturing unit, food processing plant, warehouse, hospital, hotel, renewable energy project, or any other Greenfield Project, Inisio helps you prepare, apply, and secure the right Project Loan with confidence.
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onOpenAssessment}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-manrope font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-blue-500/25 flex items-center gap-2.5 cursor-pointer"
                >
                  <span>Start Project Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenConsultation}
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-manrope font-semibold text-sm sm:text-base rounded-xl transition-all hover:border-white/40 cursor-pointer flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Talk to a Project Loan Expert</span>
                </button>
              </div>

              <div className="pt-2 text-xs text-slate-400 font-inter flex flex-wrap items-center justify-center gap-6">
                <span>✓ 100% Confidential</span>
                <span>✓ Bank-Ready Advisory</span>
                <span>✓ Greenfield Specialists</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

