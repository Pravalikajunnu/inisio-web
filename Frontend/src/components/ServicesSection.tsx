import React from 'react';
import { motion } from 'motion/react';
import { SERVICES } from '../data/landingData';
import {
  SearchCheck,
  ShieldCheck,
  FileText,
  Calculator,
  FileCheck,
  Landmark,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Sparkles
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectServiceForAssessment: (serviceName: string) => void;
  onOpenConsultation: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceForAssessment,
  onOpenConsultation
}) => {
  const renderIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 transition-colors duration-300";
    switch (iconName) {
      case 'SearchCheck': return <SearchCheck className={iconClass} />;
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
      case 'FileText': return <FileText className={iconClass} />;
      case 'Calculator': return <Calculator className={iconClass} />;
      case 'FileCheck': return <FileCheck className={iconClass} />;
      case 'Landmark': return <Landmark className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-12 sm:space-y-16">
        
        {/* Section Header (Centered) */}
        <div className="text-center max-w-[640px] mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Greenfield & Corporate Advisory</span>
          </div>
          <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            Our 5 Core Services
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Holistic, bankable financial advisory tailored to meet promoters’ growth and capital objectives.
          </p>
        </div>

      {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between p-5 text-left h-full"
            >
              <div className="space-y-3">
                {/* Top Bar: Icon & Category Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300 shadow-2xs">
                    {renderIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 font-inter">
                    {service.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-manrope text-base font-bold text-[#111827] group-hover:text-emerald-700 transition-colors tracking-tight leading-snug">
                    {service.name}
                  </h3>
                  <p className="font-inter text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-inter block">
                    Core Deliverables
                  </span>
                  <ul className="space-y-1 font-inter text-xs text-[#374151]">
                    {service.deliverables.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-normal text-[11px] leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-md border border-emerald-700/50 text-center">
          <div className="max-w-[620px] mx-auto space-y-3">
            <h3 className="font-manrope text-xl sm:text-2xl font-bold text-white leading-tight">
              Need End-to-End Banking & Debt Syndication Support?
            </h3>
            <p className="font-inter text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Connect directly with our ex-banker advisory team to evaluate project viability, DPR structure, and bank sanction parameters.
            </p>
            <div className="pt-1 flex justify-center">
              <button
                onClick={onOpenConsultation}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer"
              >
                <span>Book Banking Consultation</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
