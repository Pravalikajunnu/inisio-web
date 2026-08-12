import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../data/landingData';
import {
  Star,
  Building2,
  MapPin,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Quote
} from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const industries = ['All', 'Manufacturing', 'Healthcare', 'Food Processing', 'Solar & Renewable'];

  const filteredTestimonials = selectedIndustry === 'All'
    ? TESTIMONIALS
    : TESTIMONIALS.filter(t => t.industry === selectedIndustry);

  // Reset current index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedIndustry]);

  // Autoplay interval
  useEffect(() => {
    if (!isAutoplay || filteredTestimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, filteredTestimonials.length]);

  const handlePrev = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => (prev === 0 ? filteredTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const currentItem = filteredTestimonials[currentIndex] || TESTIMONIALS[0];

  return (
    <section id="testimonials" className="pt-12 sm:pt-16 pb-8 sm:pb-10 bg-slate-50/50 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimalist Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/80">
            Client Success
          </span>
          <h2 className="font-manrope text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] tracking-tight">
            Bank-Sanctioned Greenfield Case Studies
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#4B5563]">
            Verified founder feedback on debt syndication, DPR preparation, and loan approval timelines.
          </p>

          {/* Industry Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  selectedIndustry === ind
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Interactive Carousel */}
        <div className="max-w-4xl mx-auto relative px-2 sm:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentItem.id}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-blue-100/80 p-6 sm:p-10 shadow-sm relative space-y-6"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-blue-100/60 pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(currentItem.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1">5.0</span>
                </div>

                {/* Funding Badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  {currentItem.fundingAmount} Debt Secured
                </span>
              </div>

              {/* Minimalist Quote */}
              <p className="font-inter text-base sm:text-lg text-gray-800 font-medium leading-relaxed italic">
                "{currentItem.quote}"
              </p>

              {/* Promoter Author Info */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4 font-inter">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentItem.avatar}
                    alt={currentItem.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                  />
                  <div>
                    <h4 className="font-manrope font-bold text-sm text-gray-900">
                      {currentItem.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {currentItem.title}, <span className="font-semibold text-gray-700">{currentItem.company}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-gray-500 flex items-center gap-1 font-medium bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/60">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentItem.location}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200/90 shadow-md text-gray-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all cursor-pointer z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200/90 shadow-md text-gray-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all cursor-pointer z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {filteredTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoplay(false);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Minimal Turnaround Badge */}
        <div className="mt-6 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-blue-900 font-semibold">
            <Award className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Average Credit Approval Turnaround Time: 28 Days</span>
          </div>
        </div>

      </div>
    </section>
  );
};
