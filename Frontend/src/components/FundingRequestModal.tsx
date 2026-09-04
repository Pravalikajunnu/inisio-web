import React, { useState } from 'react';
import { AuthUser } from '../types';
import {
  Coins,
  CheckCircle2,
  X,
  Building2,
  Send,
  Sparkles,
  Calendar,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';

interface FundingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  industry?: string;
  totalCostCr?: string | number;
  loanRequiredCr?: string | number;
  user?: AuthUser | null;
  onSubmitSuccess?: (message: string) => void;
}

export const FundingRequestModal: React.FC<FundingRequestModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Greenfield Industrial Unit',
  industry = 'Manufacturing',
  totalCostCr = '10.00',
  loanRequiredCr = '7.50',
  user,
  onSubmitSuccess
}) => {
  const [desiredLoanAmount, setDesiredLoanAmount] = useState<string>(String(loanRequiredCr || '7.50'));
  const [timeline, setTimeline] = useState<string>('1_to_3_months');
  const [facilityType, setFacilityType] = useState<string>('Term Loan (Greenfield Capex)');
  const [collateralAvailable, setCollateralAvailable] = useState<string>('Primary Project Assets + Partial Collateral (30-50%)');
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      const successMsg = `Funding Assistance request of ₹${desiredLoanAmount} Cr for "${projectName}" submitted successfully! Our Debt Syndication Desk will connect with you within 24 hours.`;
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
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Debt Syndication &amp; Project Finance</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-manrope text-white">
            Request Project Debt Funding Assistance
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
            Connect with Inisio's institutional debt syndication network comprising Top PSU Banks, Private Lenders, and NBFC Consortiums.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          
          {submitted ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-manrope">Funding Request Submitted Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your debt requirement of ₹{desiredLoanAmount} Cr has been forwarded to our Syndication Credit Leads. An introductory appraisal call will be scheduled promptly.
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
                  <span className="text-slate-400 block font-medium">Total Project Capex</span>
                  <span className="font-extrabold text-emerald-700 block mt-0.5">₹ {totalCostCr} Cr</span>
                </div>
              </div>

              {/* Funding Requirement Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 font-manrope uppercase tracking-wider">
                    Financing Parameters
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desired Loan Amount */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Desired Debt / Loan Amount (₹ Crores)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={desiredLoanAmount}
                        onChange={(e) => setDesiredLoanAmount(e.target.value)}
                        placeholder="e.g. 7.50"
                        className="w-full pl-7 pr-12 text-sm font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Cr</span>
                    </div>
                  </div>

                  {/* Funding Facility Type */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Primary Credit Facility Needed
                    </label>
                    <select
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    >
                      <option value="Term Loan (Greenfield Capex)">Term Loan (Greenfield Plant &amp; Machinery)</option>
                      <option value="Term Loan + Working Capital Combo">Term Loan + Working Capital Limit (CC/OD)</option>
                      <option value="Equipment / Machine Lease Financing">Equipment / Imported Machinery Financing</option>
                      <option value="Mezzanine / Structured Debt">Mezzanine / Subordinated Debt</option>
                      <option value="Subsidy / Government Capital Grant">State Capital Subsidy Bridge Loan</option>
                    </select>
                  </div>
                </div>

                {/* Disbursement Timeline */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Target Disbursement Timeline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'immediate', label: 'Immediate (< 30 days)', sub: 'Urgent sanction' },
                      { id: '1_to_3_months', label: '1 - 3 Months', sub: 'Standard cycle' },
                      { id: '3_to_6_months', label: '3 - 6 Months', sub: 'Project start' },
                      { id: 'planning', label: '6+ Months', sub: 'Early planning' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTimeline(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          timeline === t.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight">{t.label}</p>
                        <p className={`text-[10px] mt-0.5 ${timeline === t.id ? 'text-emerald-100' : 'text-slate-400'}`}>{t.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collateral Security */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Anticipated Collateral / Security Structure
                  </label>
                  <select
                    value={collateralAvailable}
                    onChange={(e) => setCollateralAvailable(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                  >
                    <option value="Primary Project Assets + Partial Collateral (30-50%)">Primary Project Assets + Partial Collateral Property (30-50%)</option>
                    <option value="100%+ Prime Collateral Security Available">100%+ High Value Immovable Collateral Available</option>
                    <option value="Project Assets Only + CGTMSE / Credit Guarantee">Primary Project Assets + CGTMSE / Gov Guarantee Scheme</option>
                    <option value="Seeking Structured / Clean Debt Solution">Seeking Customized Syndication Structure</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Promoter Contact Details
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
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Funding Request...' : 'Submit Funding Request'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer Trust Note */}
        <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0 px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Consortium Banking &amp; Syndication Network</span>
          </span>
          <span className="text-slate-400">Institutional Turnaround: 24-48 Hours</span>
        </div>

      </div>
    </div>
  );
};
