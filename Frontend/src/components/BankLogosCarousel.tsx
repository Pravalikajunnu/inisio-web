import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Building2, CheckCircle2, Award } from 'lucide-react';

interface BankPartner {
  id: string;
  name: string;
  shortName: string;
  category: 'Public Sector' | 'Private Sector' | 'Development NBFC' | 'Apex Financial';
  typicalSanction: string;
  focusArea: string;
}

const BANK_PARTNERS: BankPartner[] = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    category: 'Public Sector',
    typicalSanction: '₹1 Cr – ₹250+ Cr',
    focusArea: 'Greenfield Debt & Working Capital'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    category: 'Private Sector',
    typicalSanction: '₹2 Cr – ₹150+ Cr',
    focusArea: 'Corporate Term Loans'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    category: 'Private Sector',
    typicalSanction: '₹2 Cr – ₹200+ Cr',
    focusArea: 'Project Finance & Capex'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    shortName: 'PNB',
    category: 'Public Sector',
    typicalSanction: '₹1 Cr – ₹100+ Cr',
    focusArea: 'MSME & Agro Units'
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    shortName: 'BOB',
    category: 'Public Sector',
    typicalSanction: '₹1 Cr – ₹150+ Cr',
    focusArea: 'Industrial Term Loans'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    category: 'Private Sector',
    typicalSanction: '₹2 Cr – ₹100+ Cr',
    focusArea: 'Structured Debt & Capex'
  },
  {
    id: 'sidbi',
    name: 'Small Industries Development Bank',
    shortName: 'SIDBI',
    category: 'Apex Financial',
    typicalSanction: '₹50 Lakhs – ₹25 Cr',
    focusArea: 'Direct Credit & Capital Subsidies'
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    shortName: 'Canara',
    category: 'Public Sector',
    typicalSanction: '₹1 Cr – ₹80+ Cr',
    focusArea: 'Greenfield Manufacturing'
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    shortName: 'Union Bank',
    category: 'Public Sector',
    typicalSanction: '₹1 Cr – ₹100+ Cr',
    focusArea: 'Commercial Credit Lines'
  },
  {
    id: 'exim',
    name: 'EXIM Bank of India',
    shortName: 'EXIM Bank',
    category: 'Apex Financial',
    typicalSanction: '₹5 Cr – ₹200+ Cr',
    focusArea: 'Export Oriented Units'
  },
  {
    id: 'tatacap',
    name: 'Tata Capital Financial Services',
    shortName: 'Tata Capital',
    category: 'Development NBFC',
    typicalSanction: '₹2 Cr – ₹75+ Cr',
    focusArea: 'Equipment & Infrastructure Finance'
  },
  {
    id: 'idbi',
    name: 'IDBI Bank',
    shortName: 'IDBI',
    category: 'Public Sector',
    typicalSanction: '₹2 Cr – ₹120+ Cr',
    focusArea: 'Large Greenfield Debt'
  }
];

export const BankLogosCarousel: React.FC = () => {
  // Duplicate array for seamless infinite marquee effect
  const marqueeBanks = [...BANK_PARTNERS, ...BANK_PARTNERS];

  return (
    <section className="py-12 bg-slate-900 text-white overflow-hidden relative border-y border-slate-800">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-0 w-32 sm:w-48 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 sm:w-48 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Institutional Debt Banking Network</span>
        </div>
        <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Sanction Support Across Top Lenders
        </h2>
        <p className="font-inter text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Our DPR financial models and CMA projections are benchmarked directly against credit appraisal norms of India's leading banks.
        </p>
      </div>

      {/* Marquee Carousel Container */}
      <div className="flex w-full overflow-hidden py-2 group">
        <motion.div
          className="flex gap-4 sm:gap-6 shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 35,
            ease: 'linear'
          }}
        >
          {marqueeBanks.map((bank, index) => (
            <div
              key={`${bank.id}-${index}`}
              className="w-64 sm:w-72 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-300 shrink-0 shadow-sm flex flex-col justify-between group/card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold font-manrope text-xs">
                    {bank.shortName.substring(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-manrope text-sm font-bold text-white group-hover/card:text-blue-300 transition-colors">
                      {bank.shortName}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
                      {bank.category}
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-700/60 font-inter">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Sanction Range:</span>
                  <span className="font-bold text-blue-300 text-[11px]">{bank.typicalSanction}</span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block shrink-0" />
                  <span>{bank.focusArea}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Summary Pill */}
      <div className="mt-8 text-center max-w-xl mx-auto px-4">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/90 rounded-full border border-slate-700/80 text-xs text-slate-300 font-medium">
          <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Strict Adherence to RBI Credit Assessment & DSCR Benchmark Norms</span>
        </div>
      </div>
    </section>
  );
};
