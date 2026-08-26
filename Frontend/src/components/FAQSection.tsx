import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data/landingData';
import {
  ChevronDown,
  HelpCircle,
  Search,
  MessageCircle,
  PhoneCall
} from 'lucide-react';

interface FAQSectionProps {
  onOpenConsultation: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenConsultation
}) => {
  const [openId, setOpenId] = useState<string>('faq_1');

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section id="faq" className="py-20 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Everything You Need to Know About <span className="text-blue-600">Greenfield Project Assessment &amp; Bankability</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Got questions about DPR preparation, bankability ratings, or term loan debt ratios? We have answers.
          </p>
        </div>

        {/* Accordion Items List */}
        <div className="space-y-3 font-inter">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`glass-card rounded-2xl transition-all overflow-hidden ${
                  isOpen ? 'border-blue-500 shadow-soft' : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-manrope font-bold text-sm sm:text-base text-gray-900 group cursor-pointer"
                >
                  <span className="group-hover:text-blue-700 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-blue-100 text-blue-700 rotate-180' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 pt-0 text-sm text-gray-700 font-medium leading-relaxed border-t border-gray-200/60 mt-1 font-inter">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-900 text-sm">Have a specific question about your project?</h4>
              <p className="text-xs text-gray-500">Speak directly with our senior greenfield advisory desk.</p>
            </div>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Speak to a Banking Advisor</span>
          </button>
        </div>

      </div>
    </section>
  );
};
