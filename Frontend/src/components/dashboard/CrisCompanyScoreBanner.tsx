import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  Award,
  Zap,
  ExternalLink
} from 'lucide-react';

interface CrisCompanyScoreBannerProps {
  score?: number;
  companyName?: string;
  projectName?: string;
  industry?: string;
  caAssessmentTier?: string;
  initialScore?: number;
}

export const CrisCompanyScoreBanner: React.FC<CrisCompanyScoreBannerProps> = ({
  score = 84,
  companyName = 'Greenfield Enterprise',
  projectName,
  industry,
  caAssessmentTier,
  initialScore
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeScore = initialScore ?? (score > 100 ? Math.round(score / 10) : score);

  const getScoreGrade = (s: number) => {
    if (s >= 80) return { grade: 'CRIS Grade A1 (Prime)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Highest Debt Servicing & Institutional Underwriting Readiness' };
    if (s >= 65) return { grade: 'CRIS Grade A2 (Investment Grade)', color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Bankable under normal credit committee covenants' };
    return { grade: 'CRIS Grade B (Conditional)', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Requires collateral enhancement & equity top-up' };
  };

  const currentGrade = getScoreGrade(activeScore);

  return (
    <>
      {/* Minimalist, Professional CRIS Score Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                RBI Consortium Standard
              </span>
              <span className="text-[11px] font-medium text-zinc-500">
                Corporate Readiness &amp; Institutional Score (CRIS)
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Institutional Bankability &amp; Corporate Credit Rating
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
              PSU and commercial bank credit committees evaluate CRIS benchmarking to approve debt syndication for greenfield projects.
            </p>
          </div>

          {/* Right: Metric & Action */}
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
            <div className="px-3.5 py-2 bg-zinc-50 rounded-xl border border-zinc-200/80 text-center min-w-[100px]">
              <span className="text-[10px] font-semibold text-zinc-400 block uppercase tracking-wider">CRIS Index</span>
              <div className="text-lg font-bold text-zinc-900 mt-0.5">
                {activeScore} <span className="text-xs text-zinc-400 font-normal">/ 100</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 block">Grade A1</span>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <span>View CRIS Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CRIS Breakdown Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">CRIS Corporate Credit Score</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Institutional credit parameters evaluated by banking consortiums.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Score Display */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Rating Category</span>
                  <div className="text-lg font-bold text-zinc-900 mt-0.5">{currentGrade.grade}</div>
                  <p className="text-xs text-zinc-600 mt-0.5">{currentGrade.desc}</p>
                </div>
                <div className="px-3 py-2 bg-blue-600 text-white rounded-lg text-center min-w-[70px]">
                  <div className="text-xl font-bold">{activeScore}</div>
                  <div className="text-[9px] font-semibold text-blue-100 uppercase">Score</div>
                </div>
              </div>

              {/* Pillars */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Evaluation Breakdown</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>Debt Service Ratio (DSCR)</span>
                      <span className="text-emerald-600">95 / 100</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Projected cash flows cover interest and principal repayments comfortably.</p>
                  </div>

                  <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>Promoter Skin-in-the-Game</span>
                      <span className="text-emerald-600">88 / 100</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Equity contribution aligns with 25-30% capital mandate.</p>
                  </div>

                  <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>Collateral Coverage (FACR)</span>
                      <span className="text-blue-600">80 / 100</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Fixed asset coverage ratio meets institutional lending standards.</p>
                  </div>

                  <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span>Statutory &amp; DPDP Compliance</span>
                      <span className="text-emerald-600">90 / 100</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Clean legal entity and verified promoter KYC documentation.</p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  This benchmark rating is generated by Inisio's underwriting engine and shared with empanelled banks during the appraisal cycle.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
