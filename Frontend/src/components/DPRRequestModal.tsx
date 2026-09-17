import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { validateIndianMobileNumber } from '../utils/validation';
import {
  FileText,
  CheckCircle2,
  X,
  Building2,
  Check,
  Send,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Phone,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';

interface DPRRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  industry?: string;
  totalCostCr?: string | number;
  loanRequiredCr?: string | number;
  user?: AuthUser | null;
  onSubmitSuccess?: (message: string) => void;
}

export const DPRRequestModal: React.FC<DPRRequestModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Greenfield Industrial Unit',
  industry = 'Manufacturing',
  totalCostCr = '10.00',
  loanRequiredCr = '7.50',
  user,
  onSubmitSuccess
}) => {
  const [landAcquired, setLandAcquired] = useState<'yes' | 'in_progress' | 'no'>('yes');
  const [clearancesInProgress, setClearancesInProgress] = useState<'yes' | 'in_progress' | 'no'>('in_progress');
  const [promoterEquityReady, setPromoterEquityReady] = useState<'yes' | 'in_progress' | 'no'>('yes');
  const [machineryQuotesReady, setMachineryQuotesReady] = useState<'yes' | 'in_progress' | 'no'>('yes');
  const [targetBank, setTargetBank] = useState<string>('SBI / PSU Consortium');
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneValidation = validateIndianMobileNumber(phone);
    if (!phoneValidation.isValid) {
      alert(phoneValidation.error);
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      const successMsg = `DPR Assistance request for "${projectName}" submitted successfully! Our accredited DPR partner will connect with you within 24 hours.`;
      if (onSubmitSuccess) {
        onSubmitSuccess(successMsg);
      }

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Bank DPR Preparation Desk</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-manrope text-white">
            Request Detailed Project Report (DPR) Assistance
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
            Connect directly with Inisio's empaneled Chartered Engineers and accredited DPR partners for bank-compliant Techno-Economic Feasibility &amp; Project Reports.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          
          {submitted ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-manrope">DPR Request Submitted Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your DPR Readiness Checklist and project dossier have been routed to our Senior DPR Lead. You will receive an initial consultation call and document roadmap shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Project Snapshot Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Project Name</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">{projectName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Industry Sector</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{industry}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block font-medium">Est. Project Cost</span>
                  <span className="font-extrabold text-blue-700 block mt-0.5">₹ {totalCostCr} Cr (Loan: ₹ {loanRequiredCr} Cr)</span>
                </div>
              </div>

              {/* DPR Readiness Checklist Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 font-manrope uppercase tracking-wider">
                    DPR Readiness Checklist
                  </h3>
                </div>

                {/* Q1: Land Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    1. Is land acquired or possession finalized?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yes', label: 'Yes, Acquired' },
                      { value: 'in_progress', label: 'In Progress / MoU' },
                      { value: 'no', label: 'Not Yet' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLandAcquired(opt.value as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          landAcquired === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Clearances */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. Are statutory clearances (Pollution / Land Conversion) in progress?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yes', label: 'Yes, Received' },
                      { value: 'in_progress', label: 'In Progress / Applied' },
                      { value: 'no', label: 'Not Started' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setClearancesInProgress(opt.value as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          clearancesInProgress === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3: Promoter Equity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    3. Is promoter equity (Margin Money) ready or arranged?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yes', label: 'Yes, 100% Ready' },
                      { value: 'in_progress', label: 'Partial / In Arranging' },
                      { value: 'no', label: 'Seeking Equity Partner' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPromoterEquityReady(opt.value as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          promoterEquityReady === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4: Quotations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    4. Are plant &amp; machinery vendor quotations available?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'yes', label: 'Yes, Quotes Ready' },
                      { value: 'in_progress', label: 'Under Negotiation' },
                      { value: 'no', label: 'Need Vendor Leads' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMachineryQuotesReady(opt.value as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          machineryQuotesReady === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Bank */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Target Bank / Lending Institution:
                  </label>
                  <select
                    value={targetBank}
                    onChange={(e) => setTargetBank(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  >
                    <option value="SBI / PSU Consortium">State Bank of India (SBI) / PSU Bank Consortium</option>
                    <option value="SIDBI / MSME Development Bank">SIDBI (MSME / Cluster Scheme)</option>
                    <option value="HDFC / ICICI / Axis (Private Banks)">Private Sector Banks (HDFC, ICICI, Axis)</option>
                    <option value="Cooperative / Regional Rural Bank">State Financial Corp / Regional Bank</option>
                    <option value="Open to Recommendation">Open to Inisio Partner Recommendation</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Contact Coordinates for DPR Lead
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Promoter Full Name"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Routing to DPR Partner...' : 'Submit to DPR Partner'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer Trust Note */}
        <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0 px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Confidentiality • Empaneled DPR Specialists</span>
          </span>
          <span className="text-slate-400">Response SLA: &lt; 24 Business Hours</span>
        </div>

      </div>
    </div>
  );
};
