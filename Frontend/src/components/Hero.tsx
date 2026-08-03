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
    <div id="home" className="bg-white text-gray-900 pt-24 pb-20 sm:pt-28 sm:pb-28">
      {/* 1. HERO HEADER (Left Aligned, Max-width 600px) */}
      <section className="relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[800px] mx-auto space-y-6 text-center flex flex-col items-center"
          >
            {/* Top Tag - Centered */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Greenfield Project Finance & Advisory</span>
            </div>

            {/* Main Title */}
            <h1 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] leading-tight tracking-tight">
              Turn Your <span className="text-blue-600">Greenfield Venture</span> into a Bank-Funded Enterprise
            </h1>

            {/* Subtitle - Ultra Minimalistic */}
            <p className="font-inter text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed max-w-[580px]">
              Evaluate project feasibility, structure bank-grade DPRs, and secure term loan sanctions for new industrial units across India.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto">
              <button
                onClick={onOpenAssessment}
                className="w-full sm:w-auto px-5 py-3 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-blue-100" />
                <span>Start Project Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenConsultation}
                className="w-full sm:w-auto px-5 py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200"
              >
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Book Free Advisory Call</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHAT INISIO DOES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 space-y-10">
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
                  <span>100+ page bank-ready DPR with 10-year financial models & CMA data.</span>
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
