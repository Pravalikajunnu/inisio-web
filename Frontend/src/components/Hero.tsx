import React from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileCheck2,
  LineChart,
  Landmark,
  Sparkles,
  XCircle
} from 'lucide-react';

interface HeroProps {
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {

  const whatInisioDoesPillars = [
    {
      icon: CheckCircle2,
      title: 'Feasibility & Bankability Pre-Screening',
      description: 'Evaluates technical viability, debt capacity, land readiness, and promoter contribution upfront.'
    },
    {
      icon: FileCheck2,
      title: '100+ Page Bank-Grade DPRs',
      description: 'Prepares comprehensive Detailed Project Reports with 10-year financial models & CMA projections.'
    },
    {
      icon: LineChart,
      title: 'Financial Planning & Debt Structuring',
      description: 'Optimizes debt-equity ratios, working capital cycles, and government subsidy eligibility.'
    },
    {
      icon: Landmark,
      title: 'End-to-End Loan Syndication',
      description: 'Directly supports credit committee presentation, sanctioning, and drawdown processes.'
    }
  ];

  return (
    <div id="home" className="bg-white text-gray-900 pt-20 sm:pt-28 pb-16 sm:pb-24">
      {/* 1. HERO HEADER - TEXT-ONLY CENTERED LAYOUT */}
      <section className="relative overflow-hidden">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Text Aligned Left */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6 text-left flex flex-col items-start"
            >
              {/* Category Tag */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Greenfield Project Finance &amp; Advisory</span>
              </div>

              {/* Headline */}
              <h1 className="font-manrope text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-[#0f172a] leading-[1.2] tracking-tight">
                Turn Your <span className="text-[#2161F5]">New Business Idea</span> into a <span className="text-[#1e293b]">Bank-Funded Enterprise</span>
              </h1>

              {/* Subtitle */}
              <p className="font-inter text-sm sm:text-base text-[#475569] font-normal leading-relaxed max-w-[540px]">
                Evaluate project feasibility, structure bank-grade DPRs, and secure term loan sanctions for new industrial units across India.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
                <button
                  onClick={onOpenAssessment}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#2161F5] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer touch-manipulation min-h-[48px]"
                >
                  <Calculator className="w-4.5 h-4.5 text-blue-100" />
                  <span>Start Project Assessment</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onOpenConsultation}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200/80 active:bg-gray-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200/80 touch-manipulation min-h-[48px]"
                >
                  <PhoneCall className="w-4.5 h-4.5 text-[#2161F5]" />
                  <span>Book Free Advisory Call</span>
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm font-medium text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Feasibility Scorecard</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100+ Page Bank-Ready DPR</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Bank Loan Syndication</span>
                </span>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Provided Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-6 relative flex justify-center"
            >
              <div className="relative w-full max-w-[620px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xl shadow-blue-950/5 border border-slate-100 p-1 sm:p-1.5">
                <img
                  src="https://res.cloudinary.com/aessymvl/image/upload/v1786098146/e7bf66f5-c48e-4940-819b-d9709be2b40a_zkg6lc.png"
                  alt="From Idea to Industrial Success - Inisio Greenfield Advisory Process"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. WHAT INISIO DOES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 space-y-10">
        <div className="text-center max-w-[580px] mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
            What Inisio Does
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            End-to-End Greenfield Advisory
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#4B5563]">
            Direct path from business concept to credit committee loan sanction.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {whatInisioDoesPillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-4 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-manrope text-base sm:text-lg font-semibold text-[#111827] tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. THE PROBLEM & SOLUTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="space-y-8">
          <div className="text-center max-w-[580px] mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
              Greenfield Funding Advantage
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
              De-Risking Debt Syndication
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* The Common Challenge */}
            <div className="bg-rose-50/40 rounded-2xl p-5 sm:p-6 space-y-3 border border-rose-100 text-left">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Without Advisory</span>
              </div>
              <ul className="space-y-2.5 font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>70%+ of applications rejected due to uncalibrated financial projections.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Generic CA reports fail institutional credit underwriting norms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Promoters miss out on state and central capital subsidies.</span>
                </li>
              </ul>
            </div>

            {/* Inisio Solution */}
            <div className="bg-blue-50/40 rounded-2xl p-5 sm:p-6 space-y-3 border border-blue-100 text-left">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>With Inisio</span>
              </div>
              <ul className="space-y-2.5 font-inter text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Ex-banker pre-screening aligned with PSU and top private bank norms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>100+ page bank-ready DPR with 10-year financial models &amp; CMA data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>End-to-end guidance from project sizing to final loan disbursement.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


