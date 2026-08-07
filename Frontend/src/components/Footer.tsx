import React from 'react';
import {
  TrendingUp,
  MapPin,
  ShieldCheck,
  Award,
  PhoneCall
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
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-manrope text-2xl font-bold text-white tracking-tight">
                  Inisio
                </span>
                <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase -mt-0.5 font-inter">
                  Greenfield Advisory Platform
                </span>
              </div>
            </button>

            <p className="text-[15px] font-normal text-slate-400 font-inter leading-[1.6] max-w-sm">
              Inisio is India's premier expert-led greenfield project advisory platform. We turn industrial concepts into bank-sanctioned businesses through rigorous feasibility studies, 100% compliant DPRs, and institutional debt syndication.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-blue-400 font-semibold">
              <Award className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Certified Member: All-India Project Finance Association</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-[15px] font-normal text-slate-400 font-inter">
              <li><button onClick={() => handleNav('home')} className="hover:text-blue-400 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-blue-400 transition-colors cursor-pointer">Services</button></li>
              <li><button onClick={() => handleNav('industries')} className="hover:text-blue-400 transition-colors cursor-pointer">Industries</button></li>
              <li><button onClick={() => handleNav('assessment')} className="hover:text-blue-400 transition-colors cursor-pointer">Project Assessment</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-blue-400 transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-blue-400 transition-colors cursor-pointer">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 3: Services & Solutions */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Advisory Stack
            </h4>
            <ul className="space-y-2.5 text-[15px] font-normal text-slate-400 font-inter">
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Reality Check Advisory</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Project Feasibility (TEFR)</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Bankability Scorecard</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Bank-Grade DPR Generation</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Debt Syndication Consultancy</button></li>
              <li><button onClick={onOpenConsultation} className="hover:text-blue-400 transition-colors text-left cursor-pointer">Government Subsidy Alignment</button></li>
            </ul>
          </div>

          {/* Column 4: Contact & Locations */}
          <div className="space-y-3 text-left">
            <h4 className="font-manrope font-semibold text-white text-lg tracking-tight">
              Headquarters & Contact
            </h4>
            <div className="space-y-3 text-[15px] font-normal text-slate-400 font-inter">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-[1.6]">2nd Floor, Plot 24 & 25, Kakatiya Hills, Road No 9, Madhapur, Hyderabad, Telangana 500033</span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="tel:+916302026462"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-sm">+91 63020 26462</span>
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href="https://wa.me/916302026462?text=Hello%20Inisio%20Advisory%20Team%2C%20I%20would%20like%20to%20inquire%20about%20greenfield%20project%20advisory."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.522 5.836L.055 23.513l5.833-1.528A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.932 9.932 0 01-5.067-1.39l-.364-.216-3.762.986.1-3.666-.238-.378A9.948 9.948 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  <span className="font-semibold text-sm">WhatsApp +91 63020 26462</span>
                </a>
              </div>

              <div className="flex items-center gap-2 pt-1 text-blue-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Enterprise Greenfield Advisory Desk</span>
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
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
