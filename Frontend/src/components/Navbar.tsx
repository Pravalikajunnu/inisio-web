import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  PhoneCall,
  Calculator
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAssessment: (defaultIndustry?: string) => void;
  onOpenConsultation: () => void;
  selectedIndustryName?: string;
  onSelectIndustry?: (industryName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAssessment,
  onOpenConsultation
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Ensure document attribute is set to blue (Royal Sapphire)
    document.documentElement.setAttribute('data-theme', 'blue');

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'services', name: 'Services' },
    { id: 'industries', name: 'Industries' },
    { id: 'contact', name: 'Contact' }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Header */}
      <header
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/80 py-3'
            : 'bg-white/90 backdrop-blur-md border-b border-gray-200/60 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-manrope text-2xl font-bold tracking-tight text-[#111827] flex items-center gap-1">
                  Inisio
                </span>
                <span className="text-[10px] font-semibold text-blue-700 tracking-wider uppercase -mt-1 font-inter">
                  Greenfield Project Advisory
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2 font-inter font-medium text-base">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-4 py-2 rounded-xl transition-all font-medium cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('assessment')}
                className="px-4.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-blue-100" />
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => handleNavClick('assessment')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl shadow-xs cursor-pointer"
              >
                Assess
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 pt-3 pb-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col gap-1 mb-4 font-inter font-medium">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-4 py-3 text-base text-left rounded-xl transition-all font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-[#111827] hover:bg-blue-50'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <button
                onClick={() => handleNavClick('assessment')}
                className="w-full py-3.5 px-4 text-center text-base font-semibold text-white bg-blue-600 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-blue-100" />
                <span>Start Assessment</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full py-3 px-4 text-center text-base font-semibold text-[#111827] border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 text-blue-600" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
