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
  Award,
  FileSearch,
  BarChart3,
  Layers,
  Users2
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
      desc: 'Machinery & Expansion Viability',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539430/icons8-manufacturing_jalqmq.gif'
    },
    {
      name: 'Healthcare & Hospitals',
      desc: 'Equipment & Facility Funding',
      icon: 'https://res.cloudinary.com/aessymvl/image/upload/v1786539429/icons8-hospital-48_tbn0zx.png'
    },
    {
      name: 'Education Institutions',
      desc: 'Infrastructure & Campus Assessment',
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
      badge: '100% Free Initial Assessment',
      headline: 'Planning a New Project?',
      description: 'Assess its feasibility, understand its bankability and prepare it for funding.',
      primaryBtnText: 'Start Free Assessment',
      secondaryBtnText: 'Talk to an Expert',
      trustPoints: ['100% Free First Assessment', 'Instant Bankability Rating', 'Bank-Grade Teaser PDF'],
      image: 'https://res.cloudinary.com/aessymvl/image/upload/v1786547187/ChatGPT_Image_Aug_12_2026_08_34_57_PM_hb8xi9.png',
      imageAlt: 'Indian entrepreneur meeting an advisor for project assessment'
    },
    {
      id: 'slide-2',
      badge: 'Greenfield Feasibility & Bankability',
      headline: 'Validate Your Greenfield Project',
      description: 'Evaluate financial viability, equity-debt structure, and lender readiness before approaching banks and institutional funds.',
      primaryBtnText: 'Start Free Assessment',
      secondaryBtnText: 'Free Consultation',
      trustPoints: ['Debt-to-Equity & DSCR Checks', 'Capex & Means of Finance', 'Bankability Scorecard'],
      image: 'https://res.cloudinary.com/aessymvl/image/upload/v1786536547/start_your_business_fx8g11.png',
      imageAlt: 'Young entrepreneur reviewing project plans with financial advisor'
    },
    {
      id: 'slide-3',
      badge: 'Institutional Funding Readiness',
      headline: 'Prepare for Institutional Funding',
      description: 'Get bank-grade feasibility scores, CMA models, and expert CA guidance for term debt syndication.',
      primaryBtnText: 'Start Free Assessment',
      secondaryBtnText: 'Contact Us',
      trustPoints: ['Credit Committee Ready', 'Detailed Risk Scorer', 'Dedicated CA Advisory'],
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
      icon: FileSearch,
      title: '1. Project Assessment',
      description: 'Answer simple questions about your project cost, location, and industry to get started.'
    },
    {
      icon: BarChart3,
      title: '2. Bankability Rating',
      description: 'Instantly calculate your project\'s feasibility score and debt service coverage capabilities.'
    },
    {
      icon: Layers,
      title: '3. Track Your Project',
      description: 'Use our interactive dashboard to manage documents and monitor project readiness.'
    },
    {
      icon: Users2,
      title: '4. Advisory Support',
      description: 'Get connected with dedicated Chartered Accountants and experts for DPR drafting and CMA modeling.'
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
        <div className="mb-3 text-center max-w-2xl mx-auto">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Sectors & Industries
          </span>
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


      {/* HOW INISIO HELPS WITH PROJECT ASSESSMENT (Simple Everyday English) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            How Inisio Helps You
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Greenfield Project Assessment Made Simple
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We handle the hard work so you can ensure your project is viable, bankable, and ready for institutional funding.
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


      {/* TANGIBLE OUTPUTS OF YOUR FREE ASSESSMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free First Project Assessment</span>
                </div>
                <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Tangible Outputs You Receive in Your Free Report
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-inter">
                  Evaluate your greenfield project with bank-grade precision before spending on expensive DPRs or approaching lenders.
                </p>
              </div>
              <button
                onClick={onOpenAssessment}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-manrope font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Start Free Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="font-manrope font-bold text-sm text-white">Bankability Rating (AAA to BBB)</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  Instant credit rating estimate assessing promoter margin, collateral coverage, and experience benchmarks.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="font-manrope font-bold text-sm text-white">Debt Capacity & DSCR Estimates</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  Underwriting debt-to-equity ratios and debt service coverage thresholds aligned with institutional lending norms.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="font-manrope font-bold text-sm text-white">Means of Finance & Capex Model</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  Detailed capital outlay distribution across plant & machinery, civil structures, and working capital buffers.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h3 className="font-manrope font-bold text-sm text-white">Bankable Executive Teaser (PDF)</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  Downloadable institutional teaser summary formatted for lender appraisal desks and credit committees.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                  05
                </div>
                <h3 className="font-manrope font-bold text-sm text-white">Dedicated CA Advisory Guidance</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-inter">
                  Direct consultation option with senior project finance CAs to refine financial models and address query gaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE INISIO (Simple Comparison - Light Theme) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Why Assess With Inisio
            </span>
            <h2 className="font-manrope text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Higher Approval. Zero Stress.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See why thousands of project promoters trust Inisio for greenfield project assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Inisio */}
            <div className="bg-white/90 rounded-2xl p-6 border border-rose-200/80 shadow-xs space-y-3 text-left">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Pursuing On Your Own</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>High risk of project rejection due to missing or wrongly formatted documents.</span>
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
            <div className="bg-white rounded-2xl p-6 border border-blue-500/80 shadow-xs space-y-3 text-left relative overflow-hidden">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Assessing With Inisio</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Approval success with bank-approved formatting and expert preparation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Dedicated assessment advisor handles your evaluation from start to finish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Comprehensive feasibility report with complete advice on institutional requirements.</span>
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
              <span>Start Free Assessment</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};



