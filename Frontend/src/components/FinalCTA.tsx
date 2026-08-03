import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, PhoneCall, CheckCircle2, Calculator } from 'lucide-react';

interface FinalCTAProps {
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  return (
    <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Card */}
        <div className="relative glass-card-dark text-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-emerald-500/30 shadow-soft-lg overflow-hidden text-center max-w-4xl mx-auto">
          
          {/* Background Decorative Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Cost Initial Feasibility Review</span>
            </div>

            <h2 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Validate Your <span className="text-emerald-400">Greenfield Project</span>?
            </h2>

            <p className="font-inter text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              Join 2,500+ Indian & global promoters who used Inisio to calculate bankability scores, eliminate credit committee rejections, and secure debt funding.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-inter">
              <button
                onClick={onOpenConsultation}
                className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-glow transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-slate-950" />
                <span>Book 1-on-1 Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Trust Bulletins */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Confidential NDA
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant Feasibility Check Report
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
