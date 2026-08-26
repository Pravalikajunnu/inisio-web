import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Award, ShieldCheck } from 'lucide-react';

interface ProbabilityMeterProps {
  score: number;
  hasDpr: boolean;
  hasCma: boolean;
  hasKyc: boolean;
  isFunded?: boolean;
  onToggleFunded?: (funded: boolean) => void;
}

export const ProbabilityMeter: React.FC<ProbabilityMeterProps> = ({
  score,
  hasDpr,
  hasCma,
  hasKyc,
  isFunded = false,
  onToggleFunded
}) => {
  // Compute probability from base 25% up to 100%
  let calculatedProbability = 25; // Base assessment initiated

  if (score >= 60) calculatedProbability += 20; // 45%
  if (score >= 80) calculatedProbability += 10; // 55%
  if (hasKyc) calculatedProbability += 15;      // 70%
  if (hasDpr || hasCma) calculatedProbability += 15; // 85%
  if (score >= 85 && (hasDpr || hasCma)) calculatedProbability += 10; // 95%

  const finalProbability = isFunded ? 100 : Math.min(95, calculatedProbability);

  const getStatusText = (prob: number) => {
    if (isFunded) return { label: 'Project Fully Funded & Disbursed', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (prob >= 80) return { label: 'High Institutional Syndication Probability', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (prob >= 60) return { label: 'Moderate-High Bankability Readiness', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Initial Assessment Stage (Enhance DPR / KYC)', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  };

  const status = getStatusText(finalProbability);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Project Funding Success Probability Meter
            </h3>
            <p className="text-xs text-zinc-500">
              Dynamic AI readiness rating based on bankability score, DPR maturity, and statutory checklists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
          {onToggleFunded && (
            <button
              onClick={() => onToggleFunded(!isFunded)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isFunded
                  ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isFunded ? 'Funded (100%)' : 'Mark as Funded'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
          <span>Syndication Readiness Index</span>
          <span className="text-base font-black text-blue-600 font-mono">{finalProbability}%</span>
        </div>

        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isFunded
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : finalProbability >= 75
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                : 'bg-gradient-to-r from-amber-500 to-blue-500'
            }`}
            style={{ width: `${finalProbability}%` }}
          />
        </div>

        {/* Milestones markers */}
        <div className="grid grid-cols-4 text-[10px] text-zinc-400 pt-1 font-medium text-center">
          <div className="text-left">25% (Initiated)</div>
          <div>50% (Feasibility Modeled)</div>
          <div>75% (DPR / CMA Ready)</div>
          <div className="text-right font-bold text-zinc-700">100% (Funded)</div>
        </div>
      </div>

      {/* Key Factor Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-xs">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${score >= 75 ? 'text-emerald-600' : 'text-zinc-400'}`} />
          <span className="text-zinc-700 font-medium">Bankability Score: <strong>{score}/100</strong></span>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-xs">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${hasDpr ? 'text-emerald-600' : 'text-zinc-400'}`} />
          <span className="text-zinc-700 font-medium">Detailed DPR: <strong>{hasDpr ? 'Uploaded' : 'Pending'}</strong></span>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-xs">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${hasKyc ? 'text-emerald-600' : 'text-zinc-400'}`} />
          <span className="text-zinc-700 font-medium">Promoter KYC: <strong>{hasKyc ? 'Verified' : 'Pending'}</strong></span>
        </div>
      </div>
    </div>
  );
};
