import React from 'react';
import {
  TrendingUp,
  MapPin,
  ShieldCheck,
  Award
} from 'lucide-react';

interface FooterProps {
  onSelectTab?: (tab: string) => void;
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenAssessment,
  onOpenConsultation,
  onOpenAdmin
}) => {
  const handleNav = (tab: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 text-left cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-manrope text-2xl font-bold text-white tracking-tight">
                  Inisio
                </span>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase -mt-0.5 font-inter">
                  Greenfield Advisory Platform
                </span>
              </div>
            </button>

            <p className="text-[15px] font-normal text-slate-400 font-inter leading-[1.6] max-w-sm">
              Inisio is India's premier expert-led greenfield project advisory platform. We turn industrial concepts into bank-sanctioned businesses through rigorous feasibility studies, 100% compliant DPRs, and institutional debt syndication.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-emerald-400 font-semibold">
              <Award className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Certified Member: All-India Project Finance Association</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-[15px] font-normal text-slate-400 font-inter">
              <li><button onClick={() => handleNav('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-emerald-400 transition-colors cursor-pointer">Services</button></li>
              <li><button onClick={() => handleNav('industries')} className="hover:text-emerald-400 transition-colors cursor-pointer">Industries</button></li>
              <li><button onClick={() => handleNav('assessment')} className="hover:text-emerald-400 transition-colors cursor-pointer">Project Assessment</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 3: Services & Solutions */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Advisory Stack
            </h4>
            <ul className="space-y-2.5 text-[15px] font-normal text-slate-400 font-inter">
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Reality Check Advisory</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Project Feasibility (TEFR)</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Bankability Scorecard</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Bank-Grade DPR Generation</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Debt Syndication Consultancy</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Government Subsidy Alignment</button></li>
            </ul>
          </div>

          {/* Column 4: Contact & Locations */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Headquarters
            </h4>
            <div className="space-y-3 text-[15px] font-normal text-slate-400 font-inter">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-[1.6]">Inisio Capital Towers, Financial District, Nanakramguda, Hyderabad, Telangana 500032</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Enterprise Greenfield Advisory</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-inter">
          <p 
            onClick={onOpenAdmin}
            className="cursor-default select-none"
            title="Inisio Greenfield Advisory"
          >
            © {new Date().getFullYear()} Inisio Greenfield Advisory Platform. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
