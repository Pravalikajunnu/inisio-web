import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Building2,
  TrendingUp,
  XCircle,
  Clock,
  Award
} from 'lucide-react';

interface HeroProps {
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const industryScrollRef = useRef<HTMLDivElement>(null);

  const industries = [
    {
      name: 'Manufacturing',
      desc: 'Machinery & Expansion Loans',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539430/icons8-manufacturing_jalqmq.gif'
    },
    {
      name: 'Healthcare & Hospitals',
      desc: 'Equipment & Facility Funding',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-hospital-48_tbn0zx.png'
    },
    {
      name: 'Education Institutions',
      desc: 'Infrastructure & Campus Loans',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539577/icons8-education-48_xhbfm7.png'
    },
    {
      name: 'Agriculture & Agri-Tech',
      desc: 'Farm & Processing Financing',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539430/icons8-agriculture-48_aphvi5.png'
    },
    {
      name: 'Construction & Real Estate',
      desc: 'Project & Heavy Machinery',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-construction-48_tcrgyv.png'
    },
    {
      name: 'Solar & Renewable Energy',
      desc: 'Green Power & Plant Financing',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-solar-panel-48_nt0br0.png'
    },
    {
      name: 'Logistics & Supply Chain',
      desc: 'Fleet & Warehouse Capital',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-logistics-100_fbsasn.png'
    },
    {
      name: 'Retail & Commerce',
      desc: 'Working Capital & Inventory',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-retail-48_juuvwt.png'
    }
  ];

  const slides = [
    {
      id: 'slide-1',
      badge: 'Easy & Fast Business Financing',
      headline: 'Need a Business Loan?',
      description: 'We help you get the right business loan.',
      primaryBtnText: 'Check Your Eligibility',
      secondaryBtnText: 'Talk to an Expert',
      trustPoints: ['Easy Process', 'Expert Support', 'Trusted Guidance'],
      image: 'https://res.cloudinary.com/aessymvl/image/upload/v1786547187/ChatGPT_Image_Aug_12_2026_08_34_57_PM_hb8xi9.png',
      imageAlt: 'Indian entrepreneur meeting a financial advisor for a business loan'
    },
    {
      id: 'slide-2',
      badge: 'Turn Your Idea Into Reality',
      headline: 'Start Your Business',
      description: "We'll help you prepare everything you need to apply for a business loan.",
      primaryBtnText: 'Start Your Project',
      secondaryBtnText: 'Free Consultation',
      trustPoints: ['Project Planning', 'Document Support', 'Loan Assistance'],
      image: 'https://res.cloudinary.com/aessymvl/image/upload/v1786536547/start_your_business_fx8g11.png',
      imageAlt: 'Young entrepreneur reviewing project plans with financial advisor'
    },
    {
      id: 'slide-3',
      badge: 'Scale & Modernize Operations',
      headline: 'Grow Your Business',
      description: 'Get the funding you need to take your business to the next level.',
      primaryBtnText: 'Get Funding',
      secondaryBtnText: 'Contact Us',
      trustPoints: ['Business Expansion', 'Machinery Funding', 'Expert Guidance'],
      image: 'https://res.cloudinary.com/aessymvl/image/upload/v1786543850/Business_ootwt8.png',
      imageAlt: 'Business owner walking through factory discussing growth with consultant'
    }
  ];

