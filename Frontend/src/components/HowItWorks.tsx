import React from 'react';
import { motion } from 'motion/react';
import { TIMELINE_STEPS } from '../data/landingData';
import {
  Send,
  CheckCircle2,
  Calculator,
  ShieldAlert,
  UserCheck,
  FileText,
  Landmark,
  Award,
  ArrowRight
} from 'lucide-react';

interface HowItWorksProps {
  onOpenConsultation: () => void;
  onOpenAssessment: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onOpenConsultation,
  onOpenAssessment
}) => {
  const renderStepIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-gray-900" };
    switch (iconName) {
      case 'Send': return <Send {...props} />;
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      case 'Calculator': return <Calculator {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'UserCheck': return <UserCheck {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Landmark': return <Landmark {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <CheckCircle2 {...props} />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            End-to-End Execution Process
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="font-inter text-sm sm:text-base text-gray-600 leading-relaxed">
            A structured, bank-proven roadmap from initial project idea validation to loan disbursement.
          </p>
        </div>

        {/* Interactive Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {TIMELINE_STEPS.map((step, index) => (
            <motion.div
              key={step.stepNumber}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* Step badge & number */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {renderStepIcon(step.iconName)}
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Step 0{step.stepNumber}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-manrope text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="font-inter text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Deliverable Footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between font-inter text-xs">
                <span className="text-[11px] font-semibold text-gray-500">Deliverable:</span>
                <span className="font-bold text-blue-800 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                  {step.keyDeliverable}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Action Banner */}
        <div className="mt-16 bg-gray-900 text-white rounded-2xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-manrope text-xl sm:text-2xl font-bold text-white">
              Ready to Validate Your Project Bankability?
            </h3>
            <p className="font-inter text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Start with step 1 right now using our automated 3-minute bankability check tool or schedule a direct consultation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onOpenAssessment}
              className="px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Check Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenConsultation}
              className="px-6 py-3 text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Consultation</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
