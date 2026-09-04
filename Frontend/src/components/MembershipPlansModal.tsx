import React, { useState } from 'react';
import { AuthUser } from '../types';
import { getUserMembership, setUserMembership, MembershipPlan } from '../utils/membershipStore';
import {
  Sparkles,
  Check,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  ArrowRight,
  Zap,
  Star,
  FileSpreadsheet,
  FileText,
  PhoneCall,
  Lock,
  Coins,
  Briefcase,
  Layers,
  Award
} from 'lucide-react';

interface MembershipPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onOpenConsultation?: () => void;
  onPlanUpgraded?: (newPlan: MembershipPlan) => void;
  initialReason?: string;
}

export const MembershipPlansModal: React.FC<MembershipPlansModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onOpenConsultation,
  onPlanUpgraded,
  initialReason
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('quarterly');
  const [upgradingPlan, setUpgradingPlan] = useState<MembershipPlan | null>(null);
  const [successPlan, setSuccessPlan] = useState<MembershipPlan | null>(null);

  if (!isOpen) return null;

  const currentMembership = getUserMembership(currentUser?.email);

  const handleSelectPlan = (plan: MembershipPlan) => {
    if (plan === 'free') {
      onClose();
      return;
    }

    setUpgradingPlan(plan);

    setTimeout(() => {
      setUserMembership(plan, currentUser?.email);
      setUpgradingPlan(null);
      setSuccessPlan(plan);

      if (onPlanUpgraded) {
        onPlanUpgraded(plan);
      }

      setTimeout(() => {
        setSuccessPlan(null);
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F9F9FB] overflow-y-auto flex flex-col min-h-screen animate-in fade-in duration-200">
      
      {/* Top Bar with Minimalist Close Button */}
      <div className="sticky top-0 z-20 w-full bg-[#F9F9FB]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200/60 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
            i
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">Inisio Membership</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/70 rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        
        {/* Upgrade your plan Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-manrope text-zinc-900 tracking-tight">
            Upgrade your plan
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
            Scale your greenfield industrial pipeline with unlimited bankability audits, institutional CMA models, and dedicated CA review.
          </p>

          {/* Context Alert if user hit limit */}
          {initialReason && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs sm:text-sm font-semibold shadow-2xs animate-in zoom-in-95">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{initialReason}</span>
            </div>
          )}

          {/* Plan Category Tabs: Personal vs Business (ChatGPT Style) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex p-1 bg-zinc-200/70 rounded-2xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('business')}
                className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Business
              </button>
            </div>

            {/* Quarterly / Monthly Switcher */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('quarterly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'quarterly'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <span>Annual / Quarterly</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md">Save 20%</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Success Notification */}
        {successPlan && (
          <div className="w-full max-w-3xl mb-8 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center gap-3 animate-in zoom-in-95 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm sm:text-base">Membership Upgraded Successfully!</p>
              <p className="text-xs text-emerald-700">You now have active access to the <strong>{successPlan.toUpperCase()}</strong> plan. Unlimited assessments unlocked.</p>
            </div>
          </div>
        )}

        {/* Cards Grid: Clean ChatGPT Style */}
        <div className={`w-full grid gap-6 ${
          activeTab === 'personal'
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl'
            : 'grid-cols-1 md:grid-cols-2 max-w-4xl'
        }`}>

          {/* CARD 1 (Personal Tab): Free Tier */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-7 sm:p-9 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Starter</span>
                    {currentMembership.plan === 'free' && (
                      <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-600 text-[11px] font-bold rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mt-1 font-manrope">Free</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                    Try Inisio greenfield project assessment and see how algorithmic underwriting assesses project viability.
                  </p>
                </div>

                <div className="pt-2 pb-4 border-b border-zinc-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-900 font-manrope">₹0</span>
                    <span className="text-xs sm:text-sm text-zinc-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Includes 1 free project assessment</p>
                </div>

                {/* Primary Action Button */}
                <div>
                  <button
                    type="button"
                    disabled={currentMembership.plan === 'free'}
                    onClick={() => handleSelectPlan('free')}
                    className="w-full py-3 px-4 rounded-2xl bg-zinc-100 text-zinc-500 font-bold text-xs sm:text-sm cursor-default border border-zinc-200"
                  >
                    {currentMembership.plan === 'free' ? 'Your current plan' : 'Downgrade to Free'}
                  </button>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Included features</div>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                      <span><strong>1 Greenfield Assessment</strong> (Feasibility &amp; Bankability Score)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                      <span>Summary AI Project Teaser preview</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                      <span>Standard industrial Capex benchmark breakup</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-zinc-400">
                      <X className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                      <span>Editable DOCX / Word deliverables</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-zinc-400">
                      <X className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                      <span>10-Year Bank CMA Model in Excel</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* CARD 2: Pro Promoter (Shown in both tabs) */}
          <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-xl p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>Recommended</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pro Tier</span>
                  {currentMembership.plan === 'pro' && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      Active Plan
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mt-1 font-manrope">Pro Promoter</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                  For active industrial promoters &amp; builders requiring institutional debt documents and fast approvals.
                </p>
              </div>

              <div className="pt-2 pb-4 border-b border-zinc-100">
                <div className="flex items-baseline gap-2">
                  {billingCycle === 'quarterly' && (
                    <span className="text-lg text-zinc-400 line-through font-semibold font-manrope">₹4,999</span>
                  )}
                  <span className="text-4xl font-black text-zinc-900 font-manrope">
                    {billingCycle === 'quarterly' ? '₹3,999' : '₹4,999'}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                  {billingCycle === 'quarterly' ? 'Billed ₹11,997 quarterly (Save 20%)' : 'Billed monthly'}
                </p>
              </div>

              {/* Primary Action Button */}
              <div>
                <button
                  type="button"
                  disabled={upgradingPlan === 'pro' || currentMembership.plan === 'pro'}
                  onClick={() => handleSelectPlan('pro')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {upgradingPlan === 'pro' ? (
                    <span>Activating Pro Plan...</span>
                  ) : currentMembership.plan === 'pro' ? (
                    <span>Plan Active (Unlimited Access)</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Upgrade to Pro</span>
                    </>
                  )}
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Everything in Free, plus</div>
                <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Unlimited Greenfield Project Assessments</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Download Bank Teasers in PDF &amp; DOCX</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>10-Year Bank CMA Model &amp; Cashflow Projections</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Detailed Underwriting &amp; Risk Profile Audit</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Direct CA Desk Priority Valuation Review</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Multi-Entity &amp; Multi-Project Dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 3 (Business Tab): Enterprise & Syndication */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-7 sm:p-9 flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Enterprise Tier</span>
                    {currentMembership.plan === 'enterprise' && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mt-1 font-manrope">Enterprise &amp; Syndication</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                    For conglomerates, developers, and chartered accountant firms syndicating large credit pipelines.
                  </p>
                </div>

                <div className="pt-2 pb-4 border-b border-zinc-100">
                  <div className="flex items-baseline gap-2">
                    {billingCycle === 'quarterly' && (
                      <span className="text-lg text-zinc-400 line-through font-semibold font-manrope">₹24,999</span>
                    )}
                    <span className="text-4xl font-black text-zinc-900 font-manrope">
                      {billingCycle === 'quarterly' ? '₹19,999' : '₹24,999'}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                    {billingCycle === 'quarterly' ? 'Billed quarterly (Save 20%)' : 'Billed monthly'}
                  </p>
                </div>

                {/* Primary Action Button */}
                <div>
                  <button
                    type="button"
                    disabled={upgradingPlan === 'enterprise' || currentMembership.plan === 'enterprise'}
                    onClick={() => handleSelectPlan('enterprise')}
                    className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {upgradingPlan === 'enterprise' ? (
                      <span>Activating Enterprise...</span>
                    ) : currentMembership.plan === 'enterprise' ? (
                      <span>Enterprise Active</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current text-amber-400" />
                        <span>Upgrade to Enterprise</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Everything in Pro, plus</div>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Full Bank DPR &amp; TEV Study Drafting Support</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Dedicated Chartered Accountant (FCA) &amp; Ex-Banker Lead</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Direct Consortium Introductions (SBI, Canara, HDFC, SIDBI)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>White-label &amp; Co-branded Project Teasers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Trust & Contact Banner */}
        <div className="mt-12 w-full max-w-4xl bg-white rounded-2xl p-5 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900">100% Bank-Compliant Formats &amp; Standards</p>
              <p className="text-xs text-zinc-500">Aligned with RBI credit norms, PSU Bank Consortiums, and SIDBI capital schemes.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenConsultation) {
                onOpenConsultation();
              }
            }}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Talk to Inisio Credit Desk</span>
          </button>
        </div>

      </div>

    </div>
  );
};