  // Auto-play slider every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, currentSlide]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      handleNext(); // swipe left -> next slide
    } else if (diff < -40) {
      handlePrev(); // swipe right -> prev slide
    }
    touchStartX.current = null;
  };

  const activeSlideData = slides[currentSlide];

  const slideVariants = {
    enter: {
      opacity: 0,
      y: 6,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -6,
    }
  };

  const simpleProcessSteps = [
    {
      icon: Calculator,
      title: '1. Check Eligibility',
      description: 'Quickly find out how much business loan you can get from top banks in just 2 minutes.'
    },
    {
      icon: FileCheck,
      title: '2. Prepare Paperwork',
      description: 'We prepare all required project reports, financial plans, and documents banks ask for.'
    },
    {
      icon: ShieldCheck,
      title: '3. Expert Guidance',
      description: 'Our financial advisors work with you to fix any issues and strengthen your application.'
    },
    {
      icon: Award,
      title: '4. Bank Approval',
      description: 'We submit your application directly to bank managers for quick loan sanction.'
    }
  ];

  return (
    <div id="home" className="bg-white text-slate-900 pt-16 sm:pt-18 pb-8 font-inter">
      
      {/* HERO SLIDER SECTION */}
      <section 
        className="relative overflow-hidden bg-white pt-0 pb-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Slide Card */}
          <div className="grid grid-cols-1 grid-rows-1 relative items-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeSlideData.id}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="col-start-1 row-start-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-center"
              >
                
                {/* LEFT CONTENT */}
                <div className="lg:col-span-6 space-y-5 text-left">
                  
                  {/* Category / Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{activeSlideData.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 leading-[1.18] tracking-tight">
                    {activeSlideData.headline}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-xl">
                    {activeSlideData.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={onOpenAssessment}
                      className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <Calculator className="w-4 h-4 text-blue-100" />
                      <span>{activeSlideData.primaryBtnText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={onOpenConsultation}
                      className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 min-h-[44px]"
                    >
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                      <span>{activeSlideData.secondaryBtnText}</span>
                    </button>
                  </div>

                  {/* 3 Trust Points */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-slate-600">
                    {activeSlideData.trustPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* RIGHT IMAGE */}
                <div className="lg:col-span-6 flex justify-start">
                  <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-50/80 shadow-xl border border-slate-200/80 p-2 sm:p-3 flex items-center justify-center">
                    <img
                      src={activeSlideData.image}
                      alt={activeSlideData.imageAlt}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      className="w-full h-[280px] sm:h-[360px] lg:h-[390px] object-contain rounded-xl sm:rounded-2xl"
                      onError={(e) => {
                        // Fallback to high quality unsplash image if network glitches
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    


                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side Bracket Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:left-1 lg:-left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 text-slate-500 hover:text-blue-600 transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 sm:right-1 lg:-right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 text-slate-500 hover:text-blue-600 transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
          </button>

        </div>
      </section>

      {/* INDUSTRIES / SECTORS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="mb-6 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Sectors & Industries
          </span>
          <h2 className="font-manrope text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
            Loans Customized for Every Industry
          </h2>
        </div>

        {/* Carousel Container with Continuous Motion */}
        <div className="relative overflow-hidden group/carousel py-2">
          {/* Edge Blur / Fade overlays for premium finish */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div
            ref={industryScrollRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-2 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Duplicated list to create infinite smooth continuous loop */}
            <div className="flex gap-6 sm:gap-8 animate-marquee shrink-0">
              {[...industries, ...industries, ...industries].map((ind, index) => (
                <div
                  key={index}
                  onClick={onOpenAssessment}
                  className="flex-none w-24 sm:w-28 flex flex-col items-center text-center cursor-pointer group"
                >
                  {/* Clean, compact rounded light blue icon container */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f0f5ff] hover:bg-[#e6f0ff] border border-blue-100/70 flex items-center justify-center p-3.5 shadow-2xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                    <img
                      src={ind.icon}
                      alt={ind.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title centered below box */}
                  <h3 className="mt-2.5 font-manrope text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight max-w-[110px]">
                    {ind.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* HOW INISIO HELPS YOU GET A LOAN (Simple Everyday English) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            How Inisio Helps You
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Getting a Bank Business Loan Made Simple
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We handle the hard work so you can get loan approval from top banks without hassle.
          </p>
        </div>

        {/* 4 Simple Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {simpleProcessSteps.map((step, index) => {
            const IconComp = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between text-left space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-manrope text-base font-bold text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* WHY CHOOSE INISIO (Simple Comparison - Light Theme) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Why Apply With Inisio
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Higher Approval. Zero Stress.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See why thousands of business owners trust Inisio for bank loans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Inisio */}
            <div className="bg-white/90 rounded-2xl p-6 border border-rose-200/80 shadow-xs space-y-3 text-left">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Applying On Your Own</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>High risk of bank loan rejection due to missing or wrongly formatted documents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Confusing bank questions, unexpected delays, and multiple branch visits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Missed government subsidies and lower interest rate schemes.</span>
                </li>
              </ul>
            </div>

            {/* With Inisio */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-500/80 shadow-xs space-y-3 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Applying With Inisio</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>95%+ approval success with bank-approved formatting and expert preparation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Dedicated loan advisor handles your application from start to finish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Maximized loan sanction amount with complete advice on bank schemes.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onOpenAssessment}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calculator className="w-4 h-4" />
              <span>Check Your Business Loan Eligibility Now</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};



