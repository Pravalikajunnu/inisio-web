import React, { useState } from 'react';
import { ConsultationFormData } from '../types';
import { MAIN_SECTORS } from '../data/landingData';
import { saveLeadRecord } from '../utils/leadStore';
import {
  X,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    projectCostCr: '',
    additionalNotes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const targetWhatsAppNumber = '916302026462';

  const constructWhatsAppUrl = () => {
    const text = `Hello Inisio Advisory Team,\n\nI would like to book a Free Banking Consultation:\n` +
      `• Full Name: ${formData.fullName}\n` +
      `• Phone: ${formData.phone}\n` +
      (formData.email ? `• Email: ${formData.email}\n` : '') +
      (formData.companyName ? `• Company: ${formData.companyName}\n` : '') +
      `• Industry Sector: ${formData.industry}\n` +
      `• Project Budget: ${formData.projectCostCr}` +
      (formData.additionalNotes ? `\n• Notes: ${formData.additionalNotes}` : '');

    return `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    saveLeadRecord({
      fullName: formData.fullName || 'Consultation Lead',
      mobile: formData.phone || 'N/A',
      email: formData.email || 'N/A',
      projectName: formData.companyName ? `${formData.companyName} Greenfield` : `${formData.industry} Project`,
      industry: formData.industry || 'General Sector',
      location: 'India',
      totalCostCr: formData.projectCostCr || 'N/A',
      loanRequiredCr: 'N/A',
      source: 'Advisory Call Booked',
      downloadedPDF: false,
      notes: formData.additionalNotes
    });

    const whatsappUrl = constructWhatsAppUrl();
    window.open(whatsappUrl, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="glass-card rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/80 relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block font-inter">
                1-on-1 Ex-Banker Session
              </span>
              <h3 className="font-manrope font-extrabold text-xl text-gray-900">
                Book Free Banking Consultation
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold p-1.5 rounded-xl hover:bg-white/80 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3 font-inter">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Industry Sector *</label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="">Select Industry Sector</option>
                  {MAIN_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">Project Budget</label>
                <input
                  type="text"
                  value={formData.projectCostCr}
                  onChange={(e) => setFormData({ ...formData, projectCostCr: e.target.value })}
                  placeholder="Enter project budget in Crores"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 font-bold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Submit & Book Free Consultation</span>
            </button>

            <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Confidential. Bound by Mutual Non-Disclosure Agreement.</span>
            </p>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-emerald-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-2xl text-gray-900">Consultation Request Sent!</h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Thank you, <strong>{formData.fullName}</strong>. Your consultation request has been submitted successfully to our advisory team.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={constructWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Open WhatsApp Direct Chat</span>
              </a>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="px-6 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl block mx-auto mt-2"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

