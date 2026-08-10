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

  const slides = [
    {
      id: 'slide-1',
      badge: 'Easy & Fast Business Financing',
      headline: 'Need a Business Loan?',
      description: 'We help you get the right business loan.',
      primaryBtnText: 'Check Your Eligibility',
      secondaryBtnText: 'Talk to an Expert',
      trustPoints: ['Easy Process', 'Expert Support', 'Trusted Guidance'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
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
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
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
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
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
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
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
    <div id="home" className="bg-white text-slate-900 pt-20 sm:pt-24 pb-16 font-inter">
      
      {/* HERO SLIDER SECTION */}
      <section 
        className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white py-8 sm:py-12 lg:py-16"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Slide Card */}
          <div className="relative min-h-[480px] sm:min-h-[500px] flex items-center overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeSlideData.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                
                {/* LEFT CONTENT */}
                <div className="lg:col-span-6 space-y-5 text-left">
                  
                  {/* Category / Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{activeSlideData.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-manrope text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    {activeSlideData.headline}
                  </h1>

                  {/* Description */}
                  <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                    {activeSlideData.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={onOpenAssessment}
                      className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                    >
                      <Calculator className="w-4 h-4 text-blue-100" />
                      <span>{activeSlideData.primaryBtnText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={onOpenConsultation}
                      className="px-6 py-3.5 text-sm sm:text-base font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 min-h-[48px]"
                    >
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                      <span>{activeSlideData.secondaryBtnText}</span>
                    </button>
                  </div>

                  {/* 3 Trust Points */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-slate-700">
                    {activeSlideData.trustPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* RIGHT IMAGE */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-[560px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-100 p-2">
                    <img
                      src={activeSlideData.image}
                      alt={activeSlideData.imageAlt}
                      loading="eager"
                      className="w-full h-[280px] sm:h-[360px] lg:h-[380px] object-cover rounded-xl sm:rounded-2xl"
                      onError={(e) => {
                        // Fallback to high quality unsplash image if network glitches
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    
                    {/* Floating Trust Badge on Image */}
                    <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Direct Bank Financing</div>
                          <div className="text-[11px] text-slate-500 font-medium">95%+ Loan Approval Rate</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        Verified
                      </span>
                    </div>

                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* SLIDER CONTROLS: Arrow Buttons & Dots */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            
            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-xs font-bold text-slate-500 ml-2 font-mono">
                0{currentSlide + 1} / 0{slides.length}
              </span>
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* HOW INISIO HELPS YOU GET A LOAN (Simple Everyday English) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            How Inisio Helps You
          </span>
          <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Getting a Bank Business Loan Made Simple
          </h2>
          <p className="text-sm text-slate-600">
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


      {/* WHY CHOOSE INISIO (Simple Comparison) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              Why Apply With Inisio
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Higher Approval. Zero Stress.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              See why thousands of business owners trust Inisio for bank loans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Inisio */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-3 text-left">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Applying On Your Own</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>High risk of bank loan rejection due to missing or wrongly formatted documents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Confusing bank questions, unexpected delays, and multiple branch visits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Missed government subsidies and lower interest rate schemes.</span>
                </li>
              </ul>
            </div>

            {/* With Inisio */}
            <div className="bg-blue-950/80 rounded-2xl p-6 border border-blue-700/80 space-y-3 text-left">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Applying With Inisio</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>95%+ approval success with bank-approved formatting and expert preparation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Dedicated loan advisor handles your application from start to finish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Maximized loan sanction amount with complete advice on bank schemes.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onOpenAssessment}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
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



