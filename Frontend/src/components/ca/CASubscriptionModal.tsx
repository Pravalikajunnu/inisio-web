import React, { useState } from 'react';
import { CASubscription } from '../../types';
import { upgradeCASubscription } from '../../utils/caMembershipStore';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Calendar,
  IndianRupee,
  Clock,
  X,
  Lock,
  ArrowRight,
  FileCheck2,
  Calculator,
  Award
} from 'lucide-react';

interface CASubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: CASubscription;
  onUpgraded?: () => void;
}

export const CASubscriptionModal: React.FC<CASubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpgraded
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const trialEndDate = new Date(subscription.trialEndDate);
  const isTrialActive = !subscription.isPaidActive && new Date() < trialEndDate;
  const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeCASubscription(subscription.caEmail);
      setIsProcessing(false);
      setSuccess(true);
      if (onUpgraded) onUpgraded();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-inter">
        
        {/* Header gradient banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Chartered Accountant Tier
            </span>
            {subscription.isPaidActive ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                Annual Pro Active
              </span>
            ) : isTrialActive ? (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
                3-Month Trial Active ({daysLeft} days left)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[11px] font-bold">
                Trial Expired (Limit: 2/day)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Inisio CA Pro Membership
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            Empower your practice with unlimited Greenfield project feasibility assessments, CMA generation, and direct client syndication.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Subscription Activated!</h3>
              <p className="text-xs text-slate-600">
                Your CA account now has full Annual Pro privileges with unlimited assessments for 1 year.
              </p>
            </div>
          ) : (
            <>
              {/* Current Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-500">Current Plan Status</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {subscription.isPaidActive
                      ? 'Inisio CA Annual Pro Member'
                      : isTrialActive
                      ? '3-Month Free Trial Access'
                      : 'Free Tier (2 Assessments/Day)'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {subscription.isPaidActive
                        ? `Valid until ${new Date(subscription.subscriptionEndDate || '').toLocaleDateString('en-IN')}`
                        : `Trial valid until ${trialEndDate.toLocaleDateString('en-IN')} (${daysLeft} days remaining)`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-500">Assessments Today</div>
                  <div className="text-base font-black text-blue-600">
                    {subscription.isPaidActive
                      ? 'Unlimited'
                      : `${subscription.dailyAssessmentsUsed} / ${subscription.maxDailyAssessmentsFree || 2}`}
                  </div>
                </div>
              </div>

              {/* Pricing & Comparison Card */}
              <div className="border-2 border-blue-600 rounded-2xl p-5 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recommended For Practicing CAs
                </div>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-black text-slate-900 flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    2,500
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ annum</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Unlimited Greenfield Project Assessments</span> (no 2/day daily cap)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated DSCR &amp; Bankability Feasibility Scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full CMA &amp; DPR Export for Bank Credit Committees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Inisio Debt Syndication Advisory desk support</span>
                  </li>
                </ul>

                {!subscription.isPaidActive ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Processing Activation...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Activate Annual Pro (₹2,500/yr)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-100 rounded-xl">
                    Active Annual Plan (Auto-Renews Annually)
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
