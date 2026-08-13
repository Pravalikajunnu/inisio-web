import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import {
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  PhoneCall,
  Calculator,
  User,
  ShieldCheck,
  Briefcase,
  LogOut,
  LogIn,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAssessment: (defaultIndustry?: string) => void;
  onOpenConsultation: () => void;
  selectedIndustryName?: string;
  onSelectIndustry?: (industryName: string) => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAssessment,
  onOpenConsultation,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'services', name: 'Services' },
    { id: 'industries', name: 'Industries' },
    { id: 'blogs', name: 'Blogs' },
    { id: 'contact', name: 'Contact' }
  ];

  const handleNavClick = (id: string) => {
    if (id === 'blogs') {
      onSelectTab('home');
      setMobileMenuOpen(false);
      setUserDropdownOpen(false);
      setTimeout(() => {
        const blogsElem = document.getElementById('blogs');
        if (blogsElem) {
          blogsElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    onSelectTab(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardTabForRole = (role: string) => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'ca') return 'ca-dashboard';
    return 'user-dashboard';
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return {
        label: 'Admin Desk',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
      };
    }
    if (role === 'ca') {
      return {
        label: 'CA Portal',
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: <Briefcase className="w-3.5 h-3.5 text-purple-700" />
      };
    }
    return {
      label: 'User Portal',
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <User className="w-3.5 h-3.5 text-blue-700" />
    };
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Header */}
      <header
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200/80 py-2.5 sm:py-3'
            : 'bg-white/90 backdrop-blur-md border-b border-gray-200/60 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-manrope text-lg sm:text-xl font-bold tracking-tight text-[#111827] flex items-center gap-1 leading-tight">
                  Inisio
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-blue-700 tracking-wider uppercase -mt-0.5 font-inter whitespace-nowrap">
                  Greenfield Project Advisory
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 font-inter font-medium text-xs sm:text-sm">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3.5 py-2 rounded-xl transition-all font-medium cursor-pointer whitespace-nowrap min-h-[40px] ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}

              {/* Active Dashboard Link if Logged In */}
              {currentUser && (
                <button
                  onClick={() => handleNavClick(getDashboardTabForRole(currentUser.role))}
                  className={`px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap min-h-[40px] flex items-center gap-1.5 ${
                    activeTab.includes('dashboard')
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {getRoleBadge(currentUser.role).icon}
                  <span>Dashboard</span>
                </button>
              )}
            </nav>

              {/* Desktop Actions (Login Icon + Start Assessment) */}
              <div className="hidden lg:flex items-center gap-2.5">
                
                {/* User Account Dropdown */}
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {currentUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {currentUser.email}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2.5 border-b border-slate-100 mb-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 truncate">{currentUser.email}</p>
                        </div>

                        <button
                          onClick={() => handleNavClick(getDashboardTabForRole(currentUser.role))}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>My Dashboard</span>
                        </button>

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onLogout();
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-200 min-h-[40px]"
                    title="Sign In"
                  >
                    <LogIn className="w-4 h-4 text-blue-600" />
                    <span>Sign In</span>
                  </button>
                )}

              <button
                onClick={() => handleNavClick('assessment')}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2 group cursor-pointer min-h-[40px]"
              >
                <Calculator className="w-4 h-4 text-blue-100" />
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle & Assess / Login Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onOpenAuth}
                className="p-2 text-slate-700 bg-slate-100 rounded-xl flex items-center justify-center min-w-[40px] min-h-[40px]"
                title="Login"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleNavClick('assessment')}
                className="px-3 py-2 text-xs font-bold text-white bg-blue-600 active:bg-blue-700 rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 min-h-[40px] touch-manipulation"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-100" />
                <span>Assess</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-800" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Backdrop & Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 top-[60px] bg-slate-900/40 backdrop-blur-xs z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Container */}
            <div className="relative z-50 bg-white border-b border-gray-200 px-4 pt-3 pb-6 shadow-2xl max-h-[calc(100vh-65px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200 font-inter">
              
              {/* Mobile Auth Status Banner */}
              <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                {currentUser ? (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                      <div className="text-[10px] font-mono text-blue-600 font-semibold">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-slate-600">Access Portal Accounts:</span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login Portal</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 mb-4 font-inter font-medium">
                {navLinks.map((link) => {
                  const isActive = activeTab === link.id;

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`px-4 py-3.5 text-base text-left rounded-xl transition-all font-semibold cursor-pointer min-h-[48px] flex items-center justify-between touch-manipulation ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-[#111827] hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}

                {currentUser && (
                  <button
                    onClick={() => handleNavClick(getDashboardTabForRole(currentUser.role))}
                    className="px-4 py-3.5 text-base text-left rounded-xl transition-all font-bold cursor-pointer min-h-[48px] bg-slate-900 text-white flex items-center justify-between"
                  >
                    <span>Open {getRoleBadge(currentUser.role).label}</span>
                    {getRoleBadge(currentUser.role).icon}
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                <button
                  onClick={() => handleNavClick('assessment')}
                  className="w-full py-3.5 px-4 text-center text-base font-semibold text-white bg-blue-600 active:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                >
                  <Calculator className="w-5 h-5 text-blue-100" />
                  <span>Start Assessment</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenConsultation();
                  }}
                  className="w-full py-3.5 px-4 text-center text-base font-semibold text-[#111827] border border-gray-300 rounded-xl active:bg-gray-100 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                >
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

