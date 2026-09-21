import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  PhoneCall,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface GetHelpFromCaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  assignedCaName?: string;
  promoterName?: string;
  promoterPhone?: string;
  promoterEmail?: string;
  onSubmitQuery?: (query: {
    topic: string;
    message: string;
    contactNumber: string;
    preferredTime: string;
  }) => void;
}

export const GetHelpFromCaModal: React.FC<GetHelpFromCaModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Greenfield Project',
  assignedCaName = 'CA Rajesh Sharma (FCA #847201)',
  promoterName = 'Promoter',
  promoterPhone = '',
  promoterEmail = '',
  onSubmitQuery
}) => {
  const [topic, setTopic] = useState('DPR Financial Modeling & CMA Audit');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(promoterPhone);
  const [preferredTime, setPreferredTime] = useState('Immediate / Next 2 Hours');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const topics = [
    'DPR Financial Modeling & CMA Audit',
    'DSCR Calculation & Balance Sheet Verification',
    'Subsidy Eligibility & Government Scheme Filing',
    'Bank Credit Committee Query Resolution',
    'Collateral & Land Valuation Clarification',
    'Other CA Advisory Requirement'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (onSubmitQuery) {
      onSubmitQuery({
        topic,
        message,
        contactNumber: phone,
        preferredTime
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 800);
  };

  const handleWhatsApp = () => {
    const text = `Hello ${assignedCaName}, I need CA advisory assistance for my project "${projectName}".\nTopic: ${topic}\nPromoter: ${promoterName}\nPhone: ${phone}\nQuery: ${message || 'Please connect with me.'}`;
    window.open(`https://wa.me/916302026462?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 font-inter">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Direct CA Desk
            </span>
            <span className="text-xs text-blue-200 font-semibold truncate">{assignedCaName}</span>
          </div>

          <h3 className="text-xl font-bold text-white">Get Help from Inisio CA</h3>
          <p className="text-xs text-slate-300 mt-1">
            Submit your financial modeling queries directly to your designated Chartered Accountant.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Query Dispatched to {assignedCaName}</h4>
              <p className="text-xs text-slate-600">
                Your assigned CA has been notified and will review your project file and respond shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Advisory Topic *
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                >
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Describe Your Query or Document Requirement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Please clarify DSCR benchmark calculation for SBI Consortium or assist with CMA projection..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-normal text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Direct Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Preferred Response Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  >
                    <option value="Immediate / Next 2 Hours">Immediate / Next 2 Hours</option>
                    <option value="Today Afternoon">Today Afternoon</option>
                    <option value="Tomorrow Morning">Tomorrow Morning</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Routing to CA...' : 'Submit Support Ticket'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Assigned CA</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
