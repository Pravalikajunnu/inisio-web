import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

interface CibilScoreWidgetProps {
  currentScore?: number | string;
  applicantName?: string;
}

export const CibilScoreWidget: React.FC<CibilScoreWidgetProps> = ({
  currentScore = 780,
  applicantName
}) => {
  const numericScore = typeof currentScore === 'number' ? currentScore : parseInt(String(currentScore)) || 750;
  const isHealthy = numericScore >= 750;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RBI Mandated Bureau
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              Individual Credit Record
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-zinc-900">
            Promoter CIBIL Credit Report
          </h3>
          <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
            Bank credit appraisal requires a minimum promoter CIBIL score of <strong>750+</strong>. You can check your official score directly with TransUnion CIBIL.
          </p>
        </div>

        {/* Right: Score & Bureau Link */}
        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
          <div className="px-3.5 py-2 bg-zinc-50 rounded-xl border border-zinc-200/80 text-center min-w-[95px]">
            <span className="text-[10px] font-semibold text-zinc-400 block uppercase tracking-wider">CIBIL Score</span>
            <div className={`text-lg font-bold ${isHealthy ? 'text-emerald-700' : 'text-amber-700'} mt-0.5`}>
              {numericScore}
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 block">
              {isHealthy ? 'Tier 1 Prime' : 'Moderate'}
            </span>
          </div>

          <a
            href="https://www.cibil.com/freecibilscore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
          >
            <span>Check CIBIL (cibil.com)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
