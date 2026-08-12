import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustNumbers } from './components/TrustNumbers';
import { BankLogosCarousel } from './components/BankLogosCarousel';
import { Testimonials } from './components/Testimonials';
import { IndustriesSection } from './components/IndustriesSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { ProjectAssessmentPage } from './components/ProjectAssessmentPage';
import { WhyChooseInisio } from './components/WhyChooseInisio';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminLeadsModal } from './components/AdminLeadsModal';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { CADashboard } from './components/CADashboard';
import { AdminDashboardView } from './components/AdminDashboardView';
import { LatestBlogs } from './components/LatestBlogs';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('inisio_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [selectedIndustryForAssessment, setSelectedIndustryForAssessment] = useState<string>('');

  useEffect(() => {
    // Check if URL has #admin or ?admin
    const checkAdminHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
        setAdminModalOpen(true);
      }
    };
    checkAdminHash();

    window.addEventListener('hashchange', checkAdminHash);

    // Keyboard shortcut Ctrl+Shift+A or Cmd+Shift+A to open Admin Desk secretly
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('inisio_active_user', JSON.stringify(user));

    // Redirect to corresponding dashboard based on exact email/role request
    if (user.role === 'admin' || user.email === 'admin@gmail.com') {
      setActiveTab('admin-dashboard');
    } else if (user.role === 'ca' || user.email === 'ca@gmail.com') {
      setActiveTab('ca-dashboard');
    } else {
      setActiveTab('user-dashboard');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('inisio_active_user');
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAssessment = (industryName?: string) => {
    setSelectedIndustryForAssessment(industryName || '');
    setActiveTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIndustryFromNav = (industryName: string) => {
    setSelectedIndustryForAssessment(industryName);
    setActiveTab('industries');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-800 flex flex-col justify-between">
      
      <div>
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenAssessment={() => handleOpenAssessment()}
          onOpenConsultation={() => setConsultationModalOpen(true)}
          selectedIndustryName={selectedIndustryForAssessment}
          onSelectIndustry={handleSelectIndustryFromNav}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* View Switcher */}
        <main className="transition-all duration-300 pt-16 sm:pt-20">
          {activeTab === 'home' && (
            <div className="animate-in fade-in duration-300 pt-0 font-sans">
              <Hero
                onOpenAssessment={() => handleOpenAssessment()}
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
              <BankLogosCarousel />
              <TrustNumbers />
              <Testimonials />
              <LatestBlogs
                onOpenAssessment={() => handleOpenAssessment()}
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'user-dashboard' && currentUser && (
            <div className="animate-in fade-in duration-300">
              <UserDashboard
                user={currentUser}
                onOpenAssessment={() => handleOpenAssessment()}
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'ca-dashboard' && currentUser && (
            <div className="animate-in fade-in duration-300">
              <CADashboard user={currentUser} />
            </div>
          )}

          {activeTab === 'admin-dashboard' && currentUser && (
            <div className="animate-in fade-in duration-300">
              <AdminDashboardView user={currentUser} />
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="animate-in fade-in duration-300">
              <ProjectAssessmentPage
                onOpenConsultation={() => setConsultationModalOpen(true)}
                defaultIndustry={selectedIndustryForAssessment}
              />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="animate-in fade-in duration-300">
              <WhyChooseInisio
                onOpenAssessment={() => handleOpenAssessment()}
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'services' && (
            <div className="animate-in fade-in duration-300">
              <ServicesSection
                onSelectServiceForAssessment={(serviceName) => handleOpenAssessment(serviceName)}
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'industries' && (
            <div className="animate-in fade-in duration-300">
              <IndustriesSection
                onSelectIndustryForAssessment={(indName) => handleOpenAssessment(indName)}
                onOpenAssessment={() => handleOpenAssessment()}
                onOpenConsultation={() => setConsultationModalOpen(true)}
                selectedIndustryName={selectedIndustryForAssessment}
              />
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="animate-in fade-in duration-300">
              <ContactSection />
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="animate-in fade-in duration-300">
              <FAQSection
                onOpenConsultation={() => setConsultationModalOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      <div>
        {/* Footer */}
        <Footer
          onSelectTab={handleSelectTab}
          onOpenAssessment={() => handleOpenAssessment()}
          onOpenConsultation={() => setConsultationModalOpen(true)}
          onOpenAdmin={() => {
            if (currentUser?.role === 'admin') {
              setActiveTab('admin-dashboard');
            } else {
              setAdminModalOpen(true);
            }
          }}
        />
      </div>

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
      />

      <AdminLeadsModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Floating Call & WhatsApp Buttons */}
      <FloatingContactButtons />

    </div>
  );
}
